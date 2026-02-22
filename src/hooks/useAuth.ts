import { useContext } from 'react';
import { AuthContext, type AuthContextType, type User } from '../context/AuthContext';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Hook spécifique pour obtenir l'utilisateur connecté
export const useUser = (): User | null => {
  const { user } = useAuth();
  return user;
};

// Hook pour vérifier les permissions
export const useHasRole = (roles: string[]): boolean => {
  const { hasRole } = useAuth();
  return hasRole(roles);
};

// Hook pour obtenir la coordination de l'utilisateur
export const useUserCoordination = (): string | null => {
  const { userCoordination } = useAuth();
  return userCoordination;
};