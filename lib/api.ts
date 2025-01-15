import axios from 'axios';
import io from 'socket.io-client';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

export interface Fixture {
  fixtureId: string;
  status: string;
  origin: string;
  startDateUtc: string;
  name: string;
  competitionName: string;
}

// Optimized axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 3000, // Reduced timeout
  headers: {
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0',
  }
});

// Singleton WebSocket connection with optimized settings
// Update the SocketManager class
class SocketManager {
  private static instance: SocketManager;
  private socket: any;
  private subscriptions: Map<string, Set<(data: any) => void>>;
  private messageBuffer: Map<string, any[]>;
  private bufferTimeout: number = 16; // ~60fps
  private maxBufferSize: number = 10;
  private processingTimers: Map<string, NodeJS.Timeout>;

  private constructor() {
    this.subscriptions = new Map();
    this.messageBuffer = new Map();
    this.processingTimers = new Map();
    this.initSocket();
  }

  static getInstance() {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  private initSocket() {
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 2000,
      forceNew: false,
      // Enable binary data transfer for better performance
      binaryType: 'arraybuffer',
      // Increase performance with larger buffer size
      maxHttpBufferSize: 1e8,
      // Reduce ping interval for more responsive connection
      pingInterval: 2000,
      pingTimeout: 5000
    });

    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.resubscribeAll();
    });

    this.socket.on('disconnect', (reason: string) => {
      if (reason === 'io server disconnect') {
        this.socket.connect();
      }
    });
  }

  private resubscribeAll() {
    this.subscriptions.forEach((_, fixtureId) => {
      this.socket.emit('subscribe', fixtureId);
    });
  }

  private processMessageBuffer(fixtureId: string) {
    const buffer = this.messageBuffer.get(fixtureId) || [];
    if (buffer.length === 0) return;

    // Get callbacks for this fixture
    const callbacks = this.subscriptions.get(fixtureId);
    if (!callbacks) return;

    // Process all messages in the buffer
    const latestMessage = buffer[buffer.length - 1];
    
    // Use requestAnimationFrame for smooth updates
    requestAnimationFrame(() => {
      callbacks.forEach(callback => {
        try {
          callback(latestMessage);
        } catch (error) {
          console.error('Error in callback:', error);
        }
      });
    });

    // Clear the buffer
    this.messageBuffer.set(fixtureId, []);
  }

  subscribe(fixtureId: string, callback: (data: any) => void) {
    if (!this.subscriptions.has(fixtureId)) {
      this.subscriptions.set(fixtureId, new Set());
      this.messageBuffer.set(fixtureId, []);
      this.socket.emit('subscribe', fixtureId);

      // Set up event listener for this fixture
      this.socket.on(`fixture:${fixtureId}`, (data: any) => {
        const buffer = this.messageBuffer.get(fixtureId) || [];
        buffer.push(data);
        this.messageBuffer.set(fixtureId, buffer);

        // Clear existing timer
        const existingTimer = this.processingTimers.get(fixtureId);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }

        // Process immediately if buffer is full
        if (buffer.length >= this.maxBufferSize) {
          this.processMessageBuffer(fixtureId);
        } else {
          // Schedule processing
          const timer = setTimeout(() => {
            this.processMessageBuffer(fixtureId);
          }, this.bufferTimeout);
          this.processingTimers.set(fixtureId, timer);
        }
      });
    }

    const callbacks = this.subscriptions.get(fixtureId)!;
    callbacks.add(callback);

    return () => {
      const callbacks = this.subscriptions.get(fixtureId);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.unsubscribe(fixtureId);
        }
      }
    };
  }

  private unsubscribe(fixtureId: string) {
    this.socket.off(`fixture:${fixtureId}`);
    this.socket.emit('unsubscribe', fixtureId);
    this.subscriptions.delete(fixtureId);
    this.messageBuffer.delete(fixtureId);
    
    const timer = this.processingTimers.get(fixtureId);
    if (timer) {
      clearTimeout(timer);
      this.processingTimers.delete(fixtureId);
    }
  }
}

export const api = {
  getLiveFixtures: async () => {
    try {
      const { data } = await axiosInstance.get<Fixture[]>('/fixtures/live/enhanced');
      return data;
    } catch (error) {
      console.error('Error fetching live fixtures:', error);
      throw error;
    }
  },

  getFixture: async (fixtureId: string) => {
    try {
      const { data } = await axiosInstance.get<Fixture>(`/fixtures/${fixtureId}`);
      return data;
    } catch (error) {
      console.error('Error fetching fixture:', error);
      throw error;
    }
  },

  subscribeToFixture: (fixtureId: string, onUpdate: (data: any) => void) => {
    const socketManager = SocketManager.getInstance();
    return socketManager.subscribe(fixtureId, onUpdate);
  },

  getLastAction: async (fixtureId: string) => {
    try {
      const { data } = await axiosInstance.get(`/feed/${fixtureId}/last-action`);
      return data;
    } catch (error) {
      console.error('Error fetching last action:', error);
      throw error;
    }
  },

  startFeed: async (fixtureId: string) => {
    const { data } = await axiosInstance.post(`/feed/start/${fixtureId}`);
    return data;
  },

  stopFeed: async (fixtureId: string) => {
    const { data } = await axiosInstance.post(`/feed/stop/${fixtureId}`);
    return data;
  },

  stopAllFeeds: async () => {
    const { data } = await axiosInstance.post('/feed/stop-all');
    return data;
  },

  getFeedView: async (fixtureId: string) => {
    const { data } = await axiosInstance.post(`/feed/${fixtureId}/view`);
    return data;
  }
};