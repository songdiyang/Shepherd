/**
 * Orchestrator 编排引擎实现
 * 核心功能：任务分解、模式选择、冲突仲裁、治理监控
 */

import {
  Task,
  TaskStatus,
  CollaborationMode,
  EnvironmentState,
  TaskDecompositionResult,
  ConstrainedTask,
  ConstraintSet,
  DelegationAssessment,
  Agent,
  AgentLevel,
  Alert,
  InterventionAction,
  AuditRecord,
  ActorType,
} from '../core/models';
import { ModeSelector, DelegationFeasibilityEvaluator } from '../core/algorithms';
import { v4 as uuidv4 } from 'uuid';

// ==================== Orchestrator 核心引擎 ====================

export class OrchestratorEngine {
  private modeSelector: ModeSelector;
  private evaluator: DelegationFeasibilityEvaluator;
  private governanceConfig: GovernanceConfig;
  private alertHistory: Alert[] = [];
  private auditLog: AuditRecord[] = [];

  constructor(config: GovernanceConfig) {
    this.modeSelector = new ModeSelector();
    this.evaluator = new DelegationFeasibilityEvaluator();
    this.governanceConfig = config;
  }

  /**
   * 治理函数 G
   * G: (Task, Context) -> (Task_Decomposition, Mode_Assignment, Constraint_Set)
   */
  govern(task: Task, context: EnvironmentState): GovernanceResult {
    // 1. 任务分解
    const decomposition = this.decompose(task, context);

    // 2. 模式分配
    const modeAssignments = this.assignModes(decomposition.subtasks, context);

    // 3. 约束应用
    const constrainedTasks = this.applyConstraints(decomposition.subtasks, context.constraints);

    // 4. 记录审计
    this.logGovernance(task, decomposition, modeAssignments);

    return {
      decomposition,
      modeAssignments,
      constrainedTasks,
      governanceVersion: this.governanceConfig.version,
    };
  }

  /**
   * 任务分解
   * 基于依赖图的拓扑排序 + 领域知识规则
   */
  decompose(task: Task, context: EnvironmentState): TaskDecompositionResult {
    // 基于任务特征进行智能分解
    const subtasks = this.analyzeAndDecompose(task, context);
    const dependencies = this.extractDependencies(subtasks);
    const criticalPath = this.calculateCriticalPath(subtasks, dependencies);

    return {
      subtasks,
      dependencies,
      estimatedTotalEffort: subtasks.reduce((sum, st) => sum + (st.estimatedEffort || 0), 0),
      criticalPath,
    };
  }

  /**
   * 分配协作模式
   */
  assignModes(tasks: Task[], context: EnvironmentState): Map<string, DelegationAssessment> {
    return this.modeSelector.selectModes(tasks, context);
  }

  /**
   * 应用约束
   */
  applyConstraints(tasks: Task[], constraints: ConstraintSet): ConstrainedTask[] {
    return tasks.map(task => {
      const appliedConstraints: string[] = [];
      const warnings: string[] = [];

      // 检查编码规范
      for (const standard of constraints.codingStandards) {
        if (!task.tags.includes(standard)) {
          appliedConstraints.push(`coding_standard:${standard}`);
        }
      }

      // 检查安全策略
      for (const policy of constraints.securityPolicies) {
        if (policy.severity === 'CRITICAL' && task.priority >= 4) {
          appliedConstraints.push(`security_policy:${policy.id}`);
          warnings.push(`关键安全策略适用: ${policy.name}`);
        }
      }

      // 检查性能阈值
      for (const threshold of constraints.performanceThresholds) {
        if (task.tags.includes('performance') || task.tags.includes('optimization')) {
          appliedConstraints.push(`performance_threshold:${threshold.metric}`);
        }
      }

      // 检查合规规则
      for (const rule of constraints.complianceRules) {
        appliedConstraints.push(`compliance_rule:${rule.standard}`);
      }

      return {
        task,
        appliedConstraints,
        warnings,
      };
    });
  }

  /**
   * 冲突仲裁
   */
  arbitrateConflict(conflict: Conflict): ArbitrationResult {
    const { type, agents, resource } = conflict;

    // 优先级规则：安全 > 性能 > 功能
    const priorityWeights = {
      'security': 100,
      'performance': 80,
      'functionality': 60,
      'resource': 40,
    };

    // 基于Agent层级和任务优先级仲裁
    const sortedAgents = [...agents].sort((a, b) => {
      const aWeight = this.getAgentPriorityWeight(a);
      const bWeight = this.getAgentPriorityWeight(b);
      return bWeight - aWeight;
    });

    const winner = sortedAgents[0];
    const losers = sortedAgents.slice(1);

    // 为失败者分配替代资源或重新调度
    const alternatives = losers.map(agent => ({
      agentId: agent.id,
      suggestedAction: this.suggestAlternative(agent, resource),
    }));

    return {
      winner: winner.id,
      losers: losers.map(a => a.id),
      reason: `基于优先级权重和资源可用性，Agent ${winner.name} 获得资源 ${resource}`,
      alternatives,
      escalationRequired: losers.some(l => l.level === AgentLevel.STRATEGIC),
    };
  }

  /**
   * 监控机制 M
   */
  monitor(agentAction: any, state: EnvironmentState): MonitoringResult {
    const anomalies = this.detectAnomalies(agentAction, state);
    const alerts = this.generateAlerts(anomalies, agentAction);
    const interventionNeeded = this.checkInterventionNeeded(alerts);

    return {
      anomalies,
      alerts,
      interventionNeeded,
      recommendedAction: interventionNeeded ? InterventionAction.REQUIRE_APPROVAL : InterventionAction.NOTIFY,
    };
  }

  // ----- 私有方法 -----

  private analyzeAndDecompose(task: Task, context: EnvironmentState): Task[] {
    const subtasks: Task[] = [];

    // 根据任务类型选择分解策略
    if (task.tags.includes('feature') || task.tags.includes('implementation')) {
      // 功能实现类任务：需求 -> 设计 -> 实现 -> 测试 -> 审查
      subtasks.push(
        this.createSubtask(task, '需求分析', 2, ['analysis'], CollaborationMode.COPILOT),
        this.createSubtask(task, '架构设计', 4, ['design'], CollaborationMode.COPILOT),
        this.createSubtask(task, '代码实现', 8, ['coding'], CollaborationMode.AGENT),
        this.createSubtask(task, '单元测试', 4, ['testing'], CollaborationMode.AGENT),
        this.createSubtask(task, '代码审查', 2, ['review'], CollaborationMode.COPILOT),
      );
    } else if (task.tags.includes('bugfix')) {
      // Bug修复类任务：分析 -> 修复 -> 验证
      subtasks.push(
        this.createSubtask(task, '问题分析', 1, ['analysis'], CollaborationMode.COPILOT),
        this.createSubtask(task, '修复实现', 2, ['coding'], CollaborationMode.AGENT),
        this.createSubtask(task, '验证测试', 2, ['testing'], CollaborationMode.AGENT),
      );
    } else if (task.tags.includes('refactor')) {
      // 重构类任务：分析 -> 重构 -> 验证
      subtasks.push(
        this.createSubtask(task, '影响分析', 2, ['analysis'], CollaborationMode.COPILOT),
        this.createSubtask(task, '重构实施', 6, ['coding'], CollaborationMode.AGENT),
        this.createSubtask(task, '回归测试', 4, ['testing'], CollaborationMode.AGENT),
      );
    } else {
      // 默认分解
      subtasks.push(
        this.createSubtask(task, '分析', 2, ['analysis'], CollaborationMode.COPILOT),
        this.createSubtask(task, '执行', 6, ['execution'], CollaborationMode.AGENT),
        this.createSubtask(task, '验证', 2, ['verification'], CollaborationMode.COPILOT),
      );
    }

    return subtasks;
  }

  private createSubtask(
    parent: Task,
    phase: string,
    effort: number,
    tags: string[],
    mode: CollaborationMode,
  ): Task {
    return {
      id: uuidv4(),
      parentId: parent.id,
      title: `${parent.title} - ${phase}`,
      description: `${phase}阶段: ${parent.description}`,
      status: TaskStatus.PENDING,
      mode,
      priority: parent.priority,
      estimatedEffort: effort,
      tags: [...parent.tags, ...tags],
      deliverables: [],
      createdAt: Date.now(),
    };
  }

  private extractDependencies(subtasks: Task[]): any[] {
    const dependencies: any[] = [];
    for (let i = 1; i < subtasks.length; i++) {
      dependencies.push({
        from: subtasks[i - 1].id,
        to: subtasks[i].id,
        type: 'BLOCKS',
      });
    }
    return dependencies;
  }

  private calculateCriticalPath(subtasks: Task[], dependencies: any[]): string[] {
    // 简化版：假设所有任务都是关键路径
    return subtasks.map(st => st.id);
  }

  private getAgentPriorityWeight(agent: Agent): number {
    const levelWeights = {
      [AgentLevel.STRATEGIC]: 100,
      [AgentLevel.TACTICAL]: 80,
      [AgentLevel.EXECUTIVE]: 60,
    };
    return levelWeights[agent.level] || 50;
  }

  private suggestAlternative(agent: Agent, resource: string): string {
    if (agent.level === AgentLevel.STRATEGIC) {
      return `建议为 ${agent.name} 分配同等级的替代资源，或升级至人类裁决`;
    } else if (agent.level === AgentLevel.TACTICAL) {
      return `建议为 ${agent.name} 重新分配任务至其他战术层Agent`;
    } else {
      return `建议为 ${agent.name} 排队等待资源释放`;
    }
  }

  private detectAnomalies(action: any, state: EnvironmentState): any[] {
    const anomalies = [];

    if (state.metrics.codeQuality.cyclomaticComplexity > 20) {
      anomalies.push({
        type: 'HIGH_COMPLEXITY',
        severity: 'HIGH',
        description: `代码复杂度 ${state.metrics.codeQuality.cyclomaticComplexity} 超过阈值 20`,
      });
    }

    if (state.metrics.testCoverage < 0.8) {
      anomalies.push({
        type: 'LOW_COVERAGE',
        severity: 'MEDIUM',
        description: `测试覆盖率 ${(state.metrics.testCoverage * 100).toFixed(1)}% 低于 80%`,
      });
    }

    if (state.metrics.securityScore < 0.7) {
      anomalies.push({
        type: 'SECURITY_RISK',
        severity: 'CRITICAL',
        description: `安全评分 ${(state.metrics.securityScore * 100).toFixed(1)}% 低于 70%`,
      });
    }

    return anomalies;
  }

  private generateAlerts(anomalies: any[], action: any): Alert[] {
    return anomalies.map(anomaly => ({
      id: uuidv4(),
      severity: anomaly.severity,
      message: anomaly.description,
      affectedTasks: [action.taskId],
      suggestedActions: this.getSuggestedActions(anomaly.type),
      createdAt: Date.now(),
    }));
  }

  private checkInterventionNeeded(alerts: Alert[]): boolean {
    return alerts.some(a => a.severity === 'CRITICAL' || a.severity === 'HIGH');
  }

  private getSuggestedActions(type: string): string[] {
    const actionMap: Record<string, string[]> = {
      'HIGH_COMPLEXITY': ['重构代码', '提交人类审查', '拆分任务'],
      'LOW_COVERAGE': ['补充测试', '调整测试策略'],
      'SECURITY_RISK': ['立即停止', '人工审查', '安全扫描'],
      'DEFAULT': ['审查日志', '联系人类监督者'],
    };
    return actionMap[type] || actionMap['DEFAULT'];
  }

  private logGovernance(
    task: Task,
    decomposition: TaskDecompositionResult,
    modeAssignments: Map<string, DelegationAssessment>,
  ): void {
    const record: AuditRecord = {
      recordId: uuidv4(),
      timestamp: Date.now(),
      actor: { type: ActorType.SYSTEM, id: 'orchestrator' },
      action: {
        type: 'GOVERN_TASK',
        target: task.id,
        parameters: {
          subtaskCount: decomposition.subtasks.length,
          modes: Array.from(modeAssignments.entries()).map(([id, assessment]) => ({
            taskId: id,
            mode: assessment.recommendedMode,
          })),
        },
      },
      decision: {
        rationale: `任务分解为${decomposition.subtasks.length}个子任务，并分配协作模式`,
        confidence: 0.9,
        alternatives: [],
      },
      approval: { required: false },
      hash: '',
      previousHash: this.auditLog.length > 0 ? this.auditLog[this.auditLog.length - 1].hash : '0',
    };

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
    
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  // ----- 审计日志访问 -----

  getAuditLog(): AuditRecord[] {
    return [...this.auditLog];
  }
}

// ==================== 配置类型 ====================

export interface GovernanceConfig {
  version: string;
  maxDecompositionDepth: number;
  parallelAgentLimit: number;
  conflictResolutionTimeout: number;
  governanceMaturity: number;
}

export interface GovernanceResult {
  decomposition: TaskDecompositionResult;
  modeAssignments: Map<string, DelegationAssessment>;
  constrainedTasks: ConstrainedTask[];
  governanceVersion: string;
}

export interface Conflict {
  type: 'RESOURCE' | 'DEPENDENCY' | 'PRIORITY';
  agents: Agent[];
  resource: string;
  description: string;
}

export interface ArbitrationResult {
  winner: string;
  losers: string[];
  reason: string;
  alternatives: Array<{
    agentId: string;
    suggestedAction: string;
  }>;
  escalationRequired: boolean;
}

export interface MonitoringResult {
  anomalies: any[];
  alerts: Alert[];
  interventionNeeded: boolean;
  recommendedAction: InterventionAction;
}

export default OrchestratorEngine;
