import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProgressBar from './ProgressBar';

interface ExportCardProps {
  onPress: () => void;
  isExporting: boolean;
  exportProgress: number;
  disabled: boolean;
}

const ExportCard: React.FC<ExportCardProps> = ({ 
  onPress, 
  isExporting, 
  exportProgress,
  disabled
}) => {
  return (
    <TouchableOpacity
      className="bg-white p-4 rounded-xl mb-4"
      onPress={onPress}
      disabled={disabled}
      style={{ opacity: disabled ? 0.7 : 1 }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="cloud-upload-outline" size={24} color="#905c36" className="mr-2" />
          <Text className="text-lg font-bold text-gray-800 ml-2">Exportar datos</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={20} color="#999" />
      </View>
      <Text className="text-gray-600 mt-1">
        Crea una copia de seguridad de todos tus datos e imágenes
      </Text>
      
      {isExporting && <ProgressBar progress={exportProgress} />}
    </TouchableOpacity>
  );
};

export default ExportCard;
