// ✅ BACKEND_URL : domaine racine sans /api
// Utilisé pour les liens directs (téléchargement, assets, etc.)
// .env dev  → VITE_BACKEND_URL=http://185.98.138.207
// .env prod → VITE_BACKEND_URL=https://gescardcocody.com
export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/api$/, '');

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    verify: '/auth/verify',
    profile: '/profil',
    changePassword: '/profil/change-password',
  },
  cartes: {
    list: '/cartes',
    detail: (id: number) => `/cartes/${id}`,
    create: '/cartes',
    update: (id: number) => `/cartes/${id}`,
    delete: (id: number) => `/cartes/${id}`,
  },
  utilisateurs: {
    list: '/utilisateurs',
    detail: (id: number) => `/utilisateurs/${id}`,
    create: '/utilisateurs',
    update: (id: number) => `/utilisateurs/${id}`,
  },
  statistiques: {
    globales: '/statistiques/globales',
    sites: '/statistiques/sites',
  },
  journal: {
    list: '/journal',
    annuler: (id: number) => `/journal/${id}/annuler`,
  },
};