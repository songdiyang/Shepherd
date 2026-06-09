/**
 * 项目统计工具
 * 统计牧羊人架构项目的文件数量、代码行数、文档字数等
 */

const fs = require('fs');
const path = require('path');

class ProjectStats {
  constructor() {
    this.root = path.resolve(__dirname, '..');
    this.stats = {
      totalFiles: 0,
      totalDirs: 0,
      byType: {},
      byCategory: {},
      codeLines: 0,
      docWords: 0,
      totalSize: 0
    };
  }

  scan(dir = this.root, depth = 0) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const relative = path.relative(this.root, fullPath);
      
      // 跳过不需要统计的
      if (item === 'node_modules' || item === '.git' || item === 'simulation_results' || item === 'backups' || item === 'exports') continue;
      
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        this.stats.totalDirs++;
        this.scan(fullPath, depth + 1);
      } else {
        this.stats.totalFiles++;
        this.stats.totalSize += stat.size;
        
        const ext = path.extname(item).toLowerCase() || 'no_ext';
        this.stats.byType[ext] = (this.stats.byType[ext] || 0) + 1;
        
        // 分类统计
        const category = this.getCategory(relative);
        this.stats.byCategory[category] = (this.stats.byCategory[category] || 0) + 1;
        
        // 统计代码行数
        if (['.js', '.ts', '.py', '.java', '.cpp', '.c', '.go', '.rs', '.rb'].includes(ext)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          this.stats.codeLines += content.split('\n').length;
        }
        
        // 统计文档字数
        if (['.md', '.txt', '.rst'].includes(ext)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          this.stats.docWords += content.split(/\s+/).length;
        }
      }
    }
  }

  getCategory(relativePath) {
    if (relativePath.startsWith('docs/')) return '文档';
    if (relativePath.startsWith('src/')) return '源代码';
    if (relativePath.startsWith('tests/') || relativePath.includes('.test.')) return '测试';
    if (relativePath.startsWith('examples/')) return '示例';
    if (relativePath.startsWith('scripts/')) return '脚本';
    if (relativePath.startsWith('config/')) return '配置';
    if (relativePath.startsWith('public/')) return '静态资源';
    if (relativePath.startsWith('k8s/')) return 'K8s配置';
    if (relativePath.startsWith('.github/')) return 'CI/CD';
    if (relativePath.startsWith('docker')) return 'Docker';
    return '其他';
  }

  formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  }

  generateReport() {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║           牧羊人架构项目统计报告                        ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('');
    
    console.log('📊 总体统计');
    console.log('─────────────────────────────────────────');
    console.log(`   总文件数:     ${this.stats.totalFiles}`);
    console.log(`   总目录数:     ${this.stats.totalDirs}`);
    console.log(`   总大小:       ${this.formatSize(this.stats.totalSize)}`);
    console.log(`   代码行数:     ${this.stats.codeLines.toLocaleString()} 行`);
    console.log(`   文档字数:     ${this.stats.docWords.toLocaleString()} 字`);
    console.log('');
    
    console.log('📁 按类别统计');
    console.log('─────────────────────────────────────────');
    const sortedCategories = Object.entries(this.stats.byCategory)
      .sort((a, b) => b[1] - a[1]);
    
    for (const [cat, count] of sortedCategories) {
      const bar = '█'.repeat(Math.floor(count / 2));
      console.log(`   ${cat.padEnd(12)} ${count.toString().padStart(4)} ${bar}`);
    }
    console.log('');
    
    console.log('📄 按文件类型统计');
    console.log('─────────────────────────────────────────');
    const sortedTypes = Object.entries(this.stats.byType)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    for (const [ext, count] of sortedTypes) {
      const bar = '█'.repeat(Math.floor(count / 2));
      console.log(`   ${ext.padEnd(12)} ${count.toString().padStart(4)} ${bar}`);
    }
    console.log('');
    
    console.log('📊 项目成长');
    console.log('─────────────────────────────────────────');
    console.log('   初始状态:  ~50 文件');
    console.log('   当前状态:  ' + this.stats.totalFiles + ' 文件');
    console.log('   增长:      +' + (this.stats.totalFiles - 50) + ' 文件');
    console.log('   增长率:    ' + ((this.stats.totalFiles / 50 - 1) * 100).toFixed(0) + '%');
    console.log('');
    
    console.log('📈 内容规模');
    console.log('─────────────────────────────────────────');
    console.log('   代码行数:  ' + this.stats.codeLines.toLocaleString() + ' 行');
    console.log('   文档字数:  ' + this.stats.docWords.toLocaleString() + ' 字');
    console.log('   平均文件:  ' + this.formatSize(this.stats.totalSize / this.stats.totalFiles));
    console.log('');
    
    console.log('✅ 项目统计完成！');
    console.log('');
    
    return this.stats;
  }
}

// 主函数
function main() {
  const stats = new ProjectStats();
  stats.scan();
  stats.generateReport();
}

if (require.main === module) {
  main();
}

module.exports = { ProjectStats };
