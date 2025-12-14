import { useEffect, useMemo, useState } from 'react'
import type { ImageFlowSettingsCore, NoteContext } from './types'
import RenameSettings from './RenameSettings'
import LocationSettings from './LocationSettings'

export default function ImageFlowSettings(props: {
  settings: ImageFlowSettingsCore
  onSave: (s: ImageFlowSettingsCore) => void
  ctx?: NoteContext
}) {
  const [local, setLocal] = useState<ImageFlowSettingsCore>({ ...props.settings })

  useEffect(() => {
    props.onSave(local)
  }, [local])

  return (
    <div className="image-flow-settings">
      <div className="setting-item-heading">
        <div className="setting-item-name">Image Renaming</div>
      </div>

      <div className="setting-item">
        <div className="setting-item-info">
          <div className="setting-item-name">Enable image renaming</div>
          <div className="setting-item-description">Automatically rename images when pasting</div>
        </div>
        <div className="setting-item-control">
          <div
            className={`checkbox-container ${local.renameEnabled ? 'is-enabled' : ''}`}
            role="checkbox"
            aria-checked={local.renameEnabled}
            tabIndex={0}
            onClick={() => setLocal({ ...local, renameEnabled: !local.renameEnabled })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setLocal({ ...local, renameEnabled: !local.renameEnabled })
              }
            }}
          >
            <input type="checkbox" checked={local.renameEnabled} tabIndex={-1} readOnly />
          </div>
        </div>
      </div>

      {local.renameEnabled && (
        <RenameSettings
          value={{ renamePattern: local.renamePattern, keepOriginal: local.keepOriginal }}
          onChange={(v) => setLocal({ ...local, renamePattern: v.renamePattern, keepOriginal: v.keepOriginal })}
        />
      )}

      <div className="setting-item-heading">
        <div className="setting-item-name">Save Location</div>
      </div>

      <LocationSettings
        value={{ saveLocationMode: local.saveLocationMode, customLocationPattern: local.customLocationPattern }}
        ctx={props.ctx}
        onChange={(v) => setLocal({ ...local, saveLocationMode: v.saveLocationMode, customLocationPattern: v.customLocationPattern })}
      />
    </div>
  )
}

