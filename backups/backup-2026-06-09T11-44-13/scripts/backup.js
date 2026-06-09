/**
 * 项目备份脚本
 * 备份项目关键文件到备份目录
 */

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.resolve(__dirname, '..');
const BACKUP_DIR = path.join(PROJECT_DIR, 'backups');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function getTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').substring(0, 19);
}

function backup() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     💾 项目备份工具                                      ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  
  ensureDir(BACKUP_DIR);
  
  const timestamp = getTimestamp();
  const backupDir = path.join(BACKUP_DIR, `backup-${timestamp}`);
  ensureDir(backupDir);
  
  console.log(`📁 备份目录: ${backupDir}`);
  console.log('');
  
  // 备份关键文件
  const filesToBackup = [
    'README.md',
    'CHANGELOG.md',
    'ROADMAP.md',
    'package.json',
    'project.json',
    'LICENSE',
    'CONTRIBUTING.md'
  ];
  
  const dirsToBackup = [
    'docs',
    'scripts',
    'examples',
    'src',
    'tests',
    'config'
  ];
  
  console.log('正在备份文件...');
  filesToBackup.forEach(file => {
    const src = path.join(PROJECT_DIR, file);
    const dest = path.join(backupDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ⚠️ ${file} (不存在)`);
    }
  });
  
  console.log('');
  console.log('正在备份目录...');
  dirsToBackup.forEach(dir => {
    const src = path.join(PROJECT_DIR, dir);
    const dest = path.join(backupDir, dir);
    if (fs.existsSync(src)) {
      fs.cpSync(src, dest, { recursive: true });
      console.log(`   ✅ ${dir}/`);
    } else {
      console.log(`   ⚠️ ${dir}/ (不存在)`);
    }
  });
  
  console.log('');
  
  // 生成备份信息
  const info = {
    timestamp: new Date().toISOString(),
    version: '1.0.0-alpha',
    files: filesToBackup.length,
    dirs: dirsToBackup.length
  };
  
  fs.writeFileSync(path.join(backupDir, 'backup-info.json'), JSON.stringify(info, null, 2));
  console.log('✅ 备份完成！');
  console.log(`📁 备份位置: ${backupDir}`);
  console.log(`📊 备份时间: ${timestamp}`);
  console.log('');
  
  // 列出备份历史
  const backups = fs.readdirSync(BACKUP_DIR).filter(d => d.startsWith('backup-'));
  console.log(`📊 备份历史: ${backups.length} 个备份`);
  backups.slice(-5).forEach(b => {
    console.log(`   ${b}`);
  });
  console.log('');
  console.log('✅ 备份工具完成！');
}

if (require.main === module) {
  backup();
}

module.exports = { backup };
