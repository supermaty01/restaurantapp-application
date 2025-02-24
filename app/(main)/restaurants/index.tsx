// app/(main)/restaurants.tsx
import React from 'react';
import { FlatList, TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import RestaurantItem from '@/components/restaurants/RestaurantItem';

interface Tag {
  id: string;
  label: string;
  color: string;
}

interface Restaurant {
  id: string;
  name: string;
  description: string;
  rating: number;
  tags: Tag[];
}

// Datos de ejemplo con nuevos tags
const sampleRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Voraz',
    description: 'Muy elegante y bonito. Me ha gustado siempre.',
    rating: 5,
    tags: [
      { id: 't1', label: 'Carne', color: '#905c36' },
      { id: 't2', label: 'Elegante', color: '#93ae72' },
    ],
  },
  {
    id: '2',
    name: 'Guadalupe',
    description: 'Salchipapas deliciosas y barato.',
    rating: 4,
    tags: [
      { id: 't3', label: 'Mexicano', color: '#e0e374' },
      { id: 't4', label: 'Barato', color: '#cdc8b8' },
    ],
  },
  {
    id: '3',
    name: 'El Pilón',
    description: 'Comida callejera y auténtica.',
    rating: 3,
    tags: [
      { id: 't5', label: 'Callejero', color: '#6b6246' },
      { id: 't6', label: 'Auténtico', color: '#391a07' },
    ],
  },
  // Agrega más restaurantes si lo deseas
];

export default function RestaurantsScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#e5eae0] p-4 relative">
      {/* Encabezado con título y botón de filtro */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-bold text-gray-800">Restaurantes</Text>
        <TouchableOpacity onPress={() => { /* Acción de filtro */ }}>
          <Ionicons name="filter-outline" size={24} color="#905c36" />
        </TouchableOpacity>
      </View>

      {/* Lista scrolleable de restaurantes */}
      <FlatList
        data={sampleRestaurants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RestaurantItem
            name={item.name}
            description={item.description}
            rating={item.rating}
            tags={item.tags}
            onPress={() => {
              // Acción al presionar el restaurante (por ejemplo, navegar a detalles)
            }}
          />
        )}
        showsVerticalScrollIndicator={false}
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
