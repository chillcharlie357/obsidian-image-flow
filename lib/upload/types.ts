export interface UploadRequest {
  absPath: string
  uploaderCommandPath?: string
}

export interface ImageUploaderStrategy {
  type: string
  config: Record<string, unknown>
  upload(req: UploadRequest): Promise<string>
}
