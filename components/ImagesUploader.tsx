import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface ImagesUploaderBaseProps {
  disabled?: boolean;
}

// Props para el modo creación (usa string[] para las imágenes)
interface ImagesUploaderCreateProps extends ImagesUploaderBaseProps {
  isEdit?: false;
  images: string[];
  onChangeImages: (newImages: string[]) => void;
}

// Tipo para imágenes en modo edición
export interface ImageItem {
  id?: number; // Si proviene de la BD, tendrá id
  uri: string;
}

// Props para el modo edición (usa ImageItem[] y callback para imagen eliminada)
interface ImagesUploaderEditProps extends ImagesUploaderBaseProps {
  isEdit: true;
  images: ImageItem[];
  onChangeImages: (newImages: ImageItem[]) => void;
  onRemoveExistingImage: (id: number) => void;
}

type ImagesUploaderProps = ImagesUploaderCreateProps | ImagesUploaderEditProps;

export default function ImagesUploader(props: ImagesUploaderProps) {
  const { disabled } = props;
  const isEdit = props.isEdit === true;

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      quality: 0.5,
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.canceled && result.assets?.length) {
      if (isEdit) {
        const newImages = result.assets.map((asset) => ({ uri: asset.uri }));
        props.onChangeImages([...props.images, ...newImages] as any);
      } else {
        const newImages = result.assets.map((asset) => asset.uri);
        props.onChangeImages([...props.images, ...newImages] as any);
      }
    }
  };

  const pickFromCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.5,
    });
    if (!result.canceled && result.assets?.length) {
      if (isEdit) {
        const newImages = result.assets.map((asset) => ({ uri: asset.uri }));
        props.onChangeImages([...props.images, ...newImages] as any);
      } else {
        const newImages = result.assets.map((asset) => asset.uri);
        props.onChangeImages([...props.images, ...newImages] as any);
      }
    }
  };

  const removeImage = (image: any) => {
    if (isEdit) {
      // En modo edición, image es de tipo ImageItem
      if (image.id && (props as ImagesUploaderEditProps).onRemoveExistingImage) {
        (props as ImagesUploaderEditProps).onRemoveExistingImage(image.id);
      }
      const newImages = (props.images as ImageItem[]).filter((img) => img.uri !== image.uri);
      props.onChangeImages(newImages as any);
    } else {
      // En modo creación, image es string
      const newImages = (props.images as string[]).filter((img) => img !== image);
      props.onChangeImages(newImages as any);
    }
  };

  return (
    <View className="mt-4">
      <Text className="text-base font-bold mb-2">Fotos</Text>
      <View className="flex-row mb-2">
        <TouchableOpacity
          className="bg-gray-300 px-3 py-2 rounded-md mr-2"
          onPress={pickFromGallery}
          disabled={disabled}
        >
          <Text>Seleccionar archivos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-gray-300 px-3 py-2 rounded-md"
          onPress={pickFromCamera}
          disabled={disabled}
        >
          <Text>Abrir cámara</Text>
        </TouchableOpacity>
      </View>
      {isEdit ? (
        (props.images as ImageItem[]).map((image) => (
          <View key={image.uri} className="mb-2">
            <Image
              source={{ uri: image.uri }}
              className="w-full h-40 mb-1 rounded-md"
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={() => removeImage(image)}
              className="bg-red-500 px-3 py-2 rounded-md w-24"
              disabled={disabled}
            >
              <Text className="text-white font-semibold">Eliminar</Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        (props.images as string[]).map((uri) => (
          <View key={uri} className="mb-2">
            <Image
              source={{ uri }}
              className="w-full h-40 mb-1 rounded-md"
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={() => removeImage(uri)}
              className="bg-red-500 px-3 py-2 rounded-md w-24"
              disabled={disabled}
            >
              <Text className="text-white font-semibold">Eliminar</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
}
