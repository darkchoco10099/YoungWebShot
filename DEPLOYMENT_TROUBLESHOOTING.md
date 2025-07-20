# 🚀 Vercel 部署故障排除指南

本文档专门解决 Young Web Shot 在 Vercel 部署过程中可能遇到的问题。

## 🔍 常见部署错误

### 1. Chromium 可执行文件路径错误

**错误信息**:
```
Screenshot generation failed: Error: The input directory "/var/task/.next/server/app/api/bin" does not exist.
```

**原因分析**:
- `@sparticuz/chromium` 包未正确导入
- Chromium 可执行文件路径解析失败
- Vercel 环境变量配置不正确

**解决方案**:

1. **检查依赖安装**:
   ```bash
   npm install @sparticuz/chromium puppeteer-core
   ```

2. **验证环境变量**:
   确保 `vercel.json` 包含:
   ```json
   {
     "env": {
       "PUPPETEER_SKIP_CHROMIUM_DOWNLOAD": "true"
     },
     "build": {
       "env": {
         "PUPPETEER_SKIP_CHROMIUM_DOWNLOAD": "true"
       }
     }
   }
   ```

3. **检查导入语句**:
   在 `lib/chromium-options.ts` 中确保:
   ```typescript
   import chromium from '@sparticuz/chromium';
   ```

### 2. 内存不足错误

**错误信息**:
```
Function exceeded memory limit
Process exited with code 137
```

**解决方案**:

1. **增加内存限制**:
   在 `vercel.json` 中设置:
   ```json
   {
     "functions": {
       "app/api/screenshot/route.ts": {
         "maxDuration": 30,
         "memory": 1024
       }
     }
   }
   ```

2. **优化 Chromium 参数**:
   添加内存优化参数:
   ```typescript
   args: [
     '--no-sandbox',
     '--disable-setuid-sandbox',
     '--disable-dev-shm-usage',
     '--disable-gpu',
     '--single-process',
     '--no-zygote'
   ]
   ```

### 3. 超时错误

**错误信息**:
```
Function execution timed out
TimeoutError: Navigation timeout
```

**解决方案**:

1. **增加超时时间**:
   ```json
   {
     "functions": {
       "app/api/screenshot/route.ts": {
         "maxDuration": 30
       }
     }
   }
   ```

2. **优化页面加载**:
   ```typescript
   await page.goto(url, {
     waitUntil: 'domcontentloaded', // 更快的加载策略
     timeout: 25000
   });
   ```

### 4. 权限错误

**错误信息**:
```
Error: Failed to launch the browser process
Permission denied
```

**解决方案**:

确保包含必要的权限参数:
```typescript
args: [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage'
]
```

## 🛠️ 调试步骤

### 1. 本地验证

在部署前，确保本地环境正常工作:

```bash
# 安装依赖
npm install

# 本地测试
npm run dev

# 测试截图 API
curl "http://localhost:3000/api/screenshot?url=example.com"
```

### 2. 生产环境模拟

```bash
# 设置生产环境变量
export NODE_ENV=production
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# 构建项目
npm run build

# 启动生产服务器
npm start
```

### 3. Vercel 日志检查

1. **访问 Vercel Dashboard**
2. **查看 Functions 日志**
3. **检查构建日志**
4. **监控运行时错误**

### 4. 添加调试日志

在 `lib/chromium-options.ts` 中添加详细日志:

```typescript
export async function getOptions(isDev: boolean) {
  console.log('Environment:', { isDev, NODE_ENV: process.env.NODE_ENV });
  
  if (!isDev) {
    try {
      const executablePath = await chromium.executablePath();
      console.log('Chromium executable path:', executablePath);
      console.log('Chromium args:', chromium.args);
      
      // 验证文件是否存在
      const fs = require('fs');
      if (fs.existsSync(executablePath)) {
        console.log('Chromium executable exists');
      } else {
        console.error('Chromium executable not found at:', executablePath);
      }
      
      return {
        // ... 配置
      };
    } catch (error) {
      console.error('Chromium setup error:', error);
      throw error;
    }
  }
}
```

## 📋 部署检查清单

在部署到 Vercel 之前，请确认以下项目:

- [ ] ✅ `@sparticuz/chromium` 已安装
- [ ] ✅ `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` 已设置
- [ ] ✅ `vercel.json` 配置正确
- [ ] ✅ 内存限制设置为 1024MB
- [ ] ✅ 超时时间设置为 30 秒
- [ ] ✅ 本地生产环境测试通过
- [ ] ✅ 导入语句正确
- [ ] ✅ 错误处理完善

## 🔧 高级配置

### 1. 区域优化

根据用户地理位置选择最近的区域:

```json
{
  "regions": ["hnd1", "iad1", "sfo1"]
}
```

### 2. 缓存策略

为截图结果添加缓存:

```typescript
return new NextResponse(file, {
  headers: {
    'Content-Type': 'image/png',
    'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    'CDN-Cache-Control': 'max-age=86400'
  }
});
```

### 3. 错误监控

集成错误监控服务:

```typescript
try {
  const screenshot = await getScreenshot(url, isDev);
  return screenshot;
} catch (error) {
  // 发送错误到监控服务
  console.error('Screenshot error:', {
    url,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  throw error;
}
```

## 🆘 获取帮助

如果问题仍然存在，请提供以下信息：

1. **错误日志** - 完整的错误堆栈
2. **部署配置** - `vercel.json` 内容
3. **环境信息** - Node.js 版本、依赖版本
4. **测试 URL** - 尝试截图的网址
5. **重现步骤** - 详细的操作步骤

### 联系方式

- 📧 **GitHub Issues**: [项目 Issues 页面](https://github.com/your-username/young-web-shot/issues)
- 💬 **讨论区**: [GitHub Discussions](https://github.com/your-username/young-web-shot/discussions)

---

## 📚 相关资源

- [Vercel Functions 文档](https://vercel.com/docs/functions)
- [@sparticuz/chromium 文档](https://github.com/Sparticuz/chromium)
- [Puppeteer 文档](https://pptr.dev/)
- [Next.js API Routes 文档](https://nextjs.org/docs/api-routes/introduction)

---

*最后更新: 2024年12月*