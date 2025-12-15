export type SaveLocationMode = 'vault_assets' | 'filename_assets' | 'filepath_assets' | 'custom'
export type ImageSyntaxMode = 'markdown' | 'wikilink'
export type ImageUploaderType = 'none' | 'picgo' | 'picgo_core' | 'piclist'

export interface ImageUploaderProfile {
  id: string
  name: string
  uploaderType: ImageUploaderType
  uploaderCommandPath: string
  deleteLocalAfterUpload: boolean
}

export interface ImageFlowSettingsCore {
  renameEnabled: boolean
  keepOriginal: boolean
  renamePattern: string
  saveLocationMode: SaveLocationMode
  customLocationPattern: string
  imageSyntaxMode: ImageSyntaxMode
  uploadEnabled: boolean
  uploaderType: ImageUploaderType
  uploaderCommandPath: string
  deleteLocalAfterUpload: boolean
  uploaderProfiles?: ImageUploaderProfile[]
  activeUploaderProfileId?: string | null
  uploaderConfigs?: Record<string, Record<string, unknown>>
}

export interface RenameSettingsValue {
  renamePattern: string
  keepOriginal: boolean
}

export interface LocationSettingsValue {
  saveLocationMode: SaveLocationMode
  customLocationPattern: string
}

export interface NoteContext {
  filename?: string
  file_path?: string
}
