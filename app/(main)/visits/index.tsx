import React, { useState, useCallback } from 'react';
import { FlatList, TouchableOpacity, View, Text, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import VisitItem from '@/components/visits/VisitItem';
import api from '@/services/api';
import { VisitDTO } from '@/types/visit-dto';

export default function VisitsScreen() {
  const router = useRouter();
  const [visits, setVisits] = useState<VisitDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getVisits = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('https://restaurantapp-api-production.up.railway.app/api/v1/visits');

      // Mapeo de datos según la estructura esperada en VisitDTO
      const formattedVisits: VisitDTO[] = response.data.data.map((item: any) => ({
        id: item.id,
        date: item.visited_at, // Confirmar con la API si este campo es correcto
        place: item.restaurant_name || "Lugar desconocido",
        description: item.comments || "Sin comentarios",
      }));

      setVisits(formattedVisits);
    } catch (error: any) {
      console.error('Error fetching visits:', error);
      Alert.alert('Error', 'No se pudieron cargar las visitas');
    } finally {
      setIsLoading(false);
    }
  };

  // Se ejecuta cada vez que la pantalla obtiene foco
  useFocusEffect(
    useCallback(() => {
      getVisits();
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
        <Text className="text-2xl font-bold text-gray-800">Visitas</Text>
        <TouchableOpacity onPress={() => { /* Acción de filtro */ }}>
          <Ionicons name="filter-outline" size={24} color="#905c36" />
        </TouchableOpacity>
      </View>

      {/* Lista de visitas */}
      <FlatList
        data={visits}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VisitItem
            date={item.date}
            title={item.place}
            description={item.description}
            onPress={() => router.push({
              pathname: '/visits/[id]/view',
              params: { id: item.id },
            })}
          />
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* Botón para agregar una nueva visita */}
      <TouchableOpacity
        onPress={() => {router.push('/visits/new')
          console.log('Navegar a la pantalla de nueva visita')
        }
      }
        className="absolute bottom-5 right-5 w-12 h-12 bg-primary rounded-full items-center justify-center"
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
