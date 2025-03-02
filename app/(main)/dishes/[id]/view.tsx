import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image, Dimensions } from 'react-native';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/services/api';
import Tag from '@/components/tags/Tag';
import RatingStars from '@/components/RatingStars';
import { DishDetailsDTO } from '@/types/dish-dto';

export default function DishDetailScreen() {

  const router = useRouter();
  const { id } = useGlobalSearchParams(); // Obtiene el id desde la ruta
  const [dish, setDish] = useState<DishDetailsDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    fetchDish();
  }, []);

  async function fetchDish() {
    try {
      setIsLoading(true);
      console.log('Fetching dish:', id);
      const response = await api.get(`/dishes/${id}`);
      setDish(response.data.data);
    } catch (error) {
      console.log('Error fetching dish:', error);
      Alert.alert('Error', 'No se pudo cargar la información del plato');
    } finally {
      setIsLoading(false);
    }
  }

  function handleEdit() {
    router.push({
      pathname: '/dishes/[id]/edit',
      params: { id: id?.toString() },
    })
  }

  function handleDelete() {
    Alert.alert(
      'Eliminar Plato',
      '¿Estás seguro de que deseas eliminar este plato?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/dishes/${id}`);
              Alert.alert('Eliminado', 'Plato eliminado correctamente');
              router.back(); // O redirigir a otra pantalla
            } catch (error) {
              console.log('Error deleting Dish:', error);
              Alert.alert('Error', 'No se pudo eliminar el plato');
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

  if (!dish) {
    return (
      <View className="flex-1 justify-center items-center bg-muted p-4">
        <Text className="text-base text-gray-800">No se encontró el Plato</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-muted">
      {/* Carrusel de imágenes */}
      <View>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => {
            const offsetX = e.nativeEvent.contentOffset.x;
            const index = Math.round(offsetX / screenWidth);
            setCurrentImageIndex(index);
          }}
          scrollEventThrottle={16}
        >
          {dish.images.length > 0 ? (
            dish.images.map((img, index) => (
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
                  className="h-48"
                  style={{ width: screenWidth }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))
          ) : (
            <View
              className="bg-gray-400 justify-center items-center"
              style={{ width: screenWidth, height: 200 }}
            >
              <Text className="text-white mt-20">Sin imágenes</Text>
            </View>
          )}
        </ScrollView>

        {/* Puntos de paginación del carrusel */}
        <View className="flex-row justify-center items-center my-2">
          {dish.images.map((_, index) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${currentImageIndex === index ? 'bg-black' : 'bg-gray-300'
                }`}
            />
          ))}
        </View>
      </View>

      {/* Nombre y botones Editar/Eliminar */}
      <View className="flex-row items-center justify-between px-4 mt-4">
        <Text className="text-2xl font-bold text-gray-800 flex-1 mr-2">
          {dish.name}
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

      <View className="bg-white mt-4 mx-4 p-4 rounded-xl">
        <View className="flex-row mb-4">
          {/* Tab Detalles (seleccionado) */}
          <View className="flex-1 items-center">
            <Text className="text-base font-bold text-primary">Detalles</Text>
            <View className="w-full h-1 bg-primary mt-1 " />
          </View>
        </View>

        {/* Sección de Detalles */}
        <Text className="text-base font-bold text-gray-400 mb-2">Restaurante visitado</Text>
        <TouchableOpacity
          className="flex-row items-center py-3 border-b border-gray-200 mb-8"
          onPress={() =>
            router.push({ pathname: '/restaurants/[id]/view', params: { id: dish.restaurant.id } })
          }
        >
          <View className="flex-1">
            <Text className="text-base font-bold text-gray-800">{dish.restaurant.name}</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#999" />
        </TouchableOpacity>

        {/* Precio */}
        <Text className="text-base font-bold text-gray-400 mb-2">Precio</Text>
        {dish.price ? (
          <Text className="text-xl font-bold text-primary mb-4">
            {new Intl.NumberFormat("es-CO", {
              style: "currency",
              currency: "COP",
              minimumFractionDigits: 0,
            }).format(dish.price)}
          </Text>

        ) : (
          <Text className="text-base italic text-gray-500 mb-4">
            Sin precio
          </Text>
        )}

        {/* Comentarios */}
        <Text className="text-base font-bold text-gray-400 mb-2">Comentarios</Text>
        {dish.comments ? (
          <Text className="text-base text-gray-800 mb-4">{dish.comments}</Text>
        ) : (
          <Text className="text-base italic text-gray-500 mb-4">
            Sin comentarios
          </Text>
        )}

        {/* Etiquetas */}
        <Text className="text-base font-bold text-gray-400 mb-2">Etiquetas</Text>
        {dish.tags?.length > 0 ? (
          <View className="flex-row flex-wrap mb-4">
            {dish.tags.map((tag) => (
              <Tag key={tag.id} color={tag.color} name={tag.name} />
            ))}
          </View>
        ) : (
          <Text className="text-base italic text-gray-500 mb-4">
            Sin etiquetas
          </Text>
        )}

        {/* Calificación (estrellas) */}
        <Text className="text-base font-bold text-gray-400 mb-2">Clasificación</Text>
        <View className="flex-row">
          <RatingStars
            value={dish.rating}
            readOnly
          />
        </View>


      </View>
    </ScrollView>
  );
}
