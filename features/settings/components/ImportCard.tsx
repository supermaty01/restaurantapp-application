import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProgressBar from './ProgressBar';

interface ImportCardProps {
  onPress: () => void;
  isImporting: boolean;
  importProgress: number;
  disabled: boolean;
}

const ImportCard: React.FC<ImportCardProps> = ({ 
  onPress, 
  isImporting, 
  importProgress,
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
          <Ionicons name="cloud-download-outline" size={24} color="#905c36" className="mr-2" />
          <Text className="text-lg font-bold text-gray-800 ml-2">Importar datos</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={20} color="#999" />
      </View>
      <Text className="text-gray-600 mt-1">
        Restaura tus datos desde una copia de seguridad
      </Text>
      
      {isImporting && <ProgressBar progress={importProgress} />}
    </TouchableOpacity>
  );
};

export default ImportCard;
