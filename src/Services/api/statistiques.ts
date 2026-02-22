import { apiClient } from './client';
import type { StatistiquesGlobales, StatistiqueSite } from '../../types';

export const StatistiquesService = {
  async getStatistiquesGlobales(): Promise<StatistiquesGlobales> {
    const response = await apiClient.get<{ data: StatistiquesGlobales }>('/statistiques/globales');
    return response.data.data;
  },

  async getStatistiquesParSite(): Promise<StatistiqueSite[]> {
    const response = await apiClient.get<{ data: StatistiqueSite[] }>('/statistiques/sites');
    return response.data.data;
  }
};