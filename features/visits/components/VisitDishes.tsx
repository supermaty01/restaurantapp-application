import React from 'react';
import { View, Text, Image, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { VisitDetailsDTO } from '@/features/visits/types/visit-dto'

interface VisitDishesProps {
  visit: VisitDetailsDTO;
}

export default function VisitDishes({ visit }: VisitDishesProps) {
  const router = useRouter();

  return (
    <View className="p-4 h-full bg-white">
      <FlatList
        data={visit.dishes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              className="flex-row items-center py-3 border-b border-gray-200"
              onPress={() =>
                router.push({ pathname: '/dishes/[id]/view', params: { id: item.id } })
              }
            >
              <View className="w-14 h-14 rounded bg-gray-300 mr-3" />
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-800">{item.name}</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color="#999" />
            </TouchableOpacity>
          );
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-10">
            <Text className="text-base text-gray-800">No se encontraron platos.</Text>
          </View>
        }
      />
    </View>
  );
}
