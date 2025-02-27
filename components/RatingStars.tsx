import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useController, Control } from 'react-hook-form';

interface RatingStarsProps {
  control?: Control<any>;
  name?: string;
  value?: number;
  readOnly?: boolean;
}

export default function RatingStars({
  control,
  name,
  value,
  readOnly = false,
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

  return (
    <View className="flex flex-row mb-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => handlePress(star)}
          disabled={readOnly}
        >
          <Ionicons
            name={star <= ratingValue ? 'star' : 'star-outline'}
            size={24}
            color="#f4c430"
            style={{ marginRight: 4 }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}
