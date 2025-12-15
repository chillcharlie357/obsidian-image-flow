import type { ImageUploaderStrategy, UploadRequest } from './types'
import type { ImageFlowPluginSettings } from '../types'
import type { ImageUploaderProfile } from '../../components/types'
import { PicListUploader } from './piclist'
import { PicGoUploader } from './picgo'
import { PicGoCoreUploader } from './picgoCore'
import { log, logWarn } from '../log'

export * from './types'

function createUploaderStrategy(type: string | undefined | null): ImageUploaderStrategy | null {
  if (!type || type === 'none') return null
  if (type === 'piclist') return new PicListUploader()
  if (type === 'picgo') return new PicGoUploader()
  if (type === 'picgo_core') return new PicGoCoreUploader()
  logWarn('Unknown uploader type, no strategy created', type)
  return null
}

function resolveUploaderConfig(settings: ImageFlowPluginSettings, type: string | undefined | null): Record<string, unknown> {
  if (!type || type === 'none') return {}
  const all = settings.uploaderConfigs || {}
  const cfg = all[type]
  if (cfg && typeof cfg === 'object') return cfg
  return {}
}

export class UploadContext {
  settings: ImageFlowPluginSettings
  private strategy: ImageUploaderStrategy | null

  constructor(settings: ImageFlowPluginSettings, type: string | undefined | null) {
    this.settings = settings
    const strategy = createUploaderStrategy(type)
    if (strategy) {
      strategy.config = resolveUploaderConfig(settings, type)
      log('UploadContext strategy created', {
        type: strategy.type,
        configKeys: Object.keys(strategy.config || {}),
      })
    }
    if (!strategy) {
      logWarn('UploadContext created with no strategy', { type })
    }
    this.strategy = strategy
  }

  updateWithProfile(profile?: ImageUploaderProfile | null) {
    const type =
      (profile && profile.uploaderType) || (this.settings as any).uploaderType
    const strategy = createUploaderStrategy(type)
    if (strategy) {
      strategy.config = resolveUploaderConfig(this.settings, type)
      log('UploadContext strategy updated', {
        type: strategy.type,
        configKeys: Object.keys(strategy.config || {}),
      })
    } else {
      logWarn('UploadContext updateWithProfile: no strategy', { type })
    }
    this.strategy = strategy
  }

  getConfig<T>(key: string, defaultValue?: T): T {
    const s = this.strategy
    if (!s || !s.config) return (defaultValue as T)
    const v = (s.config as any)[key]
    if (v === undefined || v === null) return (defaultValue as T)
    return v as T
  }

  getCurrentType(): string | null {
    return this.strategy ? this.strategy.type : null
  }

  async upload(absPath: string): Promise<string> {
    if (!this.strategy) {
      logWarn('UploadContext.upload called with no strategy', { absPath })
      return ''
    }
    log('UploadContext.upload start', {
      type: this.strategy.type,
      absPath,
    })
    const req: UploadRequest = {
      settings: this.settings,
      absPath,
    }
    const url = await this.strategy.upload(req)
    log('UploadContext.upload done', {
      type: this.strategy.type,
      absPath,
      url,
    })
    return url
  }
}
