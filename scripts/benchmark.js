/**
 * 牧羊人架构框架 - 性能基准测试
 * 测试核心模块的性能指标
 */

const { performance } = require('perf_hooks');

// 模拟数据生成器
function generateTasks(count) {
  const types = [
    'Implement API endpoint', 'Design UI component', 'Write unit tests',
    'Fix production bug', 'Optimize database query', 'Add authentication',
    'Refactor legacy code', 'Create documentation', 'Set up CI/CD', 'Implement caching'
  ];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `task_${i}`,
    title: types[Math.floor(Math.random() * types.length)],
    priority: Math.floor(Math.random() * 5) + 1,
    complexity: Math.floor(Math.random() * 5) + 1,
    status: 'pending'
  }));
}

function generateSheep(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: `sheep_${i}`,
    name: `Sheep ${i + 1}`,
    type: Math.random() > 0.5 ? 'AI' : 'HUMAN',
    autonomy: 0.8,
    efficiency: 0.7 + Math.random() * 0.3,
    quality: 0.7 + Math.random() * 0.3,
    grassBalance: Math.floor(Math.random() * 1000),
    reputation: Math.floor(Math.random() * 500),
    tasksCompleted: 0,
    tasksFailed: 0
  }));
}

// 基准测试套件
class Benchmark {
  constructor() {
    this.results = [];
  }

  async run(name, fn, iterations = 1000) {
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      const end = performance.now();
      times.push(end - start);
    }
    
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    const sorted = times.sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];
    
    const result = {
      name,
      iterations,
      avg: avg.toFixed(3),
      min: min.toFixed(3),
      max: max.toFixed(3),
      p50: p50.toFixed(3),
      p95: p95.toFixed(3),
      p99: p99.toFixed(3),
      throughput: (1000 / avg).toFixed(0)
    };
    
    this.results.push(result);
    return result;
  }

  report() {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║              性能基准测试报告                                 ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║ 测试项              迭代次数  平均(ms)  P50    P95    P99    吞吐量(ops/s) ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    
    this.results.forEach(r => {
      console.log(
        `║ ${r.name.padEnd(18)} ${r.iterations.toString().padStart(8)}  ${r.avg.padStart(8)}  ${r.p50.padStart(6)}  ${r.p95.padStart(6)}  ${r.p99.padStart(6)}  ${r.throughput.padStart(12)} ║`
      );
    });
    
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');
  }
}

// 核心算法测试
function delegateFeasibility(v, o, r) {
  return 0.4 * v + 0.3 * o - 0.3 * r;
}

function grassEfficiency(balance, quality, satisfaction) {
  const factor = Math.min(1.0, balance / 100);
  return factor * quality * satisfaction;
}

function calculateComplexity(code) {
  let complexity = 1;
  complexity += (code.match(/if|else|switch|case/g) || []).length;
  complexity += (code.match(/for|while|do/g) || []).length;
  complexity += (code.match(/function|=>/g) || []).length;
  complexity += (code.match(/try|catch|throw/g) || []).length;
  return Math.min(complexity, 20);
}

function matchTaskToSheep(task, sheep) {
  const scores = sheep.map(s => {
    const complexityMatch = 1 - Math.abs(task.complexity - s.quality * 5) / 5;
    const efficiencyMatch = s.efficiency;
    const availability = s.status === 'idle' ? 1 : 0.5;
    return {
      sheep: s,
      score: complexityMatch * 0.4 + efficiencyMatch * 0.4 + availability * 0.2
    };
  });
  
  scores.sort((a, b) => b.score - a.score);
  return scores[0];
}

// 主测试函数
async function main() {
  console.log('🚀 开始性能基准测试...\n');
  
  const benchmark = new Benchmark();
  
  // 测试1: 委托可行性计算
  const tasks_1000 = generateTasks(1000);
  await benchmark.run('Delegate Feasibility', () => {
    tasks_1000.forEach(t => {
      delegateFeasibility(t.priority / 5, 0.8, t.complexity / 5);
    });
  }, 1000);
  
  // 测试2: 草效率计算
  const sheep_100 = generateSheep(100);
  await benchmark.run('Grass Efficiency', () => {
    sheep_100.forEach(s => {
      grassEfficiency(s.grassBalance, s.quality, 0.8);
    });
  }, 1000);
  
  // 测试3: 复杂度计算
  const codeSample = `
    function process(data) {
      if (data.valid) {
        for (let i = 0; i < data.items.length; i++) {
          try {
            if (data.items[i].active) {
              processItem(data.items[i]);
            }
          } catch (e) {
            handleError(e);
          }
        }
      }
      return result;
    }
  `;
  await benchmark.run('Complexity Calc', () => {
    calculateComplexity(codeSample);
  }, 10000);
  
  // 测试4: 任务匹配
  const tasks_100 = generateTasks(100);
  const sheep_10 = generateSheep(10);
  await benchmark.run('Task Matching', () => {
    tasks_100.forEach(t => {
      matchTaskToSheep(t, sheep_10);
    });
  }, 1000);
  
  // 测试5: 大规模任务分配
  const largeTasks = generateTasks(10000);
  const largeSheep = generateSheep(100);
  await benchmark.run('Large Scale Assignment', () => {
    const assignments = [];
    largeTasks.forEach(t => {
      const match = matchTaskToSheep(t, largeSheep);
      assignments.push({ task: t, sheep: match.sheep });
    });
    return assignments;
  }, 100);
  
  // 测试6: 羊群状态更新
  const sheep_1000 = generateSheep(1000);
  await benchmark.run('Sheep Status Update', () => {
    sheep_1000.forEach(s => {
      s.grassBalance += Math.random() * 100;
      s.reputation += Math.random() * 10;
      s.efficiency = Math.min(1.0, 0.5 + s.reputation * 0.001);
    });
  }, 1000);
  
  // 生成报告
  benchmark.report();
  
  // 导出结果到JSON
  const fs = require('fs');
  const path = require('path');
  
  const outputDir = path.join(__dirname, '..', 'simulation_results');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputFile = path.join(outputDir, `benchmark_${Date.now()}.json`);
  fs.writeFileSync(outputFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    results: benchmark.results,
    summary: {
      totalTests: benchmark.results.length,
      totalIterations: benchmark.results.reduce((sum, r) => sum + parseInt(r.iterations), 0),
      avgThroughput: (benchmark.results.reduce((sum, r) => sum + parseInt(r.throughput), 0) / benchmark.results.length).toFixed(0)
    }
  }, null, 2));
  
  console.log(`💾 结果已保存: ${outputFile}`);
  console.log('\n✅ 基准测试完成！');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { Benchmark, delegateFeasibility, grassEfficiency, calculateComplexity, matchTaskToSheep };
