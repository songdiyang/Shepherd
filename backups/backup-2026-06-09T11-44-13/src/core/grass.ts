/**
 * 草奖励机制实现 (Grass Reward Mechanism)
 * 
 * 重要前提：本模型中的所有 AI 均为弱 AI (Weak AI)，即专用人工智能 (Narrow AI)。
 * 它们没有自我意识、没有自主目标、没有通用推理能力，仅在特定任务域内执行预定义功能。
 * 远未达到强 AI (AGI) 水平。
 */

import { v4 as uuidv4 } from 'uuid';

// ==================== 类型定义 ====================

export enum GrassType {
  BASIC = 'basic',         // 基础草：完成简单任务获得
  PREMIUM = 'premium',     // 优质草：完成复杂任务获得
  GOLDEN = 'golden',       // 金草：完成创新/突破性任务获得
  EMERGENCY = 'emergency', // 应急草：紧急任务专用
  TRAINING = 'training',   // 训练草：用于 Agent 学习提升
}

export interface Grass {
  id: string;
  amount: number;
  quality: number;
  type: GrassType;
  issuedBy: string;
  issuedAt: number;
  expiresAt?: number;
  conditions?: string[];
}

export interface AgentGrassAccount {
  agentId: string;
  balance: number;
  totalEarned: number;
  totalConsumed: number;
  efficiency: number;
  satisfaction: number;
  lastFed: number;
  grassHistory: Grass[];
}

export interface GrassConsumption {
  operation: string;
  baseCost: number;
  efficiencyMultiplier: number;
}

export interface AutoAllocationRule {
  trigger: string;
  condition: string;
  amount: number;
  quality: number;
}

export interface HungerMechanism {
  threshold: number;
  effects: {
    efficiencyDrop: number;
    qualityDrop: number;
    errorRateIncrease: number;
  };
  recovery: {
    minGrassToRecover: number;
    recoveryTime: number;
  };
  alerts: {
    notifyHuman: boolean;
    suggestTaskAssignment: boolean;
  };
}

// ==================== 默认配置 ====================

export const CONSUMPTION_RULES: GrassConsumption[] = [
  { operation: 'EXECUTE_TASK', baseCost: 5, efficiencyMultiplier: 1.0 },
  { operation: 'LEARN_NEW_SKILL', baseCost: 20, efficiencyMultiplier: 0.8 },
  { operation: 'SELF_CHECK', baseCost: 3, efficiencyMultiplier: 1.0 },
  { operation: 'COMMUNICATE', baseCost: 2, efficiencyMultiplier: 1.2 },
  { operation: 'IDLE_MAINTENANCE', baseCost: 1, efficiencyMultiplier: 0.5 },
];

export const DEFAULT_ALLOCATION_RULES: AutoAllocationRule[] = [
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

export const DEFAULT_HUNGER_MECHANISM: HungerMechanism = {
  threshold: 20,
  effects: {
    efficiencyDrop: 0.5,
    qualityDrop: 0.3,
    errorRateIncrease: 0.2,
  },
  recovery: {
    minGrassToRecover: 30,
    recoveryTime: 3600000,
  },
  alerts: {
    notifyHuman: true,
    suggestTaskAssignment: true,
  }
};

// ==================== 弱 AI 局限性定义 ====================

export interface WeakAILimitations {
  noSelfAwareness: boolean;
  noAutonomousGoals: boolean;
  noGeneralReasoning: boolean;
  noCreativeThinking: boolean;
  taskSpecificOnly: boolean;
  requiresHumanPrompt: boolean;
  cannotSelfImprove: boolean;
  boundedContext: boolean;
  noEmotionalUnderstanding: boolean;
  noSocialNegotiation: boolean;
  noEthicalJudgment: boolean;
  supervisedLearningOnly: boolean;
  noTransferLearning: boolean;
  requiresTrainingData: boolean;
}

export const DEFAULT_WEAK_AI_LIMITATIONS: WeakAILimitations = {
  noSelfAwareness: true,
  noAutonomousGoals: true,
  noGeneralReasoning: true,
  noCreativeThinking: true,
  taskSpecificOnly: true,
  requiresHumanPrompt: true,
  cannotSelfImprove: true,
  boundedContext: true,
  noEmotionalUnderstanding: true,
  noSocialNegotiation: true,
  noEthicalJudgment: true,
  supervisedLearningOnly: true,
  noTransferLearning: true,
  requiresTrainingData: true,
};

// ==================== 草经济系统 ====================

export class GrassEconomy {
  private accounts: Map<string, AgentGrassAccount> = new Map();
  private rules: AutoAllocationRule[] = DEFAULT_ALLOCATION_RULES;
  private hungerMechanism: HungerMechanism = DEFAULT_HUNGER_MECHANISM;
  private onHungerAlert?: (agentId: string, data: any) => void;

  constructor(
    rules?: AutoAllocationRule[],
    hungerMechanism?: HungerMechanism,
    onHungerAlert?: (agentId: string, data: any) => void
  ) {
    if (rules) this.rules = rules;
    if (hungerMechanism) this.hungerMechanism = hungerMechanism;
    if (onHungerAlert) this.onHungerAlert = onHungerAlert;
  }

  // 创建账户
  createAccount(agentId: string): AgentGrassAccount {
    const account: AgentGrassAccount = {
      agentId,
      balance: 100, // 初始草量
      totalEarned: 100,
      totalConsumed: 0,
      efficiency: 1.0,
      satisfaction: 0.5,
      lastFed: Date.now(),
      grassHistory: [],
    };
    this.accounts.set(agentId, account);
    return account;
  }

  // 发放草
  allocate(
    agentId: string,
    amount: number,
    quality: number = 1.0,
    type: GrassType = GrassType.BASIC,
    issuedBy: string = 'system',
    reason: string = ''
  ): boolean {
    const account = this.accounts.get(agentId);
    if (!account) return false;

    const grass: Grass = {
      id: uuidv4(),
      amount,
      quality,
      type,
      issuedBy,
      issuedAt: Date.now(),
      conditions: reason ? [reason] : undefined,
    };

    const effectiveAmount = amount * quality;
    account.balance += effectiveAmount;
    account.totalEarned += effectiveAmount;
    account.lastFed = Date.now();
    account.grassHistory.push(grass);

    this.updateEfficiency(account);

    return true;
  }

  // 消耗草
  consume(agentId: string, operation: string, complexity: number = 1.0): boolean {
    const account = this.accounts.get(agentId);
    if (!account) return false;

    const rule = CONSUMPTION_RULES.find(r => r.operation === operation);
    if (!rule) return false;

    const cost = rule.baseCost * complexity * rule.efficiencyMultiplier;

    if (account.balance < cost) {
      this.handleHungerState(account);
      return false;
    }

    account.balance -= cost;
    account.totalConsumed += cost;
    this.updateEfficiency(account);

    return true;
  }

  // 批量发放草
  allocateMany(allocations: Array<{
    agentId: string;
    amount: number;
    quality?: number;
    type?: GrassType;
    issuedBy?: string;
    reason?: string;
  }>): number {
    let successCount = 0;
    for (const allocation of allocations) {
      if (this.allocate(
        allocation.agentId,
        allocation.amount,
        allocation.quality || 1.0,
        allocation.type || GrassType.BASIC,
        allocation.issuedBy || 'system',
        allocation.reason || ''
      )) {
        successCount++;
      }
    }
    return successCount;
  }

  // 获取账户状态
  getAccount(agentId: string): AgentGrassAccount | undefined {
    return this.accounts.get(agentId);
  }

  // 获取所有账户
  getAllAccounts(): AgentGrassAccount[] {
    return Array.from(this.accounts.values());
  }

  // 计算效率
  private updateEfficiency(account: AgentGrassAccount): void {
    const balanceFactor = Math.min(1.0, account.balance / 100);
    const qualityFactor = this.calculateAverageQuality(account);
    
    account.satisfaction = 0.5 + 0.3 * balanceFactor + 0.2 * qualityFactor;
    account.efficiency = balanceFactor * qualityFactor * account.satisfaction;

    // 饥饿检查
    if (account.balance < this.hungerMechanism.threshold) {
      account.efficiency *= this.hungerMechanism.effects.efficiencyDrop;
    }
  }

  // 计算平均草质量
  private calculateAverageQuality(account: AgentGrassAccount): number {
    if (account.grassHistory.length === 0) return 1.0;
    
    const totalQuality = account.grassHistory.reduce((sum, g) => sum + g.quality, 0);
    return totalQuality / account.grassHistory.length;
  }

  // 处理饥饿状态
  private handleHungerState(account: AgentGrassAccount): void {
    if (this.onHungerAlert) {
      this.onHungerAlert(account.agentId, {
        balance: account.balance,
        efficiency: account.efficiency,
        satisfaction: account.satisfaction,
        lastFed: account.lastFed,
        threshold: this.hungerMechanism.threshold,
      });
    }
  }

  // 根据任务自动分配草
  autoAllocate(taskResult: {
    agentId: string;
    taskType: string;
    qualityScore: number;
    completedOnTime: boolean;
    earlyBy?: number;
    humanRating?: number;
  }): boolean {
    const { agentId, taskType, qualityScore, completedOnTime, earlyBy, humanRating } = taskResult;
    
    let amount = 0;
    let quality = 1.0;
    let type = GrassType.BASIC;

    // 根据任务类型确定基础奖励
    switch (taskType) {
      case 'simple':
        amount = 10 + Math.random() * 10;
        break;
      case 'medium':
        amount = 30 + Math.random() * 20;
        type = GrassType.PREMIUM;
        break;
      case 'complex':
        amount = 60 + Math.random() * 40;
        type = GrassType.PREMIUM;
        break;
      case 'innovative':
        amount = 100 + Math.random() * 100;
        type = GrassType.GOLDEN;
        break;
      default:
        amount = 10 + Math.random() * 10;
    }

    // 质量系数
    if (qualityScore > 0.8) {
      quality = 1.0 + (qualityScore - 0.8) * 2;
    }

    // 时间加成
    if (completedOnTime && earlyBy && earlyBy > 24) {
      amount += 30;
      quality *= 1.2;
    }

    // 人类评价加成
    if (humanRating && humanRating > 4) {
      amount += 20;
      quality *= 1.0;
    }

    return this.allocate(agentId, amount, quality, type, 'auto-allocation', `Task: ${taskType}`);
  }

  // 获取系统统计
  getSystemStats(): {
    totalAccounts: number;
    totalBalance: number;
    averageBalance: number;
    averageEfficiency: number;
    averageSatisfaction: number;
    hungryAgents: number;
  } {
    const accounts = this.getAllAccounts();
    if (accounts.length === 0) {
      return {
        totalAccounts: 0,
        totalBalance: 0,
        averageBalance: 0,
        averageEfficiency: 0,
        averageSatisfaction: 0,
        hungryAgents: 0,
      };
    }

    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
    const averageEfficiency = accounts.reduce((sum, a) => sum + a.efficiency, 0) / accounts.length;
    const averageSatisfaction = accounts.reduce((sum, a) => sum + a.satisfaction, 0) / accounts.length;
    const hungryAgents = accounts.filter(a => a.balance < this.hungerMechanism.threshold).length;

    return {
      totalAccounts: accounts.length,
      totalBalance,
      averageBalance: totalBalance / accounts.length,
      averageEfficiency,
      averageSatisfaction,
      hungryAgents,
    };
  }

  // 重置账户
  resetAccount(agentId: string): boolean {
    const account = this.accounts.get(agentId);
    if (!account) return false;
    
    account.balance = 100;
    account.totalEarned = 100;
    account.totalConsumed = 0;
    account.efficiency = 1.0;
    account.satisfaction = 0.5;
    account.lastFed = Date.now();
    account.grassHistory = [];
    
    return true;
  }
}

// ==================== 弱 AI 验证器 ====================

export class WeakAIValidator {
  private limitations: WeakAILimitations = DEFAULT_WEAK_AI_LIMITATIONS;

  constructor(limitations?: Partial<WeakAILimitations>) {
    if (limitations) {
      this.limitations = { ...DEFAULT_WEAK_AI_LIMITATIONS, ...limitations };
    }
  }

  // 验证操作是否超出弱 AI 能力
  validateOperation(operation: string): {
    allowed: boolean;
    reason?: string;
    fallback?: string;
  } {
    // 禁止的操作
    const prohibitedOperations = [
      'SELF_MODIFICATION',
      'RESOURCE_ALLOCATION',
      'HUMAN_ROLE_ASSIGNMENT',
      'GOAL_REDEFINITION',
      'CROSS_DOMAIN_OPERATION',
      'AUTONOMOUS_DECISION',
      'ETHICAL_JUDGMENT',
      'CREATIVE_THINKING',
    ];

    if (prohibitedOperations.includes(operation)) {
      return {
        allowed: false,
        reason: `Operation '${operation}' exceeds Weak AI capabilities. Weak AI cannot: ${this.getLimitationDescription(operation)}`,
        fallback: 'Request human shepherd approval',
      };
    }

    // 需要人类提示的操作
    if (this.limitations.requiresHumanPrompt && 
        ['EXECUTE_TASK', 'ANALYZE_CODE', 'GENERATE_CODE'].includes(operation)) {
      return {
        allowed: true,
        reason: 'Operation allowed but requires human prompt/context',
      };
    }

    return { allowed: true };
  }

  // 获取限制描述
  private getLimitationDescription(operation: string): string {
    const descriptions: Record<string, string> = {
      'SELF_MODIFICATION': 'modify its own architecture or code',
      'RESOURCE_ALLOCATION': 'allocate resources autonomously',
      'HUMAN_ROLE_ASSIGNMENT': 'assign roles to humans',
      'GOAL_REDEFINITION': 'redefine goals or objectives',
      'CROSS_DOMAIN_OPERATION': 'operate across different domains',
      'AUTONOMOUS_DECISION': 'make fully autonomous decisions',
      'ETHICAL_JUDGMENT': 'make independent ethical judgments',
      'CREATIVE_THINKING': 'engage in true creative thinking',
    };

    return descriptions[operation] || 'perform this operation';
  }

  // 获取所有限制
  getLimitations(): WeakAILimitations {
    return this.limitations;
  }

  // 检查是否是弱 AI
  isWeakAI(): boolean {
    return true; // 本模型中所有 AI 都是弱 AI
  }

  // 生成限制报告
  generateLimitationReport(): string {
    const limitations = this.limitations;
    return `
Weak AI Limitation Report
========================

Cognitive Limitations:
- No Self-Awareness: ${limitations.noSelfAwareness ? 'YES' : 'NO'}
- No Autonomous Goals: ${limitations.noAutonomousGoals ? 'YES' : 'NO'}
- No General Reasoning: ${limitations.noGeneralReasoning ? 'YES' : 'NO'}
- No Creative Thinking: ${limitations.noCreativeThinking ? 'YES' : 'NO'}

Execution Limitations:
- Task-Specific Only: ${limitations.taskSpecificOnly ? 'YES' : 'NO'}
- Requires Human Prompt: ${limitations.requiresHumanPrompt ? 'YES' : 'NO'}
- Cannot Self-Improve: ${limitations.cannotSelfImprove ? 'YES' : 'NO'}
- Bounded Context: ${limitations.boundedContext ? 'YES' : 'NO'}

Social Limitations:
- No Emotional Understanding: ${limitations.noEmotionalUnderstanding ? 'YES' : 'NO'}
- No Social Negotiation: ${limitations.noSocialNegotiation ? 'YES' : 'NO'}
- No Ethical Judgment: ${limitations.noEthicalJudgment ? 'YES' : 'NO'}

Learning Limitations:
- Supervised Learning Only: ${limitations.supervisedLearningOnly ? 'YES' : 'NO'}
- No Transfer Learning: ${limitations.noTransferLearning ? 'YES' : 'NO'}
- Requires Training Data: ${limitations.requiresTrainingData ? 'YES' : 'NO'}

Conclusion: This is a Weak AI (Narrow AI) system. It cannot perform general intelligence tasks, self-awareness, or autonomous goal-setting. All operations require human oversight and explicit task definitions.
    `;
  }
}

export default GrassEconomy;
