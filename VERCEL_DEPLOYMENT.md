# Vercel 部署指南

本项目已针对 Vercel 部署进行了优化配置，解决了 Chromium 路径问题。

## 🚀 快速部署

### 1. 连接 GitHub 仓库
- 登录 [Vercel Dashboard](https://vercel.com/dashboard)
- 点击 "New Project"
- 选择你的 GitHub 仓库
- Vercel 会自动检测配置并开始部署

### 2. 环境变量（自动配置）
项目已通过 `vercel.json` 自动配置所需环境变量：
```json
{
  "env": {
    "NODE_ENV": "production",
    "PUPPETEER_SKIP_CHROMIUM_DOWNLOAD": "true",
    "PUPPETEER_EXECUTABLE_PATH": "/opt/nodejs/node_modules/@sparticuz/chromium/bin"
  }
}
```

## 🔧 关键配置文件

### vercel.json

```json
{
  "functions": {
    "app/api/screenshot/route.ts": {
      "maxDuration": 30,
      "memory": 3008
    }
  },
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

### next.config.mjs
```javascript
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@sparticuz/chromium'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // 确保 @sparticuz/chromium 不被外部化
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals = config.externals.filter(
          (external) => {
            if (typeof external === 'string') {
              return external !== '@sparticuz/chromium';
            }
            return true;
          }
        );
      }
    }
    return config;
  },
};

export default nextConfig;
```

### package.json 依赖
```json
{
  "dependencies": {
    "@sparticuz/chromium": "^126.0.0",
    "puppeteer-core": "^23.0.0"
  }
}
```

## 🛠️ 问题修复说明

### 原始错误
```
Error: The input directory "/var/task/.next/server/app/api/bin" does not exist.
```

### 最新修复措施 (v3.0)

1. **升级依赖包版本**
   - `@sparticuz/chromium`: `^126.0.0`
   - `puppeteer-core`: `^23.0.0`

2. **简化 Vercel 配置**
   - 内存设置为 3008MB
   - 移除可能导致冲突的环境变量（`NODE_ENV`, `FONTCONFIG_PATH`, `LD_LIBRARY_PATH`）
   - 移除 `regions` 配置以避免部署限制
   - 仅保留必要的 `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true`

3. **优化 Next.js Webpack 配置**
   - 改进 externals 过滤逻辑，确保 `@sparticuz/chromium` 被正确打包
   - 添加类型检查以避免配置错误

4. **增强错误处理**
   - 直接使用 `chromium.executablePath()` 获取路径
   - 添加详细的调试信息和错误日志
   - 本地构建测试通过

## 📊 性能配置

### 函数配置
- **最大执行时间**: 30秒
- **内存分配**: 3008MB
- **地区**: 东京(hnd1)、弗吉尼亚(iad1)、旧金山(sfo1)

### 优化建议
1. **缓存策略**: 考虑实现截图缓存
2. **并发控制**: 避免同时处理过多请求
3. **错误重试**: 实现智能重试机制

## 🔍 监控和调试

### 查看部署日志
1. 进入 Vercel Dashboard
2. 选择项目 → Functions 标签
3. 查看 `screenshot` 函数的执行日志

### 常见日志信息
```
Chromium executable path: /opt/nodejs/node_modules/@sparticuz/chromium/bin
Environment variables: {
  NODE_ENV: 'production',
  PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: 'true',
  PUPPETEER_EXECUTABLE_PATH: '/opt/nodejs/node_modules/@sparticuz/chromium/bin'
}
```

## ⚠️ 常见问题

### 1. 部署失败
**症状**: 构建过程中出错
**解决**: 
- 确保 `package.json` 中的依赖版本正确
- 检查 `next.config.mjs` 配置

### 2. 函数超时
**症状**: 截图请求超过30秒
**解决**:
- 检查目标网站加载速度
- 考虑增加 `maxDuration` 设置

### 3. 内存不足
**症状**: 函数因内存不足而终止
**解决**:
- 当前已配置3008MB，通常足够
- 如仍不足，可考虑优化截图参数

### 4. Chromium 路径错误
**症状**: 找不到 Chromium 可执行文件
**解决**:
- 确认 `@sparticuz/chromium` 版本为 `^126.0.0`
- 检查 `vercel.json` 中的环境变量配置

## 🎯 测试部署

部署完成后，测试 API 接口：

```bash
curl "https://your-domain.vercel.app/api/screenshot?url=example.com"
```

预期响应：
```json
{
  "success": true,
  "url": "https://pub-xxxxxxxx.r2.dev/screenshots/screenshot_abc123_1234567890.png",
  "originalUrl": "https://example.com"
}
```

## 📚 更多资源

- [Vercel 函数文档](https://vercel.com/docs/functions)
- [@sparticuz/chromium 文档](https://github.com/Sparticuz/chromium)
- [Puppeteer 文档](https://pptr.dev/)

如遇到其他问题，请参考 [DEPLOYMENT_TROUBLESHOOTING.md](./DEPLOYMENT_TROUBLESHOOTING.md)。