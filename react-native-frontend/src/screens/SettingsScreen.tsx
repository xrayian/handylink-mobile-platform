import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/useAuthStore';
import api from '../services/api';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { user, setUser, logout } = useAuthStore();
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Edit Profile State
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email] = useState(user?.email || '');

  // Change Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const getUserInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive", 
          onPress: () => {
            logout();
             navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
          }
        }
      ]
    );
  };

  const updateProfile = async () => {
      setProfileLoading(true);
      try {
          const response = await api.post('/user/update', { 
            full_name: fullName, 
            phone: phone 
          });
          // Update local user state
          setUser({ ...user, full_name: fullName, phone: phone });
          Alert.alert("Success", "Profile saved");
      } catch (error) {
          console.error(error);
           // @ts-ignore
          Alert.alert("Error", error.response?.data?.error || "Could not update profile");
      } finally {
          setProfileLoading(false);
      }
  };

  const updatePassword = async () => {
      if (!newPassword || !confirmPassword) {
          Alert.alert("Error", "Please fill in all fields");
          return;
      }
      if (newPassword.length < 6) {
          Alert.alert("Error", "Password needs to be at least 6 characters");
          return;
      }
      if (newPassword !== confirmPassword) {
          Alert.alert("Error", "Passwords do not match");
          return;
      }
      
      setPasswordLoading(true);
      try {
          await api.post('/user/update', { password: newPassword });
          Alert.alert("Success", "Password updated");
          setNewPassword('');
          setConfirmPassword('');
      } catch (error) {
           console.error(error);
           // @ts-ignore
           Alert.alert("Error", error.response?.data?.error || "Could not update password");
      } finally {
          setPasswordLoading(false);
      }
  };

  const SettingItem = ({ icon, label, onPress, isDestructive = false }) => (
    <TouchableOpacity 
      onPress={onPress}
      className="flex-row items-center justify-between p-4 bg-white border-b border-gray-50"
    >
      <View className="flex-row items-center gap-4">
        <View className={`w-10 h-10 rounded-full items-center justify-center ${isDestructive ? 'bg-red-50' : 'bg-gray-50'}`}>
          <Feather name={icon} size={20} color={isDestructive ? '#ef4444' : '#374151'} />
        </View>
        <Text className={`font-medium text-base ${isDestructive ? 'text-red-500' : 'text-gray-900'}`}>
          {label}
        </Text>
      </View>
      <Feather name="chevron-right" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );

  const SectionTitle = ({ title }) => (
    <Text className="px-4 py-2 text-sm font-bold text-gray-500 uppercase tracking-wider mt-6 mb-2">
      {title}
    </Text>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-3 flex-row items-center gap-4 border-b border-gray-100 bg-white">
        {navigation.canGoBack() && (
            <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
            <Feather name="arrow-left" size={24} color="black" />
            </TouchableOpacity>
        )}
        <Text className="text-xl font-bold text-gray-900">Account Settings</Text>
      </View>

      <ScrollView className="flex-1 bg-gray-50 px-4 py-6">
        <View className="items-center mb-8">
            <Text className="text-gray-500 text-lg">Manage your personal details and security.</Text>
        </View>

        {/* Profile Info Card */}
        <View className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
             <View className="flex-row items-center gap-5 border-b border-gray-100 pb-6 mb-6">
                 <View className="h-16 w-16 rounded-full bg-black items-center justify-center shadow-lg">
                     <Text className="text-white text-xl font-bold">{getUserInitials(user?.full_name)}</Text>
                 </View>
                 <View className="flex-1">
                     <Text className="text-xl font-bold text-gray-900">Personal Info</Text>
                     <Text className="text-gray-500 text-sm">Update your public profile details.</Text>
                 </View>
             </View>

             <View className="space-y-4">
                  <View>
                      <Text className="text-sm font-bold text-gray-900 mb-2">Full Name</Text>
                      <TextInput 
                        value={fullName}
                        onChangeText={setFullName}
                        className="bg-gray-50 border border-transparent p-4 rounded-xl font-medium focus:bg-white focus:border-black"
                        placeholder="John Doe"
                      />
                  </View>

                  <View>
                      <Text className="text-sm font-bold text-gray-900 mb-2">Phone Number</Text>
                      <TextInput 
                        value={phone}
                        onChangeText={setPhone}
                        className="bg-gray-50 border border-transparent p-4 rounded-xl font-medium focus:bg-white focus:border-black"
                        placeholder="+1 (555) 000-0000"
                        keyboardType="phone-pad"
                      />
                  </View>

                  <View>
                      <Text className="text-sm font-bold text-gray-900 mb-2">Email Address</Text>
                      <View className="relative justify-center">
                        <TextInput 
                            value={email}
                            editable={false}
                            className="bg-gray-50 text-gray-400 p-4 rounded-xl font-medium pr-24"
                        />
                        <View className="absolute right-4 bg-gray-100 px-2 py-1 rounded-md">
                            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider">Read Only</Text>
                        </View>
                      </View>
                  </View>

                  <View className="items-end pt-4">
                        <TouchableOpacity 
                            onPress={updateProfile}
                            disabled={profileLoading}
                            className="bg-black px-8 py-3 rounded-xl shadow-lg flex-row items-center"
                        >
                            {profileLoading && <ActivityIndicator color="white" className="mr-2" size="small" />}
                            <Text className="text-white font-bold">{profileLoading ? 'Saving...' : 'Save Changes'}</Text>
                        </TouchableOpacity>
                  </View>
             </View>
        </View>

        {/* Security Card */}
        <View className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
             <View className="flex-row items-center gap-5 border-b border-gray-100 pb-6 mb-6">
                 <View className="h-12 w-12 rounded-full bg-red-50 items-center justify-center">
                     <Feather name="shield" size={24} color="#EF4444" />
                 </View>
                 <View className="flex-1">
                     <Text className="text-xl font-bold text-gray-900">Security</Text>
                     <Text className="text-gray-500 text-sm">Update your password to keep your account safe.</Text>
                 </View>
             </View>

             <View className="space-y-4">
                  <View>
                      <Text className="text-sm font-bold text-gray-900 mb-2">New Password</Text>
                      <TextInput 
                        value={newPassword}
                        onChangeText={setNewPassword}
                        className="bg-gray-50 border border-transparent p-4 rounded-xl font-medium focus:bg-white focus:border-black"
                        placeholder="••••••••"
                        secureTextEntry
                      />
                  </View>

                  <View>
                      <Text className="text-sm font-bold text-gray-900 mb-2">Confirm Password</Text>
                      <TextInput 
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        className="bg-gray-50 border border-transparent p-4 rounded-xl font-medium focus:bg-white focus:border-black"
                        placeholder="••••••••"
                        secureTextEntry
                      />
                  </View>

                   <View className="items-end pt-4">
                        <TouchableOpacity 
                            onPress={updatePassword}
                            disabled={passwordLoading}
                            className="bg-black px-8 py-3 rounded-xl shadow-lg flex-row items-center"
                        >
                            {passwordLoading && <ActivityIndicator color="white" className="mr-2" size="small" />}
                            <Text className="text-white font-bold">{passwordLoading ? 'Updating...' : 'Update Password'}</Text>
                        </TouchableOpacity>
                  </View>
             </View>
        </View>
        
        {/* Support */}
        <SectionTitle title="Support" />
        <View className="bg-white border-y border-gray-100 rounded-xl overflow-hidden mb-6">
           <SettingItem icon="info" label="About Us" onPress={() => navigation.navigate('About')} />
           <SettingItem icon="help-circle" label="Help Center" onPress={() => console.log('Help Center')} />
           <SettingItem icon="shield" label="Privacy Policy" onPress={() => console.log('Privacy')} />
        </View>

        {/* Actions */}
        <SectionTitle title="Actions" />
        <View className="bg-white border-y border-gray-100 rounded-xl overflow-hidden mb-8">
           <SettingItem 
             icon="log-out" 
             label="Log Out" 
             onPress={handleLogout} 
             isDestructive={true} 
           />
        </View>

        <View className="items-center mb-12">
            <Text className="text-gray-400 text-xs">App Version 1.0.0</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
