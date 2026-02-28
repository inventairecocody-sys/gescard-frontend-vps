// src/Services/api/profil.ts
import api from './client';

export interface ProfilData {
  id: number;
  nomUtilisateur: string;
  nomComplet: string;
  email: string;
  agence: string;
  role: string;
  coordination: string;
  datecreation: string;
  derniereconnexion: string;
}

export interface ActivityData {
  actiontype: string;
  action: string;
  dateaction: string;
  tablename: string;
  detailsaction: string;
}

export interface ProfilStats {
  totalActions: number;
  actionsLast24h: number;
  actionsLast7Days: number;
  lastLogin: string | null;
  memberSince: string;
}

export const profilService = {
  /**
   * Récupérer le profil de l'utilisateur connecté
   * CORRECTION: Utilise /profil/me au lieu de /profil
   */
  async getProfile(): Promise<ProfilData> {
    const response = await api.get('/profil/me');
    return response.data.user || response.data;
  },

  /**
   * Mettre à jour le profil
   */
  async updateProfile(data: Partial<ProfilData>): Promise<any> {
    const response = await api.put('/profil/me', data);
    return response.data;
  },

  /**
   * Changer le mot de passe
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<any> {
    const response = await api.post('/profil/change-password', {
      currentPassword,
      newPassword,
      confirmPassword: newPassword
    });
    return response.data;
  },

  /**
   * Récupérer l'activité de l'utilisateur
   */
  async getActivity(page = 1, limit = 20): Promise<ActivityData[]> {
    const response = await api.get(`/profil/activity?page=${page}&limit=${limit}`);
    return response.data.activities || response.data;
  },

  /**
   * Récupérer les statistiques du profil
   */
  async getStats(): Promise<ProfilStats> {
    const response = await api.get('/profil/stats');
    return response.data.stats || response.data;
  },

  /**
   * Vérifier disponibilité du nom d'utilisateur
   */
  async checkUsername(username: string): Promise<boolean> {
    const response = await api.get(`/profil/check-username?username=${username}`);
    return response.data.available;
  },

  /**
   * Changer le nom d'utilisateur
   */
  async updateUsername(newUsername: string, password: string): Promise<any> {
    const response = await api.put('/profil/username', {
      newUsername,
      password
    });
    return response.data;
  }
};