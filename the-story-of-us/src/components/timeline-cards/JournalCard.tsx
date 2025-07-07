import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Doc } from '../../../convex/_generated/dataModel';
import { fonts } from '../../hooks/useFonts';

interface JournalCardProps {
  memory: Doc<"memories">;
}

export const JournalCard: React.FC<JournalCardProps> = ({ memory }) => (
  <View style={[styles.cardContainer, styles.journalCard]}>
    <Text style={styles.journalTitle}>
      {memory.title || "A note from my heart..."}
    </Text>
    <Text style={styles.journalContent}>
      {memory.content}
    </Text>
  </View>
);

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
});