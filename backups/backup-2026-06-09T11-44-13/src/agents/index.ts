/**
 * Agent 分层实现
 * 战略层、战术层、执行层 Agent
 */

import { Agent, AgentLevel, Task, TaskStatus, EnvironmentState, CollaborationMode } from '../core/models';
import { v4 as uuidv4 } from 'uuid';

// ==================== 抽象 Agent 基类 ====================

export abstract class BaseAgent implements Agent {
  id: string;
  name: string;
  level: AgentLevel;
  capabilityRange: string[];
  autonomyLevel: number;
  status: 'IDLE' | 'BUSY' | 'OFFLINE';
  currentTask?: string;
  performanceHistory: any[] = [];

  constructor(config: {
    name: string;
    level: AgentLevel;
    capabilities: string[];
    autonomyLevel: number;
  }) {
    this.id = uuidv4();
    this.name = config.name;
    this.level = config.level;
    this.capabilityRange = config.capabilities;
    this.autonomyLevel = config.autonomyLevel;
    this.status = 'IDLE';
  }

  /**
   * 执行任务（抽象方法，子类实现）
   */
  abstract execute(task: Task, environment: EnvironmentState): Promise<TaskExecutionResult>;

  /**
   * 解释决策（用于审计和可解释性）
   */
  abstract explain(decision: any): string;

  /**
   * 接受任务
   */
  acceptTask(task: Task): boolean {
    if (this.status !== 'IDLE') {
      return false;
    }
    this.status = 'BUSY';
    this.currentTask = task.id;
    task.assignedTo = this.id;
    task.status = TaskStatus.IN_PROGRESS;
    task.startedAt = Date.now();
    return true;
  }

  /**
   * 完成任务
   */
  completeTask(task: Task, success: boolean, deliverables?: any[]): void {
    this.status = 'IDLE';
    this.currentTask = undefined;
    task.status = success ? TaskStatus.REVIEWING : TaskStatus.FAILED;
    task.completedAt = Date.now();

    this.performanceHistory.push({
      taskId: task.id,
      success,
      completionTime: task.completedAt - (task.startedAt || task.createdAt),
      qualityScore: success ? 0.9 : 0.0,
      humanInterventions: 0,
    });
  }
}

export interface TaskExecutionResult {
  success: boolean;
  output: string;
  deliverables: any[];
  reasoning: string;
  confidence: number;
}

// ==================== 战略层 Agent ====================

/**
 * 战略层 Agent
 * 角色：架构师、技术顾问
 * 职责：架构决策、技术选型、风险评估
 * 默认模式：Copilot Mode（所有决策需人类确认）
 */
export class StrategicAgent extends BaseAgent {
  constructor(name: string, capabilities: string[]) {
    super({
      name,
      level: AgentLevel.STRATEGIC,
      capabilities: ['architecture', 'design', 'technology-selection', 'risk-assessment', ...capabilities],
      autonomyLevel: 0.3, // 低自主性，需人类确认
    });
  }

  async execute(task: Task, environment: EnvironmentState): Promise<TaskExecutionResult> {
    // 战略层 Agent 在 Copilot Mode 下工作
    // 生成建议而非直接执行

    const analysis = this.analyzeArchitecture(task, environment);
    const recommendations = this.generateRecommendations(task, environment);
    const riskAssessment = this.assessRisks(task, environment);

    return {
      success: true,
      output: JSON.stringify({ analysis, recommendations, riskAssessment }),
      deliverables: [
        { id: uuidv4(), type: 'DOCUMENT', path: 'architecture-analysis.md', content: analysis },
        { id: uuidv4(), type: 'DOCUMENT', path: 'recommendations.md', content: recommendations },
      ],
      reasoning: `基于任务"${task.title}"的需求，分析了现有架构并提出技术方案建议。`,
      confidence: 0.85,
    };
  }

  explain(decision: any): string {
    return `战略层 Agent "${this.name}" 的决策基于架构约束分析和技术选型评估。决策理由: ${decision.rationale}`;
  }

  private analyzeArchitecture(task: Task, environment: EnvironmentState): string {
    const { codebase, metrics } = environment;
    return `
## 架构分析

### 当前状态
- 代码库: ${codebase.repositoryUrl}
- 分支: ${codebase.branch}
- 提交: ${codebase.commitHash}

### 质量指标
- 可维护性指数: ${metrics.codeQuality.maintainabilityIndex}
- 圈复杂度: ${metrics.codeQuality.cyclomaticComplexity}
- 测试覆盖率: ${(metrics.testCoverage * 100).toFixed(1)}%

### 分析结论
基于任务 "${task.title}" 的需求，建议采用分层架构实现，保持现有架构的一致性。
    `.trim();
  }

  private generateRecommendations(task: Task, environment: EnvironmentState): string {
    return `
## 技术方案建议

### 推荐方案
1. 保持现有技术栈一致性
2. 遵循已定义的编码规范: ${environment.constraints.codingStandards.join(', ')}
3. 安全策略: ${environment.constraints.securityPolicies.map(p => p.name).join(', ')}

### 风险提示
- 需确保新功能与现有架构兼容
- 建议增加集成测试覆盖
    `.trim();
  }

  private assessRisks(task: Task, environment: EnvironmentState): any[] {
    return [
      { type: 'COMPATIBILITY', level: 'MEDIUM', description: '与现有架构的兼容性' },
      { type: 'SECURITY', level: 'LOW', description: '遵循现有安全策略' },
    ];
  }
}

// ==================== 战术层 Agent ====================

/**
 * 战术层 Agent
 * 角色：项目经理、任务规划师
 * 职责：子任务分解、资源分配、进度协调
 * 默认模式：混合模式（在预设边界内自主规划）
 */
export class TacticalAgent extends BaseAgent {
  constructor(name: string, capabilities: string[]) {
    super({
      name,
      level: AgentLevel.TACTICAL,
      capabilities: ['planning', 'coordination', 'task-decomposition', 'resource-allocation', ...capabilities],
      autonomyLevel: 0.6, // 中等自主性
    });
  }

  async execute(task: Task, environment: EnvironmentState): Promise<TaskExecutionResult> {
    // 战术层 Agent 将任务分解为子任务并分配
    const subtasks = this.decomposeTask(task, environment);
    const assignments = this.assignToAgents(subtasks, environment);
    const schedule = this.createSchedule(subtasks, assignments);

    return {
      success: true,
      output: JSON.stringify({ subtasks, assignments, schedule }),
      deliverables: [
        { id: uuidv4(), type: 'DOCUMENT', path: 'task-plan.json', content: JSON.stringify(subtasks) },
        { id: uuidv4(), type: 'DOCUMENT', path: 'schedule.json', content: JSON.stringify(schedule) },
      ],
      reasoning: `将任务"${task.title}"分解为${subtasks.length}个子任务，并分配给合适的执行层Agent。`,
      confidence: 0.9,
    };
  }

  explain(decision: any): string {
    return `战术层 Agent "${this.name}" 基于任务依赖图和Agent能力匹配进行任务分配。决策理由: ${decision.rationale}`;
  }

  private decomposeTask(task: Task, environment: EnvironmentState): any[] {
    // 基于任务特征进行分解
    const phases = ['需求分析', '设计', '实现', '测试', '审查'];
    return phases.map((phase, index) => ({
      id: uuidv4(),
      title: `${task.title} - ${phase}`,
      order: index,
      estimatedEffort: 2,
      dependencies: index > 0 ? [index - 1] : [],
    }));
  }

  private assignToAgents(subtasks: any[], environment: EnvironmentState): any[] {
    // 简单的轮询分配（实际应基于能力匹配）
    return subtasks.map((subtask, index) => ({
      subtaskId: subtask.id,
      assignedTo: `agent-${index % 3}`, // 模拟分配
      mode: subtask.title.includes('设计') ? 'COPILOT' : 'AGENT',
    }));
  }

  private createSchedule(subtasks: any[], assignments: any[]): any {
    return {
      startTime: Date.now(),
      phases: subtasks.map((st, i) => ({
        phase: st.title,
        startOffset: i * 2, // 小时
        duration: 2,
        assignedTo: assignments[i]?.assignedTo,
      })),
    };
  }
}

// ==================== 执行层 Agent ====================

/**
 * 执行层 Agent
 * 角色：程序员、测试员、DevOps工程师
 * 职责：代码生成、单元测试、文档编写
 * 默认模式：Agent Mode（在编码规范和测试通过的前提下自主执行）
 */
export class ExecutiveAgent extends BaseAgent {
  constructor(name: string, capabilities: string[]) {
    super({
      name,
      level: AgentLevel.EXECUTIVE,
      capabilities: ['coding', 'testing', 'documentation', 'refactoring', ...capabilities],
      autonomyLevel: 0.8, // 高自主性
    });
  }

  async execute(task: Task, environment: EnvironmentState): Promise<TaskExecutionResult> {
    // 执行层 Agent 在 Agent Mode 下自主工作
    // 生成代码、测试、文档

    const code = this.generateCode(task, environment);
    const tests = this.generateTests(task, environment);
    const docs = this.generateDocumentation(task, environment);

    // 验证代码是否符合约束
    const validation = this.validateCode(code, environment);

    if (!validation.passed) {
      return {
        success: false,
        output: `代码验证失败: ${validation.errors.join(', ')}`,
        deliverables: [],
        reasoning: `生成的代码不符合约束条件: ${validation.errors.join(', ')}`,
        confidence: 0.5,
      };
    }

    return {
      success: true,
      output: `成功生成代码、测试和文档`,
      deliverables: [
        { id: uuidv4(), type: 'CODE', path: code.filePath, content: code.content },
        { id: uuidv4(), type: 'TEST', path: tests.filePath, content: tests.content },
        { id: uuidv4(), type: 'DOCUMENT', path: docs.filePath, content: docs.content },
      ],
      reasoning: `基于任务"${task.title}"的需求，生成了符合编码规范的代码和测试。`,
      confidence: 0.92,
    };
  }

  explain(decision: any): string {
    return `执行层 Agent "${this.name}" 基于任务需求和编码规范生成代码。决策理由: ${decision.rationale}`;
  }

  private generateCode(task: Task, environment: EnvironmentState): { filePath: string; content: string } {
    const standards = environment.constraints.codingStandards;
    const isTypeScript = standards.includes('typescript');

    return {
      filePath: `src/${task.title.replace(/\s+/g, '-').toLowerCase()}.${isTypeScript ? 'ts' : 'js'}`,
      content: `
// ${task.title}
// 编码规范: ${standards.join(', ')}
// 生成时间: ${new Date().toISOString()}

${isTypeScript ? 'export ' : ''}function ${task.title.replace(/\s+/g, '')}() {
  // TODO: 实现 ${task.description}
  console.log('执行: ${task.title}');
  return true;
}

${isTypeScript ? 'export default ' + task.title.replace(/\s+/g, '') : 'module.exports = ' + task.title.replace(/\s+/g, '')};
      `.trim(),
    };
  }

  private generateTests(task: Task, environment: EnvironmentState): { filePath: string; content: string } {
    return {
      filePath: `tests/${task.title.replace(/\s+/g, '-').toLowerCase()}.test.ts`,
      content: `
import { ${task.title.replace(/\s+/g, '')} } from '../src/${task.title.replace(/\s+/g, '-').toLowerCase()}';

describe('${task.title}', () => {
  it('应该成功执行', () => {
    const result = ${task.title.replace(/\s+/g, '')}();
    expect(result).toBe(true);
  });
});
      `.trim(),
    };
  }

  private generateDocumentation(task: Task, environment: EnvironmentState): { filePath: string; content: string } {
    return {
      filePath: `docs/${task.title.replace(/\s+/g, '-').toLowerCase()}.md`,
      content: `
# ${task.title}

## 描述
${task.description}

## 实现
- 文件: \`src/${task.title.replace(/\s+/g, '-').toLowerCase()}.ts\`
- 测试: \`tests/${task.title.replace(/\s+/g, '-').toLowerCase()}.test.ts\`

## 编码规范
${environment.constraints.codingStandards.map(s => `- ${s}`).join('\n')}
      `.trim(),
    };
  }

  private validateCode(code: { filePath: string; content: string }, environment: EnvironmentState): { passed: boolean; errors: string[] } {
    const errors: string[] = [];

    // 检查安全策略
    for (const policy of environment.constraints.securityPolicies) {
      if (policy.severity === 'CRITICAL' && code.content.includes('password')) {
        if (!code.content.includes('hash') && !code.content.includes('encrypt')) {
          errors.push(`违反安全策略: ${policy.name}`);
        }
      }
    }

    return {
      passed: errors.length === 0,
      errors,
    };
  }
}

// ==================== Agent 工厂 ====================

export class AgentFactory {
  static createStrategicAgent(name: string, capabilities: string[] = []): StrategicAgent {
    return new StrategicAgent(name, capabilities);
  }

  static createTacticalAgent(name: string, capabilities: string[] = []): TacticalAgent {
    return new TacticalAgent(name, capabilities);
  }

  static createExecutiveAgent(name: string, capabilities: string[] = []): ExecutiveAgent {
    return new ExecutiveAgent(name, capabilities);
  }

  static createAgent(level: AgentLevel, name: string, capabilities: string[] = []): BaseAgent {
    switch (level) {
      case AgentLevel.STRATEGIC:
        return new StrategicAgent(name, capabilities);
      case AgentLevel.TACTICAL:
        return new TacticalAgent(name, capabilities);
      case AgentLevel.EXECUTIVE:
        return new ExecutiveAgent(name, capabilities);
      default:
        throw new Error(`Unknown agent level: ${level}`);
    }
  }
}

// ==================== Agent 运行时 ====================

export class AgentRuntime {
  private agents: Map<string, BaseAgent> = new Map();
  private taskQueue: Task[] = [];

  registerAgent(agent: BaseAgent): void {
    this.agents.set(agent.id, agent);
  }

  unregisterAgent(agentId: string): void {
    this.agents.delete(agentId);
  }

  submitTask(task: Task): void {
    this.taskQueue.push(task);
  }

  async processQueue(environment: EnvironmentState): Promise<void> {
    for (const task of this.taskQueue) {
      if (task.status === TaskStatus.PENDING || task.status === TaskStatus.ASSIGNED) {
        await this.executeTask(task, environment);
      }
    }
  }

  private async executeTask(task: Task, environment: EnvironmentState): Promise<void> {
    const agent = task.assignedTo ? this.agents.get(task.assignedTo) : null;

    if (!agent) {
      task.status = TaskStatus.FAILED;
      return;
    }

    const accepted = agent.acceptTask(task);
    if (!accepted) {
      task.status = TaskStatus.FAILED;
      return;
    }

    try {
      const result = await agent.execute(task, environment);
      agent.completeTask(task, result.success, result.deliverables);
    } catch (err) {
      agent.completeTask(task, false);
    }
  }
}

export default { AgentFactory, AgentRuntime, StrategicAgent, TacticalAgent, ExecutiveAgent };
