import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { View, Text } from 'react-native';

import { PeekPreviewData } from '@/components/peek/types';
import PeekablePressable from '@/components/PeekablePressable';
import RatingStars from '@/components/RatingStars';
import { ImageDTO } from '@/features/images/types/image-dto';
import Tag from '@/features/tags/components/Tag';
import { TagDTO } from '@/features/tags/types/tag-dto';

interface DishItemProps {
  name: string;
  comments: string | null;
  tags: TagDTO[];
  rating: number | null;
  images: ImageDTO[];
  previewData: PeekPreviewData;
  onPress?: () => void;
}

const DishItem = React.memo<DishItemProps>(({
  name,
  comments,
  tags,
  rating,
  images,
  previewData,
  onPress,
}) => {
  const imageUrl = images.length > 0 ? images[0].uri : null;

  return (
    <PeekablePressable
      previewData={previewData}
      onPress={onPress}
      scaleValue={1.03}
      className="bg-card dark:bg-dark-card p-4 rounded-xl mb-4 shadow-sm"
    >
      <View className="flex-row mb-2">
        {imageUrl ? (
          <Image
            source={imageUrl}
            style={{ width: 80, height: 80, borderRadius: 8 }}
            contentFit="cover"
            recyclingKey={`dish-${imageUrl}`}
            cachePolicy="memory-disk"
          />
        ) : (
          <View className="w-20 h-20 rounded-lg bg-gray-200 dark:bg-gray-700" />
        )}

        <View className="flex-1 ml-3">
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

      <View className="flex-row justify-end">
        <RatingStars value={rating} size={18} gap={2} readOnly />
      </View>
    </PeekablePressable>
  );
});

DishItem.displayName = 'DishItem';

export default DishItem;
