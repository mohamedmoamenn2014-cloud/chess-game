import { PieceColor, TimeControl, ChatMessage } from '../types/chess';

export interface P2PMessage {
  type: 
    | 'MOVE' 
    | 'SYNC_STATE' 
    | 'CHAT' 
    | 'DRAW_OFFER' 
    | 'DRAW_ACCEPT' 
    | 'DRAW_REJECT' 
    | 'RESIGN' 
    | 'REMATCH_OFFER' 
    | 'REMATCH_ACCEPT'
    | 'TAKEBACK_REQUEST'
    | 'TAKEBACK_ACCEPT'
    | 'TAKEBACK_REJECT';
  payload?: any;
  timestamp: number;
}

export type P2PEventListener = (message: P2PMessage) => void;

class WebRTCOnlineService {
  private peer: any = null;
  private connection: any = null;
  private myPeerId: string = '';
  private currentRoomCode: string = '';
  private isHost: boolean = false;
  private listeners: P2PEventListener[] = [];
  private onConnectionChangeCallbacks: ((connected: boolean) => void)[] = [];

  // Generate random 6-character room code
  public generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Ensure PeerJS library is loaded dynamically
  private async loadPeerJS(): Promise<any> {
    if ((window as any).Peer) {
      return (window as any).Peer;
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';
      script.async = true;
      script.onload = () => resolve((window as any).Peer);
      script.onerror = () => reject(new Error('Failed to load PeerJS from CDN'));
      document.head.appendChild(script);
    });
  }

  // Create room as host
  public async createRoom(
    roomCode: string,
    onOpen: (peerId: string) => void,
    onGuestConnect: () => void,
    onError: (err: any) => void
  ) {
    try {
      const PeerClass = await this.loadPeerJS();
      this.currentRoomCode = roomCode;
      this.isHost = true;

      // Prefix room code to prevent collision in public peerjs broker
      const formattedId = `prochess-${roomCode.toUpperCase()}`;
      this.peer = new PeerClass(formattedId, {
        debug: 1
      });

      this.peer.on('open', (id: string) => {
        this.myPeerId = id;
        onOpen(roomCode);
      });

      this.peer.on('connection', (conn: any) => {
        this.connection = conn;
        this.setupConnectionHandlers();
        onGuestConnect();
        this.notifyConnectionChange(true);
      });

      this.peer.on('error', (err: any) => {
        console.warn('PeerJS Host Error:', err);
        onError(err);
      });
    } catch (e) {
      onError(e);
    }
  }

  // Join room as guest
  public async joinRoom(
    roomCode: string,
    onConnected: () => void,
    onError: (err: any) => void
  ) {
    try {
      const PeerClass = await this.loadPeerJS();
      this.currentRoomCode = roomCode;
      this.isHost = false;

      this.peer = new PeerClass(undefined, { debug: 1 });

      this.peer.on('open', () => {
        const targetId = `prochess-${roomCode.toUpperCase()}`;
        const conn = this.peer.connect(targetId, {
          reliable: true
        });

        this.connection = conn;
        this.setupConnectionHandlers();

        conn.on('open', () => {
          onConnected();
          this.notifyConnectionChange(true);
        });

        conn.on('error', (err: any) => {
          onError(err);
        });
      });

      this.peer.on('error', (err: any) => {
        onError(err);
      });
    } catch (e) {
      onError(e);
    }
  }

  private setupConnectionHandlers() {
    if (!this.connection) return;

    this.connection.on('data', (data: P2PMessage) => {
      this.listeners.forEach((fn) => fn(data));
    });

    this.connection.on('close', () => {
      this.notifyConnectionChange(false);
    });

    this.connection.on('error', () => {
      this.notifyConnectionChange(false);
    });
  }

  public sendMessage(msg: Omit<P2PMessage, 'timestamp'>) {
    if (this.connection && this.connection.open) {
      const fullMsg: P2PMessage = {
        ...msg,
        timestamp: Date.now()
      };
      this.connection.send(fullMsg);
    }
  }

  public onMessage(fn: P2PEventListener) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  public onConnectionChange(fn: (connected: boolean) => void) {
    this.onConnectionChangeCallbacks.push(fn);
    return () => {
      this.onConnectionChangeCallbacks = this.onConnectionChangeCallbacks.filter((c) => c !== fn);
    };
  }

  private notifyConnectionChange(connected: boolean) {
    this.onConnectionChangeCallbacks.forEach((cb) => cb(connected));
  }

  public disconnect() {
    if (this.connection) {
      try {
        this.connection.close();
      } catch (e) {}
      this.connection = null;
    }
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch (e) {}
      this.peer = null;
    }
    this.listeners = [];
  }

  public getIsHost(): boolean {
    return this.isHost;
  }

  public getRoomCode(): string {
    return this.currentRoomCode;
  }
}

export const webRTCService = new WebRTCOnlineService();
