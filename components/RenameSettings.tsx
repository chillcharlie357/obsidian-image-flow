import { useSettingsStore } from './settingsStore'
import type { RenameSettingsValue } from './types'

export default function RenameSettings() {
  const DEFAULT_RENAME_PATTERN = '{date}-{time}-{random}'
  const keepOriginal = useSettingsStore((s) => s.settings.keepOriginal)
  const renamePattern = useSettingsStore((s) => s.settings.renamePattern)
  const setKeepOriginal = useSettingsStore((s) => s.setKeepOriginal)
  const setRenamePattern = useSettingsStore((s) => s.setRenamePattern)

  function sampleName() {
    return generateName('image.png', {
      keepOriginal,
      renamePattern,
    })
  }
  function generateName(original: string, v: RenameSettingsValue) {
    const base = original.replace(/\.[^/.]+$/, '')
    const ext = original.split('.').pop() || 'png'
    if (v.keepOriginal) return `${base}.${ext}`
    const now = new Date()
    const pad = (n: number) => n.toString().padStart(2, '0')
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
    const timestamp = String(now.getTime())
    const random = Math.random().toString(36).slice(2, 8)
    const formatDatePattern = (fmt: string) => {
      const yyyy = String(now.getFullYear())
      const MM = pad(now.getMonth() + 1)
      const DD = pad(now.getDate())
      const HH = pad(now.getHours())
      const mm = pad(now.getMinutes())
      const ss = pad(now.getSeconds())
      return fmt
        .replace(/YYYY/g, yyyy)
        .replace(/MM/g, MM)
        .replace(/DD/g, DD)
        .replace(/dd/g, DD)
        .replace(/HH/g, HH)
        .replace(/mm/g, mm)
        .replace(/ss/g, ss)
    }
    const name = v.renamePattern
      .replace(/\{date:([^}]+)\}/g, (_, fmt) => formatDatePattern(fmt))
      .replace(/\{date\}/g, date)
      .replace(/\{time\}/g, time)
      .replace(/\{timestamp\}/g, timestamp)
      .replace(/\{random\}/g, random)
      .replace(/\{filename\}/g, base)
    return `${name}.${ext}`
  }

  return (
    <>
      <div className="setting-item">
        <div className="setting-item-info">
          <div className="setting-item-name">Keep original filename</div>
          <div className="setting-item-description">Use the original filename instead of generating a new one</div>
        </div>
        <div className="setting-item-control">
          <div
            className={`checkbox-container ${keepOriginal ? 'is-enabled' : ''}`}
            role="checkbox"
            aria-checked={keepOriginal}
            tabIndex={0}
            onClick={() => setKeepOriginal(!keepOriginal)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setKeepOriginal(!keepOriginal)
              }
            }}
          >
            <input type="checkbox" checked={keepOriginal} tabIndex={-1} readOnly />
          </div>
        </div>
      </div>

      <div className="setting-item">
        <div className="setting-item-info">
          <div className="setting-item-name">
            Rename Pattern
          </div>
          <div className="setting-item-description">
            <div>{'{date}'}: 2025-12-14</div>
            <div>{'{time}'}: 161253</div>
            <div>{'{timestamp}'}: 1734172800000</div>
            <div>{'{date:YYYYMMDD}'}: 20251214</div>
            <div>{'{random}'}: random string</div>
            <div>{'{filename}'}: current note name</div>
            <div className="setting-item-description-sub">Preview: {sampleName()}</div>
          </div>
        </div>
        <div className="setting-item-control">
          <input
            type="text"
            value={renamePattern}
            onChange={(e) => setRenamePattern(e.target.value)}
            disabled={keepOriginal}
            placeholder={DEFAULT_RENAME_PATTERN}
          />
          <button
            type="button"
            className="clickable-icon"
            title="reset"
            aria-label="reset"
            disabled={keepOriginal || renamePattern === DEFAULT_RENAME_PATTERN}
            onClick={() => setRenamePattern(DEFAULT_RENAME_PATTERN)}
          >
            ↺
          </button>
        </div>
      </div>
    </>
  )
}
