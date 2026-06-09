# 牧羊人架构框架 - 插件开发指南

> 扩展框架功能，创建自定义插件

## 插件概述

插件是扩展牧羊人架构框架功能的标准方式。通过插件，可以：
- 添加新的AI能力
- 自定义任务类型
- 扩展草奖励机制
- 集成外部系统
- 添加自定义分析器

## 插件结构

```
my-plugin/
├── package.json
├── src/
│   ├── index.ts
│   ├── hooks.ts
│   └── handlers.ts
├── README.md
└── shepherd-plugin.json
```

## 插件配置

### shepherd-plugin.json

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My custom plugin",
  "author": "Your Name",
  "license": "MIT",
  "main": "src/index.ts",
  "hooks": {
    "onTaskCreate": "src/hooks.ts",
    "onTaskComplete": "src/hooks.ts"
  },
  "capabilities": {
    "codeGeneration": true,
    "codeAnalysis": false,
    "customTaskType": true
  }
}
```

### package.json

```json
{
  "name": "shepherd-plugin-my-plugin",
  "version": "1.0.0",
  "dependencies": {
    "@shepherd/core": "^1.0.0"
  }
}
```

## 插件开发

### 基础插件

```typescript
// src/index.ts
import { ShepherdPlugin, PluginContext } from '@shepherd/core';

export default class MyPlugin implements ShepherdPlugin {
  name = 'my-plugin';
  version = '1.0.0';

  async init(context: PluginContext) {
    console.log('Plugin initialized');
    
    // 注册钩子
    context.registerHook('task:create', this.onTaskCreate);
    context.registerHook('task:complete', this.onTaskComplete);
    context.registerHook('sheep:execute', this.onSheepExecute);
    
    // 注册命令
    context.registerCommand('my-command', this.handleCommand);
  }

  async onTaskCreate(task: Task) {
    console.log(`Task created: ${task.title}`);
    // 自定义逻辑
  }

  async onTaskComplete(task: Task, result: ExecutionResult) {
    console.log(`Task completed: ${task.title} with quality ${result.quality}`);
    // 自定义逻辑
  }

  async onSheepExecute(sheep: Sheep, task: Task) {
    console.log(`Sheep ${sheep.name} executing task ${task.title}`);
    // 自定义逻辑
  }

  async handleCommand(args: any) {
    console.log('Command executed:', args);
    return { success: true };
  }
}
```

### 自定义任务类型

```typescript
// src/custom-task.ts
import { TaskType, TaskDefinition } from '@shepherd/core';

export const CustomTaskType: TaskDefinition = {
  name: 'security-audit',
  displayName: 'Security Audit',
  description: 'Perform security audit on code',
  
  // 验证任务参数
  validate(params: any) {
    return {
      valid: params.target !== undefined,
      errors: params.target ? [] : ['target is required']
    };
  },
  
  // 执行逻辑
  async execute(context: TaskContext) {
    const { target } = context.params;
    
    // 执行安全审计
    const vulnerabilities = await scanForVulnerabilities(target);
    
    return {
      success: vulnerabilities.length === 0,
      quality: vulnerabilities.length === 0 ? 1.0 : 0.5,
      result: {
        vulnerabilities,
        score: 100 - vulnerabilities.length * 10
      }
    };
  }
};
```

### 自定义草奖励规则

```typescript
// src/grass-rules.ts
import { GrassRule, GrassContext } from '@shepherd/core';

export const SecurityBonusRule: GrassRule = {
  name: 'security-bonus',
  description: 'Bonus for finding security issues',
  
  async evaluate(context: GrassContext) {
    const { task, result, sheep } = context;
    
    if (task.type === 'security-audit' && result.vulnerabilities?.length > 0) {
      return {
        applicable: true,
        amount: result.vulnerabilities.length * 50,
        quality: 1.2,
        reason: `Found ${result.vulnerabilities.length} vulnerabilities`
      };
    }
    
    return { applicable: false };
  }
};
```

### 自定义分析器

```typescript
// src/analyzer.ts
import { CodeAnalyzer, AnalysisResult } from '@shepherd/core';

export class CustomAnalyzer implements CodeAnalyzer {
  name = 'custom-analyzer';
  
  async analyze(code: string): Promise<AnalysisResult> {
    // 自定义分析逻辑
    const issues = [];
    
    // 检查自定义规则
    if (code.includes('eval(')) {
      issues.push({
        severity: 'critical',
        message: 'Use of eval() detected',
        line: this.findLine(code, 'eval(')
      });
    }
    
    return {
      issues,
      score: 100 - issues.length * 20,
      complexity: this.calculateComplexity(code),
      quality: this.assessQuality(code)
    };
  }
  
  private findLine(code: string, pattern: string): number {
    const lines = code.split('\n');
    return lines.findIndex(line => line.includes(pattern)) + 1;
  }
  
  private calculateComplexity(code: string): number {
    // 自定义复杂度计算
    return 1;
  }
  
  private assessQuality(code: string): number {
    // 自定义质量评估
    return 0.85;
  }
}
```

## 插件安装

### 本地安装

```bash
# 复制到插件目录
cp -r my-plugin ./plugins/

# 重启服务
npm restart
```

### 从npm安装

```bash
npm install shepherd-plugin-my-plugin
```

### 配置文件

```yaml
# config/plugins.yaml
plugins:
  - name: my-plugin
    version: 1.0.0
    enabled: true
    config:
      customSetting: value
```

## 插件生命周期

### 1. 加载

```typescript
async load() {
  // 加载插件代码
  // 验证依赖
  // 检查兼容性
}
```

### 2. 初始化

```typescript
async init(context: PluginContext) {
  // 注册钩子
  // 注册命令
  // 初始化资源
}
```

### 3. 启用

```typescript
async enable() {
  // 启用插件功能
  // 启动后台任务
}
```

### 4. 禁用

```typescript
async disable() {
  // 禁用插件功能
  // 停止后台任务
}
```

### 5. 卸载

```typescript
async unload() {
  // 清理资源
  // 注销钩子
  // 删除配置
}
```

## 钩子系统

### 可用钩子

| 钩子 | 触发时机 | 参数 |
|------|----------|------|
| `task:create` | 任务创建时 | `task: Task` |
| `task:assign` | 任务分配时 | `task: Task, sheep: Sheep` |
| `task:execute` | 任务执行时 | `task: Task, sheep: Sheep` |
| `task:complete` | 任务完成时 | `task: Task, result: Result` |
| `task:fail` | 任务失败时 | `task: Task, error: Error` |
| `sheep:register` | 羊注册时 | `sheep: Sheep` |
| `sheep:execute` | 羊执行时 | `sheep: Sheep, task: Task` |
| `sheep:status` | 状态变更时 | `sheep: Sheep, status: Status` |
| `dog:register` | 牧羊犬注册时 | `dog: Dog` |
| `dog:assign` | 牧羊犬分配时 | `dog: Dog, task: Task` |
| `dog:review` | 牧羊犬审查时 | `dog: Dog, task: Task` |
| `grass:grant` | 草奖励时 | `sheep: Sheep, amount: number` |
| `grass:consume` | 草消耗时 | `sheep: Sheep, amount: number` |
| `simulation:start` | 模拟开始时 | `config: SimulationConfig` |
| `simulation:end` | 模拟结束时 | `results: SimulationResults` |

### 钩子示例

```typescript
// 发送通知
context.registerHook('task:complete', async (task, result) => {
  if (result.quality < 0.7) {
    await sendNotification({
      type: 'low_quality',
      task: task.id,
      quality: result.quality
    });
  }
});

// 自动重试
context.registerHook('task:fail', async (task, error) => {
  if (task.retryCount < 3) {
    await retryTask(task);
  }
});
```

## 插件配置

### 配置文件

```typescript
// config.ts
export interface MyPluginConfig {
  webhookUrl: string;
  notifyOnSuccess: boolean;
  notifyOnFailure: boolean;
  qualityThreshold: number;
}

export const defaultConfig: MyPluginConfig = {
  webhookUrl: '',
  notifyOnSuccess: true,
  notifyOnFailure: true,
  qualityThreshold: 0.7
};
```

### 配置验证

```typescript
import { validateConfig } from '@shepherd/core';

const config = validateConfig({
  schema: {
    webhookUrl: { type: 'string', required: true },
    notifyOnSuccess: { type: 'boolean', default: true },
    qualityThreshold: { type: 'number', min: 0, max: 1, default: 0.7 }
  },
  config: userConfig
});
```

## 插件测试

### 单元测试

```typescript
// test/plugin.test.ts
import { MyPlugin } from '../src';
import { MockContext } from '@shepherd/test-utils';

describe('MyPlugin', () => {
  let plugin: MyPlugin;
  let context: MockContext;

  beforeEach(() => {
    context = new MockContext();
    plugin = new MyPlugin();
  });

  test('should initialize', async () => {
    await plugin.init(context);
    expect(context.hooks).toHaveLength(3);
  });

  test('should handle task creation', async () => {
    const task = { id: 'task_1', title: 'Test' };
    await plugin.onTaskCreate(task);
    expect(context.logs).toContain('Task created: Test');
  });
});
```

### 集成测试

```typescript
// test/integration.test.ts
import { ShepherdFramework } from '@shepherd/core';
import MyPlugin from '../src';

describe('Integration', () => {
  let framework: ShepherdFramework;

  beforeEach(async () => {
    framework = new ShepherdFramework();
    await framework.loadPlugin(MyPlugin);
  });

  test('should complete workflow', async () => {
    const task = await framework.createTask({
      title: 'Test task',
      priority: 3
    });

    const sheep = await framework.createSheep({
      name: 'Test Sheep',
      type: 'AI'
    });

    const result = await framework.executeTask(task.id, sheep.id);
    expect(result.success).toBe(true);
  });
});
```

## 插件示例

### 完整示例

```typescript
// src/index.ts
import { ShepherdPlugin, PluginContext, Task, Sheep } from '@shepherd/core';

export default class NotificationPlugin implements ShepherdPlugin {
  name = 'notification';
  version = '1.0.0';
  config: any;

  async init(context: PluginContext) {
    this.config = context.config;
    
    context.registerHook('task:complete', this.onTaskComplete.bind(this));
    context.registerHook('task:fail', this.onTaskFail.bind(this));
    context.registerHook('sheep:status', this.onSheepStatus.bind(this));
  }

  async onTaskComplete(task: Task, result: any) {
    if (this.config.notifyOnSuccess) {
      await this.sendNotification({
        type: 'success',
        message: `Task ${task.title} completed with quality ${result.quality}`,
        task: task.id
      });
    }
  }

  async onTaskFail(task: Task, error: Error) {
    if (this.config.notifyOnFailure) {
      await this.sendNotification({
        type: 'error',
        message: `Task ${task.title} failed: ${error.message}`,
        task: task.id
      });
    }
  }

  async onSheepStatus(sheep: Sheep, status: string) {
    if (status === 'error') {
      await this.sendNotification({
        type: 'warning',
        message: `Sheep ${sheep.name} encountered an error`,
        sheep: sheep.id
      });
    }
  }

  private async sendNotification(data: any) {
    if (this.config.webhookUrl) {
      await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
  }
}
```

## 插件发布

### 发布到npm

```bash
# 构建
npm run build

# 测试
npm test

# 发布
npm publish
```

### 发布到插件市场

```bash
# 打包
npm run package

# 上传
npx shepherd-plugin publish ./my-plugin-1.0.0.tgz
```

## 最佳实践

1. **单一职责** - 每个插件只做一件事
2. **错误处理** - 妥善处理所有错误
3. **配置验证** - 验证所有配置
4. **日志记录** - 记录关键操作
5. **资源清理** - 卸载时清理资源
6. **版本兼容** - 明确版本兼容性
7. **文档完善** - 提供完整文档
8. **测试覆盖** - 保持高测试覆盖率

---

**插件开发指南版本**: v1.0.0
**更新日期**: 2026-06-09
