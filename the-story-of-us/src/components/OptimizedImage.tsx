import React, { useState, useEffect } from 'react';
import { Image, ImageProps, View, ActivityIndicator } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { getCachedMediaPath } from '../services/mediaService';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  cloudUrl?: string;
  localPath?: string;
  fallbackUri?: string;
  showLoading?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  cloudUrl,
  localPath,
  fallbackUri,
  showLoading = true,
  style,
  ...props
}) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOptimalImage();
  }, [cloudUrl, localPath, fallbackUri]);

  const loadOptimalImage = async () => {
    setIsLoading(true);
    
    try {
      // Priority 1: Always use local path first if it exists
      if (localPath && localPath.startsWith('file://')) {
        const fileInfo = await FileSystem.getInfoAsync(localPath);
        if (fileInfo.exists) {
          setImageUri(localPath);
          setIsLoading(false);
          return;
        }
      }

      // Priority 2: Check if cloudUrl is actually a local path (during upload)
      if (cloudUrl && cloudUrl.startsWith('file://')) {
        const fileInfo = await FileSystem.getInfoAsync(cloudUrl);
        if (fileInfo.exists) {
          setImageUri(cloudUrl);
          setIsLoading(false);
          return;
        }
      }

      // Priority 3: Use cloud URL as backup if local doesn't exist
      if (cloudUrl && cloudUrl.startsWith('http')) {
        setImageUri(cloudUrl);
        setIsLoading(false);
        
        // Optionally download and cache for next time
        // This could be implemented later for offline support
        return;
      }

      // Priority 4: Use fallback (should rarely happen)
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
  };

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
    />
  );
};