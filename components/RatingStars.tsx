import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useController, Control } from 'react-hook-form';

interface RatingStarsProps {
  control: Control<any>;
  name: string;
}

export default function RatingStars({ control, name }: RatingStarsProps) {
  const {
    field: { onChange, value },
  } = useController({ control, name });

  const rating = value || 0;

  const handlePress = (starIndex: number) => {
    onChange(starIndex);
  };

  return (
    <View className="flex flex-row mb-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => handlePress(star)}>
          <Ionicons
            name={star <= rating ? 'star' : 'star-outline'}
            size={24}
            color="#f4c430"
            style={{ marginRight: 4 }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}
