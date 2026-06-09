# 示例：AI 功能集成

## 场景描述

使用 SAF 框架在现有 Web 应用中集成 AI 能力（如智能推荐、自然语言处理）。

## 挑战

- 需要选择合适的 AI 模型
- 需要设计 AI 服务的 API 接口
- 需要考虑性能影响
- 需要处理 AI 失败情况

## 使用 SAF 的工作流程

### 1. 技术选型

```bash
curl -X POST http://localhost:3000/v1/tasks/delegate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AI 技术选型",
    "description": "选择推荐系统模型、NLP 库、向量数据库",
    "tags": ["architecture", "ai", "technology-selection"],
    "priority": 5
  }'
```

### 2. API 设计

```bash
curl -X POST http://localhost:3000/v1/tasks/delegate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "设计 AI 服务 API",
    "description": "设计推荐 API、NLP API 的接口规范",
    "tags": ["api-design", "ai", "implementation"],
    "priority": 4
  }'
```

### 3. 性能优化

```bash
curl -X POST http://localhost:3000/v1/tasks/delegate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AI 服务性能优化",
    "description": "缓存策略、异步处理、批量推理优化",
    "tags": ["performance", "optimization", "ai"],
    "priority": 4
  }'
```

## 70/30 法则的体现

**70% Agent Mode 工作：**
- API 实现（FastAPI 端点）
- 缓存实现（Redis）
- 监控指标（Prometheus）
- 部署配置（Docker）
- 小计：14小时（70%）

**30% Copilot Mode 工作：**
- 模型选择（业务需求匹配）
- 性能权衡（准确率 vs 延迟）
- 失败策略（降级方案）
- 小计：6小时（30%）

## 集成架构

```
web-app/
├── backend/
│   ├── api/              # REST API
│   ├── ai-service/       # AI 服务
│   │   ├── recommendation/ # 推荐系统
│   │   ├── nlp/            # 自然语言处理
│   │   └── embedding/      # 向量服务
│   └── cache/            # Redis 缓存
└── ml-models/
    ├── recommendation-model/  # 推荐模型
    └── nlp-model/             # NLP 模型
```

## API 设计示例

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class RecommendationRequest(BaseModel):
    user_id: str
    context: dict
    limit: int = 10

class RecommendationResponse(BaseModel):
    items: list
    scores: list
    latency_ms: float

@app.post("/v1/recommend")
async def recommend(request: RecommendationRequest):
    # AI 推理逻辑
    pass

@app.post("/v1/analyze-sentiment")
async def analyze_sentiment(text: str):
    # NLP 分析逻辑
    pass
```

---

**返回示例列表**：[examples/README.md](../README.md)
