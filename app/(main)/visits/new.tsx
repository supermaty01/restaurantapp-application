import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import FormInput from '@/components/FormInput';
import FormDatePicker from '@/components/FormDatePicker';
import ImagesUploader from '@/components/ImagesUploader';
import RestaurantPicker from '@/components/restaurants/RestaurantPicker';

import api from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { uploadImages } from '@/helpers/upload-images';
import { VisitFormData, visitSchema } from '@/schemas/visit';
import { RestaurantDTO } from '@/types/restaurant-dto';
import { DishDTO } from '@/types/dish-dto';

export default function NewVisitScreen() {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<VisitFormData>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      visited_at: new Date().toISOString().split('T')[0],
      comments: '',
      restaurant_id: undefined,
    },
  });

  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantDTO | null>(null);
  const [selectedDishes, setSelectedDishes] = useState<DishDTO[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isDishModalVisible, setDishModalVisible] = useState(false);

  const onSubmit: SubmitHandler<VisitFormData> = async (data) => {
    try {
      const payload = {
        visited_at: data.visited_at,
        comments: data.comments?.trim() || '',
        restaurant_id: selectedRestaurant?.id || null,
        dishes: selectedDishes.map((dish) => dish.id),
      };

      const response = await api.post('/visits', payload);
      const visitId = response.data.data.id;

      if (selectedImages.length > 0) {
        await uploadImages(selectedImages, "VISIT", visitId);
      }

      Alert.alert('Éxito', 'Visita creada correctamente.');
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo crear la visita');
      console.log(error);
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#e5eae0] p-4">
      <Text className="text-2xl font-bold mb-4">Añadir visita</Text>

      <View className="bg-white p-4 rounded-md mb-8">
        <FormDatePicker control={control} name="visited_at" label="Fecha" />

        <FormInput
          control={control}
          name="comments"
          label="Comentarios"
          placeholder="Escribe tus comentarios..."
          multiline
          inputClassName="h-auto"
          numberOfLines={4}
        />

        <RestaurantPicker 
          control={control} 
          setValue={setValue} 
          name="restaurant_id" 
          label="Restaurante" 
          errors={errors} 
        />

        <Text className="text-xl font-semibold text-gray-800 mt-2">Platos</Text>
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
            className="bg-primary py-2 px-4 rounded-md"
            onPress={() => setDishModalVisible(true)}
          >
            <Text className="text-white font-bold">Añadir existente</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-primary py-2 px-4 rounded-md"
            onPress={() => Alert.alert('Crear plato', 'Aquí puedes implementar la lógica para crear un nuevo plato')}
          >
            <Text className="text-white font-bold">Crear nuevo plato</Text>
          </TouchableOpacity>
        </View>

        <ImagesUploader
          images={selectedImages}
          onChangeImages={setSelectedImages}
        />

        <View className="flex-row justify-between mt-4">
          <TouchableOpacity
            className="border border-gray-600 py-2 px-4 rounded-md"
            onPress={() => Alert.alert('Cancelar', '¿Seguro que quieres cancelar?')}
          >
            <Text className="text-gray-800 font-bold">Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            className="bg-primary py-2 px-4 rounded-md"
          >
            <Text className="text-white font-bold">Guardar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
