import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/useAuthStore';

const DashboardScreen = () => {
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);

    return (
        <SafeAreaView className="flex-1 items-center justify-center bg-white px-6">
            <Text className="text-2xl font-bold mb-4">Dashboard</Text>
            <Text className="text-lg text-gray-700 mb-2">Welcome, {user?.name || "User"}</Text>
            <Text className="text-sm text-gray-500 mb-8">Role: {user?.role || "Guest"}</Text>
            
            <TouchableOpacity 
                className="bg-black py-3 px-8 rounded-xl"
                onPress={logout}
            >
                <Text className="text-white font-bold">Log out</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};
export default DashboardScreen;
