import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { TokenService } from '../storage/token';
import { API_CONFIG } from '../../config/api.config';
import { handleResponseInterceptor } from '../interceptors/response';

export { BACKEND_URL } from '../../config/api.config';

class ApiClient {
  private static instance: ApiClient;
  private client: AxiosInstance;

  private constructor() {
    this.client = axios.create(API_CONFIG);
    this.setupInterceptors();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private setupInterceptors(): void {
    // INTERCEPTEUR REQUÊTE
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = TokenService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        if (import.meta.env.DEV) {
          console.log(`🌐 [API] ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
      },
      (error: AxiosError) => {
        if (import.meta.env.DEV) {
          console.error('❌ [API] Request Error:', error);
        }
        return Promise.reject(error);
      }
    );

    // INTERCEPTEUR RÉPONSE — délégué à response.ts
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        if (import.meta.env.DEV) {
          console.log(`✅ [API] ${response.status} ${response.config.url}`);
        }
        return response;
      },
      (error: AxiosError) => handleResponseInterceptor(error) // 👈 tout est géré là-bas
    );
  }

  public getClient(): AxiosInstance {
    return this.client;
  }
}

const api = ApiClient.getInstance().getClient();
export default api;
export { api as apiClient };