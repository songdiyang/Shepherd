/**
 * 实验对比系统
 * 对比牧羊人架构 vs 瀑布模型 vs 敏捷开发 vs 混乱组
 * 使用俄罗斯方块作为项目案例
 */

const fs = require('fs');
const path = require('path');

// 实验配置
const EXPERIMENTS = {
  // 任务复杂度定义
  tasks: {
    simple: {
      name: '简单任务',
      description: '创建俄罗斯方块基础游戏',
      complexity: 2,
      estimatedEffort: 10, // 人天
      skills: ['JavaScript', 'Canvas'],
      deliverables: ['基础游戏逻辑', '键盘控制', '基本UI']
    },
    medium: {
      name: '中等任务',
      description: '完善俄罗斯方块游戏',
      complexity: 3,
      estimatedEffort: 20,
      skills: ['JavaScript', 'Canvas', 'UI/UX'],
      deliverables: ['完整游戏逻辑', '计分系统', '等级系统', '暂停/重置', '游戏结束检测']
    },
    complex: {
      name: '复杂任务',
      description: '高级俄罗斯方块系统',
      complexity: 5,
      estimatedEffort: 40,
      skills: ['JavaScript', 'Canvas', 'AI', 'Network', 'Database'],
      deliverables: ['多人对战', 'AI对战', '排行榜', '皮肤系统', '音效', '动画效果', '存档系统']
    }
  },

  // 团队规模
  teamSizes: [2, 4, 6, 8, 10],

  // 方法论配置
  methodologies: {
    shepherd: {
      name: '牧羊人架构 (SAF)',
      description: '人机协同，牧羊犬管理羊群',
      features: ['AI辅助开发', '草奖励机制', '自动任务分配', '质量审查', '声望系统']
    },
    waterfall: {
      name: '瀑布模型',
      description: '线性顺序开发',
      features: ['需求分析', '系统设计', '编码', '测试', '部署']
    },
    agile: {
      name: '敏捷开发',
      description: '迭代增量开发',
      features: ['Sprint', '每日站会', ' backlog', '持续集成', '回顾会议']
    },
    chaotic: {
      name: '混乱组 (无管理)',
      description: '无管理，自由开发',
      features: ['无计划', '无分配', '无审查', '无激励', '无协调']
    }
  }
};

// 模拟类
class ExperimentSimulator {
  constructor(config) {
    this.config = config;
    this.results = [];
  }

  // 生成随机数
  random(min, max) {
    return Math.random() * (max - min) + min;
  }

  randomInt(min, max) {
    return Math.floor(this.random(min, max));
  }

  // 牧羊人架构模拟
  simulateShepherd() {
    const { task, teamSize } = this.config;
    const sheepCount = Math.floor(teamSize * 0.8); // 80% 是羊
    const dogCount = teamSize - sheepCount; // 20% 是牧羊犬
    
    // 模拟参数
    const efficiency = 0.75 + this.random(0, 0.25); // 效率 0.75-1.0
    const qualityFactor = 0.7 + this.random(0, 0.3); // 质量因子 0.7-1.0
    const collaboration = 0.6 + this.random(0, 0.4); // 协作效果 0.6-1.0
    
    // 计算指标
    const actualEffort = task.estimatedEffort / (efficiency * collaboration * (1 + dogCount * 0.1));
    const quality = qualityFactor * (1 + dogCount * 0.05);
    const communication = collaboration * (1 - teamSize * 0.02); // 团队越大沟通成本越高
    const satisfaction = 0.6 + this.random(0, 0.4);
    const innovation = 0.5 + this.random(0, 0.5);
    
    return {
      methodology: 'Shepherd',
      teamSize,
      sheepCount,
      dogCount,
      actualEffort: Math.round(actualEffort * 10) / 10,
      quality: Math.round(quality * 100) / 100,
      communication: Math.round(communication * 100) / 100,
      satisfaction: Math.round(satisfaction * 100) / 100,
      innovation: Math.round(innovation * 100) / 100,
      completion: 0.85 + this.random(0, 0.15),
      bugRate: 0.05 + this.random(0, 0.1)
    };
  }

  // 瀑布模型模拟
  simulateWaterfall() {
    const { task, teamSize } = this.config;
    
    // 瀑布模型特点：前期计划多，后期修改难
    const planningEffort = task.estimatedEffort * 0.3; // 30% 用于计划
    const sequentialFactor = 0.6; // 串行效率
    const changeCost = 0.2 + this.random(0, 0.3); // 变更成本高
    
    const actualEffort = (task.estimatedEffort + planningEffort) / sequentialFactor * (1 + changeCost);
    const quality = 0.6 + this.random(0, 0.3); // 质量中等，因为前期需求可能不准确
    const communication = 0.4 + this.random(0, 0.3); // 沟通较少
    const satisfaction = 0.4 + this.random(0, 0.3); // 满意度较低
    const innovation = 0.2 + this.random(0, 0.3); // 创新较少
    
    return {
      methodology: 'Waterfall',
      teamSize,
      actualEffort: Math.round(actualEffort * 10) / 10,
      quality: Math.round(quality * 100) / 100,
      communication: Math.round(communication * 100) / 100,
      satisfaction: Math.round(satisfaction * 100) / 100,
      innovation: Math.round(innovation * 100) / 100,
      completion: 0.6 + this.random(0, 0.3),
      bugRate: 0.15 + this.random(0, 0.2)
    };
  }

  // 敏捷开发模拟
  simulateAgile() {
    const { task, teamSize } = this.config;
    
    // 敏捷特点：迭代快，适应变化，需要频繁沟通
    const iterationEfficiency = 0.8 + this.random(0, 0.2);
    const adaptability = 0.7 + this.random(0, 0.3);
    const overhead = 0.2 + teamSize * 0.01; // 沟通开销
    
    const actualEffort = task.estimatedEffort / (iterationEfficiency * adaptability) * (1 + overhead);
    const quality = 0.75 + this.random(0, 0.2);
    const communication = 0.8 + this.random(0, 0.2); // 沟通频繁
    const satisfaction = 0.7 + this.random(0, 0.3); // 满意度较高
    const innovation = 0.6 + this.random(0, 0.3); // 创新较多
    
    return {
      methodology: 'Agile',
      teamSize,
      actualEffort: Math.round(actualEffort * 10) / 10,
      quality: Math.round(quality * 100) / 100,
      communication: Math.round(communication * 100) / 100,
      satisfaction: Math.round(satisfaction * 100) / 100,
      innovation: Math.round(innovation * 100) / 100,
      completion: 0.75 + this.random(0, 0.2),
      bugRate: 0.08 + this.random(0, 0.12)
    };
  }

  // 混乱组模拟
  simulateChaotic() {
    const { task, teamSize } = this.config;
    
    // 混乱组特点：无管理，效率低下，质量差
    const chaos = 0.3 + this.random(0, 0.4); // 混乱度
    const conflict = 0.2 + this.random(0, 0.5); // 冲突
    
    const actualEffort = task.estimatedEffort / chaos * (1 + conflict);
    const quality = 0.2 + this.random(0, 0.3); // 质量差
    const communication = 0.2 + this.random(0, 0.2); // 沟通差
    const satisfaction = 0.2 + this.random(0, 0.3); // 满意度低
    const innovation = 0.1 + this.random(0, 0.2); // 创新少
    
    return {
      methodology: 'Chaotic',
      teamSize,
      actualEffort: Math.round(actualEffort * 10) / 10,
      quality: Math.round(quality * 100) / 100,
      communication: Math.round(communication * 100) / 100,
      satisfaction: Math.round(satisfaction * 100) / 100,
      innovation: Math.round(innovation * 100) / 100,
      completion: 0.3 + this.random(0, 0.4),
      bugRate: 0.3 + this.random(0, 0.4)
    };
  }

  // 运行实验
  run() {
    const { task, teamSize } = this.config;
    
    console.log(`\n🧪 实验: ${task.name} (${task.complexity}级复杂度)`);
    console.log(`   团队规模: ${teamSize}人`);
    console.log(`   预估工作量: ${task.estimatedEffort}人天`);
    console.log('');

    // 运行四种方法论模拟
    const shepherd = this.simulateShepherd();
    const waterfall = this.simulateWaterfall();
    const agile = this.simulateAgile();
    const chaotic = this.simulateChaotic();
    
    this.results = [shepherd, waterfall, agile, chaotic];
    
    return this.results;
  }
}

// 主实验运行器
class ExperimentRunner {
  constructor() {
    this.allResults = [];
  }

  runAllExperiments() {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║     🧪 俄罗斯方块项目 - 方法论对比实验                       ║');
    console.log('║     牧羊人架构 vs 瀑布 vs 敏捷 vs 混乱组                   ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');

    // 三种任务复杂度 × 五种团队规模 × 四种方法论 = 60次实验
    const tasks = ['simple', 'medium', 'complex'];
    const teamSizes = [2, 4, 6, 8, 10];
    
    let experimentCount = 0;
    
    for (const taskName of tasks) {
      const task = EXPERIMENTS.tasks[taskName];
      
      console.log(`\n📋 任务: ${task.name} (${task.complexity}级复杂度)`);
      console.log(`   ${task.description}`);
      console.log('');
      
      for (const teamSize of teamSizes) {
        const simulator = new ExperimentSimulator({ task, teamSize });
        const results = simulator.run();
        
        this.allResults.push({
          task: taskName,
          teamSize,
          results
        });
        
        experimentCount++;
      }
    }
    
    console.log(`\n✅ 实验完成！共运行 ${experimentCount} 次实验`);
    console.log('');
    
    return this.allResults;
  }

  // 生成报告
  generateReport() {
    console.log('📊 生成实验报告...\n');
    
    // 按任务复杂度汇总
    const summary = {};
    
    for (const experiment of this.allResults) {
      const { task, teamSize, results } = experiment;
      
      if (!summary[task]) {
        summary[task] = {};
      }
      
      if (!summary[task][teamSize]) {
        summary[task][teamSize] = {};
      }
      
      for (const result of results) {
        summary[task][teamSize][result.methodology] = result;
      }
    }
    
    // 打印汇总表格
    this.printSummary(summary);
    
    // 导出数据
    this.exportData(summary);
    
    return summary;
  }

  printSummary(summary) {
    for (const [taskName, taskData] of Object.entries(summary)) {
      const task = EXPERIMENTS.tasks[taskName];
      
      console.log(`\n╔══════════════════════════════════════════════════════════════╗`);
      console.log(`║  ${task.name.padEnd(58)} ║`);
      console.log(`╠══════════════════════════════════════════════════════════════╣`);
      
      for (const [teamSize, sizeData] of Object.entries(taskData)) {
        console.log(`║  团队规模: ${teamSize.toString().padEnd(52)} ║`);
        console.log(`╠══════════════════════════════════════════════════════════════╣`);
        
        // 表头
        console.log(`║  方法论        实际工期  质量   沟通   满意度  创新   完成率  Bug率  ║`);
        console.log(`╠══════════════════════════════════════════════════════════════╣`);
        
        for (const [method, data] of Object.entries(sizeData)) {
          const name = method.padEnd(13);
          const effort = data.actualEffort.toFixed(1).padStart(7);
          const quality = data.quality.toFixed(2).padStart(5);
          const comm = data.communication.toFixed(2).padStart(5);
          const satis = data.satisfaction.toFixed(2).padStart(6);
          const inno = data.innovation.toFixed(2).padStart(5);
          const comp = (data.completion * 100).toFixed(0).padStart(5) + '%';
          const bug = (data.bugRate * 100).toFixed(0).padStart(4) + '%';
          
          console.log(`║  ${name} ${effort}  ${quality}  ${comm}  ${satis}  ${inno}  ${comp}  ${bug}  ║`);
        }
        
        console.log(`╠══════════════════════════════════════════════════════════════╣`);
      }
    }
    
    console.log('');
  }

  exportData(summary) {
    const outputDir = path.join(__dirname, '..', 'simulation_results');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const filename = path.join(outputDir, `experiment_${Date.now()}.json`);
    fs.writeFileSync(filename, JSON.stringify({
      timestamp: new Date().toISOString(),
      experiments: this.allResults,
      summary,
      metadata: {
        totalExperiments: this.allResults.length,
        tasks: Object.keys(EXPERIMENTS.tasks).length,
        teamSizes: EXPERIMENTS.teamSizes.length,
        methodologies: Object.keys(EXPERIMENTS.methodologies).length
      }
    }, null, 2));
    
    console.log(`💾 数据已导出: ${filename}`);
    console.log('');
  }

  // 分析最佳方法论
  analyzeBest() {
    console.log('🏆 最佳方法论分析\n');
    
    // 计算每个方法论在不同场景下的平均表现
    const averages = {};
    
    for (const experiment of this.allResults) {
      for (const result of experiment.results) {
        if (!averages[result.methodology]) {
          averages[result.methodology] = {
            effort: [],
            quality: [],
            communication: [],
            satisfaction: [],
            innovation: [],
            completion: [],
            bugRate: []
          };
        }
        
        averages[result.methodology].effort.push(result.actualEffort);
        averages[result.methodology].quality.push(result.quality);
        averages[result.methodology].communication.push(result.communication);
        averages[result.methodology].satisfaction.push(result.satisfaction);
        averages[result.methodology].innovation.push(result.innovation);
        averages[result.methodology].completion.push(result.completion);
        averages[result.methodology].bugRate.push(result.bugRate);
      }
    }
    
    // 计算平均值
    for (const [method, data] of Object.entries(averages)) {
      const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
      
      console.log(`${method}:`);
      console.log(`  平均工期: ${avg(data.effort).toFixed(1)} 天`);
      console.log(`  平均质量: ${avg(data.quality).toFixed(2)}`);
      console.log(`  平均沟通: ${avg(data.communication).toFixed(2)}`);
      console.log(`  平均满意度: ${avg(data.satisfaction).toFixed(2)}`);
      console.log(`  平均创新: ${avg(data.innovation).toFixed(2)}`);
      console.log(`  平均完成率: ${(avg(data.completion) * 100).toFixed(0)}%`);
      console.log(`  平均Bug率: ${(avg(data.bugRate) * 100).toFixed(0)}%`);
      console.log('');
    }
    
    // 综合评分
    console.log('📊 综合评分 (满分100):\n');
    
    for (const [method, data] of Object.entries(averages)) {
      const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
      
      // 综合评分公式
      const score = (
        (1 - avg(data.effort) / 100) * 20 +  // 工期越短越好
        avg(data.quality) * 20 +              // 质量越高越好
        avg(data.communication) * 10 +        // 沟通
        avg(data.satisfaction) * 15 +         // 满意度
        avg(data.innovation) * 10 +           // 创新
        avg(data.completion) * 20 +           // 完成率
        (1 - avg(data.bugRate)) * 5           // Bug率越低越好
      );
      
      console.log(`  ${method.padEnd(15)} ${score.toFixed(1)} 分`);
    }
    
    console.log('');
  }
}

// 主函数
function main() {
  const runner = new ExperimentRunner();
  
  // 运行所有实验
  runner.runAllExperiments();
  
  // 生成报告
  runner.generateReport();
  
  // 分析最佳方法论
  runner.analyzeBest();
  
  console.log('✅ 实验完成！');
  console.log('');
  console.log('📁 查看 simulation_results/ 目录获取完整数据');
  console.log('');
}

if (require.main === module) {
  main();
}

module.exports = { ExperimentRunner, ExperimentSimulator, EXPERIMENTS };
