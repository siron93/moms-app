import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const MEDIA_CACHE_KEY = '@media_cache_mapping';
const MEDIA_DIRECTORY = `${FileSystem.documentDirectory}media/`;

interface MediaCacheEntry {
  convexUrl: string;
  localPath: string;
  timestamp: number;
  type: 'image' | 'video';
}

type MediaCacheMap = Record<string, MediaCacheEntry>;

/**
 * Initialize media cache directory
 */
async function ensureMediaDirectory() {
  const dirInfo = await FileSystem.getInfoAsync(MEDIA_DIRECTORY);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(MEDIA_DIRECTORY, { intermediates: true });
  }
}

/**
 * Get the media cache mapping
 */
async function getMediaCache(): Promise<MediaCacheMap> {
  try {
    const cached = await AsyncStorage.getItem(MEDIA_CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch (error) {
    console.error('Error reading media cache:', error);
    return {};
  }
}

/**
 * Save the media cache mapping
 */
async function saveMediaCache(cache: MediaCacheMap): Promise<void> {
  try {
    await AsyncStorage.setItem(MEDIA_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error saving media cache:', error);
  }
}

/**
 * Get local path for a Convex URL
 */
export async function getLocalPathForConvexUrl(convexUrl: string): Promise<string | null> {
  if (!convexUrl || !convexUrl.startsWith('http')) {
    return null;
  }

  const cache = await getMediaCache();
  const entry = cache[convexUrl];
  
  if (entry && entry.localPath) {
    // Check if file still exists
    const fileInfo = await FileSystem.getInfoAsync(entry.localPath);
    if (fileInfo.exists) {
      return entry.localPath;
    } else {
      // Remove from cache if file doesn't exist
      delete cache[convexUrl];
      await saveMediaCache(cache);
    }
  }
  
  return null;
}

/**
 * Save a media file permanently and map it to its Convex URL
 */
export async function saveMediaToCache(
  convexUrl: string, 
  tempLocalPath: string,
  mediaType: 'image' | 'video' = 'image'
): Promise<string> {
  await ensureMediaDirectory();
  
  // Generate permanent filename based on URL
  const urlHash = convexUrl.split('/').pop() || Date.now().toString();
  const extension = mediaType === 'video' ? 'mp4' : 'jpg';
  const permanentFileName = `${urlHash}.${extension}`;
  const permanentPath = MEDIA_DIRECTORY + permanentFileName;
  
  try {
    // Copy file to permanent location
    await FileSystem.copyAsync({
      from: tempLocalPath,
      to: permanentPath
    });
    
    // Update cache mapping
    const cache = await getMediaCache();
    cache[convexUrl] = {
      convexUrl,
      localPath: permanentPath,
      timestamp: Date.now(),
      type: mediaType
    };
    await saveMediaCache(cache);
    
    return permanentPath;
  } catch (error) {
    console.error('Error saving media to cache:', error);
    return tempLocalPath; // Return temp path as fallback
  }
}

/**
 * Map multiple Convex URLs to local paths
 */
export async function mapConvexUrlsToLocalPaths(
  convexUrls: string[],
  localPaths: string[],
  mediaTypes?: ('image' | 'video')[]
): Promise<void> {
  if (convexUrls.length !== localPaths.length) {
    console.warn('Mismatched convexUrls and localPaths lengths');
    return;
  }
  
  const cache = await getMediaCache();
  
  for (let i = 0; i < convexUrls.length; i++) {
    const convexUrl = convexUrls[i];
    const localPath = localPaths[i];
    const mediaType = mediaTypes?.[i] || 'image';
    
    if (convexUrl && localPath && convexUrl.startsWith('http')) {
      // Check if local file exists
      const fileInfo = await FileSystem.getInfoAsync(localPath);
      if (fileInfo.exists) {
        cache[convexUrl] = {
          convexUrl,
          localPath,
          timestamp: Date.now(),
          type: mediaType
        };
      }
    }
  }
  
  await saveMediaCache(cache);
}

/**
 * Clean up old cache entries
 */
export async function cleanupOldCache(maxAgeInDays: number = 30): Promise<void> {
  const cache = await getMediaCache();
  const maxAge = maxAgeInDays * 24 * 60 * 60 * 1000;
  const now = Date.now();
  
  let hasChanges = false;
  
  for (const [url, entry] of Object.entries(cache)) {
    if (now - entry.timestamp > maxAge) {
      // Check if file exists before deleting
      const fileInfo = await FileSystem.getInfoAsync(entry.localPath);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(entry.localPath, { idempotent: true });
      }
      delete cache[url];
      hasChanges = true;
    }
  }
  
  if (hasChanges) {
    await saveMediaCache(cache);
  }
}

/**
 * Get all cached media stats
 */
export async function getCacheStats(): Promise<{
  totalFiles: number;
  totalSize: number;
  oldestEntry: number | null;
}> {
  const cache = await getMediaCache();
  let totalSize = 0;
  let oldestEntry: number | null = null;
  let validFiles = 0;
  
  for (const entry of Object.values(cache)) {
    try {
      const fileInfo = await FileSystem.getInfoAsync(entry.localPath);
      if (fileInfo.exists && 'size' in fileInfo) {
        totalSize += fileInfo.size;
        validFiles++;
        if (!oldestEntry || entry.timestamp < oldestEntry) {
          oldestEntry = entry.timestamp;
        }
      }
    } catch (error) {
      console.error('Error getting file info:', error);
    }
  }
  
  return {
    totalFiles: validFiles,
    totalSize,
    oldestEntry
  };
}