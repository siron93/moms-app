import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ANONYMOUS_ID_KEY = 'anonymous_user_id';

// Generate a unique anonymous ID
export const generateAnonymousId = (): string => {
  // Generate a UUID-like string
  return 'anon_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// Get or create anonymous ID
export const getOrCreateAnonymousId = async (): Promise<string> => {
  try {
    // Try to get existing ID
    let anonymousId = await getAnonymousId();
    
    if (!anonymousId) {
      // Generate new ID
      anonymousId = generateAnonymousId();
      await setAnonymousId(anonymousId);
    }
    
    return anonymousId;
  } catch (error) {
    console.error('Error managing anonymous ID:', error);
    // Return a temporary ID if storage fails
    return generateAnonymousId();
  }
};

// Get anonymous ID from storage
export const getAnonymousId = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      // Use AsyncStorage for web
      return await AsyncStorage.getItem(ANONYMOUS_ID_KEY);
    } else {
      // Use SecureStore for mobile
      return await SecureStore.getItemAsync(ANONYMOUS_ID_KEY);
    }
  } catch (error) {
    console.error('Error getting anonymous ID:', error);
    return null;
  }
};

// Set anonymous ID in storage
export const setAnonymousId = async (id: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(ANONYMOUS_ID_KEY, id);
    } else {
      await SecureStore.setItemAsync(ANONYMOUS_ID_KEY, id);
    }
  } catch (error) {
    console.error('Error setting anonymous ID:', error);
  }
};

// Clear anonymous ID (after migration)
export const clearAnonymousId = async (): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(ANONYMOUS_ID_KEY);
    } else {
      await SecureStore.deleteItemAsync(ANONYMOUS_ID_KEY);
    }
  } catch (error) {
    console.error('Error clearing anonymous ID:', error);
  }
};