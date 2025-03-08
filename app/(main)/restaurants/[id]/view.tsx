import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/services/api';
import { RestaurantDetailsDTO } from '@/types/restaurant-dto';
import RestaurantDetails from '@/features/restaurants/components/RestaurantDetails';
import RestaurantVisits from '@/features/restaurants/components/RestaurantVisits';
import RestaurantDishes from '@/features/restaurants/components/RestaurantDishes';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { ImageDisplay } from '@/features/images/components/ImageDisplay';

const Tab = createMaterialTopTabNavigator();

export default function RestaurantDetailScreen() {
  const router = useRouter();
  const { id } = useGlobalSearchParams();
  const [restaurant, setRestaurant] = useState<RestaurantDetailsDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRestaurant();
  }, []);

  async function fetchRestaurant() {
    try {
      setIsLoading(true);
      const response = await api.get(`/restaurants/${id}`);
      setRestaurant(response.data.data);
    } catch (error) {
      console.log('Error fetching restaurant:', error);
      Alert.alert('Error', 'No se pudo cargar la información del restaurante');
    } finally {
      setIsLoading(false);
    }
  }

  function handleEdit() {
    router.replace({
      pathname: '/restaurants/[id]/edit',
      params: { id: id?.toString() },
    });
  }

  function handleDelete() {
    Alert.alert(
      'Eliminar Restaurante',
      '¿Estás seguro de que deseas eliminar este restaurante?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/restaurants/${id}`);
              Alert.alert('Eliminado', 'Restaurante eliminado correctamente');
              router.back();
            } catch (error) {
              console.log('Error deleting restaurant:', error);
              Alert.alert('Error', 'No se pudo eliminar el restaurante');
            }
          },
        },
      ],
      { cancelable: true }
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-muted justify-center items-center">
        <ActivityIndicator size="large" color="#905c36" />
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View className="flex-1 justify-center items-center bg-muted p-4">
        <Text className="text-base text-gray-800">
          No se encontró el restaurante
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-muted">
      <ImageDisplay images={restaurant.images} />

      <View className="flex-row items-center justify-between px-4 mt-4">
        <Text className="text-2xl font-bold text-gray-800 flex-1 mr-2">
          {restaurant.name}
        </Text>
        <View className="flex-row">
          <TouchableOpacity className="bg-primary p-2 rounded-full mr-2" onPress={handleEdit}>
            <Ionicons name="create-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity className="bg-destructive p-2 rounded-full" onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="bg-white mt-4 mx-4 rounded-xl flex-1 overflow-hidden mb-4">
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#93AE72',
            tabBarInactiveTintColor: '#6b7280',
            tabBarIndicatorStyle: { backgroundColor: '#93AE72', height: 3 },
            tabBarLabelStyle: { fontSize: 16, fontWeight: 'bold' },
            tabBarStyle: { backgroundColor: 'white' },
          }}
        >
          <Tab.Screen name="Details" options={{ tabBarLabel: 'Detalles' }}>
            {() => <RestaurantDetails restaurant={restaurant} />}
          </Tab.Screen>
          <Tab.Screen name="Visits" options={{ tabBarLabel: 'Visitas' }}>
            {() => <RestaurantVisits restaurant={restaurant} />}
          </Tab.Screen>
          <Tab.Screen name="Dishes" options={{ tabBarLabel: 'Platos' }}>
            {() => <RestaurantDishes restaurant={restaurant} />}
          </Tab.Screen>
        </Tab.Navigator>
      </View>
    </View>
  );
}
