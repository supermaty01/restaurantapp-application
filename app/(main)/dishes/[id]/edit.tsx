import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Picker } from '@react-native-picker/picker';
import FormInput from '@/components/FormInput';
import RatingStars from '@/components/RatingStars';
import TagSelectorModal from '@/components/tags/TagSelectorModal';
import ImagesUploader, { ImageItem } from '@/components/ImagesUploader';
import api from '@/services/api';
import { TagDTO } from '@/types/tag-dto';
import { RestaurantListDTO } from '@/types/restaurant-dto';
import Tag from '@/components/tags/Tag';
import { Ionicons } from '@expo/vector-icons';
import { uploadImages } from '@/helpers/upload-images';
import { DishFormData, dishSchema } from '@/schemas/dish';
import { router, useGlobalSearchParams } from 'expo-router';

export default function DishEditScreen() {
  const { id } = useGlobalSearchParams<{ id: string }>();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    watch
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

  const watchedPrice = watch('price');

  const [selectedTags, setSelectedTags] = useState<TagDTO[]>([]);
  const [selectedImages, setSelectedImages] = useState<ImageItem[]>([]);
  const [removedImages, setRemovedImages] = useState<number[]>([]);
  const [isTagModalVisible, setTagModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<RestaurantListDTO[]>([]);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(true);
  const [formattedPrice, setFormattedPrice] = useState("");

  // Format price for display
  const formatPrice = (price: number | string | undefined) => {
    if (price === undefined || price === '') return '';

    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(numericPrice);
  };

  // Fetch dish data and restaurants
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // First fetch the dish details to know which restaurant to preselect
        const dishResponse = await api.get(`/dishes/${id}`);
        const dishData = dishResponse.data.data;

        // Then fetch restaurants for dropdown
        const restaurantsResponse = await api.get('/restaurants');
        setRestaurants(restaurantsResponse.data.data);
        setIsLoadingRestaurants(false);

        // Set form values including restaurant_id
        setValue('name', dishData.name);
        setValue('restaurant_id', dishData.restaurant.id);
        setValue('comments', dishData.comments || '');

        // Set price and formatted price
        if (dishData.price !== undefined && dishData.price !== null) {
          setValue('price', dishData.price);
          setFormattedPrice(formatPrice(dishData.price));
        }

        setValue('rating', dishData.rating);

        // Set tags and images
        if (dishData.tags && dishData.tags.length > 0) {
          setSelectedTags(dishData.tags);
        }

        if (dishData.images && dishData.images.length > 0) {
          setSelectedImages(dishData.images.map((img: any) => ({
            id: img.id,
            uri: img.url
          })));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'No se pudieron cargar los datos del plato');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, setValue]);

  // Update formatted price when price value changes
  useEffect(() => {
    if (watchedPrice !== undefined) {
      setFormattedPrice(formatPrice(watchedPrice));
    }
  }, [watchedPrice]);

  const onSubmit: SubmitHandler<DishFormData> = async (data) => {
    setLoading(true);
    try {
      const payload = {
        name: data.name.trim(),
        restaurant_id: data.restaurant_id,
        comments: data.comments?.trim() || '',
        price: typeof data.price === 'string' ? parseFloat(String(data.price).replace(',', '.')) : data.price ?? undefined,
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

  const handlePriceChange = (text: string) => {
    // Remove all non-numeric characters
    const numericValue = text.replace(/[^0-9]/g, '');

    if (numericValue === '') {
      setValue('price', undefined);
      setFormattedPrice('');
    } else {
      const price = parseInt(numericValue, 10);
      setValue('price', price);
      setFormattedPrice(formatPrice(price));
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
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
            render={({ field }) => (
              <FormInput
                control={control}
                name="price"
                placeholder="Ingresa el precio"
                keyboardType="numeric"
                onChangeText={handlePriceChange}
                value={formattedPrice}
              />
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