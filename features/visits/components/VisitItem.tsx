import React, { useRef, useState, useCallback } from 'react';
import { Image, Text, Pressable, View, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VisitItemProps {
  imageUrl: string | null;
  date: string;
  title: string;
  comments: string | null;
  onPress?: () => void;
  onPeek?: () => void;
  onPeekEnd?: () => void;
  deleted?: boolean;
  restaurantDeleted?: boolean;
}

const VisitItem: React.FC<VisitItemProps> = ({
  imageUrl,
  date,
  title,
  comments,
  onPress,
  onPeek,
  onPeekEnd,
  deleted,
  restaurantDeleted,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const peekTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isPeeking, setIsPeeking] = useState(false);

  const handlePressIn = useCallback(() => {
    peekTimeout.current = setTimeout(() => {
      setIsPeeking(true);
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
    if (peekTimeout.current) {
      clearTimeout(peekTimeout.current);
      peekTimeout.current = null;
    }

    if (isPeeking) {
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
        style={({ pressed }) => ({
          opacity: (pressed && !isPeeking ? 0.8 : 1) * (deleted || restaurantDeleted ? 0.7 : 1),
        })}
        className="bg-card dark:bg-dark-card p-4 rounded-xl mb-3 shadow-sm flex-row items-center justify-between"
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className="w-14 h-14 rounded mr-3"
            resizeMode="cover"
          />
        ) : (
          <View className="w-14 h-14 rounded bg-gray-300 dark:bg-gray-700 mr-3" />
        )}
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="text-sm font-bold text-gray-800 dark:text-gray-200 flex-1">
              {date} - <Text className="text-gray-900 dark:text-gray-100">{title}</Text>
            </Text>
            {deleted && (
              <View className="bg-red-100 px-2 py-0.5 rounded ml-1">
                <Text className="text-red-600 text-xs">Eliminada</Text>
              </View>
            )}
            {restaurantDeleted && (
              <View className="bg-orange-100 px-2 py-0.5 rounded ml-1">
                <Text className="text-orange-600 text-xs">Rest. eliminado</Text>
              </View>
            )}
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
        </View>

        <Ionicons name="chevron-forward-outline" size={20} color="#6b6b6b" className="dark:text-gray-400" />
      </Pressable>
    </Animated.View>
  );
};

export default VisitItem;
