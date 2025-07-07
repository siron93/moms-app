import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  SafeAreaView, 
  StyleSheet, 
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Button,
  AppState,
  AppStateStatus
} from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Doc } from '../../convex/_generated/dataModel';
import { TimelineCard } from '../components/TimelineCard';
import { getOrCreateAnonymousId } from '../utils/anonymousId';
import { fonts } from '../hooks/useFonts';
import Svg, { Path } from 'react-native-svg';
import { useBackgroundUpload } from '../hooks/useBackgroundUpload';
import { useFocusEffect } from '@react-navigation/native';
import { MilestoneLogModal } from '../components/MilestoneLogModal';

// Icons
const SearchIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
    <Path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </Svg>
);

const FilterIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5">
    <Path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.572a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
  </Svg>
);

const ProfileIcon = () => (
  <Svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(146, 64, 14, 0.7)" strokeWidth="1.5">
    <Path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </Svg>
);

export const TimelineScreen = () => {
  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedMilestone, setSelectedMilestone] = useState<Doc<"milestones"> | null>(null);
  const [selectedMilestoneEntry, setSelectedMilestoneEntry] = useState<Doc<"milestoneEntries"> | undefined>(undefined);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  
  // Process background uploads while viewing timeline
  useBackgroundUpload();
  
  // Force re-render to update timestamps when screen gains focus
  useFocusEffect(
    useCallback(() => {
      // Force a re-render to update relative timestamps
      setRefreshKey(prev => prev + 1);
      
      // Set up interval to refresh timestamps every minute
      const interval = setInterval(() => {
        setRefreshKey(prev => prev + 1);
      }, 60000); // 60 seconds
      
      // Cleanup interval when screen loses focus
      return () => clearInterval(interval);
    }, [])
  );
  
  // Also refresh when app comes to foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        setRefreshKey(prev => prev + 1);
      }
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);
  
  // Mutations
  const seedMilestones = useMutation(api.seed.seedMilestones);
  const seedTestData = useMutation(api.seedData.seedTestData);

  // Get anonymous ID
  useEffect(() => {
    getOrCreateAnonymousId().then(setAnonymousId);
  }, []);

  // Fetch babies
  const babies = useQuery(api.babies.getBabies, 
    anonymousId ? { anonymousId } : 'skip'
  );

  // Debug logging
  console.log('Anonymous ID:', anonymousId);
  console.log('Babies query result:', babies);

  // Get the first baby (for now)
  const baby = babies?.[0];

  // Fetch unified timeline data
  const timelineData = useQuery(api.timeline.getTimelineForBaby,
    baby ? { babyId: baby._id } : 'skip'
  );

  const memories = timelineData?.memories || [];
  const growthLogs = timelineData?.growthLogs || [];
  const milestones = timelineData?.milestones || [];
  const milestoneEntries = timelineData?.milestoneEntries || [];
  
  // Debug logging
  console.log('Timeline data:', {
    anonymousId: anonymousId,
    baby: baby,
    memoriesCount: memories.length,
    memoriesTypes: memories.map(m => ({ type: m.type, id: m._id })),
    growthLogsCount: growthLogs.length,
    milestonesCount: milestones.length,
    milestoneEntriesCount: milestoneEntries.length,
  });

  // Create a map of growth logs by ID for quick lookup
  const growthLogsById = React.useMemo(() => {
    const map = new Map<string, Doc<"growthLogs">>();
    growthLogs?.forEach(log => {
      map.set(log._id, log);
    });
    return map;
  }, [growthLogs]);
  
  // Create maps for milestone data
  const milestonesById = React.useMemo(() => {
    const map = new Map<string, Doc<"milestones">>();
    milestones.forEach(m => map.set(m._id, m));
    return map;
  }, [milestones]);
  
  const milestoneEntriesByMilestoneId = React.useMemo(() => {
    const map = new Map<string, Doc<"milestoneEntries">>();
    milestoneEntries.forEach(entry => map.set(entry.milestoneId, entry));
    return map;
  }, [milestoneEntries]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Convex will automatically refetch
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleMilestonePress = useCallback((milestone: Doc<"milestones">, milestoneEntry?: Doc<"milestoneEntries">) => {
    setSelectedMilestone(milestone);
    setSelectedMilestoneEntry(milestoneEntry);
    setShowMilestoneModal(true);
  }, []);

  const handleMilestoneModalClose = useCallback(() => {
    setShowMilestoneModal(false);
    setSelectedMilestone(null);
    setSelectedMilestoneEntry(undefined);
  }, []);

  const handleMilestoneModalSuccess = useCallback(() => {
    // The modal will close itself
    // Convex reactivity will update the timeline automatically
  }, []);

  const handleSeedData = async () => {
    if (isSeeding || !anonymousId) return;
    
    console.log('Starting seed data...');
    setIsSeeding(true);
    try {
      // First seed milestones
      console.log('Seeding milestones...');
      const milestonesResult = await seedMilestones({});
      console.log('Milestones result:', milestonesResult);
      
      // Then seed test data
      console.log('Seeding test data with anonymousId:', anonymousId);
      const testDataResult = await seedTestData({ anonymousId });
      console.log('Test data result:', testDataResult);
      
      console.log('Seed data complete!');
    } catch (error) {
      console.error('Error seeding data:', error);
    } finally {
      setIsSeeding(false);
    }
  };

  if (!anonymousId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      </SafeAreaView>
    );
  }

  if (!baby) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Welcome to The Story of Us</Text>
          <Text style={styles.emptySubtitle}>Add your baby to start creating memories</Text>
          <View style={styles.seedButtonContainer}>
            <Button
              title={isSeeding ? "Creating test data..." : "Create Test Data"}
              onPress={handleSeedData}
              disabled={isSeeding}
              color="#F59E0B"
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>The Story of</Text>
          <Text style={styles.headerTitle}>{baby.name}</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <ProfileIcon />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <View style={styles.searchIcon}>
            <SearchIcon />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search memories..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.filterButton}>
            <FilterIcon />
          </TouchableOpacity>
        </View>
      </View>

      {/* Timeline */}
      <ScrollView 
        style={styles.timeline}
        contentContainerStyle={styles.timelineContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#F59E0B"
          />
        }
      >
        {memories.map((memory) => {
          // Find growth data for growth type memories
          const growthData = memory.type === 'growth' && (memory as any).growthLogId ? 
            growthLogsById.get((memory as any).growthLogId) : undefined;
          
          // Find milestone data for milestone type memories
          const milestone = memory.type === 'milestone' && memory.milestoneId ? 
            milestonesById.get(memory.milestoneId) : undefined;
          const milestoneEntry = memory.type === 'milestone' && memory.milestoneId ? 
            milestoneEntriesByMilestoneId.get(memory.milestoneId) : undefined;
          
          return (
            <TimelineCard
              key={`${memory._id}-${refreshKey}`}
              memory={memory}
              baby={baby}
              growthData={growthData}
              milestone={milestone}
              milestoneEntry={milestoneEntry}
              onMilestonePress={handleMilestonePress}
            />
          );
        })}
        
        {memories.length === 0 && (
          <View style={styles.emptyTimelineContainer}>
            <Text style={styles.emptyTimelineText}>No memories yet</Text>
            <Text style={styles.emptyTimelineSubtext}>Tap the + button to add your first memory</Text>
          </View>
        )}
      </ScrollView>

      {/* Milestone Edit Modal */}
      {selectedMilestone && baby && (
        <MilestoneLogModal
          visible={showMilestoneModal}
          milestone={selectedMilestone}
          baby={baby}
          existingEntry={selectedMilestoneEntry}
          onClose={handleMilestoneModalClose}
          onSuccess={handleMilestoneModalSuccess}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: fonts.playfairBold,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: fonts.nunito,
  },
  seedButtonContainer: {
    marginTop: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(146, 64, 14, 0.7)',
    fontFamily: fonts.nunito,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#92400E',
    letterSpacing: -0.5,
    fontFamily: fonts.playfairBold,
  },
  profileButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontFamily: fonts.nunito,
  },
  filterButton: {
    marginLeft: 8,
  },
  timeline: {
    flex: 1,
  },
  timelineContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100, // Space for tab bar and FAB
  },
  emptyTimelineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTimelineText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 8,
  },
  emptyTimelineSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});