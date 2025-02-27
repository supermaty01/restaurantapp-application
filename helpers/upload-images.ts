import api from "@/services/api";
import { Platform } from "react-native";

export async function uploadImages(
  selectedImages: string[],
  classType: 'RESTAURANT' | 'VISIT' | 'DISH',
  id: number,
) {
  const uploadPromises = selectedImages.map(uri => {
    const formData = new FormData();
    formData.append('class', classType);
    formData.append('id', id.toString());
    formData.append('image', {
      uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
      name: 'image.jpg',
      type: 'image/jpeg',
    } as any);

    return api.post('/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      transformRequest: (data, headers) => {
        return formData;
      },
    });
  });

  await Promise.all(uploadPromises);
}
