// src/components/BoutonRapport.tsx
// Composant à ajouter dans TableauDeBord.tsx
// Importer : import { RapportService } from '../Services/api/rapport';
// Importer : import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

import React, { useState } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { RapportService } from '../Services/api/rapport';

const BoutonRapport: React.FC = () => {
  const [loading, setLoading] = useState<'excel' | 'word' | null>(null);
  const [error,   setError]   = useState('');

  const telecharger = async (type: 'excel' | 'word') => {
    setLoading(type);
    setError('');
    try {
      if (type === 'excel') await RapportService.telechargerExcel();
      else                  await RapportService.telechargerWord();
    } catch (e: any) {
      setError(`Erreur : ${e.message || 'Impossible de générer le rapport'}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {/* Bouton Excel */}
        <button
          onClick={() => telecharger('excel')}
          disabled={!!loading}
          className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60
            text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
          title="Télécharger le rapport Excel (5 onglets)"
        >
          {loading === 'excel' ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <ArrowDownTrayIcon className="w-3.5 h-3.5" />
          )}
          {loading === 'excel' ? 'Génération...' : 'Excel'}
        </button>

        {/* Bouton Word */}
        <button
          onClick={() => telecharger('word')}
          disabled={!!loading}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60
            text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
          title="Télécharger le rapport Word (analyse complète)"
        >
          {loading === 'word' ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <ArrowDownTrayIcon className="w-3.5 h-3.5" />
          )}
          {loading === 'word' ? 'Génération...' : 'Word'}
        </button>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="absolute right-0 top-full mt-1 z-20 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default BoutonRapport;