/**
 * 草奖励机制测试 (Grass Reward Mechanism Tests)
 * 测试草经济系统的核心功能
 */

import { GrassEconomy, WeakAIValidator, GrassType, CONSUMPTION_RULES } from '../../src/core/grass';

describe('Grass Reward Mechanism', () => {
  let economy: GrassEconomy;

  beforeEach(() => {
    economy = new GrassEconomy();
    economy.createAccount('agent-001');
  });

  describe('Account Creation', () => {
    it('should create an account with initial balance', () => {
      const account = economy.getAccount('agent-001');
      expect(account).toBeDefined();
      expect(account?.balance).toBe(100); // 初始草量
      expect(account?.efficiency).toBe(1.0);
      expect(account?.satisfaction).toBe(0.5);
    });

    it('should create multiple accounts', () => {
      economy.createAccount('agent-002');
      economy.createAccount('agent-003');
      
      const accounts = economy.getAllAccounts();
      expect(accounts.length).toBe(3);
    });
  });

  describe('Grass Allocation', () => {
    it('should allocate grass to an account', () => {
      const result = economy.allocate('agent-001', 50, 1.0, GrassType.BASIC, 'human-001', 'Task completed');
      expect(result).toBe(true);
      
      const account = economy.getAccount('agent-001');
      expect(account?.balance).toBe(150); // 100 + 50
      expect(account?.totalEarned).toBe(150);
    });

    it('should apply quality multiplier', () => {
      economy.allocate('agent-001', 50, 1.5, GrassType.PREMIUM, 'human-001', 'Excellent work');
      
      const account = economy.getAccount('agent-001');
      expect(account?.balance).toBe(175); // 100 + 50 * 1.5
    });

    it('should record grass history', () => {
      economy.allocate('agent-001', 50, 1.0, GrassType.BASIC, 'human-001', 'Task completed');
      
      const account = economy.getAccount('agent-001');
      expect(account?.grassHistory.length).toBe(1);
      expect(account?.grassHistory[0].amount).toBe(50);
      expect(account?.grassHistory[0].type).toBe(GrassType.BASIC);
    });

    it('should fail for non-existent account', () => {
      const result = economy.allocate('non-existent', 50);
      expect(result).toBe(false);
    });
  });

  describe('Grass Consumption', () => {
    it('should consume grass for operations', () => {
      const result = economy.consume('agent-001', 'EXECUTE_TASK', 1.0);
      expect(result).toBe(true);
      
      const account = economy.getAccount('agent-001');
      expect(account?.balance).toBe(95); // 100 - 5
      expect(account?.totalConsumed).toBe(5);
    });

    it('should calculate cost based on complexity', () => {
      economy.consume('agent-001', 'EXECUTE_TASK', 2.0);
      
      const account = economy.getAccount('agent-001');
      expect(account?.balance).toBe(90); // 100 - 5 * 2 * 1.0
    });

    it('should fail when insufficient grass', () => {
      // Drain the account
      economy.consume('agent-001', 'EXECUTE_TASK', 20.0); // Cost: 5 * 20 * 1.0 = 100
      
      const result = economy.consume('agent-001', 'EXECUTE_TASK', 1.0);
      expect(result).toBe(false); // Should fail due to insufficient grass
    });

    it('should trigger hunger alert when insufficient grass', () => {
      const hungerAlert = jest.fn();
      const hungryEconomy = new GrassEconomy(undefined, undefined, hungerAlert);
      hungryEconomy.createAccount('hungry-agent');
      
      // Drain the account
      hungryEconomy.consume('hungry-agent', 'EXECUTE_TASK', 20.0);
      
      // Try to consume more (should trigger hunger alert)
      hungryEconomy.consume('hungry-agent', 'EXECUTE_TASK', 1.0);
      
      expect(hungerAlert).toHaveBeenCalled();
    });
  });

  describe('Auto Allocation', () => {
    it('should auto allocate based on task result', () => {
      const result = economy.autoAllocate({
        agentId: 'agent-001',
        taskType: 'simple',
        qualityScore: 0.9,
        completedOnTime: true,
      });
      
      expect(result).toBe(true);
      
      const account = economy.getAccount('agent-001');
      expect(account?.balance).toBeGreaterThan(100); // Should have earned grass
      expect(account?.grassHistory.length).toBe(1);
    });

    it('should give higher rewards for complex tasks', () => {
      economy.autoAllocate({
        agentId: 'agent-001',
        taskType: 'complex',
        qualityScore: 0.95,
        completedOnTime: true,
        earlyBy: 48,
      });
      
      const account = economy.getAccount('agent-001');
      expect(account?.balance).toBeGreaterThan(150); // Complex task + early bonus
    });

    it('should give golden grass for innovative tasks', () => {
      economy.autoAllocate({
        agentId: 'agent-001',
        taskType: 'innovative',
        qualityScore: 1.0,
        completedOnTime: true,
        humanRating: 5,
      });
      
      const account = economy.getAccount('agent-001');
      const lastGrass = account?.grassHistory[account.grassHistory.length - 1];
      expect(lastGrass?.type).toBe(GrassType.GOLDEN);
    });
  });

  describe('Efficiency and Satisfaction', () => {
    it('should decrease efficiency when grass is low', () => {
      // Consume most of the grass
      economy.consume('agent-001', 'EXECUTE_TASK', 16.0); // Cost: 5 * 16 * 1.0 = 80
      
      const account = economy.getAccount('agent-001');
      expect(account?.balance).toBe(20); // 100 - 80
      expect(account?.efficiency).toBeLessThan(1.0); // Efficiency should drop
    });

    it('should increase satisfaction when grass is abundant', () => {
      economy.allocate('agent-001', 200, 1.0, GrassType.BASIC, 'human-001', 'Big reward');
      
      const account = economy.getAccount('agent-001');
      expect(account?.satisfaction).toBeGreaterThan(0.5); // Satisfaction should increase
    });
  });

  describe('System Stats', () => {
    it('should return system statistics', () => {
      economy.createAccount('agent-002');
      economy.createAccount('agent-003');
      
      economy.allocate('agent-001', 50);
      economy.allocate('agent-002', 100);
      economy.consume('agent-003', 'EXECUTE_TASK', 10.0);
      
      const stats = economy.getSystemStats();
      
      expect(stats.totalAccounts).toBe(3);
      expect(stats.totalBalance).toBeGreaterThan(0);
      expect(stats.averageBalance).toBeGreaterThan(0);
      expect(stats.hungryAgents).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Batch Operations', () => {
    it('should allocate to multiple agents', () => {
      economy.createAccount('agent-002');
      economy.createAccount('agent-003');
      
      const count = economy.allocateMany([
        { agentId: 'agent-001', amount: 50, reason: 'Task 1' },
        { agentId: 'agent-002', amount: 75, reason: 'Task 2' },
        { agentId: 'agent-003', amount: 100, reason: 'Task 3' },
      ]);
      
      expect(count).toBe(3);
      
      expect(economy.getAccount('agent-001')?.balance).toBe(150);
      expect(economy.getAccount('agent-002')?.balance).toBe(175);
      expect(economy.getAccount('agent-003')?.balance).toBe(200);
    });
  });

  describe('Account Reset', () => {
    it('should reset account to initial state', () => {
      economy.allocate('agent-001', 500);
      economy.consume('agent-001', 'EXECUTE_TASK', 10.0);
      
      economy.resetAccount('agent-001');
      
      const account = economy.getAccount('agent-001');
      expect(account?.balance).toBe(100);
      expect(account?.totalEarned).toBe(100);
      expect(account?.totalConsumed).toBe(0);
      expect(account?.efficiency).toBe(1.0);
      expect(account?.grassHistory.length).toBe(0);
    });
  });
});

describe('Weak AI Validator', () => {
  let validator: WeakAIValidator;

  beforeEach(() => {
    validator = new WeakAIValidator();
  });

  describe('Operation Validation', () => {
    it('should allow basic operations', () => {
      const result = validator.validateOperation('EXECUTE_TASK');
      expect(result.allowed).toBe(true);
    });

    it('should prohibit self-modification', () => {
      const result = validator.validateOperation('SELF_MODIFICATION');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('exceeds Weak AI capabilities');
      expect(result.fallback).toContain('human shepherd approval');
    });

    it('should prohibit autonomous decision-making', () => {
      const result = validator.validateOperation('AUTONOMOUS_DECISION');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('make fully autonomous decisions');
    });

    it('should prohibit ethical judgment', () => {
      const result = validator.validateOperation('ETHICAL_JUDGMENT');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('make independent ethical judgments');
    });

    it('should prohibit creative thinking', () => {
      const result = validator.validateOperation('CREATIVE_THINKING');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('engage in true creative thinking');
    });
  });

  describe('Limitation Report', () => {
    it('should generate a limitation report', () => {
      const report = validator.generateLimitationReport();
      expect(report).toContain('Weak AI Limitation Report');
      expect(report).toContain('No Self-Awareness: YES');
      expect(report).toContain('No Autonomous Goals: YES');
      expect(report).toContain('No General Reasoning: YES');
      expect(report).toContain('No Creative Thinking: YES');
      expect(report).toContain('This is a Weak AI (Narrow AI) system');
    });
  });

  describe('Weak AI Confirmation', () => {
    it('should confirm it is a Weak AI', () => {
      expect(validator.isWeakAI()).toBe(true);
    });

    it('should return all limitations', () => {
      const limitations = validator.getLimitations();
      expect(limitations.noSelfAwareness).toBe(true);
      expect(limitations.noAutonomousGoals).toBe(true);
      expect(limitations.noGeneralReasoning).toBe(true);
      expect(limitations.noCreativeThinking).toBe(true);
      expect(limitations.taskSpecificOnly).toBe(true);
      expect(limitations.requiresHumanPrompt).toBe(true);
      expect(limitations.cannotSelfImprove).toBe(true);
      expect(limitations.boundedContext).toBe(true);
      expect(limitations.noEmotionalUnderstanding).toBe(true);
      expect(limitations.noSocialNegotiation).toBe(true);
      expect(limitations.noEthicalJudgment).toBe(true);
      expect(limitations.supervisedLearningOnly).toBe(true);
      expect(limitations.noTransferLearning).toBe(true);
      expect(limitations.requiresTrainingData).toBe(true);
    });
  });
});