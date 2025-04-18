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
    getAppVersion();
    getStorageInfo();
    initBackupService();
  }, []);

  const getAppVersion = async () => {
    try {
      const name = Application.applicationName || '';
      const version = Application.nativeApplicationVersion || '';
      const build = Application.nativeBuildVersion || '';
      if (Platform.OS === 'ios') {
        setAppVersion(`${name} v${version}`);
      } else {
        setAppVersion(`${name} v${version} (${build})`);
      }
    } catch (error) {
      console.error('Error al obtener versión de la app:', error);
    }
  };

  const getStorageInfo = async () => {
    try {
      const appDir = FileSystem.documentDirectory || '';
      const dirInfo = await FileSystem.getInfoAsync(appDir);
      const totalSpace = 4 * 1024 ** 3; // ~4GB
      setStorageInfo({
        total: totalSpace,
        used: (dirInfo as any).size || 0,
      });
    } catch (error) {
      console.error('Error al obtener información de almacenamiento:', error);
    }
  };

  const initBackupService = async () => {
    try {
      // Ahora BackupService solo recibe drizzleDb y appVersion
      const service = new BackupService(drizzleDb, appVersion);
      setBackupService(service);
      
      const exportInfo = await service.getLastExportInfo();
      setLastExport(exportInfo);
      
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
