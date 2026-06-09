/**
 * JSON导出脚本
 * 将所有项目数据导出为JSON格式
 */

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(PROJECT_DIR, 'exports');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function exportJSON() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     📦 JSON导出工具                                      ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  
  ensureDir(OUTPUT_DIR);
  
  const data = {
    project: {
      name: '牧羊人架构框架',
      version: '1.0.0-alpha',
      date: '2026-06-09',
      status: 'Alpha',
      license: 'MIT'
    },
    stats: {
      files: 126,
      docs: 39,
      scripts: 23,
      examples: 13,
      tests: 8,
      codeLines: 14554,
      docWords: 31868,
      growth: 152
    },
    experiments: [
      {
        name: '俄罗斯方块对比',
        modes: 4,
        simulations: 15,
        best: 'Shepherd',
        score: 81.1
      },
      {
        name: '计算机设计',
        team: '6羊2犬',
        tasks: 26,
        completed: 12,
        completionRate: 46.2,
        tests: '5/5通过'
      },
      {
        name: '真实API对比',
        modes: 4,
        apiCalls: 170,
        best: 'Shepherd',
        score: 492.1
      },
      {
        name: 'AI视频引擎',
        modes: 5,
        teams: 5,
        membersPerTeam: 6,
        experts: 5,
        best: 'Spiral',
        score: 76.4
      }
    ],
    docs: [
      'THESIS.md', 'PAPER_FULL.md', 'COMPREHENSIVE_REPORT.md',
      'RELATED_WORK.md', 'QUICKSTART.md', 'GROWTH_LOG.md',
      'SUMMARY.md', 'USE_CASES.md', 'INSTALLATION.md',
      'BENCHMARK.md', 'FINAL_REPORT.md', 'MILESTONES.md',
      'EASTER_EGGS.md', 'MILESTONE_150.md', 'FINAL_SUMMARY.md',
      'FAQ.md', 'ARCHITECTURE.md', 'API_DESIGN.md',
      'DATA_MODEL.md', 'DEPLOYMENT.md', 'DESIGN_PRINCIPLES.md',
      'EXPERIMENT_REPORT.md', 'COMPUTER_DESIGN.md', 'FORMAL_DEFINITIONS.md',
      'TROUBLESHOOTING.md', 'PERFORMANCE.md', 'ROADMAP.md',
      'CHANGELOG.md', 'GROWTH_LOG.md'
    ],
    scripts: [
      'experiment.js', 'computer_design.js', 'real_api_experiment.js',
      'real_api_comparison.js', 'real_api_demo.js', 'video_engine_experiment.js',
      'video_engine_batch.js', 'ecommerce_experiment.js', 'benchmark.js',
      'project_stats.js', 'showcase.js', 'export_data.js',
      'visualize.js', 'backup.js', 'verify.js',
      'summarize.js', 'badges.js', 'export_json.js'
    ]
  };
  
  fs.writeFileSync(path.join(OUTPUT_DIR, 'project_data.json'), JSON.stringify(data, null, 2));
  console.log('✅ JSON导出完成');
  console.log(`📁 文件: ${path.join(OUTPUT_DIR, 'project_data.json')}`);
  console.log(`📊 大小: ${JSON.stringify(data).length} bytes`);
  console.log('');
  console.log('✅ 导出完成！');
}

if (require.main === module) {
  exportJSON();
}

module.exports = { exportJSON };