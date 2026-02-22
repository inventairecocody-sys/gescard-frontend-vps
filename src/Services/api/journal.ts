import { apiClient } from './client';
import type { ActionJournal, AnnulationResponse, PaginatedResponse, QueryParams } from '../../types';

export const JournalService = {
  async getActions(params?: QueryParams): Promise<PaginatedResponse<ActionJournal>> {
    const response = await apiClient.get<PaginatedResponse<ActionJournal>>('/journal', { params });
    return response.data;
  },

  async annulerAction(id: number): Promise<AnnulationResponse> {
    const response = await apiClient.post<AnnulationResponse>(`/journal/${id}/annuler`);
    return response.data;
  }
};