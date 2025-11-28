import React, { useRef, useState, useCallback } from 'react';
import { View, Text, Pressable, Image, Animated } from 'react-native';
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
  onPeek?: () => void;
  onPeekEnd?: () => void;
}

const RestaurantItem: React.FC<RestaurantItemProps> = ({
  name,
  comments,
  tags,
  rating,
  imageUrl,
  onPress,
  onPeek,
  onPeekEnd,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const peekTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isPeeking, setIsPeeking] = useState(false);

  // Normalizar la URL de la imagen si existe
  const normalizedImageUrl = imageUrl ? imagePathToUri(imageUrl) : undefined;

  const handlePressIn = useCallback(() => {
    // Start a short delay before triggering peek (150ms feels responsive)
    peekTimeout.current = setTimeout(() => {
      setIsPeeking(true);
      // Scale up animation
      Animated.spring(scaleAnim, {
        toValue: 1.03,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }).start();
      onPeek?.();
    }, 150);
  }, [onPeek, scaleAnim]);

  const handlePressOut = useCallback(() => {
    // Clear timeout if released before delay
    if (peekTimeout.current) {
      clearTimeout(peekTimeout.current);
      peekTimeout.current = null;
    }

    if (isPeeking) {
      // Scale down animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }).start();
      setIsPeeking(false);
      onPeekEnd?.();
    }
  }, [isPeeking, onPeekEnd, scaleAnim]);

  const handlePress = useCallback(() => {
    // Only trigger press if not peeking
    if (!isPeeking) {
      onPress?.();
    }
  }, [isPeeking, onPress]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => ({ opacity: pressed && !isPeeking ? 0.8 : 1 })}
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
              <Text className="text-sm text-gray-600 dark:text-gray-300 mb-1" numberOfLines={2}>
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
            return <Tag key={tag.id} color={tag.color} name={tag.name} />;
          })}
        </View>
        <View className="flex-row justify-end">
          <RatingStars value={rating} size={18} gap={2} readOnly />
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default RestaurantItem;
