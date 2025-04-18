import * as FileSystem from 'expo-file-system';

/**
 * Asegura que los directorios necesarios para la aplicación existan
 * Esto es especialmente importante después de una desinstalación y reinstalación
 */
export async function ensureAppDirectories(): Promise<void> {
  try {
    // Asegurar que el directorio de imágenes exista
    const imagesDir = `${FileSystem.documentDirectory}images/`;
    const imagesDirInfo = await FileSystem.getInfoAsync(imagesDir);
    
    if (!imagesDirInfo.exists) {
      console.log('Creando directorio de imágenes...');
      await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true });
    }

    // Aquí se pueden agregar más directorios si es necesario
    
    console.log('Directorios de la aplicación verificados correctamente');
  } catch (error) {
    console.error('Error al verificar/crear directorios de la aplicación:', error);
  }
}
