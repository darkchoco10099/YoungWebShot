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

## 🛠️ 最新修复措施 (v3.1)

### 关键修复内容
1. **依赖包升级**：
   - 升级 `@sparticuz/chromium` 到 `^130.0.0`
   - 升级 `puppeteer-core` 到 `^23.8.0`
2. **解决 libnss3.so 缺失问题**：
   - 添加更多 Chromium 启动参数以处理共享库依赖
   - 增强内存管理和进程隔离
   - 优化 Vercel 环境兼容性
3. **简化 Vercel 配置**：
   - 移除冲突的环境变量（`NODE_ENV`、`FONTCONFIG_PATH`、`LD_LIBRARY_PATH`）
   - 移除 `regions` 配置，避免地区限制问题
   - 仅保留必要的 `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true`
   - 增加内存分配到 3008MB
4. **优化 Next.js Webpack 配置**：
   - 改进 externals 过滤逻辑
   - 确保 `@sparticuz/chromium` 不被错误外部化
   - 添加类型检查
5. **增强错误处理和调试信息**

### 验证状态
- ✅ 本地依赖安装测试通过
- ✅ 本地构建测试通过
- 🔄 等待 Vercel 部署验证

### 配置文件更新

**vercel.json** - 简化配置:
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

**next.config.mjs** - 改进的 webpack 配置:
```javascript
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@sparticuz/chromium'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
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

### 关键改进点

1. **移除冲突的环境变量**
   - 删除了 `NODE_ENV`, `FONTCONFIG_PATH`, `LD_LIBRARY_PATH`
   - 仅保留必要的 `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD`

2. **移除地区限制**
   - 删除了 `regions` 配置，避免部署限制

3. **改进 webpack 配置**
   - 添加类型检查，确保正确过滤外部包
   - 防止 `@sparticuz/chromium` 被错误外部化

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
- [ ] 确认 `@sparticuz/chromium` 版本为 ^126.0.0
- [ ] 确认 `puppeteer-core` 版本为 ^23.0.0
- [ ] 检查 Vercel 函数日志中的具体错误信息
- [ ] 尝试删除 `.vercel` 文件夹并重新部署

### 获取帮助
如果问题持续存在，请提供：
1. 完整的构建错误日志
2. `vercel.json` 和 `next.config.mjs` 内容
3. `package.json` 中的依赖版本
4. Vercel 函数执行日志

---

**最后更新**: 2024年12月
**状态**: 本地构建测试通过 ✅