import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../../services/api';

const CreateGigScreen = () => {
  const navigation = useNavigation();
  // @ts-ignore
  const { params } = useRoute();
  const isEditing = !!params?.gig; 
  const initialData = params?.gig || {};

  const [form, setForm] = useState({
      title: initialData.title || '',
      category_id: initialData.category_id || '',
      price: initialData.price ? String(initialData.price) : '',
      description: initialData.description || '',
      lat: initialData.lat || '',
      lng: initialData.lng || ''
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  // Location Search
  const [searchQuery, setSearchQuery] = useState(initialData.location_name || ''); // Assuming location_name might be passed if editing
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // New Category
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (error) {
       console.error(error);
       // @ts-ignore
       Alert.alert("Error", "Failed to confirm categories");
    } finally {
        setLoadingCategories(false);
    }
  };

  const handleSearchLocation = async (text) => {
      setSearchQuery(text);
      if (text.length < 3) {
          setSearchResults([]);
          return;
      }

      setIsSearching(true);
      try {
          // Nominatim usage policy requires User-Agent
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}`, {
              headers: {
                  'User-Agent': 'MadProjectApp/1.0' 
              }
          });
          const data = await response.json();
          setSearchResults(data);
      } catch (error) {
          console.error(error);
      } finally {
          setIsSearching(false);
      }
  };

  const selectLocation = (result) => {
      setForm({ ...form, lat: parseFloat(result.lat), lng: parseFloat(result.lon) });
      setSearchQuery(result.display_name);
      setSearchResults([]);
  };

  const createCategory = async () => {
      if (!newCategoryName.trim()) return;
      try {
          const res = await api.post('/categories', { name: newCategoryName });
          Alert.alert("Success", "Category added");
          fetchCategories();
          setNewCategoryName('');
          setShowAddCategory(false);
          setForm({ ...form, category_id: res.data.id || '' }); // Auto select if API returns created obj
      } catch (error) {
           Alert.alert("Error", "Failed to add category");
      }
  };

  const handleSubmit = async () => {
      if (!form.title || !form.category_id || !form.price || !form.description || !form.lat || !form.lng) {
          Alert.alert("Missing Fields", "Please fill all fields and select a valid location.");
          return;
      }
      
      setLoading(true);
      try {
          const payload = {
              ...form,
              price: parseFloat(form.price)
          };

          if (isEditing) {
               await api.put(`/gigs/${initialData.id}`, payload);
               Alert.alert("Success", "Gig updated successfully!");
          } else {
               await api.post('/gigs', payload);
               Alert.alert("Success", "Gig published successfully!");
          }
          
          navigation.goBack();
          // Ideally refresh dashboard
      } catch (error) {
          console.error(error);
          Alert.alert("Error", "Operation failed");
      } finally {
          setLoading(false);
      }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-4 py-4 border-b border-gray-100 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigation.goBack()}>
             <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-bold">{isEditing ? 'Edit Service' : 'Create Service'}</Text>
          <View className="w-6" /> 
      </View>

      <ScrollView className="flex-1 px-6 py-6" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
         
         <View className="space-y-6">
             {/* Title */}
             <View>
                 <Text className="text-gray-500 font-bold uppercase text-xs tracking-wider mb-2">Gig Title</Text>
                 <TextInput 
                    className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg font-bold"
                    placeholder="e.g. Expert Plumbing Repair"
                    value={form.title}
                    onChangeText={text => setForm({...form, title: text})}
                 />
             </View>

             {/* Category */}
             <View>
                 <View className="flex-row justify-between items-center mb-2">
                     <Text className="text-gray-500 font-bold uppercase text-xs tracking-wider">Category</Text>
                     <TouchableOpacity onPress={() => setShowAddCategory(!showAddCategory)}>
                         <Text className="text-xs font-bold text-black">+ New Category</Text>
                     </TouchableOpacity>
                 </View>

                 {showAddCategory && (
                     <View className="flex-row gap-2 mb-3">
                         <TextInput 
                            className="flex-1 bg-white border border-gray-300 p-2 rounded-lg text-sm"
                            placeholder="Category Name"
                            value={newCategoryName}
                            onChangeText={setNewCategoryName}
                         />
                         <TouchableOpacity onPress={createCategory} className="bg-black px-4 justify-center rounded-lg">
                             <Text className="text-white font-bold text-xs">Add</Text>
                         </TouchableOpacity>
                     </View>
                 )}

                 <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                     {categories.map((cat) => (
                         <TouchableOpacity
                             key={cat.id}
                             onPress={() => setForm({...form, category_id: cat.id})}
                             className={`mr-2 px-4 py-2 rounded-lg border ${
                                 form.category_id === cat.id ? 'bg-black border-black' : 'bg-white border-gray-200'
                             }`}
                         >
                             <Text className={`font-medium text-sm ${
                                 form.category_id === cat.id ? 'text-white' : 'text-gray-600'
                             }`}>
                                 {cat.name}
                             </Text>
                         </TouchableOpacity>
                     ))}
                 </ScrollView>
             </View>

             {/* Price */}
             <View>
                 <Text className="text-gray-500 font-bold uppercase text-xs tracking-wider mb-2">Base Price (৳)</Text>
                 <TextInput 
                    className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg font-bold"
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={form.price}
                    onChangeText={text => setForm({...form, price: text})}
                 />
             </View>

             {/* Location Search */}
             <View className="relative z-10">
                 <Text className="text-gray-500 font-bold uppercase text-xs tracking-wider mb-2">Service Location</Text>
                 <TextInput 
                    className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-base font-medium"
                    placeholder="Search address..."
                    value={searchQuery}
                    onChangeText={handleSearchLocation}
                 />
                 {isSearching && (
                     <View className="absolute right-4 top-10">
                         <ActivityIndicator color="black" />
                     </View>
                 )}
                 {searchResults.length > 0 && (
                     <View className="absolute top-20 w-full bg-white border border-gray-100 rounded-xl shadow-lg max-h-48 z-50">
                         <FlatList 
                             data={searchResults}
                             keyExtractor={(item) => item.place_id}
                             renderItem={({item}) => (
                                 <TouchableOpacity 
                                     className="p-3 border-b border-gray-50"
                                     onPress={() => selectLocation(item)}
                                 >
                                     <Text className="text-sm text-gray-700">{item.display_name}</Text>
                                 </TouchableOpacity>
                             )}
                             style={{ maxHeight: 200 }}
                         />
                     </View>
                 )}
                 {form.lat && form.lng && (
                     <View className="mt-2 bg-green-50 p-2 rounded-lg self-start">
                         <Text className="text-green-700 text-xs font-bold">Location locked: {form.lat.toFixed(4)}, {form.lng.toFixed(4)}</Text>
                     </View>
                 )}
             </View>

             {/* Description */}
             <View>
                 <Text className="text-gray-500 font-bold uppercase text-xs tracking-wider mb-2">Description</Text>
                 <TextInput 
                    className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-base h-32"
                    placeholder="Describe your service in detail..."
                    multiline
                    textAlignVertical="top"
                    value={form.description}
                    onChangeText={text => setForm({...form, description: text})}
                 />
             </View>

             <TouchableOpacity 
                disabled={loading}
                onPress={handleSubmit}
                className={`w-full py-4 rounded-full mt-4 flex-row justify-center items-center gap-2 ${loading ? 'bg-gray-400' : 'bg-black'}`}
             >
                 {loading && <ActivityIndicator color="white" />}
                 <Text className="text-white font-bold text-lg">{loading ? 'Saving...' : (isEditing ? 'Update Service' : 'Publish Service')}</Text>
             </TouchableOpacity>

         </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateGigScreen;

