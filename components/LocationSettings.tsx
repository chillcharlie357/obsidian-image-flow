import type { NoteContext, SaveLocationMode } from './types'
import { normalizeDir } from '../lib/paths'
import { useSettingsStore } from './settingsStore'

const OPTIONS: { value: SaveLocationMode; label: string; desc: string }[] = [
  { value: 'vault_assets', label: 'Vault Assets', desc: 'Save to vault/assets/' },
  { value: 'filename_assets', label: 'Current File Assets', desc: 'Save to {filename}.assets/' },
  { value: 'filepath_assets', label: 'Current Folder Assets', desc: 'Save to {file_path}/assets/' },
  { value: 'custom', label: 'Custom', desc: 'Define your own path pattern' },
]

export default function LocationSettings(props: {
  ctx?: NoteContext
  disabled?: boolean
}) {
  const mode = useSettingsStore((s) => s.settings.saveLocationMode)
  const pattern = useSettingsStore((s) => s.settings.customLocationPattern)

  function preview() {
    const now = new Date()
    const pad = (n: number) => n.toString().padStart(2, '0')
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    const base =
      mode === 'vault_assets'
        ? 'assets/'
      : mode === 'filename_assets'
        ? `${props.ctx?.filename || '{filename}'}.assets/`
      : mode === 'filepath_assets'
        ? `${props.ctx?.file_path || ''}/assets/`
        : pattern || ''
    const replaced = base
      .replace(/\{date\}/g, date)
      .replace(/\{filename\}/g, props.ctx?.filename || '{filename}')
      .replace(/\{file_path\}/g, props.ctx?.file_path || '')
      .replace(/\{vault\}\//g, '')
    return normalizeDir(replaced)
  }

  return (
    <>
      <div className="setting-item">
        <div className="setting-item-info">
          <div className="setting-item-name">Location Mode</div>
          <div className="setting-item-description">Choose where to save the images</div>
        </div>
        <div className="setting-item-control">
          <select
            className="dropdown"
            value={mode}
            disabled={props.disabled}
            onChange={(e) =>
              useSettingsStore.getState().setSaveLocationMode(e.target.value as SaveLocationMode)
            }
          >
            {OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {mode === 'custom' && (
        <div className="setting-item">
          <div className="setting-item-info">
            <div className="setting-item-name">Custom Path Pattern</div>
            <div className="setting-item-description">
              Available: {'{vault}, {date}, {filename}, {file_path}'}
            </div>
          </div>
          <div className="setting-item-control">
            <input
              type="text"
              value={pattern}
              disabled={props.disabled}
              onChange={(e) =>
                useSettingsStore.getState().setCustomLocationPattern(e.target.value)
              }
              placeholder={'{vault}/assets/{date}/'}
            />
          </div>
        </div>
      )}

      <div className="setting-item">
        <div className="setting-item-info">
          <div className="setting-item-name">Preview Path</div>
          <div className="setting-item-description">The image will be saved to:</div>
        </div>
        <div className="setting-item-control">
          <span className="preview-text">{preview()}</span>
        </div>
      </div>
    </>
  )
}
