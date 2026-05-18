import type { ClientMsg, ServerMsg } from '@shared/protocol';

export type ConnState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

export interface SyncClientOptions {
  url: string; // WebSocket URL
  onMessage: (msg: ServerMsg) => void;
  onState: (state: ConnState) => void;
  pingIntervalMs?: number;
  reconnectBaseMs?: number;
  reconnectMaxMs?: number;
}

export class SyncClient {
  private ws: WebSocket | null = null;
  private state: ConnState = 'idle';
  private pingTimer: number | null = null;
  private reconnectTimer: number | null = null;
  private retryCount = 0;
  private closedByUser = false;
  private opts: SyncClientOptions;

  constructor(opts: SyncClientOptions) {
    this.opts = opts;
  }

  start(): void {
    this.closedByUser = false;
    this.connect();
  }

  stop(): void {
    this.closedByUser = true;
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.pingTimer !== null) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
    if (this.ws) {
      try {
        this.ws.close(1000, 'user');
      } catch {
        // ignore
      }
      this.ws = null;
    }
    this.setState('idle');
  }

  send(msg: ClientMsg): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(msg));
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  // スマホがバックグラウンドから復帰した時など、WSが実は死んでいるケースの強制再接続
  forceReconnect(): void {
    if (this.closedByUser) return;
    if (this.ws) {
      try {
        this.ws.close(4000, 'force-reconnect');
      } catch {
        // ignore
      }
      this.ws = null;
    }
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.retryCount = 0;
    this.connect();
  }

  isOpen(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private setState(s: ConnState): void {
    if (this.state === s) return;
    this.state = s;
    this.opts.onState(s);
  }

  private connect(): void {
    this.setState('connecting');
    let ws: WebSocket;
    try {
      ws = new WebSocket(this.opts.url);
    } catch (e) {
      this.setState('error');
      this.scheduleReconnect();
      return;
    }
    this.ws = ws;

    ws.onopen = () => {
      this.retryCount = 0;
      this.setState('connected');
      this.startPing();
    };

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data as string) as ServerMsg;
        this.opts.onMessage(msg);
      } catch {
        // ignore malformed
      }
    };

    ws.onclose = () => {
      this.stopPing();
      this.ws = null;
      if (this.closedByUser) {
        this.setState('idle');
        return;
      }
      this.setState('disconnected');
      this.scheduleReconnect();
    };

    ws.onerror = () => {
      this.setState('error');
    };
  }

  private scheduleReconnect(): void {
    if (this.closedByUser) return;
    const base = this.opts.reconnectBaseMs ?? 1000;
    const max = this.opts.reconnectMaxMs ?? 15000;
    const delay = Math.min(max, base * Math.pow(1.6, this.retryCount));
    this.retryCount += 1;
    if (this.reconnectTimer !== null) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private startPing(): void {
    this.stopPing();
    const interval = this.opts.pingIntervalMs ?? 25_000;
    this.pingTimer = window.setInterval(() => {
      this.send({ type: 'PING' });
    }, interval);
  }

  private stopPing(): void {
    if (this.pingTimer !== null) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }
}

export const buildSyncUrl = (room: string): string => {
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const host = window.location.host;
  return `${proto}://${host}/ws?room=${encodeURIComponent(room)}`;
};
