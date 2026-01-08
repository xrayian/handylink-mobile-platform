import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import api from '../../services/api';
import { useAuthStore } from '../../stores/useAuthStore';

const RegisterCustomerScreen = () => {
    const navigation = useNavigation();
    const { setToken, setUser } = useAuthStore();
    
    const [form, setForm] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: ''
    });
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!form.full_name || !form.email || !form.phone || !form.password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (form.password !== form.password_confirmation) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/register', {
                ...form,
                role: 'customer'
            });

            if (response.data.token) {
                setToken(response.data.token);
                setUser(response.data.user);
                Alert.alert('Success', 'Account created successfully!', [
                    { text: 'OK' } // Navigation will be handled by auth state change usually, or we can force it
                ]);
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
        <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
            <ScrollView className="flex-1 px-6">
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    className="mt-4 mb-6 flex-row items-center"
                >
                    <Feather name="arrow-left" size={24} color="gray" />
                    <Text className="ml-2 text-gray-500 font-medium">Back</Text>
                </TouchableOpacity>

                <View className="mb-8">
                    <Text className="text-3xl font-bold text-gray-900">Create Client Account</Text>
                    <Text className="text-gray-500 mt-2 text-base">Enter your details to get started.</Text>
                </View>

                <View className="space-y-4">
                    <View>
                        <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">Full Name</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900"
                            placeholder="John Doe"
                            value={form.full_name}
                            onChangeText={(text) => setForm({...form, full_name: text})}
                        />
                    </View>

                    <View>
                        <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">Email Address</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900"
                            placeholder="john@example.com"
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
                            placeholder="+8801700000000"
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
                    </View>

                    <View>
                        <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">Confirm Password</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900"
                            placeholder="••••••••"
                            secureTextEntry
                            value={form.password_confirmation}
                            onChangeText={(text) => setForm({...form, password_confirmation: text})}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleRegister}
                    disabled={loading}
                    className="bg-black rounded-xl py-4 mt-8 shadow-md"
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white text-center font-bold text-lg">Sign Up</Text>
                    )}
                </TouchableOpacity>

                <Text className="text-center text-xs text-gray-400 mt-4 px-4 mb-8">
                    By clicking "Sign Up", you agree to our Terms of Service and Privacy Policy.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
};
export default RegisterCustomerScreen;
