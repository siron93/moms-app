import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Doc, Id } from '../../convex/_generated/dataModel';
import { fonts } from '../hooks/useFonts';
import Svg, { Path } from 'react-native-svg';
import { getOrCreateAnonymousId } from '../utils/anonymousId';
import { formatLocalDate } from '../utils/dateUtils';
import { MilestoneLogModal } from '../components/MilestoneLogModal';
import { MILESTONE_IMAGES } from '../utils/milestoneImages';

// Milestone descriptions
const MILESTONE_DESCRIPTIONS: Record<string, string> = {
  // 0-3 months
  'Lifts Head': 'Holds head up for a few moments.',
  'Pushes Up on Arms': 'Pushes chest up with straight arms.',
  'Brings Hands to Mouth': 'Discovers hands and brings to mouth.',
  'Grasps Finger': 'Wraps hand around your finger.',
  'First Smile': 'Smiles in response to your smile.',
  'Recognizes Caregiver': 'Shows recognition of familiar faces.',
  'Makes Cooing Sounds': 'Makes vowel sounds like "ooo".',
  
  // 4-7 months
  'Rolls Over': 'From tummy to back, or back to tummy.',
  'Sits With Support': 'Sits with help from you or pillows.',
  'Sits Without Support': 'Sits upright without help.',
  'Bears Weight on Legs': 'Supports weight when held standing.',
  'Reaches for Toys': 'Deliberately grabs for objects.',
  'Passes Object Between Hands': 'Transfers toys hand to hand.',
  'First Laugh': 'Laughs out loud with joy.',
  'Responds to Own Name': 'Turns when name is called.',
  'Makes Babbling Sounds': 'Makes sounds like "ba-ba", "da-da".',
  'Discovers Feet': 'Finds and plays with feet.',
  'Tries Solid Food': 'First tastes of solid foods.',
  'First Tooth': 'First tooth breaks through.',
  
  // 8-12 months
  'Crawls': 'Moves around on hands and knees.',
  'Pulls to a Stand': 'Uses furniture to pull up.',
  'First Steps': 'Takes first independent steps.',
  'Feeds Self Finger Foods': 'Picks up and eats small foods.',
  'Plays Peek-a-Boo': 'Enjoys hiding and revealing games.',
  'Claps Hands': 'Brings hands together to clap.',
  'Waves "Bye-Bye"': 'Waves hand to say goodbye.',
  'Imitates Sounds': 'Copies sounds and gestures.',
  'First Word': 'Says first meaningful word.',
  
  // 1-2 years
  'Walks Confidently': 'Walks steadily without support.',
  'Kicks a Ball': 'Kicks ball forward with control.',
  'Starts to Run': 'Begins running with coordination.',
  'Scribbles with a Crayon': 'Makes marks on paper.',
  'Stacks Several Blocks': 'Builds tower with blocks.',
  'Says Several Single Words': 'Has vocabulary of several words.',
  'Combines Two Words': 'Puts two words together.',
  'First Haircut': 'Big milestone haircut experience.',
  
  // 2-5 years
  'Jumps with Two Feet': 'Jumps off ground with both feet.',
  'Rides a Tricycle/Scooter': 'Pedals or scoots independently.',
  'Hops on One Foot': 'Balances and hops on one foot.',
  'Draws a Circle': 'Draws recognizable circle shape.',
  'Uses Scissors': 'Cuts with child-safe scissors.',
  'Gets Dressed by Self': 'Puts on clothes independently.',
  'Sings a Song': 'Sings familiar songs from memory.',
};

// Icons
const CheckIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20" fill="white">
    <Path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </Svg>
);

const ChevronIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
    <Path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </Svg>
);

interface MilestoneItemProps {
  milestone: Doc<"milestones">;
  entry?: Doc<"milestoneEntries">;
  onPress: () => void;
}

const MilestoneItem: React.FC<MilestoneItemProps> = ({ milestone, entry, onPress }) => {
  const isLogged = !!entry;
  const imageSource = MILESTONE_IMAGES[milestone.name];
  const description = MILESTONE_DESCRIPTIONS[milestone.name];
  
  return (
    <TouchableOpacity 
      style={[
        styles.milestoneItem,
        isLogged ? styles.milestoneItemLogged : styles.milestoneItemUnlogged
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {imageSource && (
        <Image 
          source={imageSource} 
          style={[styles.milestoneImage, isLogged && styles.milestoneImageLogged]}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.milestoneContent}>
        <Text style={[styles.milestoneTitle, isLogged && styles.milestoneTitleLogged]}>
          {milestone.name}
        </Text>
        {isLogged ? (
          <Text style={styles.milestoneDate}>
            Logged on {formatLocalDate(entry.achievedDate, { month: 'short', day: 'numeric' })}
          </Text>
        ) : (
          description && (
            <Text style={styles.milestoneDescription}>{description}</Text>
          )
        )}
      </View>
      
      {isLogged ? (
        <View style={styles.checkIcon}>
          <CheckIcon />
        </View>
      ) : (
        <ChevronIcon />
      )}
    </TouchableOpacity>
  );
};

export const MilestonesScreen = () => {
  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<Doc<"milestones"> | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  
  useEffect(() => {
    getOrCreateAnonymousId().then(setAnonymousId);
  }, []);
  
  // Fetch baby data
  const babies = useQuery(api.babies.getBabies, 
    anonymousId ? { anonymousId } : 'skip'
  );
  const baby = babies?.[0];
  
  // Fetch all milestones
  const milestones = useQuery(api.milestones.getMilestones);
  
  // Fetch milestone entries for this baby
  const milestoneEntries = useQuery(api.milestoneEntries.getMilestoneEntries,
    baby ? { babyId: baby._id } : 'skip'
  );
  
  // Group milestones with images by category
  const milestonesByCategory = React.useMemo(() => {
    if (!milestones) return {};
    
    console.log('Total milestones from DB:', milestones.length);
    console.log('Available milestone images:', Object.keys(MILESTONE_IMAGES).length);
    
    const grouped: Record<string, Doc<"milestones">[]> = {};
    let includedCount = 0;
    let excludedMilestones: string[] = [];
    
    milestones.forEach(milestone => {
      // Only include milestones that have images
      if (MILESTONE_IMAGES[milestone.name]) {
        if (!grouped[milestone.category]) {
          grouped[milestone.category] = [];
        }
        grouped[milestone.category].push(milestone);
        includedCount++;
      } else {
        excludedMilestones.push(milestone.name);
      }
    });
    
    console.log('Milestones included:', includedCount);
    console.log('Milestones excluded (no image):', excludedMilestones);
    
    // Sort each category by order
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => a.order - b.order);
    });
    
    console.log('Categories found:', Object.keys(grouped));
    Object.keys(grouped).forEach(cat => {
      console.log(`${cat}: ${grouped[cat].length} milestones`);
    });
    
    return grouped;
  }, [milestones]);
  
  // Create a map of milestone entries by milestoneId
  const entriesByMilestoneId = React.useMemo(() => {
    const map = new Map<Id<"milestones">, Doc<"milestoneEntries">>();
    milestoneEntries?.forEach(entry => {
      map.set(entry.milestoneId, entry);
    });
    return map;
  }, [milestoneEntries]);
  
  const handleMilestonePress = (milestone: Doc<"milestones">) => {
    setSelectedMilestone(milestone);
    setShowLogModal(true);
  };
  
  const handleModalClose = () => {
    setShowLogModal(false);
    setSelectedMilestone(null);
  };
  
  const handleModalSuccess = () => {
    // Modal will close itself
    // The queries will automatically refresh due to Convex reactivity
  };
  
  if (!anonymousId || !baby) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      </SafeAreaView>
    );
  }
  
  // Define category order
  const categoryOrder = ['0-3 months', '4-7 months', '8-12 months', '1-2 years', '2-5 years'];
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Milestone Journey</Text>
      </View>
      
      {/* Milestone List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {categoryOrder.map(category => {
          const categoryMilestones = milestonesByCategory[category];
          if (!categoryMilestones || categoryMilestones.length === 0) return null;
          
          return (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category}</Text>
              <View style={styles.categoryContent}>
                {categoryMilestones.map(milestone => (
                  <MilestoneItem
                    key={milestone._id}
                    milestone={milestone}
                    entry={entriesByMilestoneId.get(milestone._id)}
                    onPress={() => handleMilestonePress(milestone)}
                  />
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
      
      {/* Milestone Log Modal */}
      {selectedMilestone && baby && (
        <MilestoneLogModal
          visible={showLogModal}
          milestone={selectedMilestone}
          baby={baby}
          existingEntry={entriesByMilestoneId.get(selectedMilestone._id)}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  headerTitle: {
    fontSize: 30,
    fontFamily: fonts.playfairBold,
    color: '#1F2937',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
  },
  categorySection: {
    marginBottom: 32,
  },
  categoryTitle: {
    fontSize: 18,
    fontFamily: fonts.nunitoBold,
    color: 'rgba(146, 64, 14, 0.8)',
    marginBottom: 16,
  },
  categoryContent: {
    gap: 12,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  milestoneItemUnlogged: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  milestoneItemLogged: {
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  milestoneImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  milestoneImageLogged: {
    opacity: 0.75,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 16,
    fontFamily: fonts.nunitoBold,
    color: '#1F2937',
  },
  milestoneTitleLogged: {
    color: '#374151',
  },
  milestoneDescription: {
    fontSize: 14,
    fontFamily: fonts.nunito,
    color: '#6B7280',
    marginTop: 4,
  },
  milestoneDate: {
    fontSize: 14,
    fontFamily: fonts.nunito,
    color: '#6B7280',
    marginTop: 4,
  },
  checkIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
});