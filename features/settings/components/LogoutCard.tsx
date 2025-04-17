import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LogoutCardProps {
  onPress: () => void;
}

const LogoutCard: React.FC<LogoutCardProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      className="bg-white p-4 rounded-xl mb-4"
      onPress={onPress}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="log-out-outline" size={24} color="#dc2626" className="mr-2" />
          <Text className="text-lg font-bold text-destructive ml-2">Cerrar sesión</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={20} color="#999" />
      </View>
      <Text className="text-gray-600 mt-1">
        Cierra tu sesión actual
      </Text>
    </TouchableOpacity>
  );
};

export default LogoutCard;
