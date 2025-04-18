import * as FileSystem from 'expo-file-system';

/**
 * Normaliza una ruta de imagen para asegurar que sea relativa al directorio de documentos actual
 * @param path Ruta de la imagen almacenada en la base de datos
 * @returns Ruta normalizada que funciona en la aplicación actual
 */
export function normalizeImagePath(path: string): string {
  // Si la ruta ya es una URI completa (http, https, data), devolverla tal cual
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }

  // Si la ruta ya incluye el directorio de documentos actual, devolverla tal cual
  if (path.startsWith(FileSystem.documentDirectory)) {
    return path;
  }

  // Si la ruta es relativa (solo el nombre del archivo), agregarle el directorio de documentos
  if (!path.includes('/')) {
    return `${FileSystem.documentDirectory}${path}`;
  }

  // Si la ruta incluye un directorio de documentos antiguo, extraer el nombre del archivo
  // y construir una nueva ruta con el directorio de documentos actual
  const fileName = path.split('/').pop();
  if (fileName) {
    return `${FileSystem.documentDirectory}${fileName}`;
  }

  // Si todo lo demás falla, devolver la ruta original
  return path;
}

/**
 * Convierte una ruta de imagen a una URI utilizable por los componentes de imagen
 * @param path Ruta de la imagen almacenada en la base de datos
 * @returns URI utilizable por los componentes de imagen
 */
export function imagePathToUri(path: string): string {
  return normalizeImagePath(path);
}
