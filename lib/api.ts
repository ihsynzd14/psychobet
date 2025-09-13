import axios from 'axios';
import io from 'socket.io-client';
import { createClient } from '@/lib/supabase/client';
import { adminService } from '@/lib/admin-service';

// Default URLs with fallbacks
const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const DEFAULT_SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

// Channel-specific URLs
const CHANNEL_A_BASE_URL = 'http://51.89.167.87:3000/api';
const CHANNEL_A_SOCKET_URL = 'http://51.89.167.87:3000';
const CHANNEL_B_BASE_URL = 'http://51.89.167.87:3003/api';
const CHANNEL_B_SOCKET_URL = 'http://51.89.167.87:3003';

// Store the currently active channel
let activeChannel: 'A' | 'B' | null = null;
let BASE_URL = DEFAULT_BASE_URL;
let SOCKET_URL = DEFAULT_SOCKET_URL;

export interface Fixture {
  fixtureId: string;
  status: string;
  origin: string;
  startDateUtc: string;
  name: string;
  competitionName: string;
}

// Function to get axios instance with the current BASE_URL
const getAxiosInstance = () => {
  return axios.create({
    baseURL: BASE_URL,
    timeout: 3000, // Reduced timeout
    headers: {
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': '0',
    }
  });
};

// Function to set the active channel
export const setApiChannel = (channel: 'A' | 'B' | null) => {
  activeChannel = channel;
  
  if (channel === 'A') {
    BASE_URL = CHANNEL_A_BASE_URL;
    SOCKET_URL = CHANNEL_A_SOCKET_URL;
  } else if (channel === 'B') {
    BASE_URL = CHANNEL_B_BASE_URL;
    SOCKET_URL = CHANNEL_B_SOCKET_URL;
  } else {
    BASE_URL = DEFAULT_BASE_URL;
    SOCKET_URL = DEFAULT_SOCKET_URL;
  }
  
  console.log(`API channel set to ${channel || 'default'}, using URL: ${BASE_URL}`);
  console.log(`Socket URL set to: ${SOCKET_URL}`);
  
  // Re-initialize socket if it exists
  if (SocketManager.hasInstance()) {
    SocketManager.getInstance().reinitSocket();
  }
  
  return { baseUrl: BASE_URL, socketUrl: SOCKET_URL };
};

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
  
  static hasInstance() {
    return !!SocketManager.instance;
  }
  
  // Method to reinitialize socket when channel changes
  reinitSocket() {
    console.log('Reinitializing socket connection with new URL:', SOCKET_URL);
    
    // Disconnect existing socket if any
    if (this.socket && this.socket.connected) {
      this.socket.disconnect();
    }
    
    // Initialize new socket with updated URL
    this.initSocket();
    
    // Resubscribe to all fixtures
    this.subscriptions.forEach((callbacks, fixtureId) => {
      this.socket.emit('subscribe', fixtureId);
    });
  }

  private initSocket() {
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 3000,
      forceNew: true // Always create a new connection when reinitializing
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
  // Check if a user has access to a specific fixture
  checkUserFixtureAccess: async (userId: string, fixtureId: string): Promise<boolean> => {
    try {
      const supabase = createClient();
      
      // Check if user is admin (admins have access to all fixtures)
      const isAdmin = await adminService.isAdmin();
      if (isAdmin) {
        return true;
      }
      
      // Check if user has direct fixture access
      const { data, error } = await supabase
        .from('user_fixture_access')
        .select('id')
        .eq('user_id', userId)
        .eq('fixture_id', fixtureId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "JSON object requested, multiple (or no) rows returned"
        console.error('Error checking fixture access:', error);
        return false;
      }
      
      // If we have data, user has direct access
      if (data) {
        return true;
      }
      
      // Check if user has access through league access
      // Get the fixture details to find its competition ID
      try {
        const { apiV2 } = await import('@/lib/api-v2');
        const fixture = await apiV2.getFixture(fixtureId);
        
        if (fixture && fixture.competition) {
          // Get user's league access
          const userLeagueAccess = await adminService.getUserLeagueAccess(userId);
          
          if (userLeagueAccess && userLeagueAccess.length > 0) {
            // Check if user has access to this fixture's competition
            const competitionId = fixture.competition.id.toString();
            const userLeagueIds = userLeagueAccess.map(ula => ula.league_id);
            
            // Check for direct competition match or full bundle access
            const hasCompetitionAccess = userLeagueIds.includes(competitionId) || userLeagueIds.includes('987123645');
            
            if (hasCompetitionAccess) {
              return true;
            }
          }
        }
      } catch (fixtureError) {
        console.error('Error fetching fixture details for league access check:', fixtureError);
        // If we can't fetch fixture details, fall back to direct access only
      }
      
      return false;
    } catch (error) {
      console.error('Error checking fixture access:', error);
      return false;
    }
  },
  
  // Get all fixtures a user has access to
  getUserAccessibleFixtures: async (userId: string): Promise<string[]> => {
    try {
      const supabase = createClient();
      
      // Check if user is admin (admins have access to all fixtures)
      const isAdmin = await adminService.isAdmin();
      if (isAdmin) {
        // Return empty array for admins since they have access to all fixtures
        return [];
      }
      
      // Get user's direct fixture access
      const { data, error } = await supabase
        .from('user_fixture_access')
        .select('fixture_id')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error getting user fixture access:', error);
        return [];
      }
      
      const directFixtureIds = data.map(item => item.fixture_id);
      
      // Note: For league-based access, we can't easily return all accessible fixture IDs
      // since that would require fetching all fixtures and checking their competitions.
      // Instead, the individual checkUserFixtureAccess function should be used
      // to verify access for specific fixtures.
      // This function primarily returns direct fixture access for compatibility.
      
      return directFixtureIds;
    } catch (error) {
      console.error('Error getting user accessible fixtures:', error);
      return [];
    }
  },

  // Get current active channel
  getActiveChannel: (): { channel: 'A' | 'B' | null, baseUrl: string, socketUrl: string } => {
    return {
      channel: activeChannel,
      baseUrl: BASE_URL,
      socketUrl: SOCKET_URL
    };
  },

  getLiveFixtures: async () => {
    try {
      const { data } = await getAxiosInstance().get<Fixture[]>('/fixtures/live/enhanced');
      return data;
    } catch (error) {
      console.error('Error fetching live fixtures:', error);
      throw error;
    }
  },

  getFixture: async (fixtureId: string) => {
    try {
      const { data } = await getAxiosInstance().get<Fixture>(`/fixtures/${fixtureId}`);
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
      const { data } = await getAxiosInstance().get(`/feed/${fixtureId}/last-action`);
      return data;
    } catch (error) {
      console.error('Error fetching last action:', error);
      throw error;
    }
  },

  startFeed: async (fixtureId: string) => {
    const { data } = await getAxiosInstance().post(`/feed/start/${fixtureId}`);
    return data;
  },

  stopFeed: async (fixtureId: string) => {
    const { data } = await getAxiosInstance().post(`/feed/stop/${fixtureId}`);
    return data;
  },

  stopAllFeeds: async () => {
    const { data } = await getAxiosInstance().post('/feed/stop-all');
    return data;
  },

  getFeedView: async (fixtureId: string) => {
    const { data } = await getAxiosInstance().post(`/feed/${fixtureId}/view`);
    return data;
  }
};