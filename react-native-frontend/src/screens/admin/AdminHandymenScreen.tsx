import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import api from '../../services/api';

const AdminHandymenScreen = () => {
    const [loading, setLoading] = useState(true);
    const [handymen, setHandymen] = useState([]);

    const fetchHandymen = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/users');
            setHandymen(response.data.handymen || []);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to fetch handymen");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHandymen();
    }, []);

    const performUserAction = async (userId, action, actionName) => {
        const executeAction = async () => {
            try {
                await api.post('/admin/users/action', {
                    user_id: userId,
                    action: action
                });
                Alert.alert("Success", `User ${actionName} successfully`);
                fetchHandymen();
            } catch (error) {
                console.error(error);
                Alert.alert("Error", "Failed to update user status");
            }
        };

        if (action === 'delete') {
            Alert.alert(
                'Delete Account',
                'This action cannot be undone. Are you sure you want to proceed?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: executeAction }
                ]
            );
        } else {
            executeAction();
        }
    };

    const renderItem = ({ item }) => (
        <View className="bg-white p-4 border-b border-gray-100 mb-2">
            <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-3">
                    <View className="h-10 w-10 rounded-full bg-indigo-100 items-center justify-center">
                        <Text className="text-indigo-600 font-bold">{item.full_name?.charAt(0) || 'H'}</Text>
                    </View>
                    <View>
                        <Text className="font-bold text-gray-900 text-base">{item.full_name}</Text>
                        <Text className="text-gray-500 text-xs">{item.email}</Text>
                    </View>
                </View>
                <View className={`px-2 py-1 rounded-full ${
                    item.is_verified === 'approved' ? 'bg-green-100' : 
                    item.is_verified === 'rejected' ? 'bg-red-100' : 'bg-yellow-100'
                }`}>
                    <Text className={`text-xs font-bold uppercase ${
                        item.is_verified === 'approved' ? 'text-green-700' : 
                        item.is_verified === 'rejected' ? 'text-red-700' : 'text-yellow-700'
                    }`}>
                        {item.is_verified || 'Pending'}
                    </Text>
                </View>
            </View>

            {item.bio ? (
                <Text className="text-gray-600 text-sm mb-3 italic" numberOfLines={2}>
                    "{item.bio}"
                </Text>
            ) : null}

            <View className="flex-row items-center justify-between mt-2 pt-3 border-t border-gray-50">
                {item.document_url ? (
                    <TouchableOpacity 
                        onPress={() => Linking.openURL(item.document_url)}
                        className="flex-row items-center gap-1"
                    >
                        <Feather name="file-text" size={14} color="#2563EB" />
                        <Text className="text-blue-600 font-bold text-xs">View Docs</Text>
                    </TouchableOpacity>
                ) : (
                    <Text className="text-gray-300 text-xs italic">No Docs</Text>
                )}

                <View className="flex-row gap-2">
                    {item.is_verified === 'approved' && (
                        <TouchableOpacity 
                            onPress={() => performUserAction(item.id, 'disable_handyman', 'disabled')}
                            className="bg-gray-100 px-3 py-1.5 rounded"
                        >
                            <Text className="text-gray-700 font-bold text-xs">Disable</Text>
                        </TouchableOpacity>
                    )}
                    {item.is_verified === 'rejected' && (
                        <TouchableOpacity 
                            onPress={() => performUserAction(item.id, 'enable_handyman', 'enabled')}
                            className="bg-green-50 px-3 py-1.5 rounded border border-green-100"
                        >
                            <Text className="text-green-700 font-bold text-xs">Enable</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                        onPress={() => performUserAction(item.id, 'delete', 'deleted')}
                        className="bg-red-50 px-3 py-1.5 rounded border border-red-100"
                    >
                        <Text className="text-red-600 font-bold text-xs">Delete</Text>
                    </TouchableOpacity>
                </View>
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
                <Text className="text-xl font-bold text-gray-900">Handymen</Text>
                <View className="bg-indigo-100 px-3 py-1 rounded-full">
                    <Text className="text-indigo-700 font-bold text-xs">{handymen.length} Active</Text>
                </View>
            </View>
            <FlatList
                data={handymen}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={
                    <View className="p-8 items-center">
                        <Text className="text-gray-500">No handymen found</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

export default AdminHandymenScreen;
