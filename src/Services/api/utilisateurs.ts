import { apiClient } from './client';
import type { Utilisateur, PaginatedResponse, QueryParams } from '../../types';

export interface CreateUtilisateurData {
  nomUtilisateur: string;
  role: string;
  coordination: string;
  agence: string;
  email?: string;
  telephone?: string;
  motDePasse: string;
}

export interface UpdateUtilisateurData {
  role?: string;
  coordination?: string;
  agence?: string;
  email?: string;
  telephone?: string;
  motDePasse?: string;
  actif?: boolean;
}

export const UtilisateursService = {
  async getUtilisateurs(params?: QueryParams): Promise<PaginatedResponse<Utilisateur>> {
    const response = await apiClient.get<PaginatedResponse<Utilisateur>>('/utilisateurs', { params });
    return response.data;
  },

  async getUtilisateurById(id: number): Promise<Utilisateur> {
    const response = await apiClient.get<{ data: Utilisateur }>(`/utilisateurs/${id}`);
    return response.data.data;
  },

  async createUtilisateur(data: CreateUtilisateurData): Promise<Utilisateur> {
    const response = await apiClient.post<{ data: Utilisateur }>('/utilisateurs', data);
    return response.data.data;
  },

  async updateUtilisateur(id: number, data: UpdateUtilisateurData): Promise<Utilisateur> {
    const response = await apiClient.put<{ data: Utilisateur }>(`/utilisateurs/${id}`, data);
    return response.data.data;
  },

  async deleteUtilisateur(id: number): Promise<void> {
    await apiClient.delete(`/utilisateurs/${id}`);
  },

  async activateUtilisateur(id: number): Promise<void> {
    await apiClient.post(`/utilisateurs/${id}/activate`);
  }
};