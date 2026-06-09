/**
 * API Router (Legacy Routes)
 * Provides RESTful API endpoints for SAF
 * 
 * NOTE: This file exports the router to be mounted by src/api/index.ts
 */

import { Router, Request, Response, NextFunction } from 'express';
import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';
import { ShepherdOperatorImpl, ModeSelector, InterventionEngine } from '../core/algorithms';
import {
  Task,
  CollaborationMode,
  TaskStatus,
  Agent,
  AgentLevel,
  InterventionPolicy,
  InterventionAction,
  EnvironmentState,
  AuditRecord,
  ActorType,
} from '../core/models';

// ==================== Logger ====================

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// ==================== In-Memory Store (Replace with DB in production) ====================

class InMemoryStore {
  tasks: Map<string, Task> = new Map();
  agents: Map<string, Agent> = new Map();
  auditLogs: AuditRecord[] = [];
  environmentState: EnvironmentState | null = null;
  shepherd: ShepherdOperatorImpl | null = null;
}

const store = new InMemoryStore();

// ==================== Auth Middleware ====================

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Missing token' } });
  }
  // TODO: JWT verification
  (req as any).userId = 'user-001';
  next();
};

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? { stack: err.stack } : undefined,
    },
  });
};

// ==================== Router Setup ====================

const router = Router();

// ----- 1. Task Management -----

const taskRouter = Router();

// Delegate task
// @POST /tasks/delegate
taskRouter.post('/delegate', async (req, res) => {
  try {
    const { title, description, tags, priority, deadline, constraints } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Title and description are required' },
      });
    }

    const task: Task = {
      id: uuidv4(),
      title,
      description,
      status: TaskStatus.PENDING,
      mode: CollaborationMode.COPILOT, // Default, will be overridden
      priority: priority || 3,
      estimatedEffort: 0,
      tags: tags || [],
      deliverables: [],
      createdAt: Date.now(),
      deadline: deadline ? new Date(deadline).getTime() : undefined,
    };

    if (!store.shepherd) {
      return res.status(503).json({
        error: { code: 'SHEPHERD_NOT_INITIALIZED', message: 'Shepherd operator not initialized' },
      });
    }

    const result = await store.shepherd.delegateTask(task);
    store.tasks.set(task.id, task);

    res.json({
      taskId: task.id,
      status: task.status,
      mode: result.assessment.recommendedMode,
      assignedAgent: result.assignedAgent
        ? {
            id: result.assignedAgent.id,
            name: result.assignedAgent.name,
            level: result.assignedAgent.level,
          }
        : null,
      assessment: result.assessment,
      approvalRequired: result.assessment.recommendedMode === CollaborationMode.COPILOT ||
                        result.assessment.feasibility.accountabilityRisk > 0.6,
      environmentContext: result.environmentContext,
    });
  } catch (err: any) {
    logger.error('Task delegation failed', { error: err.message });
    res.status(400).json({
      error: { code: 'TASK_DELEGATION_FAILED', message: err.message },
    });
  }
});

// Approve task
// @POST /tasks/:taskId/approve
taskRouter.post('/:taskId/approve', (req, res) => {
  const { taskId } = req.params;
  const { approved, comments, conditions } = req.body;

  const task = store.tasks.get(taskId);
  if (!task) {
    return res.status(404).json({
      error: { code: 'TASK_NOT_FOUND', message: `Task ${taskId} not found` },
    });
  }

  if (task.status !== TaskStatus.ASSIGNED && task.status !== TaskStatus.PENDING) {
    return res.status(400).json({
      error: { code: 'INVALID_STATUS', message: `Task is in ${task.status} status, cannot approve` },
    });
  }

  if (approved) {
    task.status = TaskStatus.IN_PROGRESS;
    task.startedAt = Date.now();
  } else {
    task.status = TaskStatus.ABORTED;
  }

  if (store.shepherd) {
    store.shepherd.getAuditLog().push({
      recordId: uuidv4(),
      timestamp: Date.now(),
      actor: { type: ActorType.HUMAN, id: (req as any).userId },
      action: { type: 'APPROVE_TASK', target: taskId, parameters: { approved, comments } },
      decision: { rationale: comments || 'Approval decision', confidence: 1.0, alternatives: [] },
      approval: { required: true, approvedBy: (req as any).userId, approvalTimestamp: Date.now() },
      hash: '',
      previousHash: '',
    });
  }

  res.json({
    taskId,
    status: task.status,
    approved,
    comments,
    conditions: conditions || [],
  });
});

// Get task list
taskRouter.get('/', (req, res) => {
  const { status, assignedTo, mode } = req.query;
  let tasks = Array.from(store.tasks.values());

  if (status) tasks = tasks.filter((t) => t.status === status);
  if (assignedTo) tasks = tasks.filter((t) => t.assignedTo === assignedTo);
  if (mode) tasks = tasks.filter((t) => t.mode === mode);

  res.json({ tasks, total: tasks.length });
});

// Get task detail
taskRouter.get('/:taskId', (req, res) => {
  const task = store.tasks.get(req.params.taskId);
  if (!task) {
    return res.status(404).json({
      error: { code: 'TASK_NOT_FOUND', message: `Task ${req.params.taskId} not found` },
    });
  }
  res.json(task);
});

router.use('/tasks', taskRouter);

// ----- 2. Agent Management -----

const agentRouter = Router();

// Register Agent
// @POST /agents/register
agentRouter.post('/register', (req, res) => {
  const { name, level, capabilities, autonomyLevel } = req.body;

  const agent: Agent = {
    id: uuidv4(),
    name,
    level: level || AgentLevel.EXECUTIVE,
    capabilityRange: capabilities || [],
    autonomyLevel: autonomyLevel || 0.5,
    status: 'IDLE',
    performanceHistory: [],
  };

  store.agents.set(agent.id, agent);

  logger.info('Agent registered', { agentId: agent.id, name: agent.name, level: agent.level });

  res.json({
    agentId: agent.id,
    name: agent.name,
    level: agent.level,
    status: agent.status,
  });
});

// Get agent list
// @GET /agents?status=IDLE&level=EXECUTIVE
agentRouter.get('/', (req, res) => {
  const { status, level } = req.query;
  let agents = Array.from(store.agents.values());

  if (status) agents = agents.filter((a) => a.status === status);
  if (level) agents = agents.filter((a) => a.level === level);

  res.json({
    agents: agents.map((a) => ({
      id: a.id,
      name: a.name,
      level: a.level,
      status: a.status,
      currentTask: a.currentTask,
      capabilities: a.capabilityRange,
    })),
    total: agents.length,
  });
});

// Get agent status
// @GET /agents/:agentId/status
agentRouter.get('/:agentId/status', (req, res) => {
  const agent = store.agents.get(req.params.agentId);
  if (!agent) {
    return res.status(404).json({
      error: { code: 'AGENT_NOT_FOUND', message: `Agent ${req.params.agentId} not found` },
    });
  }

  res.json({
    id: agent.id,
    name: agent.name,
    status: agent.status,
    currentTask: agent.currentTask,
    autonomyLevel: agent.autonomyLevel,
  });
});

// Intervene Agent
// @POST /agents/:agentId/intervene
agentRouter.post('/:agentId/intervene', (req, res) => {
  const { agentId } = req.params;
  const { reason, action } = req.body;

  const agent = store.agents.get(agentId);
  if (!agent) {
    return res.status(404).json({
      error: { code: 'AGENT_NOT_FOUND', message: `Agent ${agentId} not found` },
    });
  }

  if (!store.shepherd) {
    return res.status(503).json({
      error: { code: 'SHEPHERD_NOT_INITIALIZED', message: 'Shepherd not initialized' },
    });
  }

  const result = store.shepherd.intervene(agentId, reason);

  if (agent.currentTask) {
    const task = store.tasks.get(agent.currentTask);
    if (task) {
      task.status = TaskStatus.REVIEWING;
    }
  }

  res.json({
    agentId: result.agentId,
    interventionTime: result.interventionTime,
    previousAutonomy: result.previousAutonomy,
    currentStatus: 'PAUSED',
    reason,
  });
});

router.use('/agents', agentRouter);

// ----- 3. Orchestrator -----

const orchestratorRouter = Router();

// Task decomposition
// @POST /orchestrator/decompose
orchestratorRouter.post('/decompose', (req, res) => {
  const { taskId, strategy } = req.body;

  const task = store.tasks.get(taskId);
  if (!task) {
    return res.status(404).json({
      error: { code: 'TASK_NOT_FOUND', message: `Task ${taskId} not found` },
    });
  }

  // Simulate task decomposition
  const subtasks: Task[] = [
    {
      id: uuidv4(),
      parentId: taskId,
      title: `${task.title} - Requirement Analysis`,
      description: 'Analyze requirements and produce technical solution',
      status: TaskStatus.PENDING,
      mode: CollaborationMode.COPILOT,
      priority: task.priority,
      estimatedEffort: 2,
      tags: [...task.tags, 'analysis'],
      deliverables: [],
      createdAt: Date.now(),
    },
    {
      id: uuidv4(),
      parentId: taskId,
      title: `${task.title} - Implementation`,
      description: 'Write code implementation',
      status: TaskStatus.PENDING,
      mode: CollaborationMode.AGENT,
      priority: task.priority,
      estimatedEffort: 8,
      tags: [...task.tags, 'implementation'],
      deliverables: [],
      createdAt: Date.now(),
    },
    {
      id: uuidv4(),
      parentId: taskId,
      title: `${task.title} - Testing`,
      description: 'Write test cases and execute',
      status: TaskStatus.PENDING,
      mode: CollaborationMode.AGENT,
      priority: task.priority,
      estimatedEffort: 4,
      tags: [...task.tags, 'testing'],
      deliverables: [],
      createdAt: Date.now(),
    },
  ];

  subtasks.forEach((st) => store.tasks.set(st.id, st));

  res.json({
    taskId,
    subtasks: subtasks.map((st) => ({
      id: st.id,
      title: st.title,
      mode: st.mode,
      estimatedEffort: st.estimatedEffort,
    })),
    dependencies: [
      { from: subtasks[0].id, to: subtasks[1].id, type: 'BLOCKS' },
      { from: subtasks[1].id, to: subtasks[2].id, type: 'BLOCKS' },
    ],
    criticalPath: subtasks.map((st) => st.id),
  });
});

// Get mode suggestion
// @GET /orchestrator/mode-suggestion?taskId=task-001
orchestratorRouter.get('/mode-suggestion', (req, res) => {
  const { taskId } = req.query;

  const task = store.tasks.get(taskId as string);
  if (!task) {
    return res.status(404).json({
      error: { code: 'TASK_NOT_FOUND', message: `Task ${taskId} not found` },
    });
  }

  if (!store.environmentState) {
    return res.status(503).json({
      error: { code: 'ENVIRONMENT_NOT_INITIALIZED', message: 'Environment not initialized' },
    });
  }

  const modeSelector = new ModeSelector();
  const assessment = modeSelector.selectMode(task, store.environmentState);

  res.json(assessment);
});

router.use('/orchestrator', orchestratorRouter);

// ----- 4. Environment State -----

const environmentRouter = Router();

// Get current environment state
// @GET /environment/state
environmentRouter.get('/state', (req, res) => {
  if (!store.environmentState) {
    return res.status(503).json({
      error: { code: 'ENVIRONMENT_NOT_INITIALIZED', message: 'Environment not initialized' },
    });
  }

  res.json(store.environmentState);
});

// Shape environment
// @POST /environment/shape
environmentRouter.post('/shape', (req, res) => {
  const { action, payload } = req.body;

  if (!store.shepherd) {
    return res.status(503).json({
      error: { code: 'SHEPHERD_NOT_INITIALIZED', message: 'Shepherd not initialized' },
    });
  }

  store.shepherd.shapeEnvironment(action, payload);

  res.json({
    action,
    payload,
    timestamp: Date.now(),
    status: 'applied',
  });
});

router.use('/environment', environmentRouter);

// ----- 5. Audit Logs -----

const auditRouter = Router();

// Get audit logs
// @GET /audit/logs?from=2026-06-01&to=2026-06-09&actorType=AGENT
auditRouter.get('/logs', (req, res) => {
  const { from, to, actorType } = req.query;

  let logs = store.shepherd?.getAuditLog() || [];

  if (from) {
    const fromTime = new Date(from as string).getTime();
    logs = logs.filter((l) => l.timestamp >= fromTime);
  }
  if (to) {
    const toTime = new Date(to as string).getTime();
    logs = logs.filter((l) => l.timestamp <= toTime);
  }
  if (actorType) {
    logs = logs.filter((l) => l.actor.type === actorType);
  }

  res.json({
    logs: logs.map((l) => ({
      recordId: l.recordId,
      timestamp: l.timestamp,
      actor: l.actor,
      action: l.action,
      decision: l.decision,
      approval: l.approval,
    })),
    total: logs.length,
  });
});

// Verify audit chain integrity
// @GET /audit/verify
auditRouter.get('/verify', (req, res) => {
  const logs = store.shepherd?.getAuditLog() || [];

  let valid = true;
  let invalidRecord = null;

  for (let i = 1; i < logs.length; i++) {
    if (logs[i].previousHash !== logs[i - 1].hash) {
      valid = false;
      invalidRecord = { index: i, recordId: logs[i].recordId };
      break;
    }
  }

  res.json({
    valid,
    recordCount: logs.length,
    lastRecordHash: logs.length > 0 ? logs[logs.length - 1].hash : null,
    invalidRecord,
    lastVerified: Date.now(),
  });
});

router.use('/audit', auditRouter);

// ----- 6. System Initialization -----

// Initialize Shepherd Operator
// @POST /system/init
router.post('/system/init', (req, res) => {
  const { humanName, humanRole, agentConfigs } = req.body;

  const environmentState: EnvironmentState = {
    id: uuidv4(),
    version: 1,
    timestamp: Date.now(),
    codebase: {
      repositoryUrl: 'https://github.com/example/repo',
      branch: 'main',
      commitHash: 'abc123',
      fileTree: [],
      dependencyGraph: { nodes: [], edges: [] },
      recentChanges: [],
    },
    taskRegistry: {
      tasks: [],
      dependencies: [],
    },
    metrics: {
      codeQuality: {
        maintainabilityIndex: 85,
        cyclomaticComplexity: 10,
        codeDuplication: 5,
        technicalDebt: 20,
      },
      testCoverage: 0.8,
      securityScore: 0.9,
      performanceMetrics: {
        responseTimeP95: 150,
        throughput: 1000,
        errorRate: 0.01,
      },
      agentUtilization: {
        totalAgents: 0,
        activeAgents: 0,
        tasksCompleted: 0,
        tasksFailed: 0,
        averageCompletionTime: 0,
      },
    },
    constraints: {
      codingStandards: ['typescript', 'eslint:recommended'],
      securityPolicies: [
        { id: 'sec-001', name: 'No plaintext passwords', severity: 'CRITICAL', rule: 'passwords must be hashed' },
      ],
      performanceThresholds: [
        { metric: 'responseTime', maxValue: 200, unit: 'ms' },
      ],
      complianceRules: [],
    },
  };

  const interventionPolicy: InterventionPolicy = {
    id: uuidv4(),
    rules: [
      {
        id: 'rule-001',
        name: 'Security Alert',
        condition: { type: 'SECURITY_ALERT', parameters: { severity: 'CRITICAL' } },
        action: InterventionAction.REQUIRE_APPROVAL,
        priority: 1,
      },
      {
        id: 'rule-002',
        name: 'High Complexity',
        condition: { type: 'METRIC_THRESHOLD', parameters: { metric: 'cyclomaticComplexity', threshold: 20 } },
        action: InterventionAction.NOTIFY,
        priority: 2,
      },
    ],
    defaultAction: InterventionAction.NOTIFY,
  };

  store.shepherd = new ShepherdOperatorImpl({
    id: uuidv4(),
    human: {
      id: uuidv4(),
      name: humanName || 'Default User',
      role: humanRole || 'Developer',
      domainKnowledge: [],
      judgmentCapabilities: [],
      authorityLevel: 5,
    },
    agents: [],
    environment: environmentState,
    interventionPolicy,
    environmentShapingFunction: {
      id: uuidv4(),
      goalSpecifications: [],
      constraintModifications: [],
      feedbackRules: [],
    },
  });

  store.environmentState = environmentState;

  if (agentConfigs && Array.isArray(agentConfigs)) {
    for (const config of agentConfigs) {
      const agent: Agent = {
        id: uuidv4(),
        name: config.name,
        level: config.level || AgentLevel.EXECUTIVE,
        capabilityRange: config.capabilities || [],
        autonomyLevel: config.autonomyLevel || 0.5,
        status: 'IDLE',
        performanceHistory: [],
      };
      store.agents.set(agent.id, agent);
      store.shepherd.agents.push(agent);
    }
  }

  logger.info('System initialized', {
    shepherdId: store.shepherd.id,
    humanId: store.shepherd.human.id,
    agentCount: store.shepherd.agents.length,
  });

  res.json({
    shepherdId: store.shepherd.id,
    humanId: store.shepherd.human.id,
    environmentId: environmentState.id,
    agents: store.shepherd.agents.map((a) => ({
      id: a.id,
      name: a.name,
      level: a.level,
    })),
    status: 'initialized',
  });
});

// Error handler
router.use(errorHandler);

export default router;
