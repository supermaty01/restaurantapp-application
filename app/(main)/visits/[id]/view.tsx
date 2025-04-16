import React from 'react';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Alert,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import VisitDetails from '@/features/visits/components/VisitDetails'
import VisitDishes from '@/features/visits/components/VisitDishes'
import { ImageDisplay } from '@/features/images/components/ImageDisplay';
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '@/services/db/schema';
import { eq } from 'drizzle-orm/sql';
import { useVisitById } from '@/features/visits/hooks/useVisitById';

const Tab = createMaterialTopTabNavigator();

export default function VisitDetailScreen() {
  const router = useRouter();
  const { id } = useGlobalSearchParams();
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  const visit = useVisitById(Number(id));

  function handleEdit() {
    router.replace({
      pathname: '/visits/[id]/edit',
      params: { id: id?.toString() },
    });
  }

  function handleDelete() {
    Alert.alert(
      'Eliminar Visita',
      '¿Estás seguro de que deseas eliminar esta visita?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await drizzleDb.delete(schema.visits).where(eq(schema.visits.id, Number(id)));
              Alert.alert('Eliminada', 'Visita eliminada correctamente');
              router.back();
            } catch (error) {
              console.log('Error deleting visit:', error);
              Alert.alert('Error', 'No se pudo eliminar la visita');
            }
          },
        },
      ],
      { cancelable: true },
    );
  }



  if (!visit) {
    return (
      <View className="flex-1 justify-center items-center bg-muted p-4">
        <Text className="text-base text-gray-800">
          No se encontró la visita
        </Text>
      </View>
    );
  }

  const parsedDate = parse(visit.visited_at, 'yyyy-MM-dd', new Date());
  const formattedDate = format(parsedDate, "dd 'de' MMMM, yyyy", { locale: es });

  return (
    <View className="flex-1 bg-muted">
      <ImageDisplay images={visit.images} />

      <View className="flex-row items-center justify-between px-4 mt-4">
        <Text className="text-2xl font-bold text-gray-800 flex-1 mr-2">
          {formattedDate}
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
            {() => <VisitDetails visit={visit} />}
          </Tab.Screen>
          <Tab.Screen name="Dishes" options={{ tabBarLabel: 'Platos' }}>
            {() => <VisitDishes visit={visit} />}
          </Tab.Screen>
        </Tab.Navigator>
      </View>
    </View>
  );
}
