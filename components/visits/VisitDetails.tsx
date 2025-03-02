import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { VisitDTO } from '@/types/visit-dto'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

interface VisitDetailsProps {
  visit: VisitDTO;
}

export default function VisitDetails({ visit }: VisitDetailsProps) {

  return (
    <View className="p-4 h-full bg-white">
      <Text className="text-base font-bold text-gray-400 mb-2">Restaurante visitado</Text>
      <TouchableOpacity
        className="flex-row items-center py-3 border-b border-gray-200 mb-8"
        onPress={() =>
          router.push({ pathname: '/restaurants/[id]/view', params: { id: visit.restaurant.id } })
        }
      >
        <View className="flex-1">
          <Text className="text-base font-bold text-gray-800">{visit.restaurant.name}</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={20} color="#999" />
      </TouchableOpacity>


      <Text className="text-base font-bold text-gray-400 mb-2">Comentarios</Text>
      {visit.comments ? (
        <Text className="text-base text-[#4A4A4A] mb-4 py-3">
          {visit.comments}
        </Text>
      ) : (
        <Text className="text-base italic text-[#999] mb-4 py-3">
          Sin comentarios
        </Text>
      )}
    </View>
  );
}
