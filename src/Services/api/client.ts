import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { TokenService } from '../storage/token';
import { toast } from 'react-hot-toast';

// Configuration de l'API
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

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
        console.error('❌ [API] Request Error:', error);
        return Promise.reject(error);
      }
    );

    // INTERCEPTEUR RÉPONSE (CORRIGÉ - ÉVITE LA BOUCLE)
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        if (import.meta.env.DEV) {
          console.log(`✅ [API] ${response.status} ${response.config.url}`);
        }
        return response;
      },
      (error: AxiosError) => {
        // Gestion 401 - Éviter la boucle infinie
        if (error.response?.status === 401) {
          const isLoginPage = window.location.pathname.includes('/login');
          
          if (!isLoginPage) {
            TokenService.clear();
            toast.error('Session expirée. Veuillez vous reconnecter.');
            
            setTimeout(() => {
              window.location.replace('/login');
            }, 100);
          } else {
            console.log('👤 Non authentifié, déjà sur login - pas de redirection');
          }
        }
        // Erreur 403 - Accès interdit
        else if (error.response?.status === 403) {
          toast.error("Vous n'avez pas les droits pour cette action");
        }
        // Erreur 404 - Ressource non trouvée
        else if (error.response?.status === 404) {
          toast.error('Ressource non trouvée');
        }
        // Erreur 422 - Validation
        else if (error.response?.status === 422) {
          const data = error.response.data as { error?: string };
          toast.error(data.error || 'Erreur de validation');
        }
        // Erreur 500 - Serveur
        else if (error.response?.status === 500) {
          toast.error('Erreur serveur. Veuillez réessayer plus tard.');
        }
        // Timeout
        else if (error.code === 'ECONNABORTED') {
          toast.error("Délai d'attente dépassé");
        }
        // Erreur réseau
        else if (!error.response) {
          toast.error('Impossible de contacter le serveur');
        }

        if (import.meta.env.DEV) {
          console.error('❌ [API] Response Error:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message
          });
        }
        return Promise.reject(error);
      }
    );
  }

  public getClient(): AxiosInstance {
    return this.client;
  }
}

// ✅ Export de l'instance par défaut ET nommée
const api = ApiClient.getInstance().getClient();
export default api;
export { api as apiClient };