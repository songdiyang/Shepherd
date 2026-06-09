/**
 * 项目清理脚本
 * 清理临时文件和备份
 */

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.resolve(__dirname, '..');

function clean() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     🧹 项目清理工具                                      ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  
  let cleaned = 0;
  let freed = 0;
  
  // 清理备份目录（保留最近3个）
  const backupDir = path.join(PROJECT_DIR, 'backups');
  if (fs.existsSync(backupDir)) {
    const backups = fs.readdirSync(backupDir)
      .filter(d => d.startsWith('backup-'))
      .sort();
    
    if (backups.length > 3) {
      const toRemove = backups.slice(0, backups.length - 3);
      toRemove.forEach(b => {
        const fullPath = path.join(backupDir, b);
        const size = getDirSize(fullPath);
        fs.rmSync(fullPath, { recursive: true });
        cleaned++;
        freed += size;
        console.log(`   🗑️  ${b} (${formatSize(size)})`);
      });
    }
  }
  
  // 清理导出目录（保留最近5个）
  const exportDir = path.join(PROJECT_DIR, 'exports');
  if (fs.existsSync(exportDir)) {
    const files = fs.readdirSync(exportDir)
      .filter(f => f.endsWith('.json') || f.endsWith('.csv') || f.endsWith('.html'))
      .sort();
    
    if (files.length > 5) {
      const toRemove = files.slice(0, files.length - 5);
      toRemove.forEach(f => {
        const fullPath = path.join(exportDir, f);
        const size = fs.statSync(fullPath).size;
        fs.unlinkSync(fullPath);
        cleaned++;
        freed += size;
        console.log(`   🗑️  ${f} (${formatSize(size)})`);
      });
    }
  }
  
  console.log('');
  console.log('✅ 清理完成！');
  console.log(`   清理: ${cleaned} 项`);
  console.log(`   释放: ${formatSize(freed)}`);
  console.log('');
  console.log('✅ 清理工具完成！');
}

function getDirSize(dir) {
  let size = 0;
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      size += getDirSize(fullPath);
    } else {
      size += stat.size;
    }
  });
  return size;
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

if (require.main === module) {
  clean();
}

module.exports = { clean };