# 示例项目列表

SAF 框架提供多个示例项目，展示不同场景下的人机协作模式。

## 示例列表

### 1. 用户管理系统
- **路径**：`examples/user-management/`
- **场景**：典型的 CRUD 应用开发
- **重点**：展示基本的任务委托、审批、代码生成流程
- **技术栈**：Node.js + TypeScript + Express

### 2. 微服务架构设计
- **路径**：`examples/microservices/`
- **场景**：微服务拆分和架构设计
- **重点**：战略层决策、服务边界划分、通信协议设计
- **技术栈**：gRPC + Kafka + Docker

### 3. 遗留系统重构
- **路径**：`examples/legacy-refactor/`
- **场景**：从单体架构迁移到微服务
- **重点**：代码分析、风险评估、渐进式重构
- **技术栈**：Java + Spring Boot + Docker

### 4. AI 功能集成
- **路径**：`examples/ai-integration/`
- **场景**：在现有系统中集成 AI 能力
- **重点**：API 设计、模型集成、性能优化
- **技术栈**：Python + FastAPI + PyTorch

## 快速开始

每个示例都包含完整的操作步骤：
1. 初始化系统
2. 委托任务
3. 审批方案
4. 查看执行结果

## 贡献示例

欢迎提交新的示例项目！请遵循以下规范：
1. 创建 `examples/{example-name}/` 目录
2. 编写 `README.md` 说明场景和步骤
3. 提供可运行的代码和配置

---

**返回主文档**：[README.md](../../README.md)
