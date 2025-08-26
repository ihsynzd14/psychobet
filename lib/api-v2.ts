import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://51.89.167.87:3000/api';

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
  }
}; 