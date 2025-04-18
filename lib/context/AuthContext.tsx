import { createContext, useState, useEffect, ReactNode, FC } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/services/api';
import { RegisterFormData } from '@/features/auth/schemas/register';
import { LoginFormData } from '@/features/auth/schemas/login';

interface AuthContextData {
  userToken: string | null;
  isOfflineMode: boolean;
  loading: boolean;
  login: (body: LoginFormData) => Promise<{ success: boolean; error?: string }>;
  register: (body: RegisterFormData) => Promise<{ success: boolean; data?: any; error?: string }>;
  logout: () => Promise<void>;
  continueOffline: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({
  userToken: null,
  isOfflineMode: false,
  loading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => { },
  continueOffline: async () => { },
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Al iniciar la app se verifica si hay un usuario autenticado o si el usuario está en modo offline
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const offline = await AsyncStorage.getItem('offlineMode');

        if (token) {
          setUserToken(token);
          setIsOfflineMode(false);
        } else if (offline === 'true') {
          setIsOfflineMode(true);
        }
      } catch (error) {
        console.log('Error al cargar el estado de autenticación', error);
      } finally {
        setLoading(false);
      }
    };
    loadAuthState();
  }, []);

  const login = async (body: LoginFormData): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.post('/auth/login', { ...body });
      const token = response.data.data.token;
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.removeItem('offlineMode'); // Elimina el modo offline si estaba activado
      setUserToken(token);
      setIsOfflineMode(false);
      return { success: true };
    } catch (error: any) {
      const message = error.response ? error.response.data.message : error.message;
      console.log('Error en login', message);
      return {
        success: false,
        error: message,
      };
    }
  };

  const register = async (body: RegisterFormData): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const response = await api.post('/auth/register', { ...body });
      return { success: true, data: response.data };
    } catch (error: any) {
      const message = error.response ? error.response.data.message : error.message;
      console.log('Error en registro', message);
      return {
        success: false,
        error: message,
      };
    }
  };

  const logout = async (): Promise<void> => {
    await AsyncStorage.removeItem('userToken');
    setUserToken(null);
    setIsOfflineMode(false); // Al cerrar sesión, el usuario puede elegir si continuar offline o no
  };

  const continueOffline = async (): Promise<void> => {
    await AsyncStorage.setItem('offlineMode', 'true');
    setIsOfflineMode(true);
    setUserToken(null); // Nos aseguramos de que no hay token en este modo
  };

  return (
    <AuthContext.Provider value={{ userToken, isOfflineMode, loading, login, register, logout, continueOffline }}>
      {children}
    </AuthContext.Provider>
  );
};
