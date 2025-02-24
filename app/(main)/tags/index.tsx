import React, { useState } from 'react';
import { FlatList, TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import TagItem from '@/components/tags/TagItem';
import CreateTagModal from '@/components/tags/CreateTagModal';
import api from '@/services/api';

interface Tag {
  id: string;
  name: string;
  color: string;
}

const sampleTags: Tag[] = [
  { id: 't1', name: 'Carne', color: '#905c36' },
  { id: 't2', name: 'Elegante', color: '#93ae72' },
  { id: 't3', name: 'Mexicano', color: '#e0e374' },
  { id: 't4', name: 'Barato', color: '#cdc8b8' },
  { id: 't5', name: 'Callejero', color: '#6b6246' },
  { id: 't6', name: 'Auténtico', color: '#391a07' },
];

export default function TagsScreen() {
  const router = useRouter();
  const [isModalVisible, setModalVisible] = useState(false);

  const onSubmit = async (newTag: Pick<Tag, "name" | "color">) => {
    try {
      const response = await api.post('/tags', { ...newTag });
      console.log('Tag creado:', response.data);
      return { success: true };
    } catch (error: any) {
      console.error('Error en login', error);
      return {
        success: false,
        error: error.response ? error.response.data : error.message,
      };
    }
  };

  return (
    <View className="flex-1 bg-[#e5eae0] p-4 relative">
      {/* Encabezado con el título "Etiquetas" */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-bold text-gray-800">Etiquetas</Text>
      </View>

      {/* Lista scrolleable de tags */}
      <FlatList
        data={sampleTags}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TagItem
            label={item.name}
            color={item.color}
            onPress={() => router.push(`/tags/${item.id}/edit`)}
          />
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* Botón flotante para añadir una nueva etiqueta */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="absolute bottom-5 right-5 w-12 h-12 bg-primary rounded-full items-center justify-center"
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
      <CreateTagModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={(newTag) => {
          setModalVisible(false);
          onSubmit(newTag);
        }}
      />
    </View>
  );
}
