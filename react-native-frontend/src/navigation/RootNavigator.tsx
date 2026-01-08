import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import './types'; // Import types for global declaration
import { useAuthStore } from '../stores/useAuthStore';
import '../../global.css';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
    const token = useAuthStore((state) => state.token);
    
    // We rely on Zustand persist middleware to rehydrate state automatically.
    // Ideally we show a splash screen until rehydration is complete, 
    // but for this MVP port we will let it reactive switch.

    return (
        <NavigationContainer>
            {/* @ts-ignore */}
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {token ? (
                    <Stack.Screen name="App" component={AppStack} />
                ) : (
                    <Stack.Screen name="Auth" component={AuthStack} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default RootNavigator;
