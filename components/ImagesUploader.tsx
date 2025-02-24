import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '@/services/api';

interface ImagesUploaderProps {
  resourceClass: 'RESTAURANT' | 'PLATE' | string; // según tu API
  resourceId: string;
}

export default function ImagesUploader({
  resourceClass,
  resourceId,
}: ImagesUploaderProps) {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const pickImage = async (fromCamera = false) => {
    let result;
    if (fromCamera) {
      result = await ImagePicker.launchCameraAsync({ allowsEditing: true });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true });
    }
    if (!result.canceled && result.assets) {
      // result.assets[0].uri es la ruta local
      const uri = result.assets[0].uri;
      setSelectedImages([...selectedImages, uri]);
    }
  };

  const uploadImage = async (uri: string) => {
    const formData = new FormData();
    formData.append('class', resourceClass);
    formData.append('id', resourceId);
    // Ajusta 'image' según tu API
    formData.append('image', {
      uri,
      type: 'image/jpeg', // o image/png
      name: `photo_${Date.now()}.jpg`,
    } as any);

    try {
      await api.post('/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      Alert.alert('Éxito', 'Imagen subida correctamente');
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'No se pudo subir la imagen');
    }
  };

  return (
    <View className="mt-4">
      <Text className="text-base font-bold mb-2">Fotos</Text>
      {/* Botones para abrir cámara o galería */}
      <View className="flex-row mb-2">
        <TouchableOpacity
          className="bg-gray-300 px-3 py-2 rounded-md mr-2"
          onPress={() => pickImage(false)}
        >
          <Text>Seleccionar archivos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-gray-300 px-3 py-2 rounded-md"
          onPress={() => pickImage(true)}
        >
          <Text>Abrir cámara</Text>
        </TouchableOpacity>
      </View>

      {/* Previsualización de imágenes */}
      {selectedImages.map((uri) => (
        <View key={uri} className="mb-2">
          <Image
            source={{ uri }}
            className="w-full h-40 mb-2 rounded-md"
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={() => uploadImage(uri)}
            className="bg-primary px-3 py-2 rounded-md"
          >
            <Text className="text-white font-semibold">Subir</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}
