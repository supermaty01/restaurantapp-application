import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
  ScrollView,
  Modal,
} from 'react-native';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/services/api';
import ImageViewer from 'react-native-image-zoom-viewer';
import { RestaurantDetailsDTO } from '@/types/restaurant-dto';
import RestaurantDetails from '@/components/restaurants/RestaurantDetails';
import RestaurantVisits from '@/components/restaurants/RestaurantVisits';
import RestaurantDishes from '@/components/restaurants/RestaurantDishes';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const Tab = createMaterialTopTabNavigator();
const screenWidth = Dimensions.get('window').width;

export default function RestaurantDetailScreen() {
  const router = useRouter();
  const { id } = useGlobalSearchParams();
  const [restaurant, setRestaurant] = useState<RestaurantDetailsDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para el carrusel y visualizador de imágenes
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
                  className="h-56"
                  style={{ width: screenWidth }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))
          ) : (
            <View
              className="bg-gray-400 justify-center items-center h-56"
              style={{ width: screenWidth }}
            >
              <Text className="text-white mt-20">Sin imágenes</Text>
            </View>
          )}
        </ScrollView>

        {/* Puntos de paginación del carrusel */}
        <View className="flex-row justify-center items-center my-2">
          {restaurant.images.map((_, index) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${currentImageIndex === index ? 'bg-black' : 'bg-gray-300'
                }`}
            />
          ))}
        </View>
      </View>

      {/* Visualizador de imágenes expandido con react-native-image-zoom-viewer */}
      <Modal visible={isImageViewerVisible} transparent={true}>
        <ImageViewer
          imageUrls={restaurant.images.map((img) => ({ url: img.url }))}
          index={currentImageIndex}
          onCancel={() => setIsImageViewerVisible(false)}
          enableSwipeDown={true}
          onSwipeDown={() => setIsImageViewerVisible(false)}
          saveToLocalByLongPress={false}
          backgroundColor='rgba(0, 0, 0, 0.9)'
        />
      </Modal>

      {/* Nombre y botones Editar/Eliminar */}
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

      {/* Tabs */}
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
