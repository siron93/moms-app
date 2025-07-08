import AsyncStorage from '@react-native-async-storage/async-storage';
import { Doc, Id } from '../../convex/_generated/dataModel';

const CACHE_PREFIX = '@timeline_cache:';
const CACHE_METADATA_KEY = '@timeline_metadata';
const CACHE_EXPIRY_HOURS = 24;

export type TimelineItem = {
  _id: string;
  _creationTime: number;
  babyId: Id<"babies">;
  userId?: Id<"users">;
  anonymousId?: string;
  type: "photo" | "video" | "journal" | "milestone" | "first" | "growth";
  title?: string;
  content?: string;
  mediaUrl?: string;
  mediaUrls?: string[];
  mediaType?: "image" | "video";
  mediaTypes?: ("image" | "video")[];
  localMediaPaths?: string[];
  milestoneId?: Id<"milestones">;
  firstType?: string;
  tags: string[];
  date: number;
  createdAt: number;
  updatedAt: number;
  growthLogId?: Id<"growthLogs">;
};

interface CacheMetadata {
  babyId: string;
  lastSyncTimestamp: number;
  totalItems: number;
  pages: number;
}

interface CachedPage {
  items: TimelineItem[];
  cursor?: string;
  hasMore: boolean;
  timestamp: number;
}

class TimelineCache {
  // Save a page of timeline items
  async savePage(babyId: string, pageIndex: number, data: CachedPage): Promise<void> {
    try {
      const key = `${CACHE_PREFIX}${babyId}:page:${pageIndex}`;
      await AsyncStorage.setItem(key, JSON.stringify(data));
      
      // Update metadata
      await this.updateMetadata(babyId, pageIndex);
    } catch (error) {
      console.error('Error saving timeline page:', error);
    }
  }

  // Get a cached page
  async getPage(babyId: string, pageIndex: number): Promise<CachedPage | null> {
    try {
      const key = `${CACHE_PREFIX}${babyId}:page:${pageIndex}`;
      const data = await AsyncStorage.getItem(key);
      
      if (!data) return null;
      
      const cachedPage: CachedPage = JSON.parse(data);
      
      // Check if cache is expired
      const now = Date.now();
      const expiryTime = CACHE_EXPIRY_HOURS * 60 * 60 * 1000;
      
      if (now - cachedPage.timestamp > expiryTime) {
        await AsyncStorage.removeItem(key);
        return null;
      }
      
      return cachedPage;
    } catch (error) {
      console.error('Error getting cached page:', error);
      return null;
    }
  }

  // Get all cached items for a baby (for offline access)
  async getAllCachedItems(babyId: string): Promise<TimelineItem[]> {
    try {
      const metadata = await this.getMetadata(babyId);
      if (!metadata) return [];
      
      const allItems: TimelineItem[] = [];
      
      for (let i = 0; i < metadata.pages; i++) {
        const page = await this.getPage(babyId, i);
        if (page) {
          allItems.push(...page.items);
        }
      }
      
      // Sort by date (newest first)
      return allItems.sort((a, b) => b.date - a.date);
    } catch (error) {
      console.error('Error getting all cached items:', error);
      return [];
    }
  }

  // Merge new items with cache
  async mergeNewItems(babyId: string, newItems: TimelineItem[]): Promise<void> {
    try {
      const cachedItems = await this.getAllCachedItems(babyId);
      
      // Create a map for efficient lookup
      const itemsMap = new Map<string, TimelineItem>();
      
      // Add cached items
      cachedItems.forEach(item => itemsMap.set(item._id, item));
      
      // Merge new items (overwrite if exists)
      newItems.forEach(item => itemsMap.set(item._id, item));
      
      // Convert back to array and sort
      const mergedItems = Array.from(itemsMap.values())
        .sort((a, b) => b.date - a.date);
      
      // Re-paginate and save
      await this.repaginateAndSave(babyId, mergedItems);
    } catch (error) {
      console.error('Error merging new items:', error);
    }
  }

  // Clear cache for a baby
  async clearCache(babyId: string): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const babyKeys = keys.filter(key => key.startsWith(`${CACHE_PREFIX}${babyId}:`));
      
      if (babyKeys.length > 0) {
        await AsyncStorage.multiRemove(babyKeys);
      }
      
      // Clear metadata
      const metadata = await this.getAllMetadata();
      delete metadata[babyId];
      await AsyncStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Private methods
  private async updateMetadata(babyId: string, pageIndex: number): Promise<void> {
    const metadata = await this.getAllMetadata();
    
    if (!metadata[babyId]) {
      metadata[babyId] = {
        babyId,
        lastSyncTimestamp: Date.now(),
        totalItems: 0,
        pages: 0,
      };
    }
    
    metadata[babyId].lastSyncTimestamp = Date.now();
    metadata[babyId].pages = Math.max(metadata[babyId].pages, pageIndex + 1);
    
    await AsyncStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
  }

  private async getMetadata(babyId: string): Promise<CacheMetadata | null> {
    const metadata = await this.getAllMetadata();
    return metadata[babyId] || null;
  }

  private async getAllMetadata(): Promise<Record<string, CacheMetadata>> {
    try {
      const data = await AsyncStorage.getItem(CACHE_METADATA_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private async repaginateAndSave(babyId: string, items: TimelineItem[]): Promise<void> {
    const ITEMS_PER_PAGE = 20;
    const pages = Math.ceil(items.length / ITEMS_PER_PAGE);
    
    // Clear existing cache
    await this.clearCache(babyId);
    
    // Save new pages
    for (let i = 0; i < pages; i++) {
      const start = i * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const pageItems = items.slice(start, end);
      
      const cachedPage: CachedPage = {
        items: pageItems,
        hasMore: i < pages - 1,
        timestamp: Date.now(),
      };
      
      await this.savePage(babyId, i, cachedPage);
    }
  }

  // Get last sync timestamp
  async getLastSyncTimestamp(babyId: string): Promise<number> {
    const metadata = await this.getMetadata(babyId);
    return metadata?.lastSyncTimestamp || 0;
  }
}

export const timelineCache = new TimelineCache();