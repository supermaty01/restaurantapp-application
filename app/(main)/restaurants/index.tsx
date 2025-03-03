import React, { useState, useCallback } from 'react';
import { FlatList, TouchableOpacity, View, Text, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import RestaurantItem from '@/components/restaurants/RestaurantItem';
import api from '@/services/api';
import { RestaurantListDTO } from '@/types/restaurant-dto';

export default function RestaurantsScreen() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<RestaurantListDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getRestaurants = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/restaurants');
      setRestaurants(response.data.data);
    } catch (error: any) {
      console.log('Error fetching restaurants:', error);
      Alert.alert('Error', 'No se pudieron cargar los restaurantes');
    } finally {
      setIsLoading(false);
    }
  };

  // Se llama cada vez que la pantalla obtiene foco
  useFocusEffect(
    useCallback(() => {
      getRestaurants();
    }, [])
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-muted justify-center items-center">
        <ActivityIndicator size="large" color="#905c36" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-muted px-4 pt-2 relative">
      {/* Encabezado con título y botón de filtro (Version 2.0) :'c */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-bold text-gray-800">Restaurantes</Text>
        {/*<TouchableOpacity>
          <Ionicons name="filter-outline" size={24} color="#905c36" />
        </TouchableOpacity>*/}
      </View>

      {/* Lista scrolleable de restaurantes */}
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <RestaurantItem
            name={item.name}
            comments={item.comments}
            rating={item.rating}
            tags={item.tags}
            onPress={() => router.push({
              pathname: '/restaurants/[id]/view',
              params: { id: item.id },
            })}
          />
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-10">
            <Text className="text-base text-gray-800">No se encontraron restaurantes.</Text>
          </View>
        }
      />
      <TouchableOpacity
        onPress={() => router.push('/restaurants/new')}
        className="absolute bottom-5 right-5 w-12 h-12 bg-primary rounded-full items-center justify-center"
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
