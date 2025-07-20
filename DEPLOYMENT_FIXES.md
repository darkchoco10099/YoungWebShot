# 🔧 Vercel 部署问题修复指南

## 🚨 常见部署失败原因

### 1. 构建配置问题
**症状**: "All checks have failed" 或构建过程中断

**可能原因**:
- `next.config.mjs` 中的 webpack 配置错误
- 环境变量配置冲突
- 依赖包版本不兼容

### 2. 内存和超时限制
**症状**: 函数执行超时或内存不足

**解决方案**:
- 确保 `vercel.json` 中设置了足够的内存 (3008MB)
- 设置合适的超时时间 (30秒)

### 3. Chromium 路径问题
**症状**: "/var/task/.next/server/app/api/bin does not exist"

**解决方案**:
- 使用最新版本的 `@sparticuz/chromium` (^126.0.0)
- 确保 webpack 配置正确处理外部包

## 🛠️ 最新修复措施 (v4.0) - 多重截图方案

### 🚀 全新解决方案：多重后备截图服务

#### 1. 架构重构
- 创建了 `lib/screenshot-service.ts` 多重截图服务
- 支持 3 种截图实现方式，提供完整的后备机制
- 智能故障转移，确保截图功能的高可用性

#### 2. 支持的截图方案

**主要方案：Puppeteer + @sparticuz/chromium-min**
- 使用轻量级 `@sparticuz/chromium-min` 替代完整版本
- 配置外部 Chromium 二进制文件 (GitHub CDN)
- 添加 `--single-process` 和 `--disable-features=site-per-process` 参数

**解决方案：优化 Puppeteer 配置**
- 使用 @sparticuz/chromium-min 内置的 Chromium
- 移除外部 URL 依赖
- 确保在 Vercel 环境中的稳定性

#### 3. 关键技术改进

**依赖包优化：**
```json
{
  "@sparticuz/chromium-min": "^130.0.0",
  "puppeteer-core": "^23.8.0"
}
```

**Chromium 配置优化：**
```javascript
// 生产环境使用外部 Chromium 二进制
executablePath: 'https://github.com/Sparticuz/chromium/releases/download/v130.0.0/chromium-v130.0.0-pack.tar'

// 新增关键启动参数
'--single-process',
'--disable-features=site-per-process'
```

**API 路由增强：**
- 智能服务选择和故障转移
- 详细的错误日志和调试信息
- 返回截图元数据（来源、大小、格式等）

#### 4. 环境变量配置

**必需配置：**
```bash
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
```



### 验证状态
- ✅ 本地依赖安装测试通过
- ✅ 本地构建测试通过
- ✅ 多重截图服务架构实现
- ✅ 智能故障转移机制测试通过
- 🔄 等待 Vercel 部署验证

### 配置文件更新

**vercel.json** - 优化配置:
```json
{
  "functions": {
    "app/api/screenshot/route.ts": {
      "maxDuration": 60,
      "memory": 1024
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

**next.config.mjs** - 多重截图服务配置:
```javascript
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@sparticuz/chromium-min'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals = config.externals.filter(
          (external) => {
            if (typeof external === 'string') {
              return external !== '@sparticuz/chromium-min';
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

### 关键改进点

1. **多重截图服务架构**
   - 实现了 3 种不同的截图方案
   - 智能故障转移机制
   - 提高了服务可用性和稳定性

2. **轻量化 Chromium 方案**
   - 使用 `@sparticuz/chromium-min` 减少包大小
   - 外部 CDN 加载 Chromium 二进制文件
   - 优化启动参数提高兼容性

3. **第三方服务集成**
   - 集成专业截图服务作为后备方案
   - 支持多个服务提供商
   - 灵活的配置和使用策略

4. **增强的错误处理**
   - 详细的错误日志和调试信息
   - 自动重试和故障转移
   - 返回截图元数据和服务信息

## 🔍 部署验证步骤

### 1. 本地构建测试
```bash
npm install
npm run build
```

### 2. 检查配置文件
- ✅ `vercel.json` 配置正确
- ✅ `next.config.mjs` webpack 配置正确
- ✅ `package.json` 依赖版本正确

### 3. Vercel 部署
1. 提交所有更改到 GitHub
2. 触发 Vercel 重新部署
3. 查看构建日志确认无错误
4. 测试 API 端点功能

## 🆘 如果仍然失败

### 检查清单
- [ ] 确认使用 Node.js 18+ 版本
- [ ] 确认 `@sparticuz/chromium-min` 版本为 ^130.0.0
- [ ] 确认 `puppeteer-core` 版本为 ^23.8.0
- [ ] 检查 Vercel 函数日志中的具体错误信息
- [ ] 配置第三方截图服务 API 密钥（可选但推荐）
- [ ] 测试多重截图服务的故障转移机制
- [ ] 尝试删除 `.vercel` 文件夹并重新部署

### 获取帮助
如果问题持续存在，请提供：
1. 完整的构建错误日志
2. `vercel.json` 和 `next.config.mjs` 内容
3. `package.json` 中的依赖版本
4. Vercel 函数执行日志

---

**最后更新**: 2024年12月
**版本**: v4.0 - 多重截图方案
**状态**: 本地构建测试通过 ✅ | 多重服务架构实现 ✅