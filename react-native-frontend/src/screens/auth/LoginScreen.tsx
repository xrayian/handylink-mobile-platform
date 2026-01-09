import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/useAuthStore';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    setLoading(true);

    try {
        // We use the api service we created, which is an axios instance
        // equivalent to: api('/auth/login', { method: 'POST', body: ... })
        // console.log("Attempting login with:", email, password);
        const response = await api.post('/auth/login', { email, password });
        const data = response.data;
        
        if (data.token) {
            setToken(data.token);
            setUser(data.user);
            // Navigation handled by RootNavigator reacting to token change
        }
    } catch (error) {
       console.error(error);
       // @ts-ignore
       Alert.alert("Login Failed", error.response?.data?.error || "Invalid credentials or server error");
    } finally {
       setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : (Platform.OS === "android" ? "height" : undefined)} 
        className="flex-1 bg-white"
        style={{ paddingBottom: insets.bottom }}
    >
        <StatusBar barStyle="dark-content" />
        <ScrollView 
            className="flex-1 px-6"
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            keyboardShouldPersistTaps="handled"
        >
            {/* Header Section */}
            <View className="mb-10">
                <Text className="text-4xl font-bold text-gray-900 mb-2">Let's Sign you in.</Text>
                <Text className="text-2xl text-gray-500 font-medium">Welcome back.</Text>
                <Text className="text-2xl text-gray-500 font-medium">You've been missed!</Text>
            </View>

            {/* Form Section */}
            <View className="space-y-6">
                
                {/* Email Input */}
                <View className="space-y-2">
                    <Text className="text-gray-900 font-bold ml-1">Email</Text>
                    <View className={`flex-row items-center border border-gray-200 rounded-2xl px-4 py-3 bg-gray-50 focus:border-black focus:bg-white transition-colors`}>
                        <Feather name="mail" size={20} color="#9CA3AF" />
                        <TextInput 
                            className="flex-1 ml-3 text-base text-gray-900 font-medium"
                            placeholder="name@example.com"
                            placeholderTextColor="#9CA3AF"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>
                </View>

                {/* Password Input */}
                <View className="space-y-2">
                    <Text className="text-gray-900 font-bold ml-1">Password</Text>
                    <View className="flex-row items-center border border-gray-200 rounded-2xl px-4 py-3 bg-gray-50">
                        <Feather name="lock" size={20} color="#9CA3AF" />
                        <TextInput 
                            className="flex-1 ml-3 text-base text-gray-900 font-medium"
                            placeholder="••••••••"
                            placeholderTextColor="#9CA3AF"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Forgot Password? */}
                {/* <TouchableOpacity className="items-end">
                    <Text className="font-bold text-gray-900">Forgot Password?</Text>
                </TouchableOpacity> */}

                {/* Login Button */}
                <TouchableOpacity 
                    className="w-full bg-black rounded-2xl py-4 items-center shadow-lg shadow-gray-300 mt-4 active:scale-95 transition-transform"
                    onPress={handleLogin}
                    disabled={loading}
                >
                     {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Sign In</Text>
                    )}
                </TouchableOpacity>

                {/* Register Link */}
                <View className="flex-row justify-center mt-6">
                    <Text className="text-gray-500 font-medium">Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('RegisterChoice')}>
                        <Text className="text-black font-bold">Register</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
