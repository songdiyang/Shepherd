/**
 * WebSocket 实时通信层
 * 支持实时状态推送、Agent状态更新、人类介入请求
 */

import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export interface WebSocketClient {
  id: string;
  socket: WebSocket;
  userId?: string;
  authenticated: boolean;
  subscriptions: string[];
  connectedAt: number;
}

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

// ==================== WebSocket 管理器 ====================

export class WebSocketManager extends EventEmitter {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WebSocketClient> = new Map();
  private channels: Map<string, Set<string>> = new Map();

  initialize(server: Server): void {
    this.wss = new WebSocketServer({ server, path: '/v1/ws' });

    this.wss.on('connection', (socket: WebSocket) => {
      this.handleConnection(socket);
    });

    console.log('[WebSocket] Server initialized on /v1/ws');
  }

  private handleConnection(socket: WebSocket): void {
    const clientId = uuidv4();
    const client: WebSocketClient = {
      id: clientId,
      socket,
      authenticated: false,
      subscriptions: [],
      connectedAt: Date.now(),
    };

    this.clients.set(clientId, client);
    this.emit('client_connected', { clientId });

    socket.on('message', (data: Buffer) => {
      this.handleMessage(clientId, data.toString());
    });

    socket.on('close', () => {
      this.handleDisconnection(clientId);
    });

    socket.on('error', (err) => {
      console.error(`[WebSocket] Client ${clientId} error:`, err.message);
      this.emit('client_error', { clientId, error: err });
    });

    // Send welcome message
    this.sendToClient(clientId, {
      type: 'CONNECTED',
      data: { clientId, message: 'Welcome to Shepherd Architecture Framework' },
      timestamp: Date.now(),
    });
  }

  private handleMessage(clientId: string, message: string): void {
    try {
      const parsed = JSON.parse(message);
      const client = this.clients.get(clientId);

      if (!client) return;

      switch (parsed.type) {
        case 'AUTH':
          this.handleAuth(clientId, parsed.token);
          break;

        case 'SUBSCRIBE':
          this.handleSubscribe(clientId, parsed.channel);
          break;

        case 'UNSUBSCRIBE':
          this.handleUnsubscribe(clientId, parsed.channel);
          break;

        case 'PING':
          this.sendToClient(clientId, {
            type: 'PONG',
            data: { timestamp: Date.now() },
            timestamp: Date.now(),
          });
          break;

        case 'INTERVENTION_RESPONSE':
          this.emit('intervention_response', {
            clientId,
            taskId: parsed.taskId,
            decision: parsed.decision,
          });
          break;

        default:
          this.emit('custom_message', { clientId, message: parsed });
      }
    } catch (err) {
      console.error('[WebSocket] Invalid message:', message);
      this.sendToClient(clientId, {
        type: 'ERROR',
        data: { message: 'Invalid message format' },
        timestamp: Date.now(),
      });
    }
  }

  private handleAuth(clientId: string, token: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    // TODO: Validate JWT token
    client.authenticated = true;
    client.userId = 'user-001'; // Mock validation

    this.sendToClient(clientId, {
      type: 'AUTH_SUCCESS',
      data: { userId: client.userId },
      timestamp: Date.now(),
    });

    this.emit('client_authenticated', { clientId, userId: client.userId });
  }

  private handleSubscribe(clientId: string, channel: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }

    this.channels.get(channel)!.add(clientId);
    client.subscriptions.push(channel);

    this.sendToClient(clientId, {
      type: 'SUBSCRIBED',
      data: { channel },
      timestamp: Date.now(),
    });
  }

  private handleUnsubscribe(clientId: string, channel: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    this.channels.get(channel)?.delete(clientId);
    client.subscriptions = client.subscriptions.filter(c => c !== channel);

    this.sendToClient(clientId, {
      type: 'UNSUBSCRIBED',
      data: { channel },
      timestamp: Date.now(),
    });
  }

  private handleDisconnection(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Remove from all channels
    for (const channel of client.subscriptions) {
      this.channels.get(channel)?.delete(clientId);
    }

    this.clients.delete(clientId);
    this.emit('client_disconnected', { clientId });
  }

  // ==================== 广播方法 ====================

  sendToClient(clientId: string, message: WebSocketMessage): void {
    const client = this.clients.get(clientId);
    if (!client || client.socket.readyState !== WebSocket.OPEN) return;

    client.socket.send(JSON.stringify(message));
  }

  broadcastToChannel(channel: string, message: WebSocketMessage): void {
    const clientIds = this.channels.get(channel);
    if (!clientIds) return;

    for (const clientId of clientIds) {
      this.sendToClient(clientId, message);
    }
  }

  broadcastToAll(message: WebSocketMessage): void {
    for (const clientId of this.clients.keys()) {
      this.sendToClient(clientId, message);
    }
  }

  // ==================== 便捷方法 ====================

  notifyAgentStatusUpdate(agentId: string, status: string, currentTask?: string): void {
    this.broadcastToChannel('agents', {
      type: 'AGENT_STATUS_UPDATE',
      data: { agentId, status, currentTask, progress: 0.65 },
      timestamp: Date.now(),
    });
  }

  notifyTaskStatusChanged(taskId: string, previousStatus: string, newStatus: string): void {
    this.broadcastToChannel('tasks', {
      type: 'TASK_STATUS_CHANGED',
      data: { taskId, previousStatus, newStatus },
      timestamp: Date.now(),
    });
  }

  notifyAlert(alert: any): void {
    this.broadcastToChannel('alerts', {
      type: 'ALERT',
      data: alert,
      timestamp: Date.now(),
    });
  }

  requestHumanIntervention(taskId: string, reason: string, options: any[]): void {
    this.broadcastToChannel('interventions', {
      type: 'HUMAN_INTERVENTION_REQUIRED',
      data: { taskId, reason, options, timeout: 300000 },
      timestamp: Date.now(),
    });
  }

  // ==================== 统计信息 ====================

  getStats(): {
    totalClients: number;
    authenticatedClients: number;
    channels: Record<string, number>;
  } {
    const stats = {
      totalClients: this.clients.size,
      authenticatedClients: 0,
      channels: {} as Record<string, number>,
    };

    for (const client of this.clients.values()) {
      if (client.authenticated) {
        stats.authenticatedClients++;
      }
    }

    for (const [channel, clients] of this.channels.entries()) {
      stats.channels[channel] = clients.size;
    }

    return stats;
  }
}

export default WebSocketManager;
