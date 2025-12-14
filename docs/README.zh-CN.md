# Obsidian Image Flow

一个用于优化 Obsidian 图片粘贴、保存和上传流程的插件。

插件会监听编辑器中的粘贴和拖拽事件，按规则保存图片文件，并在需要时通过 PicList / PicGo / PicGo-Core 等外部 CLI 工具上传到图床，最后在文档中插入合适的图片链接。

## 功能特性

- 图片粘贴 / 拖拽自动处理
  - 拦截编辑器中的粘贴和拖拽事件，将图片保存到 vault，并自动在笔记中插入图片链接。
  - 支持两种图片语法：
    - Markdown：`![alt](path/to/image.png)`
    - Obsidian wikilink：`![[image.png]]`

- 图片重命名
  - 可开关自动重命名（也可保持原始文件名）。
  - 支持自定义重命名模板，默认：`{date}-{time}-{random}`。
  - 支持占位符：
    - `{date}`、`{time}`、`{timestamp}`、`{date:YYYYMMDD}`、`{random}`、`{filename}`。
  - 设置界面中提供重命名预览，方便调试命名规则。

- 图片保存位置
  - 在未开启上传时，图片会按以下规则保存到本地：
    - `Vault Assets`：始终保存到 `assets/`
    - `Current File Assets`：保存到 `{filename}.assets/`
    - `Current Folder Assets`：保存到 `{file_path}/assets/`
    - `Custom`：自定义路径模式
  - 自定义路径支持占位符：
    - `{vault}`、`{date}`、`{filename}`、`{file_path}`
  - 设置界面中提供“预览路径”，可以看到最终落盘目录。

- 图片上传（PicList / PicGo / PicGo-Core）
  - 可在设置中开启“图片上传”，在本地保存之后调用外部 CLI 完成上传。
  - 内置三种上传策略：
    - `piclist`、`picgo`、`picgo_core`
  - 上传命令可配置：
    - 只写命令名（如 `picgo`、`picgo-core`、`piclist`），依赖系统 `PATH`。
    - 或填写完整绝对路径。
  - 上传流程：
    - 执行 CLI 命令。
    - 从标准输出 / 错误输出或剪贴板中提取图片 URL。
    - 将插入到笔记中的图片链接替换为远程 URL。
  - 可选“上传后删除本地图片”开关，上传成功后自动删除本地文件。

- 上传配置 Profile
  - 将上传相关设置组合为可复用的 Profile：
    - `uploaderType`
    - `uploaderCommandPath`
    - `deleteLocalAfterUpload`
  - 自动创建默认 Profile：
    - 第一次启用上传且没有任何 Profile 时，会创建一个 `Default` Profile。
  - Profile 操作：
    - 重命名：直接修改 Profile 名称输入框。
    - 复制：复制当前 Profile，生成一个新的 Profile。
    - 删除：删除当前 Profile，但始终至少保留一个 Profile。
  - 切换 Profile 时，会自动同步：
    - 上传类型、命令路径以及“上传后删除本地图片”等字段。

## 安装

在插件上架到社区插件市场之前，可以通过手动方式安装：

1. 将本仓库克隆或下载到你的 vault：
   - 路径示例：`<你的-vault>/.obsidian/plugins/obsidian-image-flow/`
2. 确保已安装 Node.js（推荐 v16+）。
3. 安装依赖：
   - `npm install`
4. 构建插件：
   - 开发模式：`npm run dev`
   - 生产构建：`npm run build`
5. 在 Obsidian 中：
   - 打开 `设置 → 第三方插件 → 已安装插件`。
   - 启用 `Image Flow`。

## 使用

插件启用后，你只需要像平时一样粘贴或拖拽图片：

- 插件会根据“保存位置”配置计算目标目录。
- 使用“重命名规则”生成文件名（或保留原始文件名）。
- 将图片写入 vault。
- 如果启用了上传：
  - 调用配置好的 PicList / PicGo / PicGo-Core 命令上传图片。
  - 从输出 / 剪贴板中解析出远程图片 URL。
  - 将插入到文档中的图片链接替换为远程 URL。
- 根据“图片语法”设置，最终插入 Markdown 或 wikilink 格式。

## 设置说明

在 `设置 → 第三方插件 → Image Flow` 中可以配置：

- 图片重命名
  - 是否启用自动重命名。
  - 重命名模板和结果预览。

- 图片语法
  - 在 Markdown 与 wikilink 之间切换。

- 图片保存位置（未启用上传时生效）
  - 选择保存模式。
  - 当选择自定义时，配置路径模式并查看预览。

- 图片上传
  - 启用 / 禁用上传功能。
  - 管理上传 Profile：
    - 选择、重命名、复制、删除 Profile。
  - 为每个 Profile 配置：
    - 上传类型（`none` / `piclist` / `picgo` / `picgo_core`）
    - 上传命令路径
    - 是否上传后删除本地图片。

## 开发与构建

- 依赖
  - Node.js v16+
  - Obsidian 桌面端

- 脚本
  - `npm run dev`：使用 `esbuild.config.mjs` 持续构建（开发模式）。
  - `npm run build`：先使用 `tsc` 进行类型检查，再构建生产版本。
  - `npm run version`：更新 `manifest.json` 和 `versions.json` 中的版本信息。

如果你希望发布自己的定制版本，可以参考 Obsidian 官方插件发布流程文档：

- https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines

