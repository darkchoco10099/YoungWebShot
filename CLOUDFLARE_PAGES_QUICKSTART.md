# 🚀 Cloudflare Pages 快速开始指南

## 📋 前置要求

- GitHub 账户
- Cloudflare 账户（免费）
- Node.js 18+ 本地环境（用于测试）

## 🎯 5分钟部署步骤

### 1️⃣ 准备代码仓库

```bash
# 克隆或 Fork 项目
git clone https://github.com/your-username/young-web-shot.git
cd young-web-shot

# 安装依赖并测试
npm install
npm run dev
```

### 2️⃣ 连接到 Cloudflare Pages

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 点击左侧菜单 **"Pages"**
3. 点击 **"Create a project"**
4. 选择 **"Connect to Git"**
5. 授权并选择你的 GitHub 仓库

### 3️⃣ 配置构建设置

在部署配置页面填入：

| 设置项 | 值 |
|--------|----|
| **Project name** | `young-web-shot` |
| **Production branch** | `main` |
| **Framework preset** | `Next.js` |
| **Build command** | `npm run pages:build` |
| **Build output directory** | `.next` |
| **Root directory** | `/` |

### 4️⃣ 设置环境变量

在 **"Environment variables"** 部分添加：

```
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
NODE_ENV=production
```

### 5️⃣ 部署并测试

1. 点击 **"Save and Deploy"**
2. 等待构建完成（约2-3分钟）
3. 获取部署URL：`https://young-web-shot.pages.dev`
4. 测试API：
   ```bash
   curl "https://young-web-shot.pages.dev/api/screenshot?url=example.com"
   ```

## ✅ 验证部署成功

### 检查清单

- [ ] 🌐 网站可以正常访问
- [ ] 📸 截图API返回正确响应
- [ ] 🎨 仪表板页面正常显示
- [ ] 🔧 错误处理正常工作

### 测试命令

```bash
# 基础功能测试
curl "https://your-domain.pages.dev/api/screenshot?url=https://example.com"

# 预期响应
{
  "success": true,
  "imageUrl": "https://cdn.example.com/screenshots/abc123.png",
  "uploadedAt": "2024-01-01T12:00:00Z"
}
```

## 🔧 常见问题解决

### 构建失败

**问题**: Build failed with exit code 1

**解决**:
1. 检查 `package.json` 中的构建脚本
2. 确认环境变量设置正确
3. 查看构建日志中的具体错误

### 函数超时

**问题**: Function execution timed out

**解决**:
1. 优化截图参数
2. 检查目标网站响应速度
3. 考虑实现缓存机制

### 依赖问题

**问题**: Module not found errors

**解决**:
1. 确认 `@sparticuz/chromium` 版本为 `^130.0.0`
2. 运行 `npm ci` 重新安装依赖
3. 检查 `package-lock.json` 是否提交

## 🚀 进阶配置

### 自定义域名

1. 在 Cloudflare Pages 项目设置中
2. 点击 **"Custom domains"**
3. 添加你的域名
4. 按照提示配置 DNS 记录

### 环境分支

```bash
# 创建预览环境
git checkout -b preview
git push origin preview

# Cloudflare Pages 会自动创建预览部署
# URL: https://preview.young-web-shot.pages.dev
```

### 性能监控

1. 在 Cloudflare Dashboard 中查看 **Analytics**
2. 监控请求量、响应时间、错误率
3. 设置告警通知

## 📚 相关文档

- [完整部署指南](./CLOUDFLARE_PAGES_DEPLOYMENT.md)
- [API 文档](./README.md#api-文档)
- [故障排除](./README.md#故障排除)

## 🆘 获取帮助

如果遇到问题：

1. 查看 [Issues](https://github.com/your-username/young-web-shot/issues)
2. 提交新的 Issue 并包含：
   - 错误日志
   - 构建配置
   - 复现步骤

---

**🎉 恭喜！你已经成功部署了 Young Web Shot 到 Cloudflare Pages！**