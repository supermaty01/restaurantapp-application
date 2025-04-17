import React from 'react';
import { View, Text } from 'react-native';
import { formatBytes, formatDate } from '../utils/formatters';
import { BackupInfo } from '@/services/backup/backupService';

interface InfoCardProps {
  appVersion: string;
  storageUsed: number;
  lastExport: BackupInfo | null;
}

const InfoCard: React.FC<InfoCardProps> = ({ appVersion, storageUsed, lastExport }) => {
  return (
    <View className="bg-white p-4 rounded-xl mb-4">
      <Text className="text-lg font-bold text-gray-800 mb-2">Información</Text>
      <View className="flex-row justify-between mb-2">
        <Text className="text-gray-600">Versión</Text>
        <Text className="text-gray-800">{appVersion}</Text>
      </View>
      <View className="flex-row justify-between mb-2">
        <Text className="text-gray-600">Almacenamiento usado</Text>
        <Text className="text-gray-800">{formatBytes(storageUsed)}</Text>
      </View>
      <View className="flex-row justify-between">
        <Text className="text-gray-600">Última exportación</Text>
        <Text className="text-gray-800">{formatDate(lastExport?.date)}</Text>
      </View>
    </View>
  );
};

export default InfoCard;
