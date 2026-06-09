/**
 * API 入口文件
 * 整合所有中间件、路由和数据库连接
 */

import express from 'express';
import http from 'http';
import path from 'path';
import winston from 'winston';
import { MongoDBConnection, RedisConnection } from '../common/database';
import WebSocketManager from './websocket';
import { 
  authMiddleware, 
  requestLogger, 
  errorHandler, 
  RateLimiter, 
  corsOptions, 
  securityHeaders,
  bodySizeLimit,
  timeoutMiddleware
} from './middleware';
import cors from 'cors';
import helmet from 'helmet';

// Import routes (we'll create these)
// import taskRouter from './routes/tasks';
// import agentRouter from './routes/agents';
// import orchestratorRouter from './routes/orchestrator';
// import environmentRouter from './routes/environment';
// import auditRouter from './routes/audit';
// import systemRouter from './routes/system';

// ==================== Logger ====================

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// ==================== App Setup ====================

const app = express();
const server = http.createServer(app);

// Security middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(securityHeaders);

// Body parsing
app.use(express.json({ limit: bodySizeLimit }));
app.use(express.urlencoded({ extended: true, limit: bodySizeLimit }));

// Request logging
app.use(requestLogger(logger));

// Timeout
app.use(timeoutMiddleware(30000));

// Static files
app.use(express.static(path.join(__dirname, '../../public')));

// ==================== Database Connections ====================

const mongoDB = new MongoDBConnection();
const redis = new RedisConnection();

// Initialize rate limiter
let rateLimiter: RateLimiter;

async function initializeDatabase(): Promise<void> {
  try {
    await mongoDB.connect();
    await redis.connect();
    
    rateLimiter = new RateLimiter(redis.getClient(), 60000, 100);
    
    logger.info('Database connections established');
  } catch (err) {
    logger.error('Failed to connect to databases', { error: err });
    throw err;
  }
}

// ==================== WebSocket ====================

const wsManager = new WebSocketManager();
wsManager.initialize(server);

// ==================== Routes ====================

// Import routes from server.ts (legacy)
import legacyRouter from './server';
app.use('/v1', legacyRouter);

// Health check
app.get('/health', async (req, res) => {
  const mongoHealth = await mongoDB.healthCheck();
  const redisHealth = await redis.healthCheck();
  
  const healthy = mongoHealth.healthy && redisHealth.healthy;
  
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'unhealthy',
    timestamp: Date.now(),
    services: {
      mongodb: mongoHealth,
      redis: redisHealth,
    },
  });
});

app.get('/ready', (req, res) => {
  res.json({ ready: true });
});

// Error handler
app.use(errorHandler(logger));

// ==================== Server Start ====================

const PORT = process.env.PORT || 3000;

async function start(): Promise<void> {
  try {
    await initializeDatabase();
    
    server.listen(PORT, () => {
      logger.info(`Shepherd Architecture API running on port ${PORT}`);
      console.log(`🐑 Shepherd Architecture API v1.0.0-alpha`);
      console.log(`   Port: ${PORT}`);
      console.log(`   Health: GET /health`);
      console.log(`   Console: http://localhost:${PORT}/console.html`);
      console.log(`   API Docs: /docs`);
      console.log(`   WebSocket: ws://localhost:${PORT}/v1/ws`);
      console.log(`   MongoDB: ${mongoDB.isConnected() ? 'connected' : 'disconnected'}`);
      console.log(`   Redis: ${redis.isConnected() ? 'connected' : 'disconnected'}`);
    });
  } catch (err) {
    logger.error('Failed to start server', { error: err });
    process.exit(1);
  }
}

start();

export { app, server, mongoDB, redis, wsManager, logger };
