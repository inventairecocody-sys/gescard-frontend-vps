// src/context/AuthContext.tsx
import { createContext } from "react";

// Définition du type User plus précis - ✅ CORRIGÉ avec nomComplet
export interface User {
  id: number;
  nomUtilisateur: string;
  nomComplet: string;                    // ← AJOUTÉ (nom complet pour affichage)
  role: 'Administrateur' | 'Gestionnaire' | "Chef d'équipe" | 'Opérateur';
  coordination: string;
  agence: string;
  email?: string;
  telephone?: string;
  actif: boolean;
  dateCreation: string;
  derniereConnexion?: string;
}

// Définition du type pour le contexte
export interface AuthContextType {
  token: string | null;
  role: 'Administrateur' | 'Gestionnaire' | "Chef d'équipe" | 'Opérateur' | null;
  user: User | null;
  setAuth: (token: string, role: string, userData?: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: string[]) => boolean;
  userCoordination: string | null;
}

// Création du contexte avec des valeurs par défaut
export const AuthContext = createContext<AuthContextType>({
  token: null,
  role: null,
  user: null,
  setAuth: () => {},
  logout: () => {},
  isAuthenticated: false,
  hasRole: () => false,
  userCoordination: null,
});