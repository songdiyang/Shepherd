# 示例项目：使用 SAF 构建一个用户管理系统

## 场景描述

假设你需要开发一个用户管理系统，包括：
- 用户注册/登录
- 权限管理
- 用户资料管理

使用 SAF 框架，人类开发者作为"牧羊人"协调 AI Agent 完成开发。

## 快速开始

### 1. 初始化系统

```bash
curl -X POST http://localhost:3000/system/init \
  -H "Content-Type: application/json" \
  -d '{
    "humanName": "张三",
    "humanRole": "Tech Lead",
    "agentConfigs": [
      {
        "name": "Architect-1",
        "level": "STRATEGIC",
        "capabilities": ["architecture", "microservices"],
        "autonomyLevel": 0.3
      },
      {
        "name": "Planner-1",
        "level": "TACTICAL",
        "capabilities": ["planning", "scrum"],
        "autonomyLevel": 0.6
      },
      {
        "name": "Coder-1",
        "level": "EXECUTIVE",
        "capabilities": ["typescript", "nodejs", "express"],
        "autonomyLevel": 0.8
      },
      {
        "name": "Tester-1",
        "level": "EXECUTIVE",
        "capabilities": ["testing", "jest", "cypress"],
        "autonomyLevel": 0.8
      }
    ]
  }'
```

### 2. 委托任务：用户管理系统

```bash
curl -X POST http://localhost:3000/tasks/delegate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "title": "实现用户管理系统",
    "description": "包括用户注册、登录、权限管理、资料管理",
    "tags": ["feature", "auth", "security", "implementation"],
    "priority": 5,
    "deadline": "2026-06-30T00:00:00Z"
  }'
```

**响应：**
```json
{
  "taskId": "task-001",
  "status": "ASSIGNED",
  "mode": "COPILOT",
  "assignedAgent": {
    "id": "agent-001",
    "name": "Architect-1",
    "level": "STRATEGIC"
  },
  "assessment": {
    "feasibility": {
      "verifiability": 0.5,
      "observability": 0.4,
      "accountabilityRisk": 0.8
    },
    "dfScore": 0.05,
    "threshold": 0.65,
    "recommendedMode": "COPILOT",
    "confidence": 0.75,
    "rationale": "该任务涉及安全认证（高责任风险），推荐 Copilot Mode 确保人类同步参与。"
  },
  "approvalRequired": true
}
```

### 3. 审批任务（人类作为牧羊人）

```bash
curl -X POST http://localhost:3000/tasks/task-001/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "approved": true,
    "comments": "批准实现，注意使用 bcrypt 进行密码加密，JWT 过期时间设置为 24 小时",
    "conditions": [
      "密码必须加密存储",
      "JWT 过期时间 24 小时",
      "所有 API 需要权限校验"
    ]
  }'
```

### 4. 查看任务分解

```bash
curl -X POST http://localhost:3000/orchestrator/decompose \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "taskId": "task-001",
    "strategy": "DEPENDENCY_GRAPH"
  }'
```

**响应：**
```json
{
  "taskId": "task-001",
  "subtasks": [
    {
      "id": "subtask-001",
      "title": "用户管理系统 - 需求分析",
      "mode": "COPILOT",
      "estimatedEffort": 2
    },
    {
      "id": "subtask-002",
      "title": "用户管理系统 - 架构设计",
      "mode": "COPILOT",
      "estimatedEffort": 4
    },
    {
      "id": "subtask-003",
      "title": "用户管理系统 - 代码实现",
      "mode": "AGENT",
      "estimatedEffort": 8
    },
    {
      "id": "subtask-004",
      "title": "用户管理系统 - 单元测试",
      "mode": "AGENT",
      "estimatedEffort": 4
    },
    {
      "id": "subtask-005",
      "title": "用户管理系统 - 代码审查",
      "mode": "COPILOT",
      "estimatedEffort": 2
    }
  ],
  "dependencies": [
    { "from": "subtask-001", "to": "subtask-002", "type": "BLOCKS" },
    { "from": "subtask-002", "to": "subtask-003", "type": "BLOCKS" },
    { "from": "subtask-003", "to": "subtask-004", "type": "BLOCKS" },
    { "from": "subtask-004", "to": "subtask-005", "type": "BLOCKS" }
  ],
  "criticalPath": ["subtask-001", "subtask-002", "subtask-003", "subtask-004", "subtask-005"]
}
```

### 5. 查看模式建议

```bash
# 查看"代码实现"子任务的模式建议
curl "http://localhost:3000/orchestrator/mode-suggestion?taskId=subtask-003"
```

**响应：**
```json
{
  "feasibility": {
    "verifiability": 0.9,
    "observability": 0.8,
    "accountabilityRisk": 0.2
  },
  "dfScore": 0.54,
  "threshold": 0.65,
  "recommendedMode": "AGENT",
  "confidence": 0.82,
  "rationale": "该任务具有高可验证性和低责任风险，适合AI自主执行。"
}
```

### 6. 塑造环境（设定目标）

```bash
curl -X POST http://localhost:3000/environment/shape \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "action": "SET_GOAL",
    "payload": {
      "id": "goal-001",
      "description": "所有API响应时间 < 200ms",
      "priority": 5,
      "successCriteria": "P95 响应时间 < 200ms"
    }
  }'
```

### 7. 查看环境状态

```bash
curl http://localhost:3000/environment/state \
  -H "Authorization: Bearer your-token"
```

### 8. 干预 Agent（如发现安全问题）

```bash
curl -X POST http://localhost:3000/agents/agent-003/intervene \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "reason": "生成的代码存在 SQL 注入风险",
    "action": "PAUSE",
    "context": {
      "file": "src/auth/login.ts",
      "line": 45,
      "issue": "用户输入未参数化"
    }
  }'
```

### 9. 查看审计日志

```bash
curl "http://localhost:3000/audit/logs?from=2026-06-01&to=2026-06-30&actorType=AGENT" \
  -H "Authorization: Bearer your-token"
```

### 10. 验证审计链完整性

```bash
curl http://localhost:3000/audit/verify \
  -H "Authorization: Bearer your-token"
```

**响应：**
```json
{
  "valid": true,
  "recordCount": 15,
  "lastRecordHash": "a1b2c3d4...",
  "lastVerified": "2026-06-09T12:00:00Z"
}
```

## 完整开发流程

```
[人类] 定义目标："实现用户管理系统"
    ↓
[Orchestrator] 分解为5个子任务
    ↓
[评估] 需求分析/架构设计 → Copilot Mode（高风险）
        代码实现/测试 → Agent Mode（高可验证性）
        代码审查 → Copilot Mode（质量把关）
    ↓
[战略层Agent] 生成架构建议 → [人类] 审批
    ↓
[战术层Agent] 规划开发顺序 → [人类] 确认
    ↓
[执行层Agent] 自主编码（Agent Mode）
    ↓
[执行层Agent] 自主测试（Agent Mode）
    ↓
[质量门禁] 自动检查：测试通过、安全扫描、合规检查
    ↓
[人类] 最终审批 → 合并代码
    ↓
[审计] 完整记录：谁在何时批准了什么、AI做了什么决策
```

## 70/30 法则的体现

在这个示例中：

**70% Agent Mode 工作：**
- 代码实现（8小时）
- 单元测试（4小时）
- 文档生成（2小时）
- 小计：14小时（70%）

**30% Copilot Mode 工作：**
- 需求分析（2小时）
- 架构设计（4小时）
- 代码审查（2小时）
- 小计：8小时（30%）

**总计：22小时**

人类作为牧羊人的核心价值：
1. **审批关键决策**（架构选择、安全策略）
2. **设定环境约束**（性能目标、编码规范）
3. **最终质量把关**（代码审查、生产发布）
4. **责任归属**（审计日志、合规记录）

---

## 更多示例

见 `examples/` 目录下的其他场景：
- `examples/microservice/` - 微服务架构设计
- `examples/legacy-refactor/` - 遗留系统重构
- `examples/ai-integration/` - AI功能集成
