import React, { useState, useMemo } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import VisitItem from '@/features/visits/components/VisitItem'
import { useVisitList } from '@/features/visits/hooks/useVisitList';
import { useRestaurantList } from '@/features/restaurants/hooks/useRestaurantList';
import FilterSortModal, { FilterSortOptions, defaultFilterSortOptions } from '@/components/FilterSortModal';
import PreviewModal, { PreviewData } from '@/components/PreviewModal';
import { useTheme } from '@/lib/context/ThemeContext';
import { VisitListDTO } from '@/features/visits/types/visit-dto';

export default function VisitsScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  // Solo mostrar visitas no eliminadas en la lista principal
  const visits = useVisitList(false);
  const restaurants = useRestaurantList(false);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterSortOptions>({
    ...defaultFilterSortOptions,
    sortField: 'date',
    sortOrder: 'desc',
  });
  const [previewData, setPreviewData] = useState<PreviewData>(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  const handlePeek = (item: VisitListDTO) => {
    setPreviewData({
      type: 'visit',
      id: item.id,
      date: item.visited_at,
      restaurantName: item.restaurant.name,
      comments: item.comments,
      imageUrl: item.images && item.images.length > 0 ? item.images[0].uri : undefined,
    });
    setPreviewVisible(true);
  };

  const handlePeekEnd = () => {
    setPreviewVisible(false);
  };

  // Get unique restaurants from visits for filtering
  const restaurantOptions = useMemo(() => {
    const uniqueRestaurants = new Map<number, { id: number; name: string }>();
    visits.forEach((visit) => {
      if (!uniqueRestaurants.has(visit.restaurant.id)) {
        uniqueRestaurants.set(visit.restaurant.id, {
          id: visit.restaurant.id,
          name: visit.restaurant.name,
        });
      }
    });
    return Array.from(uniqueRestaurants.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [visits]);

  // Check if any filter is active
  const hasActiveFilters = filterOptions.selectedRestaurantId !== null ||
    filterOptions.sortField !== 'date' ||
    filterOptions.sortOrder !== 'desc';

  // Apply filters and sorting
  const filteredAndSortedVisits = useMemo(() => {
    let result = [...visits];

    // Filter by restaurant
    if (filterOptions.selectedRestaurantId !== null) {
      result = result.filter(
        (visit) => visit.restaurant.id === filterOptions.selectedRestaurantId
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (filterOptions.sortField === 'date') {
        comparison = new Date(a.visited_at).getTime() - new Date(b.visited_at).getTime();
      } else if (filterOptions.sortField === 'restaurant') {
        comparison = a.restaurant.name.localeCompare(b.restaurant.name);
      }
      return filterOptions.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [visits, filterOptions]);

  return (
    <View className="flex-1 bg-muted dark:bg-dark-muted px-4 pt-2 relative">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-bold text-gray-800 dark:text-gray-200">Visitas</Text>
        <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
          <View className="relative">
            <Ionicons
              name="filter"
              size={24}
              color={hasActiveFilters ? (isDarkMode ? '#7A9455' : '#93AE72') : (isDarkMode ? '#ccc' : '#666')}
            />
            {hasActiveFilters && (
              <View className="absolute -top-1 -right-1 w-3 h-3 bg-primary dark:bg-dark-primary rounded-full" />
            )}
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredAndSortedVisits}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <VisitItem
            imageUrl={item.images && item.images.length > 0 ? item.images[0].uri : null}
            date={item.visited_at}
            title={item.restaurant.name}
            comments={item.comments}
            deleted={item.deleted}
            restaurantDeleted={item.restaurant.deleted}
            onPress={() => router.push({
              pathname: '/visits/[id]/view',
              params: { id: item.id },
            })}
            onPeek={() => handlePeek(item)}
            onPeekEnd={handlePeekEnd}
          />
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-10">
            <Text className="text-base text-gray-800 dark:text-gray-200">No se encontraron visitas.</Text>
          </View>
        }
      />
      <TouchableOpacity
        onPress={() => router.push('/visits/new')}
        className="absolute bottom-5 right-5 w-12 h-12 bg-primary dark:bg-dark-primary rounded-full items-center justify-center"
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      <FilterSortModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        options={filterOptions}
        onApply={setFilterOptions}
        entityType="visit"
        restaurants={restaurantOptions}
      />

      <PreviewModal
        visible={previewVisible}
        onClose={handlePeekEnd}
        data={previewData}
      />
    </View>
  );
}
