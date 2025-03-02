import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useController, Control } from 'react-hook-form';

interface RatingStarsProps {
  control?: Control<any>;
  name?: string;
  value?: number | null;
  readOnly?: boolean;
  size?: number;
  gap?: number;
}

export default function RatingStars({
  control,
  name,
  value,
  readOnly = false,
  size = 24,
  gap = 4,
}: RatingStarsProps) {
  let ratingValue = 0;
  let onChange = (val: number) => { };

  if (control && name) {
    const {
      field: { onChange: formOnChange, value: formValue },
    } = useController({ control, name });
    ratingValue = formValue || 0;
    onChange = formOnChange;
  } else {
    ratingValue = value || 0;
  }

  const handlePress = (starIndex: number) => {
    if (readOnly) return;
    onChange(starIndex);
  };

  return value === null && !control ? (
    <Text className="text-base italic text-gray-500 mb-4">
      Sin calificación
    </Text>
  ) : (
    <View className="flex flex-row mb-4" style={{ gap }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => handlePress(star)}
          disabled={readOnly}
        >
          <Ionicons
            name={star <= ratingValue ? 'star' : 'star-outline'}
            size={size}
            color="#f4c430"
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}
