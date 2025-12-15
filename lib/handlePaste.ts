import { App, Editor, MarkdownView, Notice } from 'obsidian'
import type { ImageFlowPluginSettings } from './types'
import { tokens, getTargetDir, getTargetBase, splitName } from './naming'
import { ensureFolder, uniquePath, getAbsolutePath, relativePath } from './paths'
import { UploadContext } from './upload'
import { log, logError, logWarn } from './log'
import type { ImageUploaderProfile } from '../components/types'

export async function handlePaste(
  app: App,
  settings: ImageFlowPluginSettings,
  evt: ClipboardEvent | DragEvent,
  editor: Editor,
  markdownView: MarkdownView
) {
  try {
    const viewFile = markdownView?.file || app.workspace.getActiveFile()
    if (!viewFile) {
      return
    }

    const files = evt instanceof ClipboardEvent ? evt.clipboardData?.files : evt.dataTransfer?.files
    if (!files || files.length === 0) {
      return
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image')) {
        continue
      }

      evt.preventDefault()

      const activeFile = viewFile
      const { base, ext } = splitName(file.name)
      const t = tokens({
        originalBase: base,
        activeBase: activeFile?.basename ?? '',
        activeDir: activeFile?.parent?.path ?? '',
      })
      const dir = getTargetDir(settings, activeFile, null, base)
      await ensureFolder(app, dir)

      const newBase = getTargetBase(settings, base, t)
      const dest = await uniquePath(app, dir, newBase, ext)

      const buffer = await file.arrayBuffer()
      const newFile = await app.vault.createBinary(dest, buffer)

      const link = app.fileManager.generateMarkdownLink(newFile, activeFile?.path ?? '')
      let remoteUrl = ''
      if ((settings as any).uploadEnabled && (settings as any).uploaderType && (settings as any).uploaderType !== 'none') {
        const absPath = getAbsolutePath(app, newFile.path)
        const profiles: ImageUploaderProfile[] = ((settings as any).uploaderProfiles || []) as any
        const activeId: string | null = (settings as any).activeUploaderProfileId || null
        const activeProfile = profiles.find((p) => p.id === activeId) || null
        const initialType = activeProfile?.uploaderType || (settings as any).uploaderType
        const ctx = new UploadContext(settings, initialType)
        ctx.updateWithProfile(activeProfile || undefined)
        remoteUrl = await ctx.upload(absPath)
        if (remoteUrl && (settings as any).deleteLocalAfterUpload) {
          try {
            await app.vault.delete(newFile)
          } catch (e) {
            logWarn('delete local image after upload failed', e)
          }
        }
      }
      let imageSyntax: string
      if (settings.imageSyntaxMode === 'markdown' || remoteUrl) {
        const notePath = activeFile?.path || ''
        const rel = relativePath(notePath, newFile.path)
        let alt = newFile.basename
        if (/^\d+$/.test(alt)) {
          alt = `${alt}.${ext || newFile.extension || 'image'}`
        }
        imageSyntax = `![${alt}](${remoteUrl || rel})`
      } else {
        imageSyntax = link.startsWith('!') ? link : `!${link}`
      }
      log('handlePaste insert', {
        mode: settings.imageSyntaxMode,
        link,
        imageSyntax,
        filePath: newFile.path,
        notePath: activeFile?.path,
        remoteUrl,
      })
      editor.replaceSelection(imageSyntax)
    }
  } catch (error) {
    logError('handlePaste failed', error)
    new Notice('Image Flow: failed to paste image, see console for details')
  }
}
