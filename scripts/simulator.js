/**
 * 牧羊人架构框架模拟器
 * 模拟牧羊犬-羊协同管理模型的运行，生成数据
 * 不依赖外部依赖，纯 Node.js 实现
 */

const fs = require('fs');
const path = require('path');

// ==================== 工具函数 ====================

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
  return Math.floor(randomBetween(min, max));
}

function timestamp() {
  return new Date().toISOString();
}

// ==================== 数据存储 ====================

class DataStore {
  constructor() {
    this.sheep = new Map();
    this.dogs = new Map();
    this.shepherd = null;
    this.tasks = new Map();
    this.grassHistory = [];
    this.events = [];
    this.simulationStart = Date.now();
  }

  logEvent(type, data) {
    this.events.push({
      id: uuid(),
      type,
      timestamp: Date.now(),
      data,
    });
  }

  exportToJSON(filename) {
    const data = {
      simulation: {
        startTime: this.simulationStart,
        endTime: Date.now(),
        duration: Date.now() - this.simulationStart,
      },
      sheep: Array.from(this.sheep.values()).map(s => s.toJSON()),
      dogs: Array.from(this.dogs.values()).map(d => d.toJSON()),
      shepherd: this.shepherd ? this.shepherd.toJSON() : null,
      tasks: Array.from(this.tasks.values()),
      grassHistory: this.grassHistory,
      events: this.events,
      statistics: this.getStatistics(),
    };
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    return data;
  }

  getStatistics() {
    const allSheep = Array.from(this.sheep.values());
    const allDogs = Array.from(this.dogs.values());
    const allTasks = Array.from(this.tasks.values());

    const completedTasks = allTasks.filter(t => t.status === 'completed');
    const failedTasks = allTasks.filter(t => t.status === 'failed');
    const totalGrass = this.grassHistory.reduce((sum, g) => sum + g.amount * g.quality, 0);

    return {
      totalSheep: allSheep.length,
      totalDogs: allDogs.length,
      totalTasks: allTasks.length,
      completedTasks: completedTasks.length,
      failedTasks: failedTasks.length,
      completionRate: allTasks.length > 0 ? (completedTasks.length / allTasks.length * 100).toFixed(2) : 0,
      averageTaskQuality: completedTasks.length > 0 ? (completedTasks.reduce((sum, t) => sum + (t.quality || 0), 0) / completedTasks.length).toFixed(2) : 0,
      totalGrassDistributed: totalGrass.toFixed(2),
      averageGrassPerSheep: allSheep.length > 0 ? (totalGrass / allSheep.length).toFixed(2) : 0,
      averageReputation: allSheep.length > 0 ? (allSheep.reduce((sum, s) => sum + s.reputation, 0) / allSheep.length).toFixed(2) : 0,
      averageEfficiency: allSheep.length > 0 ? (allSheep.reduce((sum, s) => sum + s.efficiency, 0) / allSheep.length).toFixed(2) : 0,
      topPerformer: allSheep.length > 0 ? allSheep.reduce((best, s) => s.reputation > best.reputation ? s : best, allSheep[0]).name : 'N/A',
      totalEvents: this.events.length,
    };
  }
}

// ==================== 羊 (Sheep) ====================

class Sheep {
  constructor({ name, type, capabilities = {} }) {
    this.id = uuid();
    this.name = name;
    this.type = type; // 'AI' or 'HUMAN'
    this.capabilities = {
      codeGeneration: capabilities.codeGeneration ?? true,
      codeAnalysis: capabilities.codeAnalysis ?? true,
      reasoning: capabilities.reasoning ?? true,
      naturalLanguage: capabilities.naturalLanguage ?? true,
      multiModal: capabilities.multiModal ?? true,
      toolUse: capabilities.toolUse ?? true,
      memory: capabilities.memory ?? true,
      planning: capabilities.planning ?? true,
      selfCorrection: capabilities.selfCorrection ?? true,
      collaboration: capabilities.collaboration ?? true,
    };
    this.autonomy = 0.8;
    this.status = 'idle';
    this.currentTask = null;
    this.grassBalance = 0;
    this.reputation = 0;
    this.title = null;
    this.tasksCompleted = 0;
    this.tasksFailed = 0;
    this.efficiency = 1.0;
    this.quality = 0.85;
    this.joinTime = Date.now();
  }

  execute(task) {
    this.status = 'active';
    this.currentTask = task.id;

    // 模拟执行时间
    const executionTime = randomInt(1000, 10000);

    // 成功率基于效率和质量
    const successRate = this.efficiency * this.quality * 0.9 + 0.1;
    const success = Math.random() < successRate;

    // 任务质量
    const taskQuality = success ? randomBetween(0.7, 1.0) : randomBetween(0.3, 0.6);

    this.status = 'idle';
    this.currentTask = null;

    if (success) {
      this.tasksCompleted++;
      this.reputation += 10;
    } else {
      this.tasksFailed++;
      this.reputation -= 5;
    }

    this.updateEfficiency();
    this.updateTitle();

    return {
      success,
      quality: taskQuality,
      executionTime,
      sheepId: this.id,
    };
  }

  receiveGrass(amount, quality) {
    this.grassBalance += amount * quality;
    this.reputation += amount * quality * 0.1;
    this.updateEfficiency();
    this.updateTitle();
  }

  updateEfficiency() {
    // 效率基于声誉和草余额
    this.efficiency = Math.min(1.0, 0.5 + this.reputation * 0.0005 + this.grassBalance * 0.001);
  }

  updateTitle() {
    if (this.reputation > 1000) this.title = '传奇羊';
    else if (this.reputation > 500) this.title = '资深羊';
    else if (this.reputation > 200) this.title = '熟练羊';
    else if (this.reputation > 50) this.title = '见习羊';
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      autonomy: this.autonomy,
      status: this.status,
      grassBalance: this.grassBalance.toFixed(2),
      reputation: this.reputation.toFixed(2),
      title: this.title,
      tasksCompleted: this.tasksCompleted,
      tasksFailed: this.tasksFailed,
      efficiency: this.efficiency.toFixed(2),
      quality: this.quality.toFixed(2),
      joinTime: this.joinTime,
    };
  }
}

// ==================== 牧羊犬 (Shepherd Dog) ====================

class Dog {
  constructor({ name, type, role }) {
    this.id = uuid();
    this.name = name;
    this.type = type; // 'AI' or 'HUMAN'
    this.role = role;
    this.flock = [];
    this.grassBudget = 1000;
    this.tasksAssigned = 0;
    this.tasksReviewed = 0;
  }

  assignTask(task, sheep) {
    if (!this.flock.includes(sheep.id)) return false;

    task.assignedTo = sheep.id;
    task.assignedBy = this.id;
    task.status = 'assigned';
    this.tasksAssigned++;
    return true;
  }

  reviewTask(task, result) {
    this.tasksReviewed++;
    const approved = result.quality > 0.7;

    if (approved) {
      // 发放草奖励
      const amount = Math.floor(randomBetween(20, 100));
      const quality = randomBetween(0.8, 1.2);
      return {
        approved: true,
        grass: { amount, quality, reason: 'Task completed with good quality' },
      };
    }

    return { approved: false, reason: 'Quality below threshold' };
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      role: this.role,
      flockSize: this.flock.length,
      grassBudget: this.grassBudget.toFixed(2),
      tasksAssigned: this.tasksAssigned,
      tasksReviewed: this.tasksReviewed,
    };
  }
}

// ==================== 任务 (Task) ====================

class Task {
  constructor({ title, description, priority, complexity }) {
    this.id = uuid();
    this.title = title;
    this.description = description;
    this.priority = priority;
    this.complexity = complexity;
    this.status = 'pending';
    this.assignedTo = null;
    this.assignedBy = null;
    this.createdAt = Date.now();
    this.completedAt = null;
    this.quality = null;
    this.result = null;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      priority: this.priority,
      complexity: this.complexity,
      status: this.status,
      assignedTo: this.assignedTo,
      assignedBy: this.assignedBy,
      createdAt: this.createdAt,
      completedAt: this.completedAt,
      quality: this.quality ? this.quality.toFixed(2) : null,
      result: this.result,
    };
  }
}

// ==================== 模拟器 ====================

class Simulator {
  constructor() {
    this.store = new DataStore();
  }

  // 初始化场景
  initScenario() {
    console.log('🐑 初始化模拟场景...');

    // 创建牧羊人
    this.store.shepherd = {
      id: uuid(),
      name: 'Project Manager',
      totalBudget: 100000,
      toJSON() {
        return { id: this.id, name: this.name, totalBudget: this.totalBudget };
      }
    };
    this.store.logEvent('SHEPHERD_CREATED', { shepherdId: this.store.shepherd.id });

    // 创建牧羊犬（3个：2个AI，1个人类）
    const dog1 = new Dog({ name: 'AI Task Manager', type: 'AI', role: 'task_manager' });
    const dog2 = new Dog({ name: 'Human Quality Inspector', type: 'HUMAN', role: 'quality_inspector' });
    const dog3 = new Dog({ name: 'AI Security Guard', type: 'AI', role: 'security_guard' });

    this.store.dogs.set(dog1.id, dog1);
    this.store.dogs.set(dog2.id, dog2);
    this.store.dogs.set(dog3.id, dog3);
    this.store.shepherd.dogs = [dog1.id, dog2.id, dog3.id];

    this.store.logEvent('DOG_CREATED', { dogId: dog1.id, name: dog1.name, type: dog1.type });
    this.store.logEvent('DOG_CREATED', { dogId: dog2.id, name: dog2.name, type: dog2.type });
    this.store.logEvent('DOG_CREATED', { dogId: dog3.id, name: dog3.id, type: dog3.type });

    // 创建羊（6个：4个AI，2个人类）
    const sheep1 = new Sheep({ name: 'AI Frontend Dev', type: 'AI' });
    const sheep2 = new Sheep({ name: 'AI Backend Dev', type: 'AI' });
    const sheep3 = new Sheep({ name: 'AI Full Stack', type: 'AI' });
    const sheep4 = new Sheep({ name: 'AI DevOps', type: 'AI' });
    const sheep5 = new Sheep({ name: 'Human Senior Dev', type: 'HUMAN' });
    const sheep6 = new Sheep({ name: 'Human Junior Dev', type: 'HUMAN' });

    [sheep1, sheep2, sheep3, sheep4, sheep5, sheep6].forEach(s => {
      this.store.sheep.set(s.id, s);
      this.store.logEvent('SHEEP_CREATED', { sheepId: s.id, name: s.name, type: s.type });
    });

    // 分配羊群给牧羊犬
    dog1.flock = [sheep1.id, sheep2.id, sheep3.id]; // AI Task Manager 管理3个AI羊
    dog2.flock = [sheep5.id, sheep6.id]; // Human Quality Inspector 管理2个人类羊
    dog3.flock = [sheep4.id, sheep1.id]; // AI Security Guard 管理2个羊（交叉管理）

    this.store.logEvent('FLOCK_ASSIGNED', { dogId: dog1.id, flockSize: dog1.flock.length });
    this.store.logEvent('FLOCK_ASSIGNED', { dogId: dog2.id, flockSize: dog2.flock.length });
    this.store.logEvent('FLOCK_ASSIGNED', { dogId: dog3.id, flockSize: dog3.flock.length });

    console.log('✅ 场景初始化完成');
    console.log(`   - 牧羊人: 1`);
    console.log(`   - 牧羊犬: 3 (2 AI, 1 Human)`);
    console.log(`   - 羊: 6 (4 AI, 2 Human)`);
    console.log('');
  }

  // 运行模拟
  runSimulation(days = 30) {
    console.log(`🚀 开始模拟运行 (${days} 天)...`);
    console.log('');

    const tasksPerDay = randomInt(3, 8);
    const totalTasks = days * tasksPerDay;

    for (let day = 1; day <= days; day++) {
      console.log(`📅 Day ${day}/${days}`);

      const dayTasks = randomInt(3, 8);
      for (let i = 0; i < dayTasks; i++) {
        this.simulateTaskCycle();
      }

      // 每日统计
      const stats = this.store.getStatistics();
      console.log(`   Tasks: ${stats.completedTasks}/${stats.totalTasks} completed (${stats.completionRate}%)`);
      console.log(`   Avg Quality: ${stats.averageTaskQuality}`);
      console.log(`   Grass: ${stats.totalGrassDistributed} total`);
      console.log(`   Top: ${stats.topPerformer}`);
      console.log('');
    }

    console.log('✅ 模拟完成');
    console.log('');
  }

  simulateTaskCycle() {
    // 1. 创建任务
    const taskTypes = [
      { title: 'Implement API endpoint', complexity: 3 },
      { title: 'Design UI component', complexity: 2 },
      { title: 'Write unit tests', complexity: 2 },
      { title: 'Fix production bug', complexity: 4 },
      { title: 'Optimize database query', complexity: 3 },
      { title: 'Add authentication', complexity: 4 },
      { title: 'Refactor legacy code', complexity: 5 },
      { title: 'Create documentation', complexity: 1 },
      { title: 'Set up CI/CD', complexity: 3 },
      { title: 'Implement caching', complexity: 3 },
    ];

    const taskType = taskTypes[randomInt(0, taskTypes.length)];
    const task = new Task({
      title: taskType.title,
      description: `Task created at ${timestamp()}`,
      priority: randomInt(1, 5),
      complexity: taskType.complexity,
    });
    this.store.tasks.set(task.id, task);

    // 2. 选择牧羊犬
    const dogs = Array.from(this.store.dogs.values());
    const dog = dogs[randomInt(0, dogs.length)];

    // 3. 选择羊（从牧羊犬的羊群中）
    if (dog.flock.length === 0) return;
    const sheepId = dog.flock[randomInt(0, dog.flock.length)];
    const sheep = this.store.sheep.get(sheepId);
    if (!sheep) return;

    // 4. 分配任务
    dog.assignTask(task, sheep);
    this.store.logEvent('TASK_ASSIGNED', { taskId: task.id, sheepId: sheep.id, dogId: dog.id });

    // 5. 羊执行任务
    task.status = 'in_progress';
    const result = sheep.execute(task);
    this.store.logEvent('TASK_EXECUTED', { taskId: task.id, sheepId: sheep.id, success: result.success, quality: result.quality });

    // 6. 牧羊犬审查
    const review = dog.reviewTask(task, result);
    this.store.logEvent('TASK_REVIEWED', { taskId: task.id, dogId: dog.id, approved: review.approved });

    // 7. 如果通过，发放草奖励
    if (review.approved && review.grass) {
      sheep.receiveGrass(review.grass.amount, review.grass.quality);
      this.store.grassHistory.push({
        id: uuid(),
        amount: review.grass.amount,
        quality: review.grass.quality,
        type: 'appreciation',
        issuedBy: dog.id,
        issuedAt: Date.now(),
        reason: review.grass.reason,
        recipientId: sheep.id,
      });
      this.store.logEvent('GRASS_GRANTED', { sheepId: sheep.id, amount: review.grass.amount, quality: review.grass.quality });
    }

    // 8. 更新任务状态
    if (result.success) {
      task.status = 'completed';
      task.completedAt = Date.now();
      task.quality = result.quality;
      task.result = result;
    } else {
      task.status = 'failed';
    }
  }

  // 生成报告
  generateReport() {
    console.log('📊 生成模拟报告...');
    console.log('');

    const stats = this.store.getStatistics();

    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║          牧羊人架构框架 - 模拟运行报告                   ║');
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log(`║ 总羊数:          ${stats.totalSheep.toString().padEnd(42)}║`);
    console.log(`║ 总牧羊犬:        ${stats.totalDogs.toString().padEnd(42)}║`);
    console.log(`║ 总任务:          ${stats.totalTasks.toString().padEnd(42)}║`);
    console.log(`║ 已完成:          ${stats.completedTasks.toString().padEnd(42)}║`);
    console.log(`║ 失败:            ${stats.failedTasks.toString().padEnd(42)}║`);
    console.log(`║ 完成率:          ${stats.completionRate.toString().padEnd(42)}║`);
    console.log(`║ 平均质量:        ${stats.averageTaskQuality.toString().padEnd(42)}║`);
    console.log(`║ 总草量:          ${stats.totalGrassDistributed.toString().padEnd(42)}║`);
    console.log(`║ 平均每羊:        ${stats.averageGrassPerSheep.toString().padEnd(42)}║`);
    console.log(`║ 平均声望:        ${stats.averageReputation.toString().padEnd(42)}║`);
    console.log(`║ 平均效率:        ${stats.averageEfficiency.toString().padEnd(42)}║`);
    console.log(`║ 最佳羊:          ${stats.topPerformer.toString().padEnd(42)}║`);
    console.log(`║ 总事件数:        ${stats.totalEvents.toString().padEnd(42)}║`);
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('');

    // 羊排行榜
    console.log('🏆 羊排行榜 (按声望):');
    const allSheep = Array.from(this.store.sheep.values()).sort((a, b) => b.reputation - a.reputation);
    allSheep.forEach((s, i) => {
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
      console.log(`   ${medal} ${s.name} (${s.type}) - 声望: ${s.reputation.toFixed(2)}, 草: ${s.grassBalance.toFixed(2)}, 效率: ${s.efficiency.toFixed(2)}, 称号: ${s.title || '无'}`);
    });
    console.log('');

    // 牧羊犬统计
    console.log('🐕 牧羊犬统计:');
    const allDogs = Array.from(this.store.dogs.values());
    allDogs.forEach(d => {
      console.log(`   - ${d.name} (${d.type}, ${d.role})`);
      console.log(`     管理羊群: ${d.flock.length} 只`);
      console.log(`     分配任务: ${d.tasksAssigned} 个`);
      console.log(`     审查任务: ${d.tasksReviewed} 个`);
      console.log(`     剩余预算: ${d.grassBudget.toFixed(2)} 草`);
    });
    console.log('');

    // 导出JSON
    const outputDir = path.join(__dirname, '..', 'simulation_results');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const filename = path.join(outputDir, `simulation_${Date.now()}.json`);
    const data = this.store.exportToJSON(filename);
    console.log(`💾 数据已导出: ${filename}`);
    console.log('');

    return { stats, data, filename };
  }
}

// ==================== 主程序 ====================

function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     牧羊人架构框架 (SAF) - 协同管理模拟器                ║');
  console.log('║     Shepherd Architecture Framework Simulator            ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');

  const simulator = new Simulator();

  // 初始化场景
  simulator.initScenario();

  // 运行模拟 (30天)
  simulator.runSimulation(30);

  // 生成报告
  const report = simulator.generateReport();

  console.log('✅ 模拟完成，数据已保存');
  console.log('');
  console.log('📁 输出文件:');
  console.log(`   - JSON 数据: ${report.filename}`);
  console.log('');
  console.log('🐑 感谢使用牧羊人架构框架!');

  return report;
}

// 运行
if (require.main === module) {
  main();
}

module.exports = { Simulator, Sheep, Dog, Task, DataStore };
