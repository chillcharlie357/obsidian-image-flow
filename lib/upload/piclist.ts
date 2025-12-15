import type { ImageUploaderStrategy, UploadRequest } from './types'
import { uploadViaCliAndClipboard } from './cli'

export class PicListUploader implements ImageUploaderStrategy {
  type = 'piclist'
  config: Record<string, unknown> = {}

  async upload(req: UploadRequest): Promise<string> {
    return uploadViaCliAndClipboard(req, 'piclist')
  }
}
