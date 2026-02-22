import { apiClient } from './client';
import type { 
  Carte, 
  CarteFormData, 
  PaginatedResponse, 
  QueryParams,
  ChefEquipeEditFields 
} from '../../types';

export const CartesService = {
  async getCartes(params?: QueryParams): Promise<PaginatedResponse<Carte>> {
    const response = await apiClient.get<PaginatedResponse<Carte>>('/cartes', { params });
    return response.data;
  },

  async getCarteById(id: number): Promise<Carte> {
    const response = await apiClient.get<{ data: Carte }>(`/cartes/${id}`);
    return response.data.data;
  },

  async createCarte(data: CarteFormData): Promise<Carte> {
    const response = await apiClient.post<{ data: Carte }>('/cartes', data);
    return response.data.data;
  },

  async updateCarte(
    id: number, 
    data: Partial<CarteFormData> | ChefEquipeEditFields
  ): Promise<Carte> {
    const response = await apiClient.put<{ data: Carte }>(`/cartes/${id}`, data);
    return response.data.data;
  },

  async deleteCarte(id: number): Promise<void> {
    await apiClient.delete(`/cartes/${id}`);
  },

  async searchCartes(query: string): Promise<Carte[]> {
    const response = await apiClient.get<{ data: Carte[] }>('/cartes/search', {
      params: { q: query }
    });
    return response.data.data;
  }
};