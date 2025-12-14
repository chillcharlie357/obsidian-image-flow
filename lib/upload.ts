import type { MyPluginSettings } from './types'
import { log, logWarn, logError } from './log'

function httpInText(s: string) {
  const m = s.match(/https?:\/\/\S+/g)
  return m ? m[m.length - 1] : ''
}

export interface ImageUploaderStrategy {
  type: string
  upload(settings: MyPluginSettings, absPath: string): Promise<string>
}

class PicListUploader implements ImageUploaderStrategy {
  type = 'piclist'

  async upload(settings: MyPluginSettings, absPath: string): Promise<string> {
    return uploadViaCliAndClipboard(settings, absPath, 'piclist')
  }
}

class PicGoUploader implements ImageUploaderStrategy {
  type = 'picgo'

  async upload(settings: MyPluginSettings, absPath: string): Promise<string> {
    return uploadViaCliAndClipboard(settings, absPath, 'picgo')
  }
}

class PicGoCoreUploader implements ImageUploaderStrategy {
  type = 'picgo_core'

  async upload(settings: MyPluginSettings, absPath: string): Promise<string> {
    // TODO: implement dedicated PicGo-Core behaviour if needed
    return uploadViaCliAndClipboard(settings, absPath, 'picgo-core')
  }
}

const UPLOAD_STRATEGIES: ImageUploaderStrategy[] = [new PicListUploader(), new PicGoUploader(), new PicGoCoreUploader()]

export function resolveUploaderStrategy(type: string | undefined | null): ImageUploaderStrategy | null {
  if (!type || type === 'none') return null
  const found = UPLOAD_STRATEGIES.find((s) => s.type === type)
  if (!found) return null
  return found
}

export async function uploadViaCliAndClipboard(
  settings: MyPluginSettings,
  absPath: string,
  defaultCmd: string
): Promise<string> {
  try {
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

