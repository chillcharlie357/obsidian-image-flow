import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';
import ImageFlowSettings from './components/ImageFlowSettings.svelte'
import { mount, unmount } from 'svelte'
import type { SaveLocationMode, ImageFlowSettingsCore } from './components/types'

// Remember to rename these classes and interfaces!

interface MyPluginSettings extends ImageFlowSettingsCore {
    mySetting: string
}

const DEFAULT_SETTINGS: MyPluginSettings = {
    mySetting: 'default',
    renameEnabled: true,
    keepOriginal: false,
    renamePattern: '{date}-{time}-{random}',
    saveLocationMode: 'vault_assets',
    customLocationPattern: '{vault}/assets/{date}/',
}

	export default class MyPlugin extends Plugin {
    settings!: MyPluginSettings

	async onload() {
		await this.loadSettings();

        const ribbon = this.addRibbonIcon('dice', 'Image Flow', () => {
            new Notice('Configure Image Flow in Settings > Community plugins > Image Flow');
        });
        ribbon.addClass('image-flow-ribbon');

        this.addSettingTab(new SampleSettingTab(this.app, this));

        this.registerEvent(this.app.vault.on('create', async (file) => {
            if (file instanceof TFile) {
                await onFileCreate.call(this, file)
            }
        }))
    }

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
    plugin: MyPlugin
    view: ReturnType<typeof ImageFlowSettings> | undefined

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();
        const root = containerEl.createDiv()
        this.view = mount(ImageFlowSettings, {
            target: root,
            props: {
                settings: this.plugin.settings,
                onSave: async (s: any) => {
                    this.plugin.settings = { ...this.plugin.settings, ...s }
                    await this.plugin.saveSettings()
                }
            }
        })
	}

    hide(): void {
        if (this.view) {
            unmount(this.view)
            this.view = undefined
        }
    }
}

function isImage(name: string) {
    return /\.(png|jpg|jpeg|gif|webp|bmp|svg)$/i.test(name)
}

function pad(n: number) {
    return n.toString().padStart(2, '0')
}

function tokens(context: { originalBase: string; activeBase?: string; activeDir?: string }) {
    const now = new Date()
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
    const random = Math.random().toString(36).slice(2, 8)
    return {
        '{date}': date,
        '{time}': time,
        '{random}': random,
        '{filename}': context.activeBase || 'note',
        '{file_path}': context.activeDir || '',
        '{vault}/': '',
    }
}

function applyPattern(pattern: string, t: Record<string, string>) {
    let s = pattern
    for (const k of Object.keys(t)) s = s.replace(new RegExp(k, 'g'), t[k])
    return s
}

function pathJoin(a: string, b: string) {
    if (!a) return b
    if (a.endsWith('/')) return `${a}${b}`
    return `${a}/${b}`
}

export function getTargetDir(settings: MyPluginSettings, active: TFile | null, originalBase: string) {
    const t = tokens({ originalBase, activeBase: active?.basename, activeDir: active?.parent?.path })
    if (settings.saveLocationMode === 'vault_assets') return 'assets'
    if (settings.saveLocationMode === 'filename_assets') return applyPattern('{file_path}/{filename}.assets', t)
    if (settings.saveLocationMode === 'filepath_assets') return applyPattern('{file_path}/assets', t)
    return applyPattern(settings.customLocationPattern.replace(/\/$/, ''), t)
}

export function getTargetBase(settings: MyPluginSettings, originalBase: string, t: Record<string, string>) {
    if (!settings.renameEnabled || settings.keepOriginal) return originalBase
    return applyPattern(settings.renamePattern, t).replace(/\/+/, '-')
}

export function splitName(name: string) {
    const i = name.lastIndexOf('.')
    if (i === -1) return { base: name, ext: '' }
    return { base: name.substring(0, i), ext: name.substring(i + 1) }
}

export async function ensureFolder(app: App, dir: string) {
    if (!dir) return
    try {
        await app.vault.createFolder(dir)
    } catch {}
}

export async function uniquePath(app: App, dir: string, base: string, ext: string) {
    let candidate = pathJoin(dir, ext ? `${base}.${ext}` : base)
    let n = 1
    while (app.vault.getAbstractFileByPath(candidate)) {
        candidate = pathJoin(dir, ext ? `${base}-${n}.${ext}` : `${base}-${n}`)
        n++
    }
    return candidate
}

export async function moveRename(app: App, file: TFile, to: string) {
    if (file.path === to) return
    await app.vault.rename(file, to)
}

export async function onFileCreate(this: MyPlugin, file: TFile) {
    if (!isImage(file.name)) return
    const active = this.app.workspace.getActiveFile()
    const { base, ext } = splitName(file.name)
    const t = tokens({ originalBase: base, activeBase: active?.basename, activeDir: active?.parent?.path })
    const dir = getTargetDir(this.settings, active, base)
    await ensureFolder(this.app, dir)
    const newBase = getTargetBase(this.settings, base, t)
    const dest = await uniquePath(this.app, dir, newBase, ext)
    await moveRename(this.app, file, dest)
}
