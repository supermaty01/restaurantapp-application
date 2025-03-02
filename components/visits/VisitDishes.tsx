import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import api from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { ImageDTO } from '@/types/image-dto';
import { TagDTO } from '@/types/tag-dto';
import { VisitDTO } from '@/types/visit-dto'

interface DishDTO {
  id: number;
  name: string;
  comments: string;
  rating: number;
  tags: TagDTO[];
  images: ImageDTO[];
}

interface VisitDishesProps {
  visit: VisitDTO;
}

export default function VisitDishes({ visit }: VisitDishesProps) {
  const router = useRouter();
  const [dishes, setDishes] = useState<DishDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchDishes = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/visits/${visit.id}/dishes`);
      setDishes(response.data.data);
    } catch (error) {
      console.log('Error fetching dishes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (visit.id) {
      fetchDishes();
    }
  }, [visit.id]);

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
        data={dishes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const imageUrl = item.images && item.images.length > 0 ? item.images[0].url : null;
          return (
            <TouchableOpacity
              className="flex-row items-center py-3 border-b border-gray-200"
              onPress={() =>
                router.push({ pathname: '/dishes/[id]/view', params: { id: item.id } })
              }
            >
              {imageUrl ? (
                <Image
                  source={{ uri: imageUrl }}
                  className="w-14 h-14 rounded mr-3"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-14 h-14 rounded bg-gray-300 mr-3" />
              )}
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-800">{item.name}</Text>
                <Text className="text-sm text-gray-500">{item.comments}</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color="#999" />
            </TouchableOpacity>
          );
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-10">
            <Text className="text-base text-gray-800">No se encontraron platos.</Text>
          </View>
        }
      />
    </View>
  );
}
