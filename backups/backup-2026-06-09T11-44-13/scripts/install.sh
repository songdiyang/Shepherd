#!/bin/bash

# Shepherd Architecture Framework 安装脚本

set -e

echo "🐑 安装 Shepherd Architecture Framework..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装。请先安装 Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 版本过低。需要 18+，当前版本: $(node -v)"
    exit 1
fi

echo "✓ Node.js 版本: $(node -v)"

# 检查 MongoDB
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB 未安装。将使用 Docker 启动"
fi

# 检查 Redis
if ! command -v redis-cli &> /dev/null; then
    echo "⚠️  Redis 未安装。将使用 Docker 启动"
fi

# 安装依赖
echo "📦 安装依赖..."
npm install

# 创建环境文件
if [ ! -f .env ]; then
    echo "📝 创建 .env 文件..."
    cp .env.example .env
fi

# 创建目录
mkdir -p logs data

# 构建
echo "🔨 构建项目..."
npm run build

echo "✅ 安装完成！"
echo ""
echo "启动方式:"
echo "  1. 开发模式: npm run dev"
echo "  2. 生产模式: npm start"
echo "  3. Docker: docker-compose up -d"
echo ""
echo "访问控制台: http://localhost:3000/console.html"
