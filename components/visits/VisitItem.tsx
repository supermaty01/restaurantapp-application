import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VisitItemProps {
  date: string;
  title: string;
  description: string;
  onPress?: () => void;
}

const VisitItem: React.FC<VisitItemProps> = ({
  date,
  title,
  description,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-white p-4 rounded-xl mb-3 shadow-sm flex-row items-center justify-between"
    >
      {/* Contenedor de texto */}
      <View className="flex-1">
        <Text className="text-sm font-bold text-gray-800">
          {date} - <Text className="text-gray-900">{title}</Text>
        </Text>
        <Text className="text-xs text-gray-600">{description}</Text>
      </View>

      {/* Icono de flecha */}
      <Ionicons name="chevron-forward-outline" size={20} color="#6b6b6b" />
    </TouchableOpacity>
  );
};

export default VisitItem;
