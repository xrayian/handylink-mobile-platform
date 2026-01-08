import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const AboutScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-3 flex-row items-center gap-4 border-b border-gray-100 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
            <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">About Us</Text>
      </View>

      <ScrollView className="flex-1 px-6 py-8">
        <View className="items-center mb-10">
            <View className="w-24 h-24 bg-black rounded-3xl items-center justify-center mb-6 shadow-xl shadow-blue-200 rotation-3">
                <Feather name="tool" size={40} color="white" />
            </View>
            <Text className="text-3xl font-pj font-extrabold text-gray-900 mb-2">HandyLink.</Text>
            <Text className="text-gray-500 font-medium tracking-wide">VERSION 1.0.0</Text>
        </View>

        <View className="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-100">
            <Text className="text-gray-800 text-lg leading-relaxed text-center font-medium">
                This is a mobile application development course work project for United International University fall 2025.
            </Text>
        </View>

        <View className="mb-8">
            <Text className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6 text-center">Development Team</Text>
            
            <View className="bg-white border border-gray-200 p-4 rounded-xl mb-4 flex-row items-center gap-4 shadow-sm">
                <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
                    <Text className="text-blue-700 font-bold text-lg">R</Text>
                </View>
                <View>
                    <Text className="font-bold text-lg text-gray-900">Rayian Bin Shiraz Mahi</Text>
                    <Text className="text-gray-500 text-sm">Backend and Integration</Text>
                </View>
            </View>

            <View className="bg-white border border-gray-200 p-4 rounded-xl flex-row items-center gap-4 shadow-sm">
                 <View className="w-12 h-12 bg-orange-100 rounded-full items-center justify-center">
                    <Text className="text-orange-700 font-bold text-lg">P</Text>
                </View>
                <View>
                    <Text className="font-bold text-lg text-gray-900">Provat Kundu Shawon</Text>
                    <Text className="text-gray-500 text-sm">UI/UX and Frontend Development</Text>
                </View>
            </View>
        </View>

        <View className="items-center mt-4">
             <Text className="text-gray-400 text-xs">© 2026 UIU. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutScreen;
