import React, { useState, useEffect } from 'react';
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
import { router, useGlobalSearchParams } from 'expo-router';

export default function RestaurantEditScreen() {
  // Obtenemos el id del restaurante desde los parámetros de la ruta
  const { id } = useGlobalSearchParams<{ id: string }>();

  const { control, handleSubmit, reset } = useForm<RestaurantFormData>({
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
  const [loading, setLoading] = useState(false);

  // Cargar datos del restaurante mediante GET /restaurants/:id
  useEffect(() => {
    if (id) {
      setLoading(true);
      api
        .get(`/restaurants/${id}`)
        .then((response) => {
          const restaurant = response.data.data;
          // Se precargan los campos del formulario
          reset({
            name: restaurant.name,
            comments: restaurant.comments,
            rating: restaurant.rating,
          });
          setSelectedTags(restaurant.tags);
          setSelectedImages(restaurant.images.map((img: any) => img.url));
          // Si tu backend maneja la ubicación, se podría precargar aquí:
          // setLocation(restaurant.location);
        })
        .catch((error) => {
          Alert.alert('Error', 'No se pudo cargar los datos del restaurante');
          console.log(error);
        })
        .finally(() => setLoading(false));
    }
  }, [id, reset]);

  // Función para enviar el formulario (PUT /restaurants/:id)
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

      // Se filtran las imágenes nuevas (locales) para subir solo las que no sean URLs
      const newImages = selectedImages.filter((img) => !img.startsWith('http'));
      if (newImages.length > 0) {
        await uploadImages(newImages, "RESTAURANT", Number(id));
      }

      Alert.alert('Éxito', 'Restaurante actualizado correctamente.');
      router.replace({
        pathname: '/restaurants/[id]/view',
        params: { id },
      });
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo actualizar el restaurante');
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-muted p-4">
      <Text className="text-2xl font-bold mb-4">Editar restaurante</Text>

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
        {/* Si se requiere, se podría reactivar un componente LocationPicker */}
        {/* <LocationPicker location={location} onLocationChange={setLocation} /> */}

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

        {/* Imágenes: se muestran las precargadas y se permite eliminar o agregar nuevas */}
        <ImagesUploader images={selectedImages} onChangeImages={setSelectedImages} />

        {/* Botón para actualizar restaurante */}
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
