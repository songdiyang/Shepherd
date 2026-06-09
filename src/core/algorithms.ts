/**
 * 核心算法实现
 * 基于 SAF 理论框架的形式化定义
 */

import {
  Task,
  EnvironmentState,
  DelegationFeasibility,
  DelegationAssessment,
  CollaborationMode,
  InterventionPolicy,
  InterventionRule,
  InterventionAction,
  RuleCondition,
  AgentAction,
  Observation,
  Anomaly,
  Alert,
  EnvironmentShapingFunction,
  GoalSpecification,
  ConstraintModification,
  Agent,
  AgentLevel,
  TaskStatus,
  AuditRecord,
  UUID,
  ActorType,
  ShepherdOperator,
} from './models';

// ==================== 委托可行性评估器 ====================

/**
 * 基于命题2的三维度评估算法
 * 
 * 委托可行性函数: DF(t) = (V(t), O(t), R(t))
 * 其中:
 *   V(t) = 可验证性 [0.0, 1.0]
 *   O(t) = 可观测性 [0.0, 1.0]  
 *   R(t) = 责任风险 [0.0, 1.0] (越高越危险)
 */
export class DelegationFeasibilityEvaluator {
  
  /**
   * 评估任务的可验证性
   * 高可验证性 = 有自动化测试/编译器可验证
   */
  assessVerifiability(task: Task): number {
    const indicators = [
      this.hasAutomatedTests(task),
      this.hasCompilerVerification(task),
      this.hasFormalSpecification(task),
      this.hasClearAcceptanceCriteria(task),
    ];
    
    const score = indicators.filter(Boolean).length / indicators.length;
    return this.normalizeScore(score);
  }
  
  /**
   * 评估任务的可观测性
   * 高可观测性 = 决策过程可解释、日志完整
   */
  assessObservability(task: Task): number {
    const indicators = [
      this.hasExplainableProcess(task),
      this.hasCompleteLogging(task),
      this.hasTraceableDecisions(task),
      this.hasHumanReadableOutput(task),
    ];
    
    const score = indicators.filter(Boolean).length / indicators.length;
    return this.normalizeScore(score);
  }
  
  /**
   * 评估任务的责任风险
   * 高风险 = 涉及安全/法律/核心业务
   */
  assessAccountabilityRisk(task: Task): number {
    const riskFactors = [
      this.involvesSecurity(task),
      this.involvesLegalCompliance(task),
      this.involvesCoreBusinessLogic(task),
      this.hasIrreversibleEffects(task),
      this.affectsProductionData(task),
    ];
    
    const score = riskFactors.filter(Boolean).length / riskFactors.length;
    return this.normalizeScore(score);
  }
  
  /**
   * 综合评估委托可行性
   * 
   * 委托可行性得分:
   *   df_score = 0.4 * V + 0.3 * O - 0.3 * R
   * 
   * 权重设计原理:
   *   - 可验证性最重要 (40%): 如果输出可验证，即使过程不透明也可委托
   *   - 可观测性次之 (30%): 过程透明增强信任，但不如可验证性关键
   *   - 责任风险负向 (30%): 高风险任务即使可验证也应谨慎
   */
  evaluate(task: Task, context: EnvironmentState): DelegationAssessment {
    const v = this.assessVerifiability(task);
    const o = this.assessObservability(task);
    const r = this.assessAccountabilityRisk(task);
    
    const dfScore = 0.4 * v + 0.3 * o - 0.3 * r;
    
    // 动态阈值（基于组织治理成熟度）
    const governanceMaturity = context.constraints.complianceRules.length > 0 ? 0.7 : 0.5;
    const threshold = governanceMaturity * 0.5 + 0.3;
    
    const recommendedMode = dfScore >= threshold 
      ? CollaborationMode.AGENT 
      : CollaborationMode.COPILOT;
    
    const confidence = this.calculateConfidence(v, o, r);
    
    const rationale = this.generateRationale(task, v, o, r, recommendedMode);
    
    return {
      feasibility: { verifiability: v, observability: o, accountabilityRisk: r },
      dfScore,
      threshold,
      recommendedMode,
      confidence,
      rationale,
    };
  }
  
  // ----- 辅助方法 -----
  
  private hasAutomatedTests(task: Task): boolean {
    return task.tags.includes('testable') || 
           task.tags.includes('unit-test') ||
           task.title.toLowerCase().includes('test');
  }
  
  private hasCompilerVerification(task: Task): boolean {
    return task.tags.includes('code') || 
           task.tags.includes('implementation') ||
           task.deliverables.some(d => d.type === 'CODE');
  }
  
  private hasFormalSpecification(task: Task): boolean {
    return task.tags.includes('specified') || 
           task.description.includes('spec') ||
           task.description.includes('interface');
  }
  
  private hasClearAcceptanceCriteria(task: Task): boolean {
    return task.description.includes('AC:') ||
           task.description.includes('acceptance') ||
           task.deliverables.length > 0;
  }
  
  private hasExplainableProcess(task: Task): boolean {
    return task.tags.includes('explainable') ||
           !task.tags.includes('black-box');
  }
  
  private hasCompleteLogging(task: Task): boolean {
    return task.tags.includes('logged') ||
           task.tags.includes('auditable');
  }
  
  private hasTraceableDecisions(task: Task): boolean {
    return task.tags.includes('traceable') ||
           task.tags.includes('decision-record');
  }
  
  private hasHumanReadableOutput(task: Task): boolean {
    return task.deliverables.some(d => d.type === 'DOCUMENT') ||
           task.tags.includes('documented');
  }
  
  private involvesSecurity(task: Task): boolean {
    return task.tags.includes('security') ||
           task.tags.includes('auth') ||
           task.tags.includes('encryption') ||
           task.title.toLowerCase().includes('security');
  }
  
  private involvesLegalCompliance(task: Task): boolean {
    return task.tags.includes('compliance') ||
           task.tags.includes('gdpr') ||
           task.tags.includes('sox') ||
           task.tags.includes('legal');
  }
  
  private involvesCoreBusinessLogic(task: Task): boolean {
    return task.tags.includes('core-business') ||
           task.tags.includes('critical') ||
           task.priority >= 4;
  }
  
  private hasIrreversibleEffects(task: Task): boolean {
    return task.tags.includes('irreversible') ||
           task.tags.includes('production-deploy') ||
           task.tags.includes('data-migration');
  }
  
  private affectsProductionData(task: Task): boolean {
    return task.tags.includes('production') ||
           task.tags.includes('database') ||
           task.tags.includes('data-migration');
  }
  
  private normalizeScore(score: number): number {
    return Math.max(0, Math.min(1, score));
  }
  
  private calculateConfidence(v: number, o: number, r: number): number {
    // 当三个维度评估一致时（都高或都低），置信度高
    const variance = Math.abs(v - o) + Math.abs(o - r) + Math.abs(v - r);
    return 1 - (variance / 3);
  }
  
  private generateRationale(
    task: Task, 
    v: number, 
    o: number, 
    r: number, 
    mode: CollaborationMode
  ): string {
    const parts = [
      `任务 "${task.title}" 的委托评估:`,
      `- 可验证性: ${(v * 100).toFixed(1)}%`,
      `- 可观测性: ${(o * 100).toFixed(1)}%`,
      `- 责任风险: ${(r * 100).toFixed(1)}%`,
      ``,
      `推荐模式: ${mode}`,
      mode === CollaborationMode.AGENT
        ? '该任务具有高可验证性和低责任风险，适合AI自主执行。'
        : '该任务涉及高风险决策或难以验证，需要人机同步协作。',
    ];
    return parts.join('\n');
  }
}

// ==================== 模式选择器 ====================

/**
 * 基于委托评估结果选择协作模式
 */
export class ModeSelector {
  private evaluator: DelegationFeasibilityEvaluator;
  
  constructor() {
    this.evaluator = new DelegationFeasibilityEvaluator();
  }
  
  selectMode(task: Task, context: EnvironmentState): DelegationAssessment {
    return this.evaluator.evaluate(task, context);
  }
  
  /**
   * 批量选择模式（用于任务分解后的子任务）
   */
  selectModes(tasks: Task[], context: EnvironmentState): Map<UUID, DelegationAssessment> {
    const results = new Map<UUID, DelegationAssessment>();
    for (const task of tasks) {
      results.set(task.id, this.selectMode(task, context));
    }
    return results;
  }
}

// ==================== 干预策略引擎 ====================

/**
 * 干预策略 φ 的实现
 * 基于牧羊人操作者的五元组定义
 */
export class InterventionEngine {
  private policy: InterventionPolicy;
  private alertHistory: Alert[] = [];
  
  constructor(policy: InterventionPolicy) {
    this.policy = policy;
  }
  
  /**
   * 评估是否需要干预
   */
  shouldIntervene(
    action: AgentAction, 
    state: EnvironmentState
  ): { action: InterventionAction; reason: string } | null {
    // 按优先级排序规则
    const sortedRules = [...this.policy.rules].sort((a, b) => a.priority - b.priority);
    
    for (const rule of sortedRules) {
      if (this.evaluateCondition(rule.condition, action, state)) {
        return {
          action: rule.action,
          reason: `规则 "${rule.name}" 触发: ${rule.condition.type}`,
        };
      }
    }
    
    // 默认行为
    return this.policy.defaultAction !== InterventionAction.NOTIFY
      ? { action: this.policy.defaultAction, reason: '默认策略触发' }
      : null;
  }
  
  /**
   * 生成异常报告
   */
  generateAnomalyReport(action: AgentAction, state: EnvironmentState): Observation {
    const anomalies: Anomaly[] = [];
    
    // 检查指标异常
    if (state.metrics.codeQuality.cyclomaticComplexity > 20) {
      anomalies.push({
        type: 'HIGH_COMPLEXITY',
        severity: 'HIGH',
        description: `代码复杂度 ${state.metrics.codeQuality.cyclomaticComplexity} 超过阈值 20`,
        suggestedAction: '重构代码或提交人类审查',
      });
    }
    
    if (state.metrics.testCoverage < 0.8) {
      anomalies.push({
        type: 'LOW_COVERAGE',
        severity: 'MEDIUM',
        description: `测试覆盖率 ${(state.metrics.testCoverage * 100).toFixed(1)}% 低于 80%`,
        suggestedAction: '补充测试用例',
      });
    }
    
    if (state.metrics.securityScore < 0.7) {
      anomalies.push({
        type: 'SECURITY_RISK',
        severity: 'CRITICAL',
        description: `安全评分 ${(state.metrics.securityScore * 100).toFixed(1)}% 低于 70%`,
        suggestedAction: '立即停止并人工审查',
      });
    }
    
    return {
      actionId: action.agentId + '-' + action.timestamp,
      stateDelta: {},
      metricsImpact: {},
      anomalies,
    };
  }
  
  /**
   * 生成警报
   */
  generateAlert(condition: {
    type: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    message: string;
    affectedTasks: UUID[];
  }): Alert {
    const alert: Alert = {
      id: this.generateUUID(),
      severity: condition.severity,
      message: condition.message,
      affectedTasks: condition.affectedTasks,
      suggestedActions: this.getSuggestedActions(condition.type),
      createdAt: Date.now(),
    };
    
    this.alertHistory.push(alert);
    return alert;
  }
  
  // ----- 辅助方法 -----
  
  private evaluateCondition(
    condition: RuleCondition, 
    action: AgentAction, 
    state: EnvironmentState
  ): boolean {
    switch (condition.type) {
      case 'METRIC_THRESHOLD':
        return this.checkMetricThreshold(condition.parameters, state);
      case 'TASK_FAILURE':
        return this.checkTaskFailure(condition.parameters, state);
      case 'SECURITY_ALERT':
        return this.checkSecurityAlert(condition.parameters, state);
      case 'HUMAN_REQUEST':
        return true; // 人类请求总是触发
      case 'TIMEOUT':
        return this.checkTimeout(condition.parameters, action);
      default:
        return false;
    }
  }
  
  private checkMetricThreshold(params: Record<string, any>, state: EnvironmentState): boolean {
    const metric = params.metric as string;
    const threshold = params.threshold as number;
    
    switch (metric) {
      case 'testCoverage':
        return state.metrics.testCoverage < threshold;
      case 'securityScore':
        return state.metrics.securityScore < threshold;
      case 'errorRate':
        return state.metrics.performanceMetrics.errorRate > threshold;
      default:
        return false;
    }
  }
  
  private checkTaskFailure(params: Record<string, any>, state: EnvironmentState): boolean {
    const taskId = params.taskId as string;
    const task = state.taskRegistry.tasks.find(t => t.id === taskId);
    return task?.status === TaskStatus.FAILED;
  }
  
  private checkSecurityAlert(params: Record<string, any>, state: EnvironmentState): boolean {
    const severity = params.severity as string;
    return state.metrics.securityScore < (severity === 'CRITICAL' ? 0.5 : 0.7);
  }
  
  private checkTimeout(params: Record<string, any>, action: AgentAction): boolean {
    const timeout = params.timeout as number;
    return Date.now() - action.timestamp > timeout;
  }
  
  private getSuggestedActions(type: string): string[] {
    const actionMap: Record<string, string[]> = {
      'HIGH_COMPLEXITY': ['重构代码', '提交人类审查', '拆分任务'],
      'LOW_COVERAGE': ['补充测试', '调整测试策略'],
      'SECURITY_RISK': ['立即停止', '人工审查', '安全扫描'],
      'TASK_FAILURE': ['自动重试', '提交人类', '调整策略'],
      'DEFAULT': ['审查日志', '联系人类监督者'],
    };
    return actionMap[type] || actionMap['DEFAULT'];
  }
  
  private generateUUID(): UUID {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

// ==================== 环境塑造函数 ====================

/**
 * 环境塑造函数 ε 的实现
 * 人类通过设定目标、约束和反馈机制改变AI运行环境
 */
export class EnvironmentShaper {
  private shapingFunction: EnvironmentShapingFunction;
  private activeGoals: Map<string, GoalSpecification> = new Map();
  private activeConstraints: Map<string, ConstraintModification> = new Map();
  
  constructor(shapingFunction: EnvironmentShapingFunction) {
    this.shapingFunction = shapingFunction;
  }
  
  /**
   * 应用目标规范
   */
  applyGoal(goal: GoalSpecification): void {
    this.activeGoals.set(goal.id, goal);
    console.log(`[EnvironmentShaper] 目标已设定: ${goal.description} (优先级: ${goal.priority})`);
  }
  
  /**
   * 修改约束
   */
  modifyConstraint(modification: ConstraintModification): void {
    this.activeConstraints.set(modification.id, modification);
    console.log(`[EnvironmentShaper] 约束已${modification.type}: ${modification.constraintType}`);
  }
  
  /**
   * 生成环境上下文（供Agent使用）
   */
  generateContext(): string {
    const goals = Array.from(this.activeGoals.values())
      .sort((a, b) => b.priority - a.priority)
      .map(g => `- ${g.description} (优先级: ${g.priority})`)
      .join('\n');
    
    const constraints = Array.from(this.activeConstraints.values())
      .map(c => `- ${c.type} ${c.constraintType}: ${JSON.stringify(c.value)}`)
      .join('\n');
    
    return `
## 当前目标
${goals || '（无活跃目标）'}

## 当前约束
${constraints || '（无活跃约束）'}

## 环境塑造策略
${this.shapingFunction.feedbackRules.map(r => `- ${r.trigger} → ${r.response}`).join('\n')}
    `.trim();
  }
  
  /**
   * 处理反馈
   */
  processFeedback(trigger: string, outcome: string): void {
    const rule = this.shapingFunction.feedbackRules.find(r => r.trigger === trigger);
    if (rule) {
      console.log(`[EnvironmentShaper] 反馈触发: ${trigger} → ${rule.response}`);
      if (rule.learningEnabled) {
        console.log(`[EnvironmentShaper] 学习模式: 记录反馈 ${outcome}`);
      }
    }
  }
  
  /**
   * 获取活跃目标
   */
  getActiveGoals(): GoalSpecification[] {
    return Array.from(this.activeGoals.values())
      .sort((a, b) => b.priority - a.priority);
  }
  
  /**
   * 清除已完成的目标
   */
  clearCompletedGoals(completedGoalIds: string[]): void {
    for (const id of completedGoalIds) {
      this.activeGoals.delete(id);
    }
  }
}

// ==================== 牧羊人操作者实现 ====================

/**
 * 牧羊人操作者 S = (H, A, E, φ, ε) 的完整实现
 */
export class ShepherdOperatorImpl implements ShepherdOperator {
  id: UUID;
  human: ShepherdOperator['human'];
  agents: Agent[];
  environment: EnvironmentState;
  interventionPolicy: InterventionPolicy;
  environmentShapingFunction: EnvironmentShapingFunction;
  
  // 子系统
  private modeSelector: ModeSelector;
  private interventionEngine: InterventionEngine;
  private environmentShaper: EnvironmentShaper;
  private auditLog: AuditRecord[] = [];
  
  constructor(config: {
    id: UUID;
    human: ShepherdOperator['human'];
    agents: Agent[];
    environment: EnvironmentState;
    interventionPolicy: InterventionPolicy;
    environmentShapingFunction: EnvironmentShapingFunction;
  }) {
    this.id = config.id;
    this.human = config.human;
    this.agents = config.agents;
    this.environment = config.environment;
    this.interventionPolicy = config.interventionPolicy;
    this.environmentShapingFunction = config.environmentShapingFunction;
    
    this.modeSelector = new ModeSelector();
    this.interventionEngine = new InterventionEngine(config.interventionPolicy);
    this.environmentShaper = new EnvironmentShaper(config.environmentShapingFunction);
  }
  
  /**
   * 委托任务（核心方法）
   * 
   * 流程:
   * 1. 评估委托可行性
   * 2. 选择协作模式
   * 3. 分配Agent
   * 4. 设置监控
   * 5. 记录审计日志
   */
  async delegateTask(task: Task): Promise<DelegationResult> {
    // 1. 评估委托可行性
    const assessment = this.modeSelector.selectMode(task, this.environment);
    
    // 2. 选择Agent
    const agent = this.selectAgent(task, assessment.recommendedMode);
    if (!agent) {
      throw new Error(`无可用Agent处理任务: ${task.title}`);
    }
    
    // 3. 更新任务状态
    task.assignedTo = agent.id;
    task.mode = assessment.recommendedMode;
    task.status = TaskStatus.ASSIGNED;
    
    // 4. 记录审计日志
    this.logAudit({
      actor: { type: ActorType.HUMAN, id: this.human.id },
      action: { type: 'DELEGATE_TASK', target: task.id, parameters: { mode: assessment.recommendedMode } },
      decision: { rationale: assessment.rationale, confidence: assessment.confidence, alternatives: [] },
      approval: { required: true, approvedBy: this.human.id, approvalTimestamp: Date.now() },
    });
    
    // 5. 如果是Agent Mode，启动监控
    if (assessment.recommendedMode === CollaborationMode.AGENT) {
      this.monitorAgent(agent, task);
    }
    
    return {
      task,
      assessment,
      assignedAgent: agent,
      environmentContext: this.environmentShaper.generateContext(),
    };
  }
  
  /**
   * 干预Agent行动（人类主动介入）
   */
  intervene(agentId: UUID, reason: string): InterventionResult {
    const agent = this.agents.find(a => a.id === agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} 不存在`);
    }
    
    agent.autonomyLevel = 0; // 暂时剥夺自主性
    
    this.logAudit({
      actor: { type: ActorType.HUMAN, id: this.human.id },
      action: { type: 'INTERVENE', target: agentId, parameters: { reason } },
      decision: { rationale: reason, confidence: 1.0, alternatives: [] },
      approval: { required: false },
    });
    
    return {
      agentId,
      previousAutonomy: agent.autonomyLevel,
      interventionTime: Date.now(),
    };
  }
  
  /**
   * 塑造环境（设定目标/约束）
   */
  shapeEnvironment(action: 'SET_GOAL' | 'MODIFY_CONSTRAINT', payload: any): void {
    if (action === 'SET_GOAL') {
      this.environmentShaper.applyGoal(payload as GoalSpecification);
    } else if (action === 'MODIFY_CONSTRAINT') {
      this.environmentShaper.modifyConstraint(payload as ConstraintModification);
    }
    
    this.logAudit({
      actor: { type: ActorType.HUMAN, id: this.human.id },
      action: { type: 'SHAPE_ENVIRONMENT', target: 'environment', parameters: { action, payload } },
      decision: { rationale: '环境塑造', confidence: 1.0, alternatives: [] },
      approval: { required: false },
    });
  }
  
  /**
   * 获取审计日志
   */
  getAuditLog(): AuditRecord[] {
    return [...this.auditLog];
  }
  
  // ----- 私有方法 -----
  
  private selectAgent(task: Task, mode: CollaborationMode): Agent | undefined {
    // 根据任务类型和模式选择合适的Agent
    const availableAgents = this.agents.filter(a => a.status === 'IDLE');
    
    if (mode === CollaborationMode.COPILOT) {
      // Copilot Mode需要更高层级的Agent（战略或战术）
      return availableAgents.find(a => 
        a.level === AgentLevel.STRATEGIC || a.level === AgentLevel.TACTICAL
      );
    } else {
      // Agent Mode可以使用执行层Agent
      return availableAgents.find(a => 
        a.capabilityRange.some(c => task.tags.includes(c))
      ) || availableAgents[0];
    }
  }
  
  private monitorAgent(agent: Agent, task: Task): void {
    // 设置监控检查点
    const checkInterval = setInterval(() => {
      if (task.status === TaskStatus.COMPLETED || task.status === TaskStatus.FAILED) {
        clearInterval(checkInterval);
        return;
      }
      
      // 检查是否需要干预
      const action: AgentAction = {
        agentId: agent.id,
        taskId: task.id,
        type: 'STATUS_CHECK',
        parameters: {},
        timestamp: Date.now(),
      };
      
      const intervention = this.interventionEngine.shouldIntervene(action, this.environment);
      if (intervention) {
        console.log(`[Shepherd] 干预触发: ${intervention.reason} → ${intervention.action}`);
      }
    }, 5000); // 每5秒检查一次
  }
  
  private logAudit(partial: Omit<AuditRecord, 'recordId' | 'timestamp' | 'hash' | 'previousHash'>): void {
    const record: AuditRecord = {
      recordId: this.generateUUID(),
      timestamp: Date.now(),
      actor: partial.actor,
      action: partial.action,
      decision: partial.decision,
      approval: partial.approval,
      hash: '', // 实际应计算哈希
      previousHash: this.auditLog.length > 0 ? this.auditLog[this.auditLog.length - 1].hash : '0',
    };
    
    // 计算哈希（简化版）
    record.hash = this.hashRecord(record);
    this.auditLog.push(record);
  }
  
  private hashRecord(record: AuditRecord): string {
    const data = JSON.stringify({
      timestamp: record.timestamp,
      actor: record.actor,
      action: record.action,
      previousHash: record.previousHash,
    });
    
    // 简化哈希（实际使用SHA-256）
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }
  
  private generateUUID(): UUID {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

// ==================== 结果类型 ====================

export interface DelegationResult {
  task: Task;
  assessment: DelegationAssessment;
  assignedAgent: Agent;
  environmentContext: string;
}

export interface InterventionResult {
  agentId: UUID;
  previousAutonomy: number;
  interventionTime: Timestamp;
}
