/**
 * 牧羊犬-羊协同管理模型测试
 * 测试羊、牧羊犬、牧羊人的协作机制
 */

import {
  SheepEntity,
  ShepherdDogEntity,
  ShepherdEntity,
  CollaborativeManager,
  SheepStatus,
  DogRole,
  GrassType,
  WEAK_AI_DECLARATION,
  SheepCapabilities,
  DogAuthority,
} from '../../src/core/collaborative';

describe('Shepherd Dog - Sheep Collaborative Model', () => {
  let manager: CollaborativeManager;
  let shepherd: ShepherdEntity;
  let dog: ShepherdDogEntity;
  let sheep: SheepEntity;

  beforeEach(() => {
    manager = new CollaborativeManager();
    shepherd = new ShepherdEntity({ name: 'Test Shepherd' });
    dog = new ShepherdDogEntity({
      name: 'Task Manager Dog',
      type: 'AI',
      role: DogRole.TASK_MANAGER,
      flock: [],
    });
    sheep = new SheepEntity({
      name: 'Code Sheep',
      type: 'AI',
      capabilities: {
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
      },
    });

    manager.registerShepherd(shepherd);
    manager.registerDog(dog);
    manager.registerSheep(sheep);

    // 将羊加入牧羊犬的管理范围
    dog.flock.push(sheep.id);
  });

  describe('Sheep (羊)', () => {
    it('should create a sheep with full capabilities', () => {
      expect(sheep.id).toBeDefined();
      expect(sheep.name).toBe('Code Sheep');
      expect(sheep.type).toBe('AI');
      expect(sheep.autonomy).toBe(0.8); // 默认高自主性
      expect(sheep.status).toBe(SheepStatus.IDLE);
      expect(sheep.capabilities.codeGeneration).toBe(true);
      expect(sheep.capabilities.reasoning).toBe(true);
      expect(sheep.capabilities.planning).toBe(true);
    });

    it('should execute a task autonomously', async () => {
      const task = {
        id: 'task-001',
        title: 'Implement login',
        description: 'Create login functionality',
        status: 'pending',
        priority: 5,
        complexity: 3,
        createdAt: Date.now(),
      };

      const result = await sheep.execute(task);
      expect(result).toBeDefined();
      expect(result.completed).toBe(true);
      expect(result.quality).toBeGreaterThan(0.7);
    });

    it('should collaborate with another sheep', async () => {
      const sheep2 = new SheepEntity({
        name: 'Test Sheep 2',
        type: 'HUMAN',
        capabilities: {
          codeGeneration: true,
          codeAnalysis: true,
          reasoning: true,
          naturalLanguage: true,
          multiModal: false,
          toolUse: true,
          memory: true,
          planning: true,
          selfCorrection: true,
          collaboration: true,
        },
      });

      const task = {
        id: 'task-002',
        title: 'Collaborative task',
        description: 'Work together',
        status: 'pending',
        priority: 5,
        complexity: 3,
        createdAt: Date.now(),
      };

      const result = await sheep.collaborate(sheep2, task);
      expect(result).toBeDefined();
      expect(result.collaborators).toContain(sheep.id);
      expect(result.collaborators).toContain(sheep2.id);
    });

    it('should receive grass and update reputation', () => {
      const incentive = {
        id: 'grass-001',
        amount: 50,
        quality: 1.0,
        type: GrassType.APPRECIATION,
        issuedBy: dog.id,
        issuedAt: Date.now(),
        reason: 'Good work',
        recipientId: sheep.id,
      };

      sheep.receiveGrass(incentive);
      expect(sheep.grassBalance).toBe(50);
      expect(sheep.reputation).toBe(5); // 50 * 0.1
    });

    it('should update title based on reputation', () => {
      // Give enough reputation for title
      for (let i = 0; i < 20; i++) {
        const incentive = {
          id: `grass-${i}`,
          amount: 50,
          quality: 1.0,
          type: GrassType.APPRECIATION,
          issuedBy: dog.id,
          issuedAt: Date.now(),
          reason: 'Good work',
          recipientId: sheep.id,
        };
        sheep.receiveGrass(incentive);
      }

      expect(sheep.reputation).toBeGreaterThan(50);
      expect(sheep.title).toBeDefined();
    });
  });

  describe('Shepherd Dog (牧羊犬)', () => {
    it('should create a dog with appropriate authority', () => {
      expect(dog.id).toBeDefined();
      expect(dog.name).toBe('Task Manager Dog');
      expect(dog.type).toBe('AI');
      expect(dog.role).toBe(DogRole.TASK_MANAGER);
      expect(dog.authority.canAssignTasks).toBe(true);
      expect(dog.authority.canMonitor).toBe(true);
      expect(dog.authority.canIntervene).toBe(true);
    });

    it('should assign task to sheep', async () => {
      const task = {
        id: 'task-003',
        title: 'Test task',
        description: 'For testing',
        status: 'pending',
        priority: 3,
        complexity: 2,
        createdAt: Date.now(),
      };

      const result = await dog.assignTask(task, sheep);
      expect(result).toBe(true);
      expect(task.assignedTo).toBe(sheep.id);
      expect(task.assignedBy).toBe(dog.id);
      expect(task.status).toBe('assigned');
    });

    it('should not assign task to sheep outside flock', async () => {
      const outsideSheep = new SheepEntity({
        name: 'Outside Sheep',
        type: 'AI',
      });

      const task = {
        id: 'task-004',
        title: 'Outside task',
        description: 'Should fail',
        status: 'pending',
        priority: 3,
        complexity: 2,
        createdAt: Date.now(),
      };

      const result = await dog.assignTask(task, outsideSheep);
      expect(result).toBe(false);
    });

    it('should monitor sheep', async () => {
      const status = await dog.monitor(sheep);
      expect(status).toBeDefined();
      expect(status.sheepId).toBe(sheep.id);
      expect(status.status).toBe(SheepStatus.IDLE);
    });

    it('should allocate grass to sheep', async () => {
      dog.grassBudget = 100;
      const incentive = await dog.allocateGrass(sheep.id, 50, 'Good work');
      expect(incentive).toBeDefined();
      expect(incentive?.amount).toBe(50);
      expect(incentive?.recipientId).toBe(sheep.id);
      expect(dog.grassBudget).toBe(50); // 100 - 50
    });

    it('should not allocate grass if budget insufficient', async () => {
      dog.grassBudget = 10;
      const incentive = await dog.allocateGrass(sheep.id, 50, 'Too much');
      expect(incentive).toBeNull();
    });

    it('should report to shepherd', async () => {
      const report = await dog.reportToShepherd();
      expect(report).toBeDefined();
      expect(report.dogId).toBe(dog.id);
      expect(report.role).toBe(DogRole.TASK_MANAGER);
    });
  });

  describe('Shepherd (牧羊人)', () => {
    it('should create a shepherd', () => {
      expect(shepherd.id).toBeDefined();
      expect(shepherd.name).toBe('Test Shepherd');
      expect(shepherd.totalGrassBudget).toBe(10000);
    });

    it('should make decisions', async () => {
      const report = {
        dogId: dog.id,
        role: DogRole.TASK_MANAGER,
        flockStatus: [],
        timestamp: Date.now(),
      };

      const decision = await shepherd.makeDecision(report);
      expect(decision).toBeDefined();
      expect(decision.decision).toBe('approved');
    });

    it('should allocate budget to dog', async () => {
      shepherd.dogs.push(dog.id);
      const result = await shepherd.allocateBudgetToDog(dog.id, 1000);
      expect(result).toBe(true);
      expect(shepherd.totalGrassBudget).toBe(9000); // 10000 - 1000
    });

    it('should not allocate budget to unknown dog', async () => {
      const result = await shepherd.allocateBudgetToDog('unknown-dog', 1000);
      expect(result).toBe(false);
    });

    it('should approve identity switch', async () => {
      const switchRequest = {
        entityId: sheep.id,
        currentRole: 'SHEEP' as const,
        targetRole: 'DOG' as const,
        conditions: {
          skillMatch: true,
          availability: true,
          workload: true,
        },
      };

      const result = await shepherd.approveIdentitySwitch(switchRequest);
      expect(result).toBe(true);
      expect(switchRequest.approval).toBeDefined();
      expect(switchRequest.approval?.approvedBy).toBe(shepherd.id);
    });

    it('should reject identity switch if conditions not met', async () => {
      const switchRequest = {
        entityId: sheep.id,
        currentRole: 'SHEEP' as const,
        targetRole: 'DOG' as const,
        conditions: {
          skillMatch: false,
          availability: true,
          workload: true,
        },
      };

      const result = await shepherd.approveIdentitySwitch(switchRequest);
      expect(result).toBe(false);
    });
  });

  describe('Collaborative Manager (协同管理器)', () => {
    it('should register all entities', () => {
      expect(manager.getShepherd()).toBeDefined();
      expect(manager.getAllSheep().length).toBe(1);
      expect(manager.getAllDogs().length).toBe(1);
    });

    it('should assign and execute task', async () => {
      const task = {
        id: 'task-005',
        title: 'Manager task',
        description: 'Test through manager',
        status: 'pending',
        priority: 5,
        complexity: 3,
        createdAt: Date.now(),
      };

      const assigned = await manager.assignTask(task, sheep.id, dog.id);
      expect(assigned).toBe(true);

      const result = await manager.executeTask(sheep.id, task.id);
      expect(result).toBeDefined();
    });

    it('should monitor flock', async () => {
      const status = await manager.monitorFlock(dog.id);
      expect(status).toBeDefined();
      expect(status.length).toBe(1);
      expect(status[0].sheepId).toBe(sheep.id);
    });

    it('should grant grass through dog', async () => {
      dog.grassBudget = 100;
      const incentive = await manager.grantGrass(dog.id, sheep.id, 50, 'Excellent work');
      expect(incentive).toBeDefined();
      expect(incentive?.amount).toBe(50);
      expect(sheep.grassBalance).toBe(50);
    });

    it('should get statistics', () => {
      const stats = manager.getStatistics();
      expect(stats.totalSheep).toBe(1);
      expect(stats.totalDogs).toBe(1);
      expect(stats.activeSheep).toBe(0);
      expect(stats.idleSheep).toBe(1);
      expect(stats.totalGrassDistributed).toBe(0);
    });
  });

  describe('Weak AI Declaration', () => {
    it('should have the declaration text', () => {
      expect(WEAK_AI_DECLARATION).toContain('弱AI');
      expect(WEAK_AI_DECLARATION).toContain('Narrow AI');
      expect(WEAK_AI_DECLARATION).toContain('代码生成');
      expect(WEAK_AI_DECLARATION).toContain('自我意识');
      expect(WEAK_AI_DECLARATION).toContain('最终决策权');
    });
  });

  describe('Role Flexibility', () => {
    it('should allow human to be a sheep', () => {
      const humanSheep = new SheepEntity({
        name: 'Human Coder',
        type: 'HUMAN',
        capabilities: {
          codeGeneration: true,
          codeAnalysis: true,
          reasoning: true,
          naturalLanguage: true,
          multiModal: false,
          toolUse: true,
          memory: true,
          planning: true,
          selfCorrection: true,
          collaboration: true,
        },
      });

      expect(humanSheep.type).toBe('HUMAN');
      expect(humanSheep.capabilities.codeGeneration).toBe(true);
    });

    it('should allow AI to be a dog', () => {
      const aiDog = new ShepherdDogEntity({
        name: 'AI Manager',
        type: 'AI',
        role: DogRole.QUALITY_INSPECTOR,
      });

      expect(aiDog.type).toBe('AI');
      expect(aiDog.role).toBe(DogRole.QUALITY_INSPECTOR);
      expect(aiDog.authority.canMonitor).toBe(true);
    });

    it('should allow human to be a dog', () => {
      const humanDog = new ShepherdDogEntity({
        name: 'Human Manager',
        type: 'HUMAN',
        role: DogRole.TASK_MANAGER,
      });

      expect(humanDog.type).toBe('HUMAN');
      expect(humanDog.authority.canAssignTasks).toBe(true);
    });
  });
});
