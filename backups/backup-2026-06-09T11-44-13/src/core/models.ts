/**
 * 核心领域模型
 * 基于 Shepherd Architecture Framework (SAF) 的理论定义
 */

// ==================== 基础类型 ====================

export type UUID = string;
export type Timestamp = number;

export enum ActorType {
  HUMAN = 'HUMAN',
  AGENT = 'AGENT',
  SYSTEM = 'SYSTEM',
}

export enum CollaborationMode {
  AGENT = 'AGENT',      // 自主代理模式
  COPILOT = 'COPILOT',  // 同步共驾模式
}

export enum TaskStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEWING = 'REVIEWING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  ABORTED = 'ABORTED',
}

export enum AgentLevel {
  STRATEGIC = 'STRATEGIC',   // 战略层
  TACTICAL = 'TACTICAL',     // 战术层
  EXECUTIVE = 'EXECUTIVE',   // 执行层
}

// ==================== 委托可行性评估 ====================

/**
 * 委托可行性三维度
 * 基于命题2（委托可行性-责任归属分离命题）
 */
export interface DelegationFeasibility {
  verifiability: number;    // 可验证性 [0.0, 1.0]
  observability: number;    // 可观测性 [0.0, 1.0]
  accountabilityRisk: number; // 责任风险 [0.0, 1.0]（越高越危险）
}

/**
 * 委托评估结果
 */
export interface DelegationAssessment {
  feasibility: DelegationFeasibility;
  dfScore: number;           // 委托可行性得分 [-1.0, 1.0]
  threshold: number;         // 动态阈值
  recommendedMode: CollaborationMode;
  confidence: number;        // 评估置信度
  rationale: string;         // 评估理由
}

// ==================== 环境状态 ====================

/**
 * 环境状态 E
 * 包含代码库状态、任务注册表、系统度量
 */
export interface EnvironmentState {
  id: UUID;
  version: number;
  timestamp: Timestamp;
  codebase: CodebaseState;
  taskRegistry: TaskRegistry;
  metrics: SystemMetrics;
  constraints: ConstraintSet;
}

export interface CodebaseState {
  repositoryUrl: string;
  branch: string;
  commitHash: string;
  fileTree: FileNode[];
  dependencyGraph: DependencyGraph;
  recentChanges: CodeChange[];
}

export interface FileNode {
  path: string;
  type: 'file' | 'directory';
  size: number;
  lastModified: Timestamp;
  hash: string;
}

export interface DependencyGraph {
  nodes: string[];
  edges: { from: string; to: string; type: string }[];
}

export interface CodeChange {
  commitHash: string;
  author: string;
  timestamp: Timestamp;
  files: string[];
  message: string;
}

export interface TaskRegistry {
  tasks: Task[];
  dependencies: TaskDependency[];
}

export interface Task {
  id: UUID;
  parentId?: UUID;
  title: string;
  description: string;
  status: TaskStatus;
  assignedTo?: UUID;       // Agent ID or Human ID
  mode: CollaborationMode;
  priority: number;        // 1-5
  estimatedEffort: number; // 小时
  actualEffort?: number;
  createdAt: Timestamp;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  deadline?: Timestamp;
  tags: string[];
  deliverables: Deliverable[];
}

export interface TaskDependency {
  from: UUID;
  to: UUID;
  type: 'BLOCKS' | 'REQUIRES' | 'RELATES_TO';
}

export interface Deliverable {
  id: UUID;
  type: 'CODE' | 'DOCUMENT' | 'TEST' | 'CONFIG' | 'OTHER';
  path: string;
  hash: string;
  verificationStatus: 'PENDING' | 'PASSED' | 'FAILED';
}

export interface SystemMetrics {
  codeQuality: CodeQualityMetrics;
  testCoverage: number;
  securityScore: number;
  performanceMetrics: PerformanceMetrics;
  agentUtilization: AgentUtilizationMetrics;
}

export interface CodeQualityMetrics {
  maintainabilityIndex: number;
  cyclomaticComplexity: number;
  codeDuplication: number;
  technicalDebt: number;
}

export interface PerformanceMetrics {
  responseTimeP95: number;
  throughput: number;
  errorRate: number;
}

export interface AgentUtilizationMetrics {
  totalAgents: number;
  activeAgents: number;
  tasksCompleted: number;
  tasksFailed: number;
  averageCompletionTime: number;
}

export interface ConstraintSet {
  codingStandards: string[];
  securityPolicies: SecurityPolicy[];
  performanceThresholds: PerformanceThreshold[];
  complianceRules: ComplianceRule[];
}

export interface SecurityPolicy {
  id: string;
  name: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  rule: string;
}

export interface PerformanceThreshold {
  metric: string;
  maxValue: number;
  unit: string;
}

export interface ComplianceRule {
  standard: string;      // e.g., 'GDPR', 'SOX', 'HIPAA'
  requirement: string;
  verificationMethod: string;
}

// ==================== 牧羊人操作者 ====================

/**
 * 定义1（牧羊人操作者）：五元组 S = (H, A, E, φ, ε)
 */
export interface ShepherdOperator {
  id: UUID;
  human: Human;
  agents: Agent[];
  environment: EnvironmentState;
  interventionPolicy: InterventionPolicy;
  environmentShapingFunction: EnvironmentShapingFunction;
}

export interface Human {
  id: UUID;
  name: string;
  role: string;
  domainKnowledge: string[];
  judgmentCapabilities: string[];
  authorityLevel: number;  // 1-5，决定可审批的操作级别
}

export interface Agent {
  id: UUID;
  name: string;
  level: AgentLevel;
  capabilityRange: string[];
  autonomyLevel: number;   // 0.0-1.0
  status: 'IDLE' | 'BUSY' | 'OFFLINE';
  currentTask?: UUID;
  performanceHistory: AgentPerformance[];
}

export interface AgentPerformance {
  taskId: UUID;
  success: boolean;
  completionTime: number;
  qualityScore: number;
  humanInterventions: number;
}

/**
 * 干预策略 φ
 * 决定在给定状态下人类是否介入
 */
export interface InterventionPolicy {
  id: UUID;
  rules: InterventionRule[];
  defaultAction: InterventionAction;
}

export interface InterventionRule {
  id: string;
  name: string;
  condition: RuleCondition;
  action: InterventionAction;
  priority: number;
}

export interface RuleCondition {
  type: 'METRIC_THRESHOLD' | 'TASK_FAILURE' | 'SECURITY_ALERT' | 'HUMAN_REQUEST' | 'TIMEOUT';
  parameters: Record<string, any>;
}

export enum InterventionAction {
  NOTIFY = 'NOTIFY',           // 通知人类
  REQUIRE_APPROVAL = 'REQUIRE_APPROVAL',  // 要求审批
  AUTO_ABORT = 'AUTO_ABORT',   // 自动中止
  AUTO_RETRY = 'AUTO_RETRY',   // 自动重试
  ESCALATE = 'ESCALATE',       // 升级至更高权限人类
}

/**
 * 环境塑造函数 ε
 * 人类通过设定目标、约束和反馈机制改变AI运行环境
 */
export interface EnvironmentShapingFunction {
  id: UUID;
  goalSpecifications: GoalSpecification[];
  constraintModifications: ConstraintModification[];
  feedbackRules: FeedbackRule[];
}

export interface GoalSpecification {
  id: string;
  description: string;
  priority: number;
  successCriteria: string;
  deadline?: Timestamp;
}

export interface ConstraintModification {
  id: string;
  type: 'ADD' | 'REMOVE' | 'UPDATE';
  constraintType: 'CODING_STANDARD' | 'SECURITY_POLICY' | 'PERFORMANCE_THRESHOLD' | 'COMPLIANCE_RULE';
  value: any;
  effectiveFrom: Timestamp;
}

export interface FeedbackRule {
  id: string;
  trigger: string;
  response: string;
  learningEnabled: boolean;
}

// ==================== Orchestrator ====================

/**
 * 治理函数 G
 */
export interface GovernanceFunction {
  decompose(task: Task, context: EnvironmentState): TaskDecompositionResult;
  assignMode(task: Task, assessment: DelegationAssessment): CollaborationMode;
  applyConstraints(task: Task, constraints: ConstraintSet): ConstrainedTask;
}

export interface TaskDecompositionResult {
  subtasks: Task[];
  dependencies: TaskDependency[];
  estimatedTotalEffort: number;
  criticalPath: UUID[];
}

export interface ConstrainedTask {
  task: Task;
  appliedConstraints: string[];
  warnings: string[];
}

/**
 * 监控机制 M
 */
export interface MonitoringMechanism {
  observe(agentAction: AgentAction, state: EnvironmentState): Observation;
  alert(condition: AlertCondition): Alert;
  log(record: AuditRecord): void;
}

export interface AgentAction {
  agentId: UUID;
  taskId: UUID;
  type: string;
  parameters: Record<string, any>;
  timestamp: Timestamp;
}

export interface Observation {
  actionId: string;
  stateDelta: Partial<EnvironmentState>;
  metricsImpact: Partial<SystemMetrics>;
  anomalies: Anomaly[];
}

export interface Anomaly {
  type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  suggestedAction: string;
}

export interface AlertCondition {
  type: string;
  threshold: number;
  currentValue: number;
  context: Record<string, any>;
}

export interface Alert {
  id: UUID;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  affectedTasks: UUID[];
  suggestedActions: string[];
  createdAt: Timestamp;
}

// ==================== 审计日志 ====================

export interface AuditRecord {
  recordId: UUID;
  timestamp: Timestamp;
  actor: {
    type: ActorType;
    id: string;
    humanSupervisor?: string;
  };
  action: {
    type: string;
    target: string;
    parameters: Record<string, any>;
  };
  decision: {
    rationale: string;
    confidence: number;
    alternatives: string[];
  };
  approval: {
    required: boolean;
    approvedBy?: string;
    approvalTimestamp?: Timestamp;
  };
  hash: string;
  previousHash: string;
}

// ==================== 配置 ====================

export interface SAFConfig {
  organization: {
    name: string;
    governanceMaturity: number;  // 0.0-1.0，影响委托阈值
    complianceStandards: string[];
  };
  shepherd: {
    defaultAuthorityLevel: number;
    interventionTimeout: number;  // 毫秒
    maxAutoRetries: number;
  };
  orchestrator: {
    maxDecompositionDepth: number;
    parallelAgentLimit: number;
    conflictResolutionTimeout: number;
  };
  agents: {
    maxConcurrentTasks: number;
    tokenBudgetPerTask: number;
    cpuBudgetPerTask: number;
  };
  security: {
    requireApprovalFor: string[];  // 需要审批的操作类型
    sandboxEnabled: boolean;
    codeReviewRequired: boolean;
  };
}
