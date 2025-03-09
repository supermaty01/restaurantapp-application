import React, { useState } from 'react';
import { FlatList, TouchableOpacity, View, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useSQLiteContext } from 'expo-sqlite';
import * as schema from '@/services/db/schema';
import CreateTagModal from '@/features/tags/components/CreateTagModal';
import TagItem from '@/features/tags/components/TagItem';
import { eq } from 'drizzle-orm';
import { TagDTO } from '@/features/tags/types/tag-dto';
import { useTagsList } from '@/features/tags/hooks/useTagsList';

export default function TagsScreen() {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  const { data: tags } = useTagsList();
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedTag, setSelectedTag] = useState<TagDTO | null>(null);

  const handleSubmit = async (tagData: { id?: number; name: string; color: string }) => {
    try {
      if (selectedTag) {
        // Actualizar etiqueta existente
        await drizzleDb.update(schema.tags).set({ name: tagData.name, color: tagData.color }).where(eq(schema.tags.id, selectedTag.id));
      } else {
        // Crear nueva etiqueta
        await drizzleDb.insert(schema.tags).values({ name: tagData.name, color: tagData.color });
      }

      handleModalClose();
      return { success: true };
    } catch (error) {
      console.log('Error in tag operation:', error);
      return { success: false, error: 'Error al procesar la etiqueta' };
    }
  };

  const handleDeleteTag = async (tagId: number) => {
    try {
      await drizzleDb.delete(schema.tags).where(eq(schema.tags.id, tagId));
      handleModalClose();
      return { success: true };
    } catch (error) {
      console.log('Error deleting tag:', error);
      Alert.alert('Error', 'No se pudo eliminar la etiqueta');
      return { success: false, error: 'Error al eliminar la etiqueta' };
    }
  };

  const handleTagPress = (tag: TagDTO) => {
    setSelectedTag(tag);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setSelectedTag(null);
    setModalVisible(false);
  };

  return (
    <View className="flex-1 bg-muted px-4 pt-2 relative">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-bold text-gray-800">Etiquetas</Text>
      </View>

      <FlatList
        data={tags}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TagItem
            label={item.name}
            color={item.color}
            onPress={() => handleTagPress(item)}
          />
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-10">
            <Text className="text-base text-gray-800">No se encontraron etiquetas.</Text>
          </View>
        }
      />

      <TouchableOpacity
        onPress={() => {
          setSelectedTag(null);
          setModalVisible(true);
        }}
        className="absolute bottom-5 right-5 w-12 h-12 bg-primary rounded-full items-center justify-center"
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      <CreateTagModal
        visible={isModalVisible}
        onClose={handleModalClose}
        onAdd={handleSubmit}
        onDelete={handleDeleteTag}
        editTag={selectedTag}
        isEditing={!!selectedTag}
      />
    </View>
  );
}
