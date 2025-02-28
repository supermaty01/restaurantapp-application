import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/services/api';
import { VisitDTO } from '@/types/visit-dto';

export default function VisitDetailScreen() {
  const router = useRouter();
  const { id } = useGlobalSearchParams(); // Obtiene el id desde la ruta
  const [visit, setVisit] = useState<VisitDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    fetchVisit();
  }, []);

  async function fetchVisit() {
    try {
      setIsLoading(true);
      console.log('Fetching visit:', id);
      const response = await api.get(`/visits/${id}`);
      setVisit(response.data.data);
    } catch (error) {
      console.log('Error fetching visit:', error);
      Alert.alert('Error', 'No se pudo cargar la información de la visita');
    } finally {
      setIsLoading(false);
    }
  }

  function handleEdit() {
    router.push(`/visits/${id}/edit`);
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
              await api.delete(`/visits/${id}`);
              Alert.alert('Eliminado', 'Visita eliminada correctamente');
              router.back(); // O redirigir a otra pantalla
            } catch (error) {
              console.log('Error deleting visit:', error);
              Alert.alert('Error', 'No se pudo eliminar la visita');
            }
          },
        },
      ],
      { cancelable: true }
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#e5eae0]">
        <ActivityIndicator size="large" color="#905c36" />
      </View>
    );
  }

  if (!visit) {
    return (
      <View className="flex-1 justify-center items-center bg-[#e5eae0] p-4">
        <Text className="text-base text-gray-800">No se encontró la visita</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#e5eae0]">
      {/* Título y botones Editar/Eliminar */}
      <View className="flex-row items-center justify-between px-4 mt-4">
        <Text className="text-2xl font-bold text-gray-800 flex-1 mr-2">
          Visita a {visit.place}
        </Text>
        <View className="flex-row">
          {/* Botón Editar */}
          <TouchableOpacity
            className="bg-primary p-2 rounded-full mr-2"
            onPress={handleEdit}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
          </TouchableOpacity>
          {/* Botón Eliminar */}
          <TouchableOpacity
            className="bg-destructive p-2 rounded-full"
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sección de Detalles */}
      <View className="bg-white mt-4 mx-4 p-4 rounded-xl">
        <Text className="text-lg font-bold mb-2">Detalles de la visita</Text>

        {/* Fecha */}
        <Text className="text-base text-gray-600 mb-2">
          <Ionicons name="calendar-outline" size={16} /> {visit.date}
        </Text>

        {/* Comentarios */}
        {visit.description ? (
          <Text className="text-base text-gray-800 mb-4">{visit.description}</Text>
        ) : (
          <Text className="text-base italic text-gray-500 mb-4">
            Sin comentarios
          </Text>
        )}
      </View>
    </ScrollView>
  );
}
