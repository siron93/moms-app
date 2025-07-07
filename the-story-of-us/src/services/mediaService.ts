import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { optimizeImage, shouldOptimizeImage } from '../utils/imageOptimization';

// Types
export interface MediaItem {
  uri: string;
  type: 'image' | 'video';
  width?: number;
  height?: number;
  duration?: number;
  localPath?: string;
}

// Directory for local media cache
const MEDIA_CACHE_DIR = `${FileSystem.documentDirectory}media_cache/`;

// Ensure media cache directory exists
export const ensureMediaCacheDir = async () => {
  const dirInfo = await FileSystem.getInfoAsync(MEDIA_CACHE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(MEDIA_CACHE_DIR, { intermediates: true });
  }
};

// Request permissions
export const requestMediaPermissions = async () => {
  const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
  const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  return {
    camera: cameraStatus === 'granted',
    mediaLibrary: mediaLibraryStatus === 'granted',
  };
};

// Pick images from gallery (multiple selection)
export const pickImagesFromGallery = async (maxSelection: number = 15): Promise<MediaItem[]> => {
  try {
    // Note: allowsMultipleSelection might not work in Expo Go
    // It requires a development build for full functionality
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: maxSelection,
      // Add these options for better compatibility
      allowsEditing: false,
      aspect: [4, 3],
      exif: false,
    });

    if (result.canceled || !result.assets) {
      return [];
    }

    const mediaItems: MediaItem[] = [];
    
    // Handle both single and multiple selection
    const assets = result.assets || [];
    
    for (const asset of assets) {
      const mediaItem: MediaItem = {
        uri: asset.uri,
        type: asset.type === 'video' ? 'video' : 'image',
        width: asset.width,
        height: asset.height,
        duration: asset.duration,
      };
      
      // Cache the media locally
      try {
        const localPath = await cacheMediaLocally(asset.uri, asset.type === 'video' ? 'video' : 'image');
        if (localPath) {
          mediaItem.localPath = localPath;
        }
      } catch (cacheError) {
        console.warn('Failed to cache media locally:', cacheError);
        // Continue without local cache
      }
      
      mediaItems.push(mediaItem);
    }

    return mediaItems;
  } catch (error) {
    console.error('Error picking images:', error);
    throw error; // Re-throw to handle in UI
  }
};

// Take photo with camera
export const takePhotoWithCamera = async (): Promise<MediaItem | null> => {
  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    const asset = result.assets[0];
    const mediaItem: MediaItem = {
      uri: asset.uri,
      type: 'image',
      width: asset.width,
      height: asset.height,
    };

    // Cache the photo locally
    const localPath = await cacheMediaLocally(asset.uri, 'image');
    if (localPath) {
      mediaItem.localPath = localPath;
    }

    return mediaItem;
  } catch (error) {
    console.error('Error taking photo:', error);
    return null;
  }
};

// Save media permanently to app's storage (not cache)
export const saveMediaPermanently = async (uri: string, type: 'image' | 'video'): Promise<string | null> => {
  try {
    await ensureMediaCacheDir();
    
    const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.${type === 'video' ? 'mp4' : 'jpg'}`;
    const permanentPath = `${MEDIA_CACHE_DIR}${filename}`;
    
    // Copy file to permanent storage
    await FileSystem.copyAsync({
      from: uri,
      to: permanentPath,
    });
    
    console.log('Media saved permanently:', permanentPath);
    return permanentPath;
  } catch (error) {
    console.error('Error saving media permanently:', error);
    return null;
  }
};

// Legacy function - now saves permanently
export const cacheMediaLocally = saveMediaPermanently;

// Get cached media path
export const getCachedMediaPath = async (filename: string): Promise<string | null> => {
  const localPath = `${MEDIA_CACHE_DIR}${filename}`;
  const fileInfo = await FileSystem.getInfoAsync(localPath);
  
  if (fileInfo.exists) {
    return localPath;
  }
  
  return null;
};

// Clean old cached media (optional, for storage management)
export const cleanOldMediaCache = async (daysToKeep: number = 30) => {
  try {
    await ensureMediaCacheDir();
    
    const files = await FileSystem.readDirectoryAsync(MEDIA_CACHE_DIR);
    const now = Date.now();
    const maxAge = daysToKeep * 24 * 60 * 60 * 1000; // Convert days to milliseconds
    
    for (const file of files) {
      const filePath = `${MEDIA_CACHE_DIR}${file}`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      
      if (fileInfo.exists && fileInfo.modificationTime) {
        const age = now - fileInfo.modificationTime * 1000;
        if (age > maxAge) {
          await FileSystem.deleteAsync(filePath);
        }
      }
    }
  } catch (error) {
    console.error('Error cleaning media cache:', error);
  }
};

// Upload media to Convex storage
export const uploadMediaToConvex = async (
  uri: string, 
  type: 'image' | 'video',
  generateUploadUrl: () => Promise<string>,
  storeFileUrl: (args: any) => Promise<any>
): Promise<string | null> => {
  try {
    console.log('Starting upload to Convex:', uri);
    
    // Optimize image if needed (only for images, not videos)
    let uploadUri = uri;
    if (type === 'image') {
      const needsOptimization = await shouldOptimizeImage(uri);
      if (needsOptimization) {
        console.log('Image needs optimization, compressing...');
        uploadUri = await optimizeImage(uri);
        console.log('Image optimized');
      }
    }
    
    // Get upload URL from Convex
    console.log('Getting upload URL...');
    const uploadUrl = await generateUploadUrl();
    console.log('Got upload URL:', uploadUrl);
    
    // Read the file as blob
    console.log('Fetching file as blob...');
    const response = await fetch(uploadUri);
    const blob = await response.blob();
    const sizeInMB = blob.size / (1024 * 1024);
    console.log(`Blob size: ${sizeInMB.toFixed(2)}MB, Type: ${blob.type}`);
    
    // Log file size for monitoring (no hard limit with upload URLs)
    if (sizeInMB > 20) {
      console.warn(`Large file: ${sizeInMB.toFixed(2)}MB. Upload may take longer.`);
    }
    
    // Upload to Convex with timeout handling
    console.log('Uploading to Convex storage...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 115000); // 115 seconds (just under 2 min)
    
    try {
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': blob.type || (type === 'video' ? 'video/mp4' : 'image/jpeg'),
        },
        body: blob,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      console.log('Upload response status:', uploadResponse.status);
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Upload failed with response:', errorText);
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }
      
      const uploadResult = await uploadResponse.json();
      console.log('Upload result:', uploadResult);
      const { storageId } = uploadResult;
      
      // Store the file reference and get the URL
      console.log('Storing file reference...');
      const fileData = await storeFileUrl({
        storageId,
        type,
        format: type === 'video' ? 'mp4' : 'jpg',
      });
      console.log('File stored, URL:', fileData.url);
      
      return fileData.url;
    } catch (uploadError: any) {
      clearTimeout(timeoutId);
      if (uploadError.name === 'AbortError') {
        console.error('Upload timed out after 115 seconds');
        throw new Error('Upload timeout - file may be too large or connection too slow');
      }
      throw uploadError;
    }
  } catch (error) {
    console.error('Error uploading to Convex:', error);
    // Fallback to local URI
    return uri;
  }
};

// Legacy function for compatibility
export const uploadMediaToCloud = async (localPath: string, type: 'image' | 'video'): Promise<string | null> => {
  // This now just returns the local path
  // Use uploadMediaToConvex for actual cloud storage
  return localPath;
};

// Get file extension from URI
export const getFileExtension = (uri: string): string => {
  const match = uri.match(/\.([^.]+)$/);
  return match ? match[1] : 'jpg';
};

// Get file size in MB
export const getFileSizeMB = async (uri: string): Promise<number> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (fileInfo.exists && fileInfo.size) {
      return fileInfo.size / (1024 * 1024); // Convert to MB
    }
    return 0;
  } catch (error) {
    console.error('Error getting file size:', error);
    return 0;
  }
};