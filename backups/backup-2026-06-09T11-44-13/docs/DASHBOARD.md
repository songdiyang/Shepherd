# 牧羊人架构框架 - 监控面板

> 实时监控系统状态和性能指标

## 面板概述

监控面板提供直观的可视化界面，展示系统运行状态、任务进度、羊表现等关键指标。

## 启动面板

```bash
# 使用内置面板
shepherd dashboard --port 8080

# 或使用Docker
docker run -p 8080:8080 shepherd-dashboard
```

## 面板功能

### 1. 实时概览

显示系统核心指标：
- 活跃羊数量
- 待处理任务
- 今日完成任务
- 系统健康度
- 草奖励余额

### 2. 任务监控

实时任务状态：
- 任务队列
- 执行中任务
- 已完成任务
- 失败任务
- 平均质量

### 3. 羊表现

羊的实时状态：
- 活跃状态
- 当前任务
- 声望排名
- 草余额
- 效率指标

### 4. 牧羊犬管理

牧羊犬工作状态：
- 管理羊群
- 分配任务数
- 审查通过率
- 响应时间

### 5. 草奖励分布

激励可视化：
- 发放趋势
- 消耗趋势
- 余额分布
- 称号分布

### 6. 性能指标

系统性能：
- 响应时间
- 吞吐量
- 错误率
- 资源使用

## 面板截图

```
┌─────────────────────────────────────────┐
│  🐑 牧羊人架构框架监控面板              │
├─────────────────────────────────────────┤
│  活跃羊: 6    待处理: 12    今日完成: 23│
│  健康度: 98%  质量: 0.84  草余额: 7881 │
├─────────────────────────────────────────┤
│  📊 任务队列                            │
│  [████████░░░░░░░░░░] 50% 进行中       │
│  [████████████░░░░░░] 70% 已完成       │
│  [██░░░░░░░░░░░░░░░░] 10% 失败         │
├─────────────────────────────────────────┤
│  🏆 羊排行榜                            │
│  🥇 AI Frontend Dev  声望: 531        │
│  🥈 AI DevOps         声望: 421        │
│  🥉 Human Senior Dev  声望: 347        │
├─────────────────────────────────────────┤
│  🐕 牧羊犬状态                          │
│  AI Task Manager: 管理3只, 分配55任务  │
│  Human Inspector: 管理2只, 分配50任务  │
│  AI Security Guard: 管理2只, 分配55任务│
├─────────────────────────────────────────┤
│  🌱 草奖励分布                          │
│  发放: 131次  消耗: 89次  余额: 7881  │
│  [████████████████░░] 88% 满意度     │
└─────────────────────────────────────────┘
```

## 告警配置

### 告警规则

```yaml
alerts:
  - name: 低完成率
    condition: completion_rate < 70
    severity: warning
    action: notify_shepherd
    
  - name: 低质量
    condition: avg_quality < 0.7
    severity: critical
    action: notify_shepherd
    
  - name: 羊饥饿
    condition: sheep_grass < 20
    severity: warning
    action: notify_dog
    
  - name: 系统错误
    condition: error_rate > 5
    severity: critical
    action: notify_all
```

### 通知方式

- Webhook
- Email
- Slack
- Discord
- 短信

## 自定义面板

### 添加自定义图表

```javascript
// dashboard/custom-chart.js
import { Dashboard } from '@shepherd/dashboard';

const dashboard = new Dashboard();

dashboard.addChart({
  id: 'custom-chart',
  title: '自定义指标',
  type: 'line',
  data: async () => {
    const data = await fetch('/api/v1/custom-metrics');
    return data.json();
  },
  refreshInterval: 5000
});
```

### 自定义布局

```javascript
// dashboard/layout.js
export default {
  rows: [
    {
      columns: [
        { width: 6, component: 'overview' },
        { width: 6, component: 'performance' }
      ]
    },
    {
      columns: [
        { width: 4, component: 'sheep-ranking' },
        { width: 4, component: 'dog-status' },
        { width: 4, component: 'grass-distribution' }
      ]
    }
  ]
};
```

## 数据导出

### 导出报告

```bash
# 导出PDF
shepherd dashboard export --format pdf --period 30d

# 导出Excel
shepherd dashboard export --format xlsx --period 7d

# 导出JSON
shepherd dashboard export --format json --period 1d
```

### 报告内容

- 执行摘要
- 详细指标
- 趋势分析
- 异常报告
- 优化建议

## 历史数据

### 数据保留

```yaml
retention:
  real_time: 7 days
  metrics: 90 days
  logs: 1 year
  reports: 2 years
```

### 数据查询

```bash
# 查询历史数据
shepherd dashboard query \
  --metric completion_rate \
  --start 2026-06-01 \
  --end 2026-06-30 \
  --interval 1d
```

## 访问控制

### 权限配置

```yaml
roles:
  admin:
    - view_all
    - export_data
    - configure_alerts
    
  operator:
    - view_all
    - export_data
    
  viewer:
    - view_dashboard
    - view_reports
```

## 性能优化

### 面板优化

1. 数据缓存
2. 增量更新
3. 懒加载
4. 压缩传输

### 配置优化

```yaml
optimization:
  cache_ttl: 60
  batch_size: 100
  max_points: 1000
  compression: true
```

## 集成

### 第三方工具

- Grafana
- Prometheus
- Datadog
- New Relic
- Elastic

### 集成示例

```yaml
# config/monitoring.yaml
integrations:
  prometheus:
    enabled: true
    port: 9090
    metrics:
      - tasks_total
      - tasks_completed
      - sheep_efficiency
      - grass_granted
```

## 故障排除

### 常见问题

**Q: 面板加载慢**
A: 检查数据查询优化，增加缓存

**Q: 数据不更新**
A: 检查WebSocket连接，刷新页面

**Q: 告警不触发**
A: 检查告警规则配置，验证条件

**Q: 图表不显示**
A: 检查数据源配置，验证数据格式

---

**面板版本**: v1.0.0
**更新日期**: 2026-06-09
