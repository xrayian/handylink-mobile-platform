import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../../services/api';

const GigDetailsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    // @ts-ignore
    const { id } = route.params || {};

    const [loading, setLoading] = useState(true);
    const [gig, setGig] = useState(null);
    const [reviews, setReviews] = useState([]);
    
    // Booking Modal
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [customerNotes, setCustomerNotes] = useState("");
    const [bookingSubmitting, setBookingSubmitting] = useState(false);

    useEffect(() => {
        if (id) {
            fetchGigDetails();
        }
    }, [id]);

    const fetchGigDetails = async () => {
        try {
            setLoading(true);
            const gigRes = await api.get(`/gigs/${id}`);
            setGig(gigRes.data);

            // Fetch reviews if separate endpoint, or assume included
            // Assuming separate based on previous patterns
            try {
                const reviewsRes = await api.get(`/gigs/${id}/reviews`);
                setReviews(reviewsRes.data);
            } catch (e) {
                 // ignore if fails or empty
                 setReviews([]);
            }

        } catch (error) {
            console.error(error);
            // @ts-ignore
            Alert.alert("Error", "Failed to load service details");
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = async () => {
        setBookingSubmitting(true);
        try {
            await api.post('/bookings', {
                gig_id: gig.id,
                customer_notes: customerNotes
            });
            setShowBookingModal(false);
            Alert.alert("Success", "Booking confirmed! You can view it in your dashboard.", [
                { text: "OK", onPress: () => navigation.navigate('CustomerTabs', { screen: 'Bookings' }) }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Booking failed. Please try again.");
        } finally {
            setBookingSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="black" />
            </View>
        );
    }

    if (!gig) return null;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-4 py-2 flex-row items-center justify-between border-b border-gray-50">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
              <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-6">
              {/* Category Badge */}
              <View className="bg-black self-start px-3 py-1.5 rounded-full mb-4">
                  <Text className="text-white text-xs font-bold uppercase">{gig.category_name}</Text>
              </View>

              {/* Title */}
              <Text className="text-3xl font-bold text-gray-900 mb-4 leading-tight">{gig.title}</Text>
              
              {/* Meta */}
              <View className="flex-row items-center gap-6 mb-6">
                 {gig.avg_rating && (
                     <View className="flex-row items-center gap-1">
                         <Feather name="star" size={16} color="black" />
                         <Text className="font-bold text-base">{parseFloat(gig.avg_rating).toFixed(1)}</Text>
                         <Text className="text-gray-500 text-sm">({gig.review_count || 0} reviews)</Text>
                     </View>
                 )}
                 <View className="flex-row items-center gap-1">
                     <Feather name="map-pin" size={16} color="#9CA3AF" />
                     <Text className="text-gray-500 font-medium text-sm">{gig.city}</Text>
                 </View>
              </View>

              <View className="h-[1px] bg-gray-100 mb-6" />
              
              {/* Price & Booking (Mobile Layout often puts this sticky at bottom, but inline is fine too) */}
              <View className="bg-gray-50 p-6 rounded-3xl mb-8 border border-gray-100">
                  <View className="flex-row justify-between items-end mb-6">
                      <Text className="text-gray-500 font-bold">Price</Text>
                      <Text className="text-3xl font-bold text-gray-900">৳{parseFloat(gig.price).toFixed(0)}</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => setShowBookingModal(true)}
                    className="w-full bg-black py-4 rounded-2xl items-center shadow-lg"
                  >
                      <Text className="text-white font-bold text-lg">Book Now</Text>
                  </TouchableOpacity>
              </View>

              {/* Description */}
              <View className="mb-8">
                  <Text className="text-xl font-bold text-gray-900 mb-3">About this Service</Text>
                  <Text className="text-gray-600 text-base leading-relaxed">{gig.description}</Text>
              </View>

              {/* Handyman */}
              <View className="mb-8 p-5 bg-gray-50 rounded-2xl flex-row items-center justify-between">
                  <View className="flex-row items-center gap-4">
                       <View className="w-12 h-12 bg-white rounded-full items-center justify-center border border-gray-100">
                           <Text className="text-lg font-bold">{gig.handyman_name?.charAt(0)}</Text>
                       </View>
                       <View>
                           <Text className="font-bold text-base text-gray-900">{gig.handyman_name}</Text>
                           <Text className="text-xs text-gray-500 uppercase font-bold">Professional Handyman</Text>
                       </View>
                  </View>
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('HandymanProfile', { id: gig.handyman_profile_id || gig.user_id })} // Fallback ID
                    className="bg-white px-4 py-2 rounded-full border border-gray-200"
                  >
                      <Text className="text-xs font-bold text-black">View Profile</Text>
                  </TouchableOpacity>
              </View>

              {/* Reviews */}
              <View className="mb-10">
                  <Text className="text-xl font-bold text-gray-900 mb-6">Client Reviews</Text>
                  {reviews.length === 0 ? (
                      <Text className="text-gray-500 italic">No reviews yet.</Text>
                  ) : (
                       reviews.map((review) => (
                           <View key={review.id} className="mb-6 border-b border-gray-50 pb-6 last:border-0">
                               <View className="flex-row justify-between mb-2">
                                   <Text className="font-bold text-gray-900">{review.reviewer_name}</Text>
                                   <Text className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</Text>
                               </View>
                               <View className="flex-row mb-2">
                                   {[1,2,3,4,5].map(i => (
                                       <Feather key={i} name="star" size={12} color={i <= review.rating ? "#FACC15" : "#E5E7EB"} />
                                   ))}
                               </View>
                               <Text className="text-gray-600 text-sm leading-relaxed">"{review.comment}"</Text>
                           </View>
                       ))
                  )}
              </View>

          </View>
      </ScrollView>

      {/* Booking Modal */}
      <Modal
        visible={showBookingModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBookingModal(false)}
      >
          <View className="flex-1 bg-black/50 justify-end">
              <View className="bg-white rounded-t-3xl p-6 min-h-[50%]">
                  <View className="flex-row justify-between items-center mb-6">
                      <Text className="text-2xl font-bold">Confirm Booking</Text>
                      <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                          <Feather name="x" size={24} color="black" />
                      </TouchableOpacity>
                  </View>
                  
                  <View className="bg-gray-50 p-4 rounded-xl mb-6">
                      <Text className="text-gray-500 font-bold uppercase text-xs tracking-wider mb-1">Service</Text>
                      <Text className="text-lg font-bold mb-2">{gig.title}</Text>
                      <Text className="text-gray-500 font-bold uppercase text-xs tracking-wider mb-1">Total Price</Text>
                      <Text className="text-2xl font-bold">৳{parseFloat(gig.price).toFixed(0)}</Text>
                  </View>

                  <Text className="text-gray-500 font-bold uppercase text-xs tracking-wider mb-2">Notes for Handyman (Optional)</Text>
                  <TextInput 
                    className="bg-gray-50 border border-gray-100 rounded-xl p-4 h-32 text-base mb-6"
                    placeholder="Describe your issue or preferred time..."
                    multiline
                    textAlignVertical="top"
                    value={customerNotes}
                    onChangeText={setCustomerNotes}
                  />

                  <TouchableOpacity 
                    onPress={handleBooking}
                    disabled={bookingSubmitting}
                    className="w-full bg-black py-4 rounded-xl items-center mb-4"
                  >
                      {bookingSubmitting ? (
                          <ActivityIndicator color="white" />
                      ) : (
                          <Text className="text-white font-bold text-lg">Confirm & Pay on Completion</Text>
                      )}
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>

    </SafeAreaView>
  );
};

export default GigDetailsScreen;

