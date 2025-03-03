import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useGlobalSearchParams, useRouter } from 'expo-router';

import FormInput from '@/components/FormInput';
import FormDatePicker from '@/components/FormDatePicker';
import ImagesUploader, { ImageItem } from '@/components/ImagesUploader';
import RestaurantPicker from '@/components/restaurants/RestaurantPicker';
import DishPicker from '@/components/dishes/DishPicker';

import api from '@/services/api';
import { uploadImages } from '@/helpers/upload-images';
import { VisitFormData, visitSchema } from '@/schemas/visit';
import { DishListDTO } from '@/types/dish-dto';
import { parse, format } from 'date-fns';

export default function VisitEditScreen() {
  const { id } = useGlobalSearchParams<{ id: string }>();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VisitFormData>({
    resolver: zodResolver(visitSchema),
  });

  const [selectedDishes, setSelectedDishes] = useState<DishListDTO[]>([]);
  const [selectedImages, setSelectedImages] = useState<ImageItem[]>([]);
  const [removedImages, setRemovedImages] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const restaurantId = watch('restaurant_id');

  useEffect(() => {
    const fetchVisitData = async () => {
      try {
        const response = await api.get(`/visits/${id}`);
        const visitData = response.data.data;

        const parsedDate = parse(visitData.visited_at, "yyyy/MM/dd", new Date());
        const formattedDate = format(parsedDate, "yyyy-MM-dd");

        reset({
          visited_at: formattedDate,
          comments: visitData.comments,
          restaurant_id: visitData.restaurant.id,
          dishes: [],
        });

        setSelectedImages(
          visitData.images.map((img: any) => ({ id: img.id, uri: img.url }))
        );

        const dishesResponse = await api.get(`/visits/${id}/dishes`);
        const visitDishes = dishesResponse.data.data;

        setSelectedDishes(visitDishes);
        setValue("dishes", visitDishes.map((dish: DishListDTO) => dish.id.toString()), { shouldValidate: true });

      } catch (error) {
        Alert.alert('Error', 'No se pudo cargar la visita.');
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisitData();
  }, [id]);

  useEffect(() => {
    setSelectedDishes([]);
    setValue("dishes", []);
  }, [restaurantId]);

  const onSubmit: SubmitHandler<VisitFormData> = async (data) => {
    try {
      const payload = {
        visited_at: data.visited_at,
        comments: data.comments?.trim() || '',
        restaurant_id: data.restaurant_id,
        dishes: selectedDishes.map((dish) => dish.id),
      };

      await api.put(`/visits/${id}`, payload);

      const newImages = selectedImages.filter((image) => !image.id);
      if (newImages.length > 0) {
        await uploadImages(newImages.map((img) => img.uri), "VISIT", Number(id));
      }

      if (removedImages.length > 0) {
        await Promise.all(
          removedImages.map((imageId) => api.delete(`/images/${imageId}`))
        );
      }

      Alert.alert('Éxito', 'Visita actualizada correctamente.');
      router.replace({
        pathname: '/visits/[id]/view',
        params: { id },
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la visita.');
      console.log(error);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-muted justify-center items-center">
        <ActivityIndicator size="large" color="#905c36" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#e5eae0] p-4">
      <Text className="text-2xl font-bold mb-4">Editar visita</Text>

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
          isEdit
          images={selectedImages}
          onChangeImages={setSelectedImages}
          onRemoveExistingImage={(imageId) =>
            setRemovedImages((prev) => [...prev, imageId])
          }
        />

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          className={`mt-4 bg-primary py-3 rounded-md items-center ${isSubmitting ? 'opacity-50' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text className="text-white font-bold">Actualizar</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
