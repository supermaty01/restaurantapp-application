import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TagDTO } from '@/features/tags/types/tag-dto';
import RatingStars from '@/components/RatingStars';
import Tag from '@/features/tags/components/Tag';
import { imagePathToUri } from '@/lib/helpers/image-paths';

interface RestaurantItemProps {
  name: string;
  comments: string | null;
  tags: TagDTO[];
  rating: number | null;
  imageUrl?: string;
  onPress?: () => void;
}

const RestaurantItem: React.FC<RestaurantItemProps> = ({
  name,
  comments,
  tags,
  rating,
  imageUrl,
  onPress,
}) => {
  // Normalizar la URL de la imagen si existe
  const normalizedImageUrl = imageUrl ? imagePathToUri(imageUrl) : undefined;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-card dark:bg-dark-card p-4 rounded-xl mb-4 shadow-sm"
    >
      <View className="flex-row mb-2">
        {normalizedImageUrl ? (
          <Image
            source={{ uri: normalizedImageUrl }}
            className="w-16 h-16 rounded-lg mr-3"
            resizeMode="cover"
          />
        ) : null}
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-bold text-gray-800 dark:text-gray-200 max-w-[85%]">
              {name}
            </Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#6b6b6b" />
          </View>
          {comments ? (
            <Text className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              {comments}
            </Text>
          ) : (
            <Text className="text-sm italic text-gray-600 dark:text-gray-300 mb-1">
              Sin comentarios
            </Text>
          )}
        </View>
      </View>

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
