import React from 'react';
import { View, TouchableOpacity, Text, Platform, Dimensions, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts } from '../hooks/useFonts';

const { width } = Dimensions.get('window');

// Icons as components
const TimelineIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 20 20" fill={color}>
    <Path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
    <Path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
  </Svg>
);

const MilestonesIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
    <Path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </Svg>
);

const ToolsIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
    <Path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </Svg>
);

const SanctuaryIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
    <Path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </Svg>
);

const PlusIcon = () => (
  <Svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
    <Path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </Svg>
);

interface CustomTabBarProps extends BottomTabBarProps {
  onPlusPress: () => void;
}

export const CustomTabBar: React.FC<CustomTabBarProps> = ({ 
  state, 
  descriptors, 
  navigation,
  onPlusPress 
}) => {
  const insets = useSafeAreaInsets();
  
  const icons: { [key: string]: (props: { color: string }) => JSX.Element } = {
    Timeline: TimelineIcon,
    Milestones: MilestonesIcon,
    Tools: ToolsIcon,
    Sanctuary: SanctuaryIcon,
  };

  return (
    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
      <View
        style={{
          backgroundColor: '#FFFFFF',
          paddingBottom: insets.bottom,
          paddingTop: 6,
          borderTopWidth: 1,
          borderTopColor: 'rgba(0,0,0,0.1)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 10,
        }}
      >
        <View style={styles.tabContainer}>
          {/* Left side tabs */}
          <View style={styles.sideTabsContainer}>
            {state.routes.slice(0, 2).map((route, index) => {
              const { options } = descriptors[route.key];
              const label = options.title ?? route.name;
              const isFocused = state.index === index;
              
              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              const Icon = icons[label];

              return (
                <TouchableOpacity
                  key={route.key}
                  onPress={onPress}
                  style={styles.tabButton}
                >
                  <Icon color={isFocused ? '#D97706' : '#9CA3AF'} />
                  <Text style={[
                    styles.tabLabel,
                    isFocused ? styles.tabLabelActive : styles.tabLabelInactive
                  ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Center Plus Button */}
          <View style={styles.fabContainer}>
            <TouchableOpacity
              onPress={onPlusPress}
              style={styles.fab}
              activeOpacity={0.8}
            >
              <PlusIcon />
            </TouchableOpacity>
          </View>

          {/* Right side tabs */}
          <View style={styles.sideTabsContainer}>
            {state.routes.slice(2).map((route, index) => {
              const { options } = descriptors[route.key];
              const label = options.title ?? route.name;
              const actualIndex = index + 2;
              const isFocused = state.index === actualIndex;
              
              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              const Icon = icons[label];

              return (
                <TouchableOpacity
                  key={route.key}
                  onPress={onPress}
                  style={styles.tabButton}
                >
                  <Icon color={isFocused ? '#D97706' : '#9CA3AF'} />
                  <Text style={[
                    styles.tabLabel,
                    isFocused ? styles.tabLabelActive : styles.tabLabelInactive
                  ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 60,
  },
  sideTabsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 2,
    fontFamily: fonts.nunito,
  },
  tabLabelActive: {
    color: '#D97706',
    fontFamily: fonts.nunitoBold,
  },
  tabLabelInactive: {
    color: '#9CA3AF',
    fontFamily: fonts.nunito,
  },
  fabContainer: {
    width: 80,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    top: -28,
    backgroundColor: '#F59E0B',
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    // Gradient effect (visual approximation)
    borderWidth: 0.5,
    borderColor: 'rgba(251, 146, 60, 0.3)',
  },
});