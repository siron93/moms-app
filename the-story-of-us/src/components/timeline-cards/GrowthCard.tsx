import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Doc } from '../../../convex/_generated/dataModel';
import { fonts } from '../../hooks/useFonts';
import { GrowthIcon } from './shared/icons';

interface GrowthCardProps {
  memory: Doc<"memories">;
  growthData?: Doc<"growthLogs">;
}

export const GrowthCard: React.FC<GrowthCardProps> = ({ memory, growthData }) => {
  if (!growthData) {
    return (
      <View style={[styles.cardContainer, styles.growthCard]}>
        <View style={styles.growthHeader}>
          <View style={styles.growthIcon}>
            <GrowthIcon />
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
          <GrowthIcon />
        </View>
        <View style={styles.growthContent}>
          <Text style={styles.growthTitle}>Growth Update</Text>
          <View style={styles.growthStats}>
            {growthData.weight && (
              <View style={styles.growthStatItem}>
                <Text style={styles.growthStatLabel}>Weight</Text>
                <Text style={styles.growthStatValue}>{growthData.weight} {growthData.weightUnit === 'lb' ? 'lbs' : growthData.weightUnit || 'lbs'}</Text>
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
});