import { create } from 'zustand'
import type { ImageFlowSettingsCore } from './types'

const DEFAULT_CORE_SETTINGS: ImageFlowSettingsCore = {
  renameEnabled: true,
  keepOriginal: false,
  renamePattern: '{date}-{time}-{random}',
  saveLocationMode: 'vault_assets',
  customLocationPattern: '{vault}/assets/{date}/',
  imageSyntaxMode: 'wikilink',
  uploadEnabled: false,
  uploaderType: 'none',
  uploaderCommandPath: '',
  deleteLocalAfterUpload: false,
  uploaderProfiles: [],
  activeUploaderProfileId: null,
  uploaderConfigs: {},
}

interface SettingsStoreState {
  settings: ImageFlowSettingsCore
  initialized: boolean
  onChange?: (v: ImageFlowSettingsCore) => void
  setAll: (next: ImageFlowSettingsCore) => void
  init: (initial: ImageFlowSettingsCore, onChange?: (v: ImageFlowSettingsCore) => void) => void
  setRenameEnabled: (v: boolean) => void
  setRenamePattern: (v: string) => void
  setKeepOriginal: (v: boolean) => void
  setSaveLocationMode: (v: ImageFlowSettingsCore['saveLocationMode']) => void
  setCustomLocationPattern: (v: string) => void
  setImageSyntaxMode: (v: ImageFlowSettingsCore['imageSyntaxMode']) => void
  setUploadEnabled: (v: boolean) => void
  setUploaderType: (v: ImageFlowSettingsCore['uploaderType']) => void
  setUploaderCommandPath: (v: string) => void
  setDeleteLocalAfterUpload: (v: boolean) => void
  setUploaderProfiles: (v: NonNullable<ImageFlowSettingsCore['uploaderProfiles']>) => void
  setActiveUploaderProfileId: (v: string | null) => void
}

export const useSettingsStore = create<SettingsStoreState>((set, get) => ({
  settings: DEFAULT_CORE_SETTINGS,
  initialized: false,
  onChange: undefined,
  setAll: (next: ImageFlowSettingsCore) => {
    set({ settings: next })
    const cb = get().onChange
    if (cb) {
      cb(next)
    }
  },
  init: (initial: ImageFlowSettingsCore, onChange?: (v: ImageFlowSettingsCore) => void) => {
    const state = get()
    if (!state.initialized) {
      set({
        settings: initial,
        initialized: true,
        onChange,
      })
      if (onChange) {
        onChange(initial)
      }
      return
    }
    set({
      settings: initial,
      onChange: onChange ?? state.onChange,
    })
    const cb = onChange ?? state.onChange
    if (cb) {
      cb(initial)
    }
  },
  setRenameEnabled: (v: boolean) => {
    set((state) => ({ settings: { ...state.settings, renameEnabled: v } }))
    const cb = get().onChange
    if (cb) {
      cb({ ...get().settings })
    }
  },
  setRenamePattern: (v: string) => {
    set((state) => ({ settings: { ...state.settings, renamePattern: v } }))
    const cb = get().onChange
    if (cb) {
      cb({ ...get().settings })
    }
  },
  setKeepOriginal: (v: boolean) => {
    set((state) => ({ settings: { ...state.settings, keepOriginal: v } }))
    const cb = get().onChange
    if (cb) {
      cb({ ...get().settings })
    }
  },
  setSaveLocationMode: (v: ImageFlowSettingsCore['saveLocationMode']) => {
    set((state) => ({ settings: { ...state.settings, saveLocationMode: v } }))
    const cb = get().onChange
    if (cb) {
      cb({ ...get().settings })
    }
  },
  setCustomLocationPattern: (v: string) => {
    set((state) => ({ settings: { ...state.settings, customLocationPattern: v } }))
    const cb = get().onChange
    if (cb) {
      cb({ ...get().settings })
    }
  },
  setImageSyntaxMode: (v: ImageFlowSettingsCore['imageSyntaxMode']) => {
    set((state) => ({ settings: { ...state.settings, imageSyntaxMode: v } }))
    const cb = get().onChange
    if (cb) {
      cb({ ...get().settings })
    }
  },
  setUploadEnabled: (v: boolean) => {
    set((state) => ({ settings: { ...state.settings, uploadEnabled: v } }))
    const cb = get().onChange
    if (cb) {
      cb({ ...get().settings })
    }
  },
  setUploaderType: (v: ImageFlowSettingsCore['uploaderType']) => {
    set((state) => ({ settings: { ...state.settings, uploaderType: v } }))
    const cb = get().onChange
    if (cb) {
      cb({ ...get().settings })
    }
  },
  setUploaderCommandPath: (v: string) => {
    set((state) => ({ settings: { ...state.settings, uploaderCommandPath: v } }))
    const cb = get().onChange
    if (cb) {
      cb({ ...get().settings })
    }
  },
  setDeleteLocalAfterUpload: (v: boolean) => {
    set((state) => ({ settings: { ...state.settings, deleteLocalAfterUpload: v } }))
    const cb = get().onChange
    if (cb) {
      cb({ ...get().settings })
    }
  },
  setUploaderProfiles: (v: NonNullable<ImageFlowSettingsCore['uploaderProfiles']>) => {
    set((state) => ({ settings: { ...state.settings, uploaderProfiles: v } }))
    const cb = get().onChange
    if (cb) {
      cb({ ...get().settings })
    }
  },
  setActiveUploaderProfileId: (v: string | null) => {
    set((state) => ({ settings: { ...state.settings, activeUploaderProfileId: v } }))
    const cb = get().onChange
    if (cb) {
      cb({ ...get().settings })
    }
  },
}))
