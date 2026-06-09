# Performance Optimization Guide

## 1. Database Optimization

### MongoDB
```javascript
// Create indexes
db.tasks.createIndex({ status: 1, priority: -1 });
db.tasks.createIndex({ assignedTo: 1, status: 1 });
db.audit_logs.createIndex({ timestamp: -1 });

// Use aggregation for complex queries
db.tasks.aggregate([
  { $match: { status: 'COMPLETED' } },
  { $group: { _id: '$assignedTo', count: { $sum: 1 } } }
]);
```

### Redis
```bash
# Optimize memory usage
maxmemory 2gb
maxmemory-policy allkeys-lru

# Enable persistence
appendonly yes
appendfsync everysec
```

## 2. API Optimization

### Caching Strategy
```typescript
// Cache delegation results for 5 minutes
const cacheKey = `delegation:${task.id}`;
const cached = await redis.get(cacheKey);
if (cached) {
  return JSON.parse(cached);
}
const result = await evaluator.evaluate(task, context);
await redis.setex(cacheKey, 300, JSON.stringify(result));
```

### Connection Pooling
```typescript
// MongoDB connection pool
const client = new MongoClient(uri, {
  maxPoolSize: 50,
  minPoolSize: 10,
  maxIdleTimeMS: 30000,
});
```

## 3. Agent Optimization

### Batch Processing
```typescript
// Process multiple tasks in parallel
const results = await Promise.all(
  tasks.map(task => agent.execute(task, environment))
);
```

### Lazy Loading
```typescript
// Load agents on demand
class AgentPool {
  private agents: Map<string, Agent> = new Map();
  
  async getAgent(id: string): Promise<Agent> {
    if (!this.agents.has(id)) {
      const agent = await this.loadAgent(id);
      this.agents.set(id, agent);
    }
    return this.agents.get(id)!;
  }
}
```

## 4. Memory Management

### Garbage Collection
```typescript
// Clear unused caches periodically
setInterval(() => {
  cache.clear();
}, 3600000); // 1 hour
```

### Stream Processing
```typescript
// Process large files as streams
import { createReadStream } from 'fs';
const stream = createReadStream('large-file.txt');
stream.pipe(parser).pipe(output);
```

## 5. Monitoring

### Metrics to Track
- API response time (P50, P95, P99)
- Database query time
- Agent utilization rate
- Memory usage
- Error rate

### Tools
- Prometheus + Grafana
- Winston logging
- Node.js built-in profiler

## 6. Load Testing

```bash
# Using Apache Bench
ab -n 10000 -c 100 http://localhost:3000/health

# Using Artillery
artillery quick --count 100 --num 50 http://localhost:3000/v1/tasks
```

## 7. Scaling Strategies

### Horizontal Scaling
- Stateless API servers
- Load balancing (Nginx)
- Session sharing (Redis)

### Vertical Scaling
- Increase CPU/memory
- Optimize algorithms
- Use caching

---

**More details:** [Benchmark Report](BENCHMARK.md)
