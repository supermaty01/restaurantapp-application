import React, { useState, useEffect } from 'react';
import { FlatList, TouchableOpacity, View, Text, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TagItem from '@/components/tags/TagItem';
import CreateTagModal from '@/components/tags/CreateTagModal';
import api from '@/services/api';
import { TagDTO } from '@/features/tags/types/tag-dto';

export default function TagsScreen() {
  const [tags, setTags] = useState<TagDTO[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedTag, setSelectedTag] = useState<TagDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getTags = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/tags');
      setTags(response.data.data);
    } catch (error: any) {
      console.log('Error fetching tags:', error);
      Alert.alert('Error', 'No se pudieron cargar las etiquetas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getTags();
  }, []);

  const handleSubmit = async (tagData: Pick<TagDTO, "name" | "color"> & { id?: string }) => {
    try {
      if (selectedTag) {
        // Actualizar etiqueta existente
        await api.put(`/tags/${selectedTag.id}`, tagData);
      } else {
        // Crear nueva etiqueta
        await api.post('/tags', tagData);
      }
      getTags();
      handleModalClose();
      return { success: true };
    } catch (error: any) {
      console.log('Error in tag operation:', error);
      return {
        success: false,
        error: error.response ? error.response.data : error.message,
      };
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      await api.delete(`/tags/${tagId}`);
      getTags();
      handleModalClose();
      return { success: true };
    } catch (error: any) {
      console.log('Error deleting tag:', error);
      Alert.alert('Error', 'No se pudo eliminar la etiqueta');
      return {
        success: false,
        error: error.response ? error.response.data : error.message,
      };
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

  if (isLoading) {
    return (
      <View className="flex-1 bg-muted justify-center items-center">
        <ActivityIndicator size="large" color="#905c36" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-muted px-4 pt-2 relative">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-bold text-gray-800">Etiquetas</Text>
      </View>

      <FlatList
        data={tags}
        keyExtractor={(item) => item.id}
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