import React, { useState, useEffect, useCallback } from 'react';
import { Image, ImageProps, View, ActivityIndicator } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { getCachedMediaPath } from '../services/mediaService';
import { getLocalPathForConvexUrl } from '../services/localMediaCache';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  cloudUrl?: string;
  localPath?: string;
  fallbackUri?: string;
  showLoading?: boolean;
  priority?: 'low' | 'normal' | 'high';
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  cloudUrl,
  localPath,
  fallbackUri,
  showLoading = true,
  priority = 'normal',
  style,
  ...props
}) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOptimalImage();
  }, [cloudUrl, localPath, fallbackUri]);

  const loadOptimalImage = useCallback(async () => {
    // Don't show loading for local images
    if (localPath && localPath.startsWith('file://')) {
      setIsLoading(false);
    }
    
    try {
      // Priority 1: Always use local path first if it exists
      if (localPath && localPath.startsWith('file://')) {
        const fileInfo = await FileSystem.getInfoAsync(localPath);
        if (fileInfo.exists) {
          setImageUri(localPath);
          return;
        }
      }

      // Priority 2: Check if cloudUrl is actually a local path (during upload)
      if (cloudUrl && cloudUrl.startsWith('file://')) {
        const fileInfo = await FileSystem.getInfoAsync(cloudUrl);
        if (fileInfo.exists) {
          setImageUri(cloudUrl);
          return;
        }
      }

      // Priority 3: Check local cache for Convex URL
      if (cloudUrl && cloudUrl.startsWith('http')) {
        const cachedPath = await getLocalPathForConvexUrl(cloudUrl);
        if (cachedPath) {
          setImageUri(cachedPath);
          setIsLoading(false);
          return;
        }
        
        // Priority 4: ONLY as last resort, use cloud URL
        // This should rarely happen - only first time viewing
        console.log('Warning: Loading image from Convex (bandwidth usage):', cloudUrl);
        setImageUri(cloudUrl);
        setIsLoading(false);
        return;
      }

      // Priority 5: Use fallback (should rarely happen)
      if (fallbackUri) {
        setImageUri(fallbackUri);
        setIsLoading(false);
        return;
      }

      // No valid image source found
      console.warn('No valid image source found:', { cloudUrl, localPath, fallbackUri });
      setIsLoading(false);

    } catch (error) {
      console.error('Error loading optimized image:', error);
      // Try any available URL as last resort
      setImageUri(localPath || cloudUrl || fallbackUri || '');
      setIsLoading(false);
    }
  }, [cloudUrl, localPath, fallbackUri]);

  if (!imageUri) {
    return showLoading ? (
      <View style={[{ backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' }, style]}>
        <ActivityIndicator size="small" color="#9CA3AF" />
      </View>
    ) : null;
  }

  return (
    <Image
      {...props}
      source={{ uri: imageUri }}
      style={style}
      onLoadEnd={() => setIsLoading(false)}
      resizeMode={props.resizeMode || 'cover'}
    />
  );
};