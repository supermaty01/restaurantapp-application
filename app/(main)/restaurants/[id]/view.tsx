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
import { canDeleteRestaurantPermanently, softDeleteRestaurant } from '@/lib/helpers/soft-delete';

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

  async function handleDelete() {
    try {
      // Verificar si el restaurante puede ser eliminado permanentemente
      const canDeletePermanently = await canDeleteRestaurantPermanently(drizzleDb, Number(id));

      const message = canDeletePermanently
        ? '¿Estás seguro de que deseas eliminar este restaurante? Esta acción no se puede deshacer.'
        : '¿Estás seguro de que deseas eliminar este restaurante? El restaurante seguirá visible en platos y visitas existentes.';

      Alert.alert(
        'Eliminar Restaurante',
        message,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              try {
                if (canDeletePermanently) {
                  // Eliminar permanentemente
                  await drizzleDb.delete(schema.restaurants).where(eq(schema.restaurants.id, Number(id)));
                } else {
                  // Soft delete
                  await softDeleteRestaurant(drizzleDb, Number(id));
                }

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
    } catch (error) {
      console.log('Error checking restaurant references:', error);
      Alert.alert('Error', 'No se pudo verificar las referencias del restaurante');
    }
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
        <View className="flex-1 mr-2">
          <Text className="text-2xl font-bold text-gray-800">
            {restaurant.name}
          </Text>
        </View>
        <View className="flex-row">
          <TouchableOpacity className="bg-primary p-2 rounded-full mr-2" onPress={handleEdit}>
            <Ionicons name="create-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity className="bg-destructive p-2 rounded-full" onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      {restaurant.deleted && (
        <View className="mt-3 mx-4 bg-red-100 px-2 py-2 rounded flex-row gap-2 border-red-600 border-[1px]">
          <Ionicons className="flex" name="warning-outline" size={16} color="#dc2626" />
          <Text className="flex text-red-600 text-sm">Este restaurante ha sido eliminado</Text>
        </View>
      )}

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
