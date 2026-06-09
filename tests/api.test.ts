/**
 * API Integration Tests
 * Tests for REST API endpoints
 */

import request from 'supertest';
import { app } from '../../src/api/index';

describe('API Integration Tests', () => {
  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
    });
  });

  describe('POST /v1/system/init', () => {
    it('should initialize shepherd operator', async () => {
      const response = await request(app)
        .post('/v1/system/init')
        .send({
          humanName: 'Test User',
          humanRole: 'Developer',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('shepherdId');
      expect(response.body).toHaveProperty('humanId');
      expect(response.body.status).toBe('initialized');
    });
  });

  describe('POST /v1/tasks/delegate', () => {
    beforeEach(async () => {
      await request(app)
        .post('/v1/system/init')
        .send({
          humanName: 'Test User',
          humanRole: 'Developer',
        });
    });

    it('should delegate a task', async () => {
      const response = await request(app)
        .post('/v1/tasks/delegate')
        .send({
          title: 'Test Task',
          description: 'Test task description',
          tags: ['test'],
          priority: 3,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('taskId');
      expect(response.body).toHaveProperty('mode');
    });

    it('should return error for missing title', async () => {
      const response = await request(app)
        .post('/v1/tasks/delegate')
        .send({
          description: 'Test task description',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_INPUT');
    });
  });

  describe('POST /v1/agents/register', () => {
    it('should register an agent', async () => {
      const response = await request(app)
        .post('/v1/agents/register')
        .send({
          name: 'Test Agent',
          level: 'EXECUTIVE',
          capabilities: ['test'],
          autonomyLevel: 0.8,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('agentId');
      expect(response.body.name).toBe('Test Agent');
    });
  });

  describe('GET /v1/agents', () => {
    it('should return agent list', async () => {
      const response = await request(app).get('/v1/agents');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('agents');
      expect(Array.isArray(response.body.agents)).toBe(true);
    });
  });

  describe('GET /v1/audit/logs', () => {
    beforeEach(async () => {
      await request(app)
        .post('/v1/system/init')
        .send({
          humanName: 'Test User',
          humanRole: 'Developer',
        });
    });

    it('should return audit logs', async () => {
      const response = await request(app).get('/v1/audit/logs');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('logs');
      expect(Array.isArray(response.body.logs)).toBe(true);
    });
  });

  describe('GET /v1/audit/verify', () => {
    it('should verify audit chain integrity', async () => {
      const response = await request(app).get('/v1/audit/verify');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('valid');
      expect(typeof response.body.valid).toBe('boolean');
    });
  });

  describe('POST /v1/orchestrator/decompose', () => {
    beforeEach(async () => {
      await request(app)
        .post('/v1/system/init')
        .send({
          humanName: 'Test User',
          humanRole: 'Developer',
        });
    });

    it('should decompose a task', async () => {
      // First delegate a task
      const delegateResponse = await request(app)
        .post('/v1/tasks/delegate')
        .send({
          title: 'Complex Task',
          description: 'Complex task to decompose',
          tags: ['complex'],
        });

      const taskId = delegateResponse.body.taskId;

      const response = await request(app)
        .post('/v1/orchestrator/decompose')
        .send({
          taskId,
          strategy: 'parallel',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('subtasks');
      expect(Array.isArray(response.body.subtasks)).toBe(true);
    });
  });

  describe('POST /v1/environment/shape', () => {
    beforeEach(async () => {
      await request(app)
        .post('/v1/system/init')
        .send({
          humanName: 'Test User',
          humanRole: 'Developer',
        });
    });

    it('should shape environment', async () => {
      const response = await request(app)
        .post('/v1/environment/shape')
        .send({
          action: 'SET_GOAL',
          payload: {
            id: 'goal-001',
            description: 'Test goal',
            priority: 3,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('applied');
    });
  });
});
