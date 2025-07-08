import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  SafeAreaView, 
  StyleSheet, 
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Button,
  AppState,
  AppStateStatus,
  Alert
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
import { useConvexPaginatedTimeline } from '../hooks/useConvexPaginatedTimeline';
import { useBaby } from '../contexts/BabyContext';
import { appEventEmitter, APP_EVENTS } from '../utils/eventEmitter';

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
  const { selectedBaby: baby, isLoading: isBabyLoading } = useBaby();
  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Doc<"milestones"> | null>(null);
  const [selectedMilestoneEntry, setSelectedMilestoneEntry] = useState<Doc<"milestoneEntries"> | undefined>(undefined);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  
  // Process background uploads while viewing timeline
  useBackgroundUpload();
  
  // Remove the automatic refresh - timestamps don't need constant updates
  // Users can pull to refresh if they want updated timestamps
  
  // Remove automatic refresh on app state change
  // This was causing unnecessary re-queries
  
  // Mutations
  const seedMilestones = useMutation(api.seed.seedMilestones);
  const seedTestData = useMutation(api.seedData.seedTestData);
  const updateLeoBirthData = useMutation(api.updateLeo.updateLeoBirthData);

  // Get anonymous ID
  useEffect(() => {
    getOrCreateAnonymousId().then(setAnonymousId);
  }, []);

  // Convex handles reactivity automatically, so we don't need manual refresh events

  // Baby is now provided by context - no need to query here

  // Use Convex paginated timeline with built-in reactivity
  const {
    items: memories,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    refresh,
    loadMore,
    isOffline,
  } = useConvexPaginatedTimeline(baby?._id);

  // Only fetch milestones reference data (names, descriptions, etc.)
  // The actual entries are already included in the timeline items
  const milestones = useQuery(api.milestones.getMilestones) || [];
  
  // Create map for milestone reference data
  const milestonesById = React.useMemo(() => {
    const map = new Map<string, Doc<"milestones">>();
    milestones.forEach(m => map.set(m._id, m));
    return map;
  }, [milestones]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

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
    // Convex will automatically update the timeline through reactivity
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

  if (!anonymousId || isBabyLoading) {
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
          {/* Temporary button to update Leo's birth data */}
          {baby._id === "j578dbm8adbvjsn952jzwmbp197k8b51" && !baby.birthWeight && (
            <TouchableOpacity 
              onPress={async () => {
                try {
                  await updateLeoBirthData();
                  Alert.alert('Success', 'Updated Leo\'s birth data');
                } catch (error) {
                  Alert.alert('Error', 'Failed to update birth data');
                }
              }}
              style={{ marginTop: 8, backgroundColor: '#F59E0B', padding: 8, borderRadius: 8 }}
            >
              <Text style={{ color: 'white', fontSize: 12 }}>Add Birth Data</Text>
            </TouchableOpacity>
          )}
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

      {/* Offline indicator */}
      {isOffline && (
        <View style={styles.offlineIndicator}>
          <Text style={styles.offlineText}>Offline Mode</Text>
        </View>
      )}

      {/* Timeline */}
      <FlatList
        data={memories}
        keyExtractor={(item) => item._id}
        renderItem={({ item: memory }) => {
          // Growth data is now embedded in the timeline item
          const growthData = memory.type === 'growth' ? {
            _id: (memory as any).growthLogId,
            weight: (memory as any).weight,
            weightUnit: (memory as any).weightUnit,
            height: (memory as any).height,
            heightUnit: (memory as any).heightUnit,
            headCircumference: (memory as any).headCircumference,
            headCircumferenceUnit: (memory as any).headCircumferenceUnit,
            notes: memory.content,
            date: memory.date,
          } : undefined;
          
          // Find milestone reference data
          const milestone = memory.type === 'milestone' && memory.milestoneId ? 
            milestonesById.get(memory.milestoneId) : undefined;
          
          // Milestone entry data is already embedded in the timeline item
          const milestoneEntry = memory.type === 'milestone' ? {
            _id: memory._id,
            milestoneId: memory.milestoneId!,
            achievedDate: memory.date,
            notes: memory.content,
            photoUrl: memory.mediaUrl,
            metadata: undefined, // This would need to be included in timeline query if needed
          } : undefined;
          
          return (
            <TimelineCard
              key={memory._id}
              memory={memory}
              baby={baby}
              growthData={growthData as any}
              milestone={milestone}
              milestoneEntry={milestoneEntry as any}
              onMilestonePress={handleMilestonePress}
            />
          );
        }}
        contentContainerStyle={[
          styles.timelineContent,
          memories.length === 0 && styles.emptyTimelineContent
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#F59E0B"
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => {
          if (isLoadingMore) {
            return (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color="#F59E0B" />
              </View>
            );
          }
          if (!hasMore && memories.length > 0) {
            return (
              <View style={styles.endOfList}>
                <Text style={styles.endOfListText}>You've reached the beginning</Text>
              </View>
            );
          }
          return null;
        }}
        ListEmptyComponent={() => {
          if (isLoading) {
            return (
              <View style={styles.emptyTimelineContainer}>
                <ActivityIndicator size="large" color="#F59E0B" />
              </View>
            );
          }
          return (
            <View style={styles.emptyTimelineContainer}>
              <Text style={styles.emptyTimelineText}>No memories yet</Text>
              <Text style={styles.emptyTimelineSubtext}>Tap the + button to add your first memory</Text>
            </View>
          );
        }}
      />

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
  emptyTimelineContent: {
    flex: 1,
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
  offlineIndicator: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  offlineText: {
    fontSize: 14,
    color: '#92400E',
    fontFamily: fonts.nunito,
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  endOfList: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  endOfListText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: fonts.nunito,
  },
});