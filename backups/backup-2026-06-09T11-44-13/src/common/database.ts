/**
 * 数据库连接层
 * MongoDB + Redis 双存储架构
 */

import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import Redis from 'ioredis';
import { EventEmitter } from 'events';

// ==================== MongoDB 连接 ====================

export class MongoDBConnection extends EventEmitter {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private uri: string;
  private dbName: string;

  constructor(uri: string = process.env.MONGODB_URI || 'mongodb://localhost:27017', dbName: string = 'shepherd') {
    super();
    this.uri = uri;
    this.dbName = dbName;
  }

  async connect(): Promise<void> {
    try {
      this.client = new MongoClient(this.uri);
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      
      // 创建索引
      await this.createIndexes();
      
      this.emit('connected', { uri: this.uri, db: this.dbName });
      console.log(`[MongoDB] Connected to ${this.uri}/${this.dbName}`);
    } catch (err) {
      this.emit('error', err);
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.emit('disconnected');
      console.log('[MongoDB] Disconnected');
    }
  }

  getDatabase(): Db {
    if (!this.db) {
      throw new Error('MongoDB not connected. Call connect() first.');
    }
    return this.db;
  }

  getCollection(name: string): Collection {
    return this.getDatabase().collection(name);
  }

  private async createIndexes(): Promise<void> {
    const db = this.getDatabase();
    
    // Tasks collection indexes
    await db.collection('tasks').createIndexes([
      { key: { status: 1, priority: -1 }, name: 'status_priority' },
      { key: { assignedTo: 1, status: 1 }, name: 'assigned_status' },
      { key: { tags: 1 }, name: 'tags' },
      { key: { createdAt: -1 }, name: 'created_at' },
      { key: { deadline: 1 }, name: 'deadline' },
    ]);

    // Agents collection indexes
    await db.collection('agents').createIndexes([
      { key: { status: 1, level: 1 }, name: 'status_level' },
      { key: { capabilityRange: 1 }, name: 'capabilities' },
    ]);

    // Audit logs collection indexes
    await db.collection('audit_logs').createIndexes([
      { key: { timestamp: -1 }, name: 'timestamp' },
      { key: { 'actor.id': 1, timestamp: -1 }, name: 'actor_timestamp' },
      { key: { hash: 1 }, name: 'hash' },
    ]);

    // Environment states collection indexes
    await db.collection('environment_states').createIndexes([
      { key: { version: -1 }, name: 'version' },
      { key: { timestamp: -1 }, name: 'env_timestamp' },
    ]);

    console.log('[MongoDB] Indexes created');
  }

  async healthCheck(): Promise<{ healthy: boolean; latency: number }> {
    const start = Date.now();
    try {
      await this.getDatabase().admin().ping();
      return { healthy: true, latency: Date.now() - start };
    } catch {
      return { healthy: false, latency: Date.now() - start };
    }
  }
}

// ==================== Redis 连接 ====================

export class RedisConnection extends EventEmitter {
  private client: Redis | null = null;
  private uri: string;

  constructor(uri: string = process.env.REDIS_URL || 'redis://localhost:6379') {
    super();
    this.uri = uri;
  }

  async connect(): Promise<void> {
    try {
      this.client = new Redis(this.uri, {
        retryStrategy: (times) => Math.min(times * 50, 2000),
        maxRetriesPerRequest: 3,
      });

      this.client.on('connect', () => {
        this.emit('connected', { uri: this.uri });
        console.log(`[Redis] Connected to ${this.uri}`);
      });

      this.client.on('error', (err) => {
        this.emit('error', err);
        console.error('[Redis] Error:', err.message);
      });

      // Test connection
      await this.client.ping();
    } catch (err) {
      this.emit('error', err);
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.emit('disconnected');
      console.log('[Redis] Disconnected');
    }
  }

  getClient(): Redis {
    if (!this.client) {
      throw new Error('Redis not connected. Call connect() first.');
    }
    return this.client;
  }

  async healthCheck(): Promise<{ healthy: boolean; latency: number }> {
    const start = Date.now();
    try {
      await this.getClient().ping();
      return { healthy: true, latency: Date.now() - start };
    } catch {
      return { healthy: false, latency: Date.now() - start };
    }
  }

  // Cache helpers
  async getCache(key: string): Promise<string | null> {
    return this.getClient().get(key);
  }

  async setCache(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.getClient().setex(key, ttl, value);
    } else {
      await this.getClient().set(key, value);
    }
  }

  async deleteCache(key: string): Promise<void> {
    await this.getClient().del(key);
  }

  // Pub/Sub helpers
  async publish(channel: string, message: string): Promise<void> {
    await this.getClient().publish(channel, message);
  }

  subscribe(channel: string, callback: (message: string) => void): void {
    const subscriber = new Redis(this.uri);
    subscriber.subscribe(channel);
    subscriber.on('message', (ch, msg) => {
      if (ch === channel) {
        callback(msg);
      }
    });
  }
}

// ==================== 数据库仓储层 ====================

export class TaskRepository {
  constructor(private db: MongoDBConnection) {}

  private getCollection() {
    return this.db.getCollection('tasks');
  }

  async create(task: any): Promise<any> {
    const result = await this.getCollection().insertOne({
      ...task,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { ...task, _id: result.insertedId };
  }

  async findById(id: string): Promise<any | null> {
    return this.getCollection().findOne({ id });
  }

  async findAll(filter: any = {}): Promise<any[]> {
    return this.getCollection().find(filter).sort({ createdAt: -1 }).toArray();
  }

  async update(id: string, updates: any): Promise<any> {
    const result = await this.getCollection().findOneAndUpdate(
      { id },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return result;
  }

  async delete(id: string): Promise<void> {
    await this.getCollection().deleteOne({ id });
  }
}

export class AgentRepository {
  constructor(private db: MongoDBConnection) {}

  private getCollection() {
    return this.db.getCollection('agents');
  }

  async create(agent: any): Promise<any> {
    const result = await this.getCollection().insertOne({
      ...agent,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { ...agent, _id: result.insertedId };
  }

  async findById(id: string): Promise<any | null> {
    return this.getCollection().findOne({ id });
  }

  async findAvailable(level?: string): Promise<any[]> {
    const filter: any = { status: 'IDLE' };
    if (level) {
      filter.level = level;
    }
    return this.getCollection().find(filter).toArray();
  }

  async updateStatus(id: string, status: string, currentTask?: string): Promise<void> {
    await this.getCollection().updateOne(
      { id },
      { $set: { status, currentTask, updatedAt: new Date() } }
    );
  }
}

export class AuditLogRepository {
  constructor(private db: MongoDBConnection) {}

  private getCollection() {
    return this.db.getCollection('audit_logs');
  }

  async create(record: any): Promise<any> {
    const result = await this.getCollection().insertOne({
      ...record,
      createdAt: new Date(),
    });
    return { ...record, _id: result.insertedId };
  }

  async findAll(filter: any = {}, limit: number = 100): Promise<any[]> {
    return this.getCollection()
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }

  async verifyChain(): Promise<{ valid: boolean; count: number; brokenAt?: number }> {
    const records = await this.getCollection()
      .find({})
      .sort({ timestamp: 1 })
      .toArray();

    for (let i = 1; i < records.length; i++) {
      if (records[i].previousHash !== records[i - 1].hash) {
        return { valid: false, count: records.length, brokenAt: i };
      }
    }

    return { valid: true, count: records.length };
  }
}

// ==================== 导出 ====================

export { MongoDBConnection, RedisConnection, TaskRepository, AgentRepository, AuditLogRepository };
