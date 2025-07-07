# Setup and Testing Guide

## Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- iOS Simulator (for Mac) or Android Emulator
- Expo Go app on your phone (optional)

## Initial Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start Convex Dev Server**
   In a new terminal window:
   ```bash
   npx convex dev
   ```
   
   When prompted:
   - Choose "Use an existing project"
   - Paste the deployment URL: `https://glorious-manatee-479.convex.cloud`

3. **Start Expo**
   In another terminal window:
   ```bash
   npm start
   ```

## Testing the App

### Step 1: Launch the App
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Or scan the QR code with Expo Go app on your phone

### Step 2: Create Test Data
1. When the app loads, you'll see "Welcome to The Story of Us"
2. Click the "Create Test Data" button
3. This will:
   - Seed milestone definitions
   - Create a test baby named "Leo"
   - Add various memory types (birth announcement, photos, journal entries, etc.)

### Step 3: Explore the Timeline
After seeding, you should see:
- **Header**: "The Story of Leo"
- **Search bar**: For filtering memories (not functional yet)
- **Timeline entries**:
  - Birth announcement card
  - First laugh milestone
  - Growth update
  - Photo memories
  - Journal entries

### Features to Test

1. **Timeline Scrolling**
   - Scroll through memories
   - Pull to refresh
   - Date badges show relative time and baby's age

2. **Memory Cards**
   - Different card styles for each memory type
   - Birth announcement with special styling
   - Growth cards showing weight/height
   - Journal entries with italic font
   - Photo cards with images

3. **Navigation**
   - Bottom tab bar with 4 tabs
   - Floating action button (FAB) in center
   - Tap FAB to see "Add Memory" modal

## Current Status

### ✅ Implemented
- Basic project structure
- Convex database schema
- Anonymous user support
- Timeline screen with memory cards
- Navigation with custom tab bar
- Add memory modal (UI only)
- Test data seeding

### 🚧 To Be Implemented
- Actual memory creation flows
- Photo/video capture
- Milestone tracking screen
- Tools tab (feeding, sleep, diaper tracking)
- Sanctuary tab (meditation, journaling)
- User authentication with Clerk
- Data migration from anonymous to authenticated

## Troubleshooting

1. **"Cannot find module" errors**
   - Make sure all dependencies are installed: `npm install --legacy-peer-deps`

2. **Convex connection issues**
   - Ensure Convex dev server is running
   - Check that `.env.local` has correct URLs

3. **Styling issues**
   - NativeWind is not fully configured yet
   - Using regular React Native styles for now

4. **No data showing**
   - Click "Create Test Data" button
   - Check Convex dashboard for data
   - Pull to refresh the timeline

## Next Steps
1. Test the timeline thoroughly
2. Provide feedback on design/UX
3. Decide which feature to implement next
4. Consider authentication flow