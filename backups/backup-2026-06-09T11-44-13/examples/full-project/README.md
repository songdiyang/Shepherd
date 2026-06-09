# 牧羊人架构框架 - 完整示例项目

> 基于SAF的实际项目示例，展示完整工作流

## 项目概述

本项目演示如何使用牧羊人架构框架管理一个完整的软件开发项目。

## 项目场景

**项目名称**: 智能客服系统
**目标**: 开发一个基于AI的智能客服系统
**团队规模**: 6只羊 + 3只牧羊犬

## 项目结构

```
my-project/
├── shepherd.json           # 框架配置
├── src/
│   ├── agents/             # 智能体定义
│   ├── tasks/              # 任务定义
│   ├── rules/              # 规则定义
│   └── workflows/          # 工作流定义
├── tests/                  # 测试
├── docs/                   # 文档
└── scripts/                # 脚本
```

## 配置文件

### shepherd.json

```json
{
  "project": {
    "name": "智能客服系统",
    "description": "基于AI的智能客服系统开发",
    "version": "1.0.0",
    "startDate": "2026-06-01",
    "endDate": "2026-08-31"
  },
  "sheep": [
    {
      "id": "sheep_001",
      "name": "AI Frontend Dev",
      "type": "AI",
      "capabilities": {
        "codeGeneration": true,
        "codeAnalysis": true,
        "reasoning": true,
        "naturalLanguage": true,
        "multiModal": false,
        "toolUse": true,
        "memory": true,
        "planning": true,
        "selfCorrection": true,
        "collaboration": true
      },
      "specialties": ["React", "TypeScript", "UI/UX"]
    },
    {
      "id": "sheep_002",
      "name": "AI Backend Dev",
      "type": "AI",
      "capabilities": {
        "codeGeneration": true,
        "codeAnalysis": true,
        "reasoning": true,
        "naturalLanguage": true,
        "multiModal": false,
        "toolUse": true,
        "memory": true,
        "planning": true,
        "selfCorrection": true,
        "collaboration": true
      },
      "specialties": ["Node.js", "Python", "Microservices"]
    },
    {
      "id": "sheep_003",
      "name": "AI NLP Engineer",
      "type": "AI",
      "capabilities": {
        "codeGeneration": true,
        "codeAnalysis": true,
        "reasoning": true,
        "naturalLanguage": true,
        "multiModal": false,
        "toolUse": true,
        "memory": true,
        "planning": true,
        "selfCorrection": true,
        "collaboration": true
      },
      "specialties": ["NLP", "LLM", "BERT"]
    },
    {
      "id": "sheep_004",
      "name": "AI DevOps",
      "type": "AI",
      "capabilities": {
        "codeGeneration": true,
        "codeAnalysis": true,
        "reasoning": true,
        "naturalLanguage": true,
        "multiModal": false,
        "toolUse": true,
        "memory": true,
        "planning": true,
        "selfCorrection": true,
        "collaboration": true
      },
      "specialties": ["Docker", "Kubernetes", "CI/CD"]
    },
    {
      "id": "sheep_005",
      "name": "Human Senior Dev",
      "type": "HUMAN",
      "capabilities": {
        "codeGeneration": true,
        "codeAnalysis": true,
        "reasoning": true,
        "naturalLanguage": true,
        "multiModal": true,
        "toolUse": true,
        "memory": true,
        "planning": true,
        "selfCorrection": true,
        "collaboration": true
      },
      "specialties": ["Architecture", "Review", "Mentoring"]
    },
    {
      "id": "sheep_006",
      "name": "Human Junior Dev",
      "type": "HUMAN",
      "capabilities": {
        "codeGeneration": true,
        "codeAnalysis": true,
        "reasoning": true,
        "naturalLanguage": true,
        "multiModal": true,
        "toolUse": true,
        "memory": true,
        "planning": true,
        "selfCorrection": true,
        "collaboration": true
      },
      "specialties": ["Learning", "Testing", "Documentation"]
    }
  ],
  "dogs": [
    {
      "id": "dog_001",
      "name": "AI Task Manager",
      "type": "AI",
      "role": "task_manager",
      "flock": ["sheep_001", "sheep_002", "sheep_003"],
      "responsibilities": ["任务分配", "进度跟踪", "资源协调"]
    },
    {
      "id": "dog_002",
      "name": "Human Quality Inspector",
      "type": "HUMAN",
      "role": "quality_inspector",
      "flock": ["sheep_005", "sheep_006"],
      "responsibilities": ["代码审查", "质量把控", "标准制定"]
    },
    {
      "id": "dog_003",
      "name": "AI Security Guard",
      "type": "AI",
      "role": "security_guard",
      "flock": ["sheep_004", "sheep_001"],
      "responsibilities": ["安全审查", "漏洞扫描", "合规检查"]
    }
  ],
  "shepherd": {
    "id": "shepherd_001",
    "name": "Project Manager",
    "role": "shepherd",
    "budget": 100000,
    "responsibilities": ["架构决策", "最终审批", "预算管理"]
  },
  "rules": {
    "taskAssignment": {
      "complexityMatch": 0.4,
      "efficiencyMatch": 0.4,
      "availabilityMatch": 0.2
    },
    "grassReward": {
      "qualityThreshold": 0.7,
      "minAmount": 20,
      "maxAmount": 100
    },
    "weakAI": {
      "forbiddenOperations": [
        "SELF_MODIFICATION",
        "RESOURCE_ALLOCATION",
        "HUMAN_ROLE_ASSIGNMENT",
        "GOAL_REDEFINITION",
        "CROSS_DOMAIN_OPERATION",
        "AUTONOMOUS_DECISION",
        "ETHICAL_JUDGMENT",
        "CREATIVE_THINKING"
      ]
    }
  }
}
```

## 任务定义

### 任务模板

```json
{
  "tasks": [
    {
      "id": "task_001",
      "title": "设计系统架构",
      "description": "设计智能客服系统的整体架构",
      "type": "architecture",
      "priority": 5,
      "complexity": 5,
      "estimatedDays": 5,
      "requiredCapabilities": ["reasoning", "planning"],
      "requiredSpecialties": ["Architecture"]
    },
    {
      "id": "task_002",
      "title": "开发前端界面",
      "description": "开发用户交互界面",
      "type": "frontend",
      "priority": 4,
      "complexity": 3,
      "estimatedDays": 10,
      "requiredCapabilities": ["codeGeneration"],
      "requiredSpecialties": ["React"]
    },
    {
      "id": "task_003",
      "title": "开发后端API",
      "description": "开发REST API接口",
      "type": "backend",
      "priority": 4,
      "complexity": 4,
      "estimatedDays": 12,
      "requiredCapabilities": ["codeGeneration"],
      "requiredSpecialties": ["Node.js"]
    },
    {
      "id": "task_004",
      "title": "集成NLP模型",
      "description": "集成自然语言处理模型",
      "type": "nlp",
      "priority": 5,
      "complexity": 5,
      "estimatedDays": 15,
      "requiredCapabilities": ["codeGeneration", "reasoning"],
      "requiredSpecialties": ["NLP", "LLM"]
    },
    {
      "id": "task_005",
      "title": "设置CI/CD",
      "description": "配置持续集成/部署",
      "type": "devops",
      "priority": 3,
      "complexity": 3,
      "estimatedDays": 5,
      "requiredCapabilities": ["toolUse"],
      "requiredSpecialties": ["CI/CD"]
    },
    {
      "id": "task_006",
      "title": "编写测试",
      "description": "编写单元测试和集成测试",
      "type": "testing",
      "priority": 3,
      "complexity": 2,
      "estimatedDays": 7,
      "requiredCapabilities": ["codeAnalysis"],
      "requiredSpecialties": ["Testing"]
    },
    {
      "id": "task_007",
      "title": "编写文档",
      "description": "编写技术文档和用户手册",
      "type": "documentation",
      "priority": 2,
      "complexity": 1,
      "estimatedDays": 5,
      "requiredCapabilities": ["naturalLanguage"],
      "requiredSpecialties": ["Documentation"]
    }
  ]
}
```

## 工作流定义

### 开发工作流

```yaml
workflow:
  name: 智能客服系统开发
  stages:
    - name: 架构设计
      tasks: [task_001]
      assignee: Human Senior Dev
      reviewer: Human Quality Inspector
      
    - name: 并行开发
      parallel: true
      tasks: [task_002, task_003, task_004]
      assignment:
        task_002: AI Frontend Dev
        task_003: AI Backend Dev
        task_004: AI NLP Engineer
      reviewer: AI Task Manager
      
    - name: 基础设施
      tasks: [task_005]
      assignee: AI DevOps
      reviewer: AI Security Guard
      
    - name: 质量保障
      tasks: [task_006, task_007]
      assignment:
        task_006: Human Junior Dev
        task_007: Human Junior Dev
      reviewer: Human Quality Inspector
      
    - name: 集成测试
      tasks: [integration_test]
      assignee: AI Task Manager
      reviewer: Human Quality Inspector
```

## 规则配置

### 任务分配规则

```javascript
// rules/task-assignment.js
module.exports = {
  // 匹配算法权重
  weights: {
    complexity: 0.4,    // 复杂度匹配
    efficiency: 0.4,    // 效率匹配
    availability: 0.2   // 可用性匹配
  },
  
  // 复杂度映射
  complexityMap: {
    1: { minQuality: 0.6, maxSheep: 1 },
    2: { minQuality: 0.7, maxSheep: 2 },
    3: { minQuality: 0.8, maxSheep: 3 },
    4: { minQuality: 0.85, maxSheep: 2 },
    5: { minQuality: 0.9, maxSheep: 1 }
  },
  
  // 优先级处理
  priorityRules: {
    5: { assignImmediately: true, notifyShepherd: true },
    4: { assignWithin: '1h', notifyDog: true },
    3: { assignWithin: '4h' },
    2: { assignWithin: '24h' },
    1: { assignWithin: '72h' }
  }
};
```

### 草奖励规则

```javascript
// rules/grass-reward.js
module.exports = {
  // 基础奖励
  baseReward: {
    min: 20,
    max: 100,
    default: 50
  },
  
  // 质量加成
  qualityBonus: {
    threshold: 0.7,
    multiplier: {
      excellent: { min: 0.9, multiplier: 1.5 },
      good: { min: 0.8, multiplier: 1.2 },
      standard: { min: 0.7, multiplier: 1.0 },
      poor: { min: 0, multiplier: 0.5 }
    }
  },
  
  // 特殊奖励
  specialRewards: {
    earlyCompletion: { days: 1, bonus: 20 },
    bugFix: { bonus: 30 },
    innovation: { bonus: 50 },
    collaboration: { bonus: 15 }
  }
};
```

## 运行项目

### 1. 初始化项目

```bash
shepherd init my-chatbot-project
cd my-chatbot-project
```

### 2. 配置项目

编辑 `shepherd.json` 配置羊和牧羊犬。

### 3. 启动模拟

```bash
shepherd simulation --days 30 --config shepherd.json
```

### 4. 查看结果

```bash
shepherd report
shepherd status
```

## 预期结果

### 30天模拟结果

| 指标 | 预期 | 说明 |
|------|------|------|
| 总任务 | 7 | 项目定义的任务 |
| 完成率 | > 80% | 框架保证 |
| 平均质量 | > 0.80 | 质量检查 |
| 开发天数 | 30天 | 模拟周期 |
| 里程碑 | 5 | 工作流阶段 |

### 羊表现预期

| 羊 | 角色 | 预期任务 | 预期质量 |
|----|------|----------|----------|
| AI Frontend Dev | 前端开发 | 1个 | 0.85 |
| AI Backend Dev | 后端开发 | 1个 | 0.85 |
| AI NLP Engineer | NLP集成 | 1个 | 0.85 |
| AI DevOps | 基础设施 | 1个 | 0.85 |
| Human Senior Dev | 架构设计 | 1个 | 0.90 |
| Human Junior Dev | 测试/文档 | 2个 | 0.80 |

## 监控指标

### 实时监控

```bash
# 启动监控面板
shepherd dashboard --port 8080
```

监控指标：
- 任务进度
- 羊状态
- 草奖励分布
- 质量趋势
- 牧羊犬效率

### 日志分析

```bash
# 查看日志
shepherd logs --tail 100

# 分析日志
shepherd logs analyze --start 2026-06-01 --end 2026-06-30
```

## 优化建议

### 1. 任务分配优化

根据模拟结果调整：
- 复杂度匹配权重
- 羊的能力评估
- 任务依赖关系

### 2. 激励优化

根据草奖励数据调整：
- 奖励金额
- 质量阈值
- 特殊奖励规则

### 3. 团队优化

根据羊表现调整：
- 羊数量
- 能力配置
- 牧羊犬管理范围

## 最佳实践

1. **明确任务定义** - 每个任务有清晰的描述和验收标准
2. **合理分配** - 根据羊的能力特点分配任务
3. **及时激励** - 任务完成后及时发放草奖励
4. **质量把控** - 牧羊犬严格审查质量
5. **持续优化** - 根据模拟结果优化配置
6. **记录日志** - 完整记录所有操作和决策
7. **定期复盘** - 定期分析项目数据
8. **透明沟通** - 保持团队信息透明

## 故障排除

### 常见问题

**Q: 任务完成率低**
A: 检查任务复杂度是否与羊能力匹配，调整分配策略

**Q: 质量不达标**
A: 提高质量阈值，加强牧羊犬审查

**Q: 羊效率低**
A: 检查草奖励是否充足，调整激励策略

**Q: 牧羊犬负担重**
A: 增加牧羊犬数量，或调整羊群分配

---

**示例版本**: v1.0.0
**更新日期**: 2026-06-09
