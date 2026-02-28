import { apiClient } from './client';
import type { ImportResponse, ExportProgress } from '../../types';

export const ImportExportService = {
  /**
   * Import d'un fichier (CSV ou Excel)
   * @param file - Fichier à importer
   * @param mode - 'standard' pour import simple, 'smart' pour import avec fusion intelligente
   */
  async importFile(file: File, mode: 'standard' | 'smart' = 'standard'): Promise<ImportResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    // ✅ CORRIGÉ: Endpoints corrects
    const endpoint = mode === 'smart' 
      ? '/import-export/import/smart-sync'  // ← Smart sync
      : '/import-export/import/csv';        // ← Import CSV standard
    
    const response = await apiClient.post<ImportResponse>(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 100)
        );
        console.log(`Upload: ${percentCompleted}%`);
      }
    });
    
    return response.data;
  },

  /**
   * Export des cartes
   * @param format - 'csv' ou 'excel'
   * @param params - Paramètres de filtre
   * @param onProgress - Callback de progression
   */
  async exportCartes(
    format: 'csv' | 'excel',
    params?: Record<string, string>,
    onProgress?: (progress: ExportProgress) => void
  ): Promise<Blob> {
    const endpoint = format === 'csv' 
      ? '/import-export/export/csv' 
      : '/import-export/export';
    
    const response = await apiClient.get(endpoint, {
      params,
      responseType: 'blob',
      onDownloadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress: ExportProgress = {
            percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            speed: '0 KB/s',
            estimatedTime: ''
          };
          onProgress(progress);
        }
      }
    });
    
    return response.data;
  },

  /**
   * Récupère la liste des sites
   */
  async getSites(): Promise<string[]> {
    const response = await apiClient.get<{ sites: string[] }>('/import-export/sites');
    return response.data.sites;
  },

  /**
   * Télécharge un template d'import
   * @param format - 'csv' ou 'excel'
   */
  async downloadTemplate(format: 'csv' | 'excel'): Promise<Blob> {
    const response = await apiClient.get('/import-export/template', {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Export complet (toutes les données)
   */
  async exportComplete(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const endpoint = format === 'csv'
      ? '/import-export/export/complete/csv'
      : '/import-export/export/complete';
    
    const response = await apiClient.get(endpoint, {
      responseType: 'blob'
    });
    
    return response.data;
  },

  /**
   * Export "tout en un" (choix automatique du format)
   */
  async exportAll(): Promise<Blob> {
    const response = await apiClient.get('/import-export/export/all', {
      responseType: 'blob'
    });
    
    return response.data;
  },

  /**
   * Export par site
   * @param site - Nom du site
   */
  async exportBySite(site: string): Promise<Blob> {
    const response = await apiClient.get('/import-export/export/site', {
      params: { siteRetrait: site },
      responseType: 'blob'
    });
    
    return response.data;
  }
};