import type { ImageUploaderStrategy, UploadRequest } from './types'
import type { ImageFlowPluginSettings } from '../types'
import { PicListUploader } from './piclist'
import { PicGoUploader } from './picgo'
import { PicGoCoreUploader } from './picgoCore'

export * from './types'

const UPLOAD_STRATEGIES: ImageUploaderStrategy[] = [new PicListUploader(), new PicGoUploader(), new PicGoCoreUploader()]

export function resolveUploaderStrategy(type: string | undefined | null): ImageUploaderStrategy | null {
  if (!type || type === 'none') return null
  const found = UPLOAD_STRATEGIES.find((s) => s.type === type)
  if (!found) return null
  return found
}

export class UploadContext {
  settings: ImageFlowPluginSettings
  private strategy: ImageUploaderStrategy | null

  constructor(settings: ImageFlowPluginSettings, type: string | undefined | null) {
    this.settings = settings
    this.strategy = resolveUploaderStrategy(type)
  }

  async upload(absPath: string): Promise<string> {
    if (!this.strategy) return ''
    const req: UploadRequest = {
      settings: this.settings,
      absPath,
    }
    return this.strategy.upload(req)
  }
}
