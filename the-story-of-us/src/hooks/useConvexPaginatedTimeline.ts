import { useState, useEffect, useCallback } from 'react';
import { usePaginatedQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import NetInfo from '@react-native-community/netinfo';
import { appEventEmitter, APP_EVENTS } from '../utils/eventEmitter';

export const useConvexPaginatedTimeline = (babyId: Id<"babies"> | undefined) => {
  const [isOffline, setIsOffline] = useState(false);
  
  // Use Convex's built-in pagination
  const paginatedResult = usePaginatedQuery(
    api.timelinePaginated.getTimelinePaginated,
    babyId ? { babyId } : 'skip',
    { initialNumItems: 20 }
  );
  
  const memories = paginatedResult?.results || [];
  const status = paginatedResult?.status || 'LoadingFirstPage';
  const loadMore = paginatedResult?.loadMore || (() => {});

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    return unsubscribe;
  }, []);

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => {
      // With Convex pagination, the query will automatically refetch
      // when data changes, so we don't need to do anything special
      console.log('Timeline refresh requested - Convex will handle reactivity');
    };

    const unsubscribe = appEventEmitter.on(APP_EVENTS.TIMELINE_REFRESH_NEEDED, handleRefresh);
    return unsubscribe;
  }, []);

  const refresh = useCallback(async () => {
    // Convex handles refreshing automatically through reactivity
    // This is just for pull-to-refresh UI feedback
    return new Promise(resolve => setTimeout(resolve, 500));
  }, []);

  return {
    items: memories,
    isLoading: status === 'LoadingFirstPage' || !paginatedResult,
    isLoadingMore: status === 'LoadingMore', 
    hasMore: status === 'CanLoadMore',
    error: null,
    refresh,
    loadMore: () => {
      if (status === 'CanLoadMore') {
        loadMore(20);
      }
    },
    isOffline,
  };
};