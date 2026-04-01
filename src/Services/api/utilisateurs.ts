import { apiClient } from './client';
import type {
  Utilisateur,
  PaginatedResponse,
  QueryParams,
} from '../../types';

// ─── Interfaces ───────────────────────────────────────────────────────────────

// ✅ nomComplet ajouté
export interface CreateUtilisateurData {
  nomUtilisateur: string;
  nomComplet?: string;
  role: string;
  coordination: string;
  agence: string;
  email?: string;
  telephone?: string;
  motDePasse: string;
}

// ✅ nomComplet ajouté
export interface UpdateUtilisateurData {
  NomComplet?: string;
  Role?: string;
  Coordination?: string;
  Agence?: string;
  Email?: string;
  Telephone?: string;
  MotDePasse?: string;
  actif?: boolean;
  SiteIds?: string[];
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const UtilisateursService = {

  /**
   * ✅ BUG #4 CORRIGÉ
   * Le backend retourne { success, utilisateurs: [], pagination: {} }
   * et NON { data: [] } comme PaginatedResponse<T> l'attendait.
   */
  async getUtilisateurs(params?: QueryParams): Promise<PaginatedResponse<Utilisateur>> {
    const response = await apiClient.get<{
      success: boolean;
      utilisateurs: Utilisateur[];
      pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }>('/utilisateurs', { params });

    return {
      data: response.data.utilisateurs || [],
      pagination: {
        page:       response.data.pagination?.page       ?? 1,
        limit:      response.data.pagination?.limit      ?? 100,
        total:      response.data.pagination?.total      ?? 0,
        totalPages: response.data.pagination?.totalPages ?? 1,
      },
    };
  },

  /**
   * ✅ BUG #3 CORRIGÉ
   * Le backend retourne { success: true, utilisateur: { ... } }
   * et NON { data: { ... } }.
   */
  async getUtilisateurById(id: number): Promise<Utilisateur> {
    const response = await apiClient.get<{
      success: boolean;
      utilisateur: Utilisateur;
    }>(`/utilisateurs/${id}`);

    if (!response.data.utilisateur) {
      throw new Error(`Utilisateur ${id} non trouvé ou réponse invalide du serveur`);
    }
    return response.data.utilisateur;
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

  /** Suppression définitive (irréversible) — Administrateur uniquement */
  async purgeUtilisateur(id: number): Promise<void> {
    await apiClient.delete(`/utilisateurs/${id}/purge`);
  },

  async activateUtilisateur(id: number): Promise<void> {
    await apiClient.post(`/utilisateurs/${id}/activate`);
  }

};