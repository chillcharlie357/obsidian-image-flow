import type { ImageFlowPluginSettings } from '../types'

export interface UploadRequest {
  settings: ImageFlowPluginSettings
  absPath: string
}

export interface ImageUploaderStrategy {
  type: string
  upload(req: UploadRequest): Promise<string>
}
