import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';

interface MapLocationPickerProps {
  location: { latitude: number; longitude: number } | null;
  onLocationChange: (location: { latitude: number; longitude: number } | null) => void;
}

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({ location, onLocationChange }) => {
  const [mapRegion, setMapRegion] = useState({
    latitude: 6.2442, // Medellín, Colombia
    longitude: -75.5812,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [selectedLocation, setSelectedLocation] = useState(location);
  const [address, setAddress] = useState<string | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);

  // Obtener la ubicación actual del usuario
  useEffect(() => {
    const getCurrentLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos permisos para acceder a la ubicación.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setMapRegion((prev) => ({
        ...prev,
        ...coords,
      }));
      setSelectedLocation(coords);
      onLocationChange(coords);
      fetchAddress(coords.latitude, coords.longitude);
    };

    getCurrentLocation();
  }, []);

  // Manejar la selección de ubicación en el mapa
  const handleMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const coords = { latitude, longitude };

    setSelectedLocation(coords);
    onLocationChange(coords);
    fetchAddress(latitude, longitude);
  };

  // Obtener una dirección legible a partir de las coordenadas
  const fetchAddress = async (latitude: number, longitude: number) => {
    setLoadingAddress(true);
    try {
      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocode.length > 0) {
        const addressInfo = geocode[0];
        const formattedAddress = `${addressInfo.street || 'Dirección desconocida'}, ${addressInfo.city || ''}, ${addressInfo.region || ''}`;
        setAddress(formattedAddress);
      } else {
        setAddress('Dirección no disponible');
      }
    } catch (error) {
      console.error('Error obteniendo la dirección:', error);
      setAddress('Error al obtener la dirección');
    }
    setLoadingAddress(false);
  };

  return (
    <View style={{ flex: 1, height: 300 }}>
      <MapView
        style={{ flex: 1 }}
        region={mapRegion}
        onPress={handleMapPress}
      >
        {selectedLocation && <Marker coordinate={selectedLocation} />}
      </MapView>

      <View style={{ padding: 10, alignItems: 'center' }}>
        {loadingAddress ? (
          <View style={{ marginVertical: 18 }}>
            <ActivityIndicator size="small" color="#000" />
          </View>
        ) : address ? (
          <Text style={{ textAlign: 'center', marginVertical: 8 }}>Ubicación seleccionada: {address}</Text>
        ) : (
          <Text style={{ textAlign: 'center', marginVertical: 8 }}>Toca el mapa para seleccionar una ubicación</Text>
        )}

        {selectedLocation && (
          <TouchableOpacity
            style={{ backgroundColor: 'blue', padding: 10, borderRadius: 5, marginTop: 10 }}
            onPress={() => {
              setSelectedLocation(null);
              onLocationChange(null);
              setAddress(null);
            }}
          >
            <Text style={{ color: 'white' }}>Borrar selección</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default MapLocationPicker;
