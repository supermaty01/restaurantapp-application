import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, ActivityIndicator } from 'react-native';
import { Controller, Control } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import api from '@/services/api';
import { DishDTO } from '@/types/dish-dto';

interface DishPickerProps {
  control: Control<any>;
  name: string;
  restaurantId: string | undefined;
  errors?: any;
  selectedDishes: DishDTO[];
  setSelectedDishes: (dishes: DishDTO[]) => void;
}

const DishPicker: React.FC<DishPickerProps> = ({
  control,
  name,
  restaurantId,
  errors,
  selectedDishes,
  setSelectedDishes,
}) => {
  const [dishes, setDishes] = useState<DishDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (!restaurantId || !isModalVisible) return;

    const fetchDishes = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/api/v1/restaurants/${restaurantId}/dishes`);
        setDishes(response.data.data);
      } catch (error) {
        console.error('Error fetching dishes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDishes();
  }, [restaurantId, isModalVisible]);

  const handleAddDish = (dish: DishDTO) => {
    if (!selectedDishes.some(d => d.id === dish.id)) {
      setSelectedDishes([...selectedDishes, dish]);
    }
  };

  const handleRemoveDish = (dishId: number) => {
    setSelectedDishes(selectedDishes.filter(dish => dish.id !== dishId));
  };

  return (
    <View>
      <Text className="text-xl font-semibold text-gray-800 mt-2">Platos</Text>

      <TouchableOpacity
        className={`bg-primary py-2 px-4 rounded-md mt-2 ${
          !restaurantId ? 'opacity-50' : ''
        }`}
        onPress={() => setIsModalVisible(true)}
        disabled={!restaurantId}
      >
        <Text className="text-white font-bold">Seleccionar platos</Text>
      </TouchableOpacity>

      {errors?.[name] && <Text className="text-red-500 mt-1">{errors[name].message}</Text>}

      {selectedDishes.length > 0 && (
        <View className="flex-row flex-wrap mt-2">
          {selectedDishes.map((dish) => (
            <View key={dish.id} className="flex-row items-center bg-gray-200 p-2 rounded-md m-1">
              <Text className="text-gray-800 mr-2">{dish.name}</Text>
              <TouchableOpacity onPress={() => handleRemoveDish(dish.id)}>
                <Ionicons name="close-circle" size={20} color="red" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Modal para seleccionar platos */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white w-4/5 p-4 rounded-md">
            <Text className="text-lg font-bold mb-2">Seleccionar Platos</Text>

            {isLoading ? (
              <ActivityIndicator size="large" color="#000" />
            ) : (
              <FlatList
                data={dishes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="flex-row justify-between items-center p-2 border-b border-gray-200"
                    onPress={() => handleAddDish(item)}
                  >
                    <Text>{item.name}</Text>
                    {selectedDishes.some(d => d.id === item.id) && (
                      <Ionicons name="checkmark-circle" size={20} color="green" />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}

            <TouchableOpacity
              className="bg-primary py-2 px-4 rounded-md mt-4"
              onPress={() => setIsModalVisible(false)}
            >
              <Text className="text-white text-center font-bold">Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DishPicker;
