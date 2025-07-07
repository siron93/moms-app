# Quick Start Guide

## Running with Expo Go (Recommended for Testing)

1. **Install Expo Go**
   - iOS: Download from App Store
   - Android: Download from Google Play Store

2. **Start the project**
   ```bash
   npx expo start --go
   ```
   
   Or if already running, press `s` to switch to Expo Go

3. **Open the app**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Or scan QR code with Expo Go app on your phone

## Alternative: Clear Expo Cache

If you're still having issues:
```bash
npx expo start --clear
```

## Development Build (Later)

When we need native features like camera:
```bash
npx eas build --profile development --platform ios
```

But for now, Expo Go is sufficient for testing the basic functionality.