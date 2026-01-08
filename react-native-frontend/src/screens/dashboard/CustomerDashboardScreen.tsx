import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, RefreshControl, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/useAuthStore';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import api from '../../services/api';

const CustomerDashboardScreen = () => {
  const user = useAuthStore((state) => state.user);
  const [locationStatus, setLocationStatus] = useState("New York, USA"); // Simplified
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const navigation = useNavigation();

  // Data State
  const [categories, setCategories] = useState([]);
  const [nearbyHandymen, setNearbyHandymen] = useState([]);
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // Location Logic - Use null to indicate not loaded
  const [locationCoords, setLocationCoords] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    fetchLocation();
  }, []);

  // Fetch data only after location is available or if permission denied (logic can be improved)
  useEffect(() => {
    if (locationCoords) {
        fetchDashboardData();
    }
  }, [selectedCategory, locationCoords]); // Re-fetch when category or location changes

  const fetchLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert("Permission Denied", "Location is needed to find services nearby.");
          // Set default location or handle error state, enabling fetch anyway? 
          // For now, let's default to a fixed location so app works
          setLocationCoords({ lat: 40.7128, lng: -74.0060 }); 
          return; 
        }

        setLocationStatus("Locating...");
        let location = await Location.getCurrentPositionAsync({});
        
        if (location && location.coords) {
             let address = await Location.reverseGeocodeAsync({
                 latitude: location.coords.latitude,
                 longitude: location.coords.longitude
             });

             setLocationCoords({ lat: location.coords.latitude, lng: location.coords.longitude });
             
            if (address && address.length > 0) {
                 const currentAddress = address[0];
                 const city = currentAddress.city || currentAddress.region || currentAddress.subregion;
                 const country = currentAddress.country;
                 
                 if (city && country) {
                     setLocationStatus(`${city}, ${country}`);
                 } else if (country) {
                      setLocationStatus(country);
                 } else {
                     setLocationStatus("Unknown Location");
                 }
            }
        }
      } catch (e) {
          console.log("Location Error: ", e);
      }
  };

  const fetchDashboardData = async () => {
    if (!locationCoords) return;

      try {
          if (!refreshing) setLoading(true); 
          // Fetch Categories
          const catsRes = await api.get('/categories');
          setCategories([{ id: '', name: 'All', icon: 'grid'}, ...catsRes.data]);

          // Fetch Gigs with Location and Search
          const gigsRes = await api.get('/gigs', { 
            params: { 
                category: selectedCategory, 
                lat: locationCoords.lat, 
                lng: locationCoords.lng,
                q: searchQuery, // Search Query
                radius: 50 // Default radius
            } 
          });
          setGigs(gigsRes.data);

          // Populate Handymen from Gigs (Unique list)
          const uniqueHandymenMap = new Map();
          gigsRes.data.forEach((gig: any) => {
              if (gig.handyman_name && !uniqueHandymenMap.has(gig.handyman_name)) {
                   uniqueHandymenMap.set(gig.handyman_name, {
                       id: gig.handyman_profile_id,
                       name: gig.handyman_name,
                       rating: gig.avg_rating || 0,
                       reviews: gig.review_count || 0,
                       experience: gig.experience_years || 0,
                       services_offered: 1
                   });
              } else if (gig.handyman_name) {
                  // Increment services offered count
                  const handyman = uniqueHandymenMap.get(gig.handyman_name);
                  handyman.services_offered += 1;
                  uniqueHandymenMap.set(gig.handyman_name, handyman);
              }
          });
          setNearbyHandymen(Array.from(uniqueHandymenMap.values()));
          
      } catch (error) {
          console.log("Error fetching dashboard data", error);
      } finally {
          setLoading(false);
          setRefreshing(false);
      }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Refresh both location and dashboard data
    // fetchLocation(); 
    fetchDashboardData();
  }, [selectedCategory]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getInitials = (name: string) => {
      if (!name) return '?';
      return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Trigger search when user stops typing or presses enter? 
  // For now let's just use the existing effect on 'selectedCategory' and run manually on text submit
  const handleSearchSubmit = () => {
      Keyboard.dismiss();
      fetchDashboardData();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView 
        className="flex-1 px-4 pt-4 pb-24" 
        showsVerticalScrollIndicator={false}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="mb-6">
            <TouchableOpacity className="flex-row items-center mb-2">
                <Feather name="map-pin" size={14} color="#6B7280" />
                <Text className="text-gray-500 text-sm ml-1 font-medium">{locationStatus}</Text>
                <Feather name="chevron-down" size={14} color="#6B7280" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-gray-900 tracking-tight">
                {getGreeting()}, {user?.full_name?.split(' ')[0] || 'User'}
            </Text>
            <Text className="text-gray-500 text-base mt-1">Ready to find some help?</Text>
        </View>

        {/* Search Bar */}
        <View className="relative mb-8">
            <View className="absolute left-4 top-4 z-10">
                <Feather name="search" size={20} color="#9CA3AF" />
            </View>
            <TextInput 
                className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 text-base"
                placeholder="Search for 'Plumber'..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearchSubmit}
                returnKeyType="search"
            />
        
             <TouchableOpacity 
                className="absolute right-2 top-[0.6rem] bg-black rounded-xl px-4 py-2"
                onPress={handleSearchSubmit}
             >
                <Text className="text-white font-medium text-xs">Search</Text>
             </TouchableOpacity>
        </View>

        {/* Categories */}
        <View className="mb-8">
            <Text className="text-lg font-bold text-gray-900 mb-4 px-1">Categories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {categories.map((cat) => (
                    <TouchableOpacity 
                        key={cat.id || 'all'}
                        onPress={() => setSelectedCategory(cat.id)}
                        className={`mr-3 px-5 py-4 rounded-xl items-center min-w-[100px] border ${
                            selectedCategory === cat.id 
                            ? 'bg-black border-black' 
                            : 'bg-white border-gray-100'
                        }`}
                    >
                         {/* @ts-ignore */}
                        <Feather name="layers" size={24} color={selectedCategory === cat.id ? 'white' : '#4B5563'} />
                        <Text className={`mt-2 text-xs font-semibold text-center ${selectedCategory === cat.id ? 'text-white' : 'text-gray-600'}`}>
                            {cat.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>

        {/* Top Rated / Nearby */}
        <View className="mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-4 px-1">Top Rated Near You</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-4">
                {nearbyHandymen.map((handyman) => (
                    <TouchableOpacity 
                        key={handyman.id}
                        onPress={() => navigation.navigate('HandymanProfile', { id: handyman.id })}
                        className="mr-4 w-72 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
                    >
                        <View className="flex-row items-center gap-4 mb-3">
                             <View className="w-14 h-14 rounded-full bg-blue-100 items-center justify-center">
                                <Text className="text-blue-600 font-bold text-lg">{getInitials(handyman.name)}</Text>
                             </View>
                             <View className="flex-1">
                                <Text className="font-bold text-gray-900 text-lg truncate">{handyman.name}</Text>
                                <View className="flex-row items-center mt-1">
                                    <Feather name="star" size={14} color="#EAB308" />
                                    <Text className="text-gray-900 font-bold ml-1 text-sm">{parseFloat(handyman.rating).toFixed(1)}</Text>
                                    <Text className="text-gray-400 text-xs ml-1">({handyman.reviews})</Text>
                                </View>
                             </View>
                        </View>
                        
                        <View className="flex-row items-center justify-between border-t border-gray-50 pt-3">
                            <Text className="text-gray-500 text-xs font-semibold bg-gray-100 px-2 py-1 rounded">
                                {handyman.experience}y exp.
                            </Text>
                             <Text className="text-blue-600 text-xs font-bold bg-blue-50 px-2 py-1 rounded">
                                {handyman.services_offered} Services
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>

        {/* Available Gigs */}
        <View className="mb-24">
            <Text className="text-xl font-bold text-gray-900 mb-4 px-1">Available Services</Text>
            <View className="flex-1">
                {gigs.map((gig) => (
                    <TouchableOpacity 
                        key={gig.id}
                        onPress={() => navigation.navigate('GigDetails', { id: gig.id })}
                        className="mb-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
                    >
                        <View className="flex-row justify-between items-start mb-2">
                            <Text className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                {gig.category_name}
                            </Text>
                            <Text className="text-xs text-gray-400">
                                { parseFloat(gig.distance).toFixed(1) } km
                            </Text>
                        </View>
                        
                        <Text className="text-lg font-bold text-gray-900 mb-1">{gig.title}</Text>
                        <Text className="text-sm text-gray-500 mb-3 line-clamp-2" numberOfLines={2}>
                            {gig.description}
                        </Text>

                        <View className="flex-row items-center border-t border-gray-50 pt-3 mt-1">
                             <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2">
                                <Text className="text-blue-600 font-bold text-xs">{getInitials(gig.handyman_name)}</Text>
                             </View>
                            <View className="flex-1">
                                <Text className="text-xs font-bold text-gray-900">{gig.handyman_name}</Text>
                                <View className="flex-row items-center">
                                    <Feather name="star" size={10} color="#EAB308" />
                                    {/* Handle rating logic safely */}
                                    <Text className="text-xs text-gray-600 ml-1">
                                        { parseFloat(gig.avg_rating).toFixed(1) || 'N/A'} ({gig.reviews || gig.review_count || 0})
                                    </Text>
                                </View>
                            </View>
                            <Text className="text-lg font-bold text-gray-900">৳{gig.price}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default CustomerDashboardScreen;
