# 李欣玉 · 个人作品集

从景观设计到新媒体运营，展示内容策划、文案、视觉设计、拍摄剪辑和账号运营作品。

- 网站：https://xinyu-li-portfolio-20261027.poeticrain19.chatgpt.site/
- 联系邮箱：plum11252021@163.com
- 当前网站访问权限由 Sites 管理；GitHub 仓库用于保存完整源码。

## 功能

- 根据访问者当地时间自动切换日夜模式，支持手动切换。
- 首屏工作 / 游戏场景以 WebGL 局部变形呈现轻微动态；支持减少动态效果设置。
- 关于我、账号运营、内容策划、爆款内容、海报与视觉设计、PPT、视频、KOC / 达人矩阵及实验栏目。
- 双排海报自动滚动、磨砂卡片、图片放大预览和 PPT 翻页。
- 三张手机展示图使用已确认的透明背景版本，原图保留。
- 视频暂为“视频待补充”；未提供的实验项目保留占位。
- 页面中文字体优先使用 PingFang SC（苹果苹方简体）。

## 本地运行

需要 Node.js 22.13 或更新版本。

```sh
npm ci
npm run dev
```

开发预览默认地址为 http://localhost:5173 。D1 数据保存在本地 Wrangler 状态中。

首次运行时，先构建并使用生成的数据库绑定配置建立本地表，再启动生产预览：

```sh
npm run build
npx wrangler d1 execute DB --local --config dist/server/wrangler.json --file drizzle/0000_many_vance_astro.sql
npm start -- --port 4173
```

构建产物保存在 `dist/`，不提交到仓库。首次数据库迁移只需执行一次。执行集成测试请使用上述生产预览端口。

## 目录

| 路径 | 用途 |
| --- | --- |
| `site/index.html` | 页面结构和正文 |
| `public/` | 图片、字体样式、前端交互 |
| `app/route.ts` | 首页路由 |
| `app/api/visits/route.ts` | 访问人数接口 |
| `public/visitors.js` | 前端访问统计 |
| `db/`、`drizzle/` | 数据库定义及迁移 |
| `tests/visits.mjs` | 访问统计集成验证 |
| `.openai/hosting.json` | 现有 Sites 项目身份和存储绑定 |

## 访问人数

计数从统计功能上线起累计。已登录的平台账号或第一方浏览器随机标记用于去重；刷新不会重复累计。数据库仅保存标记的 SHA-256 散列和首次访问时间，不记录 IP、邮箱或浏览历史。匿名访问时更换设备、清除浏览器数据可能产生重复计数，因此不能视为精确的现实人数。

GET `/api/visits` 只读，POST 记录访问；计数失败显示“—”，不生成模拟数字。生产统计数据不保存在本仓库。

本地服务及数据库准备好后执行：

```sh
node tests/visits.mjs
```

该测试会写入本地测试访客，并拒绝使用生产域名。

## 部署

当前部署方式是 **Sites + Vinext / Cloudflare Workers + D1**。继续发布时复用 `.openai/hosting.json` 中的现有项目 ID，先构建，再通过 Sites 保存源码版本并发布。

GitHub 仓库保存完整源码。当前未配置 GitHub Pages：Pages 是静态托管，不能直接运行本项目的 `/api/visits` 服务端接口和 D1 数据库。若改用独立 Cloudflare 部署，需另外创建 D1 数据库、设置真实数据库绑定、执行迁移并配置 Worker 发布；不要将本地占位数据库 ID 用于生产。

未将依赖目录、构建产物、本地数据库或环境密钥提交到仓库。作品图片及文案保留原作者权利。
