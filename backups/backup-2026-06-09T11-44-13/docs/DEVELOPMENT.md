# 开发指南
# 为 SAF 框架贡献代码的详细指南

## 开发环境设置

### 1. 克隆仓库
```bash
git clone https://github.com/shepherd-team/shepherd-architecture.git
cd shepherd-architecture
```

### 2. 安装依赖
```bash
npm install
```

### 3. 启动开发环境
```bash
# 启动数据库
docker-compose up -d mongo redis

# 启动开发服务器
npm run dev
```

### 4. 运行测试
```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- tests/core.test.ts

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监听模式
npm run test:watch
```

## 代码规范

### TypeScript 规范
- 使用严格模式 (`strict: true`)
- 所有函数必须明确返回类型
- 使用接口而非类型别名（优先）
- 避免使用 `any` 类型

### 代码风格
- 使用 Prettier 格式化代码
- 使用 ESLint 检查代码质量
- 提交前运行 `npm run lint`

```bash
# 格式化代码
npm run format

# 检查代码
npm run lint

# 自动修复
npm run lint:fix
```

## 项目结构指南

### 添加新 API 端点

1. 在 `src/api/server.ts` 中添加路由
2. 在 `src/api/middleware.ts` 中添加必要的中间件
3. 在 `tests/api.test.ts` 中添加测试

示例：
```typescript
// src/api/server.ts
const newRouter = Router();

newRouter.get('/endpoint', (req, res) => {
  res.json({ data: 'value' });
});

router.use('/new-resource', newRouter);
```

### 添加新 Agent 类型

1. 在 `src/agents/index.ts` 中继承 `Agent` 接口
2. 在 `AgentFactory` 中注册新类型

示例：
```typescript
class CustomAgent implements Agent {
  id: string;
  name: string;
  level = AgentLevel.TACTICAL;
  
  async execute(task: Task, env: EnvironmentState): Promise<ExecutionResult> {
    // 自定义执行逻辑
  }
}

// 在 AgentFactory 中注册
static create(type: string): Agent {
  switch (type) {
    case 'custom': return new CustomAgent();
    // ...
  }
}
```

### 添加新算法

1. 在 `src/core/algorithms.ts` 中实现算法
2. 导出算法函数
3. 在 `tests/core.test.ts` 中添加测试

示例：
```typescript
export class NewAlgorithm {
  execute(input: Input): Output {
    // 算法实现
  }
}
```

## 测试规范

### 测试文件命名
- 单元测试：`{module}.test.ts`
- 集成测试：`{module}.integration.test.ts`
- 端到端测试：`{feature}.e2e.test.ts`

### 测试结构
```typescript
describe('ModuleName', () => {
  describe('FunctionName', () => {
    it('should do something', () => {
      // Arrange
      const input = 'value';
      
      // Act
      const result = functionName(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### 测试覆盖率要求
- 核心算法：> 95%
- API 端点：> 90%
- 工具函数：> 80%

## 文档规范

### 代码注释
```typescript
/**
 * 函数描述
 * @param param1 参数1描述
 * @param param2 参数2描述
 * @returns 返回值描述
 */
function example(param1: string, param2: number): boolean {
  return true;
}
```

### 文档更新
- 添加新功能时更新 README.md
- 更新 API 文档（docs/API_DESIGN.md）
- 添加示例到 examples/ 目录

## 提交规范

### 提交信息格式
```
<type>(<scope>): <subject>

<body>

<footer>
```

### 类型
- `feat`: 新功能
- `fix`: 修复
- `docs`: 文档
- `style`: 格式（不影响代码运行）
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建过程或辅助工具变动

### 示例
```
feat(core): 添加新的委托评估算法

实现基于机器学习的委托可行性评估算法，
提高评估准确率。

Closes #123
```

## 发布流程

### 版本号规则
遵循语义化版本（SemVer）：
- `MAJOR.MINOR.PATCH`
- `1.0.0` - 初始版本
- `1.1.0` - 新增功能
- `1.1.1` - 修复 bug

### 发布步骤
1. 更新 CHANGELOG.md
2. 更新 package.json 版本号
3. 创建 Git 标签：`git tag v1.0.0`
4. 推送标签：`git push origin v1.0.0`
5. 创建 GitHub Release

## 调试技巧

### 使用 VS Code 调试
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "port": 9229
    }
  ]
}
```

### 日志调试
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

logger.debug('Debug message', { data: 'value' });
```

## 常见问题

### Q: 如何添加新的数据库支持？
A: 在 `src/common/database.ts` 中实现新的数据库连接类，遵循 `DatabaseConnection` 接口。

### Q: 如何添加新的 LLM 提供商？
A: 在 `src/common/llm.ts` 中实现 `LLMProvider` 接口，并在 `LLMProvider.createProvider()` 中注册。

### Q: 如何添加新的中间件？
A: 在 `src/api/middleware.ts` 中实现中间件函数，并在 `applyMiddleware()` 中注册。

---

**更多帮助**：查看 [CONTRIBUTING.md](../CONTRIBUTING.md) 和 [FAQ](FAQ.md)
