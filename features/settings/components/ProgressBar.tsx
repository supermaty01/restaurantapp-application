import React from 'react';
import { View, Text } from 'react-native';

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <View className="mt-4">
      <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <View
          className="h-full bg-primary"
          style={{ width: `${progress}%` }}
        />
      </View>
      <Text className="text-center text-gray-600 mt-1">
        {progress}% completado
      </Text>
    </View>
  );
};

export default ProgressBar;
