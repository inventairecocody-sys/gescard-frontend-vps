// src/Services/api/statistiques.ts
import { apiClient } from './client';
import type { StatistiquesGlobales, StatistiqueSite } from '../../types';

// ─── Types exportés ────────────────────────────────────────────────────────

export interface AgenceStats {
  agence_id:        number;
  agence_nom:       string;
  coordination_id:  number;
  coordination_nom: string;
  nombre_sites:     number;
  sites_actifs:     number;
  nombre_agents:    number;
  total_cartes:     number;
  cartes_retirees:  number;
  cartes_restantes: number;
  taux_retrait:     number;
  rang?:            number;
  rang_taux?:       number;
}

export interface CoordStats {
  coordination_id:  number;
  coordination_nom: string;
  nb_sites:         number;
  total_cartes:     number;
  cartes_retirees:  number;
  cartes_restantes: number;
  taux_retrait:     number;
  premier_retrait:  string | null;
  dernier_retrait:  string | null;
  rang?:            number;
  rang_taux?:       number;
}

export type Granularite = 'jour' | 'semaine' | 'mois';
export type NiveauTemporel = 'global' | 'coordination' | 'agence' | 'site';

export interface PointTemporel {
  periode:               string;
  nb_retraits:           number;
  sites_actifs:          number;
  coordinations_actives: number;
  cumul_retraits:        number;
}

export interface Tendance {
  valeur:      number;
  pourcentage: number | null;
  direction:   'hausse' | 'baisse' | 'stable';
}

export interface EvolutionTemporelle {
  evolution:   PointTemporel[];
  tendance:    Tendance | null;
  parametres:  { granularite: Granularite; niveau: NiveauTemporel; id: string | null; periodes: number };
}

// ─── Service ───────────────────────────────────────────────────────────────

export const StatistiquesService = {

  /** Statistiques globales */
  async getStatistiquesGlobales(): Promise<StatistiquesGlobales> {
    const response = await apiClient.get('/statistiques/globales');
    return {
      total:       response.data.total       || 0,
      retires:     response.data.retires     || 0,
      restants:    response.data.restants    || 0,
      tauxRetrait: response.data.tauxRetrait || 0,
      metadata:    response.data.metadata    || {
        sites_actifs: 0, nb_coordinations: 0,
        premier_retrait: '', dernier_retrait: '',
        premiere_importation: '', derniere_importation: '',
      },
    };
  },

  /** Statistiques par site */
  async getStatistiquesParSite(): Promise<StatistiqueSite[]> {
    const response = await apiClient.get('/statistiques/sites');
    const sites    = response.data.sites;
    if (Array.isArray(sites))                    return sites;
    if (sites && Array.isArray((sites as any).sites)) return (sites as any).sites;
    if (Array.isArray(response.data))            return response.data;
    console.error('[StatistiquesService] Impossible d\'extraire les sites:', response.data);
    return [];
  },

  /** Statistiques par coordination */
  async getStatistiquesParCoordination(): Promise<{
    coordinations: CoordStats[];
    classement:    CoordStats[];
    totaux:        any;
  }> {
    const response = await apiClient.get('/statistiques/coordinations');
    return {
      coordinations: response.data.coordinations || [],
      classement:    response.data.classement    || [],
      totaux:        response.data.totaux        || {},
    };
  },

  /** Statistiques par agence — filtrable par coordination_id */
  async getStatistiquesParAgence(coordinationId?: number): Promise<{
    agences:    AgenceStats[];
    classement: AgenceStats[];
    totaux:     any;
  }> {
    const params = coordinationId ? { coordination_id: coordinationId } : {};
    const response = await apiClient.get('/statistiques/agences', { params });
    return {
      agences:    response.data.agences    || [],
      classement: response.data.classement || [],
      totaux:     response.data.totaux     || {},
    };
  },

  /** Évolution temporelle des retraits (basée sur DATE DE DELIVRANCE) */
  async getEvolutionTemporelle(
    granularite:  Granularite      = 'mois',
    niveau:       NiveauTemporel   = 'global',
    id?:          string | number,
    periodes:     number           = 12,
  ): Promise<EvolutionTemporelle> {
    const params: Record<string, any> = { granularite, niveau, periodes };
    if (id !== undefined && id !== null) params.id = id;

    const response = await apiClient.get('/statistiques/temporel', { params });
    return {
      evolution:  response.data.evolution  || [],
      tendance:   response.data.tendance   || null,
      parametres: response.data.parametres || { granularite, niveau, id: null, periodes },
    };
  },

  /** Stats rapides (widgets) */
  async getStatistiquesQuick(): Promise<any> {
    const response = await apiClient.get('/statistiques/quick');
    return response.data.stats || {};
  },

  /** Stats détaillées (globales + sites) */
  async getStatistiquesDetail(): Promise<any> {
    const response = await apiClient.get('/statistiques/detail');
    return response.data;
  },

  /** Vider le cache */
  async refreshCache(): Promise<void> {
    await apiClient.post('/statistiques/refresh');
  },
};