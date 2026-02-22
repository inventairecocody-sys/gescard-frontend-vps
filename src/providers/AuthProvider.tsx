import { useState, useEffect } from "react";
import type { ReactNode } from "react";  // ← Gardez ici, car utilisé dans les props
import { AuthContext, type User } from "../context/AuthContext";

// Props du provider
interface AuthProviderProps {
  children: ReactNode;  // ← Utilisé ici
}

// Provider complet
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [role, setRole] = useState<'Administrateur' | 'Gestionnaire' | "Chef d'équipe" | 'Opérateur' | null>(
    localStorage.getItem("role") as 'Administrateur' | 'Gestionnaire' | "Chef d'équipe" | 'Opérateur' | null
  );
  const [user, setUser] = useState<User | null>(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        return JSON.parse(userData) as User;
      } catch {
        return null;
      }
    }
    return null;
  });

  // Fonction pour authentifier l'utilisateur
  const setAuth = (token: string, role: string, userData?: User): void => {
    const typedRole = role as 'Administrateur' | 'Gestionnaire' | "Chef d'équipe" | 'Opérateur';
    
    setToken(token);
    setRole(typedRole);
    setUser(userData || { 
      id: 0, 
      nomUtilisateur: '', 
      role: typedRole, 
      coordination: '', 
      agence: '', 
      actif: true, 
      dateCreation: new Date().toISOString() 
    });

    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    }
  };

  // Fonction pour déconnecter l'utilisateur
  const logout = (): void => {
    setToken(null);
    setRole(null);
    setUser(null);

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
  };

  // Vérifier si l'utilisateur a un certain rôle
  const hasRole = (roles: string[]): boolean => {
    if (!role) return false;
    return roles.includes(role);
  };

  const isAuthenticated = !!token;
  const userCoordination = user?.coordination || null;

  // Vérification au chargement
  useEffect(() => {
    const checkTokenValidity = (): void => {
      if (token) {
        console.log("✅ Utilisateur authentifié :", { role, user });
      }
    };

    checkTokenValidity();
  }, [token, role, user]);

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        user,
        setAuth,
        logout,
        isAuthenticated,
        hasRole,
        userCoordination,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};