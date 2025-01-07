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
class SocketManager {
  private static instance: SocketManager;
  private socket: any;
  private subscriptions: Map<string, Set<(data: any) => void>>;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  private constructor() {
    this.subscriptions = new Map();
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
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 3000,
      forceNew: false
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.reconnectAttempts = 0;
      
      // Resubscribe to all fixtures after reconnection
      this.subscriptions.forEach((callbacks, fixtureId) => {
        this.socket.emit('subscribe', fixtureId);
      });
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        this.socket.connect();
      }
    });
  }

  subscribe(fixtureId: string, callback: (data: any) => void) {
    if (!this.subscriptions.has(fixtureId)) {
      this.subscriptions.set(fixtureId, new Set());
      this.socket.emit('subscribe', fixtureId);
    }
    
    const callbacks = this.subscriptions.get(fixtureId)!;
    callbacks.add(callback);
    
    // Set up event listener if not already set
    if (callbacks.size === 1) {
      this.socket.on(`fixture:${fixtureId}`, (data: any) => {
        callbacks.forEach(cb => cb(data));
      });
    }

    return () => {
      const callbacks = this.subscriptions.get(fixtureId);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.socket.off(`fixture:${fixtureId}`);
          this.socket.emit('unsubscribe', fixtureId);
          this.subscriptions.delete(fixtureId);
        }
      }
    };
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