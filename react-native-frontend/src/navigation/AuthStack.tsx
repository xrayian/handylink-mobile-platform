import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterChoiceScreen from '../screens/auth/RegisterChoiceScreen';
import RegisterCustomerScreen from '../screens/auth/RegisterCustomerScreen';
import RegisterHandymanScreen from '../screens/auth/RegisterHandymanScreen';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
    return (
        /* @ts-ignore */
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="RegisterChoice" component={RegisterChoiceScreen} />
            <Stack.Screen name="RegisterCustomer" component={RegisterCustomerScreen} />
            <Stack.Screen name="RegisterHandyman" component={RegisterHandymanScreen} />
        </Stack.Navigator>
    );
};

export default AuthStack;
