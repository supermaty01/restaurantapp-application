import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormInput from '@/components/FormInput';
import FormDatePicker from '@/components/FormDatePicker';
import ImagesUploader from '@/features/images/components/ImagesUploader';
import RestaurantPicker from '@/features/restaurants/components/RestaurantPicker';
import DishPicker from '@/features/dishes/components/DishPicker';
import api from '@/services/api';
import { VisitFormData, visitSchema } from '@/features/visits/schemas/visit-schema';
import { DishListDTO } from '@/features/dishes/types/dish-dto';
import { router } from 'expo-router';
import { uploadImages } from '@/lib/helpers/upload-images';

export default function VisitCreateScreen() {
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VisitFormData>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      visited_at: new Date().toISOString().split('T')[0],
      comments: '',
      restaurant_id: undefined,
      dishes: [],
    },
  });

  const [selectedDishes, setSelectedDishes] = useState<DishListDTO[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const restaurantId = watch('restaurant_id');

  useEffect(() => {
    setSelectedDishes([]);
  }, [restaurantId]);

  const onSubmit: SubmitHandler<VisitFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        visited_at: data.visited_at,
        comments: data.comments?.trim() || "",
        restaurant_id: data.restaurant_id,
        dishes: selectedDishes.map((dish) => dish.id),
      };

      const response = await api.post('/visits', payload);
      const visitId = response.data.data.id;

      if (selectedImages.length > 0) {
        await uploadImages(selectedImages, "VISIT", visitId);
      }

      Alert.alert('Éxito', 'Visita creada correctamente.');

      router.back();
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo crear la visita');
      console.log(error);
    } finally {
      setIsSubmitting(false);
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

        <DishPicker
          control={control}
          name="dishes"
          setValue={setValue}
          restaurantId={restaurantId}
          errors={errors}
          selectedDishes={selectedDishes}
          setSelectedDishes={setSelectedDishes}
        />

        <ImagesUploader
          images={selectedImages}
          onChangeImages={setSelectedImages}
        />

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          className={`mt-4 bg-primary py-3 rounded-md items-center ${isSubmitting ? 'opacity-50' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text className="text-white font-bold">Guardar</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
