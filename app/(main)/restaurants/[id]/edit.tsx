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
import { RestaurantFormData, restaurantSchema } from '@/features/restaurants/schemas/restaurant-schema';
import { router, useGlobalSearchParams } from 'expo-router';
import MapLocationPicker from '@/components/MapLocationPicker';

export default function RestaurantEditScreen() {
  const { id } = useGlobalSearchParams<{ id: string }>();

  const { control, handleSubmit, reset } = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: '',
      comments: '',
      rating: undefined,
      location: undefined,
    },
  });

  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedTags, setSelectedTags] = useState<TagDTO[]>([]);
  const [selectedImages, setSelectedImages] = useState<ImageItem[]>([]);
  const [removedImages, setRemovedImages] = useState<number[]>([]);
  const [isTagModalVisible, setTagModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      api
        .get(`/restaurants/${id}`)
        .then((response) => {
          const restaurant = response.data.data;
          reset({
            name: restaurant.name,
            comments: restaurant.comments || "",
            rating: restaurant.rating,
            location: restaurant.location,
          });
          setSelectedTags(restaurant.tags);
          setSelectedImages(
            restaurant.images.map((img: any) => ({ id: img.id, uri: img.url }))
          );
          setLocation(restaurant.location);
        })
        .catch((error) => {
          Alert.alert('Error', 'No se pudo cargar los datos del restaurante');
          console.log(error);
        })
        .finally(() => setLoading(false));
    }
  }, [id, reset]);

  const onSubmit: SubmitHandler<RestaurantFormData> = async (data) => {
    setLoading(true);
    try {
      const payload = {
        name: data.name.trim(),
        comments: data.comments?.trim() || '',
        rating: data.rating || null,
        location: location || null,
        tags: selectedTags.map((tag) => tag.id),
      };

      await api.put(`/restaurants/${id}`, payload);

      const newImages = selectedImages.filter((image) => !image.id);
      if (newImages.length > 0) {
        await uploadImages(newImages.map((img) => img.uri), "RESTAURANT", Number(id));
      }

      if (removedImages.length > 0) {
        await Promise.all(
          removedImages.map((imageId) => api.delete(`/images/${imageId}`))
        );
      }

      Alert.alert('Éxito', 'Restaurante actualizado correctamente.');
      router.replace({ pathname: '/restaurants/[id]/view', params: { id } });
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo actualizar el restaurante');
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
    <ScrollView className="flex-1 bg-muted p-4">
      <Text className="text-2xl font-bold mb-4">Editar restaurante</Text>

      <View className="bg-white p-4 rounded-md mb-8">
        <FormInput
          control={control}
          name="name"
          label="Nombre"
          placeholder="Ingresa el nombre"
        />

        <FormInput
          control={control}
          name="comments"
          label="Comentarios"
          placeholder="Ejemplo: Ambiente agradable, buena comida..."
          multiline
          inputClassName="h-auto"
          numberOfLines={4}
        />

        <Text className="text-xl font-semibold text-gray-800 mb-2">Ubicación</Text>
        <MapLocationPicker location={location} onLocationChange={setLocation} />

        <Text className="text-xl font-semibold text-gray-800 mb-2">Calificación</Text>
        <View className="flex justify-center items-center">
          <RatingStars control={control} name="rating" />
        </View>

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
