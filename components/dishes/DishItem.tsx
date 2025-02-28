import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TagDTO } from '@/types/tag-dto';
import { ImageDTO } from '@/types/image-dto';
import Tag from '../tags/Tag';

interface DishItemProps {
  name: string;
  comments: string;
  tags: TagDTO[];
  rating: number; // Número de estrellas (0-5)
  images?: ImageDTO[];
  onPress?: () => void;
}

const DishItem: React.FC<DishItemProps> = ({
  name,
  comments,
  tags,
  rating,
  images,
  onPress,
}) => {
  // Generar un arreglo de 5 estrellas, marcando las activas según rating
  const stars = Array.from({ length: 5 }, (_, i) => i < rating);
  
  // Get first image URL if available
  const imageUrl = images && images.length > 0 ? images[0].url : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-white p-4 rounded-xl mb-4 shadow-sm"
    >
      <View className="flex-row mb-2">
        {/* Image container */}
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className="w-20 h-20 rounded-lg mr-3"
            resizeMode="cover"
          />
        ) : (
          <View className="w-20 h-20 rounded-lg bg-gray-200 mr-3" />
        )}
        
        {/* Content container */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-bold text-gray-800 flex-1 pr-2">
              {name}
            </Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#6b6b6b" />
          </View>
          <Text className="text-sm text-gray-600 mt-1 mb-2">
            {comments}
          </Text>
          <View className="flex-row flex-wrap mb-1">
            {tags.map((tag) => (
              <Tag key={tag.id} color={tag.color} name={tag.name} />
            ))}
          </View>
        </View>
      </View>
      
      {/* Rating stars in bottom right */}
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

export default DishItem;