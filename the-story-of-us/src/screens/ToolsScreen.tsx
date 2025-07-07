import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';

export const ToolsScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-warm-gray-50">
      <ScrollView className="flex-1">
        <View className="p-5">
          <Text className="text-3xl font-bold text-gray-800">Your Daily Rhythm</Text>
          <Text className="text-gray-600 mt-2">Track feeding, sleep, and more</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};