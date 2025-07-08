import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Doc, Id } from '../../convex/_generated/dataModel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

type TimelineItem = Doc<"memories">;

const TIMELINE_CACHE_KEY = 'timeline_cache_';
const CACHE_TIMESTAMP_KEY = 'timeline_cache_timestamp_';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CachedTimeline {
  items: TimelineItem[];
  timestamp: number;
  version: number;
}

export const useLocalFirstTimeline = (babyId: Id<"babies"> | undefined) => {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [lastSync, setLastSync] = useState<number>(0);
  
  // Keep track if we should fetch from server
  const [shouldFetch, setShouldFetch] = useState(false);
  const isMountedRef = useRef(true);

  // Query all timeline data at once (only when needed)
  const serverData = useQuery(
    api.timelinePaginated.getAllTimelineItems,
    shouldFetch && babyId ? { babyId } : 'skip'
  );

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    return () => {
      unsubscribe();
      isMountedRef.current = false;
    };
  }, []);

  // Load from cache first
  useEffect(() => {
    if (!babyId) return;

    const loadCache = async () => {
      try {
        setIsLoading(true);
        
        // Try to load from cache
        const cacheKey = `${TIMELINE_CACHE_KEY}${babyId}`;
        const cachedJson = await AsyncStorage.getItem(cacheKey);
        
        if (cachedJson) {
          const cached: CachedTimeline = JSON.parse(cachedJson);
          setItems(cached.items);
          setLastSync(cached.timestamp);
          
          // Check if cache is stale
          const now = Date.now();
          const cacheAge = now - cached.timestamp;
          
          // Only fetch if cache is old or user hasn't synced in a while
          if (cacheAge > CACHE_DURATION && !isOffline) {
            setShouldFetch(true);
          }
        } else {
          // No cache, need to fetch
          if (!isOffline) {
            setShouldFetch(true);
          }
        }
      } catch (err) {
        console.error('Error loading cache:', err);
        // On error, try to fetch from server
        if (!isOffline) {
          setShouldFetch(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadCache();
  }, [babyId, isOffline]);

  // Handle server data when it arrives
  useEffect(() => {
    if (!serverData || !babyId || !shouldFetch) return;

    const updateCache = async () => {
      try {
        // Sort items by date (newest first)
        const sortedItems = [...serverData].sort((a, b) => b.date - a.date);
        
        if (isMountedRef.current) {
          setItems(sortedItems);
          setLastSync(Date.now());
        }
        
        // Save to cache
        const cacheKey = `${TIMELINE_CACHE_KEY}${babyId}`;
        const cacheData: CachedTimeline = {
          items: sortedItems,
          timestamp: Date.now(),
          version: 1
        };
        
        await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
        
        // Reset fetch flag
        setShouldFetch(false);
        setError(null);
      } catch (err) {
        console.error('Error updating cache:', err);
        setError(err as Error);
      }
    };

    updateCache();
  }, [serverData, babyId, shouldFetch]);

  // Refresh function - only called when user adds/modifies content
  const refresh = useCallback(async (force: boolean = false) => {
    if (!babyId || isRefreshing) return;

    setIsRefreshing(true);
    
    try {
      if (isOffline) {
        // In offline mode, just reload from cache
        const cacheKey = `${TIMELINE_CACHE_KEY}${babyId}`;
        const cachedJson = await AsyncStorage.getItem(cacheKey);
        if (cachedJson) {
          const cached: CachedTimeline = JSON.parse(cachedJson);
          setItems(cached.items);
        }
      } else {
        // Force fetch from server
        setShouldFetch(true);
      }
    } catch (err) {
      console.error('Error refreshing:', err);
      setError(err as Error);
    } finally {
      setIsRefreshing(false);
    }
  }, [babyId, isOffline, isRefreshing]);

  // Force sync - called after user makes changes
  const forceSync = useCallback(() => {
    if (!isOffline && babyId) {
      setShouldFetch(true);
    }
  }, [isOffline, babyId]);

  // Clear cache for this baby
  const clearCache = useCallback(async () => {
    if (!babyId) return;
    
    try {
      const cacheKey = `${TIMELINE_CACHE_KEY}${babyId}`;
      await AsyncStorage.removeItem(cacheKey);
      setItems([]);
      setShouldFetch(true);
    } catch (err) {
      console.error('Error clearing cache:', err);
    }
  }, [babyId]);

  return {
    items,
    isLoading: isLoading || (shouldFetch && !serverData),
    isRefreshing,
    error,
    isOffline,
    lastSync,
    refresh,
    forceSync,
    clearCache,
    // No pagination needed - we load everything at once
    hasMore: false,
    loadMore: () => {}, // No-op since we load all at once
  };
};