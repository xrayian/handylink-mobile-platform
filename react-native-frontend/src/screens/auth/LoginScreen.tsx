import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/useAuthStore';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
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
        <StatusBar barStyle="light-content" />
        <ScrollView 
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
        >
            {/* Top Section (Branding) - simplified Left Panel */}
            <View className="bg-black pb-12 px-8 rounded-b-[40px]" style={{ paddingTop: insets.top + 20 }}>
                <Text className="text-white text-3xl font-bold tracking-tighter mb-6">HandyLink.</Text>
                <View>
                    <Text className="text-white text-4xl font-bold leading-tight mb-2">Get things done.</Text>
                    <Text className="text-gray-400 text-lg">Connect with thousands of skilled professionals.</Text>
                </View>
            </View>

            {/* Form Section */}
            <View className="flex-1 px-8 pt-10 pb-8">
                <Text className="text-2xl font-bold text-gray-900 mb-2">Welcome back</Text>
                <Text className="text-gray-500 mb-8">Please enter your details to sign in.</Text>

                <View className="space-y-4">
                    <View>
                        <Text className="text-gray-700 font-medium mb-2">Email</Text>
                        <TextInput 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                            placeholder="Enter your email"
                            placeholderTextColor="#9CA3AF"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View>
                        <Text className="text-gray-700 font-medium mb-2">Password</Text>
                        <TextInput 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                            placeholder="••••••••"
                            placeholderTextColor="#9CA3AF"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    {/* <TouchableOpacity className="items-end">
                        <Text className="text-sm font-medium text-gray-900">Forgot password?</Text>
                    </TouchableOpacity> */}

                    <TouchableOpacity 
                        className="w-full bg-black rounded-xl py-4 items-center mt-4"
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <Text className="text-white font-bold text-lg">
                            {loading ? "Signing in..." : "Sign in"}
                        </Text>
                    </TouchableOpacity>

                    {/* <TouchableOpacity 
                        className="w-full bg-white border border-gray-200 rounded-xl py-4 items-center flex-row justify-center gap-3 mt-2"
                        onPress={() => {}}
                    >
                         {/* Google Icon placeholder 
                        <Text className="text-gray-700 font-medium text-lg">Sign in with Google</Text>
                    </TouchableOpacity> */}
                </View>

                <View className="flex-row justify-center mt-auto pt-8">
                    <Text className="text-gray-500">Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('RegisterChoice')}>
                        <Text className="text-black font-bold">Sign up</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
