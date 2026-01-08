import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../stores/useAuthStore';

// Screens
import HomeScreen from '../screens/HomeScreen';
import AboutScreen from '../screens/AboutScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AdminDashboardScreen from '../screens/dashboard/AdminDashboardScreen';
import HandymanDashboardScreen from '../screens/dashboard/HandymanDashboardScreen';
import GigDetailsScreen from '../screens/gigs/GigDetailsScreen';
import CreateGigScreen from '../screens/gigs/CreateGigScreen';
import HandymanProfileScreen from '../screens/handymen/HandymanProfileScreen';
import CustomerTabNavigator from './CustomerTabNavigator';

const Stack = createNativeStackNavigator();

const AppStack = () => {
  const user = useAuthStore((state) => state.user);

  // Determine initial route based on user role
  const getInitialRouteName = () => {
    if (user?.role === 'admin') return 'AdminDashboard';
    if (user?.role === 'handyman') return 'HandymanDashboard';
    if (user?.role === 'customer') return 'CustomerTabs';
    return 'Home';
  };

  return (
    <Stack.Navigator initialRouteName={getInitialRouteName()} screenOptions={{ headerShown: true }}>
       {/* Common Screens */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="GigDetails" component={GigDetailsScreen} />
      <Stack.Screen name="HandymanProfile" component={HandymanProfileScreen} />
      
      {/* Role Specific Screens */}
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="HandymanDashboard" component={HandymanDashboardScreen} />
      
      {/* Customer Tabs (Replaces CustomerDashboardScreen direct access) */}
       <Stack.Screen 
        name="CustomerTabs" 
        component={CustomerTabNavigator} 
        options={{ headerShown: false }} 
       />
      
       {/* Other features */}
      <Stack.Screen name="CreateGig" component={CreateGigScreen} />
      
    </Stack.Navigator>
  );
};

export default AppStack;
