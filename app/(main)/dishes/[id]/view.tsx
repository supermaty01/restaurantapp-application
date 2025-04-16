import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import RatingStars from '@/components/RatingStars';
import { ImageDisplay } from '@/features/images/components/ImageDisplay';
import Tag from '@/features/tags/components/Tag';
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '@/services/db/schema';
import { eq } from 'drizzle-orm/sql';
import { useDishById } from '@/features/dishes/hooks/useDishById';

export default function DishDetailScreen() {

  const router = useRouter();
  const { id } = useGlobalSearchParams(); // Obtiene el id desde la ruta
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  const dish = useDishById(Number(id));

  function handleEdit() {
    router.push({
      pathname: '/dishes/[id]/edit',
      params: { id: id?.toString() },
    })
  }

  function handleDelete() {
    Alert.alert(
      'Eliminar Plato',
      '¿Estás seguro de que deseas eliminar este plato?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await drizzleDb.delete(schema.dishes).where(eq(schema.dishes.id, Number(id)));
              Alert.alert('Eliminado', 'Plato eliminado correctamente');
              router.back(); // O redirigir a otra pantalla
            } catch (error) {
              console.log('Error deleting Dish:', error);
              Alert.alert('Error', 'No se pudo eliminar el plato');
            }
          },
        },
      ],
      { cancelable: true }
    );
  }

  if (!dish) {
    return (
      <View className="flex-1 justify-center items-center bg-muted p-4">
        <Text className="text-base text-gray-800">No se encontró el plato</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-muted">
      <ImageDisplay images={dish.images} />

      {/* Nombre y botones Editar/Eliminar */}
      <View className="flex-row items-center justify-between px-4 mt-4">
        <Text className="text-2xl font-bold text-gray-800 flex-1 mr-2">
          {dish.name}
        </Text>
        <View className="flex-row">
          <TouchableOpacity
            className="bg-primary p-2 rounded-full mr-2"
            onPress={handleEdit}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-destructive p-2 rounded-full"
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="bg-white my-4 mx-4 p-4 rounded-xl">
        <View className="flex-row mb-4">
          <View className="flex-1 items-center">
            <Text className="text-base font-bold text-primary">Detalles</Text>
            <View className="w-full h-1 bg-primary mt-1 " />
          </View>
        </View>

        <Text className="text-base font-bold text-gray-400 mb-2">Restaurante visitado</Text>
        <TouchableOpacity
          className="flex-row items-center py-3 border-b border-gray-200 mb-8"
          onPress={() =>
            router.push({ pathname: '/restaurants/[id]/view', params: { id: dish.restaurant.id } })
          }
        >
          <View className="flex-1">
            <Text className="text-base font-bold text-gray-800">{dish.restaurant.name}</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#999" />
        </TouchableOpacity>

        <Text className="text-base font-bold text-gray-400 mb-2">Precio</Text>
        {dish.price ? (
          <Text className="text-xl font-bold text-primary mb-4">
            {new Intl.NumberFormat("es-CO", {
              style: "currency",
              currency: "COP",
              minimumFractionDigits: 0,
            }).format(dish.price)}
          </Text>

        ) : (
          <Text className="text-base italic text-gray-500 mb-4">
            Sin precio
          </Text>
        )}

        <Text className="text-base font-bold text-gray-400 mb-2">Comentarios</Text>
        {dish.comments ? (
          <Text className="text-base text-gray-800 mb-4">{dish.comments}</Text>
        ) : (
          <Text className="text-base italic text-gray-500 mb-4">
            Sin comentarios
          </Text>
        )}

        <Text className="text-base font-bold text-gray-400 mb-2">Etiquetas</Text>
        {dish.tags?.length > 0 ? (
          <View className="flex-row flex-wrap mb-4">
            {dish.tags.map((tag) => (
              <Tag key={tag.id} color={tag.color} name={tag.name} />
            ))}
          </View>
        ) : (
          <Text className="text-base italic text-gray-500 mb-4">
            Sin etiquetas
          </Text>
        )}

        <Text className="text-base font-bold text-gray-400 my-2">Calificación</Text>
        <View className="flex-row">
          <RatingStars
            value={dish.rating}
            readOnly
          />
        </View>


      </View>
    </ScrollView>
  );
}
