import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import FormInput from '@/components/FormInput';
import RatingStars from '@/components/RatingStars';
import TagSelectorModal from '@/components/tags/TagSelectorModal';
import ImagesUploader from '@/components/ImagesUploader';
import RestaurantPicker from '@/components/restaurants/RestaurantPicker';

import api from '@/services/api';
import { TagDTO } from '@/types/tag-dto';
import Tag from '@/components/tags/Tag';
import { Ionicons } from '@expo/vector-icons';
import { uploadImages } from '@/helpers/upload-images';
import { DishFormData, dishSchema } from '@/schemas/dish';
import { router, useGlobalSearchParams } from 'expo-router';
import { useNewDish } from '@/context/NewDishContext';

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
  const { useBackRedirect } = useGlobalSearchParams();
  const { setNewDishId } = useNewDish();
  const [loading, setLoading] = useState(false);
  const [formattedPrice, setFormattedPrice] = useState("");
  

  const onSubmit: SubmitHandler<DishFormData> = async (data) => {
    setLoading(true);
    try {
      const payload = {
        name: data.name.trim(),
        restaurant_id: data.restaurant_id,
        comments: data.comments?.trim() || '',
        price: data.price,
        rating: data.rating || null,
        tags: selectedTags.map((tag) => tag.id),
      };

      const response = await api.post('/dishes', payload);
      const dishId = response.data.data.id;

      if (selectedImages.length > 0) {
        await uploadImages(selectedImages, "DISH", dishId);
      }

      Alert.alert('Éxito', 'Plato creado correctamente.');
      if (useBackRedirect && useBackRedirect === 'true') {
        setNewDishId(dishId);
        router.back();
      } else {
        router.replace({
          pathname: '/dishes/[id]/view',
          params: { id: dishId },
        });
      }
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo crear el plato');
      console.log(error);
    } finally {
      setLoading(false);
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

        {/* Precio */}
        <FormInput
          control={control}
          name="price"
          label="Precio"
          placeholder="Ingresa el precio"
          keyboardType="numeric"
        />

        {/* Restaurante (usando RestaurantPicker) ✅ */}
        <RestaurantPicker 
          control={control} 
          setValue={setValue} 
          name="restaurant_id" 
          label="Restaurante" 
          errors={errors} 
        />

        {/* Rating (opcional) */}
        <Text className="text-xl font-semibold text-gray-800 my-2">Calificación</Text>
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
