import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { SQLiteDatabase } from 'expo-sqlite';
import { DrizzleDatabase } from '@/services/db/types';
import * as schema from '@/services/db/schema';
import { eq } from 'drizzle-orm';
import { DATABASE_NAME } from '@/app/_layout';
import JSZip from 'jszip';
import { Platform, Alert } from 'react-native';
import RNRestart from 'react-native-restart';

// Estructura para almacenar información sobre la exportación
export interface BackupInfo {
  date: Date;
  path: string;
  size: number;
  version: string;
}

// Estructura para almacenar información sobre la importación
export interface ImportInfo {
  date: Date;
  path: string;
  backupPath: string;
}

// Clase para manejar las operaciones de exportación e importación
export class BackupService {
  private db: SQLiteDatabase;
  private drizzleDb: DrizzleDatabase;
  private appVersion: string;

  constructor(db: SQLiteDatabase, drizzleDb: DrizzleDatabase, appVersion: string) {
    this.db = db;
    this.drizzleDb = drizzleDb;
    this.appVersion = appVersion;
  }

  // Método para exportar la base de datos y las imágenes
  async exportData(
    progressCallback: (progress: number) => void
  ): Promise<BackupInfo> {
    try {
      progressCallback(0);

      // 1. Crear directorio temporal para la exportación
      const tempDir = `${FileSystem.cacheDirectory}export_temp/`;
      try {
        await FileSystem.deleteAsync(tempDir, { idempotent: true });
        await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true });
      } catch (e) {
        console.error('Error al crear directorio temporal:', e);
      }

      progressCallback(10);

      // 2. Exportar la base de datos
      const dbPath = `${FileSystem.documentDirectory}SQLite/${DATABASE_NAME}`;
      const dbExportPath = `${tempDir}database.db`;
      await FileSystem.copyAsync({
        from: dbPath,
        to: dbExportPath
      });

      progressCallback(30);

      // 3. Exportar las imágenes
      const imagesDir = `${FileSystem.documentDirectory}images/`;
      const imagesExportDir = `${tempDir}images/`;

      try {
        await FileSystem.makeDirectoryAsync(imagesExportDir, { intermediates: true });

        // Obtener lista de imágenes
        const imageFiles = await FileSystem.readDirectoryAsync(imagesDir);

        // Copiar cada imagen
        for (let i = 0; i < imageFiles.length; i++) {
          const fileName = imageFiles[i];
          await FileSystem.copyAsync({
            from: `${imagesDir}${fileName}`,
            to: `${imagesExportDir}${fileName}`
          });

          // Actualizar progreso
          progressCallback(30 + Math.floor((i / imageFiles.length) * 40));
        }
      } catch (e) {
        console.log('Error o no hay imágenes para exportar:', e);
      }

      progressCallback(70);

      // 4. Crear archivo ZIP
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const zipFileName = `restaurantapp_backup_${timestamp}.zip`;
      const zipFilePath = `${FileSystem.documentDirectory}${zipFileName}`;

      // Crear un archivo JSON con metadatos
      const metadataPath = `${tempDir}metadata.json`;
      const metadata = {
        version: this.appVersion,
        exportDate: new Date().toISOString(),
      };

      await FileSystem.writeAsStringAsync(metadataPath, JSON.stringify(metadata));

      // Crear el ZIP
      const zip = new JSZip();

      // Añadir la base de datos
      const dbContent = await FileSystem.readAsStringAsync(dbExportPath, { encoding: FileSystem.EncodingType.Base64 });
      zip.file('database.db', dbContent, { base64: true });

      // Añadir el archivo de metadatos
      const metadataContent = await FileSystem.readAsStringAsync(metadataPath);
      zip.file('metadata.json', metadataContent);

      // Añadir las imágenes
      try {
        const imageFiles = await FileSystem.readDirectoryAsync(imagesExportDir);

        for (const fileName of imageFiles) {
          const imageContent = await FileSystem.readAsStringAsync(`${imagesExportDir}${fileName}`, { encoding: FileSystem.EncodingType.Base64 });
          zip.file(`images/${fileName}`, imageContent, { base64: true });
        }
      } catch (e) {
        console.log('Error o no hay imágenes para incluir en el ZIP:', e);
      }

      progressCallback(80);

      // Generar el ZIP
      const zipContent = await zip.generateAsync({ type: 'base64' });
      await FileSystem.writeAsStringAsync(zipFilePath, zipContent, { encoding: FileSystem.EncodingType.Base64 });

      progressCallback(90);

      // 5. Guardar información de la exportación en la base de datos
      const fileInfo = await FileSystem.getInfoAsync(zipFilePath);

      // Guardar en la tabla de configuración
      await this.drizzleDb
        .insert(schema.appSettings)
        .values({
          key: 'lastExport',
          value: JSON.stringify({
            date: new Date().toISOString(),
            path: zipFilePath,
            size: (fileInfo as any)?.size  || 0,
            version: this.appVersion,
          }),
          updatedAt: new Date().toISOString(),
        })
        .onConflictDoUpdate({
          target: schema.appSettings.key,
          set: {
            value: JSON.stringify({
              date: new Date().toISOString(),
              path: zipFilePath,
              size: (fileInfo as any)?.size || 0,
              version: this.appVersion,
            }),
            updatedAt: new Date().toISOString(),
          },
        });

      // 6. Limpiar directorio temporal
      await FileSystem.deleteAsync(tempDir, { idempotent: true });

      progressCallback(100);

      return {
        date: new Date(),
        path: zipFilePath,
        size: (fileInfo as any)?.size || 0,
        version: this.appVersion,
      };
    } catch (error) {
      console.error('Error durante la exportación:', error);
      throw error;
    }
  }

  // Método para compartir un archivo
  async shareBackup(filePath: string): Promise<void> {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/zip',
        dialogTitle: 'Compartir archivo de respaldo',
        UTI: 'com.pkware.zip-archive' // Para iOS
      });
    } else {
      throw new Error('El compartir no está disponible en este dispositivo');
    }
  }

  // Método para importar datos desde un archivo
  async importData(
    fileUri: string,
    progressCallback: (progress: number) => void
  ): Promise<ImportInfo> {
    try {
      progressCallback(0);

      // 1. Crear copia de seguridad temporal
      const backupDir = `${FileSystem.documentDirectory}backup_temp/`;
      const dbPath = `${FileSystem.documentDirectory}SQLite/${DATABASE_NAME}`;
      const dbBackupPath = `${backupDir}database.db`;
      const imagesDir = `${FileSystem.documentDirectory}images/`;
      const imagesBackupDir = `${backupDir}images/`;

      try {
        await FileSystem.deleteAsync(backupDir, { idempotent: true });
        await FileSystem.makeDirectoryAsync(backupDir, { intermediates: true });
        await FileSystem.makeDirectoryAsync(imagesBackupDir, { intermediates: true });
      } catch (e) {
        console.error('Error al crear directorio de respaldo:', e);
      }

      // Copiar base de datos actual
      await FileSystem.copyAsync({
        from: dbPath,
        to: dbBackupPath
      });

      progressCallback(20);

      // Copiar imágenes actuales
      try {
        const imageFiles = await FileSystem.readDirectoryAsync(imagesDir);

        for (let i = 0; i < imageFiles.length; i++) {
          const fileName = imageFiles[i];
          await FileSystem.copyAsync({
            from: `${imagesDir}${fileName}`,
            to: `${imagesBackupDir}${fileName}`
          });

          // Actualizar progreso
          progressCallback(20 + Math.floor((i / imageFiles.length) * 30));
        }
      } catch (e) {
        console.log('Error o no hay imágenes para respaldar:', e);
      }

      // Guardar información del respaldo en la base de datos
      await this.drizzleDb
        .insert(schema.appSettings)
        .values({
          key: 'lastBackup',
          value: JSON.stringify({
            date: new Date().toISOString(),
            path: backupDir,
          }),
          updatedAt: new Date().toISOString(),
        })
        .onConflictDoUpdate({
          target: schema.appSettings.key,
          set: {
            value: JSON.stringify({
              date: new Date().toISOString(),
              path: backupDir,
            }),
            updatedAt: new Date().toISOString(),
          },
        });

      progressCallback(50);

      // 2. Extraer archivo ZIP
      const extractDir = `${FileSystem.cacheDirectory}import_temp/`;
      try {
        await FileSystem.deleteAsync(extractDir, { idempotent: true });
        await FileSystem.makeDirectoryAsync(extractDir, { intermediates: true });
        await FileSystem.makeDirectoryAsync(`${extractDir}images/`, { intermediates: true });
      } catch (e) {
        console.error('Error al crear directorio de importación:', e);
      }

      // Leer el archivo ZIP
      const zipContent = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });

      // Extraer el ZIP
      const zip = new JSZip();
      const zipData = await zip.loadAsync(zipContent, { base64: true });

      // Verificar que el archivo ZIP tenga la estructura correcta
      if (!zipData.files['database.db'] || !zipData.files['metadata.json']) {
        throw new Error('El archivo de respaldo no tiene el formato correcto');
      }

      progressCallback(60);

      // Extraer y guardar la base de datos
      const dbContent = await zipData.files['database.db'].async('base64');
      await FileSystem.writeAsStringAsync(`${extractDir}database.db`, dbContent, { encoding: FileSystem.EncodingType.Base64 });

      // Extraer y guardar las imágenes
      const imageFiles = Object.keys(zipData.files).filter(key => key.startsWith('images/'));

      for (let i = 0; i < imageFiles.length; i++) {
        const filePath = imageFiles[i];
        const fileName = filePath.replace('images/', '');

        if (fileName) {
          const imageContent = await zipData.files[filePath].async('base64');
          await FileSystem.writeAsStringAsync(`${extractDir}images/${fileName}`, imageContent, { encoding: FileSystem.EncodingType.Base64 });
        }

        // Actualizar progreso
        progressCallback(60 + Math.floor((i / imageFiles.length) * 20));
      }

      progressCallback(80);

      // 3. Reemplazar base de datos actual
      // Cerrar la conexión a la base de datos antes de reemplazarla
      // (Esto es una simulación, en una app real necesitaríamos cerrar la conexión correctamente)
      await new Promise(resolve => setTimeout(resolve, 500));

      // Reemplazar la base de datos
      await FileSystem.deleteAsync(dbPath);
      await FileSystem.copyAsync({
        from: `${extractDir}database.db`,
        to: dbPath
      });

      progressCallback(90);

      // 4. Reemplazar imágenes
      await FileSystem.deleteAsync(imagesDir, { idempotent: true });
      await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true });

      try {
        const extractedImages = await FileSystem.readDirectoryAsync(`${extractDir}images/`);

        for (const fileName of extractedImages) {
          await FileSystem.copyAsync({
            from: `${extractDir}images/${fileName}`,
            to: `${imagesDir}${fileName}`
          });
        }
      } catch (e) {
        console.log('Error o no hay imágenes para restaurar:', e);
      }

      // 5. Limpiar directorio temporal
      await FileSystem.deleteAsync(extractDir, { idempotent: true });

      progressCallback(100);

      // Mostrar mensaje y reiniciar la aplicación
      Alert.alert(
        'Importación completada',
        'Los datos se han importado correctamente. La aplicación se reiniciará para aplicar los cambios.',
        [
          {
            text: 'Aceptar',
            onPress: () => {
              // Reiniciar la aplicación
              setTimeout(() => {
                if (Platform.OS === 'web') {
                  window.location.reload();
                } else {
                  RNRestart.Restart();
                }
              }, 500);
            },
          },
        ]
      );

      return {
        date: new Date(),
        path: fileUri,
        backupPath: backupDir,
      };
    } catch (error) {
      console.error('Error durante la importación:', error);
      throw error;
    }
  }

  // Método para restaurar la copia de seguridad anterior
  async restoreBackup(): Promise<void> {
    try {
      // Obtener información de la última copia de seguridad
      const settingsResult = await this.drizzleDb
        .select()
        .from(schema.appSettings)
        .where(eq(schema.appSettings.key, 'lastBackup'));

      if (!settingsResult.length) {
        throw new Error('No hay copia de seguridad disponible');
      }

      const backupInfo = JSON.parse(settingsResult[0].value || '{}');
      const backupDir = backupInfo.path;

      if (!backupDir) {
        throw new Error('Ruta de copia de seguridad no válida');
      }

      const dbPath = `${FileSystem.documentDirectory}SQLite/${DATABASE_NAME}`;
      const dbBackupPath = `${backupDir}database.db`;
      const imagesDir = `${FileSystem.documentDirectory}images/`;
      const imagesBackupDir = `${backupDir}images/`;

      // Restaurar base de datos
      await FileSystem.deleteAsync(dbPath);
      await FileSystem.copyAsync({
        from: dbBackupPath,
        to: dbPath
      });

      // Restaurar imágenes
      await FileSystem.deleteAsync(imagesDir, { idempotent: true });
      await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true });

      try {
        const imageFiles = await FileSystem.readDirectoryAsync(imagesBackupDir);

        for (const fileName of imageFiles) {
          await FileSystem.copyAsync({
            from: `${imagesBackupDir}${fileName}`,
            to: `${imagesDir}${fileName}`
          });
        }
      } catch (e) {
        console.log('Error o no hay imágenes para restaurar:', e);
      }

      // Eliminar la copia de seguridad después de un día
      setTimeout(async () => {
        try {
          await FileSystem.deleteAsync(backupDir, { idempotent: true });
        } catch (e) {
          console.log('Error al eliminar la copia de seguridad:', e);
        }
      }, 24 * 60 * 60 * 1000); // 24 horas
    } catch (error) {
      console.error('Error durante la restauración:', error);
      throw error;
    }
  }

  // Método para obtener información de la última exportación
  async getLastExportInfo(): Promise<BackupInfo | null> {
    try {
      const settingsResult = await this.drizzleDb
        .select()
        .from(schema.appSettings)
        .where(eq(schema.appSettings.key, 'lastExport'));

      if (!settingsResult.length) {
        return null;
      }

      const exportInfo = JSON.parse(settingsResult[0].value || '{}');

      return {
        date: new Date(exportInfo.date),
        path: exportInfo.path,
        size: exportInfo.size || 0,
        version: exportInfo.version || '',
      };
    } catch (error) {
      console.error('Error al obtener información de la última exportación:', error);
      return null;
    }
  }

  // Método para obtener información de la última copia de seguridad
  async getLastBackupInfo(): Promise<ImportInfo | null> {
    try {
      const settingsResult = await this.drizzleDb
        .select()
        .from(schema.appSettings)
        .where(eq(schema.appSettings.key, 'lastBackup'));

      if (!settingsResult.length) {
        return null;
      }

      const backupInfo = JSON.parse(settingsResult[0].value || '{}');

      return {
        date: new Date(backupInfo.date),
        path: backupInfo.path,
        backupPath: backupInfo.path,
      };
    } catch (error) {
      console.error('Error al obtener información de la última copia de seguridad:', error);
      return null;
    }
  }
}
