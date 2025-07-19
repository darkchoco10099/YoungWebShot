# Vercel 部署指南

本项目已针对 Vercel 部署进行了优化，以下是部署说明和注意事项。

## 🚀 快速部署

1. **连接 GitHub 仓库**
   - 登录 [Vercel Dashboard](https://vercel.com/dashboard)
   - 点击 "New Project"
   - 导入你的 GitHub 仓库

2. **配置环境变量**
   ```
   NODE_ENV=production
   PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
   ```

3. **部署设置**
   - Build Command: `npm run vercel-build`
   - Output Directory: `.next`
   - Install Command: `npm install`

## 📋 技术优化

### 截图功能改进

- **无服务器适配**: 每次请求创建新的浏览器实例，避免内存泄漏
- **资源管理**: 自动清理浏览器和页面实例
- **超时优化**: 设置 30 秒超时，适应网络延迟
- **性能优化**: 禁用不必要的功能，提高截图速度

### Vercel 配置

- **函数超时**: 设置为 30 秒，确保有足够时间生成截图
- **区域选择**: 使用 `hnd1` (东京) 区域，提供更好的亚洲访问速度
- **Chromium 优化**: 使用 `@sparticuz/chromium` 包，专为无服务器环境优化

## ⚠️ 注意事项

1. **函数限制**
   - Vercel 免费版函数执行时间限制为 10 秒
   - Pro 版本可以设置最长 60 秒
   - 建议升级到 Pro 版本以获得更好的体验

2. **内存使用**
   - 截图功能需要较多内存
   - 复杂页面可能需要更长时间加载

3. **网络限制**
   - 某些网站可能阻止无头浏览器访问
   - 建议测试目标网站的兼容性

## 🔧 故障排除

### 常见问题

1. **超时错误**
   ```
   解决方案: 检查目标网站是否可访问，或增加超时时间
   ```

2. **内存不足**
   ```
   解决方案: 简化页面内容，或升级 Vercel 计划
   ```

3. **Chromium 启动失败**
   ```
   解决方案: 确保 @sparticuz/chromium 版本兼容
   ```

### 调试模式

在开发环境中，错误信息会显示详细信息。生产环境中，错误信息会被简化以保护系统安全。

## 📊 性能监控

建议在 Vercel Dashboard 中监控以下指标：
- 函数执行时间
- 内存使用情况
- 错误率
- 响应时间

## 🔄 更新部署

每次推送到主分支时，Vercel 会自动重新部署。确保在推送前测试所有功能。

---

如有问题，请查看 [Vercel 文档](https://vercel.com/docs) 或提交 Issue。