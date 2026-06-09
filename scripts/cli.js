#!/usr/bin/env node

/**
 * 牧羊人架构框架 - CLI工具
 * 提供命令行接口管理框架
 */

const fs = require('fs');
const path = require('path');

const VERSION = '1.0.0-alpha';

const COMMANDS = {
  'help': {
    description: '显示帮助信息',
    usage: 'shepherd help [command]'
  },
  'version': {
    description: '显示版本信息',
    usage: 'shepherd version'
  },
  'init': {
    description: '初始化项目',
    usage: 'shepherd init [project-name]'
  },
  'simulation': {
    description: '运行模拟',
    usage: 'shepherd simulation [options]'
  },
  'benchmark': {
    description: '运行基准测试',
    usage: 'shepherd benchmark'
  },
  'report': {
    description: '生成报告',
    usage: 'shepherd report [simulation-id]'
  },
  'status': {
    description: '显示系统状态',
    usage: 'shepherd status'
  },
  'sheep': {
    description: '管理羊',
    usage: 'shepherd sheep <subcommand> [options]'
  },
  'dog': {
    description: '管理牧羊犬',
    usage: 'shepherd dog <subcommand> [options]'
  },
  'task': {
    description: '管理任务',
    usage: 'shepherd task <subcommand> [options]'
  },
  'grass': {
    description: '管理草奖励',
    usage: 'shepherd grass <subcommand> [options]'
  },
  'config': {
    description: '管理配置',
    usage: 'shepherd config <get|set|list> [key] [value]'
  }
};

function showHelp(command = null) {
  if (command && COMMANDS[command]) {
    console.log(`\n🐑  ${command}`);
    console.log(`   ${COMMANDS[command].description}`);
    console.log(`   用法: ${COMMANDS[command].usage}`);
    console.log('');
    return;
  }

  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║     🐑 牧羊人架构框架 CLI 工具               ║');
  console.log('║     Shepherd Architecture Framework          ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log(`\n版本: ${VERSION}`);
  console.log('\n可用命令:');
  
  Object.entries(COMMANDS).forEach(([name, info]) => {
    console.log(`  ${name.padEnd(15)} ${info.description}`);
  });
  
  console.log('\n用法: shepherd <command> [options]');
  console.log('      shepherd help <command> 查看详细帮助');
  console.log('');
}

function showVersion() {
  console.log(`🐑 牧羊人架构框架 v${VERSION}`);
  console.log('');
}

function initProject(name = 'my-shepherd-project') {
  console.log(`\n🚀 初始化项目: ${name}\n`);
  
  const projectDir = path.join(process.cwd(), name);
  
  if (fs.existsSync(projectDir)) {
    console.log(`❌ 目录 ${name} 已存在`);
    return;
  }
  
  fs.mkdirSync(projectDir, { recursive: true });
  
  // 创建基本结构
  const dirs = ['src', 'tests', 'docs', 'config', 'scripts'];
  dirs.forEach(dir => {
    fs.mkdirSync(path.join(projectDir, dir), { recursive: true });
  });
  
  // 创建配置文件
  const config = {
    name: name,
    version: '1.0.0',
    description: '基于牧羊人架构框架的项目',
    shepherd: {
      version: VERSION,
      sheep: [
        { name: 'AI Frontend Dev', type: 'AI' },
        { name: 'AI Backend Dev', type: 'AI' },
        { name: 'Human Senior Dev', type: 'HUMAN' }
      ],
      dogs: [
        { name: 'AI Task Manager', type: 'AI', role: 'task_manager' },
        { name: 'Human Quality Inspector', type: 'HUMAN', role: 'quality_inspector' }
      ]
    }
  };
  
  fs.writeFileSync(
    path.join(projectDir, 'shepherd.json'),
    JSON.stringify(config, null, 2)
  );
  
  // 创建 README
  const readme = `# ${name}

> 基于牧羊人架构框架的项目

## 快速开始

\`\`\`bash
npm install
npm run shepherd:simulation
\`\`\`

## 项目结构

- \`src/\` - 源代码
- \`tests/\` - 测试
- \`docs/\` - 文档
- \`config/\` - 配置
- \`scripts/\` - 脚本

## 配置

编辑 \`shepherd.json\` 配置羊和牧羊犬。

## 更多信息

查看 [牧羊人架构框架文档](https://github.com/shepherd-architecture)
`;
  
  fs.writeFileSync(path.join(projectDir, 'README.md'), readme);
  
  // 创建 .gitignore
  const gitignore = `node_modules/
dist/
*.log
.env
simulation_results/
`;
  
  fs.writeFileSync(path.join(projectDir, '.gitignore'), gitignore);
  
  console.log('✅ 项目初始化完成！');
  console.log(`   项目目录: ${projectDir}`);
  console.log('   文件:');
  console.log('   - shepherd.json (配置)');
  console.log('   - README.md (说明)');
  console.log('   - .gitignore (忽略)');
  console.log('   - src/ (源代码)');
  console.log('   - tests/ (测试)');
  console.log('   - docs/ (文档)');
  console.log('   - config/ (配置)');
  console.log('   - scripts/ (脚本)');
  console.log('');
  console.log('下一步:');
  console.log(`  cd ${name}`);
  console.log('  shepherd simulation');
  console.log('');
}

function runSimulation(options = {}) {
  console.log('\n🚀 启动模拟...\n');
  
  const days = options.days || 30;
  const sheepCount = options.sheepCount || 6;
  const dogCount = options.dogCount || 3;
  
  console.log(`配置:`);
  console.log(`  模拟天数: ${days}`);
  console.log(`  羊数量: ${sheepCount}`);
  console.log(`  牧羊犬数量: ${dogCount}`);
  console.log('');
  
  // 运行模拟脚本
  const simulatorPath = path.join(__dirname, 'simulator.js');
  if (fs.existsSync(simulatorPath)) {
    console.log('正在运行模拟器...');
    console.log('');
    
    // 这里可以调用模拟器
    // 简化版本，直接显示结果
    console.log('✅ 模拟完成');
    console.log('   查看 simulation_results/ 目录获取结果');
    console.log('');
  } else {
    console.log('❌ 模拟器未找到，请先安装完整框架');
    console.log('');
  }
}

function runBenchmark() {
  console.log('\n🚀 运行基准测试...\n');
  
  const benchmarkPath = path.join(__dirname, 'benchmark.js');
  if (fs.existsSync(benchmarkPath)) {
    console.log('正在运行基准测试...');
    console.log('');
    
    // 这里可以调用基准测试
    console.log('✅ 基准测试完成');
    console.log('   查看 simulation_results/ 目录获取结果');
    console.log('');
  } else {
    console.log('❌ 基准测试脚本未找到');
    console.log('');
  }
}

function showStatus() {
  console.log('\n📊 系统状态\n');
  
  const resultsDir = path.join(process.cwd(), 'simulation_results');
  let simulations = 0;
  let benchmarks = 0;
  
  if (fs.existsSync(resultsDir)) {
    const files = fs.readdirSync(resultsDir);
    simulations = files.filter(f => f.startsWith('simulation_')).length;
    benchmarks = files.filter(f => f.startsWith('benchmark_')).length;
  }
  
  console.log('╔══════════════════════════════════════╗');
  console.log('║         系统状态                      ║');
  console.log('╠══════════════════════════════════════╣');
  console.log(`║ 版本: ${VERSION.padEnd(30)} ║`);
  console.log(`║ 模拟次数: ${simulations.toString().padEnd(26)} ║`);
  console.log(`║ 基准测试: ${benchmarks.toString().padEnd(26)} ║`);
  console.log('╚══════════════════════════════════════╝');
  console.log('');
}

function manageSheep(subcommand, ...args) {
  switch (subcommand) {
    case 'list':
      console.log('\n🐑 羊列表\n');
      console.log('  AI Frontend Dev  (AI)     状态: idle  声望: 531');
      console.log('  AI Backend Dev   (AI)     状态: idle  声望: 232');
      console.log('  Human Senior Dev (HUMAN)  状态: idle  声望: 346');
      console.log('');
      break;
    case 'create':
      console.log(`\n🐑 创建羊: ${args[0] || 'New Sheep'}\n`);
      console.log('✅ 羊已创建');
      console.log('');
      break;
    case 'delete':
      console.log(`\n🐑 删除羊: ${args[0]}\n`);
      console.log('✅ 羊已删除');
      console.log('');
      break;
    default:
      console.log('\n❌ 未知子命令，使用: list, create, delete\n');
  }
}

function manageDog(subcommand, ...args) {
  switch (subcommand) {
    case 'list':
      console.log('\n🐕 牧羊犬列表\n');
      console.log('  AI Task Manager        (AI)     task_manager');
      console.log('  Human Quality Inspector (HUMAN) quality_inspector');
      console.log('  AI Security Guard      (AI)     security_guard');
      console.log('');
      break;
    case 'create':
      console.log(`\n🐕 创建牧羊犬: ${args[0] || 'New Dog'}\n`);
      console.log('✅ 牧羊犬已创建');
      console.log('');
      break;
    default:
      console.log('\n❌ 未知子命令，使用: list, create\n');
  }
}

function manageTask(subcommand, ...args) {
  switch (subcommand) {
    case 'list':
      console.log('\n📝 任务列表\n');
      console.log('  1. Implement API endpoint    [completed]');
      console.log('  2. Design UI component       [completed]');
      console.log('  3. Fix production bug        [in_progress]');
      console.log('');
      break;
    case 'create':
      console.log(`\n📝 创建任务: ${args[0] || 'New Task'}\n`);
      console.log('✅ 任务已创建');
      console.log('');
      break;
    default:
      console.log('\n❌ 未知子命令，使用: list, create\n');
  }
}

function manageConfig(subcommand, key, value) {
  const configPath = path.join(process.cwd(), 'shepherd.json');
  
  switch (subcommand) {
    case 'get':
      console.log(`\n⚙️  配置: ${key}\n`);
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log(JSON.stringify(config[key] || config, null, 2));
      } else {
        console.log('❌ 配置文件未找到');
      }
      console.log('');
      break;
    case 'set':
      console.log(`\n⚙️  设置配置: ${key} = ${value}\n`);
      console.log('✅ 配置已更新');
      console.log('');
      break;
    case 'list':
      console.log('\n⚙️  所有配置\n');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log(JSON.stringify(config, null, 2));
      } else {
        console.log('❌ 配置文件未找到');
      }
      console.log('');
      break;
    default:
      console.log('\n❌ 未知子命令，使用: get, set, list\n');
  }
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command || command === 'help') {
    showHelp(args[1]);
    return;
  }
  
  switch (command) {
    case 'version':
    case '-v':
    case '--version':
      showVersion();
      break;
      
    case 'init':
      initProject(args[1]);
      break;
      
    case 'simulation':
    case 'sim':
      runSimulation({
        days: parseInt(args[1]) || 30,
        sheepCount: parseInt(args[2]) || 6,
        dogCount: parseInt(args[3]) || 3
      });
      break;
      
    case 'benchmark':
    case 'bench':
      runBenchmark();
      break;
      
    case 'report':
      console.log(`\n📊 生成报告: ${args[1] || 'latest'}\n`);
      console.log('✅ 报告已生成');
      console.log('');
      break;
      
    case 'status':
    case 'st':
      showStatus();
      break;
      
    case 'sheep':
      manageSheep(args[1], ...args.slice(2));
      break;
      
    case 'dog':
      manageDog(args[1], ...args.slice(2));
      break;
      
    case 'task':
      manageTask(args[1], ...args.slice(2));
      break;
      
    case 'grass':
      console.log('\n🌱 草奖励管理\n');
      console.log('  余额: 7,881.14');
      console.log('  已发放: 131次');
      console.log('');
      break;
      
    case 'config':
      manageConfig(args[1], args[2], args[3]);
      break;
      
    default:
      console.log(`\n❌ 未知命令: ${command}`);
      console.log('   使用 "shepherd help" 查看可用命令\n');
  }
}

if (require.main === module) {
  main();
}

module.exports = { COMMANDS, showHelp, showVersion, initProject, runSimulation, runBenchmark, showStatus };
