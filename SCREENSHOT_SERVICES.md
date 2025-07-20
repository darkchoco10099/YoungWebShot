# 截图服务配置指南

本项目支持多种截图实现方式，提供可靠的后备方案来解决 Vercel 环境中的 Chromium 依赖问题。

## 🎯 支持的截图服务

### 1. Puppeteer + @sparticuz/chromium-min (主要方案)
- **优点**: 完全控制，功能强大，免费
- **缺点**: 在某些 Vercel 环境中可能遇到依赖问题
- **配置**: 无需额外配置

### 2. htmlcsstoimage.com (后备方案 1)
- **优点**: 专业截图服务，稳定可靠
- **限制**: 免费计划 50 张截图/月
- **官网**: https://htmlcsstoimage.com/
- **配置**: 需要 API 密钥

### 3. screenshotapi.net (后备方案 2)
- **优点**: 简单易用，响应快速
- **限制**: 免费计划 100 张截图/月
- **官网**: https://screenshotapi.net/
- **配置**: 需要 API Token

## 🔧 环境变量配置

### Vercel 环境变量设置

在 Vercel Dashboard 中设置以下环境变量：

```bash
# 必需的基础配置
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# 可选：htmlcsstoimage.com API 密钥
HCTI_API_KEY=your_hcti_api_key_here

# 可选：screenshotapi.net API Token
SCREENSHOTAPI_TOKEN=your_screenshotapi_token_here
```

### 本地开发环境

创建 `.env.local` 文件：

```bash
# .env.local
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# 可选的第三方服务配置
HCTI_API_KEY=your_hcti_api_key_here
SCREENSHOTAPI_TOKEN=your_screenshotapi_token_here
```

## 📋 获取 API 密钥步骤

### htmlcsstoimage.com

1. 访问 https://htmlcsstoimage.com/
2. 点击 "Sign up" 注册账户
3. 登录后进入 Dashboard
4. 在 "API" 页面获取 User ID 和 API Key
5. 将 API Key 设置为 `HCTI_API_KEY` 环境变量

### screenshotapi.net

1. 访问 https://screenshotapi.net/
2. 点击 "Get API Token" 注册
3. 验证邮箱后登录
4. 在 Dashboard 中获取 API Token
5. 将 Token 设置为 `SCREENSHOTAPI_TOKEN` 环境变量

## 🚀 工作原理

截图服务按以下优先级尝试：

1. **Puppeteer** (主要方案)
   - 开发环境：使用本地浏览器
   - 生产环境：使用 @sparticuz/chromium-min + 外部 Chromium 二进制

2. **htmlcsstoimage** (后备方案 1)
   - 仅在生产环境且配置了 `HCTI_API_KEY` 时启用
   - Puppeteer 失败时自动尝试

3. **screenshotapi** (后备方案 2)
   - 仅在生产环境且配置了 `SCREENSHOTAPI_TOKEN` 时启用
   - 前两个方案都失败时尝试

## 📊 服务对比

| 服务 | 免费额度 | 响应速度 | 功能完整性 | 稳定性 |
|------|----------|----------|------------|--------|
| Puppeteer | 无限制 | 快 | 完整 | 中等 |
| htmlcsstoimage | 50/月 | 中等 | 良好 | 高 |
| screenshotapi | 100/月 | 快 | 基础 | 高 |

## 🔍 故障排除

### 常见问题

1. **所有服务都失败**
   ```
   所有截图方案都失败了
   ```
   - 检查网络连接
   - 验证 API 密钥是否正确
   - 确认目标 URL 可访问

2. **Puppeteer libnss3.so 错误**
   ```
   error while loading shared libraries: libnss3.so
   ```
   - 这是预期的，系统会自动切换到后备方案
   - 确保配置了第三方服务 API 密钥

3. **API 配额超限**
   ```
   API quota exceeded
   ```
   - 检查当月使用量
   - 考虑升级到付费计划
   - 配置多个后备服务

### 调试信息

在 Vercel 函数日志中查看：
- 可用服务列表
- 使用的截图源
- 错误详情和重试过程

## 💡 最佳实践

1. **配置多个后备服务**：提高可用性
2. **监控使用量**：避免超出免费额度
3. **缓存截图结果**：减少重复请求
4. **设置合理超时**：避免长时间等待
5. **记录服务使用情况**：便于优化和调试

## 🔄 升级建议

如果经常遇到截图问题，建议：

1. **升级 Vercel 计划**：获得更多资源和更长超时时间
2. **使用专业截图服务**：如 Bannerbear、Placid 等
3. **自建截图服务**：在 VPS 上部署 Puppeteer 服务
4. **使用 Playwright**：可能在某些环境中更稳定

---

**注意**: 第三方服务的免费额度有限，建议根据实际使用量选择合适的服务和计划。