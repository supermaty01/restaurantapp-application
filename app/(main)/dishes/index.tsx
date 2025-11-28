import React, { useState, useMemo } from 'react';
import { FlatList, TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DishItem from '@/features/dishes/components/DishItem';
import { useDishList } from '@/features/dishes/hooks/useDishList';
import FilterSortModal, { FilterSortOptions, defaultFilterSortOptions } from '@/components/FilterSortModal';
import PreviewModal, { PreviewData } from '@/components/PreviewModal';
import { useTheme } from '@/lib/context/ThemeContext';
import { DishListDTO } from '@/features/dishes/types/dish-dto';

export default function DishesScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  // Solo mostrar platos no eliminados en la lista principal
  const dishes = useDishList(false);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterSortOptions>(defaultFilterSortOptions);
  const [previewData, setPreviewData] = useState<PreviewData>(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  const handlePeek = (item: DishListDTO) => {
    setPreviewData({
      type: 'dish',
      id: item.id,
      name: item.name,
      comments: item.comments,
      rating: item.rating,
      tags: item.tags || [],
      imageUrl: item.images && item.images.length > 0 ? item.images[0].uri : undefined,
    });
    setPreviewVisible(true);
  };

  const handlePeekEnd = () => {
    setPreviewVisible(false);
  };

  // Check if any filter is active
  const hasActiveFilters = filterOptions.selectedTags.length > 0 ||
    filterOptions.minRating !== null ||
    filterOptions.sortField !== 'name' ||
    filterOptions.sortOrder !== 'asc';

  // Apply filters and sorting
  const filteredAndSortedDishes = useMemo(() => {
    let result = [...dishes];

    // Filter by tags (match any)
    if (filterOptions.selectedTags.length > 0) {
      result = result.filter((dish) =>
        filterOptions.selectedTags.some((filterTag) =>
          dish.tags?.some((tag) => tag.id === filterTag.id)
        )
      );
    }

    // Filter by minimum rating
    if (filterOptions.minRating !== null) {
      result = result.filter(
        (dish) => dish.rating !== null && dish.rating >= filterOptions.minRating!
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (filterOptions.sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (filterOptions.sortField === 'rating') {
        const ratingA = a.rating ?? 0;
        const ratingB = b.rating ?? 0;
        comparison = ratingA - ratingB;
      }
      return filterOptions.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [dishes, filterOptions]);

  return (
    <View className="flex-1 bg-muted dark:bg-dark-muted px-4 pt-2 relative">
      {/* Encabezado con título y botón de filtro */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-bold text-gray-800 dark:text-gray-200">Platos</Text>
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

      {/* Lista scrolleable de Platos */}
      <FlatList
        data={filteredAndSortedDishes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <DishItem
            name={item.name}
            comments={item.comments}
            rating={item.rating}
            tags={item.tags}
            images={item.images}
            onPress={() => router.push({
              pathname: '/dishes/[id]/view',
              params: { id: item.id },
            })}
            onPeek={() => handlePeek(item)}
            onPeekEnd={handlePeekEnd}
          />
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-10">
            <Text className="text-base text-gray-800 dark:text-gray-200">No se encontraron platos.</Text>
          </View>
        }
      />
      <TouchableOpacity
        onPress={() => router.push('/dishes/new')}
        className="absolute bottom-5 right-5 w-12 h-12 bg-primary dark:bg-dark-primary rounded-full items-center justify-center"
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      <FilterSortModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        options={filterOptions}
        onApply={setFilterOptions}
        entityType="dish"
      />

      <PreviewModal
        visible={previewVisible}
        onClose={handlePeekEnd}
        data={previewData}
      />
    </View>
  );
}