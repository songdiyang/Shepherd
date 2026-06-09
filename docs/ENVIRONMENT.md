# 环境状态管理指南

## 环境状态概述

环境状态（Environment State）是 SAF 框架的核心概念，代表人机协同开发的整体环境。它包含代码库状态、任务注册表、系统指标、约束条件等。

## 环境状态组件

### 1. 代码库状态（Codebase State）

```typescript
interface CodebaseState {
  repositoryUrl: string;      // Git 仓库 URL
  branch: string;             // 当前分支
  commitHash: string;         // 当前提交哈希
  fileTree: FileNode[];       // 文件树
  dependencyGraph: Graph;      // 依赖图
  recentChanges: Change[];    // 最近变更
}
```

### 2. 任务注册表（Task Registry）

```typescript
interface TaskRegistry {
  tasks: Task[];              // 所有任务
  dependencies: Dependency[];   // 任务依赖关系
}
```

### 3. 系统指标（System Metrics）

```typescript
interface SystemMetrics {
  codeQuality: CodeQualityMetrics;    // 代码质量指标
  testCoverage: number;                 // 测试覆盖率
  securityScore: number;               // 安全评分
  performanceMetrics: PerformanceMetrics; // 性能指标
  agentUtilization: AgentUtilization;   // Agent 利用率
}
```

### 4. 约束条件（Constraints）

```typescript
interface Constraints {
  codingStandards: string[];           // 编码标准
  securityPolicies: SecurityPolicy[];   // 安全策略
  performanceThresholds: Threshold[];   // 性能阈值
  complianceRules: ComplianceRule[];    // 合规规则
}
```

## 环境塑造函数

环境塑造函数（Environment Shaping Function）允许人类开发者动态调整环境状态。

### 操作类型

| 操作 | 描述 | 示例 |
|------|------|------|
| `SET_GOAL` | 设定目标 | 设定代码覆盖率目标 |
| `ADD_CONSTRAINT` | 添加约束 | 添加新的安全策略 |
| `REMOVE_CONSTRAINT` | 移除约束 | 移除过时的编码标准 |
| `MODIFY_CONSTRAINT` | 修改约束 | 调整性能阈值 |
| `SET_FEEDBACK` | 设定反馈规则 | 设定代码审查规则 |

### 使用示例

```typescript
// 设定目标
shepherd.shapeEnvironment('SET_GOAL', {
  id: 'goal-001',
  description: '测试覆盖率 > 80%',
  priority: 5,
  successCriteria: 'testCoverage > 0.8'
});

// 添加约束
shepherd.shapeEnvironment('ADD_CONSTRAINT', {
  id: 'sec-001',
  type: 'SECURITY_POLICY',
  value: {
    name: 'No plaintext passwords',
    severity: 'CRITICAL',
    rule: 'passwords must be hashed'
  }
});
```

## 环境状态查询

### 获取完整环境状态

```bash
GET /v1/environment/state
```

### 获取特定指标

```bash
GET /v1/environment/metrics?metric=codeQuality
```

### 获取约束列表

```bash
GET /v1/environment/constraints?type=SECURITY_POLICY
```

## 环境状态变更日志

所有环境状态变更都会记录到审计日志中：

```json
{
  "recordId": "audit-001",
  "timestamp": 1704067200000,
  "actor": { "type": "HUMAN", "id": "user-001" },
  "action": {
    "type": "ENVIRONMENT_SHAPE",
    "target": "environment-001",
    "parameters": { "action": "SET_GOAL", "payload": { ... } }
  },
  "decision": { "rationale": "Improve test coverage", "confidence": 1.0, "alternatives": [] }
}
```

## 环境状态最佳实践

### 1. 目标设定
- 设定具体、可衡量的目标
- 设定合理的优先级
- 定期审查目标达成情况

### 2. 约束管理
- 约束应具体且可验证
- 避免过度约束（影响 Agent 自主性）
- 定期审查和更新约束

### 3. 反馈规则
- 反馈应及时且具体
- 使用正面和负面反馈结合
- 反馈应可操作

### 4. 环境监控
- 定期监控环境状态
- 设置告警阈值
- 及时调整环境参数

## 环境状态与委托决策的关系

环境状态直接影响委托可行性评估：

```typescript
// 环境成熟度影响阈值
const threshold = environment.governanceMaturity * 0.5 + 0.3;

// 约束违反影响责任风险
if (constraints.violated) {
  accountabilityRisk += 0.2;
}

// 目标达成影响可验证性
if (goal.achieved) {
  verifiability += 0.1;
}
```

## 环境状态持久化

环境状态存储在 MongoDB 中：

```typescript
// 存储环境状态
await db.collection('environments').insertOne({
  id: environment.id,
  version: environment.version,
  timestamp: Date.now(),
  state: environment
});

// 查询历史状态
const history = await db.collection('environments')
  .find({ id: environment.id })
  .sort({ timestamp: -1 })
  .limit(10)
  .toArray();
```

---

**更多详情**：查看 [API 设计文档](API_DESIGN.md) 和 [数据模型文档](DATA_MODEL.md)
