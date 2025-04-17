import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Tag from '@/features/tags/components/Tag';

interface TagItemProps {
  label: string;
  color: string;
  onPress?: () => void;
  deleted?: boolean;
}

const TagItem: React.FC<TagItemProps> = ({ label, color, onPress, deleted }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-white p-4 rounded-xl mb-4 shadow-sm flex-row items-center justify-between"
      style={{ opacity: deleted ? 0.7 : 1 }}
    >
      <Tag name={label} color={color} deleted={deleted} />
      <Ionicons name="chevron-forward-outline" size={20} color="#6b6b6b" />
    </TouchableOpacity>
  );
};

export default TagItem;
