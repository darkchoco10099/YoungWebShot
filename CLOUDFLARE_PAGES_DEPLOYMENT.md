# 🌐 Cloudflare Pages 部署指南

## 🚀 快速部署

### 1. 连接 GitHub 仓库

- 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
- 进入 **Pages** 部分
- 点击 **Create a project**
- 选择 **Connect to Git**
- 选择你的 GitHub 仓库

### 2. 配置构建设置

在部署配置页面设置以下参数：

- **Framework preset**: `Next.js`
- **Build command**: `npm run pages:build`
- **Build output directory**: `.next`
- **Root directory**: `/` (项目根目录)

### 3. 环境变量配置

在 **Settings** → **Environment variables** 中添加：

```
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
NODE_ENV=production
```

## 🔧 关键配置文件

### wrangler.toml

项目已包含 Cloudflare Pages 配置文件：

```toml
name = "young-web-shot"
compatibility_date = "2024-12-01"
compatibility_flags = ["nodejs_compat"]

[build]
command = "npm run pages:build"

[build.environment_variables]
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = "true"
NODE_ENV = "production"
```

### package.json 构建脚本

```json
{
  "scripts": {
    "pages:build": "PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true next build",
    "pages:dev": "next dev"
  }
}
```

### 依赖配置

确保以下依赖版本正确：

```json
{
  "dependencies": {
    "@sparticuz/chromium": "^130.0.0",
    "puppeteer-core": "^23.8.0"
  }
}
```

## 📊 性能配置

### 函数配置

- **最大执行时间**: 30秒（Cloudflare Pages 默认）
- **内存限制**: 128MB（可根据需要调整）
- **并发限制**: 1000个并发请求

### 优化建议

1. **缓存策略**: 利用 Cloudflare CDN 缓存静态资源
2. **边缘计算**: 利用 Cloudflare Workers 进行边缘处理
3. **图片优化**: 使用 Cloudflare Images 服务
4. **错误重试**: 实现智能重试机制

## 🔍 监控和调试

### 查看部署日志

1. 进入 Cloudflare Dashboard
2. 选择项目 → **Deployments** 标签
3. 查看构建和部署日志

### 函数日志

1. 进入 **Functions** 标签
2. 查看实时日志和错误信息
3. 监控性能指标

### 常见日志信息

```
Chromium executable path: /opt/nodejs/node_modules/@sparticuz/chromium/bin
Environment variables: {
  PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: 'true',
  NODE_ENV: 'production'
}
```

## ⚠️ 常见问题

### 1. 部署失败

**症状**: 构建过程中出错
**解决**: 
- 确保 `package.json` 中的依赖版本正确
- 检查 `next.config.mjs` 配置
- 验证环境变量设置

### 2. 函数超时

**症状**: 截图请求超时
**解决**:
- 优化 Puppeteer 配置
- 减少页面加载时间
- 实现请求缓存

### 3. 内存不足

**症状**: 函数因内存不足而失败
**解决**:
- 优化 Chromium 启动参数
- 减少并发请求数量
- 实现资源清理

### 4. Chromium 路径错误

**症状**: 找不到 Chromium 可执行文件
**解决**:
- 确认 `@sparticuz/chromium` 版本为 `^130.0.0`
- 检查环境变量配置
- 验证 Puppeteer 配置

## 🎯 测试部署

部署完成后，测试 API 接口：

```bash
curl "https://your-domain.pages.dev/api/screenshot?url=example.com"
```

### 测试步骤

1. **基础功能测试**
   ```bash
   curl "https://your-domain.pages.dev/api/screenshot?url=https://example.com"
   ```

2. **参数测试**
   ```bash
   curl "https://your-domain.pages.dev/api/screenshot?url=https://example.com&width=1920&height=1080&format=png"
   ```

3. **错误处理测试**
   ```bash
   curl "https://your-domain.pages.dev/api/screenshot?url=invalid-url"
   ```

## 📋 部署检查清单

在部署到 Cloudflare Pages 之前，请确认以下项目:

- [ ] ✅ `@sparticuz/chromium` 已安装
- [ ] ✅ `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` 已设置
- [ ] ✅ `wrangler.toml` 配置正确
- [ ] ✅ 构建脚本配置正确
- [ ] ✅ 本地生产环境测试通过
- [ ] ✅ 导入语句正确
- [ ] ✅ 错误处理完善
- [ ] ✅ 环境变量配置完整

## 🔄 CI/CD 集成

### GitHub Actions 配置

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build project
        run: npm run pages:build
        env:
          PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: true
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: young-web-shot
          directory: .next
```

## 🆘 获取帮助

如果问题仍然存在，请提供以下信息：

1. **错误日志** - 完整的错误堆栈
2. **部署配置** - `wrangler.toml` 内容
3. **环境信息** - Node.js 版本、依赖版本
4. **测试 URL** - 尝试截图的网址
5. **重现步骤** - 详细的操作步骤

---

**最后更新**: 2024年12月
**版本**: v5.0 - Cloudflare Pages 部署
**状态**: 配置完成 ✅ | 文档更新 ✅