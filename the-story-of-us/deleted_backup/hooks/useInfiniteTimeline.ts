import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { timelineCache, TimelineItem } from '../services/timelineCache';
import NetInfo from '@react-native-community/netinfo';

interface UseInfiniteTimelineOptions {
  babyId: Id<"babies"> | undefined;
  pageSize?: number;
  enableCache?: boolean;
}

interface UseInfiniteTimelineResult {
  items: TimelineItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  isOffline: boolean;
}

export function useInfiniteTimeline({
  babyId,
  pageSize = 10, // Reduced from 20 to save bandwidth
  enableCache = true,
}: UseInfiniteTimelineOptions): UseInfiniteTimelineResult {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const loadingRef = useRef(false);
  const lastSyncRef = useRef<number>(0);

  // Query for paginated data
  const paginatedData = useQuery(
    api.timelinePaginated.getTimelinePaginated,
    !babyId || isOffline ? 'skip' : { babyId, cursor, limit: pageSize }
  );

  // Disable automatic sync to reduce bandwidth usage
  // Users can manually refresh if they want new items
  const newItemsData = null;

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    return unsubscribe;
  }, []);

  // Load cached data on mount or when offline
  useEffect(() => {
    const loadCachedData = async () => {
      if (!enableCache || !babyId) return;
      
      try {
        // Only load cache on initial mount, not on refresh
        if (refreshKey === 0) {
          setIsLoading(true);
          
          // Get cached page
          const cachedPage = await timelineCache.getPage(babyId, 0);
          
          if (cachedPage) {
            setItems(cachedPage.items);
            setCursor(cachedPage.cursor);
            setHasMore(cachedPage.hasMore);
            lastSyncRef.current = await timelineCache.getLastSyncTimestamp(babyId);
          }
        }
        
        // If offline, load all cached data
        if (isOffline) {
          const allCachedItems = await timelineCache.getAllCachedItems(babyId);
          if (allCachedItems.length > 0) {
            setItems(allCachedItems);
            setHasMore(false);
          }
        }
      } catch (err) {
        console.error('Error loading cached data:', err);
      } finally {
        if (refreshKey === 0) {
          setIsLoading(false);
        }
      }
    };

    loadCachedData();
  }, [babyId, isOffline, enableCache, refreshKey]);

  // Handle paginated data updates
  useEffect(() => {
    if (isOffline) return;
    
    // Wait for data when loading
    if (!paginatedData && isLoading) return;

    const updateData = async () => {
      try {
        // Handle case where query returns undefined or empty
        const items = paginatedData?.items || [];
        const hasMore = paginatedData?.hasMore || false;
        const nextCursor = paginatedData?.nextCursor;
        
        if (cursor === undefined) {
          // First page load or refresh
          setItems(items);
        } else {
          // Append new items, filtering out duplicates
          setItems(prev => {
            const existingIds = new Set(prev.map(item => item._id));
            const newItems = items.filter(item => !existingIds.has(item._id));
            return [...prev, ...newItems];
          });
        }
        
        setHasMore(hasMore);
        
        // Cache the data
        if (enableCache && babyId && paginatedData) {
          await timelineCache.savePage(babyId, currentPage, {
            items: items,
            cursor: nextCursor,
            hasMore: hasMore,
            timestamp: Date.now(),
          });
        }
        
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        loadingRef.current = false;
      }
    };

    updateData();
  }, [paginatedData, cursor, babyId, currentPage, enableCache, isOffline, isLoading]);

  // Handle new items sync
  useEffect(() => {
    if (!newItemsData || isOffline || !enableCache) return;

    const syncNewItems = async () => {
      try {
        const allNewItems: TimelineItem[] = [];
        
        // Transform and collect all new items
        // (Similar transformation logic as in timelinePaginated.ts)
        // ... transform photos, journal entries, firsts, growth logs, milestone entries
        
        if (allNewItems.length > 0 && babyId) {
          await timelineCache.mergeNewItems(babyId, allNewItems);
          lastSyncRef.current = newItemsData.timestamp;
          
          // Refresh the current view
          await refresh();
        }
      } catch (err) {
        console.error('Error syncing new items:', err);
      }
    };

    syncNewItems();
  }, [newItemsData, babyId, isOffline, enableCache]);

  // Load more function
  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore || isLoadingMore || isOffline) return;
    
    loadingRef.current = true;
    setIsLoadingMore(true);
    
    // If we have a cursor, the query will automatically fetch the next page
    if (paginatedData?.nextCursor) {
      setCursor(paginatedData.nextCursor);
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMore, isLoadingMore, isOffline, paginatedData]);

  // Refresh function
  const refresh = useCallback(async () => {
    if (!babyId) return;
    
    if (isOffline) {
      // In offline mode, just reload from cache
      const allCachedItems = await timelineCache.getAllCachedItems(babyId);
      setItems(allCachedItems);
      return;
    }
    
    // Reset state for fresh fetch
    setItems([]);
    setCursor(undefined);
    setCurrentPage(0);
    setHasMore(true);
    setError(null);
    loadingRef.current = false;
    
    // Clear cache for fresh data
    if (enableCache) {
      await timelineCache.clearCache(babyId);
    }
    
    // Force re-fetch by incrementing refresh key
    setRefreshKey(prev => prev + 1);
    
    // Set loading after state reset to ensure UI shows loading state
    setIsLoading(true);
  }, [babyId, enableCache, isOffline]);

  return {
    items,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    refresh,
    loadMore,
    isOffline,
  };
}