import { App, TFile, Notice, Editor, MarkdownView } from 'obsidian'
import type { MyPluginSettings } from './types'

const LOG_PREFIX = '[Image Flow]'

function log(...args: any[]) {
  console.log(LOG_PREFIX, ...args)
}

function logWarn(...args: any[]) {
  console.warn(LOG_PREFIX, ...args)
}

function logError(...args: any[]) {
  console.error(LOG_PREFIX, ...args)
}

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

function tokens(context: { originalBase: string; activeBase?: string; activeDir?: string }) {
  const now = new Date()
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  const random = Math.random().toString(36).slice(2, 8)
  const timestamp = String(now.getTime())
  log('tokens', { context, date, time, timestamp, random })
  return {
    '{date}': date,
    '{time}': time,
    '{timestamp}': timestamp,
    '{random}': random,
    '{filename}': context.activeBase || 'note',
    '{file_path}': context.activeDir || '',
    '{vault}/': '',
  }
}

function applyPattern(pattern: string, t: Record<string, string>) {
  log('applyPattern input', { pattern, tokens: t })
  let s = pattern
  for (const k of Object.keys(t)) {
    const v = t[k]
    s = s.split(k).join(v)
  }
  s = s.replace(/\{date:([^}]+)\}/g, (_, fmt: string) => formatDatePattern(fmt))
  log('applyPattern output', s)
  return s
}

function formatDatePattern(fmt: string) {
  const now = new Date()
  const yyyy = String(now.getFullYear())
  const MM = pad(now.getMonth() + 1)
  const DD = pad(now.getDate())
  const HH = pad(now.getHours())
  const mm = pad(now.getMinutes())
  const ss = pad(now.getSeconds())
  return fmt
    .replace(/YYYY/g, yyyy)
    .replace(/MM/g, MM)
    .replace(/DD/g, DD)
    .replace(/dd/g, DD)
    .replace(/HH/g, HH)
    .replace(/mm/g, mm)
    .replace(/ss/g, ss)
}

// 简单的路径拼接，保证只有一个 /
function pathJoin(a: string, b: string) {
  if (!a) return b
  if (a.endsWith('/')) return `${a}${b}`
  return `${a}/${b}`
}

function relativePath(from: string, to: string) {
  if (!from) return to
  const fromParts = from.split('/').slice(0, -1)
  const toParts = to.split('/')
  let i = 0
  while (i < fromParts.length && i < toParts.length && fromParts[i] === toParts[i]) i++
  const up = new Array(fromParts.length - i).fill('..')
  const down = toParts.slice(i)
  const parts = up.concat(down)
  let rel = parts.join('/')
  if (!rel.startsWith('../')) rel = `./${rel}`
  return rel
}

// 规范化目录：去掉重复 /、首尾 /
export function normalizeDir(dir: string) {
  if (!dir) return ''
  const normalized = dir.replace(/\/+/g, '/').replace(/^\/+/, '').replace(/\/+$/, '')
  log('normalizeDir', { input: dir, normalized })
  return normalized
}

// 根据设置和上下文（当前笔记/图片文件）计算目标目录
export function getTargetDir(settings: MyPluginSettings, activeFile: TFile | null, file: TFile | null, originalBase: string): string {
  const ctxFile = activeFile || file
  const filePath = ctxFile?.parent?.path || ''
  const fileBase = activeFile?.basename || ctxFile?.basename || 'note'
  if (settings.saveLocationMode === 'vault_assets') {
    const dir = 'assets'
    log('getTargetDir vault_assets', { originalBase, filePath, fileBase, dir })
    return dir
  }
  if (settings.saveLocationMode === 'filename_assets') {
    const dir = filePath ? `${filePath}/${fileBase}.assets` : `${fileBase}.assets`
    log('getTargetDir filename_assets', { originalBase, filePath, fileBase, dir })
    return normalizeDir(dir)
  }
  if (settings.saveLocationMode === 'filepath_assets') {
    const dir = filePath ? `${filePath}/assets` : 'assets'
    log('getTargetDir filepath_assets', { originalBase, filePath, fileBase, dir })
    return normalizeDir(dir)
  }
  const t = tokens({ originalBase, activeBase: fileBase, activeDir: filePath })
  const pat = applyPattern(settings.customLocationPattern, t)
  const dir = normalizeDir(pat)
  log('getTargetDir custom', { originalBase, filePath, fileBase, pattern: settings.customLocationPattern, dir })
  return dir
}

// 根据设置计算目标文件名（只处理基础名，不含扩展名）
export function getTargetBase(settings: MyPluginSettings, originalBase: string, t: Record<string, string>) {
  if (!settings.renameEnabled || settings.keepOriginal) {
    log('getTargetBase keep original', { originalBase })
    return originalBase
  }
  const applied = applyPattern(settings.renamePattern, t)
  const sanitized = applied.replace(/\/+/, '-')
  log('getTargetBase renamed', { originalBase, pattern: settings.renamePattern, applied, sanitized })
  return sanitized
}

// 将文件名拆分为 base 和 ext（无点）
export function splitName(name: string) {
  const i = name.lastIndexOf('.')
  if (i === -1) return { base: name, ext: '' }
  return { base: name.substring(0, i), ext: name.substring(i + 1) }
}

// 确保目标目录存在，不存在则递归创建（静默忽略已存在错误）
export async function ensureFolder(app: App, dir: string) {
  const normalized = normalizeDir(dir)
  if (!normalized) return // root always exists

  const folders = normalized.split('/')
  let currentPath = ''

  for (const folder of folders) {
    currentPath = currentPath ? `${currentPath}/${folder}` : folder
    const existing = app.vault.getAbstractFileByPath(currentPath)

    if (!existing) {
      try {
        log('ensureFolder createFolder', currentPath)
        await app.vault.createFolder(currentPath)
      } catch (e) {
        logWarn('ensureFolder failed to create folder', currentPath, e)
      }
    }
  }
}

// 在目录下生成一个不与现有文件冲突的路径
export async function uniquePath(app: App, dir: string, base: string, ext: string) {
  const normalized = normalizeDir(dir) || 'assets'
  let candidate = pathJoin(normalized, ext ? `${base}.${ext}` : base)
  let n = 1
  while (app.vault.getAbstractFileByPath(candidate)) {
    candidate = pathJoin(normalized, ext ? `${base}-${n}.${ext}` : `${base}-${n}`)
    n++
  }
  log('uniquePath', { dir: normalized, base, ext, candidate })
  return candidate
}

// 执行真正的重命名移动操作
export async function moveRename(app: App, file: TFile, to: string) {
  let target = normalizeDir(to)
  if (!target.includes('/')) {
    // 没有目录信息时强制放在 assets/ 下，避免落在 vault 根目录
    target = pathJoin('assets', target)
  }
  
  // 如果路径没变，直接返回
  if (file.path === target) return

  log('moveRename', { from: file.path, to: target })
  try {
    // 再次确保目标目录存在（防御性编程）
    const targetDir = target.substring(0, target.lastIndexOf('/'))
    if (targetDir) await ensureFolder(app, targetDir)
    
    await app.vault.rename(file, target)
  } catch (error) {
    logError('Failed to rename file', { from: file.path, to: target, error })
    new Notice(`Image Flow Error: Failed to move file to ${target}`)
  }
}

export async function handlePaste(
  app: App,
  settings: MyPluginSettings,
  evt: ClipboardEvent | DragEvent,
  editor: Editor,
  markdownView: MarkdownView
) {
  try {
    const viewFile = markdownView?.file || app.workspace.getActiveFile()
    if (!viewFile) {
      return
    }

    const files = evt instanceof ClipboardEvent ? evt.clipboardData?.files : evt.dataTransfer?.files
    if (!files || files.length === 0) {
      return
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image')) {
        continue
      }

      evt.preventDefault()

      const activeFile = viewFile
      const { base, ext } = splitName(file.name)
      const t = tokens({
        originalBase: base,
        activeBase: activeFile?.basename ?? '',
        activeDir: activeFile?.parent?.path ?? '',
      })
      const dir = getTargetDir(settings, activeFile, null, base)
      await ensureFolder(app, dir)

      const newBase = getTargetBase(settings, base, t)
      const dest = await uniquePath(app, dir, newBase, ext)

      const buffer = await file.arrayBuffer()
      const newFile = await app.vault.createBinary(dest, buffer)

      const link = app.fileManager.generateMarkdownLink(newFile, activeFile?.path ?? '')
      let imageSyntax: string
      if (settings.imageSyntaxMode === 'markdown') {
        const notePath = activeFile?.path || ''
        const rel = relativePath(notePath, newFile.path)
        /***
         * https://forum-zh.obsidian.md/t/topic/28956
         * 
         * obsidian纯数字alt会导致图片无法渲染，添加扩展名或image字符串避免这个问题
         */
        let alt = newFile.basename
        if (/^\d+$/.test(alt)) {
          alt = `${alt}.${ext || newFile.extension || 'image'}`
        }
        imageSyntax = `![${alt}](${rel})`
      } else {
        imageSyntax = link.startsWith('!') ? link : `!${link}`
      }
      log('handlePaste insert', {
        mode: settings.imageSyntaxMode,
        link,
        imageSyntax,
        filePath: newFile.path,
        notePath: activeFile?.path,
      })
      editor.replaceSelection(imageSyntax)
    }
  } catch (error) {
    logError('handlePaste failed', error)
    new Notice('Image Flow: failed to paste image, see console for details')
  }
}
