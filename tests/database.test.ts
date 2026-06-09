/**
 * Database Tests
 * Tests for MongoDB and Redis connections
 */

import { MongoDBConnection, RedisConnection } from '../src/common/database';

describe('Database Tests', () => {
  describe('MongoDBConnection', () => {
    let mongoDB: MongoDBConnection;

    beforeEach(() => {
      mongoDB = new MongoDBConnection();
    });

    afterEach(async () => {
      await mongoDB.disconnect();
    });

    it('should connect to MongoDB', async () => {
      await mongoDB.connect();
      expect(mongoDB.isConnected()).toBe(true);
    });

    it('should disconnect from MongoDB', async () => {
      await mongoDB.connect();
      await mongoDB.disconnect();
      expect(mongoDB.isConnected()).toBe(false);
    });

    it('should perform health check', async () => {
      await mongoDB.connect();
      const health = await mongoDB.healthCheck();
      expect(health).toHaveProperty('healthy');
      expect(typeof health.healthy).toBe('boolean');
    });

    it('should get database client', async () => {
      await mongoDB.connect();
      const client = mongoDB.getClient();
      expect(client).toBeDefined();
    });

    it('should handle connection errors gracefully', async () => {
      // Mock invalid connection string
      process.env.MONGODB_URI = 'invalid://localhost:27017/test';
      const invalidMongoDB = new MongoDBConnection();
      
      await expect(invalidMongoDB.connect()).rejects.toThrow();
      delete process.env.MONGODB_URI;
    });
  });

  describe('RedisConnection', () => {
    let redis: RedisConnection;

    beforeEach(() => {
      redis = new RedisConnection();
    });

    afterEach(async () => {
      await redis.disconnect();
    });

    it('should connect to Redis', async () => {
      await redis.connect();
      expect(redis.isConnected()).toBe(true);
    });

    it('should disconnect from Redis', async () => {
      await redis.connect();
      await redis.disconnect();
      expect(redis.isConnected()).toBe(false);
    });

    it('should perform health check', async () => {
      await redis.connect();
      const health = await redis.healthCheck();
      expect(health).toHaveProperty('healthy');
      expect(typeof health.healthy).toBe('boolean');
    });

    it('should get Redis client', async () => {
      await redis.connect();
      const client = redis.getClient();
      expect(client).toBeDefined();
    });

    it('should handle connection errors gracefully', async () => {
      // Mock invalid connection string
      process.env.REDIS_URL = 'redis://invalid:6379';
      const invalidRedis = new RedisConnection();
      
      await expect(invalidRedis.connect()).rejects.toThrow();
      delete process.env.REDIS_URL;
    });
  });

  describe('Integration', () => {
    let mongoDB: MongoDBConnection;
    let redis: RedisConnection;

    beforeAll(async () => {
      mongoDB = new MongoDBConnection();
      redis = new RedisConnection();
      await mongoDB.connect();
      await redis.connect();
    });

    afterAll(async () => {
      await mongoDB.disconnect();
      await redis.disconnect();
    });

    it('should store and retrieve data from MongoDB', async () => {
      const db = mongoDB.getClient().db('test');
      const collection = db.collection('test_collection');
      
      await collection.insertOne({ test: 'data', timestamp: Date.now() });
      const result = await collection.findOne({ test: 'data' });
      
      expect(result).toBeDefined();
      expect(result?.test).toBe('data');
    });

    it('should store and retrieve data from Redis', async () => {
      const client = redis.getClient();
      
      await client.set('test_key', 'test_value');
      const value = await client.get('test_key');
      
      expect(value).toBe('test_value');
    });
  });
});
