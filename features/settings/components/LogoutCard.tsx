import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/context/ThemeContext';

interface LogoutCardProps {
  onPress: () => void;
}

const LogoutCard: React.FC<LogoutCardProps> = ({ onPress }) => {
  const { isDarkMode } = useTheme();
  return (
    <TouchableOpacity
      className="bg-card dark:bg-dark-card p-4 rounded-xl mb-4"
      onPress={onPress}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="log-out-outline" size={24} color={isDarkMode ? "#D05A48" : "#dc2626"} className="mr-2" />
          <Text className="text-lg font-bold text-destructive dark:text-dark-destructive ml-2">Cerrar sesión</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={20} color={isDarkMode ? "#777" : "#999"} />
      </View>
      <Text className="text-gray-600 dark:text-gray-400 mt-1">
        Cierra tu sesión actual
      </Text>
    </TouchableOpacity>
  );
};

export default LogoutCard;
