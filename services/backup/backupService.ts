import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { DrizzleDatabase } from '@/services/db/types';
import * as schema from '@/services/db/schema';
import { eq } from 'drizzle-orm';
import { IMAGES_DIR, SQLITE_DIR } from '@/lib/helpers/fs-paths';
import JSZip from 'jszip';
import { DATABASE_NAME } from '@/app/_layout';

export interface BackupInfo {
  date: Date;
  path: string;
  size: number;
  version: string;
}

export interface ImportInfo {
  date: Date;
  path: string;
  backupPath: string;
}

/**
 * Servicio para gestionar exportación, importación y restauración de datos e imágenes.
 */
export class BackupService {
  constructor(
    private drizzleDb: DrizzleDatabase,
    private appVersion: string
  ) {}

  /**
   * Exporta la base de datos y las imágenes, genera un ZIP y registra la info.
   */
  async exportData(progressCallback: (progress: number) => void): Promise<BackupInfo> {
    progressCallback(0);

    const tempDir = `${FileSystem.cacheDirectory}export_temp/`;
    await FileSystem.deleteAsync(tempDir, { idempotent: true });
    await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true });
    progressCallback(10);

    const dbSrc = `${SQLITE_DIR}${DATABASE_NAME}`;
    const dbTmp = `${tempDir}database.db`;
    await FileSystem.copyAsync({ from: dbSrc, to: dbTmp });
    progressCallback(30);

    const imageFiles = await FileSystem.readDirectoryAsync(IMAGES_DIR).catch(() => []);
    await FileSystem.makeDirectoryAsync(`${tempDir}images/`, { intermediates: true });
    for (let i = 0; i < imageFiles.length; i++) {
      const fn = imageFiles[i];
      await FileSystem.copyAsync({ from: `${IMAGES_DIR}${fn}`, to: `${tempDir}images/${fn}` });
      progressCallback(30 + Math.floor((i / imageFiles.length) * 40));
    }
    progressCallback(70);

    const zip = new JSZip();
    const db64 = await FileSystem.readAsStringAsync(dbTmp, { encoding: FileSystem.EncodingType.Base64 });
    zip.file('database.db', db64, { base64: true });
    zip.file('metadata.json', JSON.stringify({ version: this.appVersion, exportDate: new Date().toISOString() }));
    for (const fn of imageFiles) {
      const img64 = await FileSystem.readAsStringAsync(`${tempDir}images/${fn}`, { encoding: FileSystem.EncodingType.Base64 });
      zip.file(`images/${fn}`, img64, { base64: true });
    }
    progressCallback(80);

    const zip64 = await zip.generateAsync({ type: 'base64' });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const zipName = `restaurantapp_backup_${timestamp}.zip`;
    const zipPath = `${FileSystem.documentDirectory}${zipName}`;
    await FileSystem.writeAsStringAsync(zipPath, zip64, { encoding: FileSystem.EncodingType.Base64 });
    progressCallback(90);

    const info = await FileSystem.getInfoAsync(zipPath);
    await this.drizzleDb
      .insert(schema.appSettings)
      .values({
        key: 'lastExport',
        value: JSON.stringify({ date: new Date().toISOString(), path: zipPath, size: (info as any).size || 0, version: this.appVersion }),
        updatedAt: new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: schema.appSettings.key,
        set: {
          value: JSON.stringify({ date: new Date().toISOString(), path: zipPath, size: (info as any).size || 0, version: this.appVersion }),
          updatedAt: new Date().toISOString(),
        },
      });

    await FileSystem.deleteAsync(tempDir, { idempotent: true });
    progressCallback(100);

    return { date: new Date(), path: zipPath, size: (info as any).size || 0, version: this.appVersion };
  }

  /**
   * Comparte un backup ZIP si está disponible.
   */
  async shareBackup(filePath: string): Promise<void> {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, { mimeType: 'application/zip', dialogTitle: 'Compartir archivo de respaldo', UTI: 'com.pkware.zip-archive' });
    } else {
      throw new Error('Compartir no disponible');
    }
  }

  /**
   * Importa datos desde un ZIP: respalda estado, reemplaza DB e imágenes, y registra backup.
   */
  async importData(fileUri: string, progressCallback: (progress: number) => void): Promise<ImportInfo> {
    progressCallback(0);

    // 1) Respaldar estado actual (DB + imágenes)
    const backupDir = `${FileSystem.cacheDirectory}backup_temp/`;
    await FileSystem.deleteAsync(backupDir, { idempotent: true });
    await FileSystem.makeDirectoryAsync(backupDir, { intermediates: true });
    const dbCurrent = `${SQLITE_DIR}${DATABASE_NAME}`;
    await FileSystem.copyAsync({ from: dbCurrent, to: `${backupDir}database.db` });

    const existing = await FileSystem.readDirectoryAsync(IMAGES_DIR).catch(() => []);
    await FileSystem.makeDirectoryAsync(`${backupDir}images/`, { intermediates: true });
    for (let i = 0; i < existing.length; i++) {
      const fn = existing[i];
      await FileSystem.copyAsync({ from: `${IMAGES_DIR}${fn}`, to: `${backupDir}images/${fn}` });
      progressCallback(20 + Math.floor((i / existing.length) * 30));
    }

    // Registrar backup en la DB
    await this.drizzleDb
      .insert(schema.appSettings)
      .values({
        key: 'lastBackup',
        value: JSON.stringify({ date: new Date().toISOString(), path: backupDir }),
        updatedAt: new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: schema.appSettings.key,
        set: {
          value: JSON.stringify({ date: new Date().toISOString(), path: backupDir }),
          updatedAt: new Date().toISOString(),
        },
      });
    progressCallback(50);

    // 2) Extraer ZIP
    const extractDir = `${FileSystem.cacheDirectory}import_temp/`;
    await FileSystem.deleteAsync(extractDir, { idempotent: true });
    await FileSystem.makeDirectoryAsync(extractDir, { intermediates: true });
    await FileSystem.makeDirectoryAsync(`${extractDir}images/`, { intermediates: true });

    const zip64 = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
    const zip = await JSZip.loadAsync(zip64, { base64: true });
    if (!zip.files['database.db'] || !zip.files['metadata.json']) {
      throw new Error('El archivo de respaldo no tiene el formato correcto');
    }
    progressCallback(60);

    // 3) Reemplazar DB
    await FileSystem.deleteAsync(dbCurrent);
    const newDb64 = await zip.files['database.db'].async('base64');
    await FileSystem.writeAsStringAsync(dbCurrent, newDb64, { encoding: FileSystem.EncodingType.Base64 });
    progressCallback(80);

    // 4) Reemplazar Imágenes (evitar directorios)
    const extractImagesDir = `${extractDir}images/`;
    await FileSystem.makeDirectoryAsync(extractImagesDir, { intermediates: true });

    // Recorremos todas las entradas del ZIP
    for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
      // 1. Solo nos interesan ficheros, no directorios
      if (zipEntry.dir) continue;

      // 2. Solo las que estén bajo images/
      if (!relativePath.startsWith("images/")) continue;

      // 3. Extrayendo el nombre real del fichero (sin el prefijo images/)
      const filename = relativePath.replace(/^images\//, "");

      // 4. Leemos el contenido en Base64
      const fileBase64 = await zipEntry.async("base64");

      // 5. Lo escribimos en cache/import_temp/images/{filename}
      const tempFilePath = `${extractImagesDir}${filename}`;
      await FileSystem.writeAsStringAsync(tempFilePath, fileBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }

    // Ahora copiamos de cache/import_temp/images/ a nuestro IMAGES_DIR
    await FileSystem.deleteAsync(IMAGES_DIR, { idempotent: true });
    await FileSystem.makeDirectoryAsync(IMAGES_DIR, { intermediates: true });

    const extractedFiles = await FileSystem.readDirectoryAsync(extractImagesDir);
    for (const fn of extractedFiles) {
      await FileSystem.copyAsync({
        from: `${extractImagesDir}${fn}`,
        to: `${IMAGES_DIR}${fn}`,
      });
    }

    progressCallback(95);

    // 5) Limpieza
    await FileSystem.deleteAsync(extractDir, { idempotent: true });
    progressCallback(100);

    return { date: new Date(), path: fileUri, backupPath: backupDir };
  }

  /**
   * Restaura la última copia de seguridad.
   */
  async restoreBackup(): Promise<void> {
    const settings = await this.drizzleDb.select().from(schema.appSettings).where(eq(schema.appSettings.key, 'lastBackup'));
    if (!settings.length) {
      throw new Error('No hay copia de seguridad disponible');
    }
    const info = JSON.parse(settings[0].value || '{}');
    const backupDir = info.path;
    if (!backupDir) {
      throw new Error('Ruta de copia de seguridad no válida');
    }

    const dbCurrent = `${SQLITE_DIR}${DATABASE_NAME}`;
    await FileSystem.deleteAsync(dbCurrent);
    await FileSystem.copyAsync({ from: `${backupDir}database.db`, to: dbCurrent });

    await FileSystem.deleteAsync(IMAGES_DIR, { idempotent: true });
    await FileSystem.makeDirectoryAsync(IMAGES_DIR, { intermediates: true });
    const imgs = await FileSystem.readDirectoryAsync(`${backupDir}images/`).catch(() => []);
    for (const fn of imgs) {
      await FileSystem.copyAsync({ from: `${backupDir}images/${fn}`, to: `${IMAGES_DIR}${fn}` });
    }

    setTimeout(() => {
      FileSystem.deleteAsync(backupDir, { idempotent: true }).catch(() => {});
    }, 24 * 60 * 60 * 1000);
  }

  async getLastExportInfo(): Promise<BackupInfo | null> {
    const settings = await this.drizzleDb.select().from(schema.appSettings).where(eq(schema.appSettings.key, 'lastExport'));
    if (!settings.length) return null;
    const data = JSON.parse(settings[0].value || '{}');
    return { date: new Date(data.date), path: data.path, size: data.size || 0, version: data.version || '' };
  }

  async getLastBackupInfo(): Promise<ImportInfo | null> {
    const settings = await this.drizzleDb.select().from(schema.appSettings).where(eq(schema.appSettings.key, 'lastBackup'));
    if (!settings.length) return null;
    const data = JSON.parse(settings[0].value || '{}');
    return { date: new Date(data.date), path: data.path, backupPath: data.path };
  }
}
