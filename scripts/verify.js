/**
 * 项目验证脚本
 * 验证项目文件的完整性和一致性
 */

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.resolve(__dirname, '..');

const REQUIRED_FILES = [
  'README.md',
  'CHANGELOG.md',
  'ROADMAP.md',
  'package.json',
  'LICENSE',
  'CONTRIBUTING.md',
  'docker-compose.yml',
  '.env.example'
];

const REQUIRED_DIRS = [
  'src',
  'docs',
  'tests',
  'examples',
  'scripts',
  'config',
  'k8s'
];

const REQUIRED_DOCS = [
  'docs/THESIS.md',
  'docs/ARCHITECTURE.md',
  'docs/API_DESIGN.md',
  'docs/DATA_MODEL.md',
  'docs/DEPLOYMENT.md',
  'docs/FAQ.md'
];

function verify() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     ✅ 项目验证工具                                      ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  
  let passed = 0;
  let failed = 0;
  
  // 验证必需文件
  console.log('📄 验证必需文件...');
  REQUIRED_FILES.forEach(file => {
    const fullPath = path.join(PROJECT_DIR, file);
    if (fs.existsSync(fullPath)) {
      console.log(`   ✅ ${file}`);
      passed++;
    } else {
      console.log(`   ❌ ${file} (缺失)`);
      failed++;
    }
  });
  console.log('');
  
  // 验证必需目录
  console.log('📁 验证必需目录...');
  REQUIRED_DIRS.forEach(dir => {
    const fullPath = path.join(PROJECT_DIR, dir);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
      console.log(`   ✅ ${dir}/`);
      passed++;
    } else {
      console.log(`   ❌ ${dir}/ (缺失)`);
      failed++;
    }
  });
  console.log('');
  
  // 验证关键文档
  console.log('📄 验证关键文档...');
  REQUIRED_DOCS.forEach(doc => {
    const fullPath = path.join(PROJECT_DIR, doc);
    if (fs.existsSync(fullPath)) {
      const size = fs.statSync(fullPath).size;
      console.log(`   ✅ ${doc} (${size} bytes)`);
      passed++;
    } else {
      console.log(`   ❌ ${doc} (缺失)`);
      failed++;
    }
  });
  console.log('');
  
  // 验证实验数据
  console.log('🔬 验证实验数据...');
  const resultsDir = path.join(PROJECT_DIR, 'simulation_results');
  if (fs.existsSync(resultsDir)) {
    const files = fs.readdirSync(resultsDir).filter(f => f.endsWith('.json'));
    console.log(`   ✅ simulation_results/ (${files.length} 个数据文件)`);
    passed++;
  } else {
    console.log('   ❌ simulation_results/ (缺失)');
    failed++;
  }
  console.log('');
  
  // 验证脚本
  console.log('🔧 验证脚本...');
  const scriptsDir = path.join(PROJECT_DIR, 'scripts');
  if (fs.existsSync(scriptsDir)) {
    const files = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.js'));
    console.log(`   ✅ scripts/ (${files.length} 个脚本)`);
    passed++;
  } else {
    console.log('   ❌ scripts/ (缺失)');
    failed++;
  }
  console.log('');
  
  // 验证示例
  console.log('📁 验证示例...');
  const examplesDir = path.join(PROJECT_DIR, 'examples');
  if (fs.existsSync(examplesDir)) {
    const dirs = fs.readdirSync(examplesDir).filter(f => {
      return fs.statSync(path.join(examplesDir, f)).isDirectory();
    });
    console.log(`   ✅ examples/ (${dirs.length} 个示例)`);
    passed++;
  } else {
    console.log('   ❌ examples/ (缺失)');
    failed++;
  }
  console.log('');
  
  // 总结
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║              验证结果                                    ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║  通过: ${passed.toString().padStart(3)} 项                                          ║`);
  console.log(`║  失败: ${failed.toString().padStart(3)} 项                                          ║`);
  console.log(`║  总计: ${(passed + failed).toString().padStart(3)} 项                                          ║`);
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║  状态: ${failed === 0 ? '✅ 全部通过' : '⚠️  部分失败'}                                    ║`);
  console.log('╚══════════════════════════════════════════════════════════╝');
  
  return failed === 0;
}

if (require.main === module) {
  verify();
}

module.exports = { verify };
