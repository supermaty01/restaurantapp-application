import React from 'react';
import { FlatList, TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DishItem from '@/features/dishes/components/DishItem';
import { useDishList } from '@/features/dishes/hooks/useDishList';

export default function DishesScreen() {
  const router = useRouter();

  const dishes = useDishList();

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
            comments={item.comments}
            rating={item.rating}
            tags={item.tags}
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