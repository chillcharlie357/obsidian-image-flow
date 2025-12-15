import { log, logWarn, logError } from '../log'
import type { UploadRequest } from './types'

function httpInText(s: string) {
  const m = s.match(/https?:\/\/[^\s)]+/g)
  if (!m || m.length === 0) return ''
  let url = m[m.length - 1]
  url = url.replace(/[)\]]+$/g, '')
  return url
}

export async function uploadViaCliAndClipboard(req: UploadRequest, defaultCmd: string): Promise<string> {
  try {
    const { settings, absPath } = req
    const cp = require('child_process')
    let cmd = (settings as any).uploaderCommandPath as string | undefined
    cmd = cmd && cmd.trim().length > 0 ? cmd.trim() : undefined
    let args: string[] = []
    cmd = cmd || defaultCmd
    args = ['upload', absPath]
    log('upload exec', { cmd, args })
    const out: string = await new Promise((resolve, reject) => {
      const p = cp.spawn(cmd, args, { shell: true })
      let stdout = ''
      let stderr = ''
      p.stdout.on('data', (d: Buffer) => (stdout += d.toString()))
      p.stderr.on('data', (d: Buffer) => (stderr += d.toString()))
      p.on('error', reject)
      p.on('close', (code: number) => {
        if (code === 0) resolve(stdout || stderr)
        else reject(new Error(stderr || `exit ${code}`))
      })
    })
    let combined = out || ''
    let url = httpInText(combined)
    if (!url) {
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
      const electron = (() => {
        try {
          // Obsidian 桌面端基于 Electron，这里优先使用 electron.clipboard 读取剪贴板
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          return require('electron')
        } catch {
          return null
        }
      })()
      for (let i = 0; i < 5 && !url; i++) {
        try {
          let clipText = ''
          if (electron && electron.clipboard && typeof electron.clipboard.readText === 'function') {
            clipText = electron.clipboard.readText() || ''
          } else {
            const w: any = window as any
            const nav = w && w.navigator
            if (nav && nav.clipboard && typeof nav.clipboard.readText === 'function') {
              clipText = await nav.clipboard.readText()
            }
          }
          if (clipText) {
            log('upload clipboard text', clipText)
            combined = `${combined}\n${clipText}`
            url = httpInText(combined)
          }
        } catch (e) {
          logWarn('upload read clipboard failed', e)
        }
        if (!url) await sleep(200)
      }
    }
    log('upload done', { url, raw: combined })
    return url || ''
  } catch (e) {
    logError('upload failed', e)
    return ''
  }
}
