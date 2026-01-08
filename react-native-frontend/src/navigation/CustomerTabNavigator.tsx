import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import CustomerDashboardScreen from '../screens/dashboard/CustomerDashboardScreen';
import CustomerBookingsScreen from '../screens/dashboard/CustomerBookingsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const CustomerTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBaseStyle: {
                    borderTopWidth: 0,
                    elevation: 0,
                    height: 60,
                    paddingBottom: 10,
                },
                tabBarActiveTintColor: '#000',
                tabBarInactiveTintColor: '#9CA3AF',
            }}
        >
            <Tab.Screen 
                name="Dashboard" 
                component={CustomerDashboardScreen} 
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="home" size={size} color={color} />
                    ),
                    tabBarLabel: 'Home'
                }}
            />
            <Tab.Screen 
                name="Bookings" 
                component={CustomerBookingsScreen} 
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="calendar" size={size} color={color} />
                    ),
                    tabBarLabel: 'Bookings'
                }}
            />
            <Tab.Screen 
                name="Settings" 
                component={SettingsScreen} 
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="settings" size={size} color={color} />
                    ),
                    tabBarLabel: 'Settings'
                }}
            />
        </Tab.Navigator>
    );
};

export default CustomerTabNavigator;
