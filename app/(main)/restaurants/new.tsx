import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormInput from '@/components/FormInput';
import RatingStars from '@/components/RatingStars';
import ImagesUploader from '@/features/images/components/ImagesUploader';
import { TagDTO } from '@/features/tags/types/tag-dto';
import { Ionicons } from '@expo/vector-icons';
import { RestaurantFormData, restaurantSchema } from '@/features/restaurants/schemas/restaurant-schema';
import { router, useGlobalSearchParams } from 'expo-router';
import MapLocationPicker from '@/components/MapLocationPicker';
import { useNewRestaurant } from '@/features/restaurants/hooks/useNewRestaurant';
import Tag from '@/features/tags/components/Tag';
import TagSelectorModal from '@/features/tags/components/TagSelectorModal';
import { uploadImages } from '@/lib/helpers/upload-images';
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '@/services/db/schema';

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
  const { useBackRedirect } = useGlobalSearchParams();
  const { setNewRestaurantId } = useNewRestaurant();
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const onSubmit: SubmitHandler<RestaurantFormData> = async (data) => {
    setLoading(true);
    try {
      const payload = {
        name: data.name.trim(),
        comments: data.comments?.trim() || '',
        rating: data.rating || null,
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
      };

      const response = await drizzleDb.insert(schema.restaurants).values(payload);
      const restaurantId = response.lastInsertRowId;

      // Asociar etiquetas
      for (const tag of selectedTags) {
        await drizzleDb.insert(schema.restaurantTags).values({ restaurantId, tagId: tag.id });
      }

      if (selectedImages.length > 0) {
        await uploadImages(drizzleDb, selectedImages, "RESTAURANT", restaurantId);
      }

      Alert.alert('Éxito', 'Restaurante creado correctamente.');
      if (useBackRedirect && useBackRedirect === 'true') {
        setNewRestaurantId(restaurantId);
        router.back();
      } else {
        router.replace({
          pathname: '/restaurants/[id]/view',
          params: { id: restaurantId },
        });
      }
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
        <Text className="text-xl font-semibold text-gray-800 my-2">Calificación</Text>
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
          className="mt-4 bg-primary py-3 rounded-md items-center disabled:bg-primary/30"
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
