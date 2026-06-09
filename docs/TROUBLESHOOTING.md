# Troubleshooting Guide

## 常见问题排查

### 1. 无法连接到 MongoDB

**症状：** 启动时提示 `MongoDB connection failed`

**解决方案：**
```bash
# 检查 MongoDB 是否运行
docker ps | grep mongo

# 手动启动 MongoDB
docker-compose up -d mongo

# 检查日志
docker logs shepherd-mongo
```

### 2. Redis 连接失败

**症状：** 提示 `Redis connection failed`

**解决方案：**
```bash
# 检查 Redis 是否运行
docker ps | grep redis

# 手动启动 Redis
docker-compose up -d redis

# 测试连接
redis-cli ping
```

### 3. 端口冲突

**症状：** `Error: listen EADDRINUSE: address already in use :::3000`

**解决方案：**
```bash
# 查找占用进程
lsof -i :3000

# 终止进程
kill -9 <PID>

# 或使用其他端口
PORT=3001 npm run dev
```

### 4. 权限不足

**症状：** 脚本无法执行

**解决方案：**
```bash
chmod +x scripts/*.sh
```

### 5. TypeScript 编译错误

**症状：** `Cannot find module` 或类型错误

**解决方案：**
```bash
# 重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 重新构建
npm run build
```

### 6. 测试失败

**症状：** `npm test` 报错

**解决方案：**
```bash
# 单独运行测试
npx jest tests/core.test.ts

# 查看详细日志
npx jest --verbose

# 更新快照
npx jest --updateSnapshot
```

## 诊断命令

```bash
# 系统健康检查
bash scripts/healthcheck.sh

# 检查所有服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 重启所有服务
docker-compose restart
```

## 联系支持

如果问题无法解决，请提交 Issue 或联系 support@shepherd.local
