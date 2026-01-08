import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon, MapPinIcon } from 'react-native-heroicons/outline';
import { StarIcon } from 'react-native-heroicons/solid';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../../services/api';

const HandymanProfileScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    // @ts-ignore
    const { id } = route.params || {};

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [gigs, setGigs] = useState([]);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        if (id) {
            fetchHandymanData();
        }
    }, [id]);

    const fetchHandymanData = async () => {
        try {
            setLoading(true);
            const profileRes = await api.get(`/handymen/${id}`);
            setProfile(profileRes.data);

            const gigsRes = await api.get(`/handymen/${id}/gigs`);
            setGigs(gigsRes.data);

            const reviewsRes = await api.get(`/handymen/${id}/reviews`);
            setReviews(reviewsRes.data);

        } catch (error) {
            console.error(error);
            // @ts-ignore
            Alert.alert("Error", "Failed to load handyman profile");
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="black" />
            </View>
        );
    }

    if (!profile) return null;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <View className="px-4 py-2 flex-row items-center border-b border-gray-50">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
              <ArrowLeftIcon size={24} color="black" />
          </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header Profile */}
          <View className="p-6 pb-8 bg-white">
              <View className="flex-row gap-6 mb-6">
                  <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center border-4 border-gray-50 shadow-sm">
                      <Text className="text-3xl font-bold text-gray-400">{profile.full_name?.charAt(0) || 'U'}</Text>
                  </View>
                  <View className="flex-1 justify-center">
                      <Text className="text-2xl font-bold text-gray-900 mb-1">{profile.full_name}</Text>
                      <View className="flex-row items-center gap-2 mb-2">
                          <View className="bg-green-100 px-2 py-0.5 rounded-full">
                              <Text className="text-green-800 text-[10px] font-bold uppercase">Verified Pro</Text>
                          </View>
                          <Text className="text-gray-400 text-xs">•</Text>
                          <Text className="text-gray-500 text-xs font-medium">Member since {new Date(profile.joined_at).getFullYear()}</Text>
                      </View>
                      <Text className="text-gray-500 text-sm leading-relaxed" numberOfLines={3}>{profile.bio || "No bio information provided."}</Text>
                  </View>
              </View>

              {/* Stats */}
              <View className="flex-row justify-between bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <View className="items-center flex-1">
                      <Text className="text-2xl font-bold text-gray-900">{parseFloat(profile.avg_rating || 0).toFixed(1)}</Text>
                      <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Rating</Text>
                  </View>
                  <View className="w-[1px] bg-gray-200 h-full mx-2" />
                  <View className="items-center flex-1">
                      <Text className="text-2xl font-bold text-gray-900">{profile.jobs_done || 0}</Text>
                      <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Jobs Done</Text>
                  </View>
                  <View className="w-[1px] bg-gray-200 h-full mx-2" />
                  <View className="items-center flex-1">
                      <Text className="text-2xl font-bold text-gray-900">{profile.experience_years || 0}+</Text>
                      <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Years Exp</Text>
                  </View>
              </View>
          </View>

          {/* Services */}
          <View className="px-6 pb-8">
              <Text className="text-xl font-bold text-gray-900 mb-4">Available Services</Text>
              {gigs.length === 0 ? (
                  <View className="bg-gray-50 p-8 rounded-2xl items-center">
                      <Text className="text-gray-500 font-medium">No services listed yet.</Text>
                  </View>
              ) : (
                  <View className="space-y-4">
                      {gigs.map((gig) => (
                          <TouchableOpacity 
                            key={gig.id}
                            onPress={() => navigation.navigate('GigDetails', { id: gig.id })}
                            className="bg-white border border-gray-100 p-5 mb-2 rounded-2xl shadow-sm flex-row justify-between items-start"
                          >
                              <View className="flex-1 mr-4">
                                  <View className="bg-gray-50 self-start px-2 py-1 rounded-md mb-2">
                                      <Text className="text-xs font-bold text-gray-600 uppercase">{gig.category_name}</Text>
                                  </View>
                                  <Text className="font-bold text-lg text-gray-900 mb-1">{gig.title}</Text>
                                  <View className="flex-row items-center gap-1">
                                      <MapPinIcon size={12} color="#9CA3AF" />
                                      <Text className="text-gray-400 text-xs">{gig.city || 'Unknown Location'}</Text>
                                  </View>
                              </View>
                              <View className="items-end">
                                  <Text className="text-xl font-bold text-gray-900">৳{parseFloat(gig.price).toFixed(0)}</Text>
                              </View>
                          </TouchableOpacity>
                      ))}
                  </View>
              )}
          </View>

          {/* Reviews */}
          <View className="px-6 pb-12">
               <Text className="text-xl font-bold text-gray-900 mb-4">Reviews ({reviews.length})</Text>
               {reviews.length === 0 ? (
                   <Text className="text-gray-500 italic">No reviews yet.</Text>
               ) : (
                   reviews.map((review) => (
                       <View key={review.created_at} className="mb-6 border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                           <View className="flex-row justify-between mb-2">
                               <View className="flex-row gap-2 items-center">
                                   <View className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center">
                                       <Text className="text-xs font-bold text-gray-600">{review.reviewer_name?.charAt(0)}</Text>
                                   </View>
                                   <Text className="font-bold text-gray-900 text-sm">{review.reviewer_name}</Text>
                               </View>
                               <Text className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</Text>
                           </View>
                           <View className="flex-row mb-2">
                               {[1,2,3,4,5].map(i => (
                                   <StarIcon key={i} size={12} color={i <= review.rating ? "#FACC15" : "#E5E7EB"} />
                               ))}
                           </View>
                           <Text className="text-gray-600 text-sm leading-relaxed">"{review.comment}"</Text>
                       </View>
                   ))
               )}
          </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default HandymanProfileScreen;

