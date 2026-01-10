import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { StarIcon } from "react-native-heroicons/solid";
import { useAuthStore } from "../../stores/useAuthStore";
import { useNavigation } from "@react-navigation/native";
import { CommonActions } from "@react-navigation/native";
import type { NavigationProp } from "@react-navigation/native";
import api from "../../services/api";

const HandymanDashboardScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const user = useAuthStore((state) => state.user);

  type Tabs = "bookings" | "gigs";

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [myGigs, setMyGigs] = useState([]);
  const [activeTab, setActiveTab] = useState<Tabs>("bookings");

  const toggleActiveTab = async () => {
    setActiveTab((prevTab) => (prevTab === "bookings" ? "gigs" : "bookings"));
  };

  const fetchDashboardData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      const profileRes = await api.get("/handyman/profile");
      setProfile(profileRes.data);

      if (profileRes.data.is_verified === "approved") {
        const statsRes = await api.get("/handyman/stats");
        setStats(statsRes.data);

        const bookingsRes = await api.get("/handyman/bookings");
        const sortedBookings = bookingsRes.data.sort(
          (a: any, b: any) =>
            new Date(b.booking_time).getTime() -
            new Date(a.booking_time).getTime()
        );
        setBookings(sortedBookings);

        const gigsRes = await api.get("/handyman/gigs");
        setMyGigs(gigsRes.data);
      }
    } catch (error) {
      console.log("Error fetching handyman dashboard:", error);
      Alert.alert("Error", "Failed to load dashboard data");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData(false);
    setRefreshing(false);
  }, []);

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await api.patch(`/bookings/${bookingId}`, { status });
      fetchDashboardData();
      Alert.alert("Success", `Booking ${status}`);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update status");
    }
  };

  const deleteGig = async (gigId) => {
    Alert.alert("Delete Gig", "Are you sure you want to delete this service?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/gigs/${gigId}`);
            fetchDashboardData();
          } catch (error) {
            Alert.alert("Error", "Failed to delete gig");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  // Unverified State
  if (!profile || profile.is_verified !== "approved") {
    const isPending = profile?.is_verified === "pending";
    const isRejected = profile?.is_verified === "rejected";

    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
        <View className="flex-1 px-6 justify-center items-center">
          <View
            className={`h-32 w-32 rounded-full items-center justify-center mb-8 ${
              isRejected
                ? "bg-red-50"
                : isPending
                ? "bg-orange-50"
                : "bg-blue-50"
            }`}
          >
            <Feather
              name={
                isRejected ? "alert-circle" : isPending ? "clock" : "shield"
              }
              size={48}
              color={isRejected ? "#DC2626" : isPending ? "#EA580C" : "#2563EB"}
            />
          </View>

          <Text className="text-3xl font-bold text-gray-900 text-center mb-3">
            {isRejected
              ? "Application Update"
              : isPending
              ? "Under Review"
              : "Verification Required"}
          </Text>

          <Text className="text-gray-500 text-center text-lg leading-relaxed mb-12 px-2">
            {isRejected
              ? "We couldn't approve your profile based on the details provided. Please review our guidelines and try again."
              : isPending
              ? "Thanks for applying! Your profile is currently being reviewed by our team. This usually takes 24-48 hours."
              : "To start accepting jobs and earning money, we need to verify your skills and identity. It only takes 2 minutes."}
          </Text>

          {isPending ? (
            <View className="w-full bg-gray-50 p-5 rounded-2xl flex-row items-center justify-center border border-gray-100">
              <ActivityIndicator color="#6B7280" className="mr-3" />
              <Text className="font-semibold text-gray-500">
                Checking status...
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              className={`w-full py-5 rounded-2xl flex-row justify-center items-center ${
                isRejected ? "bg-red-600" : "bg-black"
              }`}
              onPress={() =>
                navigation.getParent()?.navigate("HandymanVerification")
              }
              activeOpacity={0.9}
            >
              <Text className="text-white text-center font-bold text-lg mr-2">
                {isRejected ? "Update Profile" : "Start Verification"}
              </Text>
              <Feather name="arrow-right" size={20} color="white" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            className="mt-8 py-3"
            onPress={() => useAuthStore.getState().logout()}
          >
            <Text className="text-gray-400 font-bold text-sm">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        // 0: Header, 1: Stats, 2: Rating, 3: Tabs (This index makes tabs sticky)
        stickyHeaderIndices={[3]}
      >
        {/* Header (Index 0) */}
        <View className="flex-row items-end justify-between mb-8 pb-6 border-b border-gray-100">
          <View>
            <Text className="text-3xl font-bold text-gray-900 tracking-tight">
              Dashboard
            </Text>
            <Text className="text-gray-500 font-medium mt-1">
              Manage gigs & bookings
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.getParent()?.navigate("CreateGig")}
            className="bg-black px-5 py-3 rounded-full flex-row items-center"
          >
            <Feather name="plus" size={18} color="white" />
            <Text className="text-white font-bold ml-2 text-xs">New Gig</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Overview (Index 1) */}
        <View className="flex-row gap-4 mb-8">
          <View className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 relative overflow-hidden">
            <View className="absolute right-0 top-0 p-2 opacity-10 bg-green-500 rounded-bl-3xl">
              <Feather name="dollar-sign" size={40} color="black" />
            </View>
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Total Earnings
            </Text>
            <Text className="text-2xl font-bold text-gray-900">
              ৳{stats?.total_earnings?.toLocaleString() || "0"}
            </Text>
          </View>

          <View className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 relative overflow-hidden">
            <View className="absolute right-0 top-0 p-2 opacity-10 bg-blue-500 rounded-bl-3xl">
              <Feather name="briefcase" size={40} color="black" />
            </View>
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Total Jobs
            </Text>
            <View className="flex-row items-baseline gap-2">
              <Text className="text-2xl font-bold text-gray-900">
                {stats?.total_bookings || 0}
              </Text>
              {stats?.total_bookings > 0 && (
                <View className="bg-green-50 px-2 py-0.5 rounded-full">
                  <Text className="text-green-600 text-[10px] font-bold">
                    Active
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Rating Card (Index 2) */}
        <View className="bg-white p-4 rounded-2xl border border-gray-100 relative overflow-hidden mb-8">
          <View className="absolute right-0 top-0 p-3 opacity-10 bg-yellow-400 rounded-bl-3xl">
            <StarIcon size={50} color="black" />
          </View>
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            Rating
          </Text>
          <View className="flex-row items-center gap-2">
            <Text className="text-3xl font-bold text-gray-900">
              {parseFloat(stats?.avg_rating || 0).toFixed(1)}
            </Text>
            <View className="flex-row">
              {[1, 2, 3, 4, 5].map((i) => (
                <StarIcon
                  key={i}
                  size={16}
                  color={
                    i <= Math.round(stats?.avg_rating || 0)
                      ? "#FACC15"
                      : "#E5E7EB"
                  }
                />
              ))}
            </View>
          </View>
        </View>

        {/* Tabs (Index 3) - FIXED */}
        <View className="pb-6 bg-gray-50">
          {/* Added pb-6 and bg-gray-50 so when it sticks, it looks clean */}
          <View className="flex-row bg-gray-200 p-1 rounded-xl">
            <TouchableOpacity
              onPress={() => toggleActiveTab()}
              className={`flex-1 py-3 rounded-lg items-center justify-center ${
                activeTab === "bookings" ? "bg-white" : ""
              }`}
            >
              <Text
                className={`text-sm font-bold ${
                  activeTab === "bookings" ? "text-black" : "text-gray-500"
                }`}
              >
                Bookings
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => toggleActiveTab()}
              className={`flex-1 py-3 rounded-lg items-center justify-center ${
                activeTab === "gigs" ? "bg-white" : ""
              }`}
            >
              <Text
                className={`text-sm font-bold ${
                  activeTab === "gigs" ? "text-black" : "text-gray-500"
                }`}
              >
                My Services
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Content */}
        {activeTab === "bookings" ? (
          <View className="space-y-4 pb-24">
            {bookings.length === 0 ? (
              <View className="bg-white rounded-2xl p-10 items-center justify-center border border-gray-100">
                <View className="w-16 h-16 bg-gray-50 rounded-full items-center justify-center mb-4">
                  <Feather name="calendar" size={24} color="#9CA3AF" />
                </View>
                <Text className="text-gray-500 font-medium">
                  No bookings yet
                </Text>
              </View>
            ) : (
              bookings.map((booking) => (
                <View
                  key={booking.id}
                  className="bg-white p-5 rounded-2xl border border-gray-100 mb-2"
                >
                  <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-row gap-3 flex-1 mr-3">
                      <View className="w-12 h-12 bg-blue-50 rounded-xl items-center justify-center border border-blue-100 shrink-0">
                        <Text className="text-blue-700 font-bold text-xs uppercase">
                          {new Date(booking.booking_time).toLocaleString(
                            "default",
                            { month: "short" }
                          )}
                        </Text>
                        <Text className="text-blue-900 font-bold text-lg">
                          {new Date(booking.booking_time).getDate()}
                        </Text>
                      </View>
                      <View className="flex-1 pt-0.5">
                        <Text
                          className="font-bold text-gray-900 text-lg leading-6"
                          numberOfLines={2}
                        >
                          {booking.gig_title}
                        </Text>
                        <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                          {booking.status}
                        </Text>
                      </View>
                    </View>
                    <Text className="font-bold text-gray-900 text-lg shrink-0 pt-0.5">
                      ৳{booking.total_price}
                    </Text>
                  </View>

                  <View className="flex-row items-center gap-2 mb-4">
                    <View className="w-6 h-6 rounded-full bg-gray-100 items-center justify-center">
                      <Text className="text-[10px] font-bold text-gray-600">
                        {booking.customer_name?.charAt(0)}
                      </Text>
                    </View>
                    <Text className="text-gray-600 text-sm">
                      {booking.customer_name}
                    </Text>
                    <Text className="text-gray-300">•</Text>
                    <Feather name="clock" size={12} color="#6B7280" />
                    <Text className="text-gray-600 text-sm">
                      {new Date(booking.booking_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>

                  {booking.customer_notes && (
                    <View className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">
                      <Text className="text-gray-600 text-sm italic">
                        "{booking.customer_notes}"
                      </Text>
                    </View>
                  )}

                  {booking.status === "pending" && (
                    <View className="flex-row gap-3 pt-2">
                      <TouchableOpacity
                        onPress={() =>
                          updateBookingStatus(booking.id, "accepted")
                        }
                        className="flex-1 bg-green-600 py-2.5 rounded-lg items-center"
                      >
                        <Text className="text-white font-bold text-sm">
                          Accept
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          updateBookingStatus(booking.id, "cancelled")
                        }
                        className="flex-1 bg-white border border-gray-200 py-2.5 rounded-lg items-center"
                      >
                        <Text className="text-gray-700 font-bold text-sm">
                          Decline
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {booking.status === "accepted" && (
                    <View className="flex-row gap-3 pt-2">
                      <TouchableOpacity
                        onPress={() =>
                          updateBookingStatus(booking.id, "completed")
                        }
                        className="flex-1 bg-black py-2.5 rounded-lg items-center"
                      >
                        <Text className="text-white font-bold text-sm">
                          Mark Complete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        ) : (
          <View className="space-y-4 pb-24">
            {myGigs.length === 0 ? (
              <View className="bg-white rounded-2xl p-10 items-center justify-center border border-gray-100">
                <View className="w-16 h-16 bg-gray-50 rounded-full items-center justify-center mb-4">
                  <Feather name="briefcase" size={24} color="#9CA3AF" />
                </View>
                <Text className="text-gray-500 font-medium">
                  No services created yet
                </Text>
              </View>
            ) : (
              myGigs.map((gig) => (
                <View
                  key={gig.id}
                  className="bg-white p-5 rounded-2xl border border-gray-100"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="bg-blue-50 px-2 py-1 rounded-md">
                      <Text className="text-blue-700 text-[10px] font-bold uppercase">
                        {gig.category_name}
                      </Text>
                    </View>
                    <View
                      className={`w-2 h-2 rounded-full ${
                        gig.is_active ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  </View>

                  <Text className="text-lg font-bold text-gray-900 mb-1">
                    {gig.title}
                  </Text>
                  <Text
                    className="text-gray-500 text-sm mb-4"
                    numberOfLines={2}
                  >
                    {gig.description}
                  </Text>

                  <View className="flex-row items-center justify-between border-t border-gray-50 pt-3">
                    <Text className="text-xl font-bold text-gray-900">
                      ৳{gig.price}
                    </Text>
                    <View className="flex-row gap-4">
                      <TouchableOpacity
                        onPress={() =>
                          navigation.getParent()?.navigate("CreateGig", { gig })
                        }
                      >
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
