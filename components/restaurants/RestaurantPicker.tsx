import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Controller, Control, UseFormSetValue } from 'react-hook-form';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';

import api from '@/services/api';
import { RestaurantListDTO } from '@/types/restaurant-dto';
import { useNewRestaurant } from '@/context/NewRestaurantContext';

interface RestaurantPickerProps {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  name: string;
  label?: string;
  errors?: any;
}

const RestaurantPicker: React.FC<RestaurantPickerProps> = ({ control, setValue, name, label, errors }) => {
  const [restaurants, setRestaurants] = useState<RestaurantListDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { newRestaurantId, setNewRestaurantId } = useNewRestaurant();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/restaurants');
        setRestaurants(response.data.data);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        Alert.alert('Error', 'No se pudieron cargar los restaurantes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();

    if (newRestaurantId) {
      setValue(name, newRestaurantId, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setNewRestaurantId(null);
    }
  }, [newRestaurantId]);

  return (
    <View>
      {label && <Text className="text-base text-gray-800 mb-2">{label}</Text>}

      {isLoading ? (
        <View className="border border-gray-200 h-16 rounded-md justify-center pl-4">
          <ActivityIndicator size="small" color="#000" />
        </View>
      ) : (
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, value } }) => (
            <View className="border border-gray-200 rounded-md">
              <Picker
                selectedValue={value}
                onValueChange={(itemValue) => onChange(itemValue)}
              >
                <Picker.Item
                  label="Selecciona un restaurante"
                  value={-1}
                  style={{ color: '#6b7280;', fontSize: 15 }}
                />
                {restaurants.map((restaurant) => (
                  <Picker.Item
                    key={restaurant.id}
                    label={restaurant.name}
                    value={restaurant.id}
                    style={{ color: '#6b7280;', fontSize: 15 }}
                  />
                ))}
              </Picker>
            </View>
          )}
        />
      )}

      {errors?.[name] && <Text className="text-red-500 mt-1">{errors[name].message}</Text>}

      <TouchableOpacity
        className="mt-2"
        onPress={() =>
          router.push({
            pathname: '/restaurants/new',
            params: { useBackRedirect: 'true' },
          })
        }
      >
        <Text className="text-primary">¿No lo encuentras? Añade uno nuevo</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RestaurantPicker;
