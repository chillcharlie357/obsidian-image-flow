import type { ImageUploaderStrategy, UploadRequest } from './types'
import { uploadViaCliAndClipboard } from './cli'

export class PicGoCoreUploader implements ImageUploaderStrategy {
  type = 'picgo_core'

  async upload(req: UploadRequest): Promise<string> {
    return uploadViaCliAndClipboard(req, 'picgo-core')
  }
}
