import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Doc } from '../../../convex/_generated/dataModel';
import { fonts } from '../../hooks/useFonts';
import { OptimizedImage } from '../OptimizedImage';
import { PlayIcon, MultiPhotoIcon } from './shared/icons';

interface PhotoCardProps {
  memory: Doc<"memories">;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ memory }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const mediaUrls = memory.mediaUrls || (memory.mediaUrl ? [memory.mediaUrl] : []);
  const mediaTypes = memory.mediaTypes || (memory.mediaType ? [memory.mediaType] : []);
  const localPaths = memory.localMediaPaths || [];
  const hasMultiplePhotos = mediaUrls.length > 1;
  
  const handleImagePress = () => {
    if (hasMultiplePhotos) {
      setCurrentImageIndex((prev) => (prev + 1) % mediaUrls.length);
    }
  };
  
  const currentUri = localPaths[currentImageIndex] || mediaUrls[currentImageIndex];
  const currentType = mediaTypes[currentImageIndex] || memory.mediaType;
  const isVideo = currentType === 'video';
  
  return (
    <TouchableOpacity 
      style={[styles.cardContainer, styles.photoCard]}
      onPress={handleImagePress}
      activeOpacity={hasMultiplePhotos ? 0.9 : 1}
    >
      <View style={styles.photoWrapper}>
        <OptimizedImage
          cloudUrl={mediaUrls[currentImageIndex]}
          localPath={localPaths[currentImageIndex]}
          style={styles.photoImage}
        />
        {isVideo && (
          <View style={styles.playOverlay}>
            <PlayIcon />
          </View>
        )}
        {hasMultiplePhotos && (
          <View style={styles.multiPhotoIndicator}>
            <MultiPhotoIcon />
            <Text style={styles.multiPhotoText}>{currentImageIndex + 1}/{mediaUrls.length}</Text>
          </View>
        )}
      </View>
      {memory.content && (
        <View style={styles.photoContent}>
          {memory.title && (
            <Text style={styles.photoTitle}>{memory.title}</Text>
          )}
          <Text style={styles.photoCaption}>{memory.content}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  photoCard: {
    marginTop: 12,
  },
  photoWrapper: {
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: 250,
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  multiPhotoIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  multiPhotoText: {
    color: 'white',
    fontSize: 12,
    fontFamily: fonts.nunitoBold,
  },
  photoContent: {
    padding: 16,
  },
  photoTitle: {
    fontSize: 20,
    color: '#1F2937',
    fontFamily: fonts.playfairBold,
    marginBottom: 4,
  },
  photoCaption: {
    fontSize: 15,
    color: '#4B5563',
    fontFamily: fonts.nunito,
    lineHeight: 22,
  },
});