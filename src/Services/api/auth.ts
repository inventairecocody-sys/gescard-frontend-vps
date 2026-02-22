import { apiClient } from './client';
import { TokenService } from '../storage/token';
import type { LoginCredentials, AuthResponse, Utilisateur } from '../../types';
import type { ApiResponse } from '../../types';

export const AuthService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    // Stocker le token et l'utilisateur après connexion réussie
    if (response.data.token) {
      TokenService.setToken(response.data.token);
      TokenService.setUser(response.data.utilisateur);
    }
    
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Toujours effacer les tokens, même si la requête échoue
      TokenService.clear();
    }
  },

  async verifyToken(): Promise<Utilisateur> {
    const token = TokenService.getToken();
    
    if (!token) {
      throw new Error('Aucun token trouvé');
    }

    try {
      const response = await apiClient.get<ApiResponse<Utilisateur>>('/auth/verify');
      
      if (!response.data.data) {
        throw new Error('Token invalide');
      }
      
      // Mettre à jour l'utilisateur dans le storage
      TokenService.setUser(response.data.data);
      
      return response.data.data;
    } catch (error) {
      TokenService.clear();
      throw error;
    }
  },

  async getProfile(): Promise<Utilisateur> {
    const response = await apiClient.get<ApiResponse<Utilisateur>>('/profil');
    
    if (!response.data.data) {
      throw new Error('Profil non trouvé');
    }
    
    return response.data.data;
  },

  async updateProfile(data: Partial<Utilisateur>): Promise<Utilisateur> {
    const response = await apiClient.put<ApiResponse<Utilisateur>>('/profil', data);
    
    if (!response.data.data) {
      throw new Error('Erreur lors de la mise à jour');
    }
    
    // Mettre à jour l'utilisateur dans le storage
    const currentUser = TokenService.getUser();
    if (currentUser) {
      TokenService.setUser({ ...currentUser, ...response.data.data });
    }
    
    return response.data.data;
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/profil/change-password', { 
      oldPassword, 
      newPassword 
    });
  },

  async refreshToken(): Promise<{ token: string }> {
    const response = await apiClient.post<{ token: string }>('/auth/refresh');
    
    if (response.data.token) {
      TokenService.setToken(response.data.token);
    }
    
    return response.data;
  }
};