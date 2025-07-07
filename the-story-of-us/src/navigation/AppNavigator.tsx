import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TimelineScreen } from '../screens/TimelineScreen';
import { MilestonesScreen } from '../screens/MilestonesScreen';
import { ToolsScreen } from '../screens/ToolsScreen';
import { SanctuaryScreen } from '../screens/SanctuaryScreen';
import { CustomTabBar } from '../components/CustomTabBar';
import { AddMemoryModal } from '../components/AddMemoryModal';
import { AddPhotoScreen } from '../screens/AddPhotoScreen';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { getOrCreateAnonymousId } from '../utils/anonymousId';

const Tab = createBottomTabNavigator();

export const AppNavigator = () => {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isPhotoScreenVisible, setIsPhotoScreenVisible] = useState(false);
  const [anonymousId, setAnonymousId] = useState<string | null>(null);

  useEffect(() => {
    getOrCreateAnonymousId().then(setAnonymousId);
  }, []);

  // Get the first baby for the anonymous user
  const babies = useQuery(api.babies.getBabies, 
    anonymousId ? { anonymousId } : 'skip'
  );
  const currentBaby = babies?.[0];

  const handleMemoryOptionSelect = (option: string) => {
    setIsAddModalVisible(false);
    
    if (option === 'photo') {
      setIsPhotoScreenVisible(true);
    }
    // TODO: Handle other options (milestone, journal, first, growth)
  };

  const handlePhotoSave = (data: any) => {
    console.log('Photo data:', data);
    // Photo is already saved to Convex in AddPhotoScreen
    setIsPhotoScreenVisible(false);
  };

  return (
    <>
      <NavigationContainer>
        <Tab.Navigator
          tabBar={(props) => (
            <CustomTabBar 
              {...props} 
              onPlusPress={() => setIsAddModalVisible(true)} 
            />
          )}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Tab.Screen 
            name="Timeline" 
            component={TimelineScreen}
            options={{ title: 'Timeline' }}
          />
          <Tab.Screen 
            name="Milestones" 
            component={MilestonesScreen}
            options={{ title: 'Milestones' }}
          />
          <Tab.Screen 
            name="Tools" 
            component={ToolsScreen}
            options={{ title: 'Tools' }}
          />
          <Tab.Screen 
            name="Sanctuary" 
            component={SanctuaryScreen}
            options={{ title: 'Sanctuary' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
      
      <AddMemoryModal 
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSelectOption={handleMemoryOptionSelect}
      />

      {isPhotoScreenVisible && currentBaby && (
        <AddPhotoScreen
          onClose={() => setIsPhotoScreenVisible(false)}
          onSave={handlePhotoSave}
          babyId={currentBaby._id}
        />
      )}
    </>
  );
};