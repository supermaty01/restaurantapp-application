import React, { useState, useCallback } from 'react';
import { FlatList, TouchableOpacity, View, Text, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import DishItem from '@/components/dishes/DishItem';
import api from '@/services/api';
import { DishListDTO } from '@/types/dish-dto';

export default function DishesScreen() {
  const router = useRouter();
  const [dishes, setDishes] = useState<DishListDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getDishes = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/dishes');
      setDishes(response.data.data);
    } catch (error: any) {
      console.error('Error fetching platos:', error);
      Alert.alert('Error', 'No se pudieron cargar los platos');
    } finally {
      setIsLoading(false);
    }
  };

  // Se llama cada vez que la pantalla obtiene foco
  useFocusEffect(
    useCallback(() => {
      getDishes();
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
      {/* Encabezado con título y botón de filtro */}
      <View className="flex-row items-center justify-start mb-4">
        <Text className="text-2xl font-bold text-gray-800">Platos</Text>
      </View>

      {/* Lista scrolleable de Platos */}
      <FlatList
        data={dishes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <DishItem
            name={item.name}
            comments={item.comments || ""}
            rating={item.rating || 0}
            tags={item.tags || []}
            images={item.images}
            onPress={() => router.push({
              pathname: '/dishes/[id]/view',
              params: { id: item.id },
            })}
          />
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-10">
            <Text className="text-base text-gray-800">No se encontraron platos.</Text>
          </View>
        }
      />
      <TouchableOpacity
        onPress={() => router.push('/dishes/new')}
        className="absolute bottom-5 right-5 w-12 h-12 bg-primary rounded-full items-center justify-center"
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}