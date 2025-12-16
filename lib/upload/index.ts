import type { ImageUploaderStrategy, UploadRequest } from './types'
import { PicListUploader } from './piclist'
import { PicGoUploader } from './picgo'
import { log, logWarn } from '../log'

export * from './types'

type UploaderConfigMap = Record<string, Record<string, unknown> | undefined>

interface UploadContextOptions {
  uploaderType: string | undefined | null
  uploaderCommandPath?: string
  uploaderConfigs?: UploaderConfigMap
}

interface UploaderProfileLike {
  uploaderType?: string | null
  uploaderCommandPath?: string
}

function createUploaderStrategy(type: string | undefined | null): ImageUploaderStrategy | null {
  if (!type || type === 'none') return null
  if (type === 'piclist') return new PicListUploader()
  if (type === 'picgo') return new PicGoUploader()
  logWarn('Unknown uploader type, no strategy created', type)
  return null
}

function resolveUploaderConfig(
  configs: UploaderConfigMap | undefined,
  type: string | undefined | null
): Record<string, unknown> {
  if (!type || type === 'none') return {}
  const all = configs || {}
  const cfg = all[type]
  if (cfg && typeof cfg === 'object') return cfg
  return {}
}

export class UploadContext {
  private strategy: ImageUploaderStrategy | null
  private uploaderCommandPath?: string
  private uploaderConfigs: UploaderConfigMap

  constructor(options: UploadContextOptions) {
    const { uploaderType, uploaderCommandPath, uploaderConfigs } = options
    this.uploaderCommandPath = uploaderCommandPath
    this.uploaderConfigs = uploaderConfigs || {}
    const effectiveType = uploaderType && uploaderType !== 'none' ? uploaderType : null
    const strategy = createUploaderStrategy(effectiveType)
    if (strategy) {
      strategy.config = resolveUploaderConfig(this.uploaderConfigs, effectiveType)
      log('UploadContext strategy created', {
        type: strategy.type,
        configKeys: Object.keys(strategy.config || {}),
      })
    } else {
      logWarn('UploadContext created with no strategy', { type: uploaderType })
    }
    this.strategy = strategy
  }

  updateWithProfile(profile?: UploaderProfileLike | null) {
    const type =
      profile && profile.uploaderType && profile.uploaderType !== 'none'
        ? profile.uploaderType
        : null
    const strategy = createUploaderStrategy(type)
    if (strategy) {
      strategy.config = resolveUploaderConfig(this.uploaderConfigs, type)
      log('UploadContext strategy updated', {
        type: strategy.type,
        configKeys: Object.keys(strategy.config || {}),
      })
    } else {
      logWarn('UploadContext updateWithProfile: no strategy', { type })
    }
    this.strategy = strategy
    if (profile && profile.uploaderCommandPath !== undefined) {
      this.uploaderCommandPath = profile.uploaderCommandPath
    }
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
      absPath,
      uploaderCommandPath: this.uploaderCommandPath,
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
