import { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import { TokenService } from '../storage/token';

// Évite les toasts dupliqués pour le même type d'erreur
const activeToasts = new Set<string>();

function showUniqueToast(id: string, fn: () => void) {
  if (activeToasts.has(id)) return;
  activeToasts.add(id);
  fn();
  setTimeout(() => activeToasts.delete(id), 4000);
}

export async function handleResponseInterceptor(error: AxiosError): Promise<never> {
  const originalRequest = error.config;
  const status = error.response?.status;

  // 401 — Session expirée
  if (status === 401 && originalRequest) {
    const isLoginPage = window.location.pathname.includes('/login');

    if (!isLoginPage) {
      TokenService.clear();
      showUniqueToast('session-expired', () =>
        toast('Session expirée. Veuillez vous reconnecter.', {
          icon: '🔒',
          duration: 4000,
          style: { background: '#FEF3C7', color: '#92400E', border: '1px solid #F59E0B' },
        })
      );
      setTimeout(() => window.location.replace('/login'), 1500);
    }
  }

  // 403 — Accès interdit
  if (status === 403) {
    showUniqueToast('forbidden', () =>
      toast("Accès refusé. Vous n'avez pas les droits nécessaires.", {
        icon: '🚫',
        duration: 5000,
        style: { background: '#FEF2F2', color: '#991B1B', border: '1px solid #FCA5A5' },
      })
    );
  }

  // 404 — Ressource introuvable
  if (status === 404) {
    toast("La ressource demandée est introuvable.", {
      icon: '🔍',
      duration: 4000,
      style: { background: '#F0F9FF', color: '#075985', border: '1px solid #7DD3FC' },
    });
  }

  // 422 — Erreur de validation
  if (status === 422) {
    const data = error.response?.data as { error?: string; message?: string };
    const message = data?.error || data?.message || 'Certaines informations saisies sont invalides.';
    toast(message, {
      icon: '⚠️',
      duration: 5000,
      style: { background: '#FFFBEB', color: '#92400E', border: '1px solid #FCD34D' },
    });
  }

  // 429 — Trop de requêtes
  if (status === 429) {
    showUniqueToast('rate-limit', () =>
      toast('Trop de tentatives. Veuillez patienter quelques instants.', {
        icon: '⏳',
        duration: 6000,
        style: { background: '#F5F3FF', color: '#5B21B6', border: '1px solid #C4B5FD' },
      })
    );
  }

  // 500 — Erreur serveur
  if (status === 500) {
    showUniqueToast('server-error', () =>
      toast('Une erreur inattendue est survenue. Réessayez dans un moment.', {
        icon: '🛠️',
        duration: 6000,
        style: { background: '#FEF2F2', color: '#991B1B', border: '1px solid #FCA5A5' },
      })
    );
  }

  // Pas de réponse — Erreur réseau
  if (!error.response) {
    showUniqueToast('network-error', () =>
      toast('Connexion impossible. Vérifiez votre réseau et réessayez.', {
        icon: '📡',
        duration: 6000,
        style: { background: '#F9FAFB', color: '#374151', border: '1px solid #D1D5DB' },
      })
    );
  }

  // Log en développement uniquement
  if (import.meta.env.DEV) {
    console.error('❌ [API] Erreur:', {
      url: error.config?.url,
      status,
      message: error.message,
      data: error.response?.data,
    });
  }

  return Promise.reject(error);
}
