# 截图服务配置指南

本项目支持多种截图实现方式，提供可靠的后备方案来解决 Cloudflare Pages 环境中的 Chromium 依赖问题。

## 🎯 支持的截图服务

### Puppeteer + @sparticuz/chromium-min (主要方案)
- **优点**: 完全控制，功能强大，免费
- **缺点**: 在某些无服务器环境中可能遇到依赖问题
- **配置**: 无需额外配置

## 🔧 环境变量配置

### Cloudflare Pages 环境变量设置

在 Cloudflare Pages Dashboard 中设置以下环境变量：

```bash
# 必需的基础配置
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
```

### 本地开发环境

创建 `.env.local` 文件：

```bash
# .env.local
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
```

## 🚀 工作原理

截图服务使用 Puppeteer + @sparticuz/chromium-min 方案：

- **开发环境**: 使用本地浏览器
- **生产环境**: 使用 @sparticuz/chromium-min + 外部 Chromium 二进制
- **高质量**: 使用真实的 Chromium 浏览器引擎
- **完全控制**: 支持自定义视口、用户代理等参数
- **无外部依赖**: 不依赖第三方API服务
- **成本效益**: 完全免费，无使用限制

## 📊 服务特性

| 特性 | 说明 |
|------|------|
| 免费额度 | 无限制 |
| 响应速度 | 快速 |
| 功能完整性 | 完整 |
| 稳定性 | 高 |

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

在 Cloudflare Pages 函数日志中查看：
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

1. **优化函数配置**：调整内存和超时设置以获得更好性能
2. **使用专业截图服务**：如 Bannerbear、Placid 等
3. **自建截图服务**：在 VPS 上部署 Puppeteer 服务
4. **使用 Playwright**：可能在某些环境中更稳定

---

**注意**: 第三方服务的免费额度有限，建议根据实际使用量选择合适的服务和计划。