# Design Principles

## 1. Separation of Concerns

Each component has a single responsibility:
- **Core**: Domain models and algorithms
- **API**: HTTP/WebSocket interfaces
- **Agents**: AI execution logic
- **Orchestrator**: Task coordination
- **Common**: Shared utilities

## 2. Dependency Inversion

High-level modules depend on abstractions, not low-level implementations:
```typescript
// Good: Depend on interface
interface LLMProvider {
  chat(messages: Message[]): Promise<Response>;
}

// Bad: Depend on concrete implementation
class AnthropicProvider { }
```

## 3. Open/Closed Principle

Open for extension, closed for modification:
```typescript
// Extensible without modifying existing code
class AgentFactory {
  static create(type: string): Agent {
    switch (type) {
      case 'strategic': return new StrategicAgent();
      case 'tactical': return new TacticalAgent();
      case 'executive': return new ExecutiveAgent();
      default: throw new Error('Unknown agent type');
    }
  }
}
```

## 4. Composition over Inheritance

Favor composition for flexibility:
```typescript
// Composition
class ShepherdOperator {
  constructor(
    private human: Human,
    private agents: Agent[],
    private environment: Environment,
    private interventionPolicy: Policy,
    private shaper: EnvironmentShaper
  ) {}
}
```

## 5. Fail-Fast

Detect errors as early as possible:
```typescript
function delegateTask(task: Task) {
  if (!task.title) throw new Error('Task title is required');
  if (!task.description) throw new Error('Task description is required');
  // ...
}
```

## 6. Audit Everything

All actions must be traceable:
```typescript
// Every action creates an audit record
this.logAudit({
  actor: { type: 'HUMAN', id: userId },
  action: { type: 'DELEGATE', target: taskId },
  timestamp: Date.now()
});
```

## 7. Human-in-the-Loop

Always provide human override capability:
```typescript
// Agent mode still allows human intervention
if (interventionPolicy.shouldIntervene(action)) {
  await requestHumanApproval(action);
}
```

## 8. Progressive Enhancement

Start simple, add complexity only when needed:
- v1: Basic delegation
- v2: Multi-agent coordination
- v3: Advanced conflict resolution
- v4: Self-optimizing thresholds

---

**More details:** [Architecture Document](ARCHITECTURE.md)
