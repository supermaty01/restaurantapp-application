import * as FileSystem from 'expo-file-system';

/**
 * Normaliza una ruta de imagen para asegurar que sea relativa al directorio de documentos actual
 * @param path Ruta de la imagen almacenada en la base de datos
 * @returns Ruta normalizada que funciona en la aplicación actual
 */
export function normalizeImagePath(path: string): string {
  // Si la ruta es nula o indefinida, devolver una cadena vacía
  if (!path) {
    console.warn('Se recibió una ruta de imagen nula o indefinida');
    return '';
  }

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

  // Extraer el nombre del archivo independientemente del directorio anterior
  // Esto es crucial para manejar casos de desinstalación/reinstalación
  const fileName = path.split('/').pop();
  if (fileName) {
    // Verificar si el archivo existe en el directorio de documentos actual
    const newPath = `${FileSystem.documentDirectory}${fileName}`;

    // Siempre devolver la ruta con el directorio actual, incluso si el archivo
    // no existe todavía (podría ser restaurado posteriormente)
    return newPath;
  }

  // Si todo lo demás falla, devolver la ruta original
  console.warn('No se pudo normalizar la ruta de imagen:', path);
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
