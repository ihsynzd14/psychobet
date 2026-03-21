import { useState, useEffect, useCallback, useMemo } from 'react';
import { adminService, UserDetails, UserFixtureAccessWithDetails } from '@/lib/admin-service';
import { apiV2, FixtureV2, type FixtureNameIndexResponse } from '@/lib/api-v2';
import { normalizeSearchTerm } from '@/lib/utils';
import { toast } from 'sonner';

interface FixtureAccessState {
  users: UserDetails[];
  loadingUsers: boolean;
  loadingFixtures: boolean;
  error: string | null;
  userSearchTerm: string;
  fixtureSearchTerm: string;
  selectedUsers: Set<string>;
  selectedFixtures: Set<string>;
  userFixturesMap: Map<string, string[]>;
  fixtures: FixtureV2[];
  selectedFixtureDetails: Map<string, FixtureV2>;
  selectedUserDetails: Map<string, UserDetails>;
  currentPage: number;
  totalPages: number;
  totalFixtures: number;
  showGrantDialog: boolean;
  showRevokeDialog: boolean;
  showSelectedUsers: boolean;
  showSelectedFixtures: boolean;
  showFixtureDetails: boolean;
  selectedUserForDetails: string | null;
  userFixtureAccessData: UserFixtureAccessWithDetails[];
  loadingUserFixtureAccess: boolean;
  removingUserId: string | null;
  nameIndex: FixtureNameIndexResponse | null;
  nameIndexLoading: boolean;
}

interface UseFixtureAccessReturn {
  state: FixtureAccessState;
  setState: React.Dispatch<React.SetStateAction<FixtureAccessState>>;
  fetchUsers: (search?: string) => Promise<void>;
  fetchFixtures: (page?: number, search?: string) => Promise<void>;
  handleUserSearch: (value: string) => void;
  handleFixtureSearch: (value: string) => void;
  handleUserSelect: (userId: string, selected: boolean) => void;
  handleFixtureSelect: (fixtureId: string, selected: boolean) => void;
  handleSelectAllUsers: (selected: boolean) => void;
  handleSelectAllFixtures: (selected: boolean) => void;
  handleGrantAccess: () => Promise<void>;
  handleRevokeAccess: () => Promise<void>;
  getSelectedUsersData: () => UserDetails[];
  getSelectedFixturesData: () => FixtureV2[];
  fetchUserFixtureAccess: (userId: string) => Promise<void>;
  handleRemoveUserAccess: (userId: string, fixtureId: string) => Promise<void>;
  filteredFixtures: FixtureV2[];
}

export function useFixtureAccess(): UseFixtureAccessReturn {
  const [state, setState] = useState<FixtureAccessState>({
    users: [],
    loadingUsers: true,
    loadingFixtures: true,
    error: null,
    userSearchTerm: '',
    fixtureSearchTerm: '',
    selectedUsers: new Set<string>(),
    selectedFixtures: new Set<string>(),
    userFixturesMap: new Map<string, string[]>(),
    fixtures: [],
    selectedFixtureDetails: new Map<string, FixtureV2>(),
    selectedUserDetails: new Map<string, UserDetails>(),
    currentPage: 1,
    totalPages: 0,
    totalFixtures: 0,
    showGrantDialog: false,
    showRevokeDialog: false,
    showSelectedUsers: false,
    showSelectedFixtures: false,
    showFixtureDetails: false,
    selectedUserForDetails: null,
    userFixtureAccessData: [],
    loadingUserFixtureAccess: false,
    removingUserId: null,
    nameIndex: null,
    nameIndexLoading: false
  });

  const fetchUsers = useCallback(async (search = '') => {
    try {
      setState(prev => ({ ...prev, loadingUsers: true, error: null }));
      
      const result = await adminService.getAllUsers(1, 100, search || undefined);
      
      setState(prev => ({
        ...prev,
        users: result.users,
        loadingUsers: false
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load users',
        loadingUsers: false
      }));
    }
  }, []);

  const fetchFixtures = useCallback(async (page = 1, _search = '') => {
    try {
      setState(prev => ({ ...prev, loadingFixtures: true, error: null }));
      
      // Do NOT pass search to the API — filtering is done client-side via name index
      const result = await apiV2.getRecentFixtures(page, 20);
      
      setState(prev => ({
        ...prev,
        fixtures: result.items,
        currentPage: page,
        totalPages: Math.ceil(result.totalItems / result.pageSize),
        totalFixtures: result.totalItems,
        loadingFixtures: false
      }));
    } catch (error) {
      console.error('Error fetching fixtures:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load fixtures',
        loadingFixtures: false
      }));
    }
  }, []);

  const fetchUserFixtureAccess = useCallback(async (userId: string) => {
    try {
      setState(prev => ({ ...prev, loadingUserFixtureAccess: true, error: null }));
      
      // Fetch fixtures that this specific user has access to
      const fixturesWithAccess = await adminService.getFixturesAccessibleByUser(userId);
      
      setState(prev => ({
        ...prev,
        selectedUserForDetails: userId,
        userFixtureAccessData: fixturesWithAccess,
        showFixtureDetails: true,
        loadingUserFixtureAccess: false
      }));
    } catch (error) {
      console.error('Error fetching user fixture access:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load user fixture access data',
        loadingUserFixtureAccess: false
      }));
    }
  }, []);

  const handleRemoveUserAccess = useCallback(async (userId: string, fixtureId: string) => {
    try {
      setState(prev => ({ ...prev, removingUserId: userId }));
      await adminService.revokeFixtureAccess(userId, [fixtureId]);
      toast.success('User access removed successfully');
      
      // Refresh the access data if the dialog is still open
      if (state.selectedUserForDetails) {
        fetchUserFixtureAccess(state.selectedUserForDetails);
      }
    } catch (error) {
      console.error('Error removing user access:', error);
      toast.error('Failed to remove user access');
    } finally {
      setState(prev => ({ ...prev, removingUserId: null }));
    }
  }, [state.selectedUserForDetails, fetchUserFixtureAccess]);

  useEffect(() => {
    fetchUsers(state.userSearchTerm);
  }, [fetchUsers, state.userSearchTerm]);

  useEffect(() => {
    fetchFixtures(state.currentPage, state.fixtureSearchTerm);
  }, [fetchFixtures, state.currentPage, state.fixtureSearchTerm]);

  // Fetch and periodically refresh the fixture name index (used for client-side search)
  useEffect(() => {
    const loadNameIndex = async () => {
      setState(prev => ({ ...prev, nameIndexLoading: true }));
      try {
        const index = await apiV2.getFixtureNameIndex();
        setState(prev => ({ ...prev, nameIndex: index, nameIndexLoading: false }));
      } catch {
        setState(prev => ({ ...prev, nameIndexLoading: false }));
      }
    };
    loadNameIndex();
    const interval = setInterval(loadNameIndex, 60000);
    return () => clearInterval(interval);
  }, []);

  // Client-side filtering using the name index — avoids server-side search with 1000+ fixtures
  const filteredFixtures = useMemo(() => {
    if (!state.fixtureSearchTerm || !state.nameIndex?.items?.length) return state.fixtures;
    const normalized = normalizeSearchTerm(state.fixtureSearchTerm);
    const matchingIds = new Set(
      state.nameIndex.items
        .filter(f => normalizeSearchTerm(f.name).includes(normalized))
        .map(f => String(f.id))
    );
    return state.fixtures.filter(f => matchingIds.has(String(f.id)));
  }, [state.fixtures, state.fixtureSearchTerm, state.nameIndex]);

  const handleUserSearch = (value: string) => {
    setState(prev => ({ ...prev, userSearchTerm: value }));
  };

  const handleFixtureSearch = (value: string) => {
    // Reset to first page when searching
    setState(prev => ({ ...prev, fixtureSearchTerm: value, currentPage: 1 }));
  };

  const handleUserSelect = (userId: string, selected: boolean) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedUsers);
      if (selected) {
        newSelected.add(userId);
        // Cache the user details when selected
        const user = prev.users.find(u => u.id === userId);
        if (user) {
          const newCache = new Map(prev.selectedUserDetails);
          newCache.set(userId, user);
          return { 
            ...prev, 
            selectedUsers: newSelected,
            selectedUserDetails: newCache
          };
        }
      } else {
        newSelected.delete(userId);
        // Remove from cache when deselected
        const newCache = new Map(prev.selectedUserDetails);
        newCache.delete(userId);
        return { 
          ...prev, 
          selectedUsers: newSelected,
          selectedUserDetails: newCache
        };
      }
      return { ...prev, selectedUsers: newSelected };
    });
  };

  const handleFixtureSelect = (fixtureId: string, selected: boolean) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedFixtures);
      if (selected) {
        newSelected.add(fixtureId);
        // Cache the fixture details when selected
        const fixture = prev.fixtures.find(f => f.id === fixtureId);
        if (fixture) {
          const newCache = new Map(prev.selectedFixtureDetails);
          newCache.set(fixtureId, fixture);
          return { 
            ...prev, 
            selectedFixtures: newSelected,
            selectedFixtureDetails: newCache
          };
        }
      } else {
        newSelected.delete(fixtureId);
        // Remove from cache when deselected
        const newCache = new Map(prev.selectedFixtureDetails);
        newCache.delete(fixtureId);
        return { 
          ...prev, 
          selectedFixtures: newSelected,
          selectedFixtureDetails: newCache
        };
      }
      return { ...prev, selectedFixtures: newSelected };
    });
  };

  const handleSelectAllUsers = (selected: boolean) => {
    setState(prev => {
      if (selected) {
        // When selecting all, add all currently visible users to selection and cache
        const newSelected = new Set(prev.selectedUsers);
        const newCache = new Map(prev.selectedUserDetails);
        
        prev.users.forEach(user => {
          newSelected.add(user.id);
          newCache.set(user.id, user);
        });
        
        return { 
          ...prev, 
          selectedUsers: newSelected,
          selectedUserDetails: newCache
        };
      } else {
        // When deselecting all, only deselect currently visible users
        const newSelected = new Set(prev.selectedUsers);
        const newCache = new Map(prev.selectedUserDetails);
        
        prev.users.forEach(user => {
          newSelected.delete(user.id);
          // Only remove from cache if not selected elsewhere
          if (!newSelected.has(user.id)) {
            newCache.delete(user.id);
          }
        });
        
        return { 
          ...prev, 
          selectedUsers: newSelected,
          selectedUserDetails: newCache
        };
      }
    });
  };

  const handleSelectAllFixtures = (selected: boolean) => {
    setState(prev => {
      if (selected) {
        // When selecting all, add all currently visible fixtures to selection and cache
        const newSelected = new Set(prev.selectedFixtures);
        const newCache = new Map(prev.selectedFixtureDetails);
        
        prev.fixtures.forEach(fixture => {
          newSelected.add(fixture.id.toString());
          newCache.set(fixture.id.toString(), fixture);
        });
        
        return { 
          ...prev, 
          selectedFixtures: newSelected,
          selectedFixtureDetails: newCache
        };
      } else {
        // When deselecting all, only deselect currently visible fixtures
        const newSelected = new Set(prev.selectedFixtures);
        const newCache = new Map(prev.selectedFixtureDetails);
        
        prev.fixtures.forEach(fixture => {
          newSelected.delete(fixture.id.toString());
          // Only remove from cache if not selected elsewhere
          if (!newSelected.has(fixture.id.toString())) {
            newCache.delete(fixture.id.toString());
          }
        });
        
        return { 
          ...prev, 
          selectedFixtures: newSelected,
          selectedFixtureDetails: newCache
        };
      }
    });
  };

  const handleGrantAccess = async () => {
    if (state.selectedUsers.size === 0 || state.selectedFixtures.size === 0) {
      toast.error('Please select at least one user and one fixture');
      return;
    }

    try {
      const userIds = Array.from(state.selectedUsers);
      const fixtureIds = Array.from(state.selectedFixtures);
      
      await adminService.grantFixtureAccessToMultipleUsers(userIds, fixtureIds);
      
      toast.success(`Granted access to ${fixtureIds.length} fixture${fixtureIds.length !== 1 ? 's' : ''} for ${userIds.length} user${userIds.length !== 1 ? 's' : ''}`);
      
      // Reset selections
      setState(prev => ({
        ...prev,
        selectedUsers: new Set(),
        selectedFixtures: new Set(),
        showGrantDialog: false
      }));
    } catch (error) {
      console.error('Error granting fixture access:', error);
      toast.error('Failed to grant fixture access');
    }
  };

  const handleRevokeAccess = async () => {
    if (state.selectedUsers.size === 0 || state.selectedFixtures.size === 0) {
      toast.error('Please select at least one user and one fixture');
      return;
    }

    try {
      const userIds = Array.from(state.selectedUsers);
      const fixtureIds = Array.from(state.selectedFixtures);
      
      await adminService.revokeFixtureAccessFromMultipleUsers(userIds, fixtureIds);
      
      toast.success(`Revoked access to ${fixtureIds.length} fixture${fixtureIds.length !== 1 ? 's' : ''} for ${userIds.length} user${userIds.length !== 1 ? 's' : ''}`);
      
      // Reset selections
      setState(prev => ({
        ...prev,
        selectedUsers: new Set(),
        selectedFixtures: new Set(),
        showRevokeDialog: false
      }));
    } catch (error) {
      console.error('Error revoking fixture access:', error);
      toast.error('Failed to revoke fixture access');
    }
  };

  const getSelectedUsersData = () => {
    // First, get users that are currently visible
    const visibleUsers = state.users.filter(user => 
      state.selectedUsers.has(user.id)
    );
    
    // Then, get users from our cache that might not be currently visible
    const cachedUsers = Array.from(state.selectedUserDetails.values()).filter(
      user => state.selectedUsers.has(user.id) && 
              !visibleUsers.some(vu => vu.id === user.id)
    );
    
    // Combine both arrays
    return [...visibleUsers, ...cachedUsers];
  };

  const getSelectedFixturesData = () => {
    // First, get fixtures that are currently visible
    const visibleFixtures = state.fixtures.filter(fixture => 
      state.selectedFixtures.has(fixture.id.toString())
    );
    
    // Then, get fixtures from our cache that might not be currently visible
    const cachedFixtures = Array.from(state.selectedFixtureDetails.values()).filter(
      fixture => state.selectedFixtures.has(fixture.id.toString()) && 
                !visibleFixtures.some(vf => vf.id === fixture.id)
    );
    
    // Combine both arrays
    return [...visibleFixtures, ...cachedFixtures];
  };

  return {
    state,
    setState,
    fetchUsers,
    fetchFixtures,
    handleUserSearch,
    handleFixtureSearch,
    handleUserSelect,
    handleFixtureSelect,
    handleSelectAllUsers,
    handleSelectAllFixtures,
    handleGrantAccess,
    handleRevokeAccess,
    getSelectedUsersData,
    getSelectedFixturesData,
    fetchUserFixtureAccess,
    handleRemoveUserAccess,
    filteredFixtures
  };
}