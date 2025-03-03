import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormInput from '@/components/FormInput';
import RatingStars from '@/components/RatingStars';
import TagSelectorModal from '@/components/tags/TagSelectorModal';
import ImagesUploader, { ImageItem } from '@/components/ImagesUploader';
import api from '@/services/api';
import { TagDTO } from '@/types/tag-dto';
import Tag from '@/components/tags/Tag';
import { Ionicons } from '@expo/vector-icons';
import { uploadImages } from '@/helpers/upload-images';
import { DishFormData, dishSchema } from '@/schemas/dish';
import { router, useGlobalSearchParams } from 'expo-router';
import RestaurantPicker from '@/components/restaurants/RestaurantPicker';

export default function DishEditScreen() {
  const { id } = useGlobalSearchParams<{ id: string }>();

  const {
    control,
    handleSubmit,
    setValue,
    reset,
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
  const [selectedImages, setSelectedImages] = useState<ImageItem[]>([]);
  const [removedImages, setRemovedImages] = useState<number[]>([]);
  const [isTagModalVisible, setTagModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch dish data and restaurants
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const dishResponse = await api.get(`/dishes/${id}`);
        const dishData = dishResponse.data.data;

        reset({
          name: dishData.name,
          restaurant_id: dishData.restaurant.id,
          comments: dishData.comments || "",
          rating: dishData.rating,
          price: dishData.price.toString(),
        });

        setSelectedTags(dishData.tags);
        setSelectedImages(
          dishData.images.map((img: any) => ({ id: img.id, uri: img.url }))
        );
      } catch (error) {
        console.log('Error fetching data:', error);
        Alert.alert('Error', 'No se pudieron cargar los datos del plato');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, setValue]);

  const onSubmit: SubmitHandler<DishFormData> = async (data) => {
    setLoading(true);
    try {
      const payload = {
        name: data.name.trim(),
        restaurant_id: data.restaurant_id,
        comments: data.comments?.trim() || "",
        price: data.price || null,
        rating: data.rating || null,
        tags: selectedTags.map((tag) => tag.id),
      };

      await api.put(`/dishes/${id}`, payload);

      // Handle new images upload
      const newImages = selectedImages.filter((image) => !image.id);
      if (newImages.length > 0) {
        await uploadImages(newImages.map((img) => img.uri), "DISH", Number(id));
      }

      // Handle removed images
      if (removedImages.length > 0) {
        await Promise.all(
          removedImages.map((imageId) => api.delete(`/images/${imageId}`))
        );
      }

      Alert.alert('Éxito', 'Plato actualizado correctamente.');
      router.replace({
        pathname: '/dishes/[id]/view',
        params: { id },
      });
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo actualizar el plato');
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-muted justify-center items-center">
        <ActivityIndicator size="large" color="#905c36" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#e5eae0] p-4">
      <Text className="text-2xl font-bold mb-4">Editar plato</Text>

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

        {/* Precio */}
        <FormInput
          control={control}
          name="price"
          label="Precio"
          placeholder="Ingresa el precio"
          keyboardType="numeric"
        />

        {/* Restaurante */}
        <RestaurantPicker
          control={control}
          setValue={setValue}
          name="restaurant_id"
          label="Restaurante"
          errors={errors}
        />

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

        {/* Images */}
        <ImagesUploader
          isEdit
          images={selectedImages}
          onChangeImages={setSelectedImages}
          onRemoveExistingImage={(imageId) =>
            setRemovedImages((prev) => [...prev, imageId])
          }
        />

        {/* Submit button */}
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          className="mt-4 bg-primary py-3 rounded-md items-center"
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text className="text-white font-bold">Guardar</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}