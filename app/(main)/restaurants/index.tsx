import React from 'react';
import { FlatList, TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import RestaurantItem from '@/features/restaurants/components/RestaurantItem';
import { useRestaurantList } from '@/features/restaurants/hooks/useRestaurantList';

export default function RestaurantsScreen() {
  const router = useRouter();

  // Solo mostrar restaurantes no eliminados en la lista principal
  const restaurants = useRestaurantList(false);

  return (
    <View className="flex-1 bg-muted dark:bg-dark-muted px-4 pt-2 relative">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-bold text-gray-800 dark:text-gray-200">Restaurantes</Text>
      </View>
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <RestaurantItem
            name={item.name}
            comments={item.comments}
            rating={item.rating}
            tags={item.tags || []}
            imageUrl={item.images && item.images.length > 0 ? item.images[0].uri : undefined}
            onPress={() => router.push({
              pathname: '/restaurants/[id]/view',
              params: { id: item.id },
            })}
          />
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-10">
            <Text className="text-base text-gray-800 dark:text-gray-200">No se encontraron restaurantes.</Text>
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
