import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { getCachedMediaPath } from './mediaService';

const THUMBNAIL_SIZE = 200;
const THUMBNAIL_QUALITY = 0.6;

export interface ThumbnailResult {
  thumbnailUri: string;
  width: number;
  height: number;
}

/**
 * Generate a thumbnail for an image
 */
export async function generateThumbnail(imageUri: string): Promise<ThumbnailResult | null> {
  try {
    // Generate thumbnail
    const result = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE } }],
      { 
        compress: THUMBNAIL_QUALITY, 
        format: ImageManipulator.SaveFormat.JPEG 
      }
    );

    // Save thumbnail to cache directory
    const thumbnailFileName = `thumb_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    const thumbnailPath = FileSystem.cacheDirectory + thumbnailFileName;
    
    await FileSystem.copyAsync({
      from: result.uri,
      to: thumbnailPath
    });

    return {
      thumbnailUri: thumbnailPath,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return null;
  }
}

/**
 * Get or create a thumbnail for an image
 */
export async function getOrCreateThumbnail(imageUri: string, imageId?: string): Promise<string | null> {
  try {
    // If we have an imageId, check if thumbnail exists in cache
    if (imageId) {
      const cachedThumbPath = await getCachedThumbnailPath(imageId);
      if (cachedThumbPath) {
        const info = await FileSystem.getInfoAsync(cachedThumbPath);
        if (info.exists) {
          return cachedThumbPath;
        }
      }
    }

    // Generate new thumbnail
    const thumbnail = await generateThumbnail(imageUri);
    if (!thumbnail) return null;

    // If we have an imageId, save to permanent cache
    if (imageId) {
      const permanentPath = await saveThumbnailPermanently(thumbnail.thumbnailUri, imageId);
      return permanentPath || thumbnail.thumbnailUri;
    }

    return thumbnail.thumbnailUri;
  } catch (error) {
    console.error('Error getting/creating thumbnail:', error);
    return null;
  }
}

/**
 * Get cached thumbnail path
 */
async function getCachedThumbnailPath(imageId: string): Promise<string | null> {
  const thumbDir = `${FileSystem.documentDirectory}thumbnails/`;
  const thumbPath = `${thumbDir}${imageId}.jpg`;
  
  try {
    const dirInfo = await FileSystem.getInfoAsync(thumbDir);
    if (!dirInfo.exists) {
      return null;
    }
    
    return thumbPath;
  } catch (error) {
    console.error('Error getting cached thumbnail path:', error);
    return null;
  }
}

/**
 * Save thumbnail to permanent storage
 */
async function saveThumbnailPermanently(tempUri: string, imageId: string): Promise<string | null> {
  const thumbDir = `${FileSystem.documentDirectory}thumbnails/`;
  const thumbPath = `${thumbDir}${imageId}.jpg`;
  
  try {
    // Ensure directory exists
    const dirInfo = await FileSystem.getInfoAsync(thumbDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(thumbDir, { intermediates: true });
    }
    
    // Copy thumbnail to permanent location
    await FileSystem.copyAsync({
      from: tempUri,
      to: thumbPath
    });
    
    return thumbPath;
  } catch (error) {
    console.error('Error saving thumbnail permanently:', error);
    return null;
  }
}

/**
 * Clean up old thumbnails
 */
export async function cleanupOldThumbnails(keepIds: Set<string>): Promise<void> {
  const thumbDir = `${FileSystem.documentDirectory}thumbnails/`;
  
  try {
    const dirInfo = await FileSystem.getInfoAsync(thumbDir);
    if (!dirInfo.exists) return;
    
    const files = await FileSystem.readDirectoryAsync(thumbDir);
    
    for (const file of files) {
      const imageId = file.replace('.jpg', '');
      if (!keepIds.has(imageId)) {
        await FileSystem.deleteAsync(`${thumbDir}${file}`, { idempotent: true });
      }
    }
  } catch (error) {
    console.error('Error cleaning up thumbnails:', error);
  }
}