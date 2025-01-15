import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface UseMatchDataOptions {
  fixtureId: string;
  bufferSize?: number;
  updateInterval?: number;
}

export function useMatchData({ 
  fixtureId, 
  bufferSize = 5,
  updateInterval = 16 // Sync with monitor refresh rate (~60fps)
}: UseMatchDataOptions) {
  const queryClient = useQueryClient();
  const updateBuffer = useRef<any[]>([]);
  const rafRef = useRef<number>();
  const lastProcessTime = useRef<number>(Date.now());
  const isProcessing = useRef(false);

  // Optimized processing function
  const processBuffer = useCallback(() => {
    if (!updateBuffer.current.length || isProcessing.current) return;

    const now = Date.now();
    if (now - lastProcessTime.current < updateInterval) {
      rafRef.current = requestAnimationFrame(processBuffer);
      return;
    }

    isProcessing.current = true;

    try {
      // Take the most recent state for each type of update
      const updates = updateBuffer.current.reduce((acc, update) => {
        acc[update.type] = update.data;
        return acc;
      }, {} as Record<string, any>);

      // Batch update all queries
      queryClient.setQueriesData(
        { queryKey: ['fixture', fixtureId] },
        updates.fixture
      );
      queryClient.setQueriesData(
        { queryKey: ['feed', fixtureId] },
        updates.feed
      );
      queryClient.setQueriesData(
        { queryKey: ['lastAction', fixtureId] },
        updates.lastAction
      );

      // Clear the buffer
      updateBuffer.current = [];
      lastProcessTime.current = now;
    } finally {
      isProcessing.current = false;
    }
  }, [fixtureId, queryClient, updateInterval]);

  // Optimized buffer update function
  const bufferUpdate = useCallback((type: string, data: any) => {
    updateBuffer.current.push({ type, data });

    if (updateBuffer.current.length >= bufferSize) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(processBuffer);
    }
  }, [bufferSize, processBuffer]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!fixtureId) return;

    const unsubscribe = api.subscribeToFixture(fixtureId, (data) => {
      if (data?.fixture) bufferUpdate('fixture', data.fixture);
      if (data?.feed) bufferUpdate('feed', data.feed);
      if (data?.lastAction) bufferUpdate('lastAction', data.lastAction);
    });

    // Cleanup function
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      unsubscribe();
    };
  }, [fixtureId, bufferUpdate]);

  // Optimized queries with minimal refetch intervals
  const { data: fixture } = useQuery({
    queryKey: ['fixture', fixtureId],
    queryFn: () => api.getFixture(fixtureId),
    staleTime: updateInterval,
    gcTime: Infinity,
  });

  const { data: feedData } = useQuery({
    queryKey: ['feed', fixtureId],
    queryFn: () => api.getFeedView(fixtureId),
    staleTime: updateInterval,
    gcTime: Infinity,
  });

  const { data: lastAction } = useQuery({
    queryKey: ['lastAction', fixtureId],
    queryFn: () => api.getLastAction(fixtureId),
    staleTime: updateInterval,
    gcTime: Infinity,
  });

  return {
    fixture,
    feedData,
    lastAction,
    isLoading: !fixture || !feedData,
  };
}