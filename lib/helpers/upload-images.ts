import { images } from '@/services/db/schema';
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as FileSystem from 'expo-file-system';

export async function uploadImages(
  db: ReturnType<typeof drizzle>,
  selectedImages: string[],
  classType: 'RESTAURANT' | 'VISIT' | 'DISH',
  id: number,
) {
  const savePromises = selectedImages.map(async (uri) => {
    try {
      const filename = uri.split('/').pop();
      const newPath = `${FileSystem.documentDirectory}${filename}`;

      await FileSystem.copyAsync({
        from: uri,
        to: newPath,
      });

      const imageRecord: any = {
        path: newPath,
        uploadedAt: new Date().toISOString(),
      };

      if (classType === 'RESTAURANT') imageRecord.restaurantId = id;
      if (classType === 'VISIT') imageRecord.visitId = id;
      if (classType === 'DISH') imageRecord.dishId = id;

      await db.insert(images).values(imageRecord);

      return newPath;
    } catch (error) {
      console.error('Error al guardar la imagen localmente:', error);
      return null;
    }
  });

  const savedPaths = await Promise.all(savePromises);
  return savedPaths.filter(Boolean);
}
