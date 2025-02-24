import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import FormInput from '@/components/FormInput';
import RatingStars from '@/components/RatingStars';
import TagSelectorModal from '@/components/tags/TagSelectorModal';
import ImagesUploader from '@/components/ImagesUploader'; // Ajustado para solo seleccionar imágenes
import api from '@/services/api';
import { TagDTO } from '@/types/tag-dto';
import Tag from '@/components/tags/Tag';
import { Ionicons } from '@expo/vector-icons';
import { uploadImages } from '@/helpers/upload-images';

// Esquema de validación
const restaurantSchema = z.object({
  name: z.string().nonempty('El nombre es requerido'),
  comments: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
});

type RestaurantFormData = z.infer<typeof restaurantSchema>;

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
    },
  });

  const [location, setLocation] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<TagDTO[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isTagModalVisible, setTagModalVisible] = useState(false);

  const onSubmit: SubmitHandler<RestaurantFormData> = async (data) => {
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
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo crear el restaurante');
      console.log(error);
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#e5eae0] p-4">
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
        {/* 
          Si lo deseas, puedes reactivar tu componente LocationPicker
          <LocationPicker location={location} onLocationChange={setLocation} />
        */}

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

        {/* Botón para crear restaurante */}
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
