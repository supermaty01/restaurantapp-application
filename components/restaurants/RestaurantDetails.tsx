import React from 'react';
import { View, Text } from 'react-native';
import Tag from '@/components/tags/Tag';
import RatingStars from '@/components/RatingStars';
import { RestaurantDTO } from '@/types/restaurant-dto';
import MapLocationPicker from '@/components/MapLocationPicker';

interface RestaurantDetailsProps {
  restaurant: RestaurantDTO;
}

export default function RestaurantDetails({ restaurant }: RestaurantDetailsProps) {

  return (
    <View className="p-4 h-full bg-white">
      {restaurant.comments ? (
        <Text className="text-base text-[#4A4A4A] mb-4">
          {restaurant.comments}
        </Text>
      ) : (
        <Text className="text-base italic text-[#999] mb-4">
          Sin descripción
        </Text>
      )}

      {restaurant.tags && restaurant.tags.length > 0 ? (
        <View className="flex-row flex-wrap mb-4">
          {restaurant.tags.map((tag) => (
            <Tag key={tag.id} color={tag.color} name={tag.name} />
          ))}
        </View>
      ) : (
        <Text className="text-sm italic text-[#999] mb-4">
          Sin etiquetas
        </Text>
      )}

      {restaurant.location && (
        <MapLocationPicker location={restaurant.location} editable={false} />
      )}

      <View className="flex items-center">
        <RatingStars value={restaurant.rating} readOnly />
      </View>
    </View>
  );
}
