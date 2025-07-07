import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Doc } from '../../../convex/_generated/dataModel';
import { fonts } from '../../hooks/useFonts';

interface BirthAnnouncementCardProps {
  memory: Doc<"memories">;
  baby: Doc<"babies">;
}

export const BirthAnnouncementCard: React.FC<BirthAnnouncementCardProps> = ({ memory, baby }) => {
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
});