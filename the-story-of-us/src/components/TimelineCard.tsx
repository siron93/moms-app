import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Doc } from '../../convex/_generated/dataModel';
import { formatRelativeDate } from '../utils/babyAge';
import {
  DateBadge,
  BirthAnnouncementCard,
  PhotoCard,
  JournalCard,
  FirstCard,
  GrowthCard,
  MilestoneCard,
  FirstWordCard,
  EnhancedPhotoCard
} from './timeline-cards';

interface TimelineCardProps {
  memory: Doc<"memories">;
  baby: Doc<"babies">;
  growthData?: Doc<"growthLogs">;
  milestone?: Doc<"milestones">;
  milestoneEntry?: Doc<"milestoneEntries">;
  onMilestonePress?: (milestone: Doc<"milestones">, milestoneEntry?: Doc<"milestoneEntries">) => void;
}

export const TimelineCard: React.FC<TimelineCardProps> = ({ 
  memory, 
  baby, 
  growthData,
  milestone,
  milestoneEntry,
  onMilestonePress 
}) => {
  const relativeDate = formatRelativeDate(memory.date);
  
  // Debug log
  console.log('TimelineCard rendering:', {
    type: memory.type,
    title: memory.title,
    hasTags: !!memory.tags,
    tags: memory.tags,
  });
  
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
        <EnhancedPhotoCard memory={memory} />
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
        milestone.name === 'First Word' && milestoneEntry?.metadata?.word ? (
          <FirstWordCard 
            memory={memory}
            milestone={milestone} 
            milestoneEntry={milestoneEntry}
            onPress={() => onMilestonePress?.(milestone, milestoneEntry)}
          />
        ) : (
          <MilestoneCard 
            memory={memory}
            milestone={milestone} 
            milestoneEntry={milestoneEntry}
            onPress={() => onMilestonePress?.(milestone, milestoneEntry)}
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  memoryContainer: {
    marginBottom: 32,
  },
});