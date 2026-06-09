# API Design

## 概述

SAF 提供 RESTful API 和 WebSocket 实时通信接口。

**基础URL:** `https://api.shepherd.local/v1`

**认证方式:** JWT Bearer Token

```
Authorization: Bearer <token>
```

## 核心 API 端点

### 1. 牧羊人控制台

#### 1.1 委托任务

```http
POST /tasks/delegate
Content-Type: application/json

{
  "title": "实现用户登录功能",
  "description": "包括JWT认证、密码加密、登录API",
  "tags": ["auth", "security", "api"],
  "priority": 4,
  "deadline": "2026-06-15T00:00:00Z",
  "constraints": {
    "codingStandards": ["typescript", "eslint:recommended"],
    "securityPolicies": ["OWASP-Top-10", "no-plaintext-passwords"]
  }
}
```

**响应:**
```json
{
  "taskId": "task-001",
  "status": "ASSIGNED",
  "mode": "COPILOT",
  "assignedAgent": {
    "id": "agent-strategic-001",
    "name": "Architect-1",
    "level": "STRATEGIC"
  },
  "assessment": {
    "feasibility": {
      "verifiability": 0.6,
      "observability": 0.5,
      "accountabilityRisk": 0.8
    },
    "dfScore": 0.21,
    "threshold": 0.65,
    "recommendedMode": "COPILOT",
    "confidence": 0.75,
    "rationale": "该任务涉及安全认证（高责任风险），推荐 Copilot Mode 确保人类同步参与。"
  },
  "approvalRequired": true,
  "approvalUrl": "/tasks/task-001/approve"
}
```

#### 1.2 审批任务

```http
POST /tasks/{taskId}/approve
Content-Type: application/json

{
  "approved": true,
  "comments": "批准实现，注意使用 bcrypt 进行密码加密",
  "conditions": ["密码必须加密存储", "JWT 过期时间设置为 24 小时"]
}
```

#### 1.3 干预 Agent

```http
POST /agents/{agentId}/intervene
Content-Type: application/json

{
  "reason": "生成的代码存在 SQL 注入风险",
  "action": "PAUSE",
  "context": {
    "file": "src/auth/login.ts",
    "line": 45,
    "issue": "用户输入未参数化"
  }
}
```

#### 1.4 塑造环境

```http
POST /environment/shape
Content-Type: application/json

{
  "action": "SET_GOAL",
  "payload": {
    "id": "goal-001",
    "description": "所有API响应时间 < 200ms",
    "priority": 5,
    "successCriteria": "P95 响应时间 < 200ms"
  }
}
```

### 2. Orchestrator

#### 2.1 任务分解

```http
POST /orchestrator/decompose
Content-Type: application/json

{
  "taskId": "task-001",
  "strategy": "DEPENDENCY_GRAPH"
}
```

**响应:**
```json
{
  "subtasks": [
    {
      "id": "subtask-001",
      "title": "设计数据库用户表",
      "mode": "COPILOT",
      "estimatedEffort": 2
    },
    {
      "id": "subtask-002",
      "title": "实现登录API",
      "mode": "AGENT",
      "estimatedEffort": 4
    }
  ],
  "dependencies": [
    { "from": "subtask-001", "to": "subtask-002", "type": "BLOCKS" }
  ],
  "criticalPath": ["subtask-001", "subtask-002"]
}
```

#### 2.2 获取模式建议

```http
GET /orchestrator/mode-suggestion?taskId=task-001
```

### 3. Agent 管理

#### 3.1 获取 Agent 列表

```http
GET /agents?status=IDLE&level=EXECUTIVE
```

#### 3.2 注册 Agent

```http
POST /agents/register
Content-Type: application/json

{
  "name": "CodeGenerator-1",
  "level": "EXECUTIVE",
  "capabilities": ["typescript", "nodejs", "express"],
  "autonomyLevel": 0.8
}
```

#### 3.3 获取 Agent 状态

```http
GET /agents/{agentId}/status
```

### 4. 环境状态

#### 4.1 获取当前环境状态

```http
GET /environment/state
```

#### 4.2 获取代码库状态

```http
GET /environment/codebase
```

#### 4.3 获取任务注册表

```http
GET /environment/tasks
```

### 5. 审计日志

#### 5.1 获取审计日志

```http
GET /audit/logs?from=2026-06-01&to=2026-06-09&actorType=AGENT
```

#### 5.2 验证日志完整性

```http
GET /audit/verify
```

**响应:**
```json
{
  "valid": true,
  "recordCount": 1523,
  "chainHash": "a1b2c3d4...",
  "lastVerified": "2026-06-09T12:00:00Z"
}
```

## WebSocket 实时通信

### 连接

```javascript
const ws = new WebSocket('wss://api.shepherd.local/v1/ws');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'AUTH',
    token: 'jwt-token-here'
  }));
};
```

### 事件类型

#### Agent 状态更新
```json
{
  "type": "AGENT_STATUS_UPDATE",
  "data": {
    "agentId": "agent-001",
    "status": "BUSY",
    "currentTask": "task-001",
    "progress": 0.65
  }
}
```

#### 任务状态变更
```json
{
  "type": "TASK_STATUS_CHANGED",
  "data": {
    "taskId": "task-001",
    "previousStatus": "IN_PROGRESS",
    "newStatus": "REVIEWING",
    "triggeredBy": "agent-001"
  }
}
```

#### 警报
```json
{
  "type": "ALERT",
  "data": {
    "alertId": "alert-001",
    "severity": "CRITICAL",
    "message": "安全评分低于阈值",
    "affectedTasks": ["task-001"]
  }
}
```

#### 人类介入请求
```json
{
  "type": "HUMAN_INTERVENTION_REQUIRED",
  "data": {
    "taskId": "task-001",
    "reason": "架构决策冲突",
    "options": [
      { "id": "opt-1", "description": "使用微服务架构" },
      { "id": "opt-2", "description": "使用单体架构" }
    ],
    "timeout": 300000
  }
}
```

## 错误处理

### 错误响应格式

```json
{
  "error": {
    "code": "TASK_DELEGATION_FAILED",
    "message": "无可用的战略层 Agent",
    "details": {
      "taskId": "task-001",
      "requestedLevel": "STRATEGIC",
      "availableAgents": ["EXECUTIVE-1", "EXECUTIVE-2"]
    },
    "suggestion": "等待 Agent 释放或降低任务层级要求"
  }
}
```

### 错误代码

| 代码 | HTTP 状态 | 描述 |
|------|----------|------|
| `UNAUTHORIZED` | 401 | 认证失败 |
| `FORBIDDEN` | 403 | 权限不足 |
| `TASK_NOT_FOUND` | 404 | 任务不存在 |
| `AGENT_UNAVAILABLE` | 503 | Agent 不可用 |
| `DELEGATION_REJECTED` | 400 | 委托被拒绝（高风险） |
| `APPROVAL_REQUIRED` | 403 | 需要人类审批 |
| `CONFLICT_RESOLUTION_FAILED` | 409 | 冲突无法自动解决 |

## 速率限制

| 端点 | 限制 |
|------|------|
| `/tasks/*` | 100/min |
| `/agents/*` | 200/min |
| `/environment/*` | 300/min |
| `/audit/*` | 50/min |
| WebSocket | 10 msg/sec |

## SDK 示例

### TypeScript/JavaScript

```typescript
import { ShepherdClient } from 'shepherd-sdk';

const client = new ShepherdClient({
  baseUrl: 'https://api.shepherd.local/v1',
  token: 'your-jwt-token'
});

// 委托任务
const result = await client.delegateTask({
  title: '实现用户登录',
  description: '...',
  tags: ['auth', 'security']
});

// 监听实时事件
client.on('TASK_STATUS_CHANGED', (event) => {
  console.log(`任务 ${event.taskId} 状态变为 ${event.newStatus}`);
});
```

### Python

```python
from shepherd import ShepherdClient

client = ShepherdClient(
    base_url='https://api.shepherd.local/v1',
    token='your-jwt-token'
)

# 委托任务
result = client.delegate_task(
    title='实现用户登录',
    description='...',
    tags=['auth', 'security']
)

# 审批任务
client.approve_task(result.task_id, approved=True, comments='批准')
```
