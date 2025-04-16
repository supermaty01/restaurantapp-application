import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import RestaurantDetails from '@/features/restaurants/components/RestaurantDetails';
import RestaurantVisits from '@/features/restaurants/components/RestaurantVisits';
import RestaurantDishes from '@/features/restaurants/components/RestaurantDishes';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { ImageDisplay } from '@/features/images/components/ImageDisplay';
import { useRestaurantById } from '@/features/restaurants/hooks/useRestaurantById';
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '@/services/db/schema';
import { eq } from 'drizzle-orm/sql';

const Tab = createMaterialTopTabNavigator();

export default function RestaurantDetailScreen() {
  const router = useRouter();
  const { id } = useGlobalSearchParams();
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  const restaurant = useRestaurantById(Number(id));

  function handleEdit() {
    router.push({
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
              await drizzleDb.delete(schema.restaurants).where(eq(schema.restaurants.id, Number(id)));
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
