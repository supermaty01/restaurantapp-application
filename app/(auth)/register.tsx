import React, { FC, useContext, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormInput from '@/components/FormInput';
import { RegisterFormData, registerSchema } from '@/features/auth/schemas/register';
import { AuthContext } from '@/lib/context/AuthContext';

const RegisterScreen: FC = () => {
  const { register: registerUser } = useContext(AuthContext);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
      password_confirmation: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    const result = await registerUser(data);
    setIsLoading(false);

    if (result.success) {
      Alert.alert('Registro exitoso');
      router.push('/login');
    } else {
      Alert.alert('Error', result.error || 'Error desconocido');
    }
  };

  return (
    <>
      <Text className="text-2xl font-bold mb-8 text-gray-800">Regístrate</Text>
      <View className="w-full bg-white p-5 rounded-lg">
        <FormInput
          control={control}
          name="name"
          label="Nombre"
          placeholder="Ingresa tu nombre"
        />
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

        <FormInput
          control={control}
          name="password_confirmation"
          label="Confirmar Contraseña"
          placeholder="Confirma tu contraseña"
          secureTextEntry
        />

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          className={`w-full py-4 rounded-lg items-center mt-6 ${isLoading ? 'bg-gray-400' : 'bg-primary'
            }`}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">Registrarme</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/login')} className="mt-4">
          <Text className="text-primary">
            ¿Ya tienes una cuenta? Inicia sesión
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default RegisterScreen;
