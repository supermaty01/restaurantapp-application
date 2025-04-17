import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AuthContext } from '@/lib/context/AuthContext';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as MediaLibrary from 'expo-media-library';
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '@/services/db/schema';
import { eq } from 'drizzle-orm';
import { DATABASE_NAME } from '@/app/_layout';
import Constants from 'expo-constants';
import * as Application from 'expo-application';
import { BackupService, BackupInfo, ImportInfo } from '@/services/backup/backupService';

// Interfaz para la información de almacenamiento
interface StorageInfo {
  total: number;
  used: number;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useContext(AuthContext);
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [importProgress, setImportProgress] = useState(0);
  const [lastExport, setLastExport] = useState<BackupInfo | null>(null);
  const [lastBackup, setLastBackup] = useState<ImportInfo | null>(null);
  const [backupService, setBackupService] = useState<BackupService | null>(null);
  const [storageInfo, setStorageInfo] = useState({ total: 0, used: 0 });
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
        used: (dirInfo as any)?.size || 0,
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

  const handleExportData = async () => {
    if (!backupService) return;

    try {
      setIsExporting(true);
      setExportProgress(0);

      // Realizar la exportación utilizando el servicio
      const exportInfo = await backupService.exportData((progress) => {
        setExportProgress(progress);
      });

      // Actualizar la información de la última exportación
      setLastExport(exportInfo);

      // Ofrecer opciones para compartir o guardar
      Alert.alert(
        'Exportación completada',
        '¿Qué deseas hacer con el archivo de respaldo?',
        [
          {
            text: 'Compartir',
            onPress: async () => {
              try {
                await backupService.shareBackup(exportInfo.path);
              } catch (error) {
                Alert.alert('Error', 'No se pudo compartir el archivo');
              }
            },
          },
          {
            text: 'Guardar en Descargas',
            onPress: async () => {
              try {
                await backupService.saveBackupToDownloads(exportInfo.path);
                Alert.alert('Éxito', 'Archivo guardado en la carpeta de Descargas');
              } catch (error) {
                Alert.alert('Error', 'No se pudo guardar el archivo en Descargas');
              }
            },
          },
          {
            text: 'Cerrar',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Error durante la exportación:', error);
      Alert.alert('Error', 'No se pudo completar la exportación');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async () => {
    if (!backupService) return;

    try {
      // 1. Seleccionar archivo
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const fileUri = result.assets[0].uri;

      // 2. Verificar que sea un archivo válido
      Alert.alert(
        'Importar datos',
        'Esta acción reemplazará todos los datos actuales. ¿Deseas continuar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Continuar',
            style: 'destructive',
            onPress: async () => {
              try {
                setIsImporting(true);
                setImportProgress(0);

                // Realizar la importación utilizando el servicio
                const importInfo = await backupService.importData(fileUri, (progress) => {
                  setImportProgress(progress);
                });

                // Actualizar la información de la última copia de seguridad
                setLastBackup(importInfo);

                // Mostrar mensaje de éxito con opción de restaurar
                Alert.alert(
                  'Importación completada',
                  'Los datos se han importado correctamente. Es necesario reiniciar la aplicación para ver los cambios.',
                  [
                    {
                      text: 'Restaurar copia anterior',
                      style: 'destructive',
                      onPress: handleRestoreBackup,
                    },
                    {
                      text: 'Aceptar',
                      onPress: () => {
                        // En una app real, reiniciaríamos la aplicación
                        router.replace('/');
                      },
                    },
                  ]
                );
              } catch (error) {
                console.error('Error durante la importación:', error);
                Alert.alert('Error', 'No se pudo completar la importación');
                handleRestoreBackup();
              } finally {
                setIsImporting(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error al seleccionar archivo:', error);
      Alert.alert('Error', 'No se pudo seleccionar el archivo');
    }
  };

  const handleRestoreBackup = async () => {
    if (!backupService) return;

    try {
      Alert.alert(
        'Restaurar copia de seguridad',
        '¿Estás seguro de que deseas restaurar la copia de seguridad anterior?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Restaurar',
            style: 'destructive',
            onPress: async () => {
              try {
                // Restaurar la copia de seguridad utilizando el servicio
                await backupService.restoreBackup();

                Alert.alert(
                  'Restauración completada',
                  'La copia de seguridad se ha restaurado correctamente. Es necesario reiniciar la aplicación.',
                  [
                    {
                      text: 'Aceptar',
                      onPress: () => {
                        // En una app real, reiniciaríamos la aplicación
                        router.replace('/');
                      },
                    },
                  ]
                );
              } catch (error) {
                console.error('Error durante la restauración:', error);
                Alert.alert('Error', 'No se pudo restaurar la copia de seguridad');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error al restaurar copia de seguridad:', error);
      Alert.alert('Error', 'No se pudo restaurar la copia de seguridad');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ],
      { cancelable: true }
    );
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Nunca';
    return new Date(date).toLocaleString();
  };

  return (
    <ScrollView className="flex-1 bg-muted">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-800 mb-6">Configuración</Text>

        {/* Información de la app */}
        <View className="bg-white p-4 rounded-xl mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-2">Información</Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Versión</Text>
            <Text className="text-gray-800">{appVersion}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Almacenamiento usado</Text>
            <Text className="text-gray-800">{formatBytes(storageInfo.used)}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Última exportación</Text>
            <Text className="text-gray-800">{lastExport?.date ? formatDate(lastExport?.date) : 'Nunca'}</Text>
          </View>
        </View>

        {/* Exportar datos */}
        <TouchableOpacity
          className="bg-white p-4 rounded-xl mb-4"
          onPress={handleExportData}
          disabled={isExporting || isImporting}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="cloud-upload-outline" size={24} color="#905c36" className="mr-2" />
              <Text className="text-lg font-bold text-gray-800 ml-2">Exportar datos</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#999" />
          </View>
          <Text className="text-gray-600 mt-1">
            Crea una copia de seguridad de todos tus datos e imágenes
          </Text>

          {isExporting && (
            <View className="mt-4">
              <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <View
                  className="h-full bg-primary"
                  style={{ width: `${exportProgress}%` }}
                />
              </View>
              <Text className="text-center text-gray-600 mt-1">
                {exportProgress}% completado
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Importar datos */}
        <TouchableOpacity
          className="bg-white p-4 rounded-xl mb-4"
          onPress={handleImportData}
          disabled={isExporting || isImporting}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="cloud-download-outline" size={24} color="#905c36" className="mr-2" />
              <Text className="text-lg font-bold text-gray-800 ml-2">Importar datos</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#999" />
          </View>
          <Text className="text-gray-600 mt-1">
            Restaura tus datos desde una copia de seguridad
          </Text>

          {isImporting && (
            <View className="mt-4">
              <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <View
                  className="h-full bg-primary"
                  style={{ width: `${importProgress}%` }}
                />
              </View>
              <Text className="text-center text-gray-600 mt-1">
                {importProgress}% completado
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Cerrar sesión */}
        <TouchableOpacity
          className="bg-white p-4 rounded-xl mb-4"
          onPress={handleLogout}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="log-out-outline" size={24} color="#dc2626" className="mr-2" />
              <Text className="text-lg font-bold text-destructive ml-2">Cerrar sesión</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#999" />
          </View>
          <Text className="text-gray-600 mt-1">
            Cierra tu sesión actual
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
