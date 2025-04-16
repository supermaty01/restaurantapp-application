import React, { FC, useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormInput from '@/components/FormInput';
import { LoginFormData, loginSchema } from '@/features/auth/schemas/login';
import { NativeModules } from "react-native";
import { AuthContext } from '@/lib/context/AuthContext';
import Constants from 'expo-constants';

const LoginScreen: FC = () => {
  const { login, continueOffline } = useContext(AuthContext);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const DeviceInfo = NativeModules.DeviceInfo;
  const deviceName = DeviceInfo ? DeviceInfo.deviceName : 'Unknown';

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
    continueOffline();
    router.push('/restaurants');
  }

  return (
    <>
      <Text className="text-2xl font-bold mb-8 text-gray-800">
        {isOfflineMode ? "Modo sin conexión" : "Ingresa a tu cuenta"}
      </Text>
      <View className="w-full bg-white p-5 rounded-lg">
        {isOfflineMode ? (
          <View className="mb-6">
            <Text className="text-gray-700 text-base mb-4">
              Actualmente la aplicación funciona 100% local y no requiere conexión a internet.
              Todos tus datos se guardarán en tu dispositivo.
            </Text>
            <Text className="text-gray-700 text-base mb-4">
              En futuras versiones, se implementará un sistema de sincronización
              que te permitirá conservar tus datos si cambias de dispositivo o reinstalás la aplicación.
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
                <Text className="text-primary mb-6">Registrarme</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              className={`w-full py-4 rounded-lg items-center mb-6 ${isLoading ? 'bg-gray-400' : 'bg-primary'
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
          <Text className="text-white font-semibold text-base">Continuar sin cuenta</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default LoginScreen;
