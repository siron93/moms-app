import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  Modal,
  SafeAreaView,
  TouchableWithoutFeedback,
  FlatList,
  StatusBar,
  ScrollView,
} from 'react-native';
import { 
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Doc } from '../../../convex/_generated/dataModel';
import { fonts } from '../../hooks/useFonts';
import { OptimizedImage } from '../OptimizedImage';
import { PlayIcon, MultiPhotoIcon } from './shared/icons';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_MARGIN = 40;
const IMAGE_WIDTH = SCREEN_WIDTH - CARD_MARGIN;
const SWIPE_THRESHOLD = IMAGE_WIDTH * 0.25;

interface EnhancedPhotoCardProps {
  memory: Doc<"memories">;
}

// Close icon
const CloseIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
    <Path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </Svg>
);

export const EnhancedPhotoCard: React.FC<EnhancedPhotoCardProps> = ({ memory }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [fullScreenIndex, setFullScreenIndex] = useState(0);
  
  const translateX = useSharedValue(0);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const mediaUrls = memory.mediaUrls || (memory.mediaUrl ? [memory.mediaUrl] : []);
  const mediaTypes = memory.mediaTypes || (memory.mediaType ? [memory.mediaType] : []);
  const localPaths = memory.localMediaPaths || [];
  const hasMultiplePhotos = mediaUrls.length > 1;
  
  const changeIndex = (newIndex: number) => {
    'worklet';
    runOnJS(setCurrentImageIndex)(newIndex);
  };
  
  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: (_, ctx: any) => {
      'worklet';
      ctx.startX = translateX.value;
    },
    onActive: (event, ctx) => {
      'worklet';
      if (hasMultiplePhotos) {
        // Calculate the translation with boundaries
        const maxTranslate = 0;
        const minTranslate = -(mediaUrls.length - 1) * IMAGE_WIDTH;
        
        let nextTranslate = ctx.startX + event.translationX;
        
        // Add resistance at boundaries
        if (nextTranslate > maxTranslate) {
          nextTranslate = maxTranslate + event.translationX * 0.3;
        } else if (nextTranslate < minTranslate) {
          nextTranslate = minTranslate + (event.translationX + (minTranslate - ctx.startX)) * 0.3;
        }
        
        translateX.value = nextTranslate;
      }
    },
    onEnd: (event) => {
      'worklet';
      if (!hasMultiplePhotos) return;
      
      const currentOffset = -currentImageIndex * IMAGE_WIDTH;
      const velocity = event.velocityX;
      
      // Determine if we should change images based on distance or velocity
      const shouldGoNext = event.translationX < -SWIPE_THRESHOLD || velocity < -500;
      const shouldGoPrev = event.translationX > SWIPE_THRESHOLD || velocity > 500;
      
      let nextIndex = currentImageIndex;
      
      if (shouldGoNext && currentImageIndex < mediaUrls.length - 1) {
        nextIndex = currentImageIndex + 1;
      } else if (shouldGoPrev && currentImageIndex > 0) {
        nextIndex = currentImageIndex - 1;
      }
      
      const targetOffset = -nextIndex * IMAGE_WIDTH;
      
      translateX.value = withSpring(targetOffset, {
        damping: 20,
        stiffness: 200,
        velocity: velocity / 1000,
      });
      
      changeIndex(nextIndex);
    },
  });
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });
  
  const handleCardTap = () => {
    setShowModal(true);
  };
  
  const handleModalImageTap = (index: number) => {
    console.log('Gallery image tapped, index:', index);
    setFullScreenIndex(index);
    setShowFullScreen(true);
    // Close the gallery modal when opening full screen
    setShowModal(false);
  };
  
  const handleDotPress = (index: number) => {
    setCurrentImageIndex(index);
    translateX.value = withSpring(-index * IMAGE_WIDTH);
  };
  
  const renderModalItem = ({ item, index }: { item: string; index: number }) => {
    const isVideo = mediaTypes[index] === 'video';
    
    return (
      <TouchableWithoutFeedback onPress={() => handleModalImageTap(index)}>
        <View style={styles.modalImageContainer}>
          <OptimizedImage
            cloudUrl={mediaUrls[index]}
            localPath={localPaths[index]}
            style={styles.modalImage}
            priority="high"
          />
          {isVideo && (
            <View style={styles.modalPlayOverlay}>
              <PlayIcon />
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    );
  };
  
  return (
    <>
      <View style={[styles.cardContainer, styles.photoCard]}>
        <TouchableWithoutFeedback onPress={handleCardTap}>
          <View>
            {hasMultiplePhotos ? (
              <View style={styles.carouselContainer}>
                <PanGestureHandler onGestureEvent={gestureHandler}>
                  <Animated.View>
                    <Animated.View style={[styles.imagesContainer, animatedStyle]}>
                      {mediaUrls.map((url, index) => (
                        <View key={index} style={styles.imageWrapper}>
                          <OptimizedImage
                            cloudUrl={url}
                            localPath={localPaths[index]}
                            style={styles.photoImage}
                            priority={Math.abs(index - currentImageIndex) <= 1 ? "high" : "low"}
                          />
                          {mediaTypes[index] === 'video' && (
                            <View style={styles.playOverlay}>
                              <PlayIcon />
                            </View>
                          )}
                        </View>
                      ))}
                    </Animated.View>
                  </Animated.View>
                </PanGestureHandler>
                <View style={styles.multiPhotoIndicator}>
                  <MultiPhotoIcon />
                  <Text style={styles.multiPhotoText}>{currentImageIndex + 1}/{mediaUrls.length}</Text>
                </View>
                <View style={styles.dotsContainer}>
                  {mediaUrls.map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleDotPress(index)}
                      style={styles.dotTouchable}
                    >
                      <View
                        style={[
                          styles.dot,
                          index === currentImageIndex && styles.activeDot,
                        ]}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.imageWrapper}>
                <OptimizedImage
                  cloudUrl={mediaUrls[0]}
                  localPath={localPaths[0]}
                  style={styles.photoImage}
                  priority="high"
                />
                {mediaTypes[0] === 'video' && (
                  <View style={styles.playOverlay}>
                    <PlayIcon />
                  </View>
                )}
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
        
        {memory.content && (
          <View style={styles.photoContent}>
            {memory.title && (
              <Text style={styles.photoTitle}>{memory.title}</Text>
            )}
            <Text style={styles.photoCaption}>{memory.content}</Text>
          </View>
        )}
      </View>
      
      {/* Gallery Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="overFullScreen"
        onRequestClose={() => setShowModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Photos & Videos</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <CloseIcon />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={mediaUrls}
            renderItem={renderModalItem}
            keyExtractor={(_, index) => index.toString()}
            numColumns={2}
            contentContainerStyle={styles.modalGrid}
            columnWrapperStyle={mediaUrls.length > 1 ? styles.modalRow : undefined}
          />
        </SafeAreaView>
      </Modal>
      
      {/* Full Screen Modal */}
      <Modal
        visible={showFullScreen}
        animationType="fade"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={() => {
          setShowFullScreen(false);
          setShowModal(true); // Re-open gallery modal
        }}
      >
        <View style={styles.fullScreenContainer}>
          <StatusBar hidden />
          <TouchableWithoutFeedback onPress={() => {
            setShowFullScreen(false);
            setShowModal(true); // Re-open gallery modal
          }}>
            <View style={styles.fullScreenImageWrapper}>
              <OptimizedImage
                cloudUrl={mediaUrls[fullScreenIndex]}
                localPath={localPaths[fullScreenIndex]}
                style={styles.fullScreenImage}
                resizeMode="contain"
                priority="high"
              />
              {mediaTypes[fullScreenIndex] === 'video' && (
                <View style={styles.fullScreenPlayOverlay}>
                  <PlayIcon />
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
          <TouchableOpacity 
            style={styles.fullScreenCloseButton}
            onPress={() => {
              setShowFullScreen(false);
              setShowModal(true); // Re-open gallery modal
            }}
          >
            <CloseIcon />
          </TouchableOpacity>
        </View>
      </Modal>
    </>
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
  carouselContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  imagesContainer: {
    flexDirection: 'row',
  },
  imageWrapper: {
    width: IMAGE_WIDTH,
    position: 'relative',
  },
  photoImage: {
    width: IMAGE_WIDTH,
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
  dotsContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dotTouchable: {
    padding: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
    width: 18,
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
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FDFBF8',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: fonts.playfairBold,
    color: '#92400E',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(146, 64, 14, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalGrid: {
    padding: 10,
  },
  modalRow: {
    justifyContent: 'space-between',
  },
  modalImageContainer: {
    flex: 0.48,
    aspectRatio: 1,
    margin: 5,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalPlayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Full screen styles
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImageWrapper: {
    flex: 1,
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  fullScreenPlayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});