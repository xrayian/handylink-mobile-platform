import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/useAuthStore';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';

const HandymanDashboardScreen = () => {
  const user = useAuthStore((state) => state.user);
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [myGigs, setMyGigs] = useState([]);
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'gigs'

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch Profile for verification status
      const profileRes = await api.get('/handyman/profile');
      setProfile(profileRes.data);

      if (profileRes.data.is_verified === 'approved') {
          // Fetch Stats
          const statsRes = await api.get('/handyman/stats');
          setStats(statsRes.data);

          // Fetch Bookings
          const bookingsRes = await api.get('/handyman/bookings');
          setBookings(bookingsRes.data);

          // Fetch Gigs
          const gigsRes = await api.get('/handyman/gigs');
          setMyGigs(gigsRes.data);
      }

    } catch (error) {
      console.log('Error fetching handyman dashboard:', error);
      // @ts-ignore
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const updateBookingStatus = async (bookingId, status) => {
      try {
          await api.post(`/bookings/${bookingId}/status`, { status });
          fetchDashboardData();
          Alert.alert("Success", `Booking ${status}`);
      } catch (error) {
          console.error(error);
          Alert.alert("Error", "Failed to update status");
      }
  };

  const deleteGig = async (gigId) => {
    Alert.alert(
        "Delete Gig",
        "Are you sure you want to delete this service?",
        [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: async () => {
                try {
                    await api.delete(`/gigs/${gigId}`);
                    fetchDashboardData();
                } catch (error) {
                    Alert.alert("Error", "Failed to delete gig");
                }
            }}
        ]
    );
  };

  if (loading) {
      return (
          <View className="flex-1 items-center justify-center bg-white">
              <ActivityIndicator size="large" color="black" />
          </View>
      );
  }

  // Unverified State
  if (!profile || profile.is_verified !== 'approved') {
      return (
          <SafeAreaView className="flex-1 bg-white px-6 justify-center items-center">
              <View className="bg-yellow-50 p-6 rounded-2xl items-center mb-6">
                  <Feather name="shield" size={48} color="#D97706" />
                  <Text className="text-xl font-bold text-gray-900 mt-4 text-center">Verification Required</Text>
                  <Text className="text-gray-600 text-center mt-2">
                       {profile?.is_verified === 'pending' 
                        ? "Your profile is currently under review. Please wait for admin approval." 
                        : "Please complete your profile verification to start accepting jobs."}
                  </Text>
              </View>
              {profile?.is_verified !== 'pending' && (
                  <TouchableOpacity 
                    className="bg-black py-4 px-8 rounded-xl w-full"
                    // onPress={() => navigation.navigate('VerificationForm')} // TODO: Implement Verification Form
                  >
                      <Text className="text-white text-center font-bold">Complete Verification</Text>
                  </TouchableOpacity>
              )}
          </SafeAreaView>
      );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView className="flex-1 px-4 pt-4 pb-24" showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View className="flex-row items-end justify-between mb-8 pb-6 border-b border-gray-100">
            <View>
                <Text className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</Text>
                <Text className="text-gray-500 font-medium mt-1">Manage gigs & bookings</Text>
            </View>
            <TouchableOpacity 
                onPress={() => navigation.navigate('CreateGig')}
                className="bg-black px-5 py-3 rounded-full flex-row items-center shadow-lg shadow-black/20"
            >
                <Feather name="plus" size={18} color="white" />
                <Text className="text-white font-bold ml-2 text-xs">New Gig</Text>
            </TouchableOpacity>
        </View>

        {/* Stats Overview */}
        <View className="flex-row gap-4 mb-8">
             {/* Earnings */}
             <View className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                 <View className="absolute right-0 top-0 p-2 opacity-10 bg-green-500 rounded-bl-3xl">
                     <Feather name="dollar-sign" size={40} color="black" />
                 </View>
                 <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Earnings</Text>
                 <Text className="text-2xl font-bold text-gray-900">৳{stats?.total_earnings?.toLocaleString() || '0'}</Text>
             </View>

             {/* Jobs */}
             <View className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                 <View className="absolute right-0 top-0 p-2 opacity-10 bg-blue-500 rounded-bl-3xl">
                     <Feather name="briefcase" size={40} color="black" />
                 </View>
                 <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Jobs</Text>
                 <View className="flex-row items-baseline gap-2">
                    <Text className="text-2xl font-bold text-gray-900">{stats?.total_bookings || 0}</Text>
                    {stats?.total_bookings > 0 && (
                        <View className="bg-green-50 px-2 py-0.5 rounded-full">
                            <Text className="text-green-600 text-[10px] font-bold">Active</Text>
                        </View>
                    )}
                 </View>
             </View>
        </View>

        {/* Rating Card (Full Width) */}
        <View className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden mb-8">
             <View className="absolute right-0 top-0 p-3 opacity-10 bg-yellow-400 rounded-bl-3xl">
                 <Feather name="star" size={50} color="black" />
             </View>
             <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Rating</Text>
             <View className="flex-row items-center gap-2">
                 <Text className="text-3xl font-bold text-gray-900">{parseFloat(stats?.avg_rating || 0).toFixed(1)}</Text>
                 <View className="flex-row">
                     {[1,2,3,4,5].map(i => (
                         <Feather key={i} name="star" size={16} color={i <= Math.round(stats?.avg_rating || 0) ? "#FACC15" : "#E5E7EB"} />
                     ))}
                 </View>
             </View>
        </View>

        {/* Tabs */}
        <View className="flex-row bg-gray-200 p-1 rounded-full mb-6 self-start">
            <TouchableOpacity 
                onPress={() => setActiveTab('bookings')}
                className={`px-6 py-2 rounded-full ${activeTab === 'bookings' ? 'bg-white shadow-sm' : ''}`}
            >
                <Text className={`text-sm font-bold ${activeTab === 'bookings' ? 'text-black' : 'text-gray-500'}`}>Bookings</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                onPress={() => setActiveTab('gigs')}
                className={`px-6 py-2 rounded-full ${activeTab === 'gigs' ? 'bg-white shadow-sm' : ''}`}
            >
                <Text className={`text-sm font-bold ${activeTab === 'gigs' ? 'text-black' : 'text-gray-500'}`}>My Services</Text>
            </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'bookings' ? (
            <View className="space-y-4">
                {bookings.length === 0 ? (
                    <View className="bg-white rounded-2xl p-10 items-center justify-center border border-gray-100">
                         <View className="w-16 h-16 bg-gray-50 rounded-full items-center justify-center mb-4">
                             <Feather name="calendar" size={24} color="#9CA3AF" />
                         </View>
                         <Text className="text-gray-500 font-medium">No bookings yet</Text>
                    </View>
                ) : (
                    bookings.map(booking => (
                        <View key={booking.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                            <View className="flex-row justify-between mb-4">
                                <View className="flex-row items-center gap-3">
                                    <View className="w-12 h-12 bg-blue-50 rounded-xl items-center justify-center border border-blue-100">
                                        <Text className="text-blue-700 font-bold text-xs uppercase">{new Date(booking.booking_time).toLocaleString('default', { month: 'short' })}</Text>
                                        <Text className="text-blue-900 font-bold text-lg">{new Date(booking.booking_time).getDate()}</Text>
                                    </View>
                                    <View>
                                        <Text className="font-bold text-gray-900 text-lg">{booking.gig_title}</Text>
                                        <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">{booking.status}</Text>
                                    </View>
                                </View>
                                <Text className="font-bold text-gray-900 text-lg">৳{booking.total_price}</Text>
                            </View>

                            <View className="flex-row items-center gap-2 mb-4">
                                <View className="w-6 h-6 rounded-full bg-gray-100 items-center justify-center">
                                    <Text className="text-[10px] font-bold text-gray-600">{booking.customer_name?.charAt(0)}</Text>
                                </View>
                                <Text className="text-gray-600 text-sm">{booking.customer_name}</Text>
                                <Text className="text-gray-300">•</Text>
                                <Feather name="clock" size={12} color="#6B7280" />
                                <Text className="text-gray-600 text-sm">{new Date(booking.booking_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                            </View>
                            
                            {booking.customer_notes && (
                                <View className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">
                                    <Text className="text-gray-600 text-sm italic">"{booking.customer_notes}"</Text>
                                </View>
                            )}

                            {booking.status === 'pending' && (
                                <View className="flex-row gap-3 pt-2">
                                    <TouchableOpacity 
                                        onPress={() => updateBookingStatus(booking.id, 'accepted')}
                                        className="flex-1 bg-green-600 py-2.5 rounded-lg items-center"
                                    >
                                        <Text className="text-white font-bold text-sm">Accept</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        onPress={() => updateBookingStatus(booking.id, 'cancelled')}
                                        className="flex-1 bg-white border border-gray-200 py-2.5 rounded-lg items-center"
                                    >
                                        <Text className="text-gray-700 font-bold text-sm">Decline</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                             {booking.status === 'accepted' && (
                                <View className="flex-row gap-3 pt-2">
                                    <TouchableOpacity 
                                        onPress={() => updateBookingStatus(booking.id, 'completed')}
                                        className="flex-1 bg-black py-2.5 rounded-lg items-center"
                                    >
                                        <Text className="text-white font-bold text-sm">Mark Complete</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    ))
                )}
            </View>
        ) : (
             <View className="space-y-4">
                 {myGigs.length === 0 ? (
                      <View className="bg-white rounded-2xl p-10 items-center justify-center border border-gray-100">
                         <View className="w-16 h-16 bg-gray-50 rounded-full items-center justify-center mb-4">
                             <Feather name="briefcase" size={24} color="#9CA3AF" />
                         </View>
                         <Text className="text-gray-500 font-medium">No services created yet</Text>
                    </View>
                 ) : (
                     myGigs.map(gig => (
                         <View key={gig.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                             <View className="flex-row justify-between items-start mb-2">
                                 <View className="bg-blue-50 px-2 py-1 rounded-md">
                                     <Text className="text-blue-700 text-[10px] font-bold uppercase">{gig.category_name}</Text>
                                 </View>
                                 <View className={`w-2 h-2 rounded-full ${gig.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                             </View>
                             
                             <Text className="text-lg font-bold text-gray-900 mb-1">{gig.title}</Text>
                             <Text className="text-gray-500 text-sm mb-4" numberOfLines={2}>{gig.description}</Text>
                             
                             <View className="flex-row items-center justify-between border-t border-gray-50 pt-3">
                                 <Text className="text-xl font-bold text-gray-900">৳{gig.price}</Text>
                                 <View className="flex-row gap-4">
                                     <TouchableOpacity onPress={() => navigation.navigate('CreateGig', { gig })}>
                                         <Feather name="edit-2" size={18} color="#9CA3AF" />
                                     </TouchableOpacity>
                                     <TouchableOpacity onPress={() => deleteGig(gig.id)}>
                                         <Feather name="trash-2" size={18} color="#EF4444" />
                                     </TouchableOpacity>
                                 </View>
                             </View>
                         </View>
                     ))
                 )}
            </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

export default HandymanDashboardScreen;

