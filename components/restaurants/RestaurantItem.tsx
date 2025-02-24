// components/RestaurantItem.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Interfaz para las etiquetas
 */
interface Tag {
  id: string;
  label: string;
  color: string; // Ej: "#FF0000", "#905c36", etc.
}

/**
 * Props para el componente RestaurantItem
 */
interface RestaurantItemProps {
  name: string;
  description: string;
  tags: Tag[];
  rating: number; // Número de estrellas (0-5)
  onPress?: () => void;
}

/**
 * Función para determinar el color de texto (blanco o negro)
 * según el color de fondo (hexColor), usando la fórmula YIQ.
 */
function getContrastYIQ(hexColor: string): string {
  // Elimina el "#" si existe
  const color = hexColor.replace(/^#/, '');
  // Parsea r, g, b
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  // Cálculo YIQ
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  // Si es >= 128, el fondo es claro => texto negro, si no => texto blanco
  return yiq >= 128 ? '#000000' : '#ffffff';
}

const RestaurantItem: React.FC<RestaurantItemProps> = ({
  name,
  description,
  tags,
  rating,
  onPress,
}) => {
  // Generar un arreglo de 5 estrellas, marcando las activas según rating
  const stars = Array.from({ length: 5 }, (_, i) => i < rating);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-white p-4 rounded-xl mb-4 shadow-sm"
    >
      {/* Encabezado con nombre y flecha a la derecha */}
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-base font-bold text-gray-800 max-w-[85%]">
          {name}
        </Text>
        <Ionicons name="chevron-forward-outline" size={20} color="#6b6b6b" />
      </View>

      {/* Descripción */}
      <Text className="text-sm text-gray-600 mb-2">
        {description}
      </Text>

      {/* Tags */}
      <View className="flex-row flex-wrap mb-2">
        {tags.map((tag) => {
          const textColor = getContrastYIQ(tag.color);
          return (
            <View
              key={tag.id}
              style={{ backgroundColor: tag.color }}
              className="px-2 py-1 rounded-full mr-2 mb-2"
            >
              <Text style={{ color: textColor }} className="text-xs">
                {tag.label}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Rating alineado a la derecha */}
      <View className="flex-row justify-end">
        {stars.map((active, index) => (
          <Ionicons
            key={index}
            name={active ? 'star' : 'star-outline'}
            size={20}
            color="#f4c430"
          />
        ))}
      </View>
    </TouchableOpacity>
  );
};

export default RestaurantItem;
