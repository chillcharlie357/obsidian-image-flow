import { useEffect } from 'react'
import type { ImageFlowSettingsCore, NoteContext } from './types'
import RenameSettings from './RenameSettings'
import LocationSettings from './LocationSettings'
import ImageUploadSettings from './ImageUploadSettings'
import { useSettingsStore } from './settingsStore'

export default function ImageFlowSettings(props: {
  settings: ImageFlowSettingsCore
  onSave: (s: ImageFlowSettingsCore) => void
  ctx?: NoteContext
}) {
  const local = useSettingsStore((s) => s.settings)

  useEffect(() => {
    useSettingsStore.getState().init(props.settings, props.onSave)
  }, [props.settings, props.onSave])

  return (
    <div className="image-flow-settings">
      <div className="setting-item-heading">
        <div className="setting-item-name">Image Rename</div>
      </div>

      <div className="setting-item">
        <div className="setting-item-info">
          <div className="setting-item-name">Enable image rename</div>
          <div className="setting-item-description">Automatically rename images when pasting</div>
        </div>
        <div className="setting-item-control">
          <div
            className={`checkbox-container ${local.renameEnabled ? 'is-enabled' : ''}`}
            role="checkbox"
            aria-checked={local.renameEnabled}
            tabIndex={0}
            onClick={() =>
              useSettingsStore.getState().setRenameEnabled(!local.renameEnabled)
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                useSettingsStore.getState().setRenameEnabled(!local.renameEnabled)
              }
            }}
          >
            <input type="checkbox" checked={local.renameEnabled} tabIndex={-1} readOnly />
          </div>
        </div>
      </div>

      {local.renameEnabled && <RenameSettings />}

      <div className="setting-item-heading">
        <div className="setting-item-name">Save Location</div>
      </div>

      <LocationSettings ctx={props.ctx} />

      <div className="setting-item-heading">
        <div className="setting-item-name">Image Syntax</div>
      </div>

      <div className="setting-item">
        <div className="setting-item-info">
          <div className="setting-item-name">Image link format</div>
          <div className="setting-item-description">Choose between Markdown syntax and Obsidian wikilink syntax</div>
        </div>
        <div className="setting-item-control">
          <select
            value={local.imageSyntaxMode}
            onChange={(e) =>
              useSettingsStore.getState().setImageSyntaxMode(e.target.value as any)
            }
          >
            <option value="markdown">Markdown: ![alt](path/to/image.png)</option>
            <option value="wikilink">Wikilink: ![[image.png]]</option>
          </select>
        </div>
      </div>

      <ImageUploadSettings />
    </div>
  )
}
