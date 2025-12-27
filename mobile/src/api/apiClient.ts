// src/api/apiClient.ts
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ENV from '../config/env';
// import { ApiError } from '../types/api.types';

interface ApiError {
  message: string;
  errors?: any;
  statusCode: number;
}

// Chave para armazenar o token
const TOKEN_KEY = '@BarberBoss:token';

// Criar instância do Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: ENV.apiUrl,
  timeout: ENV.timeout,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Evita página de aviso do Ngrok
  },
});

// ========== REQUEST INTERCEPTOR ==========
// Adiciona o token automaticamente em todas as requisições
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      console.log(`📡 [${config.method?.toUpperCase()}] ${config.url}`);
      
      return config;
    } catch (error) {
      console.error('❌ Erro ao adicionar token:', error);
      return config;
    }
  },
  (error) => {
    console.error('❌ Erro no request interceptor:', error);
    return Promise.reject(error);
  }
);

// ========== RESPONSE INTERCEPTOR ==========
// Trata erros globalmente
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ [${response.status}] ${response.config.url}`);
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    console.error('❌ Erro na resposta:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });

    // Erro 401: Token inválido ou expirado
    if (error.response?.status === 401) {
      console.log('🔐 Token inválido - Fazendo logout...');
      await removeToken();
      // Nota: O AuthContext vai detectar a remoção do token e redirecionar para login
    }

    // Formatar erro para o frontend
    const apiError: ApiError = {
      message: error.response?.data?.message || 'Erro desconhecido',
      errors: error.response?.data?.errors,
      statusCode: error.response?.status || 500,
    };

    return Promise.reject(apiError);
  }
);

// ========== HELPER FUNCTIONS ==========

/**
 * Salva o token no AsyncStorage
 */
export const setToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    console.log('✅ Token salvo com sucesso');
  } catch (error) {
    console.error('❌ Erro ao salvar token:', error);
    throw error;
  }
};

/**
 * Remove o token do AsyncStorage
 */
export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    console.log('✅ Token removido com sucesso');
  } catch (error) {
    console.error('❌ Erro ao remover token:', error);
    throw error;
  }
};

/**
 * Busca o token do AsyncStorage
 */
export const getToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('❌ Erro ao buscar token:', error);
    return null;
  }
};

/**
 * Verifica se o usuário está autenticado
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getToken();
  return !!token;
};

export default apiClient;