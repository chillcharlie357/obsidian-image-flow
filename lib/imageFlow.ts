import { App, TFile, Notice, Editor, MarkdownView } from 'obsidian'
import type { MyPluginSettings } from './types'

// 判断文件名是否为常见图片格式
function isImage(name: string) {
  return /\.(png|jpg|jpeg|gif|webp|bmp|svg)$/i.test(name)
}

// 辅助函数：数字补零到两位
function pad(n: number) {
  return n.toString().padStart(2, '0')
}

// 生成重命名/路径中可用的占位符字典
function tokens(context: { originalBase: string; activeBase?: string; activeDir?: string }) {
  const now = new Date()
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  const random = Math.random().toString(36).slice(2, 8)
  return {
    '{date}': date,
    '{time}': time,
    '{random}': random,
    '{filename}': context.activeBase || 'note',
    '{file_path}': context.activeDir || '',
    '{vault}/': '',
  }
}

// 用占位符字典对模式字符串进行简单替换（纯字符串，不使用正则）
function applyPattern(pattern: string, t: Record<string, string>) {
  let s = pattern
  for (const k of Object.keys(t)) {
    const v = t[k]
    s = s.split(k).join(v)
  }
  return s
}

// 简单的路径拼接，保证只有一个 /
function pathJoin(a: string, b: string) {
  if (!a) return b
  if (a.endsWith('/')) return `${a}${b}`
  return `${a}/${b}`
}

// 规范化目录：去掉重复 /、首尾 /
export function normalizeDir(dir: string) {
  if (!dir) return ''
  return dir.replace(/\/+/g, '/').replace(/^\/+/, '').replace(/\/+$/, '')
}

// 根据设置和上下文（当前笔记/图片文件）计算目标目录
export function getTargetDir(settings: MyPluginSettings, activeFile: TFile | null, file: TFile | null, originalBase: string): string {
  const ctxFile = activeFile || file
  const filePath = ctxFile?.parent?.path || ''
  const fileBase = activeFile?.basename || ctxFile?.basename || 'note'
  if (settings.saveLocationMode === 'vault_assets') return 'assets'
  if (settings.saveLocationMode === 'filename_assets') {
    const dir = filePath ? `${filePath}/${fileBase}.assets` : `${fileBase}.assets`
    return normalizeDir(dir)
  }
  if (settings.saveLocationMode === 'filepath_assets') {
    const dir = filePath ? `${filePath}/assets` : 'assets'
    return normalizeDir(dir)
  }
  const t = tokens({ originalBase, activeBase: fileBase, activeDir: filePath })
  return normalizeDir(applyPattern(settings.customLocationPattern, t))
}

// 根据设置计算目标文件名（只处理基础名，不含扩展名）
export function getTargetBase(settings: MyPluginSettings, originalBase: string, t: Record<string, string>) {
  if (!settings.renameEnabled || settings.keepOriginal) return originalBase
  return applyPattern(settings.renamePattern, t).replace(/\/+/, '-')
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
        await app.vault.createFolder(currentPath)
      } catch (e) {
        // 如果并发创建可能会报错，这里忽略
        console.warn(`[Image Flow] Failed to create folder: ${currentPath}`, e)
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

  console.log(`[Image Flow] Moving file from ${file.path} to ${target}`)
  try {
    // 再次确保目标目录存在（防御性编程）
    const targetDir = target.substring(0, target.lastIndexOf('/'))
    if (targetDir) await ensureFolder(app, targetDir)
    
    await app.vault.rename(file, target)
  } catch (error) {
    console.error(`[Image Flow] Failed to rename file:`, error)
    new Notice(`Image Flow Error: Failed to move file to ${target}`)
  }
}

export async function handlePaste(app: App, settings: MyPluginSettings, evt: ClipboardEvent | DragEvent, editor: Editor, markdownView: MarkdownView) {
    const files = evt instanceof ClipboardEvent ? evt.clipboardData?.files : evt.dataTransfer?.files;
    if (!files || files.length === 0) {
        return;
    }

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image')) {
            continue;
        }

        evt.preventDefault();

        const activeFile = app.workspace.getActiveFile();
        const { base, ext } = splitName(file.name);
        const t = tokens({ originalBase: base, activeBase: activeFile?.basename ?? '', activeDir: activeFile?.parent?.path ?? '' });
        const dir = getTargetDir(settings, activeFile, null, base);
        await ensureFolder(app, dir);

        const newBase = getTargetBase(settings, base, t);
        const dest = await uniquePath(app, dir, newBase, ext);

        const buffer = await file.arrayBuffer();
        const newFile = await app.vault.createBinary(dest, buffer);

        const link = app.fileManager.generateMarkdownLink(newFile, markdownView.file?.path ?? '');
        const imageSyntax = link.startsWith('!') ? link : `!${link}`;
        editor.replaceSelection(imageSyntax);
    }
}

