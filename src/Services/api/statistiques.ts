import { apiClient } from './client';
import type { StatistiquesGlobales, StatistiqueSite } from '../../types';

export const StatistiquesService = {
  /**
   * Récupérer les statistiques globales
   * CORRECTION: Accès direct aux propriétés, pas de wrapper 'data'
   */
  async getStatistiquesGlobales(): Promise<StatistiquesGlobales> {
    const response = await apiClient.get('/statistiques/globales');
    
    // La réponse est directement l'objet avec total, retires, etc.
    // PAS de wrapper 'data'
    return {
      total: response.data.total || 0,
      retires: response.data.retires || 0,
      restants: response.data.restants || 0,
      tauxRetrait: response.data.tauxRetrait || 0,
      metadata: response.data.metadata || {
        sites_actifs: 0,
        beneficiaires_uniques: 0,
        premiere_importation: '',
        derniere_importation: ''
      }
    };
  },

  /**
   * Récupérer les statistiques par site
   * CORRECTION: Accès direct à response.data.sites
   */
  async getStatistiquesParSite(): Promise<StatistiqueSite[]> {
    const response = await apiClient.get('/statistiques/sites');
    
    // La réponse contient directement un tableau 'sites'
    return response.data.sites || [];
  },

  /**
   * Récupérer les statistiques détaillées (utile pour dashboard)
   */
  async getStatistiquesDetail(): Promise<any> {
    const response = await apiClient.get('/statistiques/detail');
    return response.data;
  },

  /**
   * Récupérer les statistiques rapides (pour widgets)
   */
  async getStatistiquesQuick(): Promise<any> {
    const response = await apiClient.get('/statistiques/quick');
    return response.data.stats || {};
  },

  /**
   * Forcer le rafraîchissement du cache
   */
  async refreshCache(): Promise<void> {
    await apiClient.post('/statistiques/refresh');
  }
};