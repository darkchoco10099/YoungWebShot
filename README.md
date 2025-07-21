# YoungWebShot 📸

一个基于 Cloudflare Worker 的网页截图服务，支持单张和批量截图，集成 Bark 推送通知功能。

## ✨ 功能特性

- 🖼️ **单张截图**: 快速生成任意网页的高质量截图
- 📊 **批量截图**: 一次性处理最多 10 个 URL 的批量截图请求
- 📱 **Bark 通知**: 支持部署状态和截图完成的实时推送通知
- 🎨 **美观界面**: 现代化的 Web 界面，支持响应式设计
- ⚡ **高性能**: 基于 Cloudflare Worker 和 Puppeteer 技术
- 🔧 **易部署**: 一键部署到 Cloudflare Workers

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-username/YoungWebShot.git
cd YoungWebShot
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制环境变量模板：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置必要的环境变量：

```env
# Cloudflare 配置
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ACCOUNT_ID=your_account_id

# Bark 推送通知 (可选)
BARK_URL=https://api.day.app/your_bark_key
```

### 4. 部署到 Cloudflare Workers

```bash
npx wrangler deploy
```

### 5. 测试部署

运行测试脚本来验证部署并触发 Bark 通知：

```bash
./test-deployment.sh
```

## 📱 Bark 通知配置

### 获取 Bark Key

1. 在 App Store 下载 [Bark](https://apps.apple.com/cn/app/bark-customed-notifications/id1403753865) 应用
2. 打开应用获取您的 Bark Key
3. 将 Key 配置到环境变量中：`https://api.day.app/your_bark_key`

### 通知类型

- 🚀 **部署成功**: Worker 成功部署时发送
- 📸 **截图完成**: 单张截图生成完成时发送
- 📊 **批量截图**: 批量截图任务完成时发送统计信息
- ✅ **服务状态**: 健康检查时的服务状态通知

## 🔧 API 接口

### 单张截图

```http
GET /api/screenshot?url=https://example.com
```

### 批量截图

```http
POST /api/screenshots/batch
Content-Type: application/json

{
  "urls": [
    "https://example1.com",
    "https://example2.com"
  ]
}
```

### 健康检查

```http
GET /health
GET /health?notify=true  # 发送状态通知
GET /health?startup=true # 发送部署成功通知
```

## 🛠️ 开发

### 本地开发

```bash
npx wrangler dev
```

### 预览部署

```bash
npx wrangler deploy --env preview
```

## 📝 更新日志

### v2.0.0
- ✨ 新增 Bark 推送通知功能
- 📊 新增批量截图支持
- 🎨 优化用户界面
- 🔧 移除独立部署脚本，集成到 Worker 中

### v1.0.0
- 🎉 初始版本发布
- 📸 基础截图功能
- 🌐 Web 界面

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**享受截图服务！** 📸✨