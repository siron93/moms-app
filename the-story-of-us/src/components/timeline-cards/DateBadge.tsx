import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { calculateAgeAtDate } from '../../utils/babyAge';
import { fonts } from '../../hooks/useFonts';

interface DateBadgeProps {
  date: number;
  birthDate: number;
  relativeDate: string;
  alignRight?: boolean;
  color?: 'amber' | 'rose' | 'green';
}

export const DateBadge: React.FC<DateBadgeProps> = ({ 
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

const styles = StyleSheet.create({
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
});