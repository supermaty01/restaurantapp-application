import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import VisitItem from '@/features/visits/components/VisitItem'
import { useVisitList } from '@/features/visits/hooks/useVisitList';

export default function VisitsScreen() {
  const router = useRouter();
  const visits = useVisitList();

  return (
    <View className="flex-1 bg-muted px-4 pt-2 relative">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-bold text-gray-800">Visitas</Text>
      </View>

      <FlatList
        data={visits}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <VisitItem
            imageUrl={item.images && item.images.length > 0 ? item.images[0].uri : null}
            date={item.visited_at}
            title={item.restaurant.name}
            comments={item.comments}
            onPress={() => router.push({
              pathname: '/visits/[id]/view',
              params: { id: item.id },
            })}
          />
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-10">
            <Text className="text-base text-gray-800">No se encontraron visitas.</Text>
          </View>
        }
      />
      <TouchableOpacity
        onPress={() => router.push('/visits/new')}
        className="absolute bottom-5 right-5 w-12 h-12 bg-primary rounded-full items-center justify-center"
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
