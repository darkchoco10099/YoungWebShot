#!/bin/bash

# 部署后测试脚本 - 触发 Bark 通知
# 用于在 Worker 部署成功后发送通知

echo "🚀 测试 Worker 部署状态..."

# 从 wrangler.toml 获取域名或使用默认域名
WORKER_URL="https://youngwebshot.darkchoco.workers.dev"

# 如果有自定义域名，可以在这里修改
# WORKER_URL="https://your-custom-domain.com"

echo "📡 发送部署成功通知到: $WORKER_URL"

# 发送启动通知请求
curl -s "$WORKER_URL/health?startup=true" > /dev/null

if [ $? -eq 0 ]; then
    echo "✅ 部署成功通知已发送"
    echo "📱 如果配置了 BARK_URL，您应该会收到推送通知"
else
    echo "❌ 无法连接到 Worker，请检查部署状态"
    exit 1
fi

echo "🔍 Worker 健康状态:"
curl -s "$WORKER_URL/health" | jq '.' 2>/dev/null || curl -s "$WORKER_URL/health"

echo ""
echo "🎉 部署测试完成！"
echo "💡 提示: 您可以访问 $WORKER_URL 查看截图服务"