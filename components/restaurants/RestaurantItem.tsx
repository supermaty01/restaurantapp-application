import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TagDTO } from '@/types/tag-dto';
import Tag from '../tags/Tag';

interface RestaurantItemProps {
  name: string;
  comments: string;
  tags: TagDTO[];
  rating: number; // Número de estrellas (0-5)
  onPress?: () => void;
}

const RestaurantItem: React.FC<RestaurantItemProps> = ({
  name,
  comments,
  tags,
  rating,
  onPress,
}) => {
  // Generar un arreglo de 5 estrellas, marcando las activas según rating
  const stars = Array.from({ length: 5 }, (_, i) => i < rating);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-white p-4 rounded-xl mb-4 shadow-sm"
    >
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-base font-bold text-gray-800 max-w-[85%]">
          {name}
        </Text>
        <Ionicons name="chevron-forward-outline" size={20} color="#6b6b6b" />
      </View>
      <Text className="text-sm text-gray-600 mb-2">
        {comments}
      </Text>
      <View className="flex-row flex-wrap mb-2">
        {tags.map((tag) => {
          return (
            <Tag key={tag.id} color={tag.color} name={tag.name} />
          );
        })}
      </View>
      <View className="flex-row justify-end">
        {stars.map((active, index) => (
          <Ionicons
            key={index}
            name={active ? 'star' : 'star-outline'}
            size={20}
            color="#f4c430"
          />
        ))}
      </View>
    </TouchableOpacity>
  );
};

export default RestaurantItem;
