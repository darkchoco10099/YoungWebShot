# 🌐 Young Web Shot

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-14.2.3-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Puppeteer-23.0.0-green?style=for-the-badge&logo=puppeteer" alt="Puppeteer">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Cloudflare_Pages-Ready-orange?style=for-the-badge&logo=cloudflare" alt="Cloudflare Pages">
</div>

<div align="center">
  <h3>🚀 现代化网页截图工具</h3>
  <p>基于 Next.js 和 Puppeteer 构建的高性能网页截图服务，支持多浏览器、智能检测、一键部署</p>
</div>

---

## ✨ 核心特性

### 🎯 **智能截图引擎**
- 🔥 **多浏览器支持** - 自动检测并支持 Chrome、Chromium、Edge、Safari
- ⚡ **高性能处理** - 优化的截图算法，快速生成高质量图片
- 🛡️ **智能错误处理** - 详细的错误诊断和用户友好的提示信息
- 🌐 **URL 智能解析** - 自动标准化和验证输入的网址

### ☁️ **云端图床集成**
- 📤 **自动上传** - 截图完成后自动上传到图床服务
- 🚀 **CDN 加速** - 基于 Cloudflare R2 的全球 CDN 分发
- 🔗 **永久链接** - 返回稳定的图片 URL，支持长期访问
- 💾 **无本地存储** - 减少服务器存储压力，提高性能

### 🎨 **现代化界面**
- 💎 **精美 UI 设计** - 基于 shadcn/ui 和 Tailwind CSS 的现代界面
- 📱 **响应式布局** - 完美适配桌面端和移动端
- 🌙 **深色模式支持** - 自适应主题切换
- 📊 **可视化仪表板** - 直观的截图管理和历史记录

### 🚀 **部署友好**
- ☁️ **Cloudflare Pages 优化** - 专为 Cloudflare Pages 边缘计算优化
- 🔧 **环境自适应** - 开发和生产环境自动配置
- 📦 **零配置部署** - 一键部署到云平台
- 🔍 **浏览器自动检测** - 智能检测系统可用浏览器

---

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **Next.js** | 14.2.3 | React 全栈框架 |
| **TypeScript** | 5.0+ | 类型安全开发 |
| **Puppeteer Core** | 23.0.0 | 浏览器自动化 |
| **Tailwind CSS** | 3.4.1 | 原子化 CSS 框架 |
| **shadcn/ui** | Latest | 现代 UI 组件库 |
| **Radix UI** | Latest | 无障碍 UI 基础组件 |
| **Lucide React** | Latest | 精美图标库 |

---

## 🚀 快速开始

### 📋 环境要求

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0 或 **yarn** >= 1.22.0
- **浏览器**: Chrome、Chromium、Edge 或 Safari (macOS)

### 🔧 本地开发

1. **克隆项目**
   ```bash
   git clone https://github.com/your-username/young-web-shot.git
   cd young-web-shot
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或
   yarn install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   # 或
   yarn dev
   ```

4. **访问应用**
   
   打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 🌐 生产部署

#### Cloudflare Pages 部署 (推荐)

> 🎉 **最新更新**: 已完全迁移到 Cloudflare Pages，享受更快的边缘计算性能！

1. **Fork 本仓库**
2. **连接到 Cloudflare Pages**
3. **自动部署**
   - Cloudflare Pages 会自动检测 Next.js 项目
   - 使用项目中的 `wrangler.toml` 配置
   - 自动安装 `@sparticuz/chromium` 依赖

4. **验证部署**
   ```bash
   curl "https://your-app.pages.dev/api/screenshot?url=example.com"
   ```

**🔧 优化特性**:
- ✅ 全球边缘计算网络，响应更快
- ✅ 升级 `@sparticuz/chromium` 到 v130.0.0
- ✅ 优化内存和性能配置
- ✅ 改进错误处理和日志记录

> ⚠️ **部署问题？** 查看 [Cloudflare Pages 部署指南](./CLOUDFLARE_PAGES_DEPLOYMENT.md)

**环境变量配置**

| 变量名 | 值 | 说明 |
|--------|----|----------|
| `NODE_ENV` | `production` | 生产环境标识 |
| `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD` | `true` | 跳过 Chromium 下载 |

#### 其他平台部署

- **Vercel**: 支持（需要配置函数）
- **Netlify**: 支持（需要配置函数）
- **Railway**: 支持
- **Docker**: 提供 Dockerfile

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

---

## 📖 API 文档

### 截图 API

**端点**: `GET /api/screenshot`

**参数**:
- `url` (必需): 要截图的网页地址

**示例请求**:
```bash
# 基础用法
curl "http://localhost:3000/api/screenshot?url=example.com"

# 完整 URL
curl "http://localhost:3000/api/screenshot?url=https://www.google.com"
```

**响应**:
- **成功**: 返回包含图片 URL 的 JSON 数据
- **失败**: 返回 JSON 格式的错误信息

**成功响应示例**:
```json
{
  "success": true,
  "imageUrl": "https://cdn.example.com/screenshots/abc123.png",
  "uploadedAt": "2024-01-01T12:00:00Z"
}
```

**错误代码**:
| 状态码 | 说明 |
|--------|------|
| 400 | 缺少 URL 参数或格式无效 |
| 404 | 网站无法访问 |
| 408 | 请求超时 |
| 503 | 浏览器不可用或服务暂不可用 |
| 500 | 服务器内部错误 |

---

## 🎯 使用指南

### 🖥️ Web 界面使用

1. **访问仪表板**: 打开 `/dashboard` 页面
2. **输入网址**: 在输入框中输入要截图的网页地址
3. **生成截图**: 点击「截图」按钮或按 Enter 键
4. **管理截图**: 查看、下载或删除历史截图记录

### 🔧 API 集成

```javascript
// JavaScript 示例
async function takeScreenshot(url) {
  try {
    const response = await fetch(`/api/screenshot?url=${encodeURIComponent(url)}`);
    
    if (response.ok) {
      const result = await response.json();
      return result.imageUrl; // 返回图床链接
    } else {
      const error = await response.json();
      throw new Error(error.error);
    }
  } catch (error) {
    console.error('截图失败:', error);
    throw error;
  }
}

// 使用示例
takeScreenshot('https://example.com')
  .then(imageUrl => {
    console.log('截图成功，图片链接:', imageUrl);
    // imageUrl 是永久可访问的图床链接
  })
  .catch(error => {
    console.error('截图失败:', error);
  });
```

---

## ⚙️ 配置说明

### 环境变量

创建 `.env.local` 文件:

```env
# 开发环境配置
NODE_ENV=development

# Cloudflare Pages 部署配置 (自动设置)
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# 图床服务配置
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET_NAME=your_bucket_name
CLOUDFLARE_R2_ENDPOINT=your_r2_endpoint
CLOUDFLARE_R2_PUBLIC_URL=your_public_cdn_url
```

### 浏览器配置

项目支持多种浏览器，优先级顺序：
1. **Google Chrome** (推荐)
2. **Chromium**
3. **Microsoft Edge**
4. **Safari** (仅 macOS，功能有限)

### 性能优化

- **超时设置**: 30秒页面加载超时
- **视口大小**: 1280x720 (可自定义)
- **缓存策略**: 生产环境启用长期缓存
- **资源清理**: 自动释放浏览器实例

---

## 🔧 开发指南

### 项目结构

```
young-web-shot/
├── app/                    # Next.js App Router
│   ├── api/
│   │   └── screenshot/     # 截图 API 路由
│   ├── dashboard/          # 仪表板页面
│   ├── globals.css         # 全局样式
│   ├── layout.tsx          # 根布局
│   └── page.tsx           # 首页
├── components/             # UI 组件
│   └── ui/                # shadcn/ui 组件
├── lib/                   # 核心库
│   ├── chromium.ts        # 截图引擎
│   ├── chromium-options.ts # 浏览器配置
│   └── utils.ts           # 工具函数
├── public/                # 静态资源
├── .env.example           # 环境变量示例
├── wrangler.toml          # Cloudflare Pages 配置
└── README.md              # 项目文档
```

### 核心模块

#### 截图引擎 (`lib/chromium.ts`)
- 浏览器实例管理
- 页面截图生成
- 错误处理和资源清理

#### 浏览器配置 (`lib/chromium-options.ts`)
- 多浏览器支持
- 环境自适应配置
- 浏览器可用性检测

### 自定义开发

```typescript
// 扩展截图选项
interface ScreenshotOptions {
  width?: number;
  height?: number;
  fullPage?: boolean;
  quality?: number; // 仅 JPEG 格式
}

// 自定义截图函数
export async function customScreenshot(
  url: string, 
  options: ScreenshotOptions = {}
) {
  // 实现自定义截图逻辑
}
```

---

## 🐛 故障排除

### 常见问题

#### 1. 浏览器未找到
```
错误: Chrome/Chromium browser not found
```
**解决方案**:
- 安装 [Google Chrome](https://www.google.com/chrome/)
- 或安装 [Chromium](https://www.chromium.org/getting-involved/download-chromium/)
- macOS 用户可使用系统自带的 Safari

#### 2. 截图质量问题
```
错误: png screenshots do not support 'quality'
```
**解决方案**: PNG 格式不支持质量参数，已在代码中自动处理

#### 3. 网络超时
```
错误: TimeoutError: Navigation timeout
```
**解决方案**:
- 检查网络连接
- 确认目标网站可访问
- 增加超时时间配置

#### 4. Cloudflare Pages 部署问题
**解决方案**:
- 确保设置了 `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true`
- 检查 `wrangler.toml` 配置
- 查看部署日志排查具体错误

### 调试模式

```bash
# 启用详细日志
DEBUG=puppeteer:* npm run dev

# 查看浏览器检测信息
node -e "console.log(require('./lib/chromium-options').checkBrowserAvailability())"
```

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 贡献方式

1. **🐛 报告 Bug**: 在 [Issues](https://github.com/your-username/young-web-shot/issues) 中报告问题
2. **💡 功能建议**: 提出新功能想法和改进建议
3. **📝 文档改进**: 完善文档和示例代码
4. **🔧 代码贡献**: 提交 Pull Request

### 开发流程

1. Fork 项目
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 创建 Pull Request

### 代码规范

- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 配置规范
- 添加适当的注释和文档
- 确保所有测试通过

---

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE) - 查看 LICENSE 文件了解详情。

---

## 🙏 致谢

感谢以下开源项目的支持：

- [Next.js](https://nextjs.org/) - React 全栈框架
- [Puppeteer](https://pptr.dev/) - 浏览器自动化工具
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [shadcn/ui](https://ui.shadcn.com/) - 现代 React 组件库
- [Radix UI](https://www.radix-ui.com/) - 无障碍 UI 基础组件
- [Lucide](https://lucide.dev/) - 精美的图标库

---

<div align="center">
  <p>如果这个项目对你有帮助，请给它一个 ⭐️</p>
  <p>Made with ❤️ by <a href="https://github.com/your-username">Your Name</a></p>
</div>