import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import api from '../../services/api';

const HandymanVerificationScreen = () => {
    const navigation = useNavigation();
    
    const [form, setForm] = useState({
        bio: '',
        experience_years: '',
        skills: ''
    });
    const [document, setDocument] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'application/pdf'],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setDocument(result.assets[0]);
            }
        } catch (err) {
            console.error('Document picker error:', err);
            Alert.alert('Error', 'Failed to pick document');
        }
    };

    const handleSubmit = async () => {
        if (!form.bio || !form.experience_years || !form.skills) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        /* 
           Ideally, we should reinforce document upload, maybe not strictly required by model/db 
           but conceptually required for verification. 
           The vue component implies it's optional in UI ("Identity Verification" label) 
           but let's look at vue code: 
             formData.append('document', file.value) 
           It appends if file.value exists. 
           However, let's assume it helps.
        */
        
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('bio', form.bio);
            formData.append('experience_years', form.experience_years);
            formData.append('skills', form.skills);
            
            if (document) {
                // @ts-ignore
                formData.append('document', {
                    uri: document.uri,
                    name: document.name || 'verification_doc',
                    type: document.mimeType || 'application/octet-stream'
                });
            }

            await api.post('/handyman/verify', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            Alert.alert('Success', 'Profile submitted for verification!', [
                { text: 'OK', onPress: () => navigation.goBack() } 
            ]);

        } catch (error) {
            console.error('Verification error:', error);
            const message = error.response?.data?.error || 'Submission failed. Please try again.';
            Alert.alert('Error', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
            <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <Feather name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Verification Steps</Text>
            </View>

            <ScrollView className="flex-1 px-6 pt-6 pb-20">
                <View className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <Text className="text-blue-800 font-bold mb-1">Complete your profile</Text>
                    <Text className="text-blue-600 text-sm">
                        Please provide your professional details and ID to get approved for jobs.
                    </Text>
                </View>

                <View className="space-y-5">
                    <View>
                        <View className="flex-row justify-between mb-2">
                             <Text className="text-sm font-bold text-gray-900">Professional Bio</Text>
                             <View className="bg-gray-100 px-2 py-0.5 rounded">
                                 <Text className="text-xs text-gray-500 font-bold">Required</Text>
                             </View>
                        </View>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 min-h-[100px] text-base"
                            placeholder="Hi! I'm a certified electrician with 5 years of experience..."
                            multiline
                            textAlignVertical="top"
                            value={form.bio}
                            onChangeText={(text) => setForm({...form, bio: text})}
                        />
                    </View>

                    <View>
                        <Text className="text-sm font-bold text-gray-900 mb-2">Years of Experience</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900"
                            placeholder="e.g. 5"
                            keyboardType="numeric"
                            value={form.experience_years}
                            onChangeText={(text) => setForm({...form, experience_years: text})}
                        />
                    </View>

                    <View>
                        <Text className="text-sm font-bold text-gray-900 mb-2">Skills / Specializations</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900"
                            placeholder="Wiring, Panel Upgrade, Lighting (separate by comma)"
                            value={form.skills}
                            onChangeText={(text) => setForm({...form, skills: text})}
                        />
                        <Text className="text-xs text-gray-400 mt-1 ml-1">E.g. Plumbing, Electrical, Cleaning</Text>
                    </View>

                    <View className="pt-2">
                         <Text className="text-sm font-bold text-gray-900 mb-3">Identity Verification ID/Cert</Text>
                         <TouchableOpacity 
                            onPress={pickDocument}
                            className="border-2 border-dashed border-gray-200 rounded-xl p-8 items-center bg-gray-50/50 active:bg-gray-100"
                         >
                            {document ? (
                                <View className="items-center">
                                    <View className="h-12 w-12 bg-green-100 rounded-full items-center justify-center mb-3">
                                        <Feather name="check" size={24} color="#16A34A" />
                                    </View>
                                    <Text className="font-bold text-gray-900 text-center mb-1">{document.name}</Text>
                                    <Text className="text-gray-500 text-xs text-center">{(document.size / 1024).toFixed(0)} KB</Text>
                                    <Text className="text-blue-600 font-bold text-xs mt-3">Change File</Text>
                                </View>
                            ) : (
                                <View className="items-center">
                                    <View className="h-12 w-12 bg-white rounded-full items-center justify-center mb-3 shadow-sm">
                                        <Feather name="upload-cloud" size={24} color="#9CA3AF" />
                                    </View>
                                    <Text className="font-medium text-gray-600 text-center">Click to upload document</Text>
                                    <Text className="text-gray-400 text-xs mt-1 text-center font-bold">PDF, JPG, PNG up to 5MB</Text>
                                </View>
                            )}
                         </TouchableOpacity>
                    </View>
                </View>
                
                <View className="h-20" /> 
            </ScrollView>
            
            <View className="p-4 border-t border-gray-100 bg-white absolute bottom-0 w-full pb-8">
                 <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading}
                    className="bg-black rounded-full py-4 shadow-lg"
                 >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                         <Text className="text-white text-center font-bold text-lg">Submit for Review</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};
export default HandymanVerificationScreen;
