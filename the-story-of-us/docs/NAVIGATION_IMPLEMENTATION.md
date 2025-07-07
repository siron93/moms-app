# Navigation Implementation

## Overview
The app uses React Navigation with a custom bottom tab bar featuring a floating action button (FAB) for adding new memories.

## Structure

### Bottom Tabs
1. **Timeline** - Main feed of memories and moments
2. **Milestones** - Track developmental achievements
3. **Tools** - Daily trackers (feeding, sleep, diapers)
4. **Sanctuary** - Parent wellness features

### Floating Action Button
- Central button that opens the Add Memory modal
- Provides quick access to:
  - Photo/Video capture
  - Milestone logging
  - Journal entries
  - "First" moments
  - Growth tracking

## Components

### CustomTabBar
- Custom tab bar implementation with blur effect
- Floating action button positioned above the tab bar
- Icons match the design from HTML mockups
- Active state indicated by amber color

### AddMemoryModal
- Bottom sheet modal with smooth animations
- Lists all memory creation options
- Dismissible by tapping outside or cancel button

## Navigation Flow
```
App
├── AppProviders (Clerk + Convex)
│   └── AppNavigator
│       ├── Tab.Navigator (with CustomTabBar)
│       │   ├── TimelineScreen
│       │   ├── MilestonesScreen
│       │   ├── ToolsScreen
│       │   └── SanctuaryScreen
│       └── AddMemoryModal (overlay)
```

## Styling
- Uses NativeWind (Tailwind CSS for React Native)
- Consistent with design system:
  - Primary colors: Amber/Orange gradient
  - Background: Warm gray (#FDFBF8)
  - Typography: Playfair Display for headers, Nunito Sans for body

## Next Steps
1. Implement navigation to specific screens from Add Memory modal
2. Add screen transitions and animations
3. Implement deep linking for sharing memories
4. Add navigation state persistence