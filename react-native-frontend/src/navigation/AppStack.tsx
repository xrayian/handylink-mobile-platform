import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../stores/useAuthStore';

// Screens
import HomeScreen from '../screens/HomeScreen';
import AboutScreen from '../screens/AboutScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AdminTabNavigator from './AdminTabNavigator';
import HandymanTabNavigator from './HandymanTabNavigator';
import GigDetailsScreen from '../screens/gigs/GigDetailsScreen';
import CreateGigScreen from '../screens/gigs/CreateGigScreen';
import HandymanProfileScreen from '../screens/handymen/HandymanProfileScreen';
import HandymanVerificationScreen from '../screens/handymen/HandymanVerificationScreen';
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
    /* @ts-ignore */
    <Stack.Navigator initialRouteName={getInitialRouteName()} screenOptions={{ headerShown: true }}>
       {/* Common Screens */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="About" component={AboutScreen} options={{
        headerShown: false
      }} />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="GigDetails" 
        component={GigDetailsScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="HandymanProfile" 
        component={HandymanProfileScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="HandymanVerification" 
        component={HandymanVerificationScreen} 
        options={{ headerShown: false }}
      />
      
      {/* Role Specific Screens */}
      <Stack.Screen 
        name="AdminDashboard" 
        component={AdminTabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="HandymanDashboard" 
        component={HandymanTabNavigator} 
        options={{ headerShown: false }}
      />
      
      {/* Customer Tabs (Replaces CustomerDashboardScreen direct access) */}
       <Stack.Screen 
        name="CustomerTabs" 
        component={CustomerTabNavigator} 
        options={{ headerShown: false }} 
       />
      
       {/* Other features */}
      <Stack.Screen 
        name="CreateGig" 
        component={CreateGigScreen} 
        options={{ headerShown: false }}
      />
      
    </Stack.Navigator>
  );
};

export default AppStack;
