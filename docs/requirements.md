# 需求

## 图片重命名

-   图片从剪贴板粘贴时，自动重命名为指定格式
    -   保持原始文件名
    -   自定义重命名格式，如`{date}-{time}-{random}`等，可配置

## 图片位置

-   如果不上传图片，可按规则保存到指定目录（路径均相对 vault 根目录）
    -   Vault assets：始终保存到 `assets/`
    -   File assets：保存到 `{file_path?}/{filename}.assets/`
    -   Current folder assets：保存到 `{file_path?}/assets/`（当前文件夹的 `./assets/`）
    -   自定义目录：支持占位符（`{vault}`、`{date}`、`{filename}`、`{file_path}`），例如 `{vault}/assets/{date}/`

## 图片上传

-   支持多平台 picgo/picgo-core 上传
    -   按顺序检查配置项是否可用，选择第一可用的（windows/linux node 路径不同）
    -   支持指定始终启用一个配置项
-   支持自定义上传参数
    -   支持自定义上传参数，如指定上传路径、文件名等
-   支持其他上传方式（待定）
