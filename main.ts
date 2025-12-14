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

        this.registerEvent(this.app.workspace.on('editor-paste', (evt: ClipboardEvent, editor: Editor, markdownView: MarkdownView) => {
            handlePaste(this.app, this.settings, evt, editor, markdownView);
        }));

        this.registerEvent(this.app.workspace.on('editor-drop', (evt: DragEvent, editor: Editor, markdownView: MarkdownView) => {
            handlePaste(this.app, this.settings, evt, editor, markdownView);
        }));
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
    root: Root | undefined

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();
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
            this.root.unmount()
            this.root = undefined
        }
    }
}

 
