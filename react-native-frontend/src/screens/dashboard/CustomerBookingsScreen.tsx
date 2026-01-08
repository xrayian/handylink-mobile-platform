import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import api from '../../services/api';

const CustomerBookingsScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isFocused) {
      fetchBookings();
    }
  }, [isFocused]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/my-bookings');
      setBookings(response.data);
    } catch (error) {
      console.error(error);
      // @ts-ignore
      Alert.alert("Error", "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
      switch(status) {
          case 'pending': return 'text-yellow-600 bg-yellow-50';
          case 'confirmed': return 'text-blue-600 bg-blue-50';
          case 'completed': return 'text-green-600 bg-green-50';
          case 'cancelled': return 'text-red-600 bg-red-50';
          default: return 'text-gray-600 bg-gray-50';
      }
  };

  const openReviewModal = (booking) => {
      // @ts-ignore
      setSelectedBooking(booking);
      setShowReviewModal(true);
      setRating(0);
      setComment("");
  };

  const submitReview = async () => {
      if (rating === 0) return;
      
      setSubmitting(true);
      try {
        await api.post('/reviews', {
            // @ts-ignore
            booking_id: selectedBooking?.id,
            rating,
            comment
        });
        Alert.alert("Success", "Thanks for your feedback!");
        setShowReviewModal(false);
        fetchBookings(); // Refresh list to update review status
      } catch (error) {
          console.error(error);
          Alert.alert("Error", "Couldn't save your review");
      } finally {
          setSubmitting(false);
      }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
       <View className="px-4 py-4 bg-white border-b border-gray-100 flex-row items-center justify-between">
           <Text className="text-xl font-bold text-gray-900">Your Activity</Text>
       </View>

       <ScrollView className="flex-1 px-4 pt-6 pb-20">
           {loading ? (
             <View className="items-center justify-center py-20">
               <ActivityIndicator size="large" color="black" />
             </View>
           ) : bookings.length === 0 ? (
               <View className="items-center justify-center py-20">
                   <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-6">
                       <Feather name="calendar" size={40} color="#9CA3AF" />
                   </View>
                   <Text className="text-xl font-bold text-gray-900 mb-2">No bookings yet</Text>
                   <Text className="text-gray-500 mb-8 text-center px-10">When you book a service, it will show up here.</Text>
                   <TouchableOpacity 
                        onPress={() => navigation.navigate('Dashboard')}
                        className="bg-black px-8 py-3 rounded-xl"
                    >
                       <Text className="text-white font-medium">Find Services</Text>
                   </TouchableOpacity>
               </View>
           ) : (
               <View className="space-y-4">
                   {bookings.map((booking) => (
                       <View key={booking.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                           <View className="flex-row justify-between items-start mb-4">
                               <View className="flex-row gap-4">
                                   <View className="w-12 h-12 bg-gray-100 rounded-xl items-center justify-center">
                                       <Text className="text-2xl">🛠️</Text>
                                   </View>
                                   <View>
                                       <Text className="font-bold text-lg text-gray-900 leading-tight">{booking.gig_title}</Text>
                                       <Text className="text-gray-500 text-sm mt-1">with {booking.handyman_name}</Text>
                                   </View>
                               </View>
                               <View className="items-end">
                                   <Text className="font-bold text-gray-900">৳{booking.total_price}</Text>
                                   <View className={`mt-1 px-2 py-1 rounded-md ${getStatusColor(booking.status)}`}>
                                       <Text className={`text-xs font-bold uppercase`}>
                                            {/* We need to extract the text color from the className string or just reconstruct it. 
                                                NativeWind handles classes, but text color inheritance inside View needs Text styling.
                                                Simpler approach:
                                            */}
                                            {booking.status}
                                       </Text>
                                   </View>
                               </View>
                           </View>

                           <View className="flex-row items-center gap-2 border-t border-gray-50 pt-4 mt-2">
                               <Feather name="clock" size={14} color="#6B7280" />
                               <Text className="text-sm text-gray-500">
                                   {new Date(booking.booking_time).toLocaleDateString()} • {new Date(booking.booking_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </Text>
                           </View>

                           {booking.status === 'completed' && !booking.reviewed && (
                               <TouchableOpacity 
                                    onPress={() => openReviewModal(booking)}
                                    className="mt-4 bg-gray-900 rounded-lg py-2.5 items-center"
                                >
                                   <Text className="text-white font-medium text-sm">Rate & Review</Text>
                               </TouchableOpacity>
                           )}
                       </View>
                   ))}
               </View>
           )}
       </ScrollView>

       {/* Review Modal */}
       <Modal
            animationType="slide"
            transparent={true}
            visible={showReviewModal}
            onRequestClose={() => setShowReviewModal(false)}
       >
           <View className="flex-1 justify-end bg-black/50">
               <View className="bg-white rounded-t-[32px] p-6 pb-10">
                   <Text className="text-xl font-bold text-center text-gray-900 mb-1">How was your experience?</Text>
                   <Text className="text-center text-gray-500 text-sm mb-6">
                       Rate the service provided by {selectedBooking?.handyman_name}
                   </Text>

                   <View className="flex-row justify-center gap-4 mb-6">
                       {[1, 2, 3, 4, 5].map((star) => (
                           <TouchableOpacity key={star} onPress={() => setRating(star)}>
                               <Feather 
                                    name="star" 
                                    size={40} 
                                    color={star <= rating ? "#FACC15" : "#E5E7EB"} 
                                    style={{ fill: star <= rating ? "#FACC15" : "none" }} // specialized styling for fill if supported or just color
                               /> 
                           </TouchableOpacity>
                       ))}
                   </View>

                   <TextInput 
                        className="bg-gray-50 rounded-xl p-4 text-gray-900 min-h-[100px] mb-6 text-base"
                        placeholder="Write a quick review..."
                        multiline
                        textAlignVertical="top"
                        value={comment}
                        onChangeText={setComment}
                   />

                   <View className="flex-row gap-3">
                       <TouchableOpacity 
                            onPress={() => setShowReviewModal(false)}
                            className="flex-1 bg-white border border-gray-200 py-3.5 rounded-xl items-center"
                        >
                           <Text className="text-gray-700 font-bold">Cancel</Text>
                       </TouchableOpacity>
                       <TouchableOpacity 
                            onPress={submitReview}
                            className="flex-1 bg-black py-3.5 rounded-xl items-center"
                            disabled={submitting || rating === 0}
                        >
                           <Text className="text-white font-bold">{submitting ? 'Sending...' : 'Submit Review'}</Text>
                       </TouchableOpacity>
                   </View>
               </View>
           </View>
       </Modal>
    </SafeAreaView>
  );
};

export default CustomerBookingsScreen;
