import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Picker } from '@react-native-picker/picker';

import FormInput from '@/components/FormInput';
import RatingStars from '@/components/RatingStars';
import TagSelectorModal from '@/components/tags/TagSelectorModal';
import ImagesUploader from '@/components/ImagesUploader';
import api from '@/services/api';
import { TagDTO } from '@/types/tag-dto';
import { RestaurantDTO } from '@/types/restaurant-dto';
import Tag from '@/components/tags/Tag';
import { Ionicons } from '@expo/vector-icons';
import { uploadImages } from '@/helpers/upload-images';
import { DishFormData, dishSchema } from '@/schemas/dish';

export default function DishCreateScreen() {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DishFormData>({
    resolver: zodResolver(dishSchema),
    defaultValues: {
      name: '',
      restaurant_id: undefined,
      comments: '',
      price: undefined,
      rating: undefined,
    },
  });

  const [selectedTags, setSelectedTags] = useState<TagDTO[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isTagModalVisible, setTagModalVisible] = useState(false);
  const [restaurants, setRestaurants] = useState<RestaurantDTO[]>([]);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(true);

  // Fetch restaurants for dropdown
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setIsLoadingRestaurants(true);
        const response = await api.get('/restaurants');
        setRestaurants(response.data.data);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        Alert.alert('Error', 'No se pudieron cargar los restaurantes');
      } finally {
        setIsLoadingRestaurants(false);
      }
    };

    fetchRestaurants();
  }, []);

  const onSubmit: SubmitHandler<DishFormData> = async (data) => {
    try {
      const payload = {
        name: data.name.trim(),
        restaurant_id: data.restaurant_id,
        comments: data.comments?.trim() || '',
        price: typeof data.price === 'string' ? parseFloat(String(data.price).replace(',', '.')) : data.price ?? undefined,
        rating: data.rating || null,
        tags: selectedTags.map((tag) => tag.id),
      };

      const response = await api.post('/dishes', payload);
      const dishId = response.data.data.id;

      if (selectedImages.length > 0) {
        await uploadImages(selectedImages, "DISH", dishId);
      }

      Alert.alert('Éxito', 'Plato creado correctamente.');
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo crear el plato');
      console.log(error);
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#e5eae0] p-4">
      <Text className="text-2xl font-bold mb-4">Añadir plato</Text>

      <View className="bg-white p-4 rounded-md mb-8">
        {/* Nombre */}
        <FormInput
          control={control}
          name="name"
          label="Nombre"
          placeholder="Ingresa el nombre"
        />

        {/* Comentarios (opcional) */}
        <FormInput
          control={control}
          name="comments"
          label="Comentarios"
          placeholder="Ejemplo: Bastante cantidad, buen sabor..."
          multiline
          inputClassName="h-auto"
          numberOfLines={4}
        />

        {/* Restaurante (dropdown) */}
        <View className="mb-4">
          <Text className="text-xl font-semibold text-gray-800 mb-2">Restaurante</Text>
          {isLoadingRestaurants ? (
            <View className="h-12 bg-gray-100 rounded-md justify-center items-center">
              <Text>Cargando restaurantes...</Text>
            </View>
          ) : (
            <Controller
              control={control}
              name="restaurant_id"
              render={({ field: { onChange, value } }) => (
                <View className="border border-gray-300 rounded-md overflow-hidden">
                  <Picker
                    selectedValue={value}
                    onValueChange={(itemValue) => onChange(Number(itemValue))}
                    style={{ height: 50 }}
                  >
                    <Picker.Item label="Selecciona un restaurante" value={undefined} />
                    {restaurants.map((restaurant) => (
                      <Picker.Item
                        key={restaurant.id}
                        label={restaurant.name}
                        value={restaurant.id}
                      />
                    ))}
                  </Picker>
                </View>
              )}
            />
          )}
          {errors.restaurant_id && (
            <Text className="text-red-500 mt-1">{errors.restaurant_id.message}</Text>
          )}
        </View>

        {/* Precio */}
        <View className="mb-4">
          <Text className="text-xl font-semibold text-gray-800 mb-2">Precio</Text>
          <Controller
            control={control}
            name="price"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <FormInput
                  control={control}
                  name="price"
                  placeholder="Ingresa el precio"
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    // Allow only numbers and one decimal point
                    const cleanedText = text.replace(/[^0-9.,]/g, '');
                    onChange(cleanedText);
                  }}
                  value={value?.toString()}
                />
              </View>
            )}
          />
          {errors.price && (
            <Text className="text-red-500 mt-1">{errors.price.message}</Text>
          )}
        </View>

        {/* Rating (opcional) */}
        <Text className="text-xl font-semibold text-gray-800 mb-2">Calificación</Text>
        <View className="flex justify-center items-center">
          <RatingStars
            control={control}
            name="rating"
          />
        </View>

        {/* Tags */}
        <View className="flex-row items-center justify-between mt-4">
          <Text className="text-xl font-semibold text-gray-800">Etiquetas</Text>
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => setTagModalVisible(true)}
          >
            <View className="bg-primary rounded-full p-2">
              <Ionicons name="add" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
        {selectedTags.length > 0 && (
          <View className="flex-row flex-wrap mt-2">
            {selectedTags.map((tag) => (
              <Tag name={tag.name} color={tag.color} key={tag.id} />
            ))}
          </View>
        )}
        <TagSelectorModal
          visible={isTagModalVisible}
          onClose={() => setTagModalVisible(false)}
          selectedTags={selectedTags}
          onChangeSelected={setSelectedTags}
        />

        {/* Imágenes (solo se seleccionan, no se suben aún) */}
        <ImagesUploader
          images={selectedImages}
          onChangeImages={setSelectedImages}
        />

        {/* Botón para crear plato */}
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          className="mt-4 bg-primary py-3 rounded-md items-center"
        >
          <Text className="text-white font-bold">Guardar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}