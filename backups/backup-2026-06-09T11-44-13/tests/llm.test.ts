/**
 * LLM Provider Tests
 * Tests for LLM integration (Mock and Anthropic providers)
 */

import { LLMProvider, MockLLMProvider, AnthropicLLMProvider, Message, ChatResponse } from '../src/common/llm';

describe('LLM Provider Tests', () => {
  describe('MockLLMProvider', () => {
    let provider: MockLLMProvider;

    beforeEach(() => {
      provider = new MockLLMProvider();
    });

    it('should generate a simple response', async () => {
      const messages: Message[] = [
        { role: 'user', content: 'Hello' }
      ];

      const response: ChatResponse = await provider.chat(messages);

      expect(response).toHaveProperty('content');
      expect(typeof response.content).toBe('string');
      expect(response.content.length).toBeGreaterThan(0);
    });

    it('should generate a structured response for code', async () => {
      const messages: Message[] = [
        { role: 'user', content: 'Write a function to calculate factorial' }
      ];

      const response: ChatResponse = await provider.chat(messages);

      expect(response).toHaveProperty('content');
      expect(response.content).toContain('function');
    });

    it('should track token usage', async () => {
      const messages: Message[] = [
        { role: 'user', content: 'Hello' }
      ];

      const response: ChatResponse = await provider.chat(messages);

      expect(response).toHaveProperty('tokenUsage');
      expect(response.tokenUsage).toHaveProperty('input');
      expect(response.tokenUsage).toHaveProperty('output');
      expect(response.tokenUsage).toHaveProperty('total');
    });

    it('should handle streaming', async () => {
      const messages: Message[] = [
        { role: 'user', content: 'Hello' }
      ];

      const chunks: string[] = [];
      const stream = await provider.chatStream(messages);

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      expect(chunks.length).toBeGreaterThan(0);
    });

    it('should generate code snippets', async () => {
      const code = await provider.generateCode('Write a function to add two numbers', 'typescript');

      expect(code).toContain('function');
      expect(code).toContain('add');
    });

    it('should provide architecture suggestions', async () => {
      const suggestions = await provider.suggestArchitecture('User management system', ['scalability', 'security']);

      expect(suggestions).toContain('微服务');
    });

    it('should provide code review feedback', async () => {
      const feedback = await provider.reviewCode('function add(a, b) { return a + b; }', 'typescript');

      expect(feedback).toHaveProperty('issues');
      expect(feedback).toHaveProperty('suggestions');
      expect(feedback).toHaveProperty('overallQuality');
    });
  });

  describe('AnthropicLLMProvider', () => {
    let provider: AnthropicLLMProvider;

    beforeEach(() => {
      provider = new AnthropicLLMProvider();
    });

    it('should throw error for unconfigured API key', async () => {
      const messages: Message[] = [
        { role: 'user', content: 'Hello' }
      ];

      await expect(provider.chat(messages)).rejects.toThrow('Anthropic API key not configured');
    });

    it('should accept configured API key', () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';
      const configuredProvider = new AnthropicLLMProvider();
      expect(configuredProvider).toBeDefined();
      delete process.env.ANTHROPIC_API_KEY;
    });
  });

  describe('Provider Factory', () => {
    it('should create MockLLMProvider', () => {
      const provider = LLMProvider.createProvider('mock');
      expect(provider).toBeInstanceOf(MockLLMProvider);
    });

    it('should create AnthropicLLMProvider', () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';
      const provider = LLMProvider.createProvider('anthropic');
      expect(provider).toBeInstanceOf(AnthropicLLMProvider);
      delete process.env.ANTHROPIC_API_KEY;
    });

    it('should default to MockLLMProvider for unknown provider', () => {
      const provider = LLMProvider.createProvider('unknown');
      expect(provider).toBeInstanceOf(MockLLMProvider);
    });
  });
});
