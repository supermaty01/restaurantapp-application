import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VisitItemProps {
  imageUrl: string | null;
  date: string;
  title: string;
  comments: string;
  onPress?: () => void;
}

const VisitItem: React.FC<VisitItemProps> = ({
  imageUrl,
  date,
  title,
  comments,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-white p-4 rounded-xl mb-3 shadow-sm flex-row items-center justify-between"
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          className="w-14 h-14 rounded mr-3"
          resizeMode="cover"
        />
      ) : (
        <View className="w-14 h-14 rounded bg-gray-300 mr-3" />
      )}
      <View className="flex-1">
        <Text className="text-sm font-bold text-gray-800">
          {date} - <Text className="text-gray-900">{title}</Text>
        </Text>
        <Text className="text-xs text-gray-600">{comments}</Text>
      </View>

      <Ionicons name="chevron-forward-outline" size={20} color="#6b6b6b" />
    </TouchableOpacity>
  );
};

export default VisitItem;
