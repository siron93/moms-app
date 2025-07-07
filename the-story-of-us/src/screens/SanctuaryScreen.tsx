import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';

export const SanctuaryScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-warm-gray-50">
      <ScrollView className="flex-1">
        <View className="p-5">
          <Text className="text-3xl font-bold text-gray-800">Your Sanctuary</Text>
          <Text className="text-gray-600 mt-2">A quiet moment for you</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};