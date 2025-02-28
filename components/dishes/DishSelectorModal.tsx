import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList } from 'react-native';
import api from '@/services/api';
import clsx from 'clsx';
import { Ionicons } from '@expo/vector-icons';
import { DishDTO } from '@/types/dish-dto';

interface DishSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDishes: DishDTO[];
  onChangeSelected: (newDishes: DishDTO[]) => void;
}

export default function DishSelectorModal({
  visible,
  onClose,
  selectedDishes,
  onChangeSelected,
}: DishSelectorModalProps) {
  const [dishes, setDishes] = useState<DishDTO[]>([]);

  useEffect(() => {
    if (visible) {
      fetchDishes();
    }
  }, [visible]);

  const fetchDishes = async () => {
    try {
      const response = await api.get('/dishes'); // Asegúrate de que esta es la ruta correcta en la API
      setDishes(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleToggle = (selectedDish: DishDTO) => {
    if (selectedDishes.find((dish) => dish.id === selectedDish.id)) {
      // Deseleccionar plato
      onChangeSelected(selectedDishes.filter((dish) => dish.id !== selectedDish.id));
    } else {
      // Seleccionar plato
      onChangeSelected([...selectedDishes, selectedDish]);
    }
  };

  return (
    <Modal visible={visible} transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-white w-10/12 rounded-md p-4 max-h-[60%]">
          <Text className="text-lg font-bold mb-2">Seleccionar Platos</Text>
          <FlatList
            data={dishes}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const isSelected = selectedDishes.some((dish) => dish.id === item.id);
              return (
                <TouchableOpacity
                  className="flex-row items-center mb-2"
                  onPress={() => handleToggle(item)}
                >
                  <View
                    className={clsx("size-6 mr-2 rounded-md", isSelected ? 'bg-primary' : 'bg-gray-300')}
                  >
                    {isSelected && <Ionicons name="checkmark" size={20} />}
                  </View>
                  <Text className="text-gray-800">{item.name}</Text>
                </TouchableOpacity>
              );
            }}
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
    </Modal>
  );
}
