import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTagById } from '@/features/tags/hooks/useTagById';
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '@/services/db/schema';
import { eq } from 'drizzle-orm/sql';
import { canDeleteTagPermanently, softDeleteTag } from '@/lib/helpers/soft-delete';

export default function TagDetailScreen() {
  const router = useRouter();
  const { id } = useGlobalSearchParams();
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  const tag = useTagById(Number(id));

  function handleEdit() {
    router.push({
      pathname: '/tags/[id]/edit',
      params: { id: id?.toString() },
    });
  }

  async function handleDelete() {
    try {
      // Verificar si la etiqueta puede ser eliminada permanentemente
      const canDeletePermanently = await canDeleteTagPermanently(drizzleDb, Number(id));

      const message = canDeletePermanently
        ? '¿Estás seguro de que deseas eliminar esta etiqueta? Esta acción no se puede deshacer.'
        : '¿Estás seguro de que deseas eliminar esta etiqueta? La etiqueta seguirá visible en platos y restaurantes existentes.';

      Alert.alert(
        'Eliminar Etiqueta',
        message,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              try {
                if (canDeletePermanently) {
                  // Eliminar permanentemente
                  await drizzleDb.delete(schema.tags).where(eq(schema.tags.id, Number(id)));
                } else {
                  // Soft delete
                  await softDeleteTag(drizzleDb, Number(id));
                }

                Alert.alert('Eliminada', 'Etiqueta eliminada correctamente');
                router.back();
              } catch (error) {
                console.log('Error deleting tag:', error);
                Alert.alert('Error', 'No se pudo eliminar la etiqueta');
              }
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.log('Error checking tag references:', error);
      Alert.alert('Error', 'No se pudo verificar las referencias de la etiqueta');
    }
  }

  if (!tag) {
    return (
      <View className="flex-1 justify-center items-center bg-muted p-4">
        <Text className="text-base text-gray-800">
          No se encontró la etiqueta
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-muted p-4">
      <View className="bg-white p-4 rounded-xl">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1 mr-2">
            <Text className="text-2xl font-bold text-gray-800">
              {tag.name}
            </Text>
          </View>
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

        {tag.deleted && (
          <View className="mt-3 bg-red-100 px-2 py-2 rounded flex-row gap-2 border-red-600 border-[1px]">
            <Ionicons className="flex" name="warning-outline" size={16} color="#dc2626" />
            <Text className="flex text-red-600 text-sm">Esta etiqueta ha sido eliminada</Text>
          </View>
        )}

        <View className="flex-row items-center mb-4">
          <Text className="text-base font-bold text-gray-400 mr-2">Color:</Text>
          <View
            style={{ backgroundColor: tag.color }}
            className="w-8 h-8 rounded-full"
          />
          <Text className="ml-2 text-base text-gray-800">{tag.color}</Text>
        </View>
      </View >
    </View >
  );
}
