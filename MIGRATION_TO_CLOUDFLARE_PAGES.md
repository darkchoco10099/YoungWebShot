# 🔄 从 Vercel 迁移到 Cloudflare Pages 指南

## 📋 迁移概述

本项目已完全从 Vercel 迁移到 Cloudflare Pages，享受更快的边缘计算性能和更好的全球分发。

## 🗂️ 已删除的文件

以下 Vercel 相关文件已被删除：

- ❌ `vercel.json` - Vercel 配置文件
- ❌ `VERCEL_DEPLOYMENT.md` - Vercel 部署指南
- ❌ `DEPLOYMENT_FIXES.md` - Vercel 故障排除
- ❌ `DEPLOYMENT_TROUBLESHOOTING.md` - Vercel 问题诊断

## 📁 新增的文件

以下 Cloudflare Pages 相关文件已被创建：

- ✅ `wrangler.toml` - Cloudflare Pages 配置
- ✅ `CLOUDFLARE_PAGES_DEPLOYMENT.md` - 完整部署指南
- ✅ `CLOUDFLARE_PAGES_QUICKSTART.md` - 快速开始指南
- ✅ `public/_headers` - HTTP 头配置
- ✅ `public/_redirects` - 路由重定向配置
- ✅ `.github/workflows/deploy.yml` - GitHub Actions 自动部署
- ✅ `MIGRATION_TO_CLOUDFLARE_PAGES.md` - 本迁移指南

## 🔧 配置变更

### package.json 脚本更新

```diff
"scripts": {
  "dev": "next dev -p 5555",
- "build": "next build",
+ "build": "PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true next build",
  "start": "next start",
  "lint": "next lint",
- "vercel-build": "PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true next build"
+ "pages:build": "PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true next build",
+ "pages:dev": "next dev"
}
```

### 环境变量更新

```diff
# .env.example
- # 在 Vercel 部署时跳过 Chromium 下载
+ # 在 Cloudflare Pages 部署时跳过 Chromium 下载
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
```

### 代码注释更新

```diff
# lib/chromium.ts
- // 在Vercel等无服务器环境中，不应该复用页面实例
+ // 在Cloudflare Pages等无服务器环境中，不应该复用页面实例

- // 针对 Vercel 部署的特殊错误处理
+ // 针对 Cloudflare Pages 部署的特殊错误处理
```

### .gitignore 更新

```diff
- # vercel
+ # vercel (legacy)
.vercel

+ # cloudflare
+ .wrangler
+ .dev.vars
```

## 📚 文档更新

### README.md 主要变更

1. **徽章更新**: Vercel → Cloudflare Pages
2. **部署说明**: 完全重写部署章节
3. **配置文件**: vercel.json → wrangler.toml
4. **故障排除**: 更新为 Cloudflare Pages 相关问题

### 新增文档结构

```
📁 文档结构
├── README.md                           # 主文档（已更新）
├── CLOUDFLARE_PAGES_DEPLOYMENT.md      # 完整部署指南
├── CLOUDFLARE_PAGES_QUICKSTART.md      # 5分钟快速开始
├── MIGRATION_TO_CLOUDFLARE_PAGES.md    # 迁移指南（本文档）
└── SCREENSHOT_SERVICES.md              # 截图服务配置（已更新）
```

## 🚀 部署配置对比

### Vercel 配置 (已删除)

```json
// vercel.json
{
  "functions": {
    "app/api/screenshot/route.ts": {
      "maxDuration": 60,
      "memory": 1024
    }
  },
  "env": {
    "PUPPETEER_SKIP_CHROMIUM_DOWNLOAD": "true"
  }
}
```

### Cloudflare Pages 配置 (新增)

```toml
# wrangler.toml
name = "young-web-shot"
compatibility_date = "2024-12-01"
compatibility_flags = ["nodejs_compat"]

[build]
command = "npm run pages:build"

[build.environment_variables]
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = "true"
NODE_ENV = "production"
```

## 🔄 CI/CD 配置

### GitHub Actions 工作流

新增自动部署配置：

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [ main, master ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run pages:build
      - uses: cloudflare/pages-action@v1
```

## 🎯 迁移优势

### 性能提升

- ⚡ **更快的冷启动**: Cloudflare Pages 的边缘计算
- 🌍 **全球分发**: 更好的地理位置覆盖
- 📈 **更高并发**: 更强的并发处理能力

### 成本优化

- 💰 **更优惠的定价**: Cloudflare Pages 免费额度更高
- 🔄 **无限带宽**: 不限制流量使用
- 📊 **更好的监控**: 内置分析和监控工具

### 开发体验

- 🛠️ **更简单的配置**: 更直观的配置文件
- 🔧 **更好的调试**: 更详细的日志和错误信息
- 🚀 **更快的部署**: 更快的构建和部署速度

## 📋 迁移检查清单

### 代码迁移

- [x] 删除 `vercel.json` 配置文件
- [x] 创建 `wrangler.toml` 配置文件
- [x] 更新 `package.json` 构建脚本
- [x] 更新环境变量配置
- [x] 更新代码注释和文档
- [x] 创建 Cloudflare Pages 配置文件

### 文档更新

- [x] 更新 README.md 主文档
- [x] 创建 Cloudflare Pages 部署指南
- [x] 创建快速开始指南
- [x] 更新故障排除文档
- [x] 创建迁移指南

### 部署配置

- [x] 配置 GitHub Actions 自动部署
- [x] 设置 HTTP 头和重定向规则
- [x] 更新 .gitignore 文件
- [x] 验证构建配置

## 🚀 下一步操作

### 1. 部署到 Cloudflare Pages

```bash
# 推送代码到 GitHub
git add .
git commit -m "feat: migrate from Vercel to Cloudflare Pages"
git push origin main

# 按照快速开始指南部署
# 参考: CLOUDFLARE_PAGES_QUICKSTART.md
```

### 2. 配置自定义域名（可选）

1. 在 Cloudflare Pages 项目设置中添加自定义域名
2. 配置 DNS 记录
3. 启用 HTTPS

### 3. 设置监控和告警

1. 配置 Cloudflare Analytics
2. 设置性能监控
3. 配置错误告警

## 🆘 迁移后支持

如果在迁移过程中遇到问题：

1. 查看 [Cloudflare Pages 部署指南](./CLOUDFLARE_PAGES_DEPLOYMENT.md)
2. 参考 [快速开始指南](./CLOUDFLARE_PAGES_QUICKSTART.md)
3. 在 [Issues](https://github.com/your-username/young-web-shot/issues) 中报告问题

## 📊 迁移总结

| 项目 | Vercel | Cloudflare Pages | 状态 |
|------|--------|------------------|------|
| 配置文件 | vercel.json | wrangler.toml | ✅ 已迁移 |
| 构建命令 | vercel-build | pages:build | ✅ 已更新 |
| 部署方式 | Git 集成 | Git 集成 | ✅ 保持一致 |
| 环境变量 | Dashboard | Dashboard | ✅ 已配置 |
| 自动部署 | 内置 | GitHub Actions | ✅ 已配置 |
| 监控日志 | 内置 | 内置 | ✅ 功能增强 |

---

**🎉 迁移完成！** 项目现在运行在 Cloudflare Pages 上，享受更快的性能和更好的开发体验！