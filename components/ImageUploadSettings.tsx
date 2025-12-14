import type { ImageFlowSettingsCore } from './types'

export default function ImageUploadSettings(props: {
  value: Pick<ImageFlowSettingsCore, 'uploadEnabled' | 'uploaderType' | 'uploaderCommandPath' | 'deleteLocalAfterUpload'>
  onChange: (v: Pick<ImageFlowSettingsCore, 'uploadEnabled' | 'uploaderType' | 'uploaderCommandPath' | 'deleteLocalAfterUpload'>) => void
}) {
  const { value, onChange } = props
  function set(
    next: Partial<Pick<ImageFlowSettingsCore, 'uploadEnabled' | 'uploaderType' | 'uploaderCommandPath' | 'deleteLocalAfterUpload'>>
  ) {
    onChange({ ...value, ...next })
  }
  return (
    <>
      <div className="setting-item-heading">
        <div className="setting-item-name">Image Upload</div>
      </div>

      <div className="setting-item">
        <div className="setting-item-info">
          <div className="setting-item-name">Enable image upload</div>
          <div className="setting-item-description">
            Upload pasted images through external tools. Currently PicList is supported; PicGo/PicGo-Core are TODO.
          </div>
        </div>
        <div className="setting-item-control">
          <div
            className={`checkbox-container ${value.uploadEnabled ? 'is-enabled' : ''}`}
            role="checkbox"
            aria-checked={value.uploadEnabled}
            tabIndex={0}
            onClick={() => set({ uploadEnabled: !value.uploadEnabled })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                set({ uploadEnabled: !value.uploadEnabled })
              }
            }}
          >
            <input type="checkbox" checked={value.uploadEnabled} tabIndex={-1} readOnly />
          </div>
        </div>
      </div>

      {value.uploadEnabled && (
        <>
          <div className="setting-item">
            <div className="setting-item-info">
              <div className="setting-item-name">Uploader</div>
              <div className="setting-item-description">
                Choose which uploader to use. PicList is supported now; PicGo/PicGo-Core are TODO.
              </div>
            </div>
            <div className="setting-item-control">
              <select
                value={value.uploaderType}
                onChange={(e) =>
                  set({
                    uploaderType: e.target.value as any,
                  })
                }
              >
                <option value="none">None</option>
                <option value="piclist">PicList</option>
                <option value="picgo">PicGo</option>
                <option value="picgo_core">PicGo-Core</option>
              </select>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-item-info">
              <div className="setting-item-name">Uploader path</div>
              <div className="setting-item-description">
                Executable path for the selected uploader. For example <code>picgo</code>, <code>picgo-core</code>,{' '}
                <code>piclist</code>.
              </div>
            </div>
            <div className="setting-item-control">
              <input
                type="text"
                value={value.uploaderCommandPath}
                onChange={(e) => set({ uploaderCommandPath: e.target.value })}
                placeholder={
                  value.uploaderType === 'picgo_core'
                    ? 'picgo-core'
                    : value.uploaderType === 'piclist'
                    ? 'piclist'
                    : 'picgo'
                }
              />
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-item-info">
              <div className="setting-item-name">Delete local image after upload</div>
              <div className="setting-item-description">
                When enabled, the local image file will be removed after a successful upload.
              </div>
            </div>
            <div className="setting-item-control">
              <div
                className={`checkbox-container ${value.deleteLocalAfterUpload ? 'is-enabled' : ''}`}
                role="checkbox"
                aria-checked={value.deleteLocalAfterUpload}
                tabIndex={0}
                onClick={() => set({ deleteLocalAfterUpload: !value.deleteLocalAfterUpload })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    set({ deleteLocalAfterUpload: !value.deleteLocalAfterUpload })
                  }
                }}
              >
                <input type="checkbox" checked={value.deleteLocalAfterUpload} tabIndex={-1} readOnly />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
