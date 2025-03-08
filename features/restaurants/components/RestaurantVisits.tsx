import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import api from '@/services/api';
import { RestaurantDetailsDTO } from '@/features/restaurants/types/restaurant-dto';
import { Ionicons } from '@expo/vector-icons';
import { ImageDTO } from '@/features/images/types/image-dto';

interface DishDTO {
  id: number;
  visited_at: string;
  comments: string;
  images: ImageDTO[];
}

interface RestaurantVisitsProps {
  restaurant: RestaurantDetailsDTO;
}

export default function RestaurantVisits({ restaurant }: RestaurantVisitsProps) {
  const router = useRouter();
  const [visits, setVisits] = useState<DishDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Función para obtener los platos desde el endpoint /restaurants/{id}/visits
  const fetchVisits = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/restaurants/${restaurant.id}/visits`);
      setVisits(response.data.data);
    } catch (error) {
      console.log('Error fetching visits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (restaurant.id) {
      fetchVisits();
    }
  }, [restaurant.id]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-muted justify-center items-center">
        <ActivityIndicator size="large" color="#905c36" />
      </View>
    );
  }

  return (
    <View className="p-4 h-full bg-white">
      <FlatList
        data={visits}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              className="flex-row items-center py-3 border-b border-gray-200"
              onPress={() =>
                router.push({ pathname: '/visits/[id]/view', params: { id: item.id } })
              }
            >
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-800">{item.visited_at}</Text>
                <Text className="text-sm text-gray-500">{item.comments}</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color="#999" />
            </TouchableOpacity>
          );
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-10">
            <Text className="text-base text-gray-800">No se encontraron visitas.</Text>
          </View>
        }
      />
    </View>
  );
}
