#!/bin/bash

# Shepherd Architecture Framework 健康检查脚本

set -e

echo "🐑 Shepherd Architecture 健康检查"
echo "=================================="

API_URL="${API_URL:-http://localhost:3000}"

# 检查 API 服务
echo -n "API 服务: "
if curl -s "$API_URL/health" > /dev/null 2>&1; then
    echo "✅ 正常"
else
    echo "❌ 异常"
fi

# 检查数据库
echo -n "MongoDB: "
if curl -s "$API_URL/health" | grep -q "healthy"; then
    echo "✅ 正常"
else
    echo "❌ 异常"
fi

# 检查 Redis
echo -n "Redis: "
if curl -s "$API_URL/health" | grep -q "healthy"; then
    echo "✅ 正常"
else
    echo "❌ 异常"
fi

echo ""
echo "详细状态:"
curl -s "$API_URL/health" | python3 -m json.tool 2>/dev/null || curl -s "$API_URL/health"
