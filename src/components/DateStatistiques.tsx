// src/components/DateStatistiques.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { CalendarDaysIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../Services/api/client';

interface StatsJournalieres {
  date: string;
  global: {
    retraits_jour: number;
    total_concernes: number;
  };
  coordinations: Array<{
    id: number;
    coordination: string;
    retraits_jour: number;
    total_concernes: number;
  }>;
  agences: Array<{
    agence_id: number;
    agence: string;
    coordination: string;
    retraits_jour: number;
    total_concernes: number;
  }>;
  sites: Array<{
    site: string;
    coordination: string;
    agence: string;
    retraits_jour: number;
    total_concernes: number;
  }>;
}

const DateStatistiques: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
  userCoordination?: string;
}> = ({ isOpen, onClose, userRole, userCoordination }) => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [stats, setStats] = useState<StatsJournalieres | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // CORRECTION: Utiliser useCallback pour mémoriser la fonction
  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/statistiques/journalieres', {
        params: { date: selectedDate }
      });
      setStats(response.data);
    } catch (err: any) {
      setError(err.message || 'Erreur chargement des statistiques');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]); // Dépendance à selectedDate

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [selectedDate, isOpen, fetchStats]); // CORRECTION: Ajout de fetchStats dans les dépendances

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
              bg-white rounded-2xl shadow-2xl z-50 w-[90vw] max-w-6xl max-h-[90vh] overflow-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CalendarDaysIcon className="w-8 h-8 text-white" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Statistiques Journalières
                    </h2>
                    <p className="text-white/80 text-sm">
                      Retraits par jour pour chaque entité
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 
                    flex items-center justify-center text-white transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Date Picker */}
              <div className="mb-8 flex items-center gap-4">
                <label className="text-sm font-semibold text-gray-700">
                  Sélectionner une date :
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border border-gray-300 rounded-xl px-4 py-2 text-sm 
                    focus:outline-none focus:ring-2 focus:ring-[#F77F00]"
                />
                {loading && (
                  <div className="w-5 h-5 border-2 border-[#F77F00] border-t-transparent 
                    rounded-full animate-spin" />
                )}
              </div>

              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 
                  rounded-xl px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              {stats && (
                <div className="space-y-8">
                  {/* Résumé global */}
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 
                    rounded-xl p-6 border border-orange-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      {formatDate(stats.date)}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-[#F77F00]">
                          {stats.global.retraits_jour}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Retraits du jour
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-green-600">
                          {stats.global.total_concernes}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Cartes concernées
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tableaux */}
                  {userRole === 'Administrateur' && (
                    <>
                      {/* Par Coordination */}
                      <div>
                        <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                          <span className="w-1 h-5 bg-[#F77F00] rounded-full" />
                          Par Coordination
                        </h4>
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left">Coordination</th>
                                <th className="px-4 py-3 text-right">Retraits</th>
                                <th className="px-4 py-3 text-right">Cartes</th>
                                <th className="px-4 py-3 text-right">Taux</th>
                              </tr>
                            </thead>
                            <tbody>
                              {stats.coordinations.map((c, i) => (
                                <tr key={c.id} className={i % 2 ? 'bg-gray-50' : ''}>
                                  <td className="px-4 py-2 font-medium">{c.coordination}</td>
                                  <td className="px-4 py-2 text-right font-bold text-green-600">
                                    {c.retraits_jour}
                                  </td>
                                  <td className="px-4 py-2 text-right">{c.total_concernes}</td>
                                  <td className="px-4 py-2 text-right">
                                    {((c.retraits_jour / c.total_concernes) * 100).toFixed(1)}%
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Par Agence */}
                  <div>
                    <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <span className="w-1 h-5 bg-teal-500 rounded-full" />
                      Par Agence
                    </h4>
                    <div className="overflow-x-auto rounded-xl border border-gray-200 max-h-80">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left">Agence</th>
                            <th className="px-4 py-3 text-left">Coordination</th>
                            <th className="px-4 py-3 text-right">Retraits</th>
                            <th className="px-4 py-3 text-right">Cartes</th>
                            <th className="px-4 py-3 text-right">Taux</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.agences
                            .filter(a => 
                              userRole !== 'Gestionnaire' || 
                              a.coordination === userCoordination
                            )
                            .map((a, i) => (
                            <tr key={a.agence_id} className={i % 2 ? 'bg-gray-50' : ''}>
                              <td className="px-4 py-2 font-medium">{a.agence}</td>
                              <td className="px-4 py-2 text-gray-600">{a.coordination}</td>
                              <td className="px-4 py-2 text-right font-bold text-green-600">
                                {a.retraits_jour}
                              </td>
                              <td className="px-4 py-2 text-right">{a.total_concernes}</td>
                              <td className="px-4 py-2 text-right">
                                {((a.retraits_jour / a.total_concernes) * 100).toFixed(1)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Par Site */}
                  <div>
                    <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <span className="w-1 h-5 bg-purple-500 rounded-full" />
                      Par Site
                    </h4>
                    <div className="overflow-x-auto rounded-xl border border-gray-200 max-h-96">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left">Site</th>
                            <th className="px-4 py-3 text-left">Agence</th>
                            <th className="px-4 py-3 text-left">Coordination</th>
                            <th className="px-4 py-3 text-right">Retraits</th>
                            <th className="px-4 py-3 text-right">Cartes</th>
                            <th className="px-4 py-3 text-right">Taux</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.sites
                            .filter(s => 
                              userRole !== 'Gestionnaire' || 
                              s.coordination === userCoordination
                            )
                            .map((s, i) => (
                            <tr key={s.site} className={i % 2 ? 'bg-gray-50' : ''}>
                              <td className="px-4 py-2 font-medium">{s.site}</td>
                              <td className="px-4 py-2">{s.agence || '-'}</td>
                              <td className="px-4 py-2">{s.coordination}</td>
                              <td className="px-4 py-2 text-right font-bold text-green-600">
                                {s.retraits_jour}
                              </td>
                              <td className="px-4 py-2 text-right">{s.total_concernes}</td>
                              <td className="px-4 py-2 text-right">
                                {((s.retraits_jour / s.total_concernes) * 100).toFixed(1)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DateStatistiques;