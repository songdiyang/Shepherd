# 牧羊人架构框架 (SAF)

> 🐑 人机协同软件开发架构框架

---

## 项目徽章

![Version](https://img.shields.io/badge/version-1.0.0--alpha-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Files](https://img.shields.io/badge/files-137-orange)
![Docs](https://img.shields.io/badge/docs-44-lightgrey)
![Growth](https://img.shields.io/badge/growth-+174%25-brightgreen)
![Code](https://img.shields.io/badge/code-15.0K-blueviolet)
![API](https://img.shields.io/badge/API-DeepSeek-blueviolet)

---

## 核心特性

- 🐑 **三种角色** - 羊（AI执行）、牧羊犬（AI监督）、牧羊人（人类决策）
- 🎯 **70/30法则** - 70%委托给AI，30%人类保留
- 🎮 **草奖励模型** - 激励AI提高质量，惩罚失败
- 🔒 **14项安全限制** - 确保AI不会失控
- 📊 **实验验证** - 4个大型实验，170次API调用
- 🏆 **5种工作模式** - Shepherd/Agile/Waterfall/Chaotic/Spiral
- 📝 **综合文档** - 35个文档，30,750字
- 🚀 **生产就绪** - Docker/K8s/CI/CD/监控

---

## 实验成果

| 实验 | 规模 | 最佳模式 | 得分 |
|------|------|----------|------|
| 俄罗斯方块 | 15次模拟 | 🥇 Shepherd | 81.1 |
| 计算机设计 | 6羊2犬 | ✅ 5测试通过 | - |
| 真实API | 5名AI | 🥇 Shepherd | 492.1 |
| 视频引擎 | 5团队×6人 | 🥇 Spiral | 76.4 |

---

## 项目规模

| 指标 | 数值 |
|------|------|
| 文件数 | 114 |
| 代码行 | 13,728 |
| 文档字 | 30,750 |
| 增长率 | 128% |
| 文档数 | 35 |
| 脚本数 | 16 |

---

## 快速开始

```bash
# 1. 克隆
git clone https://github.com/shepherd-team/shepherd-architecture.git
cd shepherd-architecture

# 2. 安装
npm install

# 3. 启动
docker-compose up -d
npm run dev

# 4. 访问
open http://localhost:3000/console.html
```

---

## 文档索引

| 文档 | 说明 |
|------|------|
| [快速开始](docs/QUICKSTART.md) | 5分钟上手指南 |
| [论文全文](docs/THESIS.md) | 完整学术论文 |
| [完整论文v1.0](docs/PAPER_FULL.md) | 更新版论文（含实验验证） |
| [架构设计](docs/ARCHITECTURE.md) | 系统架构、组件、数据流 |
| [API设计](docs/API_DESIGN.md) | RESTful API + WebSocket 接口规范 |
| [数据模型](docs/DATA_MODEL.md) | 核心数据结构与存储设计 |
| [部署指南](docs/DEPLOYMENT.md) | Docker/Kubernetes/生产环境部署 |
| [实验报告](docs/COMPREHENSIVE_REPORT.md) | 所有实验汇总 |
| [综合报告](docs/FINAL_REPORT.md) | 项目完整报告 |
| [项目总结](docs/SUMMARY.md) | 项目总结 |
| [使用案例](docs/USE_CASES.md) | 实际应用场景 |
| [安装指南](docs/INSTALLATION.md) | 详细安装步骤 |
| [性能基准](docs/BENCHMARK.md) | 性能测试报告 |
| [FAQ](docs/FAQ.md) | 常见问题解答 |
| [路线图](ROADMAP.md) | 未来开发计划 |
| [更新日志](CHANGELOG.md) | 版本更新记录 |

---

## 实验运行

```bash
# 俄罗斯方块
npm run experiment:tetris

# 计算机设计
npm run experiment:computer

# 真实API对比
npm run experiment:api

# 视频引擎设计
npm run experiment:video

# 电商系统设计
npm run experiment:ecommerce

# 项目统计
npm run stats

# 基准测试
npm run benchmark
```

---

## 项目结构

```
shepherd-architecture/
├── src/                    # 核心源码
│   ├── core/              # 核心算法（草、复杂度、委托）
│   ├── agents/            # Agent基类与AI Agent
│   ├── services/          # 业务服务
│   ├── interfaces/        # API与WebSocket
│   ├── middleware/        # 中间件
│   └── utils/             # 工具类
├── tests/                  # 测试套件
├── docs/                   # 文档（35个）
├── examples/               # 示例项目（7个）
│   ├── user-management/   # 用户管理系统
│   ├── microservices/     # 微服务架构
│   ├── legacy-refactoring/# 遗留重构
│   ├── ai-integration/    # AI集成
│   ├── tetris/            # 俄罗斯方块对比
│   ├── data-processing/   # 数据处理
│   └── reports/           # 可视化报告
├── scripts/                # 实验脚本（16个）
│   ├── experiment.js       # 俄罗斯方块实验
│   ├── computer_design.js # 计算机设计
│   ├── real_api_*.js      # 真实API实验
│   ├── video_engine_*.js  # 视频引擎实验
│   ├── ecommerce_*.js     # 电商实验
│   ├── benchmark.js       # 基准测试
│   └── project_stats.js   # 项目统计
├── config/                 # 配置文件
│   ├── nginx/             # Nginx配置
│   ├── prometheus/        # 监控配置
│   └── grafana/           # Grafana面板
├── k8s/                    # Kubernetes配置
├── docker-compose.yml      # Docker Compose
├── package.json            # 项目配置
├── CHANGELOG.md           # 更新日志
├── ROADMAP.md             # 路线图
└── README.md              # 项目说明
```

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 后端 | Node.js, TypeScript, Express |
| 数据库 | MongoDB, Redis |
| 实时通信 | WebSocket |
| 容器 | Docker, Docker Compose |
| 编排 | Kubernetes |
| CI/CD | GitHub Actions |
| 监控 | Prometheus, Grafana |
| API | DeepSeek, Claude, GPT-4 |
| 测试 | Jest |
| 代码规范 | ESLint, Prettier |

---

## 贡献

欢迎贡献！查看 [CONTRIBUTING.md](CONTRIBUTING.md)

## 许可证

[MIT](LICENSE)

---

**项目状态**: Alpha 1.0.0 - 核心框架完成，4个大型实验验证，持续迭代中

**GitHub**: https://github.com/shepherd-team/shepherd-architecture

**文档版本**: v1.0.0 | 2026-06-09
