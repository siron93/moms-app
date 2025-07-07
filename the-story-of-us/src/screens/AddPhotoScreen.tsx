import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { fonts } from '../hooks/useFonts';
import { 
  MediaItem, 
  requestMediaPermissions, 
  pickImagesFromGallery, 
  takePhotoWithCamera,
  uploadMediaToCloud,
  uploadMediaToConvex,
  saveMediaPermanently 
} from '../services/mediaService';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { getOrCreateAnonymousId } from '../utils/anonymousId';
import { getUTCTimestamp } from '../utils/dateUtils';
import { addUploadToQueue } from '../services/backgroundUpload';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Icons
const CameraIcon = () => (
  <Svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.5">
    <Path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
    <Path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008v-.008z" />
  </Svg>
);

const GalleryIcon = () => (
  <Svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.5">
    <Path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </Svg>
);

const CloseIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
    <Path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </Svg>
);

const DeleteIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
    <Path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </Svg>
);


interface AddPhotoScreenProps {
  onClose: () => void;
  onSave: (data: any) => void;
  babyId: string;
}

export const AddPhotoScreen: React.FC<AddPhotoScreenProps> = ({ onClose, onSave, babyId }) => {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);
  const [caption, setCaption] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [anonymousId, setAnonymousId] = useState<string | null>(null);

  const createPhoto = useMutation(api.photos.createPhoto);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const storeFileUrl = useMutation(api.files.storeFileUrl);

  useEffect(() => {
    getOrCreateAnonymousId().then(setAnonymousId);
  }, []);

  const handleCameraPress = async () => {
    const permissions = await requestMediaPermissions();
    if (!permissions.camera) {
      Alert.alert('Permission needed', 'Please allow camera access to take photos');
      return;
    }

    const photo = await takePhotoWithCamera();
    if (photo) {
      setSelectedMedia([photo]);
      setShowPreview(true);
    }
  };

  const handleGalleryPress = async () => {
    const permissions = await requestMediaPermissions();
    if (!permissions.mediaLibrary) {
      Alert.alert('Permission needed', 'Please allow photo library access');
      return;
    }

    // Use multiple selection since we're in development build
    handleMultipleImagePick();
  };

  const handleMultipleImagePick = async () => {
    try {
      const remainingSlots = 15 - selectedMedia.length;
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All, // Allow both images and videos
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: remainingSlots,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newMediaItems: MediaItem[] = result.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' : 'image',
          width: asset.width,
          height: asset.height,
          duration: asset.duration,
        }));
        
        setSelectedMedia(prev => [...prev, ...newMediaItems]);
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Multiple image picker error:', error);
      Alert.alert('Error', 'Failed to select media. Please try again.');
    }
  };

  const handleSingleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const newMedia: MediaItem = {
          uri: asset.uri,
          type: 'image',
          width: asset.width,
          height: asset.height,
        };
        
        setSelectedMedia(prev => [...prev, newMedia]);
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Single image picker error:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const removeMedia = (index: number) => {
    setSelectedMedia(prev => prev.filter((_, i) => i !== index));
    if (selectedMedia.length === 1) {
      setShowPreview(false);
    }
  };

  const handleSave = async () => {
    if (!babyId || selectedMedia.length === 0) return;

    setIsUploading(true);
    try {
      // First, save all media permanently to app storage
      const permanentPaths: string[] = [];
      const mediaTypes: ('image' | 'video')[] = [];
      
      for (const media of selectedMedia) {
        // Save to permanent storage
        const permanentPath = await saveMediaPermanently(media.uri, media.type);
        if (permanentPath) {
          permanentPaths.push(permanentPath);
          mediaTypes.push(media.type);
        } else {
          // Fallback to original URI if save fails
          permanentPaths.push(media.uri);
          mediaTypes.push(media.type);
        }
      }

      // Create photo entry immediately with local paths
      const photoId = await createPhoto({
        babyId: babyId as any,
        caption: caption,
        mediaUrls: permanentPaths, // Use local paths initially
        mediaTypes: mediaTypes,
        localMediaPaths: permanentPaths,
        mediaType: mediaTypes[0], // Primary media type
        date: getUTCTimestamp(),
        anonymousId: anonymousId || undefined,
      });

      // Queue uploads for background processing
      for (let i = 0; i < permanentPaths.length; i++) {
        await addUploadToQueue({
          entryId: photoId as any,
          entryType: 'photo',
          localUri: permanentPaths[i],
          index: i,
          type: mediaTypes[i],
          retryCount: 0,
        });
      }
      
      console.log('Media queued for background upload');

      onSave({
        type: 'photo',
        mediaItems: selectedMedia,
        caption,
        date: getUTCTimestamp(),
      });

      onClose();
    } catch (error) {
      console.error('Error saving memory:', error);
      Alert.alert('Error', 'Failed to save memory. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };


  const renderMediaGrid = () => {
    const numColumns = selectedMedia.length === 1 ? 1 : 2;
    const imageSize = selectedMedia.length === 1 ? SCREEN_WIDTH - 40 : (SCREEN_WIDTH - 60) / 2;

    return (
      <FlatList
        data={selectedMedia}
        numColumns={numColumns}
        key={`grid-${numColumns}`}
        renderItem={({ item, index }) => (
          <View style={[styles.gridImageContainer, { width: imageSize, height: imageSize }]}>
            <Image source={{ uri: item.uri }} style={styles.gridImage} />
            {item.type === 'video' && (
              <View style={styles.videoIndicator}>
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <Path d="M8 5v14l11-7z" />
              </Svg>
              </View>
            )}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeMedia(index)}
            >
              <DeleteIcon />
            </TouchableOpacity>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        columnWrapperStyle={numColumns > 1 ? styles.gridRow : undefined}
        scrollEnabled={false}
      />
    );
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {showPreview ? (
          <KeyboardAvoidingView 
            style={styles.flex} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <CloseIcon />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Add Photos</Text>
              <TouchableOpacity 
                onPress={handleSave} 
                style={[styles.saveButton, isUploading && styles.saveButtonDisabled]}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Media Preview */}
            <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
              <View style={styles.mediaPreviewContainer}>
                {renderMediaGrid()}
                
                {selectedMedia.length < 15 && (
                  <TouchableOpacity 
                    style={styles.addMoreButton}
                    onPress={handleMultipleImagePick}
                  >
                    <Text style={styles.addMoreText}>+ Add more photos ({selectedMedia.length}/15)</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Caption Input */}
              <View style={styles.captionContainer}>
                <TextInput
                  style={styles.captionInput}
                  placeholder="Add a caption..."
                  placeholderTextColor="#9CA3AF"
                  value={caption}
                  onChangeText={setCaption}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
                <Text style={styles.captionHint}>
                  {selectedMedia.length} {selectedMedia.length === 1 ? 'photo' : 'photos'} selected
                </Text>
              </View>

              {/* Date Picker (simplified) */}
              <TouchableOpacity style={styles.dateContainer}>
                <Text style={styles.dateLabel}>Date</Text>
                <Text style={styles.dateValue}>Today</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        ) : (
          <>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <CloseIcon />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Add Photo or Video</Text>
              <View style={styles.closeButton} />
            </View>

            {/* Options */}
            <View style={styles.optionsContainer}>
              <Text style={styles.sectionTitle}>How would you like to add your memory?</Text>
              
              <View style={styles.cardsContainer}>
                <TouchableOpacity 
                  style={styles.optionCard} 
                  onPress={handleCameraPress}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionIconContainer}>
                    <CameraIcon />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Take Photo</Text>
                    <Text style={styles.optionSubtitle}>Capture a new moment</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.optionCard} 
                  onPress={handleGalleryPress}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionIconContainer}>
                    <GalleryIcon />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Choose from Gallery</Text>
                    <Text style={styles.optionSubtitle}>Select multiple photos and videos</Text>
                  </View>
                </TouchableOpacity>
              </View>
              
              {/* Bottom decorative text */}
              <Text style={styles.bottomText}>Every photo tells a story</Text>
            </View>
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF8',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.playfairBold,
    color: '#1F2937',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F59E0B',
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontFamily: fonts.nunitoBold,
    fontSize: 14,
  },
  optionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: fonts.playfair,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 40,
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    marginTop: -40,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  optionIconContainer: {
    width: 72,
    height: 72,
    backgroundColor: '#F59E0B',
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  optionTextContainer: {
    flex: 1,
    marginLeft: 20,
  },
  optionTitle: {
    fontSize: 18,
    fontFamily: fonts.playfairBold,
    color: '#1F2937',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    fontFamily: fonts.nunito,
    color: '#6B7280',
  },
  mediaPreviewContainer: {
    padding: 20,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  gridImageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  videoIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMoreButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderStyle: 'dashed',
  },
  addMoreText: {
    fontSize: 14,
    fontFamily: fonts.nunitoBold,
    color: '#F59E0B',
    textAlign: 'center',
  },
  captionContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  captionInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: fonts.caveat,
    color: '#1F2937',
    minHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  captionHint: {
    fontSize: 12,
    fontFamily: fonts.nunito,
    color: '#9CA3AF',
    marginTop: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: 40,
  },
  dateLabel: {
    fontSize: 16,
    fontFamily: fonts.nunito,
    color: '#6B7280',
  },
  dateValue: {
    fontSize: 16,
    fontFamily: fonts.nunitoBold,
    color: '#1F2937',
  },
  bottomText: {
    fontSize: 16,
    fontFamily: fonts.caveat,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 'auto',
    marginBottom: 40,
  },
});