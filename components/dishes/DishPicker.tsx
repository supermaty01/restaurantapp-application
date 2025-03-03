import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Modal, FlatList } from 'react-native';
import { Control, UseFormSetValue } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import api from '@/services/api';
import { DishListDTO } from '@/types/dish-dto';
import { useNewDish } from '@/context/NewDishContext';

interface DishPickerProps {
  control: Control<any>;
  name: string;
  setValue: UseFormSetValue<any>;
  restaurantId: number | undefined;
  errors?: any;
  selectedDishes: DishListDTO[];
  setSelectedDishes: (dishes: DishListDTO[]) => void;
}

const DishPicker: React.FC<DishPickerProps> = ({
  name,
  setValue,
  restaurantId,
  errors,
  selectedDishes,
  setSelectedDishes,
}) => {
  const [dishes, setDishes] = useState<DishListDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { newDish, setNewDish } = useNewDish();
  const router = useRouter();

  const fetchDishes = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/restaurants/${restaurantId}/dishes`);
      setDishes(response.data.data);
    } catch (error) {
      console.log('Error fetching dishes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!restaurantId) return;
    fetchDishes();
  }, [restaurantId]);

  useEffect(() => {
    if (newDish) {
      fetchDishes().then(() => {
        handleAddDish(newDish);
        setNewDish(null);
      });
    }
  }, [newDish]);

  const handleAddDish = (dish: DishListDTO) => {
    if (!selectedDishes.some(d => d.id === dish.id)) {
      const newSelectedDishes = [...selectedDishes, dish];
      setSelectedDishes(newSelectedDishes);
      setValue(name, newSelectedDishes.map(d => d.id), { shouldValidate: true });
    }
    setIsModalVisible(false);
  };

  const handleRemoveDish = (dishId: number) => {
    const updatedDishes = selectedDishes.filter(dish => dish.id !== dishId);
    setSelectedDishes(updatedDishes);
    setValue(name, updatedDishes.map(d => d.id), { shouldValidate: true });
  };

  return (
    <View>
      <Text className="text-xl font-semibold text-gray-800 mt-2">Platos</Text>

      {selectedDishes.length > 0 && (
        <View className="mt-3">
          {selectedDishes.map((dish) => (
            <View key={dish.id} className="flex-row items-center w-full mb-3">
              <Text className="flex-1 py-2 px-4 border border-gray-200 text-gray-800 rounded-lg">{dish.name}</Text>

              <TouchableOpacity
                onPress={() => handleRemoveDish(dish.id)}
                className="ml-3 p-2 bg-red-700 rounded-lg"
              >
                <Ionicons name="close" size={23} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View className="flex-row justify-between mt-3">
        <TouchableOpacity
          className={`bg-primary py-3 px-4 rounded-md ${!restaurantId ? 'opacity-50' : ''}`}
          onPress={() => setIsModalVisible(true)}
          disabled={!restaurantId}
        >
          <Text className="text-white font-bold">Añadir existente</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`bg-primary py-3 px-4 rounded-md ${!restaurantId ? 'opacity-50' : ''}`}
          onPress={() => router.push({ pathname: '/dishes/new', params: { useBackRedirect: 'true', restaurantId } })}
          disabled={!restaurantId}
        >
          <Text className="text-white font-bold">Crear nuevo plato</Text>
        </TouchableOpacity>
      </View>

      {errors?.[name] && <Text className="text-red-500 mt-1">{errors[name].message}</Text>}

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View className="bg-white w-4/5 p-4 rounded-md">
            <Text className="text-lg font-bold mb-3">Seleccionar Platos</Text>

            {isLoading ? (
              <ActivityIndicator size="large" color="#905c36" />
            ) : dishes.length === 0 ? (
              <Text className="text-gray-500 text-center mt-4">No hay platos disponibles</Text>
            ) : (
              <FlatList
                data={dishes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="flex-row justify-between items-center p-3 border-b border-gray-200"
                    onPress={() => handleAddDish(item)}
                  >
                    <Text>{item.name}</Text>
                    {selectedDishes.some(d => d.id === item.id) && (
                      <Ionicons name="checkmark-circle" size={19} color="green" />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}

            <TouchableOpacity
              className="bg-primary py-3 px-4 rounded-md mt-4"
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
