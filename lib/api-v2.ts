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
  id: string | number;
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
  id: string | number;
  name: string;
  startDate: string;
  eventStatusType: string;
  sport: {
    id: string | number;
    name: string;
    ref: string;
  };
  competition: {
    id: string | number;
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
    id: string | number;
    name: string;
    ref: string;
  };
  // Fields that can be either object (competitions API) or array (by-ids API)
  metadataProperties: {
    [key: string]: string;
  } | Array<{
    name: string;
    value: string;
    isDeleted: boolean;
  }>;
  
  // Additional fields present in by-ids API response
  season?: {
    id: number;
    name: string;
    ref: string;
  };
  locality?: {
    id: number;
    name: string;
    ref: string;
  };
  timezone?: {
    id: number;
    name: string;
    ref: string;
  };
  genderType?: string;
  ageCategory?: string;
  eventType?: string;
  isProtected?: boolean;
  createdOn?: string;
  updatesCount?: number;
  isDeleted?: boolean;
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

export interface FixturesByIdsResponse extends Omit<FixturesResponse, 'next'> {
  requestedFixtures: number;
  fixtureIds: number[];
}

export const apiV2 = {
  // Get recent fixtures with efficient pagination and search
  getRecentFixtures: async (page = 1, limit = 20, search?: string): Promise<FixturesResponse> => {
    try {
      const params: { page: number; limit: number; search?: string } = { page, limit };
      if (search && search.trim()) {
        params.search = search.trim();
      }
      
      const { data } = await axiosInstance.get<FixturesResponse>('/v2/fixtures/recent?status=notfinished', {
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
        const { data } = await axiosInstance.get<FixturesResponse>('/v2/fixtures/recent?status=notfinished', {
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
          // If user has full bundle access, fetch all competition IDs from leagues table
          const { data: leaguesData, error: leaguesError } = await supabase
            .from('leagues')
            .select('id');
          
          if (leaguesError) {
            console.error('Error fetching leagues:', leaguesError);
            throw new Error('Failed to fetch leagues data');
          }
          
          const fullBundleCompetitionIds = leaguesData.map(league => league.id.toString());
          
          const { data } = await axiosInstance.post<FixturesResponse>('/v2/fixtures/by-competitions', {
            competitionIds: fullBundleCompetitionIds
          }, {
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
  },

  // Get user's accessible fixture IDs from database
  getUserFixtureIds: async (): Promise<number[]> => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if user is admin
      const isAdmin = await adminService.isAdmin();
      
      if (isAdmin) {
        // Admins can see all fixtures, but we need to return some default IDs
        // or implement a different approach for admins
        return [];
      }

      // Get user's fixture access from database
      const userFixtureAccess = await adminService.getUserFixtureAccess(user.id);
      
      // Convert fixture IDs to numbers (they're stored as strings in DB)
      const fixtureIds = userFixtureAccess
        .map(access => {
          const id = parseInt(access.fixture_id);
          return isNaN(id) ? null : id;
        })
        .filter((id): id is number => id !== null);

      return fixtureIds;
    } catch (error) {
      console.error('Error fetching user fixture IDs:', error);
      return [];
    }
  },

  // Get fixtures by specific IDs for regular users
  getFixturesByIds: async (fixtureIds?: number[], pageSize = 100): Promise<FixturesByIdsResponse> => {
    try {
      // If no fixture IDs provided, get user's accessible fixture IDs
      if (!fixtureIds || fixtureIds.length === 0) {
        fixtureIds = await apiV2.getUserFixtureIds();
      }

      // If still no fixture IDs, return empty response
      if (!fixtureIds || fixtureIds.length === 0) {
        return {
          page: 1,
          pageSize: 0,
          totalItems: 0,
          items: [],
          self: '',
          first: '',
          last: '',
          requestedFixtures: 0,
          fixtureIds: []
        };
      }

      // Check if user is admin
      const isAdmin = await adminService.isAdmin();
      
      if (isAdmin) {
        // Admins can get fixtures by IDs directly
        const { data } = await axiosInstance.post<FixturesByIdsResponse>('/v2/fixtures/by-ids', {
          fixtureIds,
          pageSize
        });
        return data;
      } else {
        // Regular users need to check league access
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
          // If user has full bundle access, get fixtures by IDs
          const { data } = await axiosInstance.post<FixturesByIdsResponse>('/v2/fixtures/by-ids', {
            fixtureIds,
            pageSize
          });
          return data;
        }
        
        // For regular users: If they have fixture IDs, they already have direct access
        // Fixture access is more specific than league access, so we don't filter by leagues
        const { data } = await axiosInstance.post<FixturesByIdsResponse>('/v2/fixtures/by-ids', {
          fixtureIds,
          pageSize
        });
        
        // Return the fixtures without filtering - user already has direct access to these specific fixtures
        return data;
      }
    } catch (error) {
      console.error('Error fetching fixtures by IDs:', error);
      throw error;
    }
  }
}; 



