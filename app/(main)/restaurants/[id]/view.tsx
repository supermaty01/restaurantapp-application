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
import Tag from '@/components/tags/Tag';
import RatingStars from '@/components/RatingStars';
import { RestaurantDTO } from '@/types/restaurant-dto';
import ImageViewing from 'react-native-image-viewing';

export default function RestaurantDetailScreen() {
  const router = useRouter();
  const { id } = useGlobalSearchParams();
  const [restaurant, setRestaurant] = useState<RestaurantDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para el visualizador de imágenes
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    fetchRestaurant();
  }, []);

  async function fetchRestaurant() {
    try {
      setIsLoading(true);
      console.log('Fetching restaurant:', id);
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
    router.push({
      pathname: '/restaurants/[id]/edit',
      params: { id: id.toString() },
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
              router.back(); // O redirigir a otra pantalla
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
      <View className="flex-1 justify-center items-center bg-[#e5eae0]">
        <ActivityIndicator size="large" color="#905c36" />
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View className="flex-1 justify-center items-center bg-[#e5eae0] p-4">
        <Text className="text-base text-gray-800">No se encontró el restaurante</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#e5eae0]">
      {/* Carrusel de imágenes */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      >
        {restaurant.images.length > 0 ? (
          restaurant.images.map((img, index) => (
            <TouchableOpacity
              key={img.id}
              activeOpacity={0.8}
              onPress={() => {
                setCurrentImageIndex(index);
                setIsImageViewerVisible(true);
              }}
            >
              <Image
                source={{ uri: img.url }}
                style={{ width: screenWidth, height: 200 }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))
        ) : (
          <View style={{ width: screenWidth, height: 200, backgroundColor: '#ccc' }}>
            <Text className="text-center text-white mt-20">Sin imágenes</Text>
          </View>
        )}
      </ScrollView>

      {/* Visualizador de imágenes expandido */}
      <ImageViewing
        images={restaurant.images.map(img => ({ uri: img.url }))}
        imageIndex={currentImageIndex}
        visible={isImageViewerVisible}
        onRequestClose={() => setIsImageViewerVisible(false)}
      />

      {/* Nombre y botones Editar/Eliminar */}
      <View className="flex-row items-center justify-between px-4 mt-4">
        <Text className="text-2xl font-bold text-gray-800 flex-1 mr-2">
          {restaurant.name}
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

      {/* Tabs (por ahora solo "Detalles") */}
      <View className="bg-white mt-4 mx-4 p-4 rounded-xl">
        <View className="flex-row mb-4">
          {/* Tab Detalles (seleccionado) */}
          <View className="flex-1 items-center">
            <Text className="text-base font-bold text-primary">Detalles</Text>
            <View className="w-3 h-1 bg-primary mt-1" />
          </View>
          {/* Tab Visitas */}
          <View className="flex-1 items-center">
            <Text className="text-base text-gray-500">Visitas</Text>
          </View>
          {/* Tab Platos */}
          <View className="flex-1 items-center">
            <Text className="text-base text-gray-500">Platos</Text>
          </View>
        </View>

        {/* Sección de Detalles */}
        {/* Descripción */}
        {restaurant.comments ? (
          <Text className="text-base text-gray-800 mb-4">{restaurant.comments}</Text>
        ) : (
          <Text className="text-base italic text-gray-500 mb-4">
            Sin descripción
          </Text>
        )}

        {/* Etiquetas */}
        {restaurant.tags?.length > 0 ? (
          <View className="flex-row flex-wrap mb-4">
            {restaurant.tags.map((tag) => (
              <Tag key={tag.id} color={tag.color} name={tag.name} />
            ))}
          </View>
        ) : (
          <Text className="text-sm italic text-gray-500 mb-4">
            Sin etiquetas
          </Text>
        )}

        {/* Calificación (estrellas) */}
        <View className="flex-row">
          <RatingStars
            value={restaurant.rating}
            readOnly
          />
        </View>
      </View>
    </ScrollView>
  );
}
