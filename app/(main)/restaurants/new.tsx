import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormInput from '@/components/FormInput';
import RatingStars from '@/components/RatingStars';
import TagSelectorModal from '@/components/tags/TagSelectorModal';
import ImagesUploader from '@/components/ImagesUploader';
import api from '@/services/api';
import { TagDTO } from '@/types/tag-dto';
import Tag from '@/components/tags/Tag';
import { Ionicons } from '@expo/vector-icons';
import { uploadImages } from '@/helpers/upload-images';
import { RestaurantFormData, restaurantSchema } from '@/schemas/restaurant';
import { router } from 'expo-router';
import MapLocationPicker from '@/components/MapLocationPicker';

export default function RestaurantCreateScreen() {
  const {
    control,
    handleSubmit,
  } = useForm<RestaurantFormData>({
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
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isTagModalVisible, setTagModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

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

      const response = await api.post('/restaurants', payload);
      const restaurantId = response.data.data.id;

      if (selectedImages.length > 0) {
        await uploadImages(selectedImages, "RESTAURANT", restaurantId);
      }

      Alert.alert('Éxito', 'Restaurante creado correctamente.');
      router.replace({
        pathname: '/restaurants/[id]/view',
        params: { id: restaurantId },
      });
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo crear el restaurante');
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-muted p-4">
      <Text className="text-2xl font-bold mb-4">Añadir restaurante</Text>

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
          placeholder="Ejemplo: Ambiente agradable, buena comida..."
          multiline
          inputClassName="h-auto"
          numberOfLines={4}
        />

        {/* Ubicación (opcional) */}
        <Text className="text-xl font-semibold text-gray-800 mb-2">Ubicación</Text>
          <MapLocationPicker location={location} onLocationChange={setLocation} />

        {/* Rating (opcional) */}
        <Text className="text-xl font-semibold text-gray-800 mb-2">Calificación</Text>
        <View className="flex justify-center items-center">
          <RatingStars control={control} name="rating" />
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

        {/* Botón para crear restaurante */}
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
