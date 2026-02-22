import { apiClient } from './client';
import type { ImportResponse, ExportProgress } from '../../types';

export const ImportExportService = {
  async importFile(file: File, mode: 'standard' | 'smart' = 'standard'): Promise<ImportResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const endpoint = mode === 'smart' 
      ? '/import-export/import/smart' 
      : '/import-export/import';
    
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

  async getSites(): Promise<string[]> {
    const response = await apiClient.get<{ sites: string[] }>('/import-export/sites');
    return response.data.sites;
  },

  async downloadTemplate(format: 'csv' | 'excel'): Promise<Blob> {
    const response = await apiClient.get('/import-export/template', {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  }
};