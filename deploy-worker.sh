#!/bin/bash

# Cloudflare Worker 部署脚本
# 用于快速部署网页截图服务的 Worker 版本

set -e

echo "🚀 开始部署 Cloudflare Worker 版本..."

# 检查必要的工具
echo "📋 检查环境..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

# 检查 wrangler
if ! command -v wrangler &> /dev/null; then
    echo "📦 安装 Wrangler CLI..."
    npm install -g wrangler
fi

# 备份原始文件
echo "💾 备份原始配置文件..."
if [ -f "package.json" ]; then
    cp package.json package-nextjs.json.bak
    echo "✅ 已备份 package.json -> package-nextjs.json.bak"
fi

if [ -f "wrangler.toml" ]; then
    cp wrangler.toml wrangler-pages.toml.bak
    echo "✅ 已备份 wrangler.toml -> wrangler-pages.toml.bak"
fi

# 切换到 Worker 配置
echo "🔄 切换到 Worker 配置..."
cp package-worker.json package.json
echo "✅ 已切换到 Worker package.json"

# 安装依赖
echo "📦 安装 Worker 依赖..."
npm install

# 检查登录状态
echo "🔐 检查 Cloudflare 登录状态..."
if ! wrangler whoami &> /dev/null; then
    echo "🔑 请登录 Cloudflare 账户..."
    wrangler login
fi

# 选择部署环境
echo ""
echo "🎯 选择部署环境:"
echo "1) 生产环境 (production)"
echo "2) 预览环境 (preview)"
echo "3) 本地开发 (dev)"
read -p "请选择 (1-3): " choice

case $choice in
    1)
        echo "🚀 部署到生产环境..."
        wrangler deploy --config wrangler-worker.toml
        echo "✅ 生产环境部署完成！"
        ;;
    2)
        echo "🚀 部署到预览环境..."
        wrangler deploy --config wrangler-worker.toml --env preview
        echo "✅ 预览环境部署完成！"
        ;;
    3)
        echo "🛠️ 启动本地开发服务器..."
        echo "访问 http://localhost:8787 查看应用"
        echo "按 Ctrl+C 停止服务器"
        wrangler dev --config wrangler-worker.toml
        ;;
    *)
        echo "❌ 无效选择，退出部署"
        exit 1
        ;;
esac

if [ $choice -eq 1 ] || [ $choice -eq 2 ]; then
    echo ""
    echo "🎉 部署成功！"
    echo ""
    echo "📋 后续操作:"
    echo "• 访问你的 Worker URL 查看应用"
    echo "• 使用 'npm run tail' 查看实时日志"
    echo "• 使用 'npm run dev' 进行本地开发"
    echo ""
    echo "📚 更多信息请查看 WORKER_DEPLOYMENT.md"
fi

echo ""
echo "🔄 如需恢复到 Next.js 版本:"
echo "cp package-nextjs.json.bak package.json"
echo "cp wrangler-pages.toml.bak wrangler.toml"
echo "npm install"