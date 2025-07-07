import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Doc } from '../../../convex/_generated/dataModel';
import { fonts } from '../../hooks/useFonts';
import { FirstIcon } from './shared/icons';

interface FirstCardProps {
  memory: Doc<"memories">;
}

export const FirstCard: React.FC<FirstCardProps> = ({ memory }) => {
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
  
  return (
    <View style={[styles.cardContainer, styles.firstCard]}>
      <View style={styles.firstHeader}>
        <View style={styles.firstIcon}>
          <FirstIcon />
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
});