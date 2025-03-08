import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TagDTO } from '@/features/tags/types/tag-dto';
import RatingStars from '@/components/RatingStars';
import Tag from '@/features/tags/components/Tag';

interface RestaurantItemProps {
  name: string;
  comments: string | null;
  tags: TagDTO[];
  rating: number | null;
  onPress?: () => void;
}

const RestaurantItem: React.FC<RestaurantItemProps> = ({
  name,
  comments,
  tags,
  rating,
  onPress,
}) => {
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
      {comments ? (
        <Text className="text-sm text-gray-600 mb-4">
          {comments}
        </Text>
      ) : (
        <Text className="text-sm italic text-gray-600 mb-4">
          Sin comentarios
        </Text>
      )}
      <View className="flex-row flex-wrap mb-2">
        {tags.map((tag) => {
          return (
            <Tag key={tag.id} color={tag.color} name={tag.name} />
          );
        })}
      </View>
      <View className="flex-row justify-end">
        <RatingStars value={rating} size={18} gap={2} readOnly />
      </View>
    </TouchableOpacity>
  );
};

export default RestaurantItem;
