# 示例：微服务架构设计

## 场景描述

使用 SAF 框架设计一个微服务架构，包括：
- 服务拆分策略
- 服务间通信设计
- 数据一致性管理
- 部署策略

## 使用 SAF 的工作流程

### 1. 初始化系统

```bash
curl -X POST http://localhost:3000/v1/system/init \
  -H "Content-Type: application/json" \
  -d '{
    "humanName": "架构师",
    "humanRole": "Chief Architect",
    "agentConfigs": [
      {
        "name": "ServiceDesigner-1",
        "level": "STRATEGIC",
        "capabilities": ["microservices", "domain-driven-design"],
        "autonomyLevel": 0.3
      },
      {
        "name": "APIDesigner-1",
        "level": "TACTICAL",
        "capabilities": ["api-design", "grpc", "rest"],
        "autonomyLevel": 0.6
      },
      {
        "name": "DevOps-1",
        "level": "EXECUTIVE",
        "capabilities": ["docker", "kubernetes", "ci-cd"],
        "autonomyLevel": 0.8
      }
    ]
  }'
```

### 2. 委托架构设计任务

```bash
curl -X POST http://localhost:3000/v1/tasks/delegate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "设计电商微服务架构",
    "description": "拆分用户服务、订单服务、库存服务、支付服务，设计通信协议",
    "tags": ["architecture", "microservices", "design"],
    "priority": 5
  }'
```

### 3. 审批架构方案

```bash
curl -X POST http://localhost:3000/v1/tasks/{taskId}/approve \
  -H "Content-Type: application/json" \
  -d '{
    "approved": true,
    "comments": "批准方案，注意服务间通信使用 gRPC，数据一致性采用 Saga 模式",
    "conditions": [
      "服务间通信使用 gRPC",
      "数据一致性采用 Saga 模式",
      "每个服务独立数据库",
      "API Gateway 统一入口"
    ]
  }'
```

### 4. 查看任务分解

战略层 Agent 将任务分解为：
- 服务边界分析（Copilot Mode）
- 通信协议设计（Copilot Mode）
- 数据库设计（Agent Mode）
- 部署配置生成（Agent Mode）
- 接口文档生成（Agent Mode）

### 5. 塑造环境约束

```bash
curl -X POST http://localhost:3000/v1/environment/shape \
  -H "Content-Type: application/json" \
  -d '{
    "action": "SET_GOAL",
    "payload": {
      "id": "goal-001",
      "description": "服务间延迟 < 50ms",
      "priority": 5,
      "successCriteria": "P95 服务间调用延迟 < 50ms"
    }
  }'
```

## 70/30 法则的体现

**70% Agent Mode 工作：**
- 部署配置生成（YAML/JSON）
- Dockerfile 编写
- 接口文档生成（OpenAPI）
- 健康检查脚本
- 小计：14小时（70%）

**30% Copilot Mode 工作：**
- 服务边界划分（DDD 分析）
- 通信协议选择（gRPC vs REST）
- 数据一致性策略（Saga vs 2PC）
- 小计：6小时（30%）

## 架构输出示例

### 服务拆分

```
ecommerce-system/
├── api-gateway/          # API 网关
├── user-service/         # 用户服务
├── order-service/        # 订单服务
├── inventory-service/    # 库存服务
├── payment-service/      # 支付服务
└── notification-service/ # 通知服务
```

### 通信协议

| 服务对 | 协议 | 模式 |
|-------|------|------|
| Gateway -> Service | HTTP/REST | 同步 |
| Service -> Service | gRPC | 同步 |
| Event Bus | Kafka | 异步 |

### 数据一致性

- **Saga 模式**：订单创建流程
  1. 创建订单（Order Service）
  2. 扣减库存（Inventory Service）
  3. 处理支付（Payment Service）
  4. 发送通知（Notification Service）

---

**返回示例列表**：[examples/README.md](../README.md)
