import { FC, useContext } from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthContext } from '../context/AuthContext';
import FormInput from '@/components/FormInput';

// Esquema de validación para el registro
const registerSchema = z
  .object({
    email: z
      .string()
      .nonempty({ message: 'El email es requerido' })
      .email({ message: 'Email inválido' }),
    password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
    confirmPassword: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

// Inferimos el tipo del formulario a partir del esquema
type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterScreen: FC = () => {
  const { register: registerUser } = useContext(AuthContext);
  const router = useRouter();

  const { control, handleSubmit } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    // Solo enviamos email y password al registro
    const result = await registerUser(data.email, data.password);
    if (result.success) {
      Alert.alert('Registro exitoso');
      // Redirige a la pantalla de login o a la pantalla principal
      router.push('/login');
    } else {
      Alert.alert('Error', result.error || 'Error desconocido');
    }
  };

  return (
    <View className="flex-1 bg-muted">
      <View className="flex-1 px-5 py-8 items-center justify-center">
        <Image
          source={require('../assets/burger-logo.png')}
          className="mb-6"
          style={{ width: 128, height: 128 }}
        />
        <Text className="text-2xl font-bold mb-8 text-gray-800">Regístrate</Text>
        <View className="w-full bg-white p-5 rounded-lg">
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
            name="confirmPassword"
            label="Confirmar Contraseña"
            placeholder="Confirma tu contraseña"
            secureTextEntry
          />

          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            className="w-full bg-primary py-4 rounded-lg items-center mt-6"
          >
            <Text className="text-white font-semibold text-base">Registrarme</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/login')} className="mt-4">
            <Text className="text-primary">
              ¿Ya tienes una cuenta? Inicia sesión
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default RegisterScreen;
