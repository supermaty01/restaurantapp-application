import React, { useEffect, useState } from 'react';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/services/api';
import ImageViewer from 'react-native-image-zoom-viewer';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { VisitDTO } from '@/types/visit-dto'
import VisitDetails from '@/components/visits/VisitDetails'
import VisitDishes from '@/components/visits/VisitDishes'

const Tab = createMaterialTopTabNavigator();
const screenWidth = Dimensions.get('window').width;

export default function VisitDetailScreen() {
  const router = useRouter();
  const { id } = useGlobalSearchParams();
  const [visit, setVisit] = useState<VisitDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchVisit();
  }, []);

  async function fetchVisit() {
    try {
      setIsLoading(true);
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
              await api.delete(`/visits/${id}`);
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

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-muted">
        <ActivityIndicator size="large" color="#905c36"/>
      </View>
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

  const parsedDate = parse(visit.visited_at, 'yyyy/MM/dd', new Date());
  const formattedDate = format(parsedDate, "dd 'de' MMMM, yyyy", { locale: es });

  return (
    <View className="flex-1 bg-muted">
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
          {visit.images.length > 0 ? (
            visit.images.map((img, index) => (
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
          {visit.images.map((_, index) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${currentImageIndex === index ? 'bg-black' : 'bg-gray-300'
              }`}
            />
          ))}
        </View>
      </View>

      <Modal visible={isImageViewerVisible} transparent={true}>
        <ImageViewer
          imageUrls={visit.images.map((img) => ({ url: img.url }))}
          index={currentImageIndex}
          onCancel={() => setIsImageViewerVisible(false)}
          enableSwipeDown={true}
          onSwipeDown={() => setIsImageViewerVisible(false)}
          saveToLocalByLongPress={false}
          backgroundColor="rgba(0, 0, 0, 0.9)"
        />
      </Modal>

      <View className="flex-row items-center justify-between px-4 mt-4">
        <Text className="text-2xl font-bold text-gray-800 flex-1 mr-2">
          {formattedDate}
        </Text>
        <View className="flex-row">
          <TouchableOpacity className="bg-primary p-2 rounded-full mr-2" onPress={handleEdit}>
            <Ionicons name="create-outline" size={20} color="#fff"/>
          </TouchableOpacity>
          <TouchableOpacity className="bg-destructive p-2 rounded-full" onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color="#fff"/>
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
            {() => <VisitDetails visit={visit}/>}
          </Tab.Screen>
          <Tab.Screen name="Dishes" options={{ tabBarLabel: 'Platos' }}>
            {() => <VisitDishes visit={visit}/>}
          </Tab.Screen>
        </Tab.Navigator>
      </View>
    </View>
  );
}
