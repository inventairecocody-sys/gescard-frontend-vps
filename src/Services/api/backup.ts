// src/Services/api/backup.ts
import apiClient from './client';

export interface BackupFile {
  id: string;
  name: string;
  created: string;
  createdISO: string;
  size: string;
  sizeBytes: number;
  type: 'SQL' | 'JSON';
  viewLink: string;
  downloadLink: string;
}

export interface BackupStats {
  totalBackups: number;
  totalSizeMB: number;
  lastBackup: string | null;
  averageSizeMB: number;
}

export interface BackupStatus {
  success: boolean;
  status: 'operational' | 'no_backups' | 'error';
  healthy: boolean;
  message: string;
  database: {
    total_cartes: number;
    size: string;
    connection: string;
  };
  backup_system: {
    configured: boolean;
    available: boolean;
    auto_backup: string;
    auto_restore: boolean;
    last_backup: string | null;
    backups_today: number;
    remaining_today: number;
    next_scheduled: string;
  };
  google_drive: {
    configured: boolean;
    folder: string;
    folder_id: string;
  };
}

class BackupService {
  private baseUrl = '/backup';

  /**
   * Tester la connexion Google Drive
   */
  async testConnection() {
    const response = await apiClient.get(`${this.baseUrl}/test`);
    return response.data;
  }

  /**
   * Créer un backup manuel
   */
  async createBackup() {
    const response = await apiClient.post(`${this.baseUrl}/create`);
    return response.data;
  }

  /**
   * Lister tous les backups disponibles
   */
  async listBackups(limit = 50, sort: 'asc' | 'desc' = 'desc'): Promise<{
    success: boolean;
    backups: BackupFile[];
    statistics: {
      totalSize: string;
      oldestBackup: string | null;
      newestBackup: string | null;
      averageSize: string;
    };
  }> {
    const response = await apiClient.get(`${this.baseUrl}/list?limit=${limit}&sort=${sort}`);
    return response.data;
  }

  /**
   * Obtenir le statut du système de backup
   */
  async getStatus(): Promise<BackupStatus> {
    const response = await apiClient.get(`${this.baseUrl}/status`);
    return response.data;
  }

  /**
   * Restaurer un backup (admin uniquement)
   */
  async restoreBackup(backupId?: string) {
    const response = await apiClient.post(`${this.baseUrl}/restore`, { backupId });
    return response.data;
  }

  /**
   * Nettoyer les vieux backups (admin uniquement)
   */
  async cleanupBackups(olderThan = 90) {
    const response = await apiClient.delete(`${this.baseUrl}/cleanup?olderThan=${olderThan}`);
    return response.data;
  }

  /**
   * Obtenir le lien de téléchargement pour un backup
   */
  getDownloadLink(backupId: string): string {
    return `${import.meta.env.VITE_API_URL || ''}/api/backup/download/${backupId}`;
  }
}

export const backupService = new BackupService();