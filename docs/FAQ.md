# FAQ - 常见问题解答

## 1. SAF 框架是什么？

**Shepherd Architecture Framework (SAF)** 是一个基于分布式认知理论、委托-代理理论和活动理论的人机协同软件开发架构框架。它将人类开发者从"编码执行者"重新定义为"AI团队的协调者"（牧羊人），通过系统化的理论框架指导人机协作。

## 2. 为什么叫"牧羊人架构"？

类比牧羊人与羊群的关系：
- **牧羊人不亲自吃草** → 人类不亲自编写每一行代码
- **牧羊人决定羊群去向** → 人类决定AI做什么、怎么做、做到什么标准
- **牧羊人保护羊群** → 人类设定边界、监控质量、承担责任

这一比喻的核心洞察来自Napolitano等人（2007）对"牧羊人控制问题"的分析：目标群体的涌现行为必须通过控制牧羊者群体的涌现行为来实现。

## 3. 70/30法则是什么意思？

**70% 可委托给AI：** 编码任务、单元测试、文档生成等具有高可验证性和低责任风险的任务。

**30% 不可替代（人类保留）：** 架构决策、需求理解、质量把关、伦理判断等涉及不可逆选择和责任归属的任务。

**关键洞察：** 这30%不是因为AI技术不够，而是因为法律责任、伦理判断和业务最终责任只能由人类承担。

## 4. Agent Mode 和 Copilot Mode 有什么区别？

| 维度 | Agent Mode | Copilot Mode |
|------|-----------|--------------|
| **协作方式** | AI自主执行 | 人机同步协作 |
| **人类角色** | 设定边界、抽查审计 | 同步决策、最终把关 |
| **适用场景** | 高可验证性、低风险 | 低可验证性、高风险 |
| **典型任务** | 代码生成、单元测试 | 架构决策、安全审计 |
| **责任归属** | 通过审计追踪实现 | 人类直接承担 |

## 5. SAF 框架与现有工具（如GitHub Copilot、Claude Code）的关系？

SAF 是**框架**而非**工具**：
- **GitHub Copilot** → 提供代码补全能力（工具层）
- **Claude Code** → 提供自主编码能力（Agent层）
- **SAF** → 定义人机协作的架构和规则（框架层）

SAF 可以整合这些工具，为它们提供协作模式选择、责任归属管理和审计追踪能力。

## 6. 如何开始使用 SAF？

```bash
# 1. 安装
git clone https://github.com/shepherd-team/shepherd-architecture.git
cd shepherd-architecture
npm install

# 2. 启动服务
docker-compose up -d
npm run dev

# 3. 访问控制台
open http://localhost:3000/console.html

# 4. 委托第一个任务
curl -X POST http://localhost:3000/v1/system/init \
  -H "Content-Type: application/json" \
  -d '{"humanName": "张三", "humanRole": "Tech Lead"}'
```

## 7. SAF 支持哪些编程语言？

当前框架本身使用 **TypeScript/Node.js** 实现，但设计上支持多语言：
- 通过 **Adapter 模式** 支持 Java、Python、Go、Rust 等
- 代码分析工具支持 `.ts`, `.js`, `.tsx`, `.jsx` 文件
- 未来计划添加更多语言支持

## 8. 如何保证安全？

SAF 内置多层安全机制：
1. **沙箱执行**：Agent 代码在隔离环境中运行
2. **代码门禁**：所有AI生成代码必须通过静态分析、安全扫描
3. **审计追踪**：不可篡改的哈希链审计日志
4. **责任归属**：所有决策关联到人类监督者
5. **干预策略**：异常时自动触发人类介入

## 9. 委托鸿沟是什么？

**委托鸿沟**（Delegation Gap）衡量从"AI辅助"到"完全委托"的认知距离和信任距离。

即使AI技术能力趋近100%，委托鸿沟也不会完全消失，因为：
- 信任建立需要时间
- 责任归属不可转移
- 组织治理机制不完善

## 10. SAF 适用于什么场景？

**适用场景：**
- 企业级应用软件开发
- 需要人机协作的复杂系统
- 存在法律责任和合规要求的项目
- 多智能体协同开发环境

**不适用场景（需要调整）：**
- 安全攸关系统（航空、医疗）：委托阈值需大幅降低
- 实时嵌入式系统：时间约束可能限制AI自主决策
- 纯AI生成项目（无人类参与）：框架退化为纯MAS架构

## 11. 如何贡献代码？

欢迎贡献！请：
1. Fork 仓库
2. 创建特性分支 (`git checkout -b feat/xxx`)
3. 提交变更 (`git commit -m 'feat: xxx'`)
4. 推送分支 (`git push origin feat/xxx`)
5. 创建 Pull Request

详见 [CONTRIBUTING.md](CONTRIBUTING.md)

## 12. 论文在哪里？

完整论文位于 `docs/THESIS.md`，包含：
- 摘要
- 引言（背景、研究问题、贡献）
- 文献综述（AI能力、多Agent、人机协作）
- 理论框架（三重理论支柱）
- 研究方法（系统性文献综述、多理论编码）
- 研究发现（三大命题的验证）
- 讨论（理论贡献、实践启示、局限性）
- 结论与展望

## 13. 如何接入真实 LLM？

在 `.env` 文件中配置：

```env
# 选择提供商：mock | anthropic | openai
LLM_PROVIDER=anthropic
LLM_MODEL=claude-3-sonnet
ANTHROPIC_API_KEY=your-api-key-here
```

当前默认使用 **Mock Provider**（模拟实现），无需 API Key 即可运行。

## 14. 如何部署到生产环境？

**推荐方式：Docker Compose**

```bash
docker-compose up -d
```

**Kubernetes：**

```bash
kubectl apply -f k8s/
```

详见 [部署指南](docs/DEPLOYMENT.md)

## 15. 如何联系团队？

- 项目仓库：https://github.com/shepherd-team/shepherd-architecture
- 讨论区：https://github.com/shepherd-team/shepherd-architecture/discussions
- 邮箱：support@shepherd.local

---

**更多问题？** 请提交 Issue 或加入讨论区。
