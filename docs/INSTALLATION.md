# 安装指南

> 牧羊人架构框架 (SAF) 详细安装步骤

---

## 系统要求

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Docker**: >= 20.10.0 (可选)
- **Docker Compose**: >= 2.0.0 (可选)
- **Git**: >= 2.30.0

## 快速安装

### 方式1: Docker Compose (推荐)

```bash
# 1. 克隆仓库
git clone https://github.com/shepherd-team/shepherd-architecture.git
cd shepherd-architecture

# 2. 启动所有服务
docker-compose up -d

# 3. 检查状态
docker-compose ps

# 4. 访问控制台
open http://localhost:3000/console.html
```

### 方式2: 本地安装

```bash
# 1. 克隆仓库
git clone https://github.com/shepherd-team/shepherd-architecture.git
cd shepherd-architecture

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库和API密钥

# 4. 启动数据库（Docker）
docker run -d -p 27017:27017 --name shepherd-mongo mongo:7.0
docker run -d -p 6379:6379 --name shepherd-redis redis:7-alpine

# 5. 启动应用
npm run dev

# 6. 访问控制台
open http://localhost:3000/console.html
```

### 方式3: 生产部署

```bash
# 1. 构建镜像
docker build -t shepherd-architecture .

# 2. 运行容器
docker run -d \
  -p 3000:3000 \
  -e MONGODB_URI=mongodb://host:27017/shepherd \
  -e REDIS_URL=redis://host:6379 \
  -e JWT_SECRET=your-secret-key \
  -e LLM_API_KEY=your-llm-api-key \
  shepherd-architecture
```

---

## 环境变量配置

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `PORT` | 否 | 3000 | 服务端口 |
| `MONGODB_URI` | 是 | - | MongoDB连接字符串 |
| `REDIS_URL` | 是 | - | Redis连接字符串 |
| `JWT_SECRET` | 是 | - | JWT签名密钥 |
| `LLM_API_KEY` | 否 | - | LLM API密钥 |
| `LLM_PROVIDER` | 否 | anthropic | LLM提供商 |
| `LLM_MODEL` | 否 | claude-3-sonnet | LLM模型 |
| `LOG_LEVEL` | 否 | info | 日志级别 |
| `RATE_LIMIT_MAX` | 否 | 100 | 速率限制 |

## 验证安装

```bash
# 检查API服务
curl http://localhost:3000/health

# 预期响应
{"status":"ok","version":"1.0.0-alpha"}
```

## 初始化系统

```bash
# 1. 初始化
curl -X POST http://localhost:3000/v1/system/init \
  -H "Content-Type: application/json" \
  -d '{"humanName": "张三", "humanRole": "Tech Lead"}'

# 2. 注册羊
curl -X POST http://localhost:3000/v1/sheep/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI前端工程师",
    "type": "AI",
    "specialty": "frontend",
    "efficiency": 0.9
  }'

# 3. 委托任务
curl -X POST http://localhost:3000/v1/tasks/delegate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "实现登录页面",
    "description": "React登录页面，包含表单验证",
    "complexity": 2
  }'
```

## 常见问题

**Q: 安装失败？**
A: 检查Node.js版本 (>= 18.0.0)

**Q: 数据库连接失败？**
A: 检查MongoDB和Redis服务是否运行

**Q: API无响应？**
A: 检查端口3000是否被占用

**Q: 如何卸载？**
A: `docker-compose down -v` 或 `npm uninstall`

---

**文档版本**: v1.0.0
**最后更新**: 2026-06-09
