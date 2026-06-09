/**
 * 牧羊人架构 - 数据处理示例
 * 展示如何用SAF处理大规模数据分析任务
 */

const fs = require('fs');
const path = require('path');

// 模拟大数据处理任务
class DataProcessingProject {
  constructor() {
    this.tasks = [];
    this.sheep = [];
    this.dogs = [];
    this.dataChunks = [];
    this.results = [];
  }

  init() {
    console.log('\n📊 初始化数据处理项目...\n');
    
    // 创建数据分片
    this.dataChunks = Array.from({ length: 100 }, (_, i) => ({
      id: `chunk_${i}`,
      size: Math.floor(Math.random() * 1000) + 500,  // 500-1500条记录
      processed: false,
      quality: 0
    }));
    
    // 创建羊（数据处理工作者）
    this.sheep = [
      { id: 'sheep_etl', name: 'AI ETL Engineer', type: 'AI', specialty: 'etl', efficiency: 0.9, parallel: 5 },
      { id: 'sheep_clean', name: 'AI Data Cleaner', type: 'AI', specialty: 'clean', efficiency: 0.85, parallel: 3 },
      { id: 'sheep_analyze', name: 'AI Data Analyst', type: 'AI', specialty: 'analyze', efficiency: 0.88, parallel: 2 },
      { id: 'sheep_visual', name: 'AI Visualization', type: 'AI', specialty: 'visual', efficiency: 0.82, parallel: 2 },
      { id: 'sheep_human', name: 'Human Data Scientist', type: 'HUMAN', specialty: 'all', efficiency: 0.95, parallel: 1 },
      { id: 'sheep_qa', name: 'Human QA Engineer', type: 'HUMAN', specialty: 'qa', efficiency: 0.9, parallel: 1 }
    ];
    
    // 创建牧羊犬
    this.dogs = [
      { id: 'dog_pipeline', name: 'AI Pipeline Manager', type: 'AI', role: 'task_manager', flock: ['sheep_etl', 'sheep_clean'] },
      { id: 'dog_quality', name: 'Human Quality Lead', type: 'HUMAN', role: 'quality_inspector', flock: ['sheep_analyze', 'sheep_visual', 'sheep_qa'] },
      { id: 'dog_security', name: 'AI Security Guard', type: 'AI', role: 'security_guard', flock: ['sheep_human'] }
    ];
    
    // 创建任务
    this.createTasks();
    
    console.log('✅ 项目初始化完成');
    console.log(`   - 数据分片: ${this.dataChunks.length} 个`);
    console.log(`   - 羊: ${this.sheep.length} 只`);
    console.log(`   - 牧羊犬: ${this.dogs.length} 只`);
    console.log(`   - 任务: ${this.tasks.length} 个`);
    console.log('');
  }

  createTasks() {
    // ETL任务
    for (let i = 0; i < 20; i++) {
      this.tasks.push({
        id: `task_etl_${i}`,
        name: `ETL Pipeline ${i}`,
        type: 'etl',
        complexity: 3,
        estimatedMinutes: 30,
        startMinute: 0,
        completed: false,
        inProgress: false,
        dataChunks: this.dataChunks.slice(i * 5, (i + 1) * 5)
      });
    }
    
    // 数据清洗任务
    for (let i = 0; i < 15; i++) {
      this.tasks.push({
        id: `task_clean_${i}`,
        name: `Data Cleaning ${i}`,
        type: 'clean',
        complexity: 2,
        estimatedMinutes: 20,
        startMinute: 0,
        completed: false,
        inProgress: false,
        dataChunks: this.dataChunks.slice(i * 6, (i + 1) * 6)
      });
    }
    
    // 分析任务
    for (let i = 0; i < 10; i++) {
      this.tasks.push({
        id: `task_analyze_${i}`,
        name: `Data Analysis ${i}`,
        type: 'analyze',
        complexity: 4,
        estimatedMinutes: 45,
        startMinute: 0,
        completed: false,
        inProgress: false,
        dataChunks: this.dataChunks.slice(i * 10, (i + 1) * 10)
      });
    }
    
    // 可视化任务
    for (let i = 0; i < 5; i++) {
      this.tasks.push({
        id: `task_visual_${i}`,
        name: `Visualization ${i}`,
        type: 'visual',
        complexity: 3,
        estimatedMinutes: 30,
        startMinute: 0,
        completed: false,
        inProgress: false,
        dataChunks: this.dataChunks.slice(i * 20, (i + 1) * 20)
      });
    }
    
    // QA任务
    this.tasks.push({
      id: 'task_qa',
      name: 'Quality Assurance',
      type: 'qa',
      complexity: 2,
      estimatedMinutes: 60,
      startMinute: 0,
      completed: false,
      inProgress: false
    });
  }

  simulateProcessing() {
    console.log('🚀 开始数据处理模拟...\n');
    
    let totalMinutes = 0;
    const timeline = [];
    
    // 模拟4小时处理
    for (let minute = 0; minute < 240; minute++) {
      const minuteTasks = this.tasks.filter(t => !t.completed && t.startMinute <= minute);
      const completed = [];
      
      minuteTasks.forEach(task => {
        const sheep = this.assignSheep(task);
        if (!sheep) return;
        
        // 检查并行限制
        const currentTasks = this.tasks.filter(t => t.inProgress && t.assignedTo === sheep.id).length;
        if (currentTasks >= sheep.parallel) return;
        
        if (!task.inProgress) {
          task.inProgress = true;
          task.assignedTo = sheep.id;
          task.startMinute = minute;
          task.executionTime = task.estimatedMinutes * (1 + Math.random() * 0.5 - 0.25);
        }
        
        // 模拟执行时间
        if (minute >= task.startMinute + task.executionTime) {
          task.completed = true;
          task.inProgress = false;
          task.completedMinute = minute;
          task.quality = 0.7 + Math.random() * 0.3;
          task.completedBy = sheep.name;
          completed.push(task);
          
          // 处理数据
          if (task.dataChunks) {
            task.dataChunks.forEach(chunk => {
              chunk.processed = true;
              chunk.quality = task.quality;
            });
          }
          
          // 发放草奖励
          sheep.grass = (sheep.grass || 0) + Math.floor(task.quality * 30);
          sheep.reputation = (sheep.reputation || 0) + 5;
        }
      });
      
      if (completed.length > 0) {
        timeline.push({ minute, completed: completed.length, tasks: completed.map(t => t.name) });
      }
      
      totalMinutes = minute;
      
      // 检查是否完成
      if (this.tasks.every(t => t.completed)) {
        console.log(`✅ 所有任务完成于第 ${minute} 分钟`);
        break;
      }
    }
    
    console.log(`\n📊 处理统计:`);
    console.log(`   总时间: ${totalMinutes} 分钟 (${(totalMinutes / 60).toFixed(1)} 小时)`);
    console.log(`   完成任务: ${this.tasks.filter(t => t.completed).length}/${this.tasks.length}`);
    console.log(`   完成率: ${(this.tasks.filter(t => t.completed).length / this.tasks.length * 100).toFixed(1)}%`);
    console.log(`   平均质量: ${(this.tasks.filter(t => t.completed).reduce((s, t) => s + t.quality, 0) / this.tasks.filter(t => t.completed).length).toFixed(2)}`);
    console.log(`   处理数据: ${this.dataChunks.filter(c => c.processed).length}/${this.dataChunks.length} 分片`);
    console.log('');
    
    return { totalMinutes, timeline };
  }

  assignSheep(task) {
    const candidates = this.sheep.filter(s => {
      if (task.type && s.specialty === task.type) return true;
      if (task.type === 'qa' && s.specialty === 'qa') return true;
      return false;
    });
    
    if (candidates.length === 0) return null;
    
    candidates.sort((a, b) => b.efficiency - a.efficiency);
    return candidates[0];
  }

  generateReport() {
    console.log('📊 生成数据处理报告...\n');
    
    const completed = this.tasks.filter(t => t.completed);
    const avgQuality = completed.reduce((s, t) => s + t.quality, 0) / completed.length;
    const processedChunks = this.dataChunks.filter(c => c.processed);
    
    const report = {
      project: '大规模数据处理',
      totalTasks: this.tasks.length,
      completedTasks: completed.length,
      completionRate: completed.length / this.tasks.length,
      averageQuality: avgQuality,
      totalDataChunks: this.dataChunks.length,
      processedChunks: processedChunks.length,
      processingRate: processedChunks.length / this.dataChunks.length,
      sheep: this.sheep.map(s => ({
        name: s.name,
        type: s.type,
        grass: s.grass || 0,
        reputation: s.reputation || 0
      })),
      dogs: this.dogs.map(d => ({
        name: d.name,
        type: d.type,
        flockSize: d.flock.length
      }))
    };
    
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║          数据处理项目报告                             ║');
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log(`║ 总任务: ${report.totalTasks.toString().padEnd(52)} ║`);
    console.log(`║ 已完成: ${report.completedTasks.toString().padEnd(51)} ║`);
    console.log(`║ 完成率: ${(report.completionRate * 100).toFixed(1).padEnd(50)}% ║`);
    console.log(`║ 平均质量: ${report.averageQuality.toFixed(2).padEnd(49)} ║`);
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log(`║ 数据分片: ${report.totalDataChunks.toString().padEnd(50)} ║`);
    console.log(`║ 已处理: ${report.processedChunks.toString().padEnd(52)} ║`);
    console.log(`║ 处理率: ${(report.processingRate * 100).toFixed(1).padEnd(50)}% ║`);
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log('║ 羊表现:                                                  ║');
    report.sheep.forEach(s => {
      console.log(`║   ${s.name.padEnd(20)} 草: ${s.grass.toString().padEnd(4)} 声望: ${s.reputation.toString().padEnd(4)} ║`);
    });
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log('║ 牧羊犬:                                                  ║');
    report.dogs.forEach(d => {
      console.log(`║   ${d.name.padEnd(25)} 管理: ${d.flockSize.toString().padEnd(2)} 只 ║`);
    });
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('');
    
    // 导出数据
    const outputDir = path.join(__dirname, '..', 'simulation_results');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const filename = path.join(outputDir, `data_processing_${Date.now()}.json`);
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`💾 报告已导出: ${filename}`);
    console.log('');
    
    return report;
  }
}

// 主函数
function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     📊 牧羊人架构 - 数据处理示例                        ║');
  console.log('║     Shepherd Architecture Data Processing                ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  
  const project = new DataProcessingProject();
  
  // 初始化项目
  project.init();
  
  // 模拟处理
  project.simulateProcessing();
  
  // 生成报告
  project.generateReport();
  
  console.log('✅ 数据处理示例完成！');
  console.log('');
  console.log('📊 项目特点:');
  console.log('   - 100个数据分片');
  console.log('   - 6只羊（4AI + 2人类）');
  console.log('   - 3只牧羊犬（2AI + 1人类）');
  console.log('   - 51个任务（ETL/清洗/分析/可视化/QA）');
  console.log('   - 4小时模拟处理');
  console.log('');
  console.log('🐑 感谢使用牧羊人架构框架！');
}

if (require.main === module) {
  main();
}

module.exports = { DataProcessingProject };
