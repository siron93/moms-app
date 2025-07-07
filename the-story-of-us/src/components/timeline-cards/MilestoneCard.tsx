import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Doc } from '../../../convex/_generated/dataModel';
import { fonts } from '../../hooks/useFonts';
import { OptimizedImage } from '../OptimizedImage';
import { MILESTONE_IMAGES } from '../../utils/milestoneImages';

interface MilestoneCardProps {
  memory: Doc<"memories">;
  milestone: Doc<"milestones">;
  milestoneEntry?: Doc<"milestoneEntries">;
  onPress?: () => void;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({ 
  memory, 
  milestone, 
  milestoneEntry, 
  onPress 
}) => {
  const hasPhoto = milestoneEntry?.photoUrl || milestoneEntry?.photoLocalPath;
  
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
  milestoneCard: {
    marginTop: 12,
  },
  milestoneCardWithPhoto: {
    marginTop: 12,
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
  milestonePhotoFull: {
    width: '100%',
    height: 200,
  },
});