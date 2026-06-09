/**
 * WebSocket Tests
 * Tests for WebSocket real-time communication
 */

import { WebSocket } from 'ws';
import { createServer } from 'http';
import express from 'express';
import WebSocketManager from '../src/api/websocket';

describe('WebSocket Tests', () => {
  let server: ReturnType<typeof createServer>;
  let wsManager: WebSocketManager;
  let wsUrl: string;

  beforeAll((done) => {
    const app = express();
    server = createServer(app);
    wsManager = new WebSocketManager();
    wsManager.initialize(server);

    server.listen(0, () => {
      const port = (server.address() as any).port;
      wsUrl = `ws://localhost:${port}`;
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should connect to WebSocket server', (done) => {
    const ws = new WebSocket(wsUrl);

    ws.on('open', () => {
      expect(ws.readyState).toBe(WebSocket.OPEN);
      ws.close();
      done();
    });

    ws.on('error', (err) => {
      done(err);
    });
  });

  it('should send and receive messages', (done) => {
    const ws = new WebSocket(wsUrl);

    ws.on('open', () => {
      const message = {
        type: 'subscribe',
        channel: 'agent-status',
      };
      ws.send(JSON.stringify(message));
    });

    ws.on('message', (data) => {
      const response = JSON.parse(data.toString());
      expect(response).toHaveProperty('type');
      ws.close();
      done();
    });

    ws.on('error', (err) => {
      done(err);
    });
  });

  it('should broadcast agent status updates', (done) => {
    const ws1 = new WebSocket(wsUrl);
    const ws2 = new WebSocket(wsUrl);
    let connectedCount = 0;

    const checkDone = () => {
      connectedCount++;
      if (connectedCount === 2) {
        // Broadcast a message
        wsManager.broadcast({
          type: 'agent-status',
          data: {
            agentId: 'test-agent',
            status: 'IDLE',
          },
        });
      }
    };

    ws1.on('open', checkDone);
    ws2.on('open', checkDone);

    let receivedCount = 0;
    const checkReceived = () => {
      receivedCount++;
      if (receivedCount === 2) {
        ws1.close();
        ws2.close();
        done();
      }
    };

    ws1.on('message', (data) => {
      const message = JSON.parse(data.toString());
      if (message.type === 'agent-status') {
        checkReceived();
      }
    });

    ws2.on('message', (data) => {
      const message = JSON.parse(data.toString());
      if (message.type === 'agent-status') {
        checkReceived();
      }
    });
  });

  it('should handle disconnection gracefully', (done) => {
    const ws = new WebSocket(wsUrl);

    ws.on('open', () => {
      ws.close();
    });

    ws.on('close', () => {
      expect(ws.readyState).toBe(WebSocket.CLOSED);
      done();
    });

    ws.on('error', (err) => {
      done(err);
    });
  });
});
