import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Doc } from '../../../convex/_generated/dataModel';
import { fonts } from '../../hooks/useFonts';
import { OptimizedImage } from '../OptimizedImage';
import { MILESTONE_IMAGES } from '../../utils/milestoneImages';

interface FirstWordCardProps {
  memory: Doc<"memories">;
  milestone: Doc<"milestones">;
  milestoneEntry?: Doc<"milestoneEntries">;
  onPress?: () => void;
}

export const FirstWordCard: React.FC<FirstWordCardProps> = ({ 
  memory, 
  milestone, 
  milestoneEntry, 
  onPress 
}) => {
  const hasPhoto = milestoneEntry?.photoUrl || milestoneEntry?.photoLocalPath;
  const word = milestoneEntry?.metadata?.word;
  
  return (
    <TouchableOpacity 
      style={[styles.cardContainer, styles.firstWordCard]}
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
            {word && (
              <View style={styles.firstWordBox}>
                <Text style={styles.firstWordText}>"{word}"</Text>
              </View>
            )}
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
  firstWordCard: {
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
  milestonePhotoFull: {
    width: '100%',
    height: 200,
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