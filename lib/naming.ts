import type { MyPluginSettings } from './types'
import { normalizeDir } from './paths'
import { log } from './log'

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

export function tokens(context: { originalBase: string; activeBase?: string; activeDir?: string }) {
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

export function applyPattern(pattern: string, t: Record<string, string>) {
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

export function getTargetDir(settings: MyPluginSettings, activeFile: any, file: any, originalBase: string): string {
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

export function splitName(name: string) {
  const i = name.lastIndexOf('.')
  if (i === -1) return { base: name, ext: '' }
  return { base: name.substring(0, i), ext: name.substring(i + 1) }
}

