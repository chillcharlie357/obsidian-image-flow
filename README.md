<!--
# Obsidian Sample Plugin

This is a sample plugin for Obsidian (https://obsidian.md).

This project uses TypeScript to provide type checking and documentation.
The repo depends on the latest plugin API (obsidian.d.ts) in TypeScript Definition format, which contains TSDoc comments describing what it does.

This sample plugin demonstrates some of the basic functionality the plugin API can do.
- Adds a ribbon icon, which shows a Notice when clicked.
- Adds a command "Open Sample Modal" which opens a Modal.
- Adds a plugin setting tab to the settings page.
- Registers a global click event and output 'click' to the console.
- Registers a global interval which logs 'setInterval' to the console.

## First time developing plugins?

Quick starting guide for new plugin devs:

- Check if [someone already developed a plugin for what you want](https://obsidian.md/plugins)! There might be an existing plugin similar enough that you can partner up with.
- Make a copy of this repo as a template with the "Use this template" button (login to GitHub if you don't see it).
- Clone your repo to a local development folder. For convenience, you can place this folder in your `.obsidian/plugins/your-plugin-name` folder.
- Install NodeJS, then run `npm i` in the command line under your repo folder.
- Run `npm run dev` to compile your plugin from `main.ts` to `main.js`.
- Make changes to `main.ts` (or create new `.ts` files). Those changes should be automatically compiled into `main.js`.
- Reload Obsidian to load the new version of your plugin.
- Enable plugin in settings window.
- For updates to the Obsidian API run `npm update` in the command line under your repo folder.

## Releasing new releases

- Update your `manifest.json` with your new version number, such as `1.0.1`, and the minimum Obsidian version required for your latest release.
- Update your `versions.json` file with `"new-plugin-version": "minimum-obsidian-version"` so older versions of Obsidian can download an older version of your plugin that's compatible.
- Create new GitHub release using your new version number as the "Tag version". Use the exact version number, don't include a prefix `v`. See here for an example: https://github.com/obsidianmd/obsidian-sample-plugin/releases
- Upload the files `manifest.json`, `main.js`, `styles.css` as binary attachments. Note: The manifest.json file must be in two places, first the root path of your repository and also in the release.
- Publish the release.

> You can simplify the version bump process by running `npm version patch`, `npm version minor` or `npm version major` after updating `minAppVersion` manually in `manifest.json`.
> The command will bump version in `manifest.json` and `package.json`, and add the entry for the new version to `versions.json`

## Adding your plugin to the community plugin list

- Check the [plugin guidelines](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines).
- Publish an initial version.
- Make sure you have a `README.md` file in the root of your repo.
- Make a pull request at https://github.com/obsidianmd/obsidian-releases to add your plugin.

## How to use

- Clone this repo.
- Make sure your NodeJS is at least v16 (`node --version`).
- `npm i` or `yarn` to install dependencies.
- `npm run dev` to start compilation in watch mode.

## Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.

## Improve code quality with eslint (optional)
- [ESLint](https://eslint.org/) is a tool that analyzes your code to quickly find problems. You can run ESLint against your plugin to find common bugs and ways to improve your code. 
- To use eslint with this project, make sure to install eslint from terminal:
  - `npm install -g eslint`
- To use eslint to analyze this project use this command:
  - `eslint main.ts`
  - eslint will then create a report with suggestions for code improvement by file and line number.
- If your source code is in a folder, such as `src`, you can use eslint with this command to analyze all files in that folder:
  - `eslint ./src/`

## Funding URL

You can include funding URLs where people who use your plugin can financially support it.

The simple way is to set the `fundingUrl` field to your link in your `manifest.json` file:

```json
{
    "fundingUrl": "https://buymeacoffee.com"
}
```

If you have multiple URLs, you can also do:

```json
{
    "fundingUrl": {
        "Buy Me a Coffee": "https://buymeacoffee.com",
        "GitHub Sponsor": "https://github.com/sponsors",
        "Patreon": "https://www.patreon.com/"
    }
}
```

## API Documentation

See https://github.com/obsidianmd/obsidian-api
-->

# Obsidian Image Flow

Language: English | [中文文档](https://github.com/chillcharlie357/obsidian-image-flow/blob/main/docs/README.zh-CN.md)

A plugin that streamlines how images are pasted, stored, and uploaded in Obsidian.

It listens to paste and drag‑and‑drop events in the editor, saves image files to your vault following configurable rules, and optionally uploads them via external CLI tools such as PicList, PicGo, or PicGo-Core.

## Features

- Automatic handling of pasted / dragged images
  - Intercepts editor paste and drop events, saves images into the vault and inserts links into the note.
  - Supports two link syntaxes:
    - Markdown: `![alt](path/to/image.png)`
    - Obsidian wikilink: `![[image.png]]`

- Image renaming
  - Optional toggle to enable or disable automatic renaming.
  - Option to keep the original filename.
  - Custom rename pattern with a default of `{date}-{time}-{random}`.
  - Supported placeholders:
    - `{date}`, `{time}`, `{timestamp}`, `{date:YYYYMMDD}`, `{random}`, `{filename}`.

- Save location rules
  - When upload is disabled, images are stored locally using flexible rules:
    - `Vault Assets`: always save to `assets/`
    - `Current File Assets`: save to `{filename}.assets/`
    - `Current Folder Assets`: save to `{file_path}/assets/`
    - `Custom`: arbitrary directory pattern with placeholders such as `{vault}`, `{date}`, `{filename}`, `{file_path}`.

- Image upload (PicList / PicGo / PicGo-Core)
  - Optional upload flow that runs after the image is saved locally.
  - Built‑in strategies for `piclist`, `picgo`, and `picgo_core`.
  - Image upload supports PicList as an uploader option: https://github.com/Kuingsmile/PicList.
  - Configurable command: use a bare command name or an absolute path.
  - Upload flow:
    - Execute the uploader CLI.
    - Extract the image URL from stdout / stderr or clipboard.
    - Replace the inserted image link with the remote URL.
  - Optional “delete local image after upload” toggle.

- Upload profiles
  - Group upload‑related settings into reusable profiles.
  - Default profile is created automatically the first time upload is enabled.
  - Profile operations:
    - Rename the active profile.
    - Copy the active profile.
    - Delete the active profile (at least one profile is always kept).
  - Switching profiles automatically updates uploader type, command path, and the “delete local image after upload” flag.


