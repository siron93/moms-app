#!/bin/bash

echo "🔨 Building development version of The Story of Us..."
echo ""

# Check if running on iOS or prompt for platform
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📱 Detected macOS - building for iOS..."
    npx expo run:ios
else
    echo "Please specify platform:"
    echo "1) iOS"
    echo "2) Android"
    read -p "Select platform (1 or 2): " choice
    
    case $choice in
        1)
            echo "📱 Building for iOS..."
            npx expo run:ios
            ;;
        2)
            echo "🤖 Building for Android..."
            npx expo run:android
            ;;
        *)
            echo "❌ Invalid choice"
            exit 1
            ;;
    esac
fi