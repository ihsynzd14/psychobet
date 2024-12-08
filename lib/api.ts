import axios from 'axios';
import io from 'socket.io-client';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

export interface Fixture {
  fixtureId: string;
  timeRaisedUtc: string;
  startDateUtc: string;
  status: string;
  origin: string;
  lineups: string;
}

// Configure axios instance with optimized settings
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0',
  }
});

// Socket.io connection with reconnection handling
let socket: any;

const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      timeout: 10000
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('disconnect', (reason: string) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Reconnect if server disconnected
        socket.connect();
      }
    });
  }
  return socket;
};

export const api = {
  getLiveFixtures: async () => {
    try {
      const { data } = await axiosInstance.get<Fixture[]>('/fixtures/live');
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
    const socket = getSocket();
    
    // Clean up any existing subscription
    socket.off(`fixture:${fixtureId}`);
    
    // Subscribe to new fixture
    socket.emit('subscribe', fixtureId);
    socket.on(`fixture:${fixtureId}`, onUpdate);
    
    // Return cleanup function
    return () => {
      socket.off(`fixture:${fixtureId}`, onUpdate);
      socket.emit('unsubscribe', fixtureId);
    };
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