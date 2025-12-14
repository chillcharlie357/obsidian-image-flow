import { useEffect, useState } from 'react'
import type { RenameSettingsValue } from './types'

export default function RenameSettings(props: {
  value: RenameSettingsValue
  onChange: (v: RenameSettingsValue) => void
}) {
  const [local, setLocal] = useState<RenameSettingsValue>({ ...props.value })
  useEffect(() => props.onChange(local), [local])

  function sampleName() {
    return generateName('image.png', local)
  }
  function generateName(original: string, v: RenameSettingsValue) {
    const base = original.replace(/\.[^/.]+$/, '')
    const ext = original.split('.').pop() || 'png'
    if (v.keepOriginal) return `${base}.${ext}`
    const now = new Date()
    const pad = (n: number) => n.toString().padStart(2, '0')
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
    const random = Math.random().toString(36).slice(2, 8)
    const name = v.renamePattern
      .replace(/\{date\}/g, date)
      .replace(/\{time\}/g, time)
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
            className={`checkbox-container ${local.keepOriginal ? 'is-enabled' : ''}`}
            role="checkbox"
            aria-checked={local.keepOriginal}
            tabIndex={0}
            onClick={() => setLocal({ ...local, keepOriginal: !local.keepOriginal })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setLocal({ ...local, keepOriginal: !local.keepOriginal })
              }
            }}
          >
            <input type="checkbox" checked={local.keepOriginal} tabIndex={-1} readOnly />
          </div>
        </div>
      </div>

      <div className="setting-item">
        <div className="setting-item-info">
          <div className="setting-item-name">Rename Pattern</div>
          <div className="setting-item-description">
            Available: {'{date}, {time}, {random}, {filename}'}
            <div className="setting-item-description-sub">Preview: {sampleName()}</div>
          </div>
        </div>
        <div className="setting-item-control">
          <input
            type="text"
            value={local.renamePattern}
            onChange={(e) => setLocal({ ...local, renamePattern: e.target.value })}
            disabled={local.keepOriginal}
            placeholder={'{date}-{time}-{random}'}
          />
        </div>
      </div>
    </>
  )
}

