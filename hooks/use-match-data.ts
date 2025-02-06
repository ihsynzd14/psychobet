import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface UseMatchDataOptions {
  fixtureId: string;
  bufferSize?: number;
  updateInterval?: number;
}

export function useMatchData({ 
  fixtureId, 
  bufferSize = 5, // Reduced buffer size for faster processing
  updateInterval = 1 // 1ms interval
}: UseMatchDataOptions) {
  const queryClient = useQueryClient();
  const updateBuffer = useRef<any[]>([]);
  const updateTimeoutRef = useRef<number>();
  const lastProcessTime = useRef<number>(Date.now());

  // Main data queries with minimal refetch intervals
  const { data: fixture } = useQuery({
    queryKey: ['fixture', fixtureId],
    queryFn: () => api.getFixture(fixtureId),
    refetchInterval: updateInterval,
  });

  const { data: feedData } = useQuery({
    queryKey: ['feed', fixtureId],
    queryFn: () => api.getFeedView(fixtureId),
    refetchInterval: updateInterval,
  });

  const { data: lastAction } = useQuery({
    queryKey: ['lastAction', fixtureId],
    queryFn: () => api.getLastAction(fixtureId),
    refetchInterval: updateInterval,
  });

  // Process buffered updates using requestAnimationFrame
  const processBuffer = () => {
    if (updateBuffer.current.length === 0) return;

    const now = Date.now();
    // Ensure minimum time between updates to prevent overwhelming the UI
    if (now - lastProcessTime.current < updateInterval) {
      updateTimeoutRef.current = requestAnimationFrame(processBuffer);
      return;
    }

    // Take the most recent state for each type of update
    const updates = updateBuffer.current.reduce((acc, update) => {
      acc[update.type] = update.data;
      return acc;
    }, {} as Record<string, any>);

    // Apply all updates at once
    Object.entries(updates).forEach(([type, data]) => {
      queryClient.setQueryData([type, fixtureId], data);
    });

    // Clear the buffer and update last process time
    updateBuffer.current = [];
    lastProcessTime.current = now;
  };

  // Buffer updates and schedule processing
  const bufferUpdate = (type: string, data: any) => {
    updateBuffer.current.push({ type, data });

    if (updateBuffer.current.length >= bufferSize) {
      if (updateTimeoutRef.current) {
        cancelAnimationFrame(updateTimeoutRef.current);
      }
      updateTimeoutRef.current = requestAnimationFrame(processBuffer);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    if (!fixtureId) return;

    const unsubscribe = api.subscribeToFixture(fixtureId, (data) => {
      if (data?.fixture) {
        bufferUpdate('fixture', data.fixture);
      }
      if (data?.feed) {
        bufferUpdate('feed', data.feed);
      }
      if (data?.lastAction) {
        bufferUpdate('lastAction', data.lastAction);
      }
    });

    return () => {
      if (updateTimeoutRef.current) {
        cancelAnimationFrame(updateTimeoutRef.current);
      }
      unsubscribe();
    };
  }, [fixtureId]);

  return {
    fixture,
    feedData,
    lastAction,
    isLoading: !fixture || !feedData,
  };
}