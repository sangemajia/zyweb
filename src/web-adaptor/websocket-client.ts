// WebSocket 客户端，用于在 Web 环境中处理实时通信
class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectInterval: number;
  private reconnectAttempts: number;
  private maxReconnectAttempts: number;
  private listeners: Map<string, Array<(...args: any[]) => void>> = new Map();

  constructor(url: string, options?: { reconnectInterval?: number; maxReconnectAttempts?: number }) {
    this.url = url;
    this.reconnectInterval = options?.reconnectInterval || 5000;
    this.maxReconnectAttempts = options?.maxReconnectAttempts || 10;
    this.reconnectAttempts = 0;
  }

  // 连接到 WebSocket 服务器
  connect(): void {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('[WebSocket] Connected to server');
        this.reconnectAttempts = 0;
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[WebSocket] Received message:', data);
          this.emit('message', data);

          // 如果消息包含频道信息，触发相应的事件
          if (data.channel) {
            this.emit(data.channel, data.data);
          }
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('[WebSocket] Connection closed');
        this.emit('disconnected');

        // 尝试重新连接
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(
            `[WebSocket] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`,
          );
          setTimeout(() => this.connect(), this.reconnectInterval);
        } else {
          console.error('[WebSocket] Max reconnect attempts reached');
          this.emit('reconnectFailed');
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Connection error:', error);
        this.emit('error', error);
      };
    } catch (error) {
      console.error('[WebSocket] Failed to connect:', error);
    }
  }

  // 发送消息
  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        const message = typeof data === 'string' ? data : JSON.stringify(data);
        this.ws.send(message);
      } catch (error) {
        console.error('[WebSocket] Failed to send message:', error);
      }
    } else {
      console.warn('[WebSocket] Connection not open, message not sent');
    }
  }

  // 发送到特定频道
  sendToChannel(channel: string, data: any): void {
    this.send({ channel, data });
  }

  // 关闭连接
  close(): void {
    if (this.ws) {
      this.ws.close();
    }
  }

  // 添加事件监听器
  on(event: string, listener: (...args: any[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  // 移除事件监听器
  off(event: string, listener: (...args: any[]) => void): void {
    if (this.listeners.has(event)) {
      const listeners = this.listeners.get(event)!;
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // 触发事件
  private emit(event: string, ...args: any[]): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach((listener) => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`[WebSocket] Error in listener for event ${event}:`, error);
        }
      });
    }
  }

  // 检查连接状态
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// 创建全局 WebSocket 客户端实例
const webSocketClient = new WebSocketClient('ws://localhost:9978');

// 导出 WebSocket 客户端
export { webSocketClient, WebSocketClient };
