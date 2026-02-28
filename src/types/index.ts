import type { ReactNode } from 'react';

// ========================================
// TYPES API
// ========================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface ApiError {
  success: false;
  error: string;
  code: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface QueryParams {
  [key: string]: string | number | boolean | undefined | null;
}

// ========================================
// TYPES AUTHENTIFICATION
// ========================================

export type UserRole = 'Administrateur' | 'Gestionnaire' | "Chef d'équipe" | 'Opérateur';

export interface LoginCredentials {
  NomUtilisateur: string;
  MotDePasse: string;
}

export interface AuthResponse {
  token: string;
  utilisateur: Utilisateur;
}

// ✅ CORRIGÉ: Ajout de nomComplet
export interface Utilisateur {
  id: number;
  nomUtilisateur: string;
  nomComplet: string;                    // ← AJOUTÉ (nom complet pour affichage)
  role: UserRole;
  coordination: string;
  agence: string;
  email?: string;
  telephone?: string;
  actif: boolean;
  dateCreation: string;
  derniereConnexion?: string;
}

export interface DecodedToken {
  id: number;
  nomUtilisateur: string;
  role: UserRole;
  coordination: string;
  exp: number;
  iat: number;
}

// ========================================
// TYPES CARTES
// ========================================

export interface Carte {
  id: number;
  codeCarte?: string;
  nom?: string;
  prenom?: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  delivrance?: boolean;
  contactRetrait?: string;
  dateDelivrance?: string;
  coordination: string;
  dateCreation: string;
  dateModification?: string;
  createurId?: number;
  moderateurId?: number;
}

export interface CarteFormData {
  codeCarte?: string;
  nom?: string;
  prenom?: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  delivrance?: boolean;
  contactRetrait?: string;
  dateDelivrance?: string;
  coordination?: string;
}

export interface ChefEquipeEditFields {
  delivrance?: boolean;
  contactRetrait?: string;
  dateDelivrance?: string;
}

// ========================================
// ✅ TYPES STATISTIQUES CORRIGÉS
// ========================================

export interface StatistiquesGlobales {
  total: number;                    // total_cartes
  retires: number;                  // cartes_retirees
  restants: number;                 // cartes_restantes
  tauxRetrait: number;              // taux de retrait en %
  metadata?: {
    sites_actifs: number;
    beneficiaires_uniques: number;
    premiere_importation: string;
    derniere_importation: string;
  };
}

export interface StatistiqueSite {
  site: string;                     // Nom du site
  total: number;                    // Total des cartes pour ce site
  retires: number;                  // Cartes retirées (délivrées)
  restants: number;                 // Cartes en attente
  tauxRetrait: number;              // Taux de retrait en %
}

// Types pour compatibilité avec l'ancien code
export interface StatistiquesGlobalesLegacy {
  totalCartes: number;
  cartesDelivrees: number;
  cartesNonDelivrees: number;
  parCoordination: {
    coordination: string;
    total: number;
    delivrees: number;
  }[];
  evolutionJournaliere: {
    date: string;
    creations: number;
    modifications: number;
    delivrances: number;
  }[];
}

export interface StatistiqueSiteLegacy {
  site: string;
  total: number;
  delivrees: number;
  enAttente: number;
}

// ========================================
// TYPES JOURNAL
// ========================================

export type ActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'IMPORT' | 'EXPORT';

export interface ActionJournal {
  id: number;
  type: ActionType;
  description: string;
  utilisateurId: number;
  utilisateurNom: string;
  role: UserRole;
  coordination: string;
  carteId?: number;
  ancienneValeur?: unknown;
  nouvelleValeur?: unknown;
  dateAction: string;
  ipAddress?: string;
  annulee: boolean;
}

export interface AnnulationResponse {
  success: boolean;
  message: string;
  actionAnnulee: ActionJournal;
}

// ========================================
// TYPES ÉVÉNEMENTS
// ========================================

export interface DashboardRefreshEventDetail {
  force?: boolean;
  timestamp?: number;
  source?: string;
}

export type DashboardRefreshEvent = CustomEvent<DashboardRefreshEventDetail>;

export interface BroadcastMessage {
  type: 'data_updated' | 'refresh_needed' | 'user_action';
  timestamp: number;
  forceRefresh?: boolean;
  source?: string;
  data?: unknown;
}

// ========================================
// TYPES PROPS REACT
// ========================================

export interface ChildrenProps {
  children: ReactNode;
}

export interface ClassNameProps {
  className?: string;
}

export interface LoadingProps {
  loading?: boolean;
}

export interface DisabledProps {
  disabled?: boolean;
}

export interface OnClickProps {
  onClick?: () => void;
}

// ========================================
// TYPES UTILITAIRES
// ========================================

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ErrorWithMessage {
  message: string;
  code?: string;
  status?: number;
}

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ID = string | number;

// ========================================
// CONSTANTES PARTAGÉES
// ========================================

export const AGENCES = [
  'BINGERVILLE',
  'CHU D\'ANGRÉ',
  'Lycée hôtelier',
  'ADJAMÉ',
  'BÂTIMENT U DE L\'UNIVERSITÉ FELIX-HOUPHOUET COCODY',
  'VICE-PRÉSIDENCE DE L\'UNIVERSITÉ FELIX-HOUPHOUET COCODY'
] as const;

export type Agence = typeof AGENCES[number];

export const ROLES: UserRole[] = ['Administrateur', 'Gestionnaire', "Chef d'équipe", 'Opérateur'];

// ========================================
// TYPES POUR LES RÉPONSES API SPÉCIFIQUES
// ========================================

export interface ImportStats {
  imported: number;
  updated: number;
  duplicates: number;
  errors: number;
}

export interface ImportResponse extends ApiResponse {
  stats?: ImportStats;
  recommendation?: string;
}

export interface ExportProgress {
  percentage: number;
  loaded: number;
  total: number;
  speed: string;
  estimatedTime: string;
}