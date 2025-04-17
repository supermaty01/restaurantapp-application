import { useState, useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '@/services/db/schema';
import * as FileSystem from 'expo-file-system';
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import { BackupService, BackupInfo, ImportInfo } from '@/services/backup/backupService';

interface StorageInfo {
  total: number;
  used: number;
}

export const useAppSettings = () => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [importProgress, setImportProgress] = useState(0);
  const [lastExport, setLastExport] = useState<BackupInfo | null>(null);
  const [lastBackup, setLastBackup] = useState<ImportInfo | null>(null);
  const [backupService, setBackupService] = useState<BackupService | null>(null);
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({ total: 0, used: 0 });
  const [appVersion, setAppVersion] = useState('');

  useEffect(() => {
    // Obtener versión de la app
    getAppVersion();
    // Obtener información de almacenamiento
    getStorageInfo();
    // Inicializar el servicio de backup
    initBackupService();
  }, []);

  const getAppVersion = async () => {
    if (Platform.OS === 'ios') {
      setAppVersion(`${Application.applicationName} v${Application.nativeApplicationVersion}`);
    } else {
      setAppVersion(`${Application.applicationName} v${Application.nativeApplicationVersion} (${Application.nativeBuildVersion})`);
    }
  };

  const getStorageInfo = async () => {
    try {
      const appDir = FileSystem.documentDirectory || '';
      const dirInfo = await FileSystem.getInfoAsync(appDir);
      
      // En algunos dispositivos, no podemos obtener el espacio total
      // Así que usamos un valor aproximado
      const totalSpace = 1024 * 1024 * 1024 * 4; // 4GB como aproximación
      
      setStorageInfo({
        total: totalSpace,
        used: dirInfo.size || 0,
      });
    } catch (error) {
      console.error('Error al obtener información de almacenamiento:', error);
    }
  };

  const initBackupService = async () => {
    try {
      const service = new BackupService(db, drizzleDb, appVersion);
      setBackupService(service);
      
      // Cargar información de la última exportación
      const exportInfo = await service.getLastExportInfo();
      setLastExport(exportInfo);
      
      // Cargar información de la última copia de seguridad
      const backupInfo = await service.getLastBackupInfo();
      setLastBackup(backupInfo);
    } catch (error) {
      console.error('Error al inicializar el servicio de backup:', error);
    }
  };

  return {
    db,
    drizzleDb,
    isExporting,
    setIsExporting,
    isImporting,
    setIsImporting,
    exportProgress,
    setExportProgress,
    importProgress,
    setImportProgress,
    lastExport,
    setLastExport,
    lastBackup,
    setLastBackup,
    backupService,
    storageInfo,
    appVersion,
  };
};
