import React, { useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { useRestaurantMapList } from '@/features/restaurants/hooks/useRestaurantMapList';
import { useTheme } from '@/lib/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

export default function MapScreen() {
  const restaurants = useRestaurantMapList();
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const mapRef = useRef<MapView>(null);
  const [locating, setLocating] = useState(false);

  const initialRegion = useMemo(() => {
    if (restaurants.length > 0) {
      const lats = restaurants.map((r) => r.latitude);
      const lngs = restaurants.map((r) => r.longitude);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      return {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.max(maxLat - minLat, 0.01) * 1.5,
        longitudeDelta: Math.max(maxLng - minLng, 0.01) * 1.5,
      };
    }
    return {
      latitude: 6.2442,
      longitude: -75.5812,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }, [restaurants]);

  const centerOnUser = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso denegado',
          'Se requieren permisos para acceder a la ubicación. ¿Deseas ir a la configuración para habilitarlos?',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Abrir Configuración', onPress: () => Linking.openSettings() },
          ]
        );
        setLocating(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      mapRef.current?.animateToRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 800);
    } catch {
      Alert.alert('Error', 'No se pudo obtener la ubicación actual.');
    }
    setLocating(false);
  };

  return (
    <View className="flex-1 bg-card dark:bg-dark-card">
      <View style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          initialRegion={initialRegion}
          showsUserLocation={true}
          showsMyLocationButton={false}
        >
          {restaurants.map((restaurant) => (
            <Marker
              key={restaurant.id}
              coordinate={{
                latitude: restaurant.latitude,
                longitude: restaurant.longitude,
              }}
              title={restaurant.name}
              description={
                restaurant.rating ? `⭐ ${restaurant.rating}/5` : undefined
              }
              onCalloutPress={() =>
                router.push({
                  pathname: '/restaurants/[id]/view',
                  params: { id: restaurant.id },
                })
              }
            />
          ))}
        </MapView>
        <TouchableOpacity
          onPress={centerOnUser}
          disabled={locating}
          style={{
            position: 'absolute',
            bottom: 24,
            right: 16,
            backgroundColor: isDarkMode ? '#2A2A2A' : '#fff',
            borderRadius: 28,
            width: 48,
            height: 48,
            alignItems: 'center',
            justifyContent: 'center',
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
          }}
        >
          <Ionicons
            name="locate"
            size={24}
            color={isDarkMode ? '#B27A4D' : '#905c36'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
