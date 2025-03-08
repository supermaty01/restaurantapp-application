import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Tag from '@/components/tags/Tag';

interface TagItemProps {
  label: string;
  color: string;
  onPress?: () => void;
}

const TagItem: React.FC<TagItemProps> = ({ label, color, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-white p-4 rounded-xl mb-4 shadow-sm flex-row items-center justify-between"
    >
      <Tag name={label} color={color} />
      <Ionicons name="chevron-forward-outline" size={20} color="#6b6b6b" />
    </TouchableOpacity>
  );
};

export default TagItem;
