import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';

interface MapLocationPickerProps {
  location: { latitude: number; longitude: number } | null;
  onLocationChange?: (location: { latitude: number; longitude: number } | null) => void;
  editable?: boolean;
}

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({ location, onLocationChange, editable = true }) => {
  const [mapRegion, setMapRegion] = useState({
    latitude: location?.latitude ?? 6.2442, // Medellín por defecto
    longitude: location?.longitude ?? -75.5812,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [selectedLocation, setSelectedLocation] = useState(location);
  const [address, setAddress] = useState<string | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);

  useEffect(() => {
    if (location) {
      fetchAddress(location.latitude, location.longitude);
    }
  }, [location]);

  // Manejar selección de ubicación en el mapa (Solo si `editable` es true)
  const handleMapPress = (event: MapPressEvent) => {
    if (!editable) return;

    const { latitude, longitude } = event.nativeEvent.coordinate;
    const coords = { latitude, longitude };

    setSelectedLocation(coords);
    onLocationChange && onLocationChange(coords);
    fetchAddress(latitude, longitude);
  };

  // Obtener dirección a partir de coordenadas
  const fetchAddress = async (latitude: number, longitude: number) => {
    setLoadingAddress(true);
    try {
      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocode.length > 0) {
        const addressInfo = geocode[0];
        const formattedAddress = `${addressInfo.street || 'Ubicación desconocida'}, ${addressInfo.city || ''}, ${addressInfo.region || ''}`;
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
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        region={mapRegion}
        onPress={handleMapPress}
        scrollEnabled={editable} // Deshabilita el desplazamiento si es solo vista
        zoomEnabled={editable} // Bloquea el zoom si no es editable
      >
        {selectedLocation && <Marker coordinate={selectedLocation} />}
      </MapView>

      <View style={{ padding: 10, alignItems: 'center' }}>
        {loadingAddress ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <Text style={{ textAlign: 'center', marginVertical: 8 }}>{address ?? 'Selecciona una ubicación'}</Text>
        )}

        {editable && selectedLocation && (
          <TouchableOpacity
            style={{ backgroundColor: 'blue', padding: 10, borderRadius: 5, marginTop: 10 }}
            onPress={() => {
              setSelectedLocation(null);
              onLocationChange && onLocationChange(null);
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
