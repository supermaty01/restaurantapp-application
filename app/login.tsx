import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';

export default function LoginScreen() {
  return (
    <View className="flex-1 bg-muted">
      <View className="flex-1 px-5 py-8 items-center justify-center">
        <Image
          source={require('../assets/burger-logo.png')}
          className="mb-6"
          style={{ width: 128, height: 128 }}
        />
        <Text className="text-2xl font-bold mb-8 text-gray-800">
          Ingresa a tu cuenta
        </Text>

        <View className="w-full bg-white p-5 rounded-lg">
          <Text className="text-base mb-2 text-gray-800">
            Email
          </Text>
          <TextInput
            className="w-full h-12 px-4 mb-4 border border-gray-200 rounded-lg bg-white placeholder:text-gray-500"
            placeholder="Ingresa tu email"
            keyboardType="email-address"
          />

          <Text className="text-base mb-2 text-gray-800">
            Contraseña
          </Text>
          <TextInput
            className="w-full h-12 px-4 mb-4 border border-gray-200 rounded-lg bg-white placeholder:text-gray-500"
            placeholder="Ingresa tu contraseña"
            secureTextEntry
          />

          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity>
              <Text className="text-primary mb-6">
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text className="text-primary mb-6">
                Registrarme
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity className="w-full bg-primary py-4 rounded-lg items-center mb-6">
            <Text className="text-white font-semibold text-base">
              Iniciar sesión
            </Text>
          </TouchableOpacity>

          {/* <View className="flex-row items-center mb-6">
            <View className="flex-1 h-[1px] bg-gray-400" />
            <Text className="px-3 text-gray-600">
              O continúa con
            </Text>
            <View className="flex-1 h-[1px] bg-gray-400" />
          </View>

          <View className="flex flex-row justify-center gap-2">
            <TouchableOpacity className="w-12 h-12 border border-gray-200 rounded-lg bg-white items-center justify-center">
              <Text>fb</Text>
            </TouchableOpacity>
            <TouchableOpacity className="w-12 h-12 border border-gray-200 rounded-lg bg-white items-center justify-center">
              <Text>ms</Text>
            </TouchableOpacity>
            <TouchableOpacity className="w-12 h-12 border border-gray-200 rounded-lg bg-white items-center justify-center">
              <Text>G</Text>
            </TouchableOpacity>
          </View> */}
        </View>
      </View>
    </View>
  );
}