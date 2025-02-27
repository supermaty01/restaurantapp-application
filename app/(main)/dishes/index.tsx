import React, { useState, useCallback } from 'react';
import { FlatList, TouchableOpacity, View, Text, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import DishItem from '@/components/dishes/DishItem';
import api from '@/services/api';
import { DishDTO } from '@/types/dish-dto';

export default function DishsScreen() {
  const router = useRouter();
  const [Dishs, setDishs] = useState<DishDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getDishs = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/dishes');
      setDishs(response.data.data);
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
      getDishs();
    }, [])
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#e5eae0] justify-center items-center">
        <ActivityIndicator size="large" color="#905c36" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#e5eae0] p-4 relative">
      {/* Encabezado con título y botón de filtro */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-bold text-gray-800">Platos</Text>
        <TouchableOpacity onPress={() => { /* Acción de filtro */ }}>
          <Ionicons name="filter-outline" size={24} color="#905c36" />
        </TouchableOpacity>
      </View>

      {/* Lista scrolleable de Platos */}
      <FlatList
        data={Dishs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DishItem
            name={item.name}
            comments={item.comments}
            rating={item.rating}
            tags={item.tags}
            onPress={() => router.push({
              pathname: '/dishes/[id]/view',
              params: { id: item.id },
            })}
          />
        )}
        showsVerticalScrollIndicator={false}
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
