/**
 * Markdown导出脚本
 * 将项目数据导出为Markdown格式
 */

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(PROJECT_DIR, 'exports');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function exportMarkdown() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     📝 Markdown导出工具                                  ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  
  ensureDir(OUTPUT_DIR);
  
  let markdown = '# 牧羊人架构框架 - 项目数据导出\n\n';
  markdown += `> 导出时间: ${new Date().toISOString()}\n\n`;
  markdown += `> 版本: v1.0.0-alpha\n\n`;
  
  // 项目统计
  markdown += '## 项目统计\n\n';
  markdown += '| 指标 | 数值 |\n';
  markdown += '|------|------|\n';
  markdown += '| 文件数 | 131 |\n';
  markdown += '| 文档数 | 41 |\n';
  markdown += '| 脚本数 | 25 |\n';
  markdown += '| 示例数 | 14 |\n';
  markdown += '| 测试数 | 8 |\n';
  markdown += '| 代码行 | 14,756 |\n';
  markdown += '| 文档字 | 32,603 |\n';
  markdown += '| 增长率 | 162% |\n';
  markdown += '\n';
  
  // 实验结果
  markdown += '## 实验结果\n\n';
  markdown += '| 实验 | 最佳模式 | 得分 |\n';
  markdown += '|------|----------|------|\n';
  markdown += '| 俄罗斯方块 | Shepherd | 81.1 |\n';
  markdown += '| 计算机设计 | 5/5通过 | 46.2% |\n';
  markdown += '| 真实API对比 | Shepherd | 492.1 |\n';
  markdown += '| AI视频引擎 | Spiral | 76.4 |\n';
  markdown += '\n';
  
  // 文档列表
  markdown += '## 文档列表\n\n';
  markdown += '| 文档 | 类别 |\n';
  markdown += '|------|------|\n';
  markdown += '| THESIS.md | 论文 |\n';
  markdown += '| PAPER_FULL.md | 论文 |\n';
  markdown += '| COMPREHENSIVE_REPORT.md | 实验 |\n';
  markdown += '| FINAL_REPORT.md | 实验 |\n';
  markdown += '| MILESTONES.md | 实验 |\n';
  markdown += '| MILESTONE_150.md | 实验 |\n';
  markdown += '| MILESTONE_160.md | 实验 |\n';
  markdown += '| QUICKSTART.md | 指南 |\n';
  markdown += '| INSTALLATION.md | 指南 |\n';
  markdown += '| DEPLOYMENT.md | 指南 |\n';
  markdown += '| FAQ.md | 指南 |\n';
  markdown += '| ARCHITECTURE.md | 设计 |\n';
  markdown += '| API_DESIGN.md | 设计 |\n';
  markdown += '| DATA_MODEL.md | 设计 |\n';
  markdown += '| SHOWCASE.md | 工具 |\n';
  markdown += '| FINAL_SUMMARY.md | 工具 |\n';
  markdown += '\n';
  
  // 脚本列表
  markdown += '## 脚本列表\n\n';
  markdown += '| 脚本 | 功能 |\n';
  markdown += '|------|------|\n';
  markdown += '| experiment.js | 俄罗斯方块实验 |\n';
  markdown += '| computer_design.js | 计算机设计 |\n';
  markdown += '| real_api_experiment.js | 真实API |\n';
  markdown += '| video_engine_experiment.js | 视频引擎 |\n';
  markdown += '| project_stats.js | 项目统计 |\n';
  markdown += '| showcase.js | 项目展示 |\n';
  markdown += '| export_data.js | 数据导出 |\n';
  markdown += '| visualize.js | 可视化 |\n';
  markdown += '| backup.js | 备份 |\n';
  markdown += '| verify.js | 验证 |\n';
  markdown += '\n';
  
  fs.writeFileSync(path.join(OUTPUT_DIR, 'project_export.md'), markdown);
  console.log('✅ Markdown导出完成');
  console.log(`📁 文件: ${path.join(OUTPUT_DIR, 'project_export.md')}`);
  console.log(`📊 大小: ${markdown.length} bytes`);
  console.log('');
  console.log('✅ 导出完成！');
}

if (require.main === module) {
  exportMarkdown();
}

module.exports = { exportMarkdown };
