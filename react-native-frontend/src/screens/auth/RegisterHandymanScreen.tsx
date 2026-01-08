import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import api from '../../services/api';
import { useAuthStore } from '../../stores/useAuthStore';

const RegisterHandymanScreen = () => {
    const navigation = useNavigation();
    const { setToken, setUser } = useAuthStore();
    
    const [form, setForm] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '' // UI usually has confirm, though API might not need it if frontend validates
    });
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!form.full_name || !form.email || !form.phone || !form.password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (form.password.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters');
            return;
        }
        
        // Basic match check (if we add confirm password field)
        // if (form.password !== form.password_confirmation) ...

        setLoading(true);
        try {
            const response = await api.post('/auth/register', {
                full_name: form.full_name,
                email: form.email,
                phone: form.phone,
                password: form.password,
                role: 'handyman'
            });

            if (response.data.token) {
                // Determine flow:
                // 1. Set Token/User -> RootNavigator switches to AppStack -> HandymanDashboard
                // 2. HandymanDashboard sees is_verified !== approved -> Shows "Complete Verification" button
                setToken(response.data.token);
                setUser(response.data.user);
                Alert.alert('Success', 'Account created! Please complete your verification profile.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            const message = error.response?.data?.error || 'Registration failed. Please try again.';
            Alert.alert('Error', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 bg-white" edges={['top', 'bottom']}>
            <ScrollView className="flex-1 px-6">
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    className="mt-4 mb-6 flex-row items-center"
                >
                    <Feather name="arrow-left" size={24} color="gray" />
                    <Text className="ml-2 text-gray-500 font-medium">Back</Text>
                </TouchableOpacity>

                <View className="mb-8">
                    <Text className="text-3xl font-bold text-gray-900">Become a Pro</Text>
                    <Text className="text-gray-500 mt-2 text-base">Earn on your terms. Join the community.</Text>
                </View>

                <View className="space-y-4">
                    <View>
                        <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">Full Name</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900"
                            placeholder="Robert Fox"
                            value={form.full_name}
                            onChangeText={(text) => setForm({...form, full_name: text})}
                        />
                    </View>

                    <View>
                        <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">Email Address</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900"
                            placeholder="name@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={form.email}
                            onChangeText={(text) => setForm({...form, email: text})}
                        />
                    </View>

                    <View>
                        <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">Phone Number</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900"
                            placeholder="+880 1XXX NNNNNN"
                            keyboardType="phone-pad"
                            value={form.phone}
                            onChangeText={(text) => setForm({...form, phone: text})}
                        />
                    </View>

                    <View>
                        <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">Password</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900"
                            placeholder="••••••••"
                            secureTextEntry
                            value={form.password}
                            onChangeText={(text) => setForm({...form, password: text})}
                        />
                        <Text className="text-xs text-gray-400 mt-1 ml-1">At least 8 characters</Text>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleRegister}
                    disabled={loading}
                    className="bg-black rounded-full py-4 mt-8 shadow-lg shadow-gray-300"
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white text-center font-bold text-lg">Submit Application</Text>
                    )}
                </TouchableOpacity>

                <Text className="text-center text-xs text-gray-400 mt-4 px-4 mb-8">
                    By clicking "Submit Application", you agree to our Terms of Service and Privacy Policy.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
};
export default RegisterHandymanScreen;
