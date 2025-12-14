import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';
import { createRoot, Root } from 'react-dom/client'
import React from 'react'
import ImageFlowSettings from './components/ImageFlowSettings'
import type { SaveLocationMode, ImageFlowSettingsCore } from './components/types'
import { handlePaste } from './lib/imageFlow'


import type { MyPluginSettings } from './lib/types'

// Remember to rename these classes and interfaces!

 

const DEFAULT_SETTINGS: MyPluginSettings = {
    mySetting: 'default',
    renameEnabled: true,
    keepOriginal: false,
    renamePattern: '{date}-{time}-{random}',
    saveLocationMode: 'vault_assets',
    customLocationPattern: '{vault}/assets/{date}/',
    imageSyntaxMode: 'wikilink',
}

	export default class MyPlugin extends Plugin {
    settings!: MyPluginSettings

	async onload() {
		console.log('[Image Flow] Plugin onload start')
		await this.loadSettings();
        console.log('[Image Flow] Settings loaded', this.settings)

        const ribbon = this.addRibbonIcon('dice', 'Image Flow', () => {
            new Notice('Configure Image Flow in Settings > Community plugins > Image Flow');
        });
        ribbon.addClass('image-flow-ribbon');

        this.addSettingTab(new SampleSettingTab(this.app, this));
        console.log('[Image Flow] Setting tab registered')

        this.registerEvent(this.app.workspace.on('editor-paste', (evt: ClipboardEvent, editor: Editor, markdownView: MarkdownView) => {
            console.log('[Image Flow] editor-paste event', {
                hasClipboard: !!evt.clipboardData,
                file: markdownView?.file?.path,
            })
            handlePaste(this.app, this.settings, evt, editor, markdownView);
        }));

        this.registerEvent(this.app.workspace.on('editor-drop', (evt: DragEvent, editor: Editor, markdownView: MarkdownView) => {
            console.log('[Image Flow] editor-drop event', {
                hasDataTransfer: !!evt.dataTransfer,
                file: markdownView?.file?.path,
            })
            handlePaste(this.app, this.settings, evt, editor, markdownView);
        }));
    }

	onunload() {
        console.log('[Image Flow] Plugin onunload')
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
        console.log('[Image Flow] loadSettings merged result', this.settings)
	}

    async saveSettings() {
        console.log('[Image Flow] saveSettings', this.settings)
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
    root: Root | undefined

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();
        console.log('[Image Flow] SettingTab display')
        const host = containerEl.createDiv()
        this.root = createRoot(host)
        this.root.render(React.createElement(ImageFlowSettings, {
            settings: this.plugin.settings,
            onSave: async (s: any) => {
                this.plugin.settings = { ...this.plugin.settings, ...s }
                await this.plugin.saveSettings()
            }
        }))
	}

    hide(): void {
        if (this.root) {
            console.log('[Image Flow] SettingTab hide, unmount React root')
            this.root.unmount()
            this.root = undefined
        }
    }
}

 
