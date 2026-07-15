# 郭瑞个人视频作品集

React + Vite 制作的个人作品集网站。

## 内容更新

- 网页文字和栏目：修改 `src/` 内对应内容。
- 封面图片：放在 `public/assets/posters/`。
- 原始视频：仍放在 `public/assets/videos/`，该目录只保存在本机和 NAS，不上传 GitHub。
- 更新视频清单和封面：运行 `npm run media:prepare`。
- 同步视频到 Cloudflare R2：配置本机凭证后运行 `npm run media:upload:r2`。

## Cloudflare 部署

- 网页：Cloudflare Pages
- 视频：Cloudflare R2 bucket `guo-rui-portfolio-media`
- Pages R2 binding：`MEDIA_BUCKET`
- 构建命令：`npm run build`
- 输出目录：`dist`

真实账号凭证只保存在本机环境变量中，禁止写入代码或提交到 GitHub。
