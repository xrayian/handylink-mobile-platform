import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons'; // Assuming Expo

const RegisterChoiceScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-6 pt-4">
        {/* Header */}
        <View className="items-center mb-8">
            <Text className="text-2xl font-bold tracking-tighter mb-4">HandyLink.</Text>
            <Text className="text-3xl font-bold text-gray-900 text-center leading-tight">Join as a Client or Pro</Text>
            <Text className="mt-2 text-gray-500 text-center text-lg">Create an account to get started.</Text>
        </View>

        {/* Cards */}
        <View className="gap-6 pb-8">
            {/* Client Card */}
            <TouchableOpacity 
                className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100"
                onPress={() => navigation.navigate('RegisterCustomer')}
            >
                <View className="h-14 w-14 bg-black rounded-2xl items-center justify-center mb-6">
                    <Feather name="user" size={24} color="white" />
                </View>
                
                <Text className="text-2xl font-bold text-gray-900 mb-2">I'm a Client</Text>
                <Text className="text-gray-500 mb-6 text-base leading-relaxed">
                    Book trusted professionals for cleaning, plumbing, repairs and more.
                </Text>
                
                <View className="flex-row items-center">
                    <Text className="text-black font-bold text-lg mr-2">Continue as Client</Text>
                    <Feather name="arrow-right" size={20} color="black" />
                </View>
            </TouchableOpacity>

            {/* Handyman Card */}
            <TouchableOpacity 
                className="bg-black rounded-[32px] p-8 shadow-sm"
                onPress={() => navigation.navigate('RegisterHandyman')}
            >
                <View className="h-14 w-14 bg-gray-800 rounded-2xl items-center justify-center mb-6">
                    <Feather name="tool" size={24} color="white" />
                </View>
                
                <Text className="text-2xl font-bold text-white mb-2">I'm a Pro</Text>
                <Text className="text-gray-400 mb-6 text-base leading-relaxed">
                    Find new customers, manage your schedule, and grow your business.
                </Text>
                
                <View className="flex-row items-center">
                    <Text className="text-white font-bold text-lg mr-2">Continue as Pro</Text>
                    <Feather name="arrow-right" size={20} color="white" />
                </View>
            </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mb-8">
            <Text className="text-gray-500">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="text-black font-bold">Log in</Text>
            </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterChoiceScreen;
