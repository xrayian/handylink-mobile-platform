import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import api from '../../services/api';

const AdminOverviewScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ totalUsers: 0, activeGigs: 0, pendingVerifications: 0, revenue: 0 });
  const [verifications, setVerifications] = useState([]);
  const [gigs, setGigs] = useState([]);

  const fetchAdminData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      // Fetch Verifications
      const verificationsRes = await api.get('/admin/verifications');
      setVerifications(verificationsRes.data);

      const usersRes = await api.get('/admin/users'); // returns { handymen: [], customers: [] }
      const gigsRes = await api.get('/admin/gigs');
      setGigs(gigsRes.data || []);

      const handymenCount = usersRes.data.handymen?.length || 0;
      const customersCount = usersRes.data.customers?.length || 0;
      
      setStats({
          totalUsers: handymenCount + customersCount,
          activeGigs: gigsRes.data.length || 0,
          pendingVerifications: verificationsRes.data.length || 0,
          revenue: 0 // Placeholder
      });

    } catch (error) {
      console.log('Error fetching admin data:', error);
      // @ts-ignore
      Alert.alert('Error', 'Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAdminData(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerification = async (handymanId, status) => {
      try {
          await api.post('/admin/approve', { handyman_id: handymanId, action: status });
          Alert.alert("Success", `User ${status} successfully`);
          fetchAdminData();
      } catch (error) {
          console.error(error);
          Alert.alert("Error", "Failed to update verification status");
      }
  };

  const handleDeleteGig = (gigId) => {
    Alert.alert(
        "Delete Service",
        "This service will be permanently removed. Continue?",
        [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        // Assuming generic delete endpoint based on template api(`/gigs/${id}`, { method: 'DELETE' })
                        // Only admin might have rights, but endpoint is likely /gigs/:id
                        // Checking Postman, there is no explicit delete, but assuming REST standard or Admin privilege
                        await api.delete(`/gigs/${gigId}`); 
                        Alert.alert("Success", "Gig deleted");
                        fetchAdminData();
                    } catch (error) {
                        console.error(error);
                        Alert.alert("Error", "Failed to delete gig");
                    }
                }
            }
        ]
    );
  };

  if (loading) {
      return (
          <View className="flex-1 items-center justify-center bg-white">
              <ActivityIndicator size="large" color="blue" />
          </View>
      );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 bg-white" edges={['top', 'bottom']}>
      <ScrollView 
        className="flex-1 px-4 pt-4 pb-20" 
        showsVerticalScrollIndicator={false}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        
        {/* Header */}
        <View className="flex-row items-center justify-between mb-8 pb-4 border-b border-gray-100">
            <View>
                <Text className="text-3xl font-bold text-gray-900 tracking-tight">Admin Dashboard</Text>
                <Text className="text-gray-500 font-medium mt-1">Manage users & system</Text>
            </View>
            <View className="px-3 py-1 bg-blue-100 rounded-full">
                <Text className="text-blue-800 text-xs font-bold uppercase">Super Admin</Text>
            </View>
        </View>

        <View className="space-y-6">
            {/* Stats Grid */}
            <View className="flex-row gap-4 flex-wrap">
                <View className="flex-1 min-w-[45%] bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Total Users</Text>
                    <Text className="text-3xl font-bold text-gray-900">{stats.totalUsers}</Text>
                </View>
                <View className="flex-1 min-w-[45%] bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Pending</Text>
                    <Text className="text-3xl font-bold text-orange-500">{stats.pendingVerifications}</Text>
                </View>
                    <View className="flex-1 min-w-[45%] bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Active Gigs</Text>
                    <Text className="text-3xl font-bold text-green-600">{stats.activeGigs}</Text>
                </View>
                    <View className="flex-1 min-w-[45%] bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Revenue</Text>
                    <Text className="text-3xl font-bold text-blue-600">৳{stats.revenue}</Text>
                </View>
            </View>

            {/* Pending Verifications List */}
            <View className="bg-white mt-4 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <View className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex-row justify-between items-center">
                    <Text className="font-bold text-gray-800">Pending Approvals</Text>
                    {stats.pendingVerifications > 0 && (
                        <View className="bg-orange-100 px-2 py-0.5 rounded-full">
                            <Text className="text-xs font-bold text-orange-700">{stats.pendingVerifications} pending</Text>
                        </View>
                    )}
                </View>
                
                {verifications.length === 0 ? (
                    <View className="p-8 items-center justify-center">
                            <Feather name="check-circle" size={32} color="#D1D5DB" />
                            <Text className="text-gray-400 mt-2 font-medium">No pending verifications</Text>
                    </View>
                ) : (
                    verifications.map((v) => (
                        <View key={v.id} className="p-5 border-b border-gray-100">
                            <View className="flex-row items-center gap-4 mb-4">
                                    <View className="h-10 w-10 rounded-full bg-blue-100 items-center justify-center">
                                        <Text className="text-blue-700 font-bold">{v.full_name?.charAt(0)}</Text>
                                    </View>
                                    <View>
                                        <Text className="font-bold text-gray-900 text-base">{v.full_name}</Text>
                                        <Text className="text-sm text-gray-500">{v.email}</Text>
                                    </View>
                            </View>
                            
                            <View className="flex-row gap-2">
                                {v.document_url && (
                                        <TouchableOpacity 
                                        onPress={() => Linking.openURL(v.document_url)}
                                        className="bg-gray-100 px-3 py-2 rounded-lg"
                                        >
                                            <Text className="text-gray-600 font-bold text-xs">View Doc</Text>
                                        </TouchableOpacity>
                                )}
                                <View className="flex-1 flex-row gap-2 justify-end">
                                    <TouchableOpacity 
                                        onPress={() => handleVerification(v.id, 'reject')}
                                        className="bg-red-50 px-4 py-2 rounded-lg border border-red-100"
                                    >
                                        <Text className="text-red-600 font-bold text-xs">Reject</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        onPress={() => handleVerification(v.id, 'approve')}
                                        className="bg-green-50 px-4 py-2 rounded-lg border border-green-100"
                                    >
                                        <Text className="text-green-600 font-bold text-xs">Approve</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </View>

            {/* All Gigs List */}
            <View className="bg-white rounded-2xl mt-4 shadow-sm border border-gray-100 overflow-hidden pb-4">
                <View className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex-row justify-between items-center">
                    <Text className="font-bold text-gray-800">All Gigs</Text>
                    {gigs.length > 0 && (
                        <View className="bg-blue-100 px-2 py-0.5 rounded-full">
                            <Text className="text-xs font-bold text-blue-700">{gigs.length} total</Text>
                        </View>
                    )}
                </View>

                {gigs.length === 0 ? (
                    <View className="p-8 items-center justify-center">
                            <Text className="text-gray-400 font-medium">No gigs found</Text>
                    </View>
                ) : (
                    gigs.map((gig) => (
                        <View key={gig.id} className="p-5 border-b border-gray-100">
                            <View className="flex-row justify-between items-start mb-2">
                                <View className="flex-1 mr-4">
                                    <Text className="font-bold text-gray-900 text-base">{gig.title}</Text>
                                    <Text className="text-sm text-gray-500 mb-1">by {gig.handyman_name}</Text>
                                    <View className="flex-row items-center gap-2 mt-1">
                                         <View className="bg-gray-100 px-2 py-0.5 rounded">
                                             <Text className="text-xs text-gray-600">{gig.category_name}</Text>
                                         </View>
                                         <View className={gig.is_active == 1 ? 'bg-green-100 px-2 py-0.5 rounded' : 'bg-red-100 px-2 py-0.5 rounded'}>
                                             <Text className={gig.is_active == 1 ? 'text-xs font-bold text-green-700 uppercase' : 'text-xs font-bold text-red-700 uppercase'}>
                                                 {gig.is_active == 1 ? 'Active' : 'Inactive'}
                                             </Text>
                                         </View>
                                    </View>
                                </View>
                                <View className="items-end">
                                    <Text className="font-bold text-lg text-gray-900">৳{parseFloat(gig.price).toFixed(0)}</Text>
                                    <TouchableOpacity 
                                        onPress={() => handleDeleteGig(gig.id)}
                                        className="mt-2 bg-red-50 p-2 rounded-full border border-red-100"
                                    >
                                        <Feather name="trash-2" size={16} color="#DC2626" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminOverviewScreen;
