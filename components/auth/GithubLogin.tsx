import React, { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, Alert } from 'react-native';
import { Linking } from 'react-native';
import api from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GithubLogin = () => {
  // Función para manejar el deep link que llega a la app
  const handleDeepLink = async (event: { url: string }) => {
    console.log('Deep link recibido:', event.url);
    try {
      // Suponemos que el callback tiene el formato: restaurantapp://oauthredirect?token=TU_TOKEN
      const urlObj = new URL(event.url);
      const token = urlObj.searchParams.get('token');
      if (token) {
        // Guarda el token y, si tienes un AuthContext, actualízalo
        await AsyncStorage.setItem('userToken', token);
        console.log('Token almacenado:', token);
        Alert.alert('Autenticación exitosa', 'El token se ha guardado correctamente');
        // Aquí podrías navegar a otra pantalla o actualizar el contexto de autenticación
      } else {
        console.log('No se encontró token en el deep link.');
      }
    } catch (error) {
      console.error('Error procesando el deep link', error);
    }
  };

  useEffect(() => {
    // Escucha los eventos de deep linking mientras la app está en primer plano
    const linkingSubscription = Linking.addEventListener('url', handleDeepLink);

    // Verifica si la app fue abierta desde un deep link cuando se inicia
    (async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink({ url: initialUrl });
      }
    })();

    return () => {
      linkingSubscription.remove();
    };
  }, []);

  // Función que se ejecuta al presionar el botón de GitHub
  const handleGithubLogin = async () => {
    try {
      // Llama a tu endpoint que devuelve la URL de redireccionamiento de GitHub
      const response = await api.get('/auth/redirect/github');
      const { url } = response.data; // Se espera que la respuesta tenga una propiedad "url"
      if (url) {
        // Abre la URL en el navegador para iniciar el proceso de OAuth
        Linking.openURL(url);
      } else {
        console.error('La URL de redireccionamiento no se recibió correctamente.');
      }
    } catch (error) {
      console.log(error)
      console.error('Error al obtener la URL de GitHub', error);
      Alert.alert('Error', 'No se pudo iniciar la autenticación con GitHub');
    }
  };

  return (
    <View style={{ alignItems: 'center' }}>
      <TouchableOpacity
        onPress={handleGithubLogin}
        style={{
          borderWidth: 1,
          borderColor: 'gray',
          borderRadius: 8,
          padding: 16,
        }}
      >
        <Ionicons name="logo-github" size={28} color="gray" />
      </TouchableOpacity>
    </View>
  );
};

export default GithubLogin;
