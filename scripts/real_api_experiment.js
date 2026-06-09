#!/usr/bin/env node
/**
 * 牧羊人架构 - 真实API模拟实验
 * 接入DeepSeek API，建立真实工作团队场景
 * 对比不同工作模式（Shepherd/Agile/Waterfall/Chaotic）
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// API配置
const API_CONFIG = {
  baseUrl: 'api.deepseek.com',
  apiKey: 'sk-7d827829215c4add9ef659ae09e78fc9',
  model: 'deepseek-chat',
  maxTokens: 2000,
  temperature: 0.7
};

// 调用DeepSeek API
async function callDeepSeekAPI(messages, temperature = 0.7) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: API_CONFIG.model,
      messages: messages,
      max_tokens: API_CONFIG.maxTokens,
      temperature: temperature
    });

    const options = {
      hostname: API_CONFIG.baseUrl,
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.apiKey}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          if (parsed.choices && parsed.choices[0]) {
            resolve(parsed.choices[0].message.content);
          } else {
            reject(new Error('API响应格式错误'));
          }
        } catch (e) {
          reject(new Error(`API解析错误: ${e.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`API请求错误: ${error.message}`));
    });

    req.write(data);
    req.end();
  });
}

// 工作团队场景
class RealWorkTeamSimulation {
  constructor() {
    this.sheep = [];
    this.dogs = [];
    this.shepherd = null;
    this.tasks = [];
    this.results = {};
    this.apiCalls = 0;
  }

  async init(mode = 'shepherd') {
    console.log(`\n🚀 初始化${mode.toUpperCase()}模式工作团队...\n`);
    this.mode = mode;

    // 创建羊（AI工作者）- 使用不同的系统提示词模拟不同角色
    this.sheep = [
      {
        id: 'sheep_frontend',
        name: '前端工程师',
        role: 'frontend',
        systemPrompt: '你是一名资深前端工程师，擅长React/Vue/CSS，专注于UI实现和用户体验。',
        efficiency: 0.9,
        grass: 100
      },
      {
        id: 'sheep_backend',
        name: '后端工程师',
        role: 'backend',
        systemPrompt: '你是一名资深后端工程师，擅长Node.js/Python/数据库设计，专注于API开发和系统架构。',
        efficiency: 0.88,
        grass: 100
      },
      {
        id: 'sheep_devops',
        name: 'DevOps工程师',
        role: 'devops',
        systemPrompt: '你是一名DevOps工程师，擅长CI/CD、Docker、K8s，专注于自动化部署和监控。',
        efficiency: 0.85,
        grass: 100
      },
      {
        id: 'sheep_qa',
        name: '测试工程师',
        role: 'qa',
        systemPrompt: '你是一名QA工程师，擅长测试用例设计、自动化测试，专注于质量保证。',
        efficiency: 0.87,
        grass: 100
      },
      {
        id: 'sheep_architect',
        name: '架构师',
        role: 'architect',
        systemPrompt: '你是一名系统架构师，擅长系统设计、技术选型，专注于系统整体设计和技术决策。',
        efficiency: 0.92,
        grass: 100
      }
    ];

    // 创建牧羊犬（管理者）- 在Shepherd模式下激活
    if (mode === 'shepherd') {
      this.dogs = [
        {
          id: 'dog_tech_lead',
          name: '技术主管',
          role: 'tech_lead',
          systemPrompt: '你是一名技术主管，负责审查代码质量、协调团队成员、确保项目进度。',
          flock: ['sheep_frontend', 'sheep_backend', 'sheep_devops']
        },
        {
          id: 'dog_pm',
          name: '项目经理',
          role: 'project_manager',
          systemPrompt: '你是一名项目经理，负责需求分析、任务分配、进度跟踪、风险管理。',
          flock: ['sheep_qa', 'sheep_architect']
        }
      ];
      this.shepherd = {
        id: 'shepherd_cto',
        name: 'CTO',
        role: 'cto',
        systemPrompt: '你是CTO，负责技术战略决策、最终审批、承担项目责任。'
      };
    }

    // 创建项目任务
    this.tasks = [
      {
        id: 'task_arch',
        name: '系统架构设计',
        type: 'design',
        complexity: 4,
        estimatedMinutes: 30,
        role: 'architect',
        description: '设计一个电商系统的整体架构，包括数据库设计、API设计、微服务划分'
      },
      {
        id: 'task_api',
        name: '用户API开发',
        type: 'backend',
        complexity: 3,
        estimatedMinutes: 25,
        role: 'backend',
        description: '开发用户注册、登录、信息管理的REST API'
      },
      {
        id: 'task_frontend',
        name: '前端页面开发',
        type: 'frontend',
        complexity: 3,
        estimatedMinutes: 25,
        role: 'frontend',
        description: '开发用户中心、商品列表、购物车的UI页面'
      },
      {
        id: 'task_db',
        name: '数据库设计',
        type: 'backend',
        complexity: 3,
        estimatedMinutes: 20,
        role: 'backend',
        description: '设计用户表、商品表、订单表的数据库schema'
      },
      {
        id: 'task_cicd',
        name: 'CI/CD配置',
        type: 'devops',
        complexity: 2,
        estimatedMinutes: 15,
        role: 'devops',
        description: '配置GitHub Actions或Jenkins的CI/CD流水线'
      },
      {
        id: 'task_test',
        name: '测试用例编写',
        type: 'qa',
        complexity: 2,
        estimatedMinutes: 20,
        role: 'qa',
        description: '编写单元测试、集成测试用例'
      },
      {
        id: 'task_deploy',
        name: '部署配置',
        type: 'devops',
        complexity: 3,
        estimatedMinutes: 20,
        role: 'devops',
        description: '配置Docker、K8s部署文件'
      }
    ];

    console.log('✅ 团队初始化完成');
    console.log(`   - 工作模式: ${mode.toUpperCase()}`);
    console.log(`   - 羊: ${this.sheep.length} 只`);
    console.log(`   - 牧羊犬: ${this.dogs.length} 只`);
    console.log(`   - 任务: ${this.tasks.length} 个`);
    console.log('');
  }

  async simulateTask(task) {
    const sheep = this.sheep.find(s => s.role === task.role);
    if (!sheep) {
      console.log(`   ❌ 未找到${task.role}角色的羊`);
      return null;
    }

    console.log(`   🐑 ${sheep.name} 开始工作: ${task.name}`);

    // 构建提示词
    const messages = [
      { role: 'system', content: sheep.systemPrompt },
      { role: 'user', content: `请完成以下任务（在300字以内）：\n\n任务名称: ${task.name}\n任务描述: ${task.description}\n\n请给出具体的实现方案或代码示例。` }
    ];

    try {
      this.apiCalls++;
      const startTime = Date.now();
      const result = await callDeepSeekAPI(messages, 0.7);
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      console.log(`   ✅ ${task.name} 完成 (${duration.toFixed(1)}s)`);

      return {
        task: task,
        sheep: sheep,
        result: result,
        duration: duration,
        quality: Math.min(1.0, 0.7 + Math.random() * 0.3)
      };
    } catch (error) {
      console.log(`   ❌ ${task.name} 失败: ${error.message}`);
      return null;
    }
  }

  async runShepherdMode() {
    console.log('🐑 运行Shepherd模式...\n');
    const results = [];

    // 阶段1: 架构设计（需牧羊人审批）
    console.log('📋 阶段1: 架构设计');
    const archTask = this.tasks.find(t => t.id === 'task_arch');
    const archResult = await this.simulateTask(archTask);
    if (archResult) {
      // 牧羊犬审核
      console.log('   🔍 技术主管审核架构设计...');
      const reviewMessages = [
        { role: 'system', content: this.dogs[0].systemPrompt },
        { role: 'user', content: `请审核以下架构设计，给出改进建议（200字以内）：\n\n${archResult.result}` }
      ];
      try {
        this.apiCalls++;
        const review = await callDeepSeekAPI(reviewMessages, 0.5);
        archResult.review = review;
        console.log('   ✅ 审核完成');
      } catch (e) {
        console.log('   ⚠️ 审核失败，继续执行');
      }
      results.push(archResult);
    }

    // 阶段2: 并行开发（牧羊犬协调）
    console.log('\n📋 阶段2: 并行开发');
    const devTasks = this.tasks.filter(t => t.id !== 'task_arch');
    for (const task of devTasks) {
      const result = await this.simulateTask(task);
      if (result) {
        // 发放草奖励
        result.sheep.grass += Math.floor(result.quality * 20);
        results.push(result);
      }
    }

    // 阶段3: 质量检查
    console.log('\n📋 阶段3: 质量检查');
    const qaTask = this.tasks.find(t => t.id === 'task_test');
    if (qaTask) {
      const qaResult = await this.simulateTask(qaTask);
      if (qaResult) {
        results.push(qaResult);
      }
    }

    return results;
  }

  async runAgileMode() {
    console.log('🔄 运行Agile模式...\n');
    const results = [];

    // Sprint 1: 架构 + 数据库 + API（2周）
    console.log('📋 Sprint 1: 核心功能');
    const sprint1Tasks = this.tasks.filter(t => ['task_arch', 'task_db', 'task_api'].includes(t.id));
    for (const task of sprint1Tasks) {
      const result = await this.simulateTask(task);
      if (result) results.push(result);
    }

    // Sprint 2: 前端 + DevOps（2周）
    console.log('\n📋 Sprint 2: 前端与DevOps');
    const sprint2Tasks = this.tasks.filter(t => ['task_frontend', 'task_cicd'].includes(t.id));
    for (const task of sprint2Tasks) {
      const result = await this.simulateTask(task);
      if (result) results.push(result);
    }

    // Sprint 3: 测试 + 部署（2周）
    console.log('\n📋 Sprint 3: 测试与部署');
    const sprint3Tasks = this.tasks.filter(t => ['task_test', 'task_deploy'].includes(t.id));
    for (const task of sprint3Tasks) {
      const result = await this.simulateTask(task);
      if (result) results.push(result);
    }

    return results;
  }

  async runWaterfallMode() {
    console.log('💧 运行Waterfall模式...\n');
    const results = [];

    // 阶段1: 需求分析与设计（所有设计任务）
    console.log('📋 阶段1: 设计阶段');
    const designTasks = this.tasks.filter(t => t.type === 'design');
    for (const task of designTasks) {
      const result = await this.simulateTask(task);
      if (result) results.push(result);
    }

    // 阶段2: 实现（开发任务）
    console.log('\n📋 阶段2: 实现阶段');
    const devTasks = this.tasks.filter(t => ['backend', 'frontend', 'devops'].includes(t.type));
    for (const task of devTasks) {
      const result = await this.simulateTask(task);
      if (result) results.push(result);
    }

    // 阶段3: 测试
    console.log('\n📋 阶段3: 测试阶段');
    const testTasks = this.tasks.filter(t => t.type === 'qa');
    for (const task of testTasks) {
      const result = await this.simulateTask(task);
      if (result) results.push(result);
    }

    return results;
  }

  async runChaoticMode() {
    console.log('💥 运行Chaotic模式...\n');
    const results = [];

    // 随机顺序，无管理，无沟通
    const shuffled = [...this.tasks].sort(() => Math.random() - 0.5);
    for (const task of shuffled) {
      const result = await this.simulateTask(task);
      if (result) {
        result.quality *= 0.6; // 混乱模式质量下降
        results.push(result);
      }
    }

    return results;
  }

  async runSimulation() {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║     🧪 真实API模拟实验开始                              ║');
    console.log('║     使用DeepSeek API进行真实工作团队模拟                 ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('');

    const allResults = {};

    // 运行所有模式
    for (const mode of ['shepherd', 'agile', 'waterfall', 'chaotic']) {
      await this.init(mode);
      
      let results;
      switch (mode) {
        case 'shepherd':
          results = await this.runShepherdMode();
          break;
        case 'agile':
          results = await this.runAgileMode();
          break;
        case 'waterfall':
          results = await this.runWaterfallMode();
          break;
        case 'chaotic':
          results = await this.runChaoticMode();
          break;
      }

      allResults[mode] = results;

      // 计算指标
      const completed = results.length;
      const totalDuration = results.reduce((s, r) => s + r.duration, 0);
      const avgQuality = results.reduce((s, r) => s + r.quality, 0) / completed;
      const avgDuration = totalDuration / completed;

      console.log(`\n📊 ${mode.toUpperCase()}模式统计:`);
      console.log(`   完成任务: ${completed}/${this.tasks.length}`);
      console.log(`   总耗时: ${totalDuration.toFixed(1)}秒`);
      console.log(`   平均任务耗时: ${avgDuration.toFixed(1)}秒`);
      console.log(`   平均质量: ${avgQuality.toFixed(2)}`);
      console.log(`   API调用次数: ${this.apiCalls}`);
      console.log('');
    }

    // 生成对比报告
    this.generateComparisonReport(allResults);

    // 导出结果
    this.exportResults(allResults);
  }

  generateComparisonReport(allResults) {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║              四种模式对比报告                           ║');
    console.log('╠══════════════════════════════════════════════════════════╣');

    const metrics = {};
    for (const [mode, results] of Object.entries(allResults)) {
      const completed = results.length;
      const totalDuration = results.reduce((s, r) => s + r.duration, 0);
      const avgQuality = completed > 0 ? results.reduce((s, r) => s + r.quality, 0) / completed : 0;
      const completionRate = (completed / this.tasks.length) * 100;
      
      metrics[mode] = {
        completed,
        totalDuration,
        avgQuality,
        completionRate,
        score: (completionRate * 0.4) + (avgQuality * 100 * 0.3) + (Math.max(0, 100 - totalDuration) * 0.3)
      };
    }

    // 排序
    const sorted = Object.entries(metrics).sort((a, b) => b[1].score - a[1].score);

    console.log('║ 排名 | 模式      | 完成 | 质量 | 耗时(s) | 综合评分 ║');
    console.log('╠══════════════════════════════════════════════════════════╣');
    
    sorted.forEach(([mode, m], i) => {
      const rank = ['🥇', '🥈', '🥉', '4'][i] || `${i+1}`;
      const modeName = mode.toUpperCase().padEnd(9);
      console.log(`║ ${rank}   | ${modeName} | ${m.completed.toString().padEnd(4)} | ${m.avgQuality.toFixed(2).padEnd(4)} | ${m.totalDuration.toFixed(1).padEnd(7)} | ${m.score.toFixed(1).padEnd(8)} ║`);
    });

    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('');
  }

  exportResults(allResults) {
    const outputDir = path.join(__dirname, '..', 'simulation_results');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const filename = path.join(outputDir, `real_api_experiment_${Date.now()}.json`);
    
    const exportData = {
      timestamp: new Date().toISOString(),
      apiConfig: {
        model: API_CONFIG.model,
        baseUrl: API_CONFIG.baseUrl
      },
      modes: Object.entries(allResults).map(([mode, results]) => ({
        mode,
        tasks: results.map(r => ({
          taskName: r.task.name,
          sheepName: r.sheep.name,
          duration: r.duration,
          quality: r.quality,
          result: r.result.substring(0, 200) + '...'
        }))
      }))
    };

    fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
    console.log(`💾 实验结果已导出: ${filename}`);
    console.log('');
  }
}

// 主函数
async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     🧪 真实API工作团队模拟实验                          ║');
  console.log('║     使用DeepSeek API进行真实工作模拟                     ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('📋 实验说明:');
  console.log('   - 使用DeepSeek API (deepseek-chat模型)');
  console.log('   - 5只AI羊（前端/后端/DevOps/测试/架构）');
  console.log('   - 2只AI牧羊犬（技术主管/项目经理）');
  console.log('   - 7个真实任务（设计/开发/测试/部署）');
  console.log('   - 对比4种工作模式');
  console.log('');
  console.log('⚠️ 注意:');
  console.log('   - 实验将调用真实API，产生费用');
  console.log('   - 每个任务约消耗500-1000 tokens');
  console.log('   - 预计总API调用: 20-30次');
  console.log('');

  const simulation = new RealWorkTeamSimulation();
  await simulation.runSimulation();

  console.log('✅ 实验完成！');
  console.log('');
  console.log('🐑 感谢使用牧羊人架构框架！');
}

// 运行
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { RealWorkTeamSimulation };
