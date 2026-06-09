# Data Model Design

## 核心数据模型

### 1. 任务模型（Task）

```typescript
interface Task {
  id: UUID;                    // 唯一标识
  parentId?: UUID;             // 父任务（用于层级分解）
  title: string;               // 任务标题
  description: string;       // 任务描述
  status: TaskStatus;          // 任务状态
  
  // 委托与分配
  assignedTo?: UUID;         // 分配的Agent或Human ID
  mode: CollaborationMode;    // 协作模式（Agent/Copilot）
  
  // 评估与元数据
  priority: number;           // 优先级（1-5）
  estimatedEffort: number;    // 预估工时（小时）
  actualEffort?: number;       // 实际工时
  
  // 时间戳
  createdAt: Timestamp;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  deadline?: Timestamp;
  
  // 分类与标记
  tags: string[];             // 任务标签（用于委托评估）
  deliverables: Deliverable[]; // 交付物列表
  
  // 评估结果（由Orchestrator生成）
  assessment?: DelegationAssessment;
}
```

**状态机：**

```
[PENDING] ──▶ [ASSIGNED] ──▶ [IN_PROGRESS] ──▶ [REVIEWING] ──▶ [COMPLETED]
                │                │                │
                ▼                ▼                ▼
             [ABORTED]        [FAILED]          [FAILED]
```

### 2. Agent 模型

```typescript
interface Agent {
  id: UUID;
  name: string;
  level: AgentLevel;           // 战略/战术/执行
  
  // 能力声明
  capabilityRange: string[];   // 能力标签
  autonomyLevel: number;        // 自主性级别（0.0-1.0）
  
  // 状态
  status: 'IDLE' | 'BUSY' | 'OFFLINE';
  currentTask?: UUID;          // 当前任务
  
  // 性能历史
  performanceHistory: AgentPerformance[];
}
```

**Agent 分层特征：**

| 属性 | 战略层 | 战术层 | 执行层 |
|------|--------|--------|--------|
| 自主性 | 低（0.2-0.4） | 中（0.4-0.7） | 高（0.7-0.9） |
| 默认模式 | Copilot | 混合 | Agent |
| 典型任务 | 架构决策 | 任务规划 | 代码生成 |
| 能力标签 | architecture, design | planning, coordination | coding, testing |

### 3. 环境状态模型

```typescript
interface EnvironmentState {
  id: UUID;
  version: number;             // 状态版本（用于回滚）
  timestamp: Timestamp;
  
  // 代码库状态
  codebase: {
    repositoryUrl: string;
    branch: string;
    commitHash: string;
    fileTree: FileNode[];
    dependencyGraph: DependencyGraph;
    recentChanges: CodeChange[];
  };
  
  // 任务注册表
  taskRegistry: {
    tasks: Task[];
    dependencies: TaskDependency[];
  };
  
  // 系统度量
  metrics: {
    codeQuality: CodeQualityMetrics;
    testCoverage: number;
    securityScore: number;
    performanceMetrics: PerformanceMetrics;
    agentUtilization: AgentUtilizationMetrics;
  };
  
  // 约束集合
  constraints: ConstraintSet;
}
```

### 4. 审计日志模型

```typescript
interface AuditRecord {
  recordId: UUID;
  timestamp: Timestamp;
  
  actor: {
    type: 'HUMAN' | 'AGENT' | 'SYSTEM';
    id: string;
    humanSupervisor?: string;  // Agent行动时的人类监督者
  };
  
  action: {
    type: string;              // 行动类型
    target: string;            // 作用对象
    parameters: Record<string, any>;
  };
  
  decision: {
    rationale: string;         // 决策理由（AI需提供推理）
    confidence: number;         // 置信度
    alternatives: string[];    // 备选方案
  };
  
  approval: {
    required: boolean;
    approvedBy?: string;
    approvalTimestamp?: Timestamp;
  };
  
  // 防篡改
  hash: string;
  previousHash: string;
}
```

**哈希链结构：**

```
Record_1: hash = H(data_1 + "0")
Record_2: hash = H(data_2 + hash_1)
Record_3: hash = H(data_3 + hash_2)
...
Record_n: hash = H(data_n + hash_{n-1})
```

### 5. 委托评估模型

```typescript
interface DelegationAssessment {
  feasibility: {
    verifiability: number;      // [0.0, 1.0]
    observability: number;      // [0.0, 1.0]
    accountabilityRisk: number; // [0.0, 1.0]
  };
  
  dfScore: number;              // 综合得分 [-1.0, 1.0]
  threshold: number;            // 动态阈值
  
  recommendedMode: CollaborationMode;
  confidence: number;           // 评估置信度
  rationale: string;            // 评估理由
}
```

### 6. 约束集合模型

```typescript
interface ConstraintSet {
  codingStandards: string[];    // 编码规范（如 "typescript", "eslint:recommended"）
  
  securityPolicies: Array<{
    id: string;
    name: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    rule: string;
  }>;
  
  performanceThresholds: Array<{
    metric: string;
    maxValue: number;
    unit: string;
  }>;
  
  complianceRules: Array<{
    standard: string;          // 如 "GDPR", "SOX", "HIPAA"
    requirement: string;
    verificationMethod: string;
  }>;
}
```

## 数据流

### 1. 任务委托流程

```
[Human] 定义任务
    ↓
[Orchestrator] 分解任务
    ↓
[ModeSelector] 评估委托可行性
    ↓
  ├─ 高可行性 → [Agent] Agent Mode
  └─ 低可行性 → [Human + Agent] Copilot Mode
    ↓
[Environment] 更新状态
    ↓
[AuditLog] 记录审计链
```

### 2. 状态同步机制

```
[Agent] 执行任务
    ↓
[Environment] 更新代码库/任务/度量
    ↓
[Pub/Sub] 广播状态变更
    ↓
[Shepherd Console] 实时更新视图
    ↓
[Human] 观察并决策（必要时干预）
```

### 3. 审计追踪流程

```
[Action] 任何行动（Human或Agent）
    ↓
[AuditLogger] 生成记录
    ↓
[HashCalculator] 计算哈希（含前一条哈希）
    ↓
[Storage] 写入审计日志数据库
    ↓
[Verifier] 定期验证哈希链完整性
```

## 存储设计

### MongoDB 集合

```javascript
// tasks 集合
db.tasks.createIndex({ status: 1, priority: -1 });
db.tasks.createIndex({ assignedTo: 1, status: 1 });
db.tasks.createIndex({ tags: 1 });

// agents 集合
db.agents.createIndex({ status: 1, level: 1 });
db.agents.createIndex({ capabilityRange: 1 });

// audit_logs 集合
db.audit_logs.createIndex({ timestamp: -1 });
db.audit_logs.createIndex({ "actor.id": 1, timestamp: -1 });
db.audit_logs.createIndex({ hash: 1 });

// environment_states 集合
db.environment_states.createIndex({ version: -1 });
```

### Redis 缓存

```
# 实时状态
shepherd:agent:{id}:status → "IDLE" | "BUSY" | "OFFLINE"
shepherd:task:{id}:state → TaskState
shepherd:environment:current → EnvironmentState (JSON)

# 会话与认证
shepherd:session:{token} → UserSession
shepherd:ws:{connectionId} → WebSocketMetadata

# 速率限制
shepherd:rate_limit:{endpoint}:{userId} → Counter
```

## 数据一致性

### 最终一致性策略

- **任务状态**：Agent执行任务后异步更新，允许短暂不一致（< 1s）
- **代码库状态**：通过Git版本控制保证强一致性
- **审计日志**：写入时强一致性，验证时最终一致性
- **环境度量**：定期批量更新，允许延迟

### 冲突解决

```
[并发写冲突]
    ↓
[版本检查] 乐观锁（version字段）
    ↓
  ├─ 版本匹配 → 写入成功
  └─ 版本冲突 → 重试或人工裁决
```
