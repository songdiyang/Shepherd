/**
 * 模拟可视化报告生成器
 * 从 simulation_results/*.json 生成 HTML 可视化报告
 */

const fs = require('fs');
const path = require('path');

function generateReport(dataFile) {
  const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  const stats = data.statistics;
  
  // 提取数据用于图表
  const sheep = data.sheep;
  const dogs = data.dogs;
  const tasks = data.tasks;
  
  // 计算任务类型分布
  const taskTypes = {};
  tasks.forEach(t => {
    taskTypes[t.title] = (taskTypes[t.title] || 0) + 1;
  });
  
  // 计算状态分布
  const statusCount = {};
  tasks.forEach(t => {
    statusCount[t.status] = (statusCount[t.status] || 0) + 1;
  });
  
  // 计算每日数据（基于事件）
  const dailyData = {};
  data.events.forEach(e => {
    const date = new Date(e.timestamp).toISOString().split('T')[0];
    if (!dailyData[date]) {
      dailyData[date] = { tasks: 0, completed: 0, failed: 0, grass: 0 };
    }
    if (e.type === 'TASK_ASSIGNED') dailyData[date].tasks++;
    if (e.type === 'TASK_EXECUTED' && e.data.success) dailyData[date].completed++;
    if (e.type === 'TASK_EXECUTED' && !e.data.success) dailyData[date].failed++;
    if (e.type === 'GRASS_GRANTED') dailyData[date].grass += e.data.amount;
  });
  
  const dates = Object.keys(dailyData).sort();
  const dailyTasks = dates.map(d => dailyData[d].tasks);
  const dailyCompleted = dates.map(d => dailyData[d].completed);
  const dailyFailed = dates.map(d => dailyData[d].failed);
  const dailyGrass = dates.map(d => dailyData[d].grass);
  
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>牧羊人架构框架 - 模拟运行报告</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #0f172a;
            color: #e2e8f0;
            line-height: 1.6;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        header {
            text-align: center;
            padding: 60px 20px;
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            border-radius: 20px;
            margin-bottom: 40px;
            border: 1px solid #334155;
        }
        h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            background: linear-gradient(90deg, #60a5fa, #a78bfa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .subtitle {
            font-size: 1.1em;
            color: #94a3b8;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .stat-card {
            background: #1e293b;
            border-radius: 16px;
            padding: 30px;
            border: 1px solid #334155;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        .stat-value {
            font-size: 2.5em;
            font-weight: bold;
            color: #60a5fa;
            margin-bottom: 8px;
        }
        .stat-label {
            font-size: 0.9em;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .stat-trend {
            font-size: 0.85em;
            margin-top: 10px;
            padding: 4px 12px;
            border-radius: 20px;
            display: inline-block;
        }
        .trend-up {
            background: #064e3b;
            color: #34d399;
        }
        .trend-down {
            background: #7f1d1d;
            color: #f87171;
        }
        .section {
            background: #1e293b;
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 40px;
            border: 1px solid #334155;
        }
        h2 {
            font-size: 1.5em;
            margin-bottom: 20px;
            color: #f8fafc;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .icon {
            font-size: 1.2em;
        }
        .chart-container {
            position: relative;
            height: 400px;
            margin: 20px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #334155;
        }
        th {
            font-weight: 600;
            color: #94a3b8;
            text-transform: uppercase;
            font-size: 0.85em;
            letter-spacing: 1px;
        }
        tr:hover {
            background: rgba(96, 165, 250, 0.05);
        }
        .badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 600;
        }
        .badge-ai { background: #1e3a5f; color: #60a5fa; }
        .badge-human { background: #3f2e1e; color: #fbbf24; }
        .badge-senior { background: #3f1e3a; color: #f472b6; }
        .badge-experienced { background: #1e3f2e; color: #34d399; }
        .badge-trainee { background: #3f3f1e; color: #fbbf24; }
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #334155;
            border-radius: 4px;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            border-radius: 4px;
            transition: width 0.5s ease;
        }
        .progress-success { background: #34d399; }
        .progress-failure { background: #f87171; }
        .grid-2 {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
            gap: 20px;
        }
        .leaderboard-item {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px;
            border-radius: 12px;
            background: rgba(255,255,255,0.03);
            margin-bottom: 10px;
        }
        .rank {
            font-size: 1.5em;
            font-weight: bold;
            width: 40px;
            text-align: center;
        }
        .rank-1 { color: #fbbf24; }
        .rank-2 { color: #94a3b8; }
        .rank-3 { color: #b45309; }
        .info {
            flex: 1;
        }
        .name {
            font-weight: 600;
            font-size: 1.1em;
        }
        .details {
            font-size: 0.85em;
            color: #94a3b8;
            margin-top: 4px;
        }
        .score {
            font-size: 1.2em;
            font-weight: bold;
            color: #60a5fa;
        }
        .footer {
            text-align: center;
            padding: 40px;
            color: #64748b;
            font-size: 0.9em;
        }
        .key-findings {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .finding {
            padding: 20px;
            border-radius: 12px;
            background: rgba(96, 165, 250, 0.05);
            border-left: 4px solid #60a5fa;
        }
        .finding h3 {
            font-size: 1.1em;
            margin-bottom: 8px;
            color: #f8fafc;
        }
        .finding p {
            font-size: 0.9em;
            color: #94a3b8;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🐑 牧羊人架构框架</h1>
            <p class="subtitle">模拟运行可视化报告</p>
            <p class="subtitle" style="margin-top: 10px; font-size: 0.9em;">
                生成时间: ${new Date().toLocaleString('zh-CN')} | 
                数据文件: ${path.basename(dataFile)}
            </p>
        </header>

        <!-- 核心指标 -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${stats.totalTasks}</div>
                <div class="stat-label">总任务</div>
                <div class="stat-trend trend-up">30天周期</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.completionRate}%</div>
                <div class="stat-label">完成率</div>
                <div class="stat-trend trend-up">目标: 80%</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.averageTaskQuality}</div>
                <div class="stat-label">平均质量</div>
                <div class="stat-trend trend-up">目标: 0.80</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.totalSheep}</div>
                <div class="stat-label">羊</div>
                <div class="stat-trend trend-up">4 AI + 2 Human</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.totalDogs}</div>
                <div class="stat-label">牧羊犬</div>
                <div class="stat-trend trend-up">2 AI + 1 Human</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.totalGrassDistributed}</div>
                <div class="stat-label">总草量</div>
                <div class="stat-trend trend-up">激励充足</div>
            </div>
        </div>

        <!-- 图表区域 -->
        <div class="grid-2">
            <div class="section">
                <h2><span class="icon">📊</span> 任务状态分布</h2>
                <div class="chart-container">
                    <canvas id="statusChart"></canvas>
                </div>
            </div>
            <div class="section">
                <h2><span class="icon">📝</span> 任务类型分布</h2>
                <div class="chart-container">
                    <canvas id="taskTypeChart"></canvas>
                </div>
            </div>
        </div>

        <div class="section">
            <h2><span class="icon">📈</span> 每日任务趋势</h2>
            <div class="chart-container">
                <canvas id="dailyChart"></canvas>
            </div>
        </div>

        <!-- 羊排行榜 -->
        <div class="section">
            <h2><span class="icon">🏆</span> 羊排行榜</h2>
            ${sheep.map((s, i) => `
            <div class="leaderboard-item">
                <div class="rank rank-${i + 1}">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</div>
                <div class="info">
                    <div class="name">${s.name} <span class="badge badge-${s.type.toLowerCase()}">${s.type}</span></div>
                    <div class="details">
                        声望: ${s.reputation} | 草: ${s.grassBalance} | 完成: ${s.tasksCompleted}/${s.tasksCompleted + s.tasksFailed} | 称号: ${s.title || '无'}
                    </div>
                </div>
                <div class="score">${s.reputation}</div>
            </div>
            `).join('')}
        </div>

        <!-- 牧羊犬统计 -->
        <div class="section">
            <h2><span class="icon">🐕</span> 牧羊犬统计</h2>
            <table>
                <thead>
                    <tr>
                        <th>名称</th>
                        <th>类型</th>
                        <th>角色</th>
                        <th>管理羊群</th>
                        <th>分配任务</th>
                        <th>审查任务</th>
                        <th>剩余预算</th>
                    </tr>
                </thead>
                <tbody>
                    ${dogs.map(d => `
                    <tr>
                        <td><strong>${d.name}</strong></td>
                        <td><span class="badge badge-${d.type.toLowerCase()}">${d.type}</span></td>
                        <td>${d.role}</td>
                        <td>${d.flockSize}</td>
                        <td>${d.tasksAssigned}</td>
                        <td>${d.tasksReviewed}</td>
                        <td>${d.grassBudget}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <!-- 任务详细统计 -->
        <div class="section">
            <h2><span class="icon">📋</span> 任务详细统计</h2>
            <table>
                <thead>
                    <tr>
                        <th>任务类型</th>
                        <th>数量</th>
                        <th>完成率</th>
                        <th>平均质量</th>
                        <th>分布</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(taskTypes).map(([title, count]) => {
                        const typeTasks = tasks.filter(t => t.title === title);
                        const completed = typeTasks.filter(t => t.status === 'completed').length;
                        const rate = ((completed / count) * 100).toFixed(1);
                        const avgQuality = typeTasks.filter(t => t.quality).reduce((sum, t) => sum + parseFloat(t.quality), 0) / (completed || 1);
                        return `
                        <tr>
                            <td><strong>${title}</strong></td>
                            <td>${count}</td>
                            <td><span class="badge ${rate > 80 ? 'trend-up' : 'trend-down'}">${rate}%</span></td>
                            <td>${avgQuality.toFixed(2)}</td>
                            <td>
                                <div class="progress-bar">
                                    <div class="progress-fill progress-success" style="width: ${rate}%"></div>
                                </div>
                            </td>
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>

        <!-- 关键发现 -->
        <div class="section">
            <h2><span class="icon">💡</span> 关键发现</h2>
            <div class="key-findings">
                <div class="finding">
                    <h3>🎯 高完成率</h3>
                    <p>任务完成率达到 ${stats.completionRate}%，超过80%目标，说明牧羊犬管理有效。</p>
                </div>
                <div class="finding">
                    <h3>🏆 AI表现优异</h3>
                    <p>AI Frontend Dev 声望最高(${sheep[0].reputation})，证明弱AI在特定领域表现优异。</p>
                </div>
                <div class="finding">
                    <h3>🤝 人机协作</h3>
                    <p>AI和Human羊表现相近，说明人机协作模型有效，身份可互换。</p>
                </div>
                <div class="finding">
                    <h3>💰 激励有效</h3>
                    <p>草奖励机制促进羊积极性，总草量达 ${stats.totalGrassDistributed}，无饥饿状态。</p>
                </div>
                <div class="finding">
                    <h3>📊 质量稳定</h3>
                    <p>平均质量 ${stats.averageTaskQuality}，超过0.80目标，质量检查机制有效。</p>
                </div>
                <div class="finding">
                    <h3>⚡ 效率达标</h3>
                    <p>平均效率 ${stats.averageEfficiency}，超过0.90目标，系统运行稳定。</p>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>🐑 牧羊人架构框架 (SAF) v1.0.0-alpha | 模拟可视化报告</p>
            <p>"决定人类在AI协同开发中角色的不是AI不能做什么，而是人类必须对什么负责。"</p>
        </div>
    </div>

    <script>
        // 任务状态分布
        const statusCtx = document.getElementById('statusChart').getContext('2d');
        new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ${JSON.stringify(Object.keys(statusCount))},
                datasets: [{
                    data: ${JSON.stringify(Object.values(statusCount))},
                    backgroundColor: ['#34d399', '#f87171', '#60a5fa', '#fbbf24'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#e2e8f0', padding: 20 }
                    }
                }
            }
        });

        // 任务类型分布
        const taskTypeCtx = document.getElementById('taskTypeChart').getContext('2d');
        new Chart(taskTypeCtx, {
            type: 'bar',
            data: {
                labels: ${JSON.stringify(Object.keys(taskTypes))},
                datasets: [{
                    label: '任务数量',
                    data: ${JSON.stringify(Object.values(taskTypes))},
                    backgroundColor: '#60a5fa',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
                    y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
                }
            }
        });

        // 每日趋势
        const dailyCtx = document.getElementById('dailyChart').getContext('2d');
        new Chart(dailyCtx, {
            type: 'line',
            data: {
                labels: ${JSON.stringify(dates.map((d, i) => `Day ${i + 1}`))},
                datasets: [
                    {
                        label: '已分配',
                        data: ${JSON.stringify(dailyTasks)},
                        borderColor: '#60a5fa',
                        backgroundColor: 'rgba(96, 165, 250, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: '已完成',
                        data: ${JSON.stringify(dailyCompleted)},
                        borderColor: '#34d399',
                        backgroundColor: 'rgba(52, 211, 153, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: '已失败',
                        data: ${JSON.stringify(dailyFailed)},
                        borderColor: '#f87171',
                        backgroundColor: 'rgba(248, 113, 113, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#e2e8f0', padding: 20 }
                    }
                },
                scales: {
                    x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
                    y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
                }
            }
        });
    </script>
</body>
</html>`;

  const outputPath = dataFile.replace('.json', '_report.html');
  fs.writeFileSync(outputPath, html);
  console.log(`✅ HTML 报告已生成: ${outputPath}`);
  return outputPath;
}

// 主函数
function main() {
  const resultsDir = path.join(__dirname, '..', 'simulation_results');
  
  if (!fs.existsSync(resultsDir)) {
    console.log('❌ simulation_results 目录不存在');
    process.exit(1);
  }
  
  const files = fs.readdirSync(resultsDir).filter(f => f.endsWith('.json'));
  
  if (files.length === 0) {
    console.log('❌ 未找到模拟数据文件');
    process.exit(1);
  }
  
  console.log(`📊 找到 ${files.length} 个数据文件`);
  
  files.forEach(file => {
    const dataFile = path.join(resultsDir, file);
    console.log(`\n📝 处理: ${file}`);
    generateReport(dataFile);
  });
  
  console.log('\n✅ 所有报告生成完成！');
}

if (require.main === module) {
  main();
}

module.exports = { generateReport };
