# 牧羊人架构框架 - 快速开始指南

> 5分钟上手SAF

---

## 安装

```bash
# 克隆仓库
git clone https://github.com/shepherd-team/shepherd-architecture.git
cd shepherd-architecture

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 配置数据库连接等
```

## 启动

```bash
# 方式1: Docker Compose（推荐）
docker-compose up -d

# 方式2: 本地开发
npm run dev

# 方式3: 生产部署
npm start
```

## 快速体验

### 1. 初始化系统

```bash
curl -X POST http://localhost:3000/v1/system/init \
  -H "Content-Type: application/json" \
  -d '{"humanName": "张三", "humanRole": "Tech Lead"}'
```

### 2. 注册羊（AI Agent）

```bash
curl -X POST http://localhost:3000/v1/sheep/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI前端工程师",
    "type": "AI",
    "specialty": "frontend",
    "efficiency": 0.9
  }'
```

### 3. 注册牧羊犬（管理者）

```bash
curl -X POST http://localhost:3000/v1/dogs/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "技术主管",
    "type": "HUMAN",
    "role": "tech_lead",
    "flock": ["sheep_001"]
  }'
```

### 4. 委托任务

```bash
curl -X POST http://localhost:3000/v1/tasks/delegate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "实现用户登录功能",
    "description": "包括JWT认证、密码加密、表单验证",
    "tags": ["auth", "security", "api"],
    "complexity": 3
  }'
```

### 5. 查看任务状态

```bash
curl http://localhost:3000/v1/tasks/status
```

### 6. 发放草奖励

```bash
curl -X POST http://localhost:3000/v1/grass/award \
  -H "Content-Type: application/json" \
  -d '{
    "sheepId": "sheep_001",
    "amount": 50,
    "type": "PREMIUM",
    "reason": "高质量代码完成"
  }'
```

## 控制台

打开浏览器访问：http://localhost:3000/console.html

## 示例项目

### 用户管理系统
```bash
cd examples/user-management
npm install
npm start
```

### 俄罗斯方块对比
```bash
open examples/tetris/comparison.html
```

### 数据处理示例
```bash
node examples/data-processing/data_processing.js
```

## 实验运行

### 俄罗斯方块实验
```bash
node scripts/experiment.js
```

### 计算机设计实验
```bash
node scripts/computer_design.js
```

### 真实API对比
```bash
node scripts/real_api_comparison.js
```

### AI视频引擎设计
```bash
# 运行所有模式
node scripts/video_engine_batch.js

# 运行单个模式
node scripts/video_engine_batch.js Shepherd
node scripts/video_engine_batch.js Agile
node scripts/video_engine_batch.js Waterfall
node scripts/video_engine_batch.js Chaotic
node scripts/video_engine_batch.js Spiral
```

## 监控

### Prometheus + Grafana
```bash
docker-compose up -d prometheus grafana
# 访问 http://localhost:3001
```

### MongoDB管理
```bash
docker-compose up -d mongo-express
# 访问 http://localhost:8081
```

## 测试

```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- core.test.ts

# 基准测试
npm run benchmark
```

## 部署

### Docker
```bash
docker build -t shepherd-architecture .
docker run -p 3000:3000 shepherd-architecture
```

### Kubernetes
```bash
kubectl apply -f k8s/
```

## 常见问题

**Q: 如何配置LLM API？**
A: 在 `.env` 文件中设置 `LLM_API_KEY` 和 `LLM_PROVIDER`

**Q: 如何添加新的羊？**
A: 使用 `/v1/sheep/register` API或修改 `src/agents/index.ts`

**Q: 如何修改草奖励规则？**
A: 编辑 `src/core/algorithms.ts` 中的 `calculateGrassReward` 函数

**Q: 如何查看审计日志？**
A: 访问 `/v1/audit/logs` API或查看 `audit/` 目录

## 更多文档

- [完整论文](docs/THESIS.md)
- [架构设计](docs/ARCHITECTURE.md)
- [API设计](docs/API_DESIGN.md)
- [实验报告](docs/COMPREHENSIVE_REPORT.md)
- [部署指南](docs/DEPLOYMENT.md)
- [FAQ](docs/FAQ.md)

---

**项目状态**: Alpha v1.0.0
**GitHub**: https://github.com/shepherd-team/shepherd-architecture
