# Cloudflare Worker 部署指南

本项目已重构为 Cloudflare Worker 脚本，提供完整的网页截图服务，包含前端界面和 API 接口。

## 🚀 快速开始

### 1. 安装依赖

```bash
# 使用 Worker 专用的 package.json
cp package-worker.json package.json
npm install
```

### 2. 配置 Wrangler

确保已安装 Wrangler CLI：

```bash
npm install -g wrangler
wrangler login
```

### 3. 本地开发

```bash
# 启动本地开发服务器
npm run dev

# 或使用本地模式（不连接 Cloudflare）
npm run test
```

### 4. 部署到生产环境

```bash
# 部署到生产环境
npm run deploy

# 部署到预览环境
npm run deploy:preview
```

## 📁 文件结构

```
├── worker.js                 # 主 Worker 脚本
├── wrangler-worker.toml      # Worker 配置文件
├── package-worker.json       # Worker 依赖配置
└── WORKER_DEPLOYMENT.md      # 本文档
```

## 🔧 配置说明

### wrangler-worker.toml

- **浏览器绑定**: 配置了 `MYBROWSER` 绑定，用于 Puppeteer
- **兼容性**: 启用 `nodejs_compat` 标志
- **资源限制**: CPU 30秒，内存 128MB

### 环境变量

- `NODE_ENV`: 设置为 `production`
- 可根据需要添加其他环境变量

## 🌐 功能特性

### 前端界面

- **响应式设计**: 基于 Tailwind CSS
- **实时截图**: 输入 URL 即可生成截图
- **历史记录**: 本地存储截图历史
- **下载功能**: 支持截图下载
- **错误处理**: 友好的错误提示

### API 接口

#### 截图 API

```
GET /api/screenshot?url=<target_url>
```

**参数**:
- `url`: 目标网页 URL（必需）

**响应**:
```json
{
  "success": true,
  "url": "https://image.example.com/screenshot.png",
  "originalUrl": "https://example.com",
  "metadata": {
    "source": "puppeteer",
    "size": 123456,
    "format": "png"
  }
}
```

#### 健康检查

```
GET /health
```

**响应**:
```json
{
  "status": "ok",
  "timestamp": "2024-12-01T12:00:00.000Z",
  "service": "young-web-shot-worker"
}
```

## 🔍 技术实现

### 核心组件

1. **ScreenshotService**: 截图服务类
   - Puppeteer 浏览器控制
   - 图片上传到图床
   - URL 验证和标准化

2. **Router**: 路由处理器
   - 支持精确匹配和模式匹配
   - RESTful API 路由

3. **HTML Template**: 完整的前端界面
   - 原生 JavaScript 实现
   - 本地存储管理
   - 响应式设计

### 截图流程

1. 接收 URL 参数
2. 验证和标准化 URL
3. 启动 Puppeteer 浏览器
4. 设置视口和用户代理
5. 导航到目标页面
6. 等待页面加载完成
7. 截取屏幕截图
8. 上传到图床服务
9. 返回图片 URL

## 🛠️ 开发指南

### 本地调试

```bash
# 查看实时日志
npm run tail

# 本地开发模式
npm run dev
```

### 自定义配置

1. **修改截图参数**:
   ```javascript
   await page.setViewport({ 
       width: 1920,  // 自定义宽度
       height: 1080, // 自定义高度
       deviceScaleFactor: 2 // 高分辨率
   });
   ```

2. **更换图床服务**:
   ```javascript
   // 在 uploadScreenshotToImageBed 方法中
   // 修改上传 URL 和参数
   const uploadResponse = await fetch('YOUR_IMAGE_BED_URL', {
       method: 'POST',
       body: formData,
   });
   ```

3. **添加新路由**:
   ```javascript
   // 在 fetch 函数中添加
   router.get('/api/new-endpoint', async (request) => {
       // 处理逻辑
       return new Response(JSON.stringify(result));
   });
   ```

## 📊 性能优化

### 资源管理

- **浏览器复用**: 使用 `keep_alive` 保持浏览器连接
- **内存控制**: 及时关闭页面和浏览器实例
- **超时设置**: 合理的页面加载超时时间

### 缓存策略

- **前端缓存**: 使用 localStorage 存储历史记录
- **CDN 缓存**: 图床服务提供 CDN 加速

## 🔒 安全考虑

### URL 验证

- 严格的 URL 格式验证
- 防止 SSRF 攻击
- 用户代理设置

### 资源限制

- CPU 时间限制: 30 秒
- 内存限制: 128MB
- 请求超时: 25 秒

## 🚨 故障排除

### 常见问题

1. **浏览器启动失败**
   ```
   Error: Browser binding not found
   ```
   **解决**: 确保 wrangler.toml 中配置了浏览器绑定

2. **截图超时**
   ```
   Error: TimeoutError
   ```
   **解决**: 增加超时时间或检查目标网站可访问性

3. **图片上传失败**
   ```
   Error: 图床上传失败
   ```
   **解决**: 检查图床服务状态和网络连接

### 调试技巧

```bash
# 查看详细日志
wrangler tail --format pretty

# 本地测试模式
wrangler dev --local --port 8787
```

## 📈 监控和日志

### 日志记录

- 截图请求日志
- 错误详情记录
- 性能指标统计

### 监控指标

- 请求成功率
- 平均响应时间
- 错误类型分布

## 🔄 迁移指南

### 从 Next.js 版本迁移

1. **API 兼容性**: 保持相同的 API 接口
2. **功能对等**: 所有原有功能都已实现
3. **性能提升**: Worker 版本响应更快
4. **成本优化**: 按请求计费，更经济

### 数据迁移

- 历史记录存储在浏览器本地
- 无需服务器端数据迁移
- 用户体验保持一致

## 📞 支持

如有问题或建议，请：

1. 查看 [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
2. 检查 [Puppeteer 文档](https://developers.cloudflare.com/browser-rendering/)
3. 提交 Issue 或 Pull Request

---

**注意**: 确保你的 Cloudflare 账户已启用 Browser Rendering API 功能。