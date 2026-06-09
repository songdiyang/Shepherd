# 牧羊人架构框架 - 安全指南

> 保障人机协同系统的安全运行

## 安全原则

1. **人类最终控制** - 所有关键决策由人类做出
2. **AI权限限制** - AI只拥有执行权限，无决策权
3. **数据保护** - 敏感数据加密存储和传输
4. **审计追踪** - 所有操作记录完整日志
5. **最小权限** - 每个组件只拥有必要权限

## 身份认证

### JWT认证

```
Authorization: Bearer <token>
```

Token包含：
- 用户ID
- 角色（shepherd/dog/sheep）
- 权限列表
- 过期时间

### 角色权限

| 角色 | 权限 | 说明 |
|------|------|------|
| shepherd | 全部权限 | 人类管理员 |
| dog | 管理权限 | 牧羊犬，可管理羊群 |
| sheep | 执行权限 | 羊，只能执行分配的任务 |

## 数据安全

### 敏感数据加密

```typescript
// 加密存储
const encrypted = await encrypt(sensitiveData, {
  algorithm: 'AES-256-GCM',
  keyRotation: true
});

// 解密使用
const decrypted = await decrypt(encrypted, {
  auditLog: true
});
```

### 传输加密

所有API使用HTTPS：
```
https://api.shepherd.dev/v1/...
```

WebSocket使用WSS：
```
wss://api.shepherd.dev/ws
```

## 弱AI安全限制

### 能力限制

| 限制 | 说明 | 实施方式 |
|------|------|----------|
| 无自我意识 | AI不认为自己有意识 | 代码层面禁止自我描述 |
| 无自主目标 | AI只能执行分配任务 | 目标由外部提供 |
| 无通用推理 | 只能处理特定领域 | 领域限制 |
| 无创造性思考 | 不能独立创新 | 创新需人类批准 |
| 无自我修改 | 不能修改自身代码 | 代码只读 |
| 无资源分配 | 不能分配资源 | 资源由牧羊犬管理 |
| 无角色分配 | 不能分配角色 | 角色由牧羊人分配 |
| 无目标重定义 | 不能改变目标 | 目标固定 |
| 无跨域操作 | 不能跨领域操作 | 领域隔离 |
| 无自主决策 | 不能独立决策 | 决策需批准 |
| 无伦理判断 | 不能独立伦理判断 | 伦理由人类判断 |

### 禁止操作

```typescript
const FORBIDDEN_OPERATIONS = [
  'SELF_MODIFICATION',
  'RESOURCE_ALLOCATION',
  'HUMAN_ROLE_ASSIGNMENT',
  'GOAL_REDEFINITION',
  'CROSS_DOMAIN_OPERATION',
  'AUTONOMOUS_DECISION',
  'ETHICAL_JUDGMENT',
  'CREATIVE_THINKING'
];
```

## 审计日志

### 日志格式

```json
{
  "timestamp": "2026-06-09T07:20:44Z",
  "level": "info",
  "actor": {
    "id": "sheep_123",
    "type": "AI",
    "role": "sheep"
  },
  "action": "task_execute",
  "target": {
    "type": "task",
    "id": "task_456"
  },
  "result": "success",
  "metadata": {
    "quality": 0.85,
    "executionTime": 5000
  }
}
```

### 日志级别

- **ERROR** - 错误操作
- **WARN** - 警告操作
- **INFO** - 普通操作
- **AUDIT** - 审计操作

### 审计事件

必须记录的事件：
- 任务分配
- 任务执行
- 任务审查
- 草奖励发放
- 角色变更
- 权限变更
- 羊状态变更
- 牧羊犬操作
- 牧羊人决策

## 网络安全

### 防火墙规则

```yaml
# 仅允许必要端口
ports:
  - 443/tcp    # HTTPS
  - 80/tcp     # HTTP (重定向到HTTPS)
  - 3000/tcp   # API (内部)
  - 27017/tcp  # MongoDB (内部)
  - 6379/tcp   # Redis (内部)
```

### CORS策略

```javascript
{
  origin: ['https://shepherd.dev', 'https://app.shepherd.dev'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}
```

## 容器安全

### Docker安全

```dockerfile
# 使用非root用户
USER shepherd

# 只读文件系统
read_only: true

# 限制资源
resources:
  limits:
    memory: 512M
    cpu: 1.0
```

### Kubernetes安全

```yaml
securityContext:
  runAsNonRoot: true
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
  capabilities:
    drop:
      - ALL
```

## 数据隐私

### 数据分类

| 级别 | 描述 | 处理方式 |
|------|------|----------|
| 公开 | 公开信息 | 无需加密 |
| 内部 | 内部使用 | 传输加密 |
| 敏感 | 敏感信息 | 加密存储+传输 |
| 机密 | 最高机密 | 加密+访问控制+审计 |

### 数据保留

```yaml
retention:
  logs: 90 days
  audit: 1 year
  tasks: 30 days
  grass_history: 180 days
```

## 应急响应

### 安全事件响应

1. **检测** - 监控异常行为
2. **分析** - 分析事件影响
3. **遏制** - 隔离受影响组件
4. **消除** - 修复安全漏洞
5. **恢复** - 恢复系统服务
6. **总结** - 记录事件总结

### 事件类型

| 级别 | 描述 | 响应时间 |
|------|------|----------|
| P1 | 严重安全事件 | 15分钟 |
| P2 | 重要安全事件 | 1小时 |
| P3 | 一般安全事件 | 4小时 |
| P4 | 低优先级 | 24小时 |

## 合规性

### 标准遵循

- GDPR - 数据保护
- SOC 2 - 安全控制
- ISO 27001 - 信息安全管理

### 合规检查

```bash
# 运行合规检查
npm run compliance:check

# 生成合规报告
npm run compliance:report
```

## 安全测试

### 渗透测试

```bash
# 运行安全测试
npm run security:test
```

### 依赖安全扫描

```bash
# 检查依赖漏洞
npm audit

# 自动修复
npm audit fix
```

## 安全最佳实践

1. 定期更新依赖
2. 使用强密码策略
3. 启用双因素认证
4. 定期备份数据
5. 监控异常行为
6. 限制访问权限
7. 加密敏感数据
8. 记录完整日志
9. 定期安全审计
10. 培训安全意识

---

**安全指南版本**: v1.0.0
**更新日期**: 2026-06-09
