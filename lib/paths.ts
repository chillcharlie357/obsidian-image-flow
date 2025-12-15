import { App, TFile, Notice, FileSystemAdapter } from 'obsidian'
import { log, logWarn } from './log'

export function pathJoin(a: string, b: string) {
  if (!a) return b
  if (a.endsWith('/')) return `${a}${b}`
  return `${a}/${b}`
}

export function relativePath(from: string, to: string) {
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

export function normalizeDir(dir: string) {
  if (!dir) return ''
  const parts = dir.split('/')
  const sanitizedParts = parts
    .map((part) =>
      part
        .trim()
        .replace(/\s+/g, '')
        .replace(/[<>:"\\|?*\u0000-\u001F]/g, '')
    )
    .filter((part) => part.length > 0)
  const joined = sanitizedParts.join('/')
  const normalized = joined.replace(/\/+/g, '/').replace(/^\/+/, '').replace(/\/+$/, '')
  log('normalizeDir', { input: dir, normalized })
  return normalized
}

export async function ensureFolder(app: App, dir: string) {
  const normalized = normalizeDir(dir)
  if (!normalized) return

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

export function getAbsolutePath(app: App, vaultPath: string) {
  const adapter = app.vault.adapter
  if (adapter instanceof FileSystemAdapter) {
    const base = adapter.getBasePath()
    const path = require('path')
    return path.join(base, vaultPath)
  }
  return vaultPath
}

export async function moveRename(app: App, file: TFile, to: string) {
  let target = normalizeDir(to)
  if (!target.includes('/')) {
    target = pathJoin('assets', target)
  }

  if (file.path === target) return

  log('moveRename', { from: file.path, to: target })
  try {
    const targetDir = target.substring(0, target.lastIndexOf('/'))
    if (targetDir) await ensureFolder(app, targetDir)

    await app.vault.rename(file, target)
  } catch (error) {
    logWarn('Failed to rename file', { from: file.path, to: target, error })
    new Notice(`Image Flow Error: Failed to move file to ${target}`)
  }
}
