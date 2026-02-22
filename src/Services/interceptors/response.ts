import { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import { TokenService } from '../storage/token';

export async function handleResponseInterceptor(error: AxiosError): Promise<never> {
  const originalRequest = error.config;
  
  // Gestion des erreurs 401 (Non authentifié) - CORRIGÉ
  if (error.response?.status === 401 && originalRequest) {
    const isLoginPage = window.location.pathname.includes('/login');
    
    if (!isLoginPage) {
      TokenService.clear();
      toast.error('Session expirée. Veuillez vous reconnecter.');
      
      // Utiliser replace au lieu de href pour éviter la boucle
      setTimeout(() => {
        window.location.replace('/login');
      }, 100);
    } else {
      console.log('👤 Non authentifié, déjà sur login - pas de redirection');
    }
  }
  
  // Gestion des erreurs 403 (Accès interdit)
  if (error.response?.status === 403) {
    toast.error("Vous n'avez pas les droits pour effectuer cette action");
  }
  
  // Gestion des erreurs 422 (Validation)
  if (error.response?.status === 422) {
    const data = error.response.data as { error?: string };
    if (data.error) {
      toast.error(data.error);
    } else {
      toast.error('Erreur de validation des données');
    }
  }
  
  // Gestion des erreurs 500 (Serveur)
  if (error.response?.status === 500) {
    toast.error('Erreur serveur. Veuillez réessayer plus tard.');
  }
  
  // Gestion des erreurs réseau
  if (!error.response) {
    toast.error('Impossible de contacter le serveur. Vérifiez votre connexion.');
  }
  
  // Log en développement
  if (import.meta.env.DEV) {
    console.error('❌ [API] Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
  }
  
  return Promise.reject(error);
}