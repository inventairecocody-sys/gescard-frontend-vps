// src/Services/api/statistiques.ts
import { apiClient } from './client';
import type { StatistiquesGlobales, StatistiqueSite } from '../../types';

export const StatistiquesService = {

  /**
   * Récupérer les statistiques globales
   */
  async getStatistiquesGlobales(): Promise<StatistiquesGlobales> {
    const response = await apiClient.get('/statistiques/globales');

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
   *
   * CORRECTION : Ajout d'une protection Array.isArray()
   *
   * Le backend avait un bug de cache qui retournait parfois un objet
   * { sites: [...], totals: {...}, count: N } au lieu d'un tableau,
   * ce qui causait "TypeError: Y.map is not a function" dans Dashboard.
   *
   * Ce bug est corrigé côté backend (statistiques.js), mais on garde
   * ici une double protection pour éviter tout crash futur.
   */
  async getStatistiquesParSite(): Promise<StatistiqueSite[]> {
    const response = await apiClient.get('/statistiques/sites');

    const sites = response.data.sites;

    // Cas normal : sites est un tableau
    if (Array.isArray(sites)) {
      return sites;
    }

    // Cas du bug de cache (ancienne structure) : sites est un objet
    // { sites: [...], totals: {...}, count: N }
    if (sites && Array.isArray((sites as any).sites)) {
      console.warn('[StatistiquesService] Structure de cache inattendue, extraction de sites.sites');
      return (sites as any).sites;
    }

    // Cas où response.data est directement un tableau
    if (Array.isArray(response.data)) {
      return response.data;
    }

    console.error('[StatistiquesService] Impossible d\'extraire un tableau depuis:', response.data);
    return [];
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