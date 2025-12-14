import type { ImageUploaderStrategy, UploadRequest } from './types'
import { uploadViaCliAndClipboard } from './cli'

export class PicGoUploader implements ImageUploaderStrategy {
  type = 'picgo'

  async upload(req: UploadRequest): Promise<string> {
    return uploadViaCliAndClipboard(req, 'picgo')
  }
}
