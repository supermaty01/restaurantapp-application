import { createContext, useState, useEffect, ReactNode, FC } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/services/api';

interface AuthContextData {
  userToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    password: string,
    others?: Record<string, unknown>
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({
  userToken: null,
  loading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => { },
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Al iniciar la app se busca si existe un token almacenado
  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          setUserToken(token);
        }
      } catch (error) {
        console.error('Error al cargar el token', error);
      } finally {
        setLoading(false);
      }
    };
    loadToken();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.post('/login', { email, password });
      const token = response.data.token;
      await AsyncStorage.setItem('userToken', token);
      setUserToken(token);
      return { success: true };
    } catch (error: any) {
      console.error('Error en login', error);
      return {
        success: false,
        error: error.response ? error.response.data : error.message,
      };
    }
  };

  const register = async (
    email: string,
    password: string,
    others: Record<string, unknown> = {}
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const response = await api.post('/register', { email, password, ...others });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error en registro', error);
      return {
        success: false,
        error: error.response ? error.response.data : error.message,
      };
    }
  };

  const logout = async (): Promise<void> => {
    await AsyncStorage.removeItem('userToken');
    setUserToken(null);
  };

  return (
    <AuthContext.Provider value={{ userToken, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

