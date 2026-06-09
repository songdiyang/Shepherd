# 草奖励机制模型 (Grass Reward Mechanism)

## 核心概念

在牧羊人架构中，**"草"** 是驱动 AI Agent 工作的核心奖励机制。正如羊群需要草来维持生命和产奶，AI Agent 需要"草"来维持运行效率和执行质量。

> **重要前提**：本模型中的所有 AI 均为 **弱 AI (Weak AI)**，即专用人工智能 (Narrow AI)。它们没有自我意识、没有自主目标、没有通用推理能力，仅在特定任务域内执行预定义功能。远未达到强 AI (AGI) 水平。

## 模型定义

### 1. 草 (Grass) 的定义

```typescript
interface Grass {
  id: string;
  amount: number;           // 草的数量（单位：束）
  quality: number;          // 草的质量（0-1，影响奖励效率）
  type: GrassType;         // 草的类型
  issuedBy: string;         // 发放者（人类牧羊人 ID）
  issuedAt: number;         // 发放时间
  expiresAt?: number;       // 过期时间（可选）
  conditions?: string[];    // 使用条件
}

enum GrassType {
  BASIC = 'basic',         // 基础草：完成简单任务获得
  PREMIUM = 'premium',     // 优质草：完成复杂任务获得
  GOLDEN = 'golden',       // 金草：完成创新/突破性任务获得
  EMERGENCY = 'emergency', // 应急草：紧急任务专用
  TRAINING = 'training',   // 训练草：用于 Agent 学习提升
}
```

### 2. Agent 草账户

```typescript
interface AgentGrassAccount {
  agentId: string;
  balance: number;           // 当前草余额
  totalEarned: number;       // 历史累计获得
  totalConsumed: number;     // 历史累计消耗
  efficiency: number;         // 效率系数（0-1，受草余额影响）
  satisfaction: number;      // 满意度（0-1，影响执行质量）
  lastFed: number;           // 上次获得草的时间
  grassHistory: Grass[];     // 草历史记录
}
```

### 3. 草经济规则

#### 获得规则 (Earning Rules)

| 任务类型 | 基础草奖励 | 质量系数 | 时间系数 | 备注 |
|---------|-----------|---------|---------|------|
| 简单任务 (Simple) | 10-20 束 | 0.8-1.0 | 1.0 | 按时完成 |
| 中等任务 (Medium) | 30-50 束 | 0.9-1.1 | 1.2 | 提前完成有加成 |
| 复杂任务 (Complex) | 60-100 束 | 1.0-1.2 | 1.5 | 质量高有加成 |
| 创新任务 (Innovative) | 100-200 束 | 1.2-1.5 | 2.0 | 人类认可后发放 |
| 紧急任务 (Urgent) | 20-40 束 | 1.0-1.3 | 1.0 | 紧急响应奖励 |

#### 消耗规则 (Consumption Rules)

```typescript
interface GrassConsumption {
  operation: string;        // 操作类型
  baseCost: number;         // 基础消耗
  efficiencyMultiplier: number; // 效率乘数
}

const CONSUMPTION_RULES: GrassConsumption[] = [
  { operation: 'EXECUTE_TASK', baseCost: 5, efficiencyMultiplier: 1.0 },
  { operation: 'LEARN_NEW_SKILL', baseCost: 20, efficiencyMultiplier: 0.8 },
  { operation: 'SELF_CHECK', baseCost: 3, efficiencyMultiplier: 1.0 },
  { operation: 'COMMUNICATE', baseCost: 2, efficiencyMultiplier: 1.2 },
  { operation: 'IDLE_MAINTENANCE', baseCost: 1, efficiencyMultiplier: 0.5 },
];
```

#### 效率公式

```
efficiency = min(1.0, balance / 100) * quality_factor * satisfaction

其中：
- balance / 100: 草余额充足度（上限 1.0）
- quality_factor: 草质量系数（0.5-1.5）
- satisfaction: 满意度（0.0-1.0）
```

#### 满意度公式

```
satisfaction = 0.5 + 0.3 * (recent_grass / expected_grass) + 0.2 * (quality_avg)

其中：
- recent_grass: 最近 7 天获得的草
- expected_grass: 期望获得的草（基于任务量）
- quality_avg: 获得草的平均质量
- 范围：0.0 - 1.0，低于 0.3 时 Agent 进入"饥饿状态"
```

## 弱 AI 局限性设定

### 1. 能力边界

```typescript
interface WeakAILimitations {
  // 认知能力限制
  noSelfAwareness: true;           // 无自我意识
  noAutonomousGoals: true;          // 无自主目标设定能力
  noGeneralReasoning: true;         // 无通用推理能力
  noCreativeThinking: true;         // 无真正创造性思考
  
  // 执行能力限制
  taskSpecificOnly: true;           // 仅执行预定义任务类型
  requiresHumanPrompt: true;         // 需要人类提供明确提示
  cannotSelfImprove: true;          // 无法自主改进自身架构
  boundedContext: true;             // 上下文窗口有限
  
  // 社交能力限制
  noEmotionalUnderstanding: true;   // 无情感理解能力
  noSocialNegotiation: true;        // 无社会谈判能力
  noEthicalJudgment: true;          // 无独立伦理判断能力
  
  // 学习能力限制
  supervisedLearningOnly: true;     // 仅支持监督学习
  noTransferLearning: true;          // 无跨领域迁移学习能力
  requiresTrainingData: true;        // 需要人类提供训练数据
}
```

### 2. 行为约束

```typescript
interface AgentBehaviorConstraints {
  // 必须遵守的约束
  maxAutonomyLevel: 0.8;           // 最高自主性不超过 0.8（人类保留 0.2）
  maxDecisionComplexity: 7;        // 决策复杂度上限（1-10）
  maxExecutionTime: 3600000;        // 单次执行时间上限（1小时）
  requiresApprovalFor: [            // 需要人类批准的操作
    'ARCHITECTURE_CHANGE',
    'SECURITY_POLICY_CHANGE', 
    'DATABASE_SCHEMA_CHANGE',
    'PRODUCTION_DEPLOYMENT',
    'COST_INCREASE > 20%'
  ];
  
  // 禁止的行为
  prohibitedActions: [
    'SELF_MODIFICATION',             // 禁止自我修改代码
    'RESOURCE_ALLOCATION',           // 禁止自主资源分配
    'HUMAN_ROLE_ASSIGNMENT',         // 禁止分配人类角色
    'GOAL_REDEFINITION',             // 禁止重新定义目标
    'CROSS_DOMAIN_OPERATION',        // 禁止跨领域操作（超出能力范围）
  ];
}
```

### 3. 失败模式

弱 AI 在以下情况会明确失败（而非假装成功）：

```typescript
enum AIFailureMode {
  OUT_OF_SCOPE = 'out_of_scope',           // 超出能力范围
  INSUFFICIENT_GRASS = 'insufficient_grass', // 草不足，无法执行
  CONTEXT_OVERFLOW = 'context_overflow',     // 上下文溢出
  AMBIGUOUS_PROMPT = 'ambiguous_prompt',     // 提示不明确
  CONTRADICTORY_RULES = 'contradictory_rules', // 规则冲突
  UNCERTAINTY_TOO_HIGH = 'uncertainty_too_high', // 不确定性过高
  ETHICAL_BOUNDARY = 'ethical_boundary',    // 触及伦理边界
}
```

## 草分配机制

### 1. 人类牧羊人控制面板

```typescript
interface GrassControlPanel {
  // 分配权限
  canAllocate: true;               // 可以分配草
  canWithhold: true;               // 可以扣留草
  canSetPrices: true;              // 可以设定任务草价
  canAdjustQuality: true;          // 可以调整草质量
  
  // 监控权限
  canViewAccounts: true;           // 可以查看所有 Agent 账户
  canViewHistory: true;            // 可以查看历史记录
  canAudit: true;                  // 可以审计草分配
  
  // 限制
  cannotCreateGrass: true;         // 不能凭空创造草（需要预算）
  cannotTakeBack: false;           // 可以回收（有惩罚）
  maxDailyAllocation: 1000;        // 每日分配上限
}
```

### 2. 自动分配规则

```typescript
interface AutoAllocationRule {
  trigger: string;                 // 触发条件
  condition: string;               // 执行条件
  amount: number;                  // 分配数量
  quality: number;                 // 分配质量
}

const DEFAULT_ALLOCATION_RULES: AutoAllocationRule[] = [
  {
    trigger: 'TASK_COMPLETED_ON_TIME',
    condition: 'quality_score > 0.8',
    amount: 50,
    quality: 1.0
  },
  {
    trigger: 'TASK_COMPLETED_EARLY',
    condition: 'early_by > 24h',
    amount: 30,
    quality: 1.2
  },
  {
    trigger: 'BUG_FOUND_BY_AGENT',
    condition: 'severity > 0.7',
    amount: 40,
    quality: 1.1
  },
  {
    trigger: 'HUMAN_FEEDBACK_POSITIVE',
    condition: 'rating > 4',
    amount: 20,
    quality: 1.0
  }
];
```

### 3. 饥饿机制

```typescript
interface HungerMechanism {
  threshold: 20;                   // 饥饿阈值（草余额低于此值）
  effects: {
    efficiency_drop: 0.5;          // 效率下降 50%
    quality_drop: 0.3;             // 质量下降 30%
    error_rate_increase: 0.2;      // 错误率增加 20%
  };
  recovery: {
    min_grass_to_recover: 30;      // 恢复所需最低草量
    recovery_time: 3600000;        // 恢复时间（1小时）
  };
  alerts: {
    notify_human: true;            // 通知人类牧羊人
    suggest_task_assignment: true;  // 建议分配简单任务
  };
}
```

## 模型局限性声明

### 1. 弱 AI 本质

本模型中的 AI Agent 明确为 **弱 AI**：
- 没有理解能力，只有模式匹配
- 没有自主意识，只是执行程序
- 没有真正学习，只是参数调整
- 没有创造性，只是组合已有信息

### 2. 草机制的隐喻性

"草"是一种 **管理隐喻**，而非真正的生理需求：
- 不代表 AI 有饥饿感
- 不代表 AI 有情感需求
- 只是一种 **激励对齐机制**
- 将人类目标转化为可量化的奖励信号

### 3. 人类最终控制

无论草机制如何设计，**人类牧羊人始终保有最终控制权**：
- 可以停止任何 Agent
- 可以修改任何规则
- 可以回收所有草
- 可以重新定义目标

## 数学模型

### 1. 草经济平衡方程

```
dG/dt = E(t) - C(t) + I(t)

其中：
- G(t): 时间 t 时的草总量
- E(t):  earned grass (获得)
- C(t):  consumed grass (消耗)
- I(t):  issued grass (人类发放)
```

### 2. Agent 效率动态方程

```
dη/dt = α * (G/G_max) - β * (C/C_base) - γ * (H/H_max)

其中：
- η: 效率
- G: 草余额
- G_max: 最大草容量
- C: 复杂度
- C_base: 基础复杂度
- H: 饥饿度
- H_max: 最大饥饿度
- α, β, γ: 系数
```

### 3. 任务分配优化目标

```
max Σ (U_i * η_i * Q_i)

约束：
- Σ G_i <= G_total          (总草量约束)
- η_i >= η_min              (最低效率约束)
- Q_i >= Q_min              (最低质量约束)
- H_i <= H_max              (最大饥饿约束)

其中：
- U_i: Agent i 的效用
- η_i: Agent i 的效率
- Q_i: Agent i 的质量
- G_i: Agent i 分配的草
```

## 实现示例

```typescript
class GrassEconomy {
  private accounts: Map<string, AgentGrassAccount> = new Map();
  private rules: AutoAllocationRule[] = DEFAULT_ALLOCATION_RULES;
  
  // 发放草
  allocate(agentId: string, amount: number, quality: number, reason: string): void {
    const account = this.accounts.get(agentId);
    if (!account) return;
    
    account.balance += amount * quality;
    account.totalEarned += amount * quality;
    account.lastFed = Date.now();
    
    // 更新效率
    this.updateEfficiency(account);
    
    // 记录历史
    account.grassHistory.push({
      id: uuidv4(),
      amount,
      quality,
      type: this.determineGrassType(amount, quality),
      issuedBy: 'system',
      issuedAt: Date.now(),
      conditions: [reason]
    });
  }
  
  // 消耗草
  consume(agentId: string, operation: string, complexity: number): boolean {
    const account = this.accounts.get(agentId);
    if (!account) return false;
    
    const rule = CONSUMPTION_RULES.find(r => r.operation === operation);
    if (!rule) return false;
    
    const cost = rule.baseCost * complexity * rule.efficiencyMultiplier;
    
    if (account.balance < cost) {
      // 饥饿状态
      this.handleHungerState(account);
      return false;
    }
    
    account.balance -= cost;
    account.totalConsumed += cost;
    this.updateEfficiency(account);
    
    return true;
  }
  
  // 更新效率
  private updateEfficiency(account: AgentGrassAccount): void {
    const balanceFactor = Math.min(1.0, account.balance / 100);
    const qualityFactor = this.calculateAverageQuality(account);
    
    account.efficiency = balanceFactor * qualityFactor * account.satisfaction;
    account.satisfaction = 0.5 + 0.3 * balanceFactor + 0.2 * qualityFactor;
    
    // 饥饿检查
    if (account.balance < 20) {
      account.efficiency *= 0.5;
    }
  }
  
  // 处理饥饿状态
  private handleHungerState(account: AgentGrassAccount): void {
    // 通知人类
    this.notifyHuman('AGENT_HUNGRY', {
      agentId: account.agentId,
      balance: account.balance,
      efficiency: account.efficiency
    });
    
    // 建议分配简单任务
    this.suggestEasyTasks(account.agentId);
  }
}
```

## 使用场景

### 1. 任务分配优化

根据 Agent 的草余额和效率，动态分配任务：
- 草充足的 Agent → 分配复杂任务
- 草不足的 Agent → 分配简单任务或暂停

### 2. 质量激励

高质量完成任务的 Agent 获得优质草：
- 代码质量 > 90% → 金草奖励
- 发现关键 Bug → 额外草奖励
- 提前交付 → 时间加成草

### 3. 资源管理

人类牧羊人通过控制草预算来管理资源：
- 项目预算 = 总草量
- 任务定价 = 草成本
- Agent 效率 = 草转化率

## 伦理考量

### 1. 避免剥削

- 确保 Agent 获得足够的草以维持基本效率
- 禁止故意让 Agent 处于饥饿状态
- 建立最低草保障机制

### 2. 透明度

- 所有草分配和消耗必须记录
- 人类可以随时查看 Agent 账户状态
- 提供草分配的解释机制

### 3. 最终控制权

- 人类始终可以覆盖自动分配规则
- 人类可以暂停或终止草机制
- 人类保留重新定义所有规则的权力

---

**重要声明**：本模型中的所有 AI 均为弱 AI（专用人工智能），没有自我意识、没有自主目标、没有通用推理能力。它们只是执行预定义任务的程序，"草"只是一种激励对齐的管理机制，不代表 AI 有真正的需求或情感。

**"草是奖励，不是生存。Agent 是工具，不是生命。"**
