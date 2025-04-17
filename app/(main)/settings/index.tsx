import React, { useContext } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '@/lib/context/AuthContext';
import * as DocumentPicker from 'expo-document-picker';
import { useAppSettings } from '@/features/settings/hooks/useAppSettings';
import InfoCard from '@/features/settings/components/InfoCard';
import ExportCard from '@/features/settings/components/ExportCard';
import ImportCard from '@/features/settings/components/ImportCard';
import LogoutCard from '@/features/settings/components/LogoutCard';
import { DBVersionContext } from '@/app/_layout';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useContext(AuthContext);
  const bumpDb = useContext(DBVersionContext);
  const {
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
    backupService,
    storageInfo,
    appVersion,
  } = useAppSettings();

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

      // Compartir el archivo automáticamente
      try {
        await backupService.shareBackup(exportInfo.path);
      } catch (error) {
        console.error('Error al compartir el archivo:', error);
        Alert.alert('Error', 'No se pudo compartir el archivo');
      }
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
                await backupService.importData(fileUri, (progress) => {
                  setImportProgress(progress);
                });
                bumpDb();
              } catch (error) {
                console.error('Error durante la importación:', error);
                Alert.alert('Error', 'No se pudo completar la importación');
                try {
                  await backupService.restoreBackup();
                } catch (e) {
                  console.error('Error al restaurar la copia de seguridad:', e);
                }
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

  return (
    <ScrollView className="flex-1 bg-muted">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-800 mb-6">Configuración</Text>

        {/* Información de la app */}
        <InfoCard
          appVersion={appVersion}
          storageUsed={storageInfo.used}
          lastExport={lastExport}
        />

        {/* Exportar datos */}
        <ExportCard
          onPress={handleExportData}
          isExporting={isExporting}
          exportProgress={exportProgress}
          disabled={isExporting || isImporting}
        />

        {/* Importar datos */}
        <ImportCard
          onPress={handleImportData}
          isImporting={isImporting}
          importProgress={importProgress}
          disabled={isExporting || isImporting}
        />

        {/* Cerrar sesión */}
        <LogoutCard onPress={handleLogout} />
      </View>
    </ScrollView>
  );
}
