// Types globaux pour votre application

// Type pour les rôles utilisateur
type UserRole = 'Administrateur' | 'Gestionnaire' | "Chef d'équipe" | 'Opérateur';

// Interface pour les données utilisateur dans le localStorage
interface StoredUser {
  id: number;
  nomUtilisateur: string;
  role: UserRole;
  coordination: string;
  agence: string;
  email?: string;
  telephone?: string;
}

// Extension de l'interface Window pour les propriétés personnalisées
interface Window {
  __APP_VERSION__: string;
  __API_URL__: string;
}

// Type pour les réponses API
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

// Type pour la pagination
interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Type pour les paramètres de requête
interface QueryParams {
  [key: string]: string | number | boolean | undefined | null;
}