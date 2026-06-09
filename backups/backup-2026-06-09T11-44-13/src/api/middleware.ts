/**
 * 中间件层
 * 认证、日志、错误处理、速率限制
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import winston from 'winston';
import Redis from 'ioredis';

// ==================== 认证中间件 ====================

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    role: string;
    authorityLevel: number;
  };
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Missing authentication token' },
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'default-secret';
    const decoded = jwt.verify(token, secret) as any;

    req.user = {
      id: decoded.userId,
      name: decoded.name,
      role: decoded.role,
      authorityLevel: decoded.authorityLevel || 1,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' },
    });
  }
};

// 可选认证（不强制要求）
export const optionalAuthMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (token) {
    try {
      const secret = process.env.JWT_SECRET || 'default-secret';
      const decoded = jwt.verify(token, secret) as any;
      req.user = {
        id: decoded.userId,
        name: decoded.name,
        role: decoded.role,
        authorityLevel: decoded.authorityLevel || 1,
      };
    } catch {
      // Invalid token, but not required
    }
  }

  next();
};

// ==================== 日志中间件 ====================

export const requestLogger = (logger: winston.Logger) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info('API Request', {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration,
        userAgent: req.get('user-agent'),
        ip: req.ip,
      });
    });

    next();
  };
};

// ==================== 错误处理中间件 ====================

export const errorHandler = (logger: winston.Logger) => {
  return (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error('Unhandled error', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    res.status(statusCode).json({
      error: {
        code: err.code || 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'development' ? message : 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      },
    });
  };
};

// ==================== 速率限制中间件 ====================

export class RateLimiter {
  private redis: Redis;
  private windowMs: number;
  private maxRequests: number;

  constructor(redis: Redis, windowMs: number = 60000, maxRequests: number = 100) {
    this.redis = redis;
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  middleware = async (req: Request, res: Response, next: NextFunction) => {
    const key = `rate_limit:${req.ip}:${req.path}`;

    try {
      const current = await this.redis.get(key);
      const count = current ? parseInt(current) : 0;

      if (count >= this.maxRequests) {
        return res.status(429).json({
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests, please try again later',
          },
        });
      }

      await this.redis.multi()
        .incr(key)
        .pexpire(key, this.windowMs)
        .exec();

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', this.maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', (this.maxRequests - count - 1).toString());

      next();
    } catch (err) {
      // If Redis fails, allow the request
      next();
    }
  };
}

// ==================== 请求验证中间件 ====================

export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: error.details[0].message,
        },
      });
    }
    next();
  };
};

// ==================== CORS 配置 ====================

export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:8080'];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// ==================== 安全中间件 ====================

export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // CSP (Content Security Policy)
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self' ws: wss:;"
  );

  next();
};

// ==================== 请求大小限制 ====================

export const bodySizeLimit = '10mb';

// ==================== 超时中间件 ====================

export const timeoutMiddleware = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(504).json({
          error: {
            code: 'REQUEST_TIMEOUT',
            message: 'Request timeout',
          },
        });
      }
    }, timeoutMs);

    res.on('finish', () => {
      clearTimeout(timeout);
    });

    next();
  };
};

export default {
  authMiddleware,
  optionalAuthMiddleware,
  requestLogger,
  errorHandler,
  RateLimiter,
  validateRequest,
  corsOptions,
  securityHeaders,
  bodySizeLimit,
  timeoutMiddleware,
};