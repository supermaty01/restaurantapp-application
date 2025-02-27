import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';

import FormInput from '@/components/FormInput';
import DropdownPicker from '@/components/DropdownPicker'; // Componente para seleccionar restaurante
import ImagesUploader from '@/components/ImagesUploader';
import api from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { uploadImages } from '@/helpers/upload-images';
import { VisitFormData, visitSchema } from '@/schemas/visit';
import { DishDTO } from '@/types/dish-dto';
import { RestaurantDTO } from '@/types/restaurant-dto';
import DishSelectorModal from '@/components/dishes/DishSelectorModal';
import Tag from '@/components/tags/Tag';

export default function VisitEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Obtiene el ID de la visita desde la URL

  const { control, handleSubmit, setValue } = useForm<VisitFormData>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      visited_at: '',
      comments: '',
      restaurant_id: '',
      dishes: [],
    },
  });

  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantDTO | null>(null);
  const [selectedDishes, setSelectedDishes] = useState<DishDTO[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isDishModalVisible, setDishModalVisible] = useState(false);

  // Cargar datos de la visita cuando se abre la pantalla
  useEffect(() => {
    const fetchVisitData = async () => {
      try {
        const response = await api.get(`/visits/${id}`);
        const visit = response.data.data;

        setValue('visited_at', visit.visited_at);
        setValue('comments', visit.comments || '');
        setValue('restaurant_id', visit.restaurant_id);
        setSelectedRestaurant(visit.restaurant);
        setSelectedDishes(visit.dishes || []);
        setSelectedImages(visit.images || []);
      } catch (error) {
        Alert.alert('Error', 'No se pudo cargar la visita');
      }
    };

    if (id) fetchVisitData();
  }, [id]);

  const onSubmit: SubmitHandler<VisitFormData> = async (data) => {
    try {
      const payload = {
        visited_at: data.visited_at,
        comments: data.comments?.trim() || '',
        restaurant_id: selectedRestaurant?.id || null,
        dishes: selectedDishes.map((dish) => dish.id),
      };

      await api.put(`/visits/${id}`, payload);

      if (selectedImages.length > 0) {
        await uploadImages(selectedImages, "VISIT", id);
      }

      Alert.alert('Éxito', 'Visita actualizada correctamente.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo actualizar la visita');
      console.log(error);
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#e5eae0] p-4">
      <Text className="text-2xl font-bold mb-4">Editar visita</Text>

      <View className="bg-white p-4 rounded-md mb-8">
        {/* Fecha */}
        <FormInput
          control={control}
          name="visited_at"
          label="Fecha"
          placeholder="Selecciona la fecha"
        />

        {/* Comentarios */}
        <FormInput
          control={control}
          name="comments"
          label="Comentarios"
          placeholder="Escribe tus comentarios..."
          multiline
          inputClassName="h-auto"
          numberOfLines={4}
        />

        {/* Restaurante */}
        <Text className="text-xl font-semibold text-gray-800 mb-2">Restaurante</Text>
        <DropdownPicker
          selectedValue={selectedRestaurant?.id || ''}
          placeholder="Selecciona una opción..."
          onValueChange={(value) => setSelectedRestaurant(value)}
        />
        <TouchableOpacity
          className="mt-2"
          onPress={() => Alert.alert('Crear restaurante', 'Aquí puedes implementar la lógica para crear uno nuevo')}
        >
          <Text className="text-green-700 underline">¿No lo encuentras? Crea uno nuevo</Text>
        </TouchableOpacity>

        {/* Platos */}
        <Text className="text-xl font-semibold text-gray-800 mt-4">Platos</Text>
        {selectedDishes.length > 0 && (
          <View className="flex-row flex-wrap mt-2">
            {selectedDishes.map((dish) => (
              <View key={dish.id} className="flex-row items-center bg-gray-200 p-2 rounded-md m-1">
                <Text className="text-gray-800 mr-2">{dish.name}</Text>
                <TouchableOpacity onPress={() => setSelectedDishes(selectedDishes.filter(d => d.id !== dish.id))}>
                  <Ionicons name="close-circle" size={20} color="red" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View className="flex-row justify-between mt-2">
          <TouchableOpacity
            className="bg-green-500 py-2 px-4 rounded-md"
            onPress={() => setDishModalVisible(true)}
          >
            <Text className="text-white font-bold">Añadir existente</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-green-700 py-2 px-4 rounded-md"
            onPress={() => Alert.alert('Crear plato', 'Aquí puedes implementar la lógica para crear un nuevo plato')}
          >
            <Text className="text-white font-bold">Crear nuevo plato</Text>
          </TouchableOpacity>
        </View>

        {/* Modal de selección de platos */}
        <DishSelectorModal
          visible={isDishModalVisible}
          onClose={() => setDishModalVisible(false)}
          selectedDishes={selectedDishes}
          onChangeSelected={setSelectedDishes}
        />

        {/* Subida de imágenes */}
        <Text className="text-xl font-semibold text-gray-800 mt-6">Fotos</Text>
        <ImagesUploader
          images={selectedImages}
          onChangeImages={setSelectedImages}
        />

        {/* Botones de acción */}
        <View className="flex-row justify-between mt-4">
          <TouchableOpacity
            className="border border-gray-600 py-3 px-6 rounded-md"
            onPress={() => router.back()}
          >
            <Text className="text-gray-800 font-bold">Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            className="bg-green-700 py-3 px-6 rounded-md"
          >
            <Text className="text-white font-bold">Guardar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
