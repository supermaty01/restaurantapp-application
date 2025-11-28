import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/context/ThemeContext';
import RatingStars from '@/components/RatingStars';
import Tag from '@/features/tags/components/Tag';
import { TagDTO } from '@/features/tags/types/tag-dto';

export interface RestaurantPreviewData {
  type: 'restaurant';
  id: number;
  name: string;
  comments: string | null;
  rating: number | null;
  tags: TagDTO[];
  imageUrl?: string;
}

export interface DishPreviewData {
  type: 'dish';
  id: number;
  name: string;
  comments: string | null;
  rating: number | null;
  tags: TagDTO[];
  imageUrl?: string;
}

export interface VisitPreviewData {
  type: 'visit';
  id: number;
  date: string;
  restaurantName: string;
  comments: string | null;
  imageUrl?: string;
}

export type PreviewData = RestaurantPreviewData | DishPreviewData | VisitPreviewData | null;

interface PreviewModalProps {
  visible: boolean;
  onClose: () => void;
  data: PreviewData;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PreviewModal({ visible, data }: PreviewModalProps) {
  const { isDarkMode } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 30,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 30,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim]);

  if (!data && !visible) return null;

  const renderContent = () => {
    if (!data) return null;

    switch (data.type) {
      case 'restaurant':
        return (
          <>
            {data.imageUrl && (
              <View className="w-full rounded-lg mb-3 overflow-hidden bg-black/10">
                <Image
                  source={{ uri: data.imageUrl }}
                  className="w-full"
                  style={{ aspectRatio: 4 / 3 }}
                  resizeMode="contain"
                />
              </View>
            )}
            <Text className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
              {data.name}
            </Text>
            {data.rating !== null && (
              <View className="flex-row items-center mb-2">
                <RatingStars value={data.rating} size={18} gap={2} readOnly />
              </View>
            )}
            {data.tags.length > 0 && (
              <View className="flex-row flex-wrap mb-2">
                {data.tags.map((tag) => (
                  <Tag key={tag.id} name={tag.name} color={tag.color} />
                ))}
              </View>
            )}
            {data.comments && (
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                {data.comments}
              </Text>
            )}
          </>
        );

      case 'dish':
        return (
          <>
            {data.imageUrl && (
              <View className="w-full rounded-lg mb-3 overflow-hidden bg-black/10">
                <Image
                  source={{ uri: data.imageUrl }}
                  className="w-full"
                  style={{ aspectRatio: 4 / 3 }}
                  resizeMode="contain"
                />
              </View>
            )}
            <Text className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
              {data.name}
            </Text>
            {data.rating !== null && (
              <View className="flex-row items-center mb-2">
                <RatingStars value={data.rating} size={18} gap={2} readOnly />
              </View>
            )}
            {data.tags.length > 0 && (
              <View className="flex-row flex-wrap mb-2">
                {data.tags.map((tag) => (
                  <Tag key={tag.id} name={tag.name} color={tag.color} />
                ))}
              </View>
            )}
            {data.comments && (
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                {data.comments}
              </Text>
            )}
          </>
        );

      case 'visit':
        return (
          <>
            {data.imageUrl && (
              <View className="w-full rounded-lg mb-3 overflow-hidden bg-black/10">
                <Image
                  source={{ uri: data.imageUrl }}
                  className="w-full"
                  style={{ aspectRatio: 4 / 3 }}
                  resizeMode="contain"
                />
              </View>
            )}
            <Text className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
              {data.date}
            </Text>
            <View className="flex-row items-center mb-2">
              <Ionicons name="restaurant-outline" size={14} color={isDarkMode ? '#aaa' : '#666'} />
              <Text className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                {data.restaurantName}
              </Text>
            </View>
            {data.comments && (
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                {data.comments}
              </Text>
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Animated.View
      style={[
        styles.overlay,
        { opacity: fadeAnim },
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ scale: scaleAnim }],
            backgroundColor: isDarkMode ? '#2A2A2A' : '#fff',
          },
        ]}
      >
        {renderContent()}
        <View style={[styles.footer, { borderTopColor: isDarkMode ? '#444444' : '#E0E0E0' }]}>
          <Text style={{ color: isDarkMode ? '#888' : '#999', fontSize: 11, textAlign: 'center' }}>
            Suelta para cerrar
          </Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
    zIndex: 1000,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  footer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
});

