import React from 'react';
import { View } from 'react-native';
import { RestaurantDTO } from '@/types/restaurant-dto';

interface RestaurantVisitsProps {
  restaurant: RestaurantDTO;
}

export default function RestaurantVisits({ restaurant }: RestaurantVisitsProps) {
  return (
    <View className="p-4 h-full bg-white">

    </View>
  );
}
