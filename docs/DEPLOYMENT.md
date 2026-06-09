# Deployment Guide

## 系统要求

### 最低配置

| 组件 | 要求 |
|------|------|
| Node.js | >= 18.0.0 |
| CPU | 4 cores |
| RAM | 8 GB |
| Storage | 50 GB SSD |
| Network | 100 Mbps |

### 推荐配置（生产环境）

| 组件 | 要求 |
|------|------|
| Node.js | >= 20.0.0 LTS |
| CPU | 16 cores |
| RAM | 32 GB |
| Storage | 200 GB SSD |
| Network | 1 Gbps |

## 依赖服务

### 必需

- **MongoDB** (>= 6.0): 存储任务、Agent、审计日志
- **Redis** (>= 7.0): 缓存、实时状态、消息队列

### 可选

- **Prometheus + Grafana**: 监控和告警
- **Elasticsearch** (>= 8.0): 审计日志全文检索
- **MinIO**: 对象存储（代码附件、构建产物）

## 部署模式

### 1. 单机部署（开发/测试）

```bash
# 克隆仓库
git clone https://github.com/shepherd-team/shepherd-architecture.git
cd shepherd-architecture

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 配置数据库连接等

# 启动依赖服务（Docker Compose）
docker-compose -f docker-compose.dev.yml up -d

# 启动应用
npm run dev
```

### 2. Docker Compose 部署（小团队）

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    image: shepherd-architecture:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/shepherd
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '2'
          memory: 2G

  mongo:
    image: mongo:6.0
    volumes:
      - mongo-data:/data/db

  redis:
    image: redis:7.0-alpine
    volumes:
      - redis-data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app

volumes:
  mongo-data:
  redis-data:
```

### 3. Kubernetes 部署（企业级）

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: shepherd-app
  namespace: shepherd
spec:
  replicas: 3
  selector:
    matchLabels:
      app: shepherd
  template:
    metadata:
      labels:
        app: shepherd
    spec:
      containers:
      - name: shepherd
        image: shepherd-architecture:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: shepherd-secrets
              key: mongodb-uri
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: shepherd-secrets
              key: redis-url
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## 环境变量配置

| 变量 | 必填 | 默认值 | 描述 |
|------|------|--------|------|
| `NODE_ENV` | 是 | `development` | 运行环境 |
| `PORT` | 否 | `3000` | 服务端口 |
| `MONGODB_URI` | 是 | - | MongoDB 连接串 |
| `REDIS_URL` | 是 | - | Redis 连接串 |
| `JWT_SECRET` | 是 | - | JWT 签名密钥 |
| `LOG_LEVEL` | 否 | `info` | 日志级别 |
| `MAX_AGENTS` | 否 | `50` | 最大 Agent 数量 |
| `GOVERNANCE_MATURITY` | 否 | `0.5` | 组织治理成熟度 (0.0-1.0) |
| `ENABLE_AUDIT_CHAIN` | 否 | `true` | 启用审计哈希链 |
| `SANDBOX_ENABLED` | 否 | `true` | 启用 Agent 沙箱 |
| `CODE_REVIEW_REQUIRED` | 否 | `true` | 代码审查门禁 |

## 安全配置

### 1. TLS/SSL

```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name api.shepherd.local;

    ssl_certificate /etc/nginx/ssl/server.crt;
    ssl_certificate_key /etc/nginx/ssl/server.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';

    location / {
        proxy_pass http://app:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 2. 网络安全

- 防火墙规则：仅开放 443/80 端口
- 网络分段：Agent 沙箱网络隔离
- 速率限制：API 网关层配置

### 3. 数据加密

- 传输加密：TLS 1.2+
- 存储加密：MongoDB 启用加密-at-rest
- 敏感字段：密码、Token 使用 AES-256 加密

## 监控与告警

### Prometheus 指标

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'shepherd'
    static_configs:
      - targets: ['app:3000']
    metrics_path: /metrics
```

### 关键指标

| 指标 | 类型 | 告警阈值 |
|------|------|---------|
| `shepherd_tasks_total` | Counter | - |
| `shepherd_task_duration_seconds` | Histogram | P95 > 30s |
| `shepherd_agent_utilization` | Gauge | > 90% |
| `shepherd_intervention_count` | Counter | 突然增加 |
| `shepherd_audit_log_size` | Gauge | > 1GB |
| `shepherd_delegation_rejected_rate` | Gauge | > 20% |

### Grafana 面板

- 任务吞吐量与延迟
- Agent 利用率与状态
- 委托可行性分布
- 审计日志完整性
- 安全评分趋势

## 备份策略

### MongoDB 备份

```bash
#!/bin/bash
# 每日备份
mongodump --uri="$MONGODB_URI" --out=/backup/$(date +%Y%m%d)

# 保留7天
find /backup -type d -mtime +7 -exec rm -rf {} \;
```

### 审计日志归档

```bash
#!/bin/bash
# 每月归档至冷存储
aws s3 cp /data/audit-logs/ s3://shepherd-audit-archive/$(date +%Y%m)/ \
  --recursive --storage-class GLACIER
```

## 升级指南

### 版本兼容性

| 版本 | 兼容的 API 版本 | 数据库迁移 |
|------|----------------|-----------|
| 1.0.0-alpha | v1 | 初始版本 |
| 1.0.0-beta | v1 | 无需迁移 |
| 1.0.0 | v1 | 升级脚本 |

### 升级步骤

1. 备份数据
2. 部署新版本（蓝绿部署）
3. 运行数据库迁移
4. 验证健康检查
5. 切换流量
6. 监控关键指标

## 故障排查

### 常见问题

**问题1: Agent 无法连接**
```bash
# 检查 Agent 注册状态
curl http://localhost:3000/agents | jq '.agents[].status'

# 检查 Redis 连接
redis-cli ping
```

**问题2: 任务委托被拒绝**
```bash
# 检查治理成熟度配置
curl http://localhost:3000/config | jq '.governanceMaturity'

# 检查可用 Agent
curl http://localhost:3000/agents?status=IDLE
```

**问题3: 审计日志验证失败**
```bash
# 重新计算哈希链
npm run audit:verify -- --repair
```

## 性能调优

### 数据库优化

```javascript
// MongoDB 索引
db.tasks.createIndex({ status: 1, priority: -1 });
db.tasks.createIndex({ assignedTo: 1, status: 1 });
db.audit_logs.createIndex({ timestamp: -1 });
db.audit_logs.createIndex({ "actor.id": 1, timestamp: -1 });
```

### Redis 优化

```bash
# 配置最大内存和淘汰策略
maxmemory 2gb
maxmemory-policy allkeys-lru
```

## 高可用配置

### 多可用区部署

```yaml
# pod 反亲和性
affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      podAffinityTerm:
        labelSelector:
          matchLabels:
            app: shepherd
        topologyKey: topology.kubernetes.io/zone
```

### 数据库复制

```yaml
# MongoDB 副本集
replicas: 3
arbiter: true
```

---

**支持**

- 文档: https://docs.shepherd.local
- 社区: https://github.com/shepherd-team/shepherd-architecture/discussions
- 邮件: support@shepherd.local
