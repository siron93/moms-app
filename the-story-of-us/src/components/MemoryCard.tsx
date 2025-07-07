import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Doc } from '../../convex/_generated/dataModel';
import { formatRelativeDate, calculateAgeAtDate } from '../utils/babyAge';
import { fonts } from '../hooks/useFonts';
import { OptimizedImage } from './OptimizedImage';
import { MILESTONE_IMAGES } from '../utils/milestoneImages';

interface MemoryCardProps {
  memory: Doc<"memories">;
  baby: Doc<"babies">;
  growthData?: Doc<"growthLogs">;
  milestone?: Doc<"milestones">;
  milestoneEntry?: Doc<"milestoneEntries">;
  onMilestonePress?: (milestone: Doc<"milestones">, milestoneEntry?: Doc<"milestoneEntries">) => void;
}

// Date badge component - matches HTML exactly
const DateBadge: React.FC<{ date: number; birthDate: number; relativeDate: string; alignRight?: boolean; color?: 'amber' | 'rose' | 'green' }> = ({ 
  date, 
  birthDate, 
  relativeDate,
  alignRight = false,
  color = 'amber'
}) => {
  const ageText = calculateAgeAtDate(birthDate, date);
  
  const colorStyles: Record<'amber' | 'rose' | 'green', { backgroundColor: string; textColor: string }> = {
    amber: { backgroundColor: 'rgba(255, 255, 255, 0.8)', textColor: '#92400E' },
    rose: { backgroundColor: 'rgba(255, 255, 255, 0.8)', textColor: '#BE123C' },
    green: { backgroundColor: 'rgba(255, 255, 255, 0.8)', textColor: '#059669' }
  };
  
  return (
    <View style={[styles.dateBadge, alignRight && styles.dateBadgeRight]}>
      <View style={[styles.dateBadgeContent, { backgroundColor: colorStyles[color as keyof typeof colorStyles].backgroundColor }]}>
        <Text style={[styles.dateBadgeText, { color: colorStyles[color as keyof typeof colorStyles].textColor }]}>
          {relativeDate} • {ageText}
        </Text>
      </View>
    </View>
  );
};

// Birth Announcement Card - matches HTML design
const BirthAnnouncementCard: React.FC<{ memory: Doc<"memories">; baby: Doc<"babies"> }> = ({ memory, baby }) => {
  const birthDate = new Date(baby.birthDate);
  return (
    <View style={[styles.cardContainer, styles.birthCard]}>
      <Image 
        source={{ uri: 'https://images.pexels.com/photos/1391487/pexels-photo-1391487.jpeg?auto=compress&cs=tinysrgb&w=800' }}
        style={styles.birthImage}
      />
      <View style={styles.birthContent}>
        <Text style={styles.birthSubtitle}>Welcome to the world</Text>
        <Text style={styles.birthTitle}>{baby.name}</Text>
        <View style={styles.birthDivider} />
        <View style={styles.birthDetails}>
          <View style={styles.birthDetailItem}>
            <Text style={styles.birthDetailLabel}>Born on</Text>
            <Text style={styles.birthDetailValue}>
              {birthDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
          <View style={styles.birthDetailItem}>
            <Text style={styles.birthDetailLabel}>Weight</Text>
            <Text style={styles.birthDetailValue}>7 lbs 2 oz</Text>
          </View>
          <View style={styles.birthDetailItem}>
            <Text style={styles.birthDetailLabel}>Length</Text>
            <Text style={styles.birthDetailValue}>20 inches</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// Icons for photo card
const PlayIcon = () => (
  <Svg width="48" height="48" viewBox="0 0 24 24" fill="white">
    <Path d="M8 5v14l11-7z" />
  </Svg>
);

const MultiPhotoIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="white">
    <Path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4zm0 15l3-3.86 2.14 2.58 3-3.86L18 19H6z" />
  </Svg>
);

// Photo Card - matches HTML design exactly
const PhotoCard: React.FC<{ memory: Doc<"memories"> }> = ({ memory }) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
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

// Journal Card - matches rose-colored design from HTML
const JournalCard: React.FC<{ memory: Doc<"memories"> }> = ({ memory }) => (
  <View style={[styles.cardContainer, styles.journalCard]}>
    <Text style={styles.journalTitle}>
      {memory.title || "A note from my heart..."}
    </Text>
    <Text style={styles.journalContent}>
      {memory.content}
    </Text>
  </View>
);

// First Card - matches violet design from HTML
const FirstCard: React.FC<{ memory: Doc<"memories"> }> = ({ memory }) => {
  const getFirstEmoji = (type?: string) => {
    switch(type) {
      case 'first_word': return '💬';
      case 'first_food': return '🥄';
      case 'first_tooth': return '🦷';
      case 'first_laugh': return '😂';
      case 'first_smile': return '😊';
      case 'first_steps': return '👣';
      default: return '⭐';
    }
  };
  
  const getFirstIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 20 20" fill="#8B5CF6">
      <Path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.121-3.536a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM10 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM3.05 11.536a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM4.95 6.464a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707z" clipRule="evenodd" />
    </Svg>
  );
  
  return (
    <View style={[styles.cardContainer, styles.firstCard]}>
      <View style={styles.firstHeader}>
        <View style={styles.firstIcon}>
          {getFirstIcon()}
        </View>
        <View style={styles.firstContent}>
          <Text style={styles.firstTitle}>
            {memory.title || `First ${memory.firstType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}` || 'Special First'} {getFirstEmoji(memory.firstType)}
          </Text>
          {memory.content && (
            <Text style={styles.firstDescription}>{memory.content}</Text>
          )}
        </View>
      </View>
    </View>
  );
};

// Growth Card - matches orange design from HTML
const GrowthCard: React.FC<{ memory: Doc<"memories">; growthData?: Doc<"growthLogs"> }> = ({ memory, growthData }) => {
  const GrowthIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="1.5">
      <Path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25a8.964 8.964 0 014.28 1.162l-2.024 2.024a.75.75 0 00.216 1.284l3.286-.672a.75.75 0 00.569-1.284l-2.024-2.024A9 9 0 0012 2.25z" />
    </Svg>
  );
  
  if (!growthData) {
    return (
      <View style={[styles.cardContainer, styles.growthCard]}>
        <View style={styles.growthHeader}>
          <View style={styles.growthIcon}>
            {GrowthIcon()}
          </View>
          <Text style={styles.growthTitle}>Growth Update</Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={[styles.cardContainer, styles.growthCard]}>
      <View style={styles.growthHeader}>
        <View style={styles.growthIcon}>
          {GrowthIcon()}
        </View>
        <View style={styles.growthContent}>
          <Text style={styles.growthTitle}>Growth Update</Text>
          <View style={styles.growthStats}>
            {growthData.weight && (
              <View style={styles.growthStatItem}>
                <Text style={styles.growthStatLabel}>Weight</Text>
                <Text style={styles.growthStatValue}>{growthData.weight} {growthData.weightUnit || 'lbs'}</Text>
              </View>
            )}
            {growthData.weight && growthData.height && (
              <View style={styles.growthDivider} />
            )}
            {growthData.height && (
              <View style={styles.growthStatItem}>
                <Text style={styles.growthStatLabel}>Height</Text>
                <Text style={styles.growthStatValue}>{growthData.height} {growthData.heightUnit || 'in'}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

// Milestone Card - matches teal/sky designs from HTML
const MilestoneCard: React.FC<{ 
  memory: Doc<"memories">;
  milestone?: Doc<"milestones">; 
  milestoneEntry?: Doc<"milestoneEntries">;
  onPress?: () => void;
}> = ({ memory, milestone, milestoneEntry, onPress }) => {
  if (!milestone) return null;
  
  // Debug logging
  console.log('Milestone name:', milestone.name);
  console.log('Has image:', !!MILESTONE_IMAGES[milestone.name]);
  
  const hasPhoto = milestoneEntry?.photoUrl || milestoneEntry?.photoLocalPath;
  
  // Special milestone: First Word
  if (milestone.name === 'First Word' && milestoneEntry?.metadata?.word) {
    const hasPhoto = milestoneEntry?.photoUrl || milestoneEntry?.photoLocalPath;
    
    return (
      <TouchableOpacity 
        style={[styles.cardContainer, styles.milestoneCardSpecial]}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <View>
          <View style={styles.milestoneContentNoPhoto}>
            {milestone && MILESTONE_IMAGES[milestone.name] && (
              <Image source={MILESTONE_IMAGES[milestone.name]} style={styles.milestoneIcon} />
            )}
            <View style={styles.milestoneTextContentNoPhoto}>
              <Text style={styles.milestoneLabel}>MILESTONE</Text>
              <Text style={styles.milestoneTitle}>First Word</Text>
              {memory.content && (
                <Text style={styles.milestoneNotes}>{memory.content}</Text>
              )}
              <View style={styles.firstWordBox}>
                <Text style={styles.firstWordText}>"{milestoneEntry.metadata.word}"</Text>
              </View>
            </View>
          </View>
          {hasPhoto && (
            <OptimizedImage
              cloudUrl={milestoneEntry.photoUrl}
              localPath={milestoneEntry.photoLocalPath}
              style={styles.milestonePhotoFull}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  }
  
  // Milestone with photo
  if (hasPhoto) {
    return (
      <TouchableOpacity 
        style={[styles.cardContainer, styles.milestoneCardWithPhoto]}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <View>
          <View style={styles.milestoneContentNoPhoto}>
            {milestone && MILESTONE_IMAGES[milestone.name] && (
              <Image source={MILESTONE_IMAGES[milestone.name]} style={styles.milestoneIcon} />
            )}
            <View style={styles.milestoneTextContentNoPhoto}>
              <Text style={styles.milestoneLabel}>MILESTONE</Text>
              <Text style={styles.milestoneTitle}>{milestone.name}</Text>
              {memory.content && (
                <Text style={styles.milestoneNotes}>
                  {memory.content}
                </Text>
              )}
            </View>
          </View>
          <OptimizedImage
            cloudUrl={milestoneEntry.photoUrl}
            localPath={milestoneEntry.photoLocalPath}
            style={styles.milestonePhotoFull}
          />
        </View>
      </TouchableOpacity>
    );
  }
  
  // Regular milestone without photo
  return (
    <TouchableOpacity 
      style={[styles.cardContainer, styles.milestoneCard]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.milestoneContentNoPhoto}>
        {milestone && MILESTONE_IMAGES[milestone.name] ? (
          <Image source={MILESTONE_IMAGES[milestone.name]} style={styles.milestoneIcon} />
        ) : null}
        <View style={styles.milestoneTextContentNoPhoto}>
          <Text style={styles.milestoneLabel}>MILESTONE</Text>
          <Text style={styles.milestoneTitle}>{milestone.name}</Text>
          {memory.content && (
            <Text style={styles.milestoneNotes} numberOfLines={3}>
              {memory.content}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const MemoryCard: React.FC<MemoryCardProps> = ({ 
  memory, 
  baby, 
  growthData,
  milestone,
  milestoneEntry,
  onMilestonePress 
}) => {
  const relativeDate = formatRelativeDate(memory.date);
  
  // Check if this is a birth announcement
  if (memory.tags?.includes('birth') || memory.title === 'Welcome to the world') {
    return (
      <View style={styles.memoryContainer}>
        <BirthAnnouncementCard memory={memory} baby={baby} />
      </View>
    );
  }
  
  return (
    <View style={styles.memoryContainer}>
      <DateBadge 
        date={memory.date} 
        birthDate={baby.birthDate} 
        relativeDate={relativeDate}
        alignRight={memory.type === 'journal'}
        color={memory.type === 'journal' ? 'rose' : memory.type === 'milestone' ? 'green' : 'amber'}
      />
      
      {memory.type === 'photo' && (
        <PhotoCard memory={memory} />
      )}
      
      {memory.type === 'journal' && (
        <JournalCard memory={memory} />
      )}
      
      {memory.type === 'first' && (
        <FirstCard memory={memory} />
      )}
      
      {memory.type === 'growth' && (
        <GrowthCard memory={memory} growthData={growthData} />
      )}
      
      {memory.type === 'milestone' && milestone && (
        <MilestoneCard 
          memory={memory}
          milestone={milestone} 
          milestoneEntry={milestoneEntry}
          onPress={() => onMilestonePress?.(milestone, milestoneEntry)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  memoryContainer: {
    marginBottom: 32,
  },
  dateBadge: {
    position: 'absolute',
    top: -12,
    left: 16,
    zIndex: 10,
  },
  dateBadgeRight: {
    left: 'auto',
    right: 16,
  },
  dateBadgeContent: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  dateBadgeText: {
    fontSize: 12,
    fontFamily: fonts.nunitoBold,
    letterSpacing: 0.2,
  },
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
  
  // Birth Announcement Card - matches HTML exactly
  birthCard: {
    backgroundColor: 'rgba(251, 191, 36, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  birthImage: {
    width: '100%',
    height: 200,
  },
  birthContent: {
    padding: 20,
    alignItems: 'center',
  },
  birthSubtitle: {
    fontSize: 14,
    color: 'rgba(146, 64, 14, 0.8)',
    fontFamily: fonts.nunitoBold,
  },
  birthTitle: {
    fontSize: 40,
    color: '#92400E',
    fontFamily: fonts.playfairBold,
    marginTop: 4,
    letterSpacing: -0.5,
  },
  birthDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#FCD34D',
    marginVertical: 16,
  },
  birthDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  birthDetailItem: {
    alignItems: 'center',
  },
  birthDetailLabel: {
    fontSize: 12,
    color: 'rgba(146, 64, 14, 0.7)',
    fontFamily: fonts.nunito,
  },
  birthDetailValue: {
    fontSize: 16,
    color: '#92400E',
    fontFamily: fonts.nunitoBold,
    marginTop: 2,
  },
  
  // Photo Card Styles - clean white design
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
  
  // Journal Card Styles - rose-colored design
  journalCard: {
    marginTop: 12,
    backgroundColor: 'rgba(251, 113, 133, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(251, 113, 133, 0.2)',
    padding: 16,
  },
  journalTitle: {
    fontSize: 24,
    color: '#BE123C',
    fontFamily: fonts.caveat,
    marginBottom: 4,
  },
  journalContent: {
    fontSize: 15,
    color: 'rgba(190, 18, 60, 0.8)',
    fontFamily: fonts.nunito,
    lineHeight: 24,
  },
  
  // First Card Styles - violet design
  firstCard: {
    marginTop: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    padding: 16,
  },
  firstHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  firstIcon: {
    marginTop: 4,
  },
  firstContent: {
    flex: 1,
  },
  firstTitle: {
    fontSize: 20,
    color: '#1F2937',
    fontFamily: fonts.playfairBold,
    marginBottom: 4,
  },
  firstDescription: {
    fontSize: 15,
    color: '#4B5563',
    fontFamily: fonts.nunito,
    lineHeight: 22,
    marginTop: 4,
  },
  
  // Growth Card Styles - orange design
  growthCard: {
    marginTop: 12,
    backgroundColor: 'rgba(251, 146, 60, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(251, 146, 60, 0.2)',
    padding: 16,
  },
  growthHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  growthIcon: {
    marginTop: 4,
  },
  growthContent: {
    flex: 1,
  },
  growthTitle: {
    fontSize: 20,
    color: '#1F2937',
    fontFamily: fonts.playfairBold,
    marginBottom: 12,
  },
  growthStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  growthStatItem: {
    alignItems: 'center',
  },
  growthStatLabel: {
    fontSize: 12,
    color: 'rgba(234, 88, 12, 0.7)',
    fontFamily: fonts.nunito,
  },
  growthStatValue: {
    fontSize: 24,
    color: '#EA580C',
    fontFamily: fonts.playfair,
    marginTop: 2,
  },
  growthDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#FED7AA',
  },
  
  // Milestone Card Styles - matching old design
  milestoneCard: {
    marginTop: 12,
  },
  milestoneCardWithPhoto: {
    marginTop: 12,
  },
  milestoneCardSpecial: {
    marginTop: 12,
    backgroundColor: 'rgba(20, 184, 166, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
  },
  milestoneContentNoPhoto: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    alignItems: 'flex-start',
  },
  milestoneTextContentNoPhoto: {
    flex: 1,
  },
  milestoneLabel: {
    fontSize: 10,
    color: '#059669',
    fontFamily: fonts.nunitoBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  milestoneTitle: {
    fontSize: 18,
    color: '#065F46',
    fontFamily: fonts.playfairBold,
    marginBottom: 6,
  },
  milestoneNotes: {
    fontSize: 14,
    color: '#047857',
    fontFamily: fonts.nunito,
    lineHeight: 20,
  },
  milestoneIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    resizeMode: 'cover',
    marginTop: 4,
  },
  milestoneIconPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneContentTop: {
    padding: 16,
  },
  milestoneDescription: {
    fontSize: 15,
    color: '#4B5563',
    fontFamily: fonts.nunito,
    lineHeight: 22,
  },
  milestonePhoto: {
    width: '100%',
    height: 200,
    marginTop: 8,
  },
  milestonePhotoFull: {
    width: '100%',
    height: 200,
  },
  // First Word Special Card
  firstWordCard: {
    marginTop: 12,
    backgroundColor: '#FEF3C7',
    borderWidth: 0,
    overflow: 'hidden',
  },
  firstWordContent: {
    padding: 20,
  },
  firstWordHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  firstWordLabel: {
    fontSize: 11,
    color: '#B45309',
    fontFamily: fonts.nunitoBold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  firstWordTitle: {
    fontSize: 28,
    color: '#92400E',
    fontFamily: fonts.playfairBold,
  },
  firstWordWordSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  firstWordIntro: {
    fontSize: 14,
    color: '#B45309',
    fontFamily: fonts.nunito,
    marginBottom: 8,
  },
  firstWordBubble: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  firstWordTheWord: {
    fontSize: 36,
    color: '#92400E',
    fontFamily: fonts.caveat,
    letterSpacing: 1,
  },
  firstWordStory: {
    fontSize: 16,
    color: '#78350F',
    fontFamily: fonts.nunito,
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  firstWordPhoto: {
    width: '100%',
    height: 240,
    marginTop: -20,
  },
  firstWordBox: {
    marginTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  firstWordText: {
    fontSize: 32,
    color: '#14B8A6',
    fontFamily: fonts.caveat,
    letterSpacing: 0.5,
  },
});