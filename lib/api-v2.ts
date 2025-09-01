import axios from 'axios';
import { adminService } from '@/lib/admin-service';
import { createClient } from '@/lib/supabase/client';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Efficient axios instance with caching and optimized settings
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    'Accept': 'application/json',
    'Cache-Control': 'max-age=10', // Cache for 10 seconds for better performance
  }
});

export interface Competitor {
  id: string;
  name: string;
  competitorType: string;
  ref: string;
  metadataProperties: Array<{
    name: string;
    value: string;
    isDeleted: boolean;
  }>;
}

export interface FixtureV2 {
  id: string;
  name: string;
  startDate: string;
  eventStatusType: string;
  sport: {
    id: string;
    name: string;
    ref: string;
  };
  competition: {
    id: string;
    name: string;
    ref: string;
  };
  competitors: Competitor[];
  homeCompetitor: Competitor;
  venue?: {
    id: string;
    name: string;
    ref: string;
  };
  round?: {
    id: string;
    name: string;
    ref: string;
  };
  metadataProperties: {
    [key: string]: string;
  };
}

export interface FixturesResponse {
  page: number;
  pageSize: number;
  totalItems: number;
  items: FixtureV2[];
  self: string;
  next?: string;
  first: string;
  last: string;
}

export const apiV2 = {
  // Get recent fixtures with efficient pagination and search
  getRecentFixtures: async (page = 1, limit = 20, search?: string): Promise<FixturesResponse> => {
    try {
      const params: { page: number; limit: number; search?: string } = { page, limit };
      if (search && search.trim()) {
        params.search = search.trim();
      }
      
      const { data } = await axiosInstance.get<FixturesResponse>('/v2/fixtures/recent', {
        params
      });
      return data;
    } catch (error) {
      console.error('Error fetching recent fixtures:', error);
      throw error;
    }
  },

  // Get a specific fixture by ID with caching
  getFixture: async (fixtureId: string): Promise<FixtureV2> => {
    try {
      const { data } = await axiosInstance.get<FixtureV2>(`/v2/fixtures/${fixtureId}`);
      return data;
    } catch (error) {
      console.error(`Error fetching fixture ${fixtureId}:`, error);
      throw error;
    }
  },

  // Get fixtures by competitions for regular users based on their league access
  getFixturesByCompetitions: async (page = 1, limit = 20, search?: string): Promise<FixturesResponse> => {
    try {
      // Check if user is admin
      const isAdmin = await adminService.isAdmin();
      
      // Prepare params for both admin and user requests
      const params: { page: number; limit: number; search?: string } = { page, limit };
      if (search && search.trim()) {
        params.search = search.trim();
      }
      
      if (isAdmin) {
        // Admins get all recent fixtures with pagination and search
        const { data } = await axiosInstance.get<FixturesResponse>('/v2/fixtures/recent', {
          params
        });
        return data;
      } else {
        // Regular users get fixtures based on their league access
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        // Get user's league access
        const userLeagues = await adminService.getUserLeagueAccess(user.id);
        const competitionIds = userLeagues.map(ul => ul.league_id);
        
        // Check if user has the special "full bundle" competition ID (987123645)
        const hasFullBundle = competitionIds.includes('987123645');
        
        if (hasFullBundle) {
          // If user has full bundle access, get all recent fixtures
          const { data } = await axiosInstance.get<FixturesResponse>('/v2/fixtures/recent', {
            params
          });
          return data;
        }
        
        // If user has no league access, return empty response
        if (competitionIds.length === 0) {
          return {
            page: 1,
            pageSize: 0,
            totalItems: 0,
            items: [],
            self: '',
            first: '',
            last: ''
          };
        }
        
        // Fetch fixtures for user's competitions with pagination and search
        const { data } = await axiosInstance.post<FixturesResponse>('/v2/fixtures/by-competitions', {
          competitionIds
        }, {
          params
        });
        return data;
      }
    } catch (error) {
      console.error('Error fetching fixtures by competitions:', error);
      throw error;
    }
  }
}; 



