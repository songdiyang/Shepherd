/**
 * 数据导出工具
 * 将所有实验数据导出为CSV格式
 */

const fs = require('fs');
const path = require('path');

const RESULTS_DIR = path.join(__dirname, '..', 'simulation_results');
const OUTPUT_DIR = path.join(__dirname, '..', 'exports');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function exportTetris() {
  const files = fs.readdirSync(RESULTS_DIR).filter(f => f.startsWith('experiment_') && f.endsWith('.json'));
  if (files.length === 0) return;
  
  const latest = files.sort().pop();
  const data = JSON.parse(fs.readFileSync(path.join(RESULTS_DIR, latest), 'utf8'));
  
  let csv = 'Experiment,Mode,TeamSize,Duration,Complexity,Quality,Communication,Efficiency,Completion,BugRate\n';
  
  data.experiments.forEach(exp => {
    exp.results.forEach(r => {
      csv += `${exp.task},${r.methodology},${r.teamSize},${r.duration.toFixed(1)},${r.complexity},${r.quality.toFixed(2)},${r.communication.toFixed(2)},${r.efficiency.toFixed(2)},${(r.completion * 100).toFixed(1)}%,${(r.bugRate * 100).toFixed(1)}%\n`;
    });
  });
  
  fs.writeFileSync(path.join(OUTPUT_DIR, 'tetris_experiments.csv'), csv);
  console.log('✅ 俄罗斯方块实验数据已导出');
}

function exportComputerDesign() {
  const files = fs.readdirSync(RESULTS_DIR).filter(f => f.startsWith('computer_design_') && f.endsWith('.json'));
  if (files.length === 0) return;
  
  const latest = files.sort().pop();
  const data = JSON.parse(fs.readFileSync(path.join(RESULTS_DIR, latest), 'utf8'));
  
  let csv = 'Name,Type,Grass,Reputation\n';
  data.sheep.forEach(s => {
    csv += `${s.name},${s.type},${s.grass},${s.reputation}\n`;
  });
  
  fs.writeFileSync(path.join(OUTPUT_DIR, 'computer_design.csv'), csv);
  console.log('✅ 计算机设计数据已导出');
}

function exportRealAPI() {
  const files = fs.readdirSync(RESULTS_DIR).filter(f => f.startsWith('real_api_comparison_') && f.endsWith('.json'));
  if (files.length === 0) return;
  
  const latest = files.sort().pop();
  const data = JSON.parse(fs.readFileSync(path.join(RESULTS_DIR, latest), 'utf8'));
  
  let csv = 'Mode,Task,Role,Duration,Quality,API_Calls\n';
  data.modes.forEach(m => {
    m.results.forEach(r => {
      csv += `${m.mode},${r.task},${r.role},${r.duration.toFixed(1)},${r.quality},${data.apiCalls}\n`;
    });
  });
  
  fs.writeFileSync(path.join(OUTPUT_DIR, 'real_api_comparison.csv'), csv);
  console.log('✅ 真实API实验数据已导出');
}

function exportVideoEngine() {
  const files = fs.readdirSync(RESULTS_DIR).filter(f => f.startsWith('video_engine_experiment_') && f.endsWith('.json'));
  if (files.length === 0) return;
  
  const latest = files.sort().pop();
  const data = JSON.parse(fs.readFileSync(path.join(RESULTS_DIR, latest), 'utf8'));
  
  let csv = 'Mode,Member,Role,Duration,Score\n';
  data.teams.forEach(t => {
    t.members.forEach(m => {
      csv += `${t.mode},${m.name},${m.role},${m.duration},${m.score}\n`;
    });
  });
  
  fs.writeFileSync(path.join(OUTPUT_DIR, 'video_engine_experiments.csv'), csv);
  console.log('✅ 视频引擎实验数据已导出');
}

function exportAll() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     📊 数据导出工具                                      ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  
  ensureDir(OUTPUT_DIR);
  
  console.log('正在导出实验数据...');
  console.log('');
  
  try { exportTetris(); } catch (e) { console.log('⚠️ 俄罗斯方块:', e.message); }
  try { exportComputerDesign(); } catch (e) { console.log('⚠️ 计算机设计:', e.message); }
  try { exportRealAPI(); } catch (e) { console.log('⚠️ 真实API:', e.message); }
  try { exportVideoEngine(); } catch (e) { console.log('⚠️ 视频引擎:', e.message); }
  
  console.log('');
  console.log('✅ 数据导出完成！');
  console.log(`📁 导出目录: ${OUTPUT_DIR}`);
  console.log('');
  
  const files = fs.readdirSync(OUTPUT_DIR);
  files.forEach(f => {
    const size = fs.statSync(path.join(OUTPUT_DIR, f)).size;
    console.log(`   ${f} (${size} bytes)`);
  });
  
  console.log('');
  console.log('✅ 全部导出完成！');
}

if (require.main === module) {
  exportAll();
}

module.exports = { exportAll };
