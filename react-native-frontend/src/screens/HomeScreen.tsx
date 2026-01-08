import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen = () => {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white" edges={['top', 'bottom']}>
      <Text className="text-xl font-bold">Home Screen</Text>
      <Text className="text-gray-500">Landing Page Content</Text>
    </SafeAreaView>
  );
};

export default HomeScreen;
