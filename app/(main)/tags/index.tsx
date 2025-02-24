import React, { useState,useEffect } from 'react';
import { FlatList, TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import TagItem from '@/components/tags/TagItem';
import CreateTagModal from '@/components/tags/CreateTagModal';
import api from '@/services/api';
import { TagDTO } from '@/types/tag-dto';

<<<<<<< Updated upstream
const sampleTags: TagDTO[] = [
=======
interface Tag {
  id: string;
  name: string;
  color: string;
}

//datos de prueba (ya se pueden borrar)
const sampleTags: Tag[] = [
>>>>>>> Stashed changes
  { id: 't1', name: 'Carne', color: '#905c36' },
  { id: 't2', name: 'Elegante', color: '#93ae72' },
  { id: 't3', name: 'Mexicano', color: '#e0e374' },
  { id: 't4', name: 'Barato', color: '#cdc8b8' },
  { id: 't5', name: 'Callejero', color: '#6b6246' },
  { id: 't6', name: 'Auténtico', color: '#391a07' },
];

export default function TagsScreen() {
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

<<<<<<< Updated upstream
  const onSubmit = async (newTag: Pick<TagDTO, "name" | "color">) => {
=======
  const getTags = async () => {
>>>>>>> Stashed changes
    try {
      const response = await api.get('/tags');
      console.log('Tags fetched:', response.data);
      setTags(response.data.data);
    } catch (error: any) {
      console.error('Error fetching tags:', error);
      setError(error.response ? error.response.data : error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTags();
  }, []);

  const handleSubmit = async (tagData: Pick<Tag, "name" | "color"> & { id?: string }) => {
    try {
      let response;
      if (selectedTag) {
        // Update existing tag
        response = await api.put(`/tags/${selectedTag.id}`, tagData);
      } else {
        // Create new tag
        response = await api.post('/tags', tagData);
      }
      
      console.log('Tag operation successful:', response.data);
      getTags(); // Refresh the tags list
      return { success: true };
    } catch (error: any) {
      console.error('Error in tag operation:', error);
      return {
        success: false,
        error: error.response ? error.response.data : error.message,
      };
    }
  };

  const handleTagPress = (tag: Tag) => {
    setSelectedTag(tag);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setSelectedTag(null);
    setModalVisible(false);
  };

  return (
    <View className="flex-1 bg-[#e5eae0] p-4 relative">
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
        editTag={selectedTag}
        isEditing={!!selectedTag}
      />
    </View>
  );
}
