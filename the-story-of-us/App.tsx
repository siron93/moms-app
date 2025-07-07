import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, Text } from 'react-native';
import * as Font from 'expo-font';
import { AppProviders } from './src/providers/AppProviders';
import { AppNavigator } from './src/navigation/AppNavigator';
import { getOrCreateAnonymousId } from './src/utils/anonymousId';

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        // Initialize anonymous ID
        getOrCreateAnonymousId().then(id => {
          console.log('Anonymous ID initialized:', id);
        });

        // Load fonts
        await Font.loadAsync({
          // Nunito Sans
          'NunitoSans-Light': require('./assets/fonts/NunitoSans-Light.ttf'),
          'NunitoSans-Regular': require('./assets/fonts/NunitoSans-Regular.ttf'),
          'NunitoSans-Bold': require('./assets/fonts/NunitoSans-Bold.ttf'),
          
          // Playfair Display
          'PlayfairDisplay-Regular': require('./assets/fonts/PlayfairDisplay-Regular.ttf'),
          'PlayfairDisplay-Bold': require('./assets/fonts/PlayfairDisplay-Bold.ttf'),
          'PlayfairDisplay-Black': require('./assets/fonts/PlayfairDisplay-Black.ttf'),
          
          // Caveat
          'Caveat-Medium': require('./assets/fonts/Caveat-Medium.ttf'),
        });

        setFontsLoaded(true);
      } catch (e) {
        console.warn('Error loading fonts:', e);
        // Even if fonts fail, let the app load
        setFontsLoaded(true);
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FDFBF8' }}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={{ marginTop: 10, color: '#92400E' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppProviders>
        <AppNavigator />
        <StatusBar style="dark" />
      </AppProviders>
    </SafeAreaProvider>
  );
}