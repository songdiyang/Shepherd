# 接口适配器模式

SAF 框架支持通过 Adapter 模式集成多种编程语言和开发工具。

## 支持的适配器

### 1. TypeScript/JavaScript Adapter (内置)
- 文件：`src/common/analyzer.ts`
- 功能：代码分析、复杂度计算、安全扫描
- 支持：`.ts`, `.js`, `.tsx`, `.jsx` 文件

### 2. Python Adapter (计划中)
- 功能：Python 代码分析、PEP8 检查、类型推断
- 支持：`.py`, `.pyi` 文件

### 3. Java Adapter (计划中)
- 功能：Java 代码分析、Maven/Gradle 构建
- 支持：`.java`, `.kt` 文件

### 4. Go Adapter (计划中)
- 功能：Go 代码分析、模块依赖分析
- 支持：`.go` 文件

### 5. Rust Adapter (计划中)
- 功能：Rust 代码分析、Cargo 构建
- 支持：`.rs` 文件

## 适配器接口定义

```typescript
interface LanguageAdapter {
  // 语言标识
  language: string;
  extensions: string[];
  
  // 代码分析
  analyze(filePath: string): Promise<CodeAnalysisResult>;
  
  // 复杂度计算
  calculateComplexity(filePath: string): Promise<ComplexityMetrics>;
  
  // 安全扫描
  securityScan(filePath: string): Promise<SecurityVulnerability[]>;
  
  // 代码格式化
  format(filePath: string): Promise<string>;
  
  // 测试运行
  runTests(projectPath: string): Promise<TestResult>;
  
  // 构建
  build(projectPath: string): Promise<BuildResult>;
}
```

## 使用示例

```typescript
import { LanguageAdapterFactory } from './adapters';

const adapter = LanguageAdapterFactory.create('typescript');
const result = await adapter.analyze('src/core/models.ts');

console.log(result.complexity);
console.log(result.vulnerabilities);
```

## 添加新适配器

1. 创建适配器文件：`src/adapters/{language}.ts`
2. 实现 `LanguageAdapter` 接口
3. 注册到 `LanguageAdapterFactory`

```typescript
class PythonAdapter implements LanguageAdapter {
  language = 'python';
  extensions = ['.py', '.pyi'];
  
  async analyze(filePath: string): Promise<CodeAnalysisResult> {
    // 调用 Python 分析工具
    const result = await exec(`pylint ${filePath}`);
    return parsePylintOutput(result);
  }
  
  // ... 其他方法
}
```

## 当前状态

| 语言 | 状态 | 优先级 |
|------|------|--------|
| TypeScript | ✅ 已完成 | 高 |
| Python | 🚧 计划中 | 高 |
| Java | 📝 待开发 | 中 |
| Go | 📝 待开发 | 中 |
| Rust | 📝 待开发 | 低 |

---

**贡献指南**：欢迎提交新的语言适配器 PR！
