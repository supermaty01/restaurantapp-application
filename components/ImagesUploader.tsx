import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface ImagesUploaderProps {
  images: string[];
  onChangeImages: (newImages: string[]) => void;
}

export default function ImagesUploader({
  images,
  onChangeImages,
}: ImagesUploaderProps) {
  // Seleccionar de galería
  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.canceled && result.assets?.length) {
      const uris = result.assets.map((asset) => asset.uri);
      onChangeImages([...images, ...uris]);
    }
  };

  // Tomar foto con la cámara
  const pickFromCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
    });
    if (!result.canceled && result.assets?.length) {
      const uris = result.assets.map((asset) => asset.uri);
      onChangeImages([...images, ...uris]);
    }
  };

  // Eliminar una imagen seleccionada antes de subir
  const removeImage = (uri: string) => {
    onChangeImages(images.filter((img) => img !== uri));
  };

  return (
    <View className="mt-4">
      <Text className="text-base font-bold mb-2">Fotos</Text>
      <View className="flex-row mb-2">
        <TouchableOpacity
          className="bg-gray-300 px-3 py-2 rounded-md mr-2"
          onPress={pickFromGallery}
        >
          <Text>Seleccionar archivos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-gray-300 px-3 py-2 rounded-md"
          onPress={pickFromCamera}
        >
          <Text>Abrir cámara</Text>
        </TouchableOpacity>
      </View>

      {/* Previsualización de imágenes (local) */}
      {images.map((uri) => (
        <View key={uri} className="mb-2">
          <Image
            source={{ uri }}
            className="w-full h-40 mb-1 rounded-md"
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={() => removeImage(uri)}
            className="bg-red-500 px-3 py-2 rounded-md w-24"
          >
            <Text className="text-white font-semibold">Eliminar</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}
