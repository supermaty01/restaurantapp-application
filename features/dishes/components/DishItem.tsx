import React, { useRef, useCallback } from 'react';
import { View, Text, Image, Animated } from 'react-native';
import PeekablePressable from '@/components/PeekablePressable';
import { Ionicons } from '@expo/vector-icons';
import { TagDTO } from '@/features/tags/types/tag-dto';
import { ImageDTO } from '@/features/images/types/image-dto';
import RatingStars from '@/components/RatingStars';
import Tag from '@/features/tags/components/Tag';

interface DishItemProps {
  name: string;
  comments: string | null;
  tags: TagDTO[];
  rating: number | null;
  images: ImageDTO[];
  onPress?: () => void;
  onPeek?: () => void;
  onPeekEnd?: () => void;
}

const DishItem: React.FC<DishItemProps> = ({
  name,
  comments,
  tags,
  rating,
  images,
  onPress,
  onPeek,
  onPeekEnd,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const imageUrl = images.length > 0 ? images[0].uri : null;

  const handleScaleChange = useCallback(
    (scale: number) => {
      Animated.spring(scaleAnim, {
        toValue: scale,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }).start();
    },
    [scaleAnim]
  );

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <PeekablePressable
        onPress={onPress}
        onPeek={onPeek}
        onPeekEnd={onPeekEnd}
        onScaleChange={handleScaleChange}
        scaleValue={1.03}
        className="bg-card dark:bg-dark-card p-4 rounded-xl mb-4 shadow-sm"
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
            <View className="w-20 h-20 rounded-lg bg-gray-200 dark:bg-gray-700 mr-3" />
          )}

          {/* Content container */}
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-gray-800 dark:text-gray-200 flex-1 pr-2">
                {name}
              </Text>
              <Ionicons name="chevron-forward-outline" size={20} color="#6b6b6b" className="dark:text-gray-400" />
            </View>
            {comments ? (
              <Text className="text-sm text-gray-600 dark:text-gray-400 mb-4" numberOfLines={2}>
                {comments}
              </Text>
            ) : (
              <Text className="text-sm italic text-gray-600 dark:text-gray-400 mb-4">
                Sin comentarios
              </Text>
            )}
            <View className="flex-row flex-wrap mb-1">
              {tags.map((tag) => (
                <Tag key={tag.id} color={tag.color} name={tag.name} />
              ))}
            </View>
          </View>
        </View>

        {/* Rating stars in bottom right */}
        <View className="flex-row justify-end">
          <RatingStars value={rating} size={18} gap={2} readOnly />
        </View>
      </PeekablePressable>
    </Animated.View>
  );
};

export default DishItem;