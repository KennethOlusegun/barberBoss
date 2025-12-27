// src/api/apiClient.ts

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ApiError {
  message: string;
  errors?: any;
  statusCode: number;
}

// Chave para armazenar o token
const TOKEN_KEY = '@BarberBoss:token';

// Acessar variáveis de ambiente do Expo
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_BASE_URL_FALLBACK = process.env.EXPO_PUBLIC_API_BASE_URL_FALLBACK;
const API_TIMEOUT = process.env.EXPO_PUBLIC_API_TIMEOUT;

// ============================================================================
// 🔧 LOGS DE CONFIGURAÇÃO
// ============================================================================
console.log('🔧 API Client Configuration:');
console.log('  Base URL:', API_BASE_URL);
console.log('  Fallback:', API_BASE_URL_FALLBACK);
console.log('  Timeout:', API_TIMEOUT);

// Função para criar instância do Axios com fallback
function createApiClient(baseURL: string): AxiosInstance {
  return axios.create({
    baseURL,
    timeout: parseInt(API_TIMEOUT || '15000'),
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true', // IMPORTANTE para ngrok
    },
  });
}

let apiClient = createApiClient(API_BASE_URL || '');


// ========== REQUEST INTERCEPTOR ===========
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const timestamp = new Date().toISOString();
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Token attached');
      }
      console.log(`📤 [${timestamp}] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    } catch (error) {
      console.error('❌ Erro ao adicionar token:', error);
      return config;
    }
  },
  (error) => {
    console.error('❌ Request setup error:', error);
    return Promise.reject(error);
  }
);


// ========== RESPONSE INTERCEPTOR ===========
const MAX_RETRIES = 3;
let retryCount = 0;

apiClient.interceptors.response.use(
  (response) => {
    const timestamp = new Date().toISOString();
    console.log(`✅ [${timestamp}] ${response.status} ${response.config.url}`);
    console.log('📦 Response data:', JSON.stringify(response.data).substring(0, 100));
    retryCount = 0; // Reset ao sucesso
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const timestamp = new Date().toISOString();
    const status = error.response?.status;
    const url = error.config?.url;

    // Categorizar erro
    if (error.response) {
      // Erro HTTP
      console.error(`❌ [${timestamp}] HTTP ${status}`);
      console.error('📍 URL:', url);
      console.error('📦 Error data:', error.response.data);
      if (status === 401) {
        console.log('🔑 Token inválido - Fazendo logout...');
        await removeToken();
      }
    } else if (error.request) {
      // Sem resposta do servidor
      console.error(`❌ [${timestamp}] No response from server`);
      console.error('📍 URL:', url);
      console.error('🔧 Base URL:', API_BASE_URL);
      console.error('⏱️ Timeout:', API_TIMEOUT);
      console.error('🚨 Verifique se o ngrok está rodando');

      // Retry automático para falhas de rede
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(`🔄 Tentando novamente (${retryCount}/${MAX_RETRIES})...`);
        return apiClient.request(error.config!);
      } else {
        // Fallback para URL local se ngrok offline
        if (API_BASE_URL_FALLBACK && error.config) {
          console.log('⚡️ Fallback para URL local:', API_BASE_URL_FALLBACK);
          apiClient = createApiClient(API_BASE_URL_FALLBACK);
          retryCount = 0;
          return apiClient.request(error.config);
        }
      }
    } else {
      // Erro de configuração
      console.error(`❌ [${timestamp}] Request error:`, error.message);
    }

    // Mapear mensagens amigáveis
    let friendlyMessage = 'Erro desconhecido';
    if (status === 401) friendlyMessage = 'Não autenticado';
    else if (status === 403) friendlyMessage = 'Acesso não autorizado';
    else if (status === 404) friendlyMessage = 'Rota não encontrada';
    else if (status && status >= 500) friendlyMessage = 'Erro interno do servidor';
    else if (error.code === 'ECONNABORTED') friendlyMessage = 'Tempo de resposta excedido';

    const apiError: ApiError = {
      message: error.response?.data?.message || friendlyMessage,
      errors: error.response?.data?.errors,
      statusCode: status || 500,
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