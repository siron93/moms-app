import * as ImageManipulator from 'expo-image-manipulator';

interface OptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export const optimizeImage = async (
  uri: string,
  options: OptimizationOptions = {}
): Promise<string> => {
  const {
    maxWidth = 1920,  // Full HD width
    maxHeight = 1920, // Full HD height
    quality = 0.8,    // 80% quality
  } = options;

  try {
    // Resize and compress the image
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: maxWidth,
            height: maxHeight,
          },
        },
      ],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    console.log('Image optimized:', {
      originalUri: uri,
      optimizedUri: result.uri,
    });

    return result.uri;
  } catch (error) {
    console.error('Error optimizing image:', error);
    // Return original if optimization fails
    return uri;
  }
};

export const getImageSizeInMB = async (uri: string): Promise<number> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob.size / (1024 * 1024); // Convert to MB
  } catch (error) {
    console.error('Error getting image size:', error);
    return 0;
  }
};

export const shouldOptimizeImage = async (uri: string): Promise<boolean> => {
  const sizeInMB = await getImageSizeInMB(uri);
  // Optimize if larger than 5MB to balance quality and upload speed
  return sizeInMB > 5;
};