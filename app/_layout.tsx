import React, { useContext } from 'react';
import { Stack } from "expo-router";
import { AuthContext, AuthProvider } from '../context/AuthContext';
import "../global.css";

function Routes() {
  const { userToken, loading } = useContext(AuthContext);

  if (loading) return null; // Aquí podrías mostrar una pantalla de carga

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {userToken ? (
        <>
          {/* Rutas protegidas (usuario autenticado) */}
          <Stack.Screen name="home" />
          {/* Agrega otras pantallas protegidas */}
        </>
      ) : (
        <>
          {/* Rutas de autenticación */}
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          {/* Puedes incluir la pantalla de registro */}
        </>
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}
