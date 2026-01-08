import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const AdminCustomersScreen = () => {
    const [loading, setLoading] = useState(true);
    const [customers, setCustomers] = useState([]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/users');
            setCustomers(response.data.customers || []);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to fetch customers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleDeleteCustomer = (userId) => {
        Alert.alert(
            'Delete Account',
            'This action cannot be undone. Are you sure you want to proceed?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive', 
                    onPress: async () => {
                        try {
                            await api.post('/admin/users/action', {
                                user_id: userId,
                                action: 'delete'
                            });
                             Alert.alert("Success", "Customer account deleted");
                             fetchCustomers();
                        } catch (error) {
                             console.error(error);
                             Alert.alert("Error", "Failed to delete customer");
                        }
                    } 
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View className="bg-white p-4 border-b border-gray-100 mb-2">
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3 flex-1">
                    <View className="h-10 w-10 rounded-full bg-blue-100 items-center justify-center">
                        <Text className="text-blue-600 font-bold">{item.full_name?.charAt(0) || 'C'}</Text>
                    </View>
                    <View className="flex-1">
                         <Text className="font-bold text-gray-900 text-base">{item.full_name}</Text>
                         <Text className="text-gray-500 text-xs">{item.email}</Text>
                    </View>
                </View>
                <View className="items-end">
                     <Text className="font-bold text-gray-900">৳{parseFloat(item.total_spend || 0).toFixed(0)}</Text>
                     <Text className="text-xs text-gray-400">Total Spent</Text>
                </View>
            </View>

            <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-50">
                 <Text className="text-xs text-gray-400">Joined: {new Date(item.created_at).toLocaleDateString()}</Text>
                 <TouchableOpacity 
                    onPress={() => handleDeleteCustomer(item.id)}
                    className="bg-red-50 px-3 py-1.5 rounded border border-red-100"
                 >
                     <Text className="text-red-600 font-bold text-xs">Delete Account</Text>
                 </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="blue" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <View className="px-4 py-4 border-b border-gray-100 bg-gray-50 flex-row justify-between items-center">
                <Text className="text-xl font-bold text-gray-900">Customers</Text>
                <View className="bg-blue-100 px-3 py-1 rounded-full">
                    <Text className="text-blue-700 font-bold text-xs">{customers.length} Total</Text>
                </View>
            </View>
            <FlatList
                data={customers}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={
                    <View className="p-8 items-center">
                        <Text className="text-gray-500">No customers found</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

export default AdminCustomersScreen;
