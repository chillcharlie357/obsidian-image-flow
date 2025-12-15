import type { ImageUploaderStrategy, UploadRequest } from './types'
import { uploadViaCliAndClipboard } from './cli'

export class PicGoUploader implements ImageUploaderStrategy {
  type = 'picgo'
  config: Record<string, unknown> = {}

  async upload(req: UploadRequest): Promise<string> {
    return uploadViaCliAndClipboard(req, 'picgo')
  }
}
