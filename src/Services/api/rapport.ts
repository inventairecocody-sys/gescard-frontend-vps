// src/Services/api/rapport.ts
import api from './client';  // Changé de 'apiClient' à 'client'

export const RapportService = {

  /**
   * Télécharge et sauvegarde le rapport Excel
   * Tous les calculs et l'analyse se font côté backend
   */
  async telechargerExcel(): Promise<void> {
    try {
      const response = await api.get('/rapports/excel', {
        responseType: 'blob',
        timeout: 60000, // 60 secondes pour les gros rapports
      });

      const now = new Date().toISOString().slice(0, 10);
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = `GESCARD_Rapport_${now}.xlsx`;
      document.body.appendChild(link);
      link.click();
      
      // Nettoyage
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('❌ Erreur lors du téléchargement du rapport Excel:', error);
      throw error;
    }
  },

  /**
   * Télécharge et sauvegarde le rapport Word
   */
  async telechargerWord(): Promise<void> {
    try {
      const response = await api.get('/rapports/word', {
        responseType: 'blob',
        timeout: 60000, // 60 secondes pour les gros rapports
      });

      const now = new Date().toISOString().slice(0, 10);
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = `GESCARD_Rapport_${now}.docx`;
      document.body.appendChild(link);
      link.click();
      
      // Nettoyage
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('❌ Erreur lors du téléchargement du rapport Word:', error);
      throw error;
    }
  },
};

// Export par défaut du service
export default RapportService;