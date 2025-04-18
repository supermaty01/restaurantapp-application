import React, { FC, useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormInput from '@/components/FormInput';
import { LoginFormData, loginSchema } from '@/features/auth/schemas/login';
import { NativeModules } from "react-native";
import { AuthContext } from '@/lib/context/AuthContext';
import { useTheme } from '@/lib/context/ThemeContext';
import Constants from 'expo-constants';

const LoginScreen: FC = () => {
  const { login, continueOffline } = useContext(AuthContext);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const DeviceInfo = NativeModules.DeviceInfo;
  const deviceName = DeviceInfo ? DeviceInfo.deviceName : 'Unknown';
  const { isDarkMode } = useTheme();

  // Check if OFFLINE_MODE environment variable is set to "true"
  useEffect(() => {
    const offlineMode = Constants.expoConfig?.extra?.OFFLINE_MODE === "true";
    setIsOfflineMode(offlineMode);
  }, []);

  const {
    control,
    handleSubmit,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      device_name: deviceName || 'Unknown',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    const result = await login(data);
    setIsLoading(false);

    if (result.success) {
      Alert.alert('Inicio de sesión exitoso');
      router.push('/restaurants');
    } else {
      Alert.alert('Error', result.error || 'Error desconocido');
    }
  };

  const handleContinueOffline = async () => {
    await continueOffline();
    router.push('/restaurants');
  }

  return (
    <>
      <Text className="text-2xl font-bold mb-8 text-gray-800 dark:text-gray-200">
        {isOfflineMode ? "¡Bienvenido!" : "Ingresa a tu cuenta"}
      </Text>
      <View className="w-full bg-card dark:bg-dark-card p-5 rounded-lg">
        {isOfflineMode ? (
          <View className="mb-6">
            <Text className="text-gray-700 dark:text-gray-300 text-base mb-4">
              ¡Bienvenido a RestaurantApp! Tu compañero perfecto para guardar y organizar tus experiencias gastronómicas.
            </Text>
            <Text className="text-gray-700 dark:text-gray-300 text-base mb-4">
              Guarda tus restaurantes favoritos, platos que has probado y visitas realizadas. Añade fotos, calificaciones y etiquetas para personalizar tu experiencia.
            </Text>
            <Text className="text-gray-700 dark:text-gray-300 text-base mb-4">
              Puedes exportar e importar tus datos desde la pantalla de configuración para hacer copias de seguridad o transferirlos a otro dispositivo.
            </Text>
            <Text className="text-gray-700 dark:text-gray-300 text-base mb-4">
              Actualmente la app guarda todo en tu dispositivo, por lo que no es necesario registrarse.
              Quizás en un futuro se agregue la posibilidad de sincronizar tus datos con un servidor.
            </Text>
          </View>
        ) : (
          <>
            <FormInput
              control={control}
              name="email"
              label="Email"
              placeholder="Ingresa tu email"
              keyboardType="email-address"
            />

            <FormInput
              control={control}
              name="password"
              label="Contraseña"
              placeholder="Ingresa tu contraseña"
              secureTextEntry
            />

            <View className="flex-row justify-end items-center mb-4">
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text className="text-primary dark:text-dark-primary mb-6">Registrarme</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              className={`w-full py-4 rounded-lg items-center mb-6 ${isLoading ? 'bg-gray-400 dark:bg-gray-600' : 'bg-primary dark:bg-dark-primary'
                }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-base">Iniciar sesión</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          onPress={handleContinueOffline}
          className="w-full py-4 rounded-lg items-center bg-gray-600"
        >
          <Text className="text-white font-semibold text-base">Comenzar a usar la app</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default LoginScreen;
