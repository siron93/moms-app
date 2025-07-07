#!/bin/bash

echo "🚀 Starting The Story of Us with Expo Go..."
echo ""
echo "📱 Scan the QR code with Expo Go app on your device"
echo ""

# Kill any existing process on port 8081
lsof -ti:8081 | xargs kill -9 2>/dev/null || true

# Start Expo
npx expo start