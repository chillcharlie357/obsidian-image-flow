export type SaveLocationMode = 'vault_assets' | 'filename_assets' | 'filepath_assets' | 'custom'

export interface ImageFlowSettingsCore {
  renameEnabled: boolean
  keepOriginal: boolean
  renamePattern: string
  saveLocationMode: SaveLocationMode
  customLocationPattern: string
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

