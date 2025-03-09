import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList } from 'react-native';
import api from '@/services/api';
import clsx from 'clsx';
import { Ionicons } from '@expo/vector-icons';
import Tag from '@/features/tags/components/Tag';
import { TagDTO } from '@/features/tags/types/tag-dto';
import { useTagsList } from '../hooks/useTagsList';

interface TagSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  selectedTags: TagDTO[];
  onChangeSelected: (newTags: TagDTO[]) => void;
}

export default function TagSelectorModal({
  visible,
  onClose,
  selectedTags,
  onChangeSelected,
}: TagSelectorModalProps) {
  const { data: tags } = useTagsList();

  const handleToggle = (selectedTag: TagDTO) => {
    if (selectedTags.find((tag) => tag.id === selectedTag.id)) {
      // Deseleccionar
      onChangeSelected(selectedTags.filter((tag) => tag.id !== selectedTag.id));
    } else {
      // Seleccionar
      onChangeSelected([...selectedTags, selectedTag]);
    }
  };

  return (
    <Modal visible={visible} transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-white w-10/12 rounded-md p-4 max-h-[60%]">
          <Text className="text-lg font-bold mb-2">Seleccionar Etiquetas</Text>
          <FlatList
            data={tags}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const isSelected = selectedTags.some((tag) => tag.id === item.id);
              return (
                <TouchableOpacity
                  className="flex-row items-bottom mb-2"
                  onPress={() => handleToggle(item)}
                >
                  <View
                    className={clsx("size-6 mr-2 rounded-md", isSelected ? 'bg-primary' : 'bg-gray-300')}
                  >
                    {isSelected && <Ionicons name="checkmark" size={20} />}
                  </View>
                  <Tag name={item.name} color={item.color} />
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center mt-10">
                <Text className="text-base text-gray-800">No se encontraron etiquetas.</Text>
              </View>
            }
          />
          <View className="flex-row justify-end mt-4">
            <TouchableOpacity
              onPress={onClose}
              className="px-4 py-2 bg-gray-300 rounded-md"
            >
              <Text className="text-gray-800">Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal >
  );
}
