import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

interface LocationPickerProps {
  location: string | null; // Podrías guardar "lat,lng" como string
  onLocationChange: (loc: string | null) => void;
}

export default function LocationPicker({
  location,
  onLocationChange,
}: LocationPickerProps) {
  const [query, setQuery] = useState('');

  return (
    <View className="mb-4">
      <GooglePlacesAutocomplete
        placeholder="Buscar lugar"
        fetchDetails
        onPress={(data, details = null) => {
          // details.geometry.location => lat, lng
          if (details?.geometry.location) {
            const lat = details.geometry.location.lat;
            const lng = details.geometry.location.lng;
            const coordString = `${lat},${lng}`;
            onLocationChange(coordString);
          }
        }}
        onFail={(error) => console.log(error)}
        onChangeText={(text) => setQuery(text)}
        query={{
          key: 'TU_API_KEY', // Reemplaza con tu clave de Google
          language: 'es',
        }}
        styles={{
          textInputContainer: { backgroundColor: '#fff', borderRadius: 8 },
          textInput: { height: 40, color: '#5d5d5d', fontSize: 14 },
        }}
      />
      {location && (
        <Text className="text-sm mt-2 text-gray-600">
          Coordenadas seleccionadas: {location}
        </Text>
      )}
    </View>
  );
}
