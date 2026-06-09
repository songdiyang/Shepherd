# 牧羊人架构框架 - API 文档

> 完整的 RESTful API 参考文档

## 基础信息

- **Base URL**: `http://localhost:3000/api/v1`
- **Content-Type**: `application/json`
- **认证**: Bearer Token (JWT)

## 认证

所有 API 请求需要包含认证头：

```
Authorization: Bearer <token>
```

获取 Token：

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "shepherd",
  "password": "password"
}
```

响应：

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400
}
```

---

## 羊 (Sheep) API

### 创建羊

```
POST /api/v1/sheep
```

请求体：

```json
{
  "name": "AI Frontend Dev",
  "type": "AI",
  "capabilities": {
    "codeGeneration": true,
    "codeAnalysis": true,
    "reasoning": true,
    "naturalLanguage": true,
    "multiModal": true,
    "toolUse": true,
    "memory": true,
    "planning": true,
    "selfCorrection": true,
    "collaboration": true
  }
}
```

响应：

```json
{
  "id": "sheep_123",
  "name": "AI Frontend Dev",
  "type": "AI",
  "autonomy": 0.8,
  "status": "idle",
  "grassBalance": 0,
  "reputation": 0,
  "title": null,
  "capabilities": { ... },
  "createdAt": "2026-06-09T07:20:44Z"
}
```

### 获取羊列表

```
GET /api/v1/sheep?page=1&limit=20&status=idle
```

查询参数：
- `page` - 页码 (默认: 1)
- `limit` - 每页数量 (默认: 20, 最大: 100)
- `status` - 状态筛选 (idle, active, resting, learning, error)
- `type` - 类型筛选 (AI, HUMAN)
- `sort` - 排序字段 (reputation, grassBalance, efficiency)
- `order` - 排序方向 (asc, desc)

响应：

```json
{
  "data": [
    {
      "id": "sheep_123",
      "name": "AI Frontend Dev",
      "type": "AI",
      "status": "idle",
      "reputation": 531.03,
      "grassBalance": 2060.33,
      "title": "资深羊",
      "efficiency": 1.00
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 6,
    "totalPages": 1
  }
}
```

### 获取单个羊

```
GET /api/v1/sheep/:id
```

响应：

```json
{
  "id": "sheep_123",
  "name": "AI Frontend Dev",
  "type": "AI",
  "autonomy": 0.8,
  "status": "idle",
  "grassBalance": 2060.33,
  "reputation": 531.03,
  "title": "资深羊",
  "tasksCompleted": 34,
  "tasksFailed": 3,
  "efficiency": 1.00,
  "quality": 0.85,
  "capabilities": { ... },
  "createdAt": "2026-06-09T07:20:44Z",
  "updatedAt": "2026-06-09T07:35:00Z"
}
```

### 更新羊

```
PATCH /api/v1/sheep/:id
```

请求体：

```json
{
  "name": "AI Frontend Developer",
  "autonomy": 0.9
}
```

### 删除羊

```
DELETE /api/v1/sheep/:id
```

### 羊执行
任务

```
POST /api/v1/sheep/:id/execute
```

请求体：

```json
{
  "taskId": "task_456"
}
```

响应：

```json
{
  "success": true,
  "quality": 0.85,
  "executionTime": 5000,
  "sheepId": "sheep_123",
  "taskId": "task_456"
}
```

---

## 牧羊犬 (Dog) API

### 创建牧羊犬

```
POST /api/v1/dogs
```

请求体：

```json
{
  "name": "AI Task Manager",
  "type": "AI",
  "role": "task_manager"
}
```

角色选项：
- `task_manager` - 任务管理
- `quality_inspector` - 质量检查
- `security_guard` - 安全守卫
- `resource_coordinator` - 资源协调
- `communication_hub` - 通信枢纽

### 获取牧羊犬列表

```
GET /api/v1/dogs
```

响应：

```json
{
  "data": [
    {
      "id": "dog_123",
      "name": "AI Task Manager",
      "type": "AI",
      "role": "task_manager",
      "flockSize": 3,
      "grassBudget": 1000.00,
      "tasksAssigned": 55,
      "tasksReviewed": 55
    }
  ]
}
```

### 分配羊群

```
POST /api/v1/dogs/:id/flock
```

请求体：

```json
{
  "sheepIds": ["sheep_123", "sheep_456", "sheep_789"]
}
```

### 分配任务

```
POST /api/v1/dogs/:id/assign
```

请求体：

```json
{
  "taskId": "task_456",
  "sheepId": "sheep_123"
}
```

### 审查任务

```
POST /api/v1/dogs/:id/review
```

请求体：

```json
{
  "taskId": "task_456",
  "result": {
    "success": true,
    "quality": 0.85
  }
}
```

响应：

```json
{
  "approved": true,
  "grass": {
    "amount": 50,
    "quality": 1.0,
    "reason": "Task completed with good quality"
  }
}
```

---

## 任务 (Task) API

### 创建任务

```
POST /api/v1/tasks
```

请求体：

```json
{
  "title": "Implement API endpoint",
  "description": "Create REST API for user management",
  "priority": 3,
  "complexity": 3,
  "tags": ["backend", "api"]
}
```

响应：

```json
{
  "id": "task_456",
  "title": "Implement API endpoint",
  "description": "Create REST API for user management",
  "priority": 3,
  "complexity": 3,
  "status": "pending",
  "assignedTo": null,
  "assignedBy": null,
  "createdAt": "2026-06-09T07:20:44Z"
}
```

### 获取任务列表

```
GET /api/v1/tasks?page=1&limit=20&status=pending&priority=3
```

查询参数：
- `status` - 状态筛选 (pending, assigned, in_progress, completed, failed)
- `priority` - 优先级筛选 (1-5)
- `complexity` - 复杂度筛选 (1-5)
- `assignedTo` - 分配给特定羊
- `assignedBy` - 由特定牧羊犬分配

### 更新任务状态

```
PATCH /api/v1/tasks/:id
```

请求体：

```json
{
  "status": "completed",
  "quality": 0.85
}
```

---

## 草 (Grass) API

### 获取羊的草余额

```
GET /api/v1/sheep/:id/grass
```

响应：

```json
{
  "sheepId": "sheep_123",
  "balance": 2060.33,
  "totalEarned": 7881.14,
  "totalConsumed": 5820.81
}
```

### 发放草奖励

```
POST /api/v1/grass/grant
```

请求体：

```json
{
  "sheepId": "sheep_123",
  "amount": 50,
  "quality": 1.0,
  "type": "appreciation",
  "reason": "Excellent code quality",
  "issuedBy": "dog_123"
}
```

草类型：
- `appreciation` - 赞赏
- `bonus` - 奖金
- `collaboration` - 协作
- `innovation` - 创新
- `milestone` - 里程碑
- `learning` - 学习

### 消耗草

```
POST /api/v1/grass/consume
```

请求体：

```json
{
  "sheepId": "sheep_123",
  "amount": 10,
  "reason": "Execute task",
  "activityType": "execute_task"
}
```

活动类型：
- `execute_task` - 执行任务 (基础消耗: 5)
- `learn_new_skill` - 学习新技能 (基础消耗: 20)
- `self_check` - 自我检查 (基础消耗: 3)
- `communicate` - 通信 (基础消耗: 2)
- `idle_maintenance` - 空闲维护 (基础消耗: 1)

---

## 模拟 (Simulation) API

### 启动模拟

```
POST /api/v1/simulation/start
```

请求体：

```json
{
  "days": 30,
  "sheepCount": 6,
  "dogCount": 3,
  "tasksPerDay": 5,
  "scenario": "default"
}
```

响应：

```json
{
  "simulationId": "sim_123",
  "status": "running",
  "startTime": "2026-06-09T07:20:44Z"
}
```

### 获取模拟状态

```
GET /api/v1/simulation/:id
```

响应：

```json
{
  "id": "sim_123",
  "status": "completed",
  "progress": 100,
  "currentDay": 30,
  "totalDays": 30,
  "statistics": {
    "totalTasks": 160,
    "completedTasks": 131,
    "failedTasks": 29,
    "completionRate": 81.88,
    "averageQuality": 0.84
  }
}
```

### 获取模拟结果

```
GET /api/v1/simulation/:id/results
```

响应：

```json
{
  "simulationId": "sim_123",
  "sheep": [ ... ],
  "dogs": [ ... ],
  "tasks": [ ... ],
  "grassHistory": [ ... ],
  "events": [ ... ],
  "statistics": { ... }
}
```

---

## WebSocket API

连接 WebSocket 进行实时通信：

```javascript
const ws = new WebSocket('ws://localhost:3000/ws');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'subscribe',
    channels: ['tasks', 'sheep', 'alerts']
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data);
};
```

### 事件类型

#### 任务更新

```json
{
  "type": "task_update",
  "data": {
    "taskId": "task_456",
    "status": "completed",
    "quality": 0.85,
    "sheepId": "sheep_123"
  }
}
```

#### 羊状态更新

```json
{
  "type": "sheep_status",
  "data": {
    "sheepId": "sheep_123",
    "status": "active",
    "currentTask": "task_456",
    "reputation": 531.03
  }
}
```

#### 草奖励

```json
{
  "type": "grass_grant",
  "data": {
    "sheepId": "sheep_123",
    "amount": 50,
    "reason": "Excellent work"
  }
}
```

#### 警报

```json
{
  "type": "alert",
  "data": {
    "level": "warning",
    "message": "Sheep sheep_123 has low grass balance",
    "sheepId": "sheep_123"
  }
}
```

---

## 错误处理

### 错误响应格式

```json
{
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task task_456 not found",
    "status": 404
  }
}
```

### 错误码列表

| 错误码 | 状态码 | 描述 |
|--------|--------|------|
| `UNAUTHORIZED` | 401 | 未授权 |
| `FORBIDDEN` | 403 | 权限不足 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `VALIDATION_ERROR` | 400 | 验证错误 |
| `RATE_LIMITED` | 429 | 请求频率限制 |
| `INTERNAL_ERROR` | 500 | 内部服务器错误 |
| `SHEEP_NOT_FOUND` | 404 | 羊不存在 |
| `DOG_NOT_FOUND` | 404 | 牧羊犬不存在 |
| `TASK_NOT_FOUND` | 404 | 任务不存在 |
| `INSUFFICIENT_GRASS` | 400 | 草余额不足 |
| `SHEEP_BUSY` | 409 | 羊正忙 |
| `SIMULATION_RUNNING` | 409 | 模拟正在运行 |

---

## 分页

列表 API 支持分页：

```
GET /api/v1/sheep?page=1&limit=20
```

响应包含分页信息：

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 速率限制

API 速率限制：

- 普通端点: 1000 请求/分钟
- 认证端点: 100 请求/分钟
- 模拟启动: 10 请求/小时

响应头包含速率限制信息：

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1623240000
```

---

## SDK 示例

### JavaScript/TypeScript

```typescript
import { ShepherdClient } from '@shepherd/client';

const client = new ShepherdClient({
  baseURL: 'http://localhost:3000/api/v1',
  token: 'your-jwt-token'
});

// 创建羊
const sheep = await client.sheep.create({
  name: 'AI Frontend Dev',
  type: 'AI'
});

// 创建任务
const task = await client.tasks.create({
  title: 'Implement API',
  priority: 3,
  complexity: 3
});

// 分配任务
await client.dogs.assign('dog_123', {
  taskId: task.id,
  sheepId: sheep.id
});

// 订阅 WebSocket
const ws = client.websocket.connect();
ws.on('task_update', (data) => {
  console.log('Task updated:', data);
});
```

### Python

```python
from shepherd_client import ShepherdClient

client = ShepherdClient(
    base_url='http://localhost:3000/api/v1',
    token='your-jwt-token'
)

# 创建羊
sheep = client.sheep.create({
    'name': 'AI Frontend Dev',
    'type': 'AI'
})

# 创建任务
task = client.tasks.create({
    'title': 'Implement API',
    'priority': 3,
    'complexity': 3
})

# 分配任务
client.dogs.assign('dog_123', {
    'taskId': task['id'],
    'sheepId': sheep['id']
})
```

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0.0 | 2026-06-09 | 初始版本，包含羊、牧羊犬、任务、草 API |
| v1.1.0 | - | 添加 WebSocket 支持 |
| v1.2.0 | - | 添加模拟 API |

---

**文档版本**: v1.0.0
**更新日期**: 2026-06-09
