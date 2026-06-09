/**
 * 牧羊犬-羊协同管理模型核心实现
 * 
 * 核心设计：
 * - 羊 (Sheep)：执行者，拥有高自主性和完整功能
 * - 牧羊犬 (Shepherd Dog)：管理者，可以是人或AI
 * - 牧羊人 (Shepherd)：最终决策者，人类独占
 * 
 * 重要前提：所有AI均为弱AI (Narrow AI)，具备当前LLM全部功能，
 * 但不具备自我意识、自主目标、通用推理等强AI特征。
 */

import { v4 as uuidv4 } from 'uuid';

// ==================== 类型定义 ====================

export type EntityType = 'AI' | 'HUMAN';

export enum SheepStatus {
  ACTIVE = 'active',
  IDLE = 'idle',
  RESTING = 'resting',
  LEARNING = 'learning',
  ERROR = 'error',
}

export enum DogRole {
  TASK_MANAGER = 'task_manager',
  QUALITY_INSPECTOR = 'quality_inspector',
  SECURITY_GUARD = 'security_guard',
  RESOURCE_COORDINATOR = 'resource_coordinator',
  COMMUNICATION_HUB = 'communication_hub',
}

export interface SheepCapabilities {
  codeGeneration: boolean;
  codeAnalysis: boolean;
  reasoning: boolean;
  naturalLanguage: boolean;
  multiModal: boolean;
  toolUse: boolean;
  memory: boolean;
  planning: boolean;
  selfCorrection: boolean;
  collaboration: boolean;
}

export interface Sheep {
  id: string;
  name: string;
  type: EntityType;
  capabilities: SheepCapabilities;
  autonomy: number; // 0-1
  status: SheepStatus;
  currentTask?: string;
  grassBalance: number;
  reputation: number;
  title?: string; // 称号
}

export interface DogAuthority {
  canAssignTasks: boolean;
  canMonitor: boolean;
  canIntervene: boolean;
  canSetBoundaries: boolean;
  canReport: boolean;
  canCoordinate: boolean;
}

export interface ShepherdDog {
  id: string;
  name: string;
  type: EntityType;
  role: DogRole;
  flock: string[]; // 管理的羊ID列表
  authority: DogAuthority;
  grassBudget: number;
}

export interface Shepherd {
  id: string;
  name: string;
  dogs: string[]; // 管理的牧羊犬ID列表
  totalGrassBudget: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed';
  assignedTo?: string;
  assignedBy?: string;
  priority: number;
  complexity: number;
  createdAt: number;
  completedAt?: number;
  result?: any;
}

export interface GrassIncentive {
  id: string;
  amount: number;
  quality: number;
  type: GrassType;
  issuedBy: string;
  issuedAt: number;
  reason: string;
  recipientId: string;
}

export enum GrassType {
  APPRECIATION = 'appreciation',
  BONUS = 'bonus',
  COLLABORATION = 'collaboration',
  INNOVATION = 'innovation',
  MILESTONE = 'milestone',
  LEARNING = 'learning',
}

export interface IdentitySwitch {
  entityId: string;
  currentRole: 'SHEEP' | 'DOG';
  targetRole: 'SHEEP' | 'DOG';
  conditions: {
    skillMatch: boolean;
    availability: boolean;
    workload: boolean;
  };
  approval?: {
    approvedBy: string;
    approvedAt: number;
    reason: string;
  };
}

// ==================== 羊的实现 ====================

export class SheepEntity {
  id: string;
  name: string;
  type: EntityType;
  capabilities: SheepCapabilities;
  autonomy: number;
  status: SheepStatus;
  currentTask?: string;
  grassBalance: number;
  reputation: number;
  title?: string;

  constructor(config: Partial<Sheep> & { name: string; type: EntityType }) {
    this.id = config.id || uuidv4();
    this.name = config.name;
    this.type = config.type;
    this.capabilities = config.capabilities || this.getDefaultCapabilities();
    this.autonomy = config.autonomy ?? 0.8; // 默认高自主性
    this.status = config.status || SheepStatus.IDLE;
    this.currentTask = config.currentTask;
    this.grassBalance = config.grassBalance || 0;
    this.reputation = config.reputation || 0;
    this.title = config.title;
  }

  private getDefaultCapabilities(): SheepCapabilities {
    return {
      codeGeneration: true,
      codeAnalysis: true,
      reasoning: true,
      naturalLanguage: true,
      multiModal: true,
      toolUse: true,
      memory: true,
      planning: true,
      selfCorrection: true,
      collaboration: true,
    };
  }

  async execute(task: Task): Promise<any> {
    // 羊自主执行任务，拥有完整功能
    this.status = SheepStatus.ACTIVE;
    this.currentTask = task.id;
    
    // 模拟执行过程
    const result = await this.performTask(task);
    
    this.status = SheepStatus.IDLE;
    this.currentTask = undefined;
    
    return result;
  }

  private async performTask(task: Task): Promise<any> {
    // 实际任务执行逻辑
    // 羊可以自主决定执行路径
    return {
      taskId: task.id,
      completed: true,
      quality: Math.random() * 0.3 + 0.7, // 70-100%质量
      executionTime: Date.now(),
    };
  }

  async collaborate(otherSheep: SheepEntity, task: Task): Promise<any> {
    // 与其他羊协作
    const sharedPlan = await this.negotiatePlan(otherSheep, task);
    return this.executeSharedPlan(sharedPlan, otherSheep);
  }

  private async negotiatePlan(otherSheep: SheepEntity, task: Task): Promise<any> {
    // 协商执行计划
    return {
      taskId: task.id,
      participants: [this.id, otherSheep.id],
      plan: 'shared_plan',
    };
  }

  private async executeSharedPlan(plan: any, otherSheep: SheepEntity): Promise<any> {
    // 执行共享计划
    return {
      planId: plan.taskId,
      completed: true,
      collaborators: [this.id, otherSheep.id],
    };
  }

  receiveGrass(incentive: GrassIncentive): void {
    this.grassBalance += incentive.amount * incentive.quality;
    
    // 更新声望
    this.reputation += incentive.amount * 0.1;
    
    // 更新称号
    this.updateTitle();
  }

  private updateTitle(): void {
    if (this.reputation > 1000) {
      this.title = '传奇羊';
    } else if (this.reputation > 500) {
      this.title = '资深羊';
    } else if (this.reputation > 200) {
      this.title = '熟练羊';
    } else if (this.reputation > 50) {
      this.title = '见习羊';
    }
  }

  toSheep(): Sheep {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      capabilities: this.capabilities,
      autonomy: this.autonomy,
      status: this.status,
      currentTask: this.currentTask,
      grassBalance: this.grassBalance,
      reputation: this.reputation,
      title: this.title,
    };
  }
}

// ==================== 牧羊犬的实现 ====================

export class ShepherdDogEntity {
  id: string;
  name: string;
  type: EntityType;
  role: DogRole;
  flock: string[];
  authority: DogAuthority;
  grassBudget: number;

  constructor(config: Partial<ShepherdDog> & { name: string; type: EntityType; role: DogRole }) {
    this.id = config.id || uuidv4();
    this.name = config.name;
    this.type = config.type;
    this.role = config.role;
    this.flock = config.flock || [];
    this.authority = config.authority || this.getDefaultAuthority(config.role);
    this.grassBudget = config.grassBudget || 0;
  }

  private getDefaultAuthority(role: DogRole): DogAuthority {
    switch (role) {
      case DogRole.TASK_MANAGER:
        return {
          canAssignTasks: true,
          canMonitor: true,
          canIntervene: true,
          canSetBoundaries: false,
          canReport: true,
          canCoordinate: true,
        };
      case DogRole.QUALITY_INSPECTOR:
        return {
          canAssignTasks: false,
          canMonitor: true,
          canIntervene: true,
          canSetBoundaries: true,
          canReport: true,
          canCoordinate: false,
        };
      case DogRole.SECURITY_GUARD:
        return {
          canAssignTasks: false,
          canMonitor: true,
          canIntervene: true,
          canSetBoundaries: true,
          canReport: true,
          canCoordinate: false,
        };
      case DogRole.RESOURCE_COORDINATOR:
        return {
          canAssignTasks: false,
          canMonitor: true,
          canIntervene: false,
          canSetBoundaries: true,
          canReport: true,
          canCoordinate: true,
        };
      case DogRole.COMMUNICATION_HUB:
        return {
          canAssignTasks: false,
          canMonitor: true,
          canIntervene: false,
          canSetBoundaries: false,
          canReport: true,
          canCoordinate: true,
        };
      default:
        return {
          canAssignTasks: false,
          canMonitor: true,
          canIntervene: false,
          canSetBoundaries: false,
          canReport: true,
          canCoordinate: false,
        };
    }
  }

  async assignTask(task: Task, sheep: SheepEntity): Promise<boolean> {
    if (!this.authority.canAssignTasks) return false;
    
    // 检查羊是否在管理范围内
    if (!this.flock.includes(sheep.id)) return false;
    
    // 分配任务
    task.assignedTo = sheep.id;
    task.assignedBy = this.id;
    task.status = 'assigned';
    
    return true;
  }

  async monitor(sheep: SheepEntity): Promise<any> {
    if (!this.authority.canMonitor) return null;
    
    return {
      sheepId: sheep.id,
      status: sheep.status,
      currentTask: sheep.currentTask,
      autonomy: sheep.autonomy,
      reputation: sheep.reputation,
    };
  }

  async intervene(sheep: SheepEntity, action: string): Promise<boolean> {
    if (!this.authority.canIntervene) return false;
    
    // 干预羊的执行
    // 例如：暂停任务、要求重新执行、调整参数等
    return true;
  }

  async setBoundary(sheepId: string, boundary: any): Promise<boolean> {
    if (!this.authority.canSetBoundaries) return false;
    
    // 设置执行边界
    return true;
  }

  async coordinate(conflict: any): Promise<any> {
    if (!this.authority.canCoordinate) return null;
    
    // 协调冲突
    return {
      resolved: true,
      solution: 'negotiated_solution',
    };
  }

  async reportToShepherd(): Promise<any> {
    if (!this.authority.canReport) return null;
    
    // 生成报告给牧羊人
    return {
      dogId: this.id,
      role: this.role,
      flockStatus: this.flock.map(id => ({
        sheepId: id,
        status: 'active', // 简化
      })),
      timestamp: Date.now(),
    };
  }

  async allocateGrass(sheepId: string, amount: number, reason: string): Promise<GrassIncentive | null> {
    if (this.grassBudget < amount) return null;
    
    this.grassBudget -= amount;
    
    return {
      id: uuidv4(),
      amount,
      quality: 1.0,
      type: GrassType.APPRECIATION,
      issuedBy: this.id,
      issuedAt: Date.now(),
      reason,
      recipientId: sheepId,
    };
  }

  toShepherdDog(): ShepherdDog {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      role: this.role,
      flock: this.flock,
      authority: this.authority,
      grassBudget: this.grassBudget,
    };
  }
}

// ==================== 牧羊人的实现 ====================

export class ShepherdEntity {
  id: string;
  name: string;
  dogs: string[];
  totalGrassBudget: number;

  constructor(config: Partial<Shepherd> & { name: string }) {
    this.id = config.id || uuidv4();
    this.name = config.name;
    this.dogs = config.dogs || [];
    this.totalGrassBudget = config.totalGrassBudget || 10000;
  }

  async makeDecision(report: any): Promise<any> {
    // 牧羊人做出最终决策
    return {
      decision: 'approved',
      reportId: report.dogId,
      timestamp: Date.now(),
    };
  }

  async allocateBudgetToDog(dogId: string, amount: number): Promise<boolean> {
    if (this.totalGrassBudget < amount) return false;
    
    if (!this.dogs.includes(dogId)) return false;
    
    this.totalGrassBudget -= amount;
    return true;
  }

  async approveIdentitySwitch(switchRequest: IdentitySwitch): Promise<boolean> {
    // 批准身份切换
    if (!switchRequest.conditions.skillMatch) return false;
    if (!switchRequest.conditions.availability) return false;
    if (!switchRequest.conditions.workload) return false;
    
    switchRequest.approval = {
      approvedBy: this.id,
      approvedAt: Date.now(),
      reason: 'Approved by shepherd',
    };
    
    return true;
  }

  async terminateTask(taskId: string): Promise<boolean> {
    // 终止任何任务
    return true;
  }

  async overrideDogDecision(dogId: string, decision: any): Promise<boolean> {
    // 覆盖牧羊犬的决策
    return true;
  }

  toShepherd(): Shepherd {
    return {
      id: this.id,
      name: this.name,
      dogs: this.dogs,
      totalGrassBudget: this.totalGrassBudget,
    };
  }
}

// ==================== 协同管理器 ====================

export class CollaborativeManager {
  private sheep: Map<string, SheepEntity> = new Map();
  private dogs: Map<string, ShepherdDogEntity> = new Map();
  private shepherd?: ShepherdEntity;
  private tasks: Map<string, Task> = new Map();
  private grassHistory: GrassIncentive[] = [];

  constructor() {}

  // 注册牧羊人
  registerShepherd(shepherd: ShepherdEntity): void {
    this.shepherd = shepherd;
  }

  // 注册羊
  registerSheep(sheep: SheepEntity): void {
    this.sheep.set(sheep.id, sheep);
  }

  // 注册牧羊犬
  registerDog(dog: ShepherdDogEntity): void {
    this.dogs.set(dog.id, dog);
  }

  // 分配任务（通过牧羊犬）
  async assignTask(task: Task, sheepId: string, dogId: string): Promise<boolean> {
    const dog = this.dogs.get(dogId);
    const sheep = this.sheep.get(sheepId);
    
    if (!dog || !sheep) return false;
    
    return await dog.assignTask(task, sheep);
  }

  // 羊执行任务
  async executeTask(sheepId: string, taskId: string): Promise<any> {
    const sheep = this.sheep.get(sheepId);
    const task = this.tasks.get(taskId);
    
    if (!sheep || !task) return null;
    
    const result = await sheep.execute(task);
    task.status = 'completed';
    task.completedAt = Date.now();
    task.result = result;
    
    return result;
  }

  // 牧羊犬监控
  async monitorFlock(dogId: string): Promise<any[]> {
    const dog = this.dogs.get(dogId);
    if (!dog) return [];
    
    const results = [];
    for (const sheepId of dog.flock) {
      const sheep = this.sheep.get(sheepId);
      if (sheep) {
        results.push(await dog.monitor(sheep));
      }
    }
    
    return results;
  }

  // 发放草奖励
  async grantGrass(dogId: string, sheepId: string, amount: number, reason: string): Promise<GrassIncentive | null> {
    const dog = this.dogs.get(dogId);
    const sheep = this.sheep.get(sheepId);
    
    if (!dog || !sheep) return null;
    
    const incentive = await dog.allocateGrass(sheepId, amount, reason);
    if (incentive) {
      sheep.receiveGrass(incentive);
      this.grassHistory.push(incentive);
    }
    
    return incentive;
  }

  // 身份切换
  async switchIdentity(entityId: string, targetRole: 'SHEEP' | 'DOG'): Promise<boolean> {
    const sheep = this.sheep.get(entityId);
    const dog = this.dogs.get(entityId);
    
    const currentRole = sheep ? 'SHEEP' : dog ? 'DOG' : null;
    if (!currentRole) return false;
    
    const switchRequest: IdentitySwitch = {
      entityId,
      currentRole,
      targetRole,
      conditions: {
        skillMatch: true,
        availability: true,
        workload: true,
      },
    };
    
    if (this.shepherd) {
      return await this.shepherd.approveIdentitySwitch(switchRequest);
    }
    
    return false;
  }

  // 获取统计
  getStatistics(): {
    totalSheep: number;
    totalDogs: number;
    activeSheep: number;
    idleSheep: number;
    totalGrassDistributed: number;
    totalTasksCompleted: number;
  } {
    const allSheep = Array.from(this.sheep.values());
    const allDogs = Array.from(this.dogs.values());
    const allTasks = Array.from(this.tasks.values());
    
    return {
      totalSheep: allSheep.length,
      totalDogs: allDogs.length,
      activeSheep: allSheep.filter(s => s.status === SheepStatus.ACTIVE).length,
      idleSheep: allSheep.filter(s => s.status === SheepStatus.IDLE).length,
      totalGrassDistributed: this.grassHistory.reduce((sum, g) => sum + g.amount * g.quality, 0),
      totalTasksCompleted: allTasks.filter(t => t.status === 'completed').length,
    };
  }

  // 获取所有羊
  getAllSheep(): Sheep[] {
    return Array.from(this.sheep.values()).map(s => s.toSheep());
  }

  // 获取所有牧羊犬
  getAllDogs(): ShepherdDog[] {
    return Array.from(this.dogs.values()).map(d => d.toShepherdDog());
  }

  // 获取牧羊人
  getShepherd(): Shepherd | undefined {
    return this.shepherd?.toShepherd();
  }
}

// ==================== 弱AI声明 ====================

export const WEAK_AI_DECLARATION = `
本系统中的AI Agent（羊或牧羊犬）均为弱AI（Narrow AI）。

它们具备当前大型语言模型（LLM）的全部功能：
- 代码生成与补全
- 代码分析与审查
- 逻辑推理与规划
- 自然语言理解与生成
- 多模态处理（文本、代码、图像）
- 工具使用（API调用、文件操作）
- 上下文记忆与长对话
- 自我修正与反思
- 多Agent协作

但它们不具备以下强AI（AGI）特征：
- 自我意识与主观体验
- 自主目标设定（目标由人类设定）
- 跨领域的通用推理
- 意识与情感
- 自由意志

所有AI的行为都在人类设计的框架内运行，
最终决策权始终由人类牧羊人保留。
`;

export default CollaborativeManager;
