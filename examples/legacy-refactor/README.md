# 示例：遗留系统重构

## 场景描述

使用 SAF 框架重构一个遗留的单体 Java 应用，将其迁移到现代微服务架构。

## 挑战

- 遗留代码缺乏文档和测试
- 业务逻辑耦合严重
- 数据库 schema 复杂
- 需要保持现有功能的同时进行重构

## 使用 SAF 的工作流程

### 1. 代码分析

```bash
# 首先分析现有代码库
curl -X POST http://localhost:3000/v1/tasks/delegate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "分析遗留系统代码",
    "description": "分析单体应用的代码结构、依赖关系、复杂度",
    "tags": ["analysis", "legacy", "refactoring"],
    "priority": 5
  }'
```

### 2. 风险评估

```bash
# 评估重构风险
curl -X POST http://localhost:3000/v1/tasks/delegate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "评估重构风险",
    "description": "评估数据迁移风险、业务中断风险、回滚策略",
    "tags": ["risk", "assessment", "architecture"],
    "priority": 5
  }'
```

### 3. 渐进式重构计划

战略层 Agent 生成重构计划：

```markdown
## 重构计划

### 阶段1：准备工作（2周）
- [ ] 补充单元测试（覆盖率 > 80%）
- [ ] 添加集成测试
- [ ] 建立 CI/CD 流水线

### 阶段2：提取核心服务（4周）
- [ ] 提取用户服务
- [ ] 提取订单服务
- [ ] 建立服务间通信

### 阶段3：数据迁移（2周）
- [ ] 数据库拆分
- [ ] 数据一致性验证
- [ ] 性能基准测试

### 阶段4：灰度发布（2周）
- [ ] 金丝雀部署
- [ ] 监控和告警
- [ ] 全量切换
```

### 4. 塑造环境约束

```bash
curl -X POST http://localhost:3000/v1/environment/shape \
  -H "Content-Type: application/json" \
  -d '{
    "action": "MODIFY_CONSTRAINT",
    "payload": {
      "id": "mod-001",
      "type": "ADD",
      "constraintType": "COMPLIANCE_RULE",
      "value": {
        "standard": "SOX",
        "requirement": "所有数据迁移必须有审计日志",
        "verificationMethod": "审计日志检查"
      },
      "effectiveFrom": "2026-06-01T00:00:00Z"
    }
  }'
```

## 70/30 法则的体现

**70% Agent Mode 工作：**
- 代码分析（复杂度、依赖关系）
- 测试生成（单元测试、集成测试）
- 文档生成（API 文档、架构文档）
- 部署脚本（Dockerfile、K8s YAML）
- 小计：14小时（70%）

**30% Copilot Mode 工作：**
- 服务边界划分（DDD 分析）
- 数据迁移策略（风险权衡）
- 回滚方案设计（业务连续性）
- 小计：6小时（30%）

## 关键决策点

| 决策 | 模式 | 原因 |
|------|------|------|
| 服务拆分边界 | Copilot | 需要业务专家知识 |
| 数据迁移策略 | Copilot | 涉及数据完整性风险 |
| 测试生成 | Agent | 高可验证性 |
| 部署脚本 | Agent | 低责任风险 |
| 回滚方案 | Copilot | 涉及业务连续性 |

## 重构后架构

```
legacy-system/
├── monolith/           # 原有单体（逐步下线）
├── user-service/       # 用户服务
├── order-service/      # 订单服务
├── payment-service/    # 支付服务
├── api-gateway/        # API 网关
└── event-bus/          # 事件总线
```

---

**返回示例列表**：[examples/README.md](../README.md)
