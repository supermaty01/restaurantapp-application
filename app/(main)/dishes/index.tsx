import React, { useState, useMemo } from 'react';
import { FlatList, TouchableOpacity, View, Text, Image, useWindowDimensions, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DishItem from '@/features/dishes/components/DishItem';
import { useDishList } from '@/features/dishes/hooks/useDishList';
import FilterSortModal, { FilterSortOptions, defaultFilterSortOptions } from '@/components/FilterSortModal';
import PreviewModal, { PreviewData } from '@/components/PreviewModal';
import { useTheme } from '@/lib/context/ThemeContext';
import { usePeek } from '@/lib/context/PeekContext';
import { DishListDTO } from '@/features/dishes/types/dish-dto';
import RatingStars from '@/components/RatingStars';
import GridPeekItem from '@/components/GridPeekItem';

export default function DishesScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { setIsPeeking } = usePeek();

  // Solo mostrar platos no eliminados en la lista principal
  const dishes = useDishList(false);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterSortOptions>(defaultFilterSortOptions);
  const [previewData, setPreviewData] = useState<PreviewData>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [isGridView, setIsGridView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const { width } = useWindowDimensions();
  const numColumns = width >= 600 ? 3 : 2;

  const handlePeek = (item: DishListDTO) => {
    setScrollEnabled(false);
    setIsPeeking(true);
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
    setScrollEnabled(true);
    setIsPeeking(false);
  };

  // Check if any filter is active
  const hasActiveFilters = filterOptions.selectedTags.length > 0 ||
    filterOptions.minRating !== null ||
    filterOptions.sortField !== 'name' ||
    filterOptions.sortOrder !== 'asc';

  // Apply filters and sorting
  const filteredAndSortedDishes = useMemo(() => {
    let result = [...dishes];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter((d) => d.name.toLowerCase().includes(query));
    }

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
      } else if (filterOptions.sortField === 'created') {
        comparison = a.id - b.id;
      }
      return filterOptions.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [dishes, filterOptions, searchQuery]);

  return (
    <View className="flex-1 bg-muted dark:bg-dark-muted px-4 pt-2 relative">
      {/* Encabezado con título y botones */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-bold text-gray-800 dark:text-gray-200">Platos</Text>
        <View className="flex-row items-center" style={{ gap: 12 }}>
          <TouchableOpacity onPress={() => setIsGridView((v) => !v)}>
            <Ionicons
              name={isGridView ? 'list' : 'grid'}
              size={22}
              color={isDarkMode ? '#ccc' : '#666'}
            />
          </TouchableOpacity>
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
      </View>
      <View className="mb-3">
        <View className="flex-row items-center bg-card dark:bg-dark-card rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
          <Ionicons name="search" size={18} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
          <TextInput
            className="flex-1 ml-2 text-sm text-gray-800 dark:text-gray-200"
            placeholder="Buscar por nombre..."
            placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Lista scrolleable de Platos */}
      <FlatList
        key={isGridView ? `grid-${numColumns}` : 'list'}
        data={filteredAndSortedDishes}
        keyExtractor={(item) => item.id.toString()}
        numColumns={isGridView ? numColumns : 1}
        columnWrapperStyle={isGridView ? { gap: 8 } : undefined}
        scrollEnabled={scrollEnabled}
        renderItem={({ item }) => {
          const imageUrl = item.images && item.images.length > 0 ? item.images[0].uri : undefined;
          if (isGridView) {
            return (
              <GridPeekItem
                style={{ flex: 1 / numColumns }}
                onPress={() => router.push({
                  pathname: '/dishes/[id]/view',
                  params: { id: item.id },
                })}
                onPeek={() => handlePeek(item)}
                onPeekEnd={handlePeekEnd}
              >
                {imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={{ width: '100%', height: 100 }} resizeMode="cover" />
                ) : (
                  <View style={{ width: '100%', height: 100 }} className="bg-gray-200 dark:bg-gray-700" />
                )}
                <View className="p-2">
                  <Text className="text-sm font-bold text-gray-800 dark:text-gray-200" numberOfLines={1}>{item.name}</Text>
                  <View className="flex-row mt-1">
                    <RatingStars value={item.rating} size={12} gap={1} readOnly />
                  </View>
                </View>
              </GridPeekItem>
            );
          }
          return (
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
          );
        }}
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