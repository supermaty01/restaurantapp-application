import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter, usePathname, useGlobalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/context/ThemeContext';
import { SHARE_FILE_EXTENSION } from '@/services/share/types';

export default function NotFoundScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const { isDarkMode } = useTheme();
  const [checking, setChecking] = useState(true);
  const [isFileImport, setIsFileImport] = useState(false);

  useEffect(() => {
    checkIfFileImport();
  }, []);

  const checkIfFileImport = async () => {
    try {
      // Get the initial URL that opened the app
      const initialUrl = await Linking.getInitialURL();
      console.log('NotFound - Initial URL:', initialUrl);
      console.log('NotFound - Pathname:', pathname);

      // Check if this looks like a file import (content:// or file:// URI, or contains .restoshare)
      const urlToCheck = initialUrl || pathname || '';

      // Check for various patterns that indicate a file import
      const isFileRelated =
        urlToCheck.includes(SHARE_FILE_EXTENSION) ||
        urlToCheck.includes('restoshare') ||
        urlToCheck.includes('content://') ||
        urlToCheck.includes('file://') ||
        urlToCheck.includes('provider') ||
        urlToCheck.includes('media/item');

      if (isFileRelated) {
        setIsFileImport(true);

        // Extract the content URI from the URL
        let fileUri = '';

        // Check if the URL is already a content:// URI
        if (urlToCheck.startsWith('content://')) {
          fileUri = urlToCheck;
        } else if (urlToCheck.startsWith('file://')) {
          fileUri = urlToCheck;
        } else {
          // Try to reconstruct the content:// URI from the path
          // The pathname often looks like: /com.whatsapp.provider.media/item/xxx
          let pathPart = pathname;
          if (pathPart.startsWith('/')) {
            pathPart = pathPart.substring(1);
          }

          // If the path looks like a content provider path, construct the content:// URI
          if (pathPart.includes('provider') || pathPart.includes('.')) {
            fileUri = 'content://' + pathPart;
          } else if (initialUrl) {
            // Try to use the initial URL directly
            fileUri = initialUrl;
          }
        }

        console.log('NotFound - Extracted file URI:', fileUri);

        if (fileUri) {
          // Navigate to import screen with the file URI
          setTimeout(() => {
            router.replace({
              pathname: '/import',
              params: { uri: encodeURIComponent(fileUri) }
            });
          }, 100);
          return;
        }
      }

      setChecking(false);
    } catch (error) {
      console.error('Error checking file import:', error);
      setChecking(false);
    }
  };

  if (checking || isFileImport) {
    return (
      <View className={`flex-1 justify-center items-center ${isDarkMode ? 'bg-dark-muted' : 'bg-muted'}`}>
        <ActivityIndicator size="large" color={isDarkMode ? '#7A9455' : '#93AE72'} />
        <Text className={`mt-4 text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Procesando...
        </Text>
      </View>
    );
  }

  return (
    <View className={`flex-1 justify-center items-center p-6 ${isDarkMode ? 'bg-dark-muted' : 'bg-muted'}`}>
      <Ionicons name="alert-circle-outline" size={64} color={isDarkMode ? '#888' : '#666'} />
      <Text className={`mt-4 text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        Página no encontrada
      </Text>
      <Text className={`mt-2 text-base text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        La página que buscas no existe.
      </Text>
      <TouchableOpacity
        className="mt-6 bg-primary dark:bg-dark-primary px-6 py-3 rounded-xl"
        onPress={() => router.replace('/')}
      >
        <Text className="text-white font-semibold">Volver al inicio</Text>
      </TouchableOpacity>
    </View>
  );
}

