/**
 * 项目徽章生成脚本
 * 生成项目状态徽章
 */

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(PROJECT_DIR, 'exports');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function generateBadges() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     🏷️ 项目徽章生成                                      ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  
  ensureDir(OUTPUT_DIR);
  
  const badges = [
    {
      label: 'Version',
      message: '1.0.0-alpha',
      color: 'blue'
    },
    {
      label: 'License',
      message: 'MIT',
      color: 'green'
    },
    {
      label: 'Files',
      message: '124',
      color: 'orange'
    },
    {
      label: 'Docs',
      message: '38',
      color: 'lightgrey'
    },
    {
      label: 'Growth',
      message: '+148%',
      color: 'brightgreen'
    },
    {
      label: 'Code',
      message: '14.4K',
      color: 'blueviolet'
    },
    {
      label: 'API',
      message: 'DeepSeek',
      color: 'blueviolet'
    },
    {
      label: 'Tests',
      message: '8',
      color: 'yellow'
    },
    {
      label: 'Scripts',
      message: '22',
      color: 'red'
    },
    {
      label: 'Status',
      message: 'Alpha',
      color: 'critical'
    }
  ];
  
  let markdown = '# 项目徽章\n\n';
  
  badges.forEach(badge => {
    const url = `https://img.shields.io/badge/${encodeURIComponent(badge.label)}-${encodeURIComponent(badge.message)}-${badge.color}`;
    markdown += `![${badge.label}](${url})\n`;
    console.log(`   ✅ ${badge.label}: ${badge.message}`);
  });
  
  markdown += '\n---\n\n';
  markdown += '**生成时间**: ' + new Date().toISOString() + '\n';
  markdown += '**版本**: v1.0.0-alpha\n';
  
  fs.writeFileSync(path.join(OUTPUT_DIR, 'badges.md'), markdown);
  console.log('');
  console.log('✅ 徽章已生成');
  console.log(`📁 文件: ${path.join(OUTPUT_DIR, 'badges.md')}`);
  console.log('');
  
  console.log('🏷️ 徽章列表');
  console.log('─────────────────────────────────────────');
  badges.forEach(badge => {
    console.log(`   ${badge.label}: ${badge.message}`);
  });
  console.log('');
  console.log('✅ 徽章生成完成！');
}

if (require.main === module) {
  generateBadges();
}

module.exports = { generateBadges };
