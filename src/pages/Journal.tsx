import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Navbar from "../components/Navbar";
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { JournalService } from '../Services/api/journal';
import { 
  ClockIcon, 
  DocumentTextIcon,
  ArrowPathIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArchiveBoxIcon,
  ArrowDownTrayIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';

interface JournalEntry {
  id: number;
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'IMPORT' | 'EXPORT';
  description: string;
  utilisateurId: number;
  utilisateurNom: string;
  role: string;
  coordination: string;
  carteId?: number;
  ancienneValeur?: any;
  nouvelleValeur?: any;
  dateAction: string;
  ipAddress?: string;
  annulee: boolean;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ImportBatch {
  id: string;
  nombreCartes: number;
  dateImport: string;
  utilisateurNom: string;
  utilisateurComplet: string;
  coordination: string;
}

interface BackupFile {
  id: string;
  name: string;
  created: string;
  size: string;
  type: 'SQL' | 'JSON';
  encrypted: boolean;
}

const Journal: React.FC = () => {
  const { user, hasRole } = useAuth();
  const { canAnnuler } = usePermissions();
  
  const isAdmin = hasRole(['Administrateur']);
  const isGestionnaire = hasRole(['Gestionnaire']);
  
  const [logs, setLogs] = useState<JournalEntry[]>([]);
  const [imports, setImports] = useState<ImportBatch[]>([]);
  const [backups, setBackups] = useState<BackupFile[]>([]);
  
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });
  
  const [filters, setFilters] = useState({
    dateDebut: '',
    dateFin: '',
    utilisateur: '',
    type: '',
    coordination: user?.coordination || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [importsLoading, setImportsLoading] = useState(false);
  const [backupsLoading, setBackupsLoading] = useState(false);
  
  const [selectedImport, setSelectedImport] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'journal' | 'imports' | 'backup'>('journal');
  
  const [showFilters, setShowFilters] = useState(false);

  // Responsive
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  // Classes responsives
  const containerClass = isMobile ? 'px-3 py-4' : isTablet ? 'px-6 py-6' : 'container mx-auto px-4 py-8';
  const titleSize = isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl';
  const textSize = isMobile ? 'text-xs' : isTablet ? 'text-sm' : 'text-base';
  const tableCellClass = isMobile ? 'px-2 py-2 text-xs' : isTablet ? 'px-3 py-3 text-sm' : 'px-4 py-3';

  const fetchLogs = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: pagination.limit,
        ...filters
      };
      
      // Filtrer par coordination pour les gestionnaires
      if (isGestionnaire && user?.coordination) {
        params.coordination = user.coordination;
      }
      
      const response = await JournalService.getActions(params);
      
      setLogs(response.data);
      setPagination(response.pagination);
      
    } catch (error: any) {
      console.error('Erreur chargement journal:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, filters, isGestionnaire, user?.coordination]);

  const fetchImports = useCallback(async () => {
    setImportsLoading(true);
    try {
      // Simulation - à remplacer par un vrai service
      await new Promise(resolve => setTimeout(resolve, 1000));
      setImports([]);
    } catch (error) {
      console.error('Erreur chargement imports:', error);
      setImports([]);
    } finally {
      setImportsLoading(false);
    }
  }, []);

  const fetchBackups = useCallback(async () => {
    setBackupsLoading(true);
    try {
      // Simulation - à remplacer par un vrai service
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBackups([]);
    } catch (error) {
      console.error('Erreur chargement backups:', error);
      setBackups([]);
    } finally {
      setBackupsLoading(false);
    }
  }, []);

  const handleAnnulerImport = async () => {
    if (!selectedImport) return;
    
    try {
      await JournalService.annulerAction(parseInt(selectedImport));
      setDialogOpen(false);
      setSelectedImport(null);
      fetchLogs();
      fetchImports();
    } catch (error) {
      console.error('Erreur annulation:', error);
    }
  };

  const handleUndo = async (journalId: number) => {
    if (!window.confirm("Voulez-vous vraiment annuler cette action ?")) return;
    
    try {
      await JournalService.annulerAction(journalId);
      fetchLogs();
    } catch (error) {
      console.error("Erreur annulation:", error);
    }
  };

  useEffect(() => {
    if (activeTab === 'journal') {
      fetchLogs();
    } else if (activeTab === 'imports') {
      fetchImports();
    } else if (activeTab === 'backup') {
      fetchBackups();
    }
  }, [activeTab, filters, fetchLogs, fetchImports, fetchBackups]);

  const getActionColor = (type: string) => {
    const colors: Record<string, string> = {
      'CREATE': 'bg-green-500',
      'UPDATE': 'bg-orange-500',
      'DELETE': 'bg-red-500',
      'LOGIN': 'bg-blue-500',
      'LOGOUT': 'bg-gray-500',
      'IMPORT': 'bg-purple-500',
      'EXPORT': 'bg-indigo-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const getActionIcon = (type: string) => {
    const icons: Record<string, string> = {
      'CREATE': '➕',
      'UPDATE': '✏️',
      'DELETE': '🗑️',
      'LOGIN': '🔐',
      'LOGOUT': '🚪',
      'IMPORT': '📥',
      'EXPORT': '📤'
    };
    return icons[type] || '📝';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('fr-FR');
    } catch {
      return dateString || 'Date inconnue';
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      dateDebut: '',
      dateFin: '',
      utilisateur: '',
      type: '',
      coordination: user?.coordination || ''
    });
  };

  const formatJsonValue = (value: any) => {
    if (!value) return 'Aucune';
    try {
      if (typeof value === 'string') {
        const parsed = JSON.parse(value);
        return JSON.stringify(parsed, null, 2);
      }
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'CREATE': 'Création',
      'UPDATE': 'Modification',
      'DELETE': 'Suppression',
      'LOGIN': 'Connexion',
      'LOGOUT': 'Déconnexion',
      'IMPORT': 'Import',
      'EXPORT': 'Export'
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar />
      
      {/* En-tête */}
      <div className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white py-4 shadow-lg">
        <div className={containerClass}>
          <h1 className={`${titleSize} font-bold`}>
            Journal d'Activité
          </h1>
          <p className={`text-white/90 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {isAdmin ? 'Administration complète' : 'Consultation des actions'}
          </p>
        </div>
      </div>

      <div className={containerClass}>
        {/* Tabs */}
        <div className={`flex flex-wrap gap-2 mb-6 ${isMobile ? 'justify-center' : ''}`}>
          <motion.button
            onClick={() => setActiveTab('journal')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-4 py-2 md:px-6 md:py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${textSize} ${
              activeTab === 'journal'
                ? 'bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <DocumentTextIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
            Journal
          </motion.button>
          
          {isAdmin && (
            <>
              <motion.button
                onClick={() => setActiveTab('imports')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-2 md:px-6 md:py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${textSize} ${
                  activeTab === 'imports'
                    ? 'bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <ArchiveBoxIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                Imports
              </motion.button>
              
              <motion.button
                onClick={() => setActiveTab('backup')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-2 md:px-6 md:py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${textSize} ${
                  activeTab === 'backup'
                    ? 'bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <ArrowDownTrayIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                Sauvegardes
              </motion.button>
            </>
          )}
        </div>

        {/* Bouton actualiser */}
        <div className="mb-6">
          <motion.button
            onClick={() => {
              if (activeTab === 'journal') fetchLogs();
              else if (activeTab === 'imports') fetchImports();
              else if (activeTab === 'backup') fetchBackups();
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg"
          >
            <ArrowPathIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
            Actualiser
          </motion.button>
        </div>

        {/* Vue Journal */}
        {activeTab === 'journal' && (
          <>
            {/* Bouton filtres */}
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="mb-4 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center gap-2"
            >
              <FunnelIcon className="w-5 h-5 text-gray-600" />
              <span>Filtres</span>
              {showFilters ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
            </motion.button>

            {/* Filtres */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 p-4 md:p-6 mb-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Date début */}
                  <div>
                    <label className={`block font-medium text-gray-700 mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      Date début
                    </label>
                    <input
                      type="date"
                      value={filters.dateDebut}
                      onChange={(e) => handleFilterChange('dateDebut', e.target.value)}
                      className={`w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${isMobile ? 'text-xs' : 'text-sm'}`}
                    />
                  </div>
                  
                  {/* Date fin */}
                  <div>
                    <label className={`block font-medium text-gray-700 mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      Date fin
                    </label>
                    <input
                      type="date"
                      value={filters.dateFin}
                      onChange={(e) => handleFilterChange('dateFin', e.target.value)}
                      className={`w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${isMobile ? 'text-xs' : 'text-sm'}`}
                    />
                  </div>
                  
                  {/* Utilisateur */}
                  <div>
                    <label className={`block font-medium text-gray-700 mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      Utilisateur
                    </label>
                    <input
                      type="text"
                      value={filters.utilisateur}
                      onChange={(e) => handleFilterChange('utilisateur', e.target.value)}
                      placeholder="Nom..."
                      className={`w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${isMobile ? 'text-xs' : 'text-sm'}`}
                    />
                  </div>
                  
                  {/* Type d'action */}
                  <div>
                    <label className={`block font-medium text-gray-700 mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      Type d'action
                    </label>
                    <select
                      value={filters.type}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      className={`w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${isMobile ? 'text-xs' : 'text-sm'}`}
                    >
                      <option value="">Tous</option>
                      <option value="CREATE">Création</option>
                      <option value="UPDATE">Modification</option>
                      <option value="DELETE">Suppression</option>
                      <option value="LOGIN">Connexion</option>
                      <option value="LOGOUT">Déconnexion</option>
                      <option value="IMPORT">Import</option>
                      <option value="EXPORT">Export</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-4">
                  <motion.button
                    onClick={handleResetFilters}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium"
                  >
                    Réinitialiser
                  </motion.button>
                  
                  <motion.button
                    onClick={() => fetchLogs(1)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-semibold"
                  >
                    Appliquer
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Tableau des logs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 overflow-hidden"
            >
              {/* Info pagination */}
              <div className="px-4 md:px-6 py-3 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200">
                <div className={`flex justify-between items-center ${textSize}`}>
                  <span>
                    {logs.length} entrées sur {pagination.total}
                  </span>
                  <span>
                    Page {pagination.page} / {pagination.totalPages}
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12 md:py-20">
                  <div className="w-8 h-8 md:w-12 md:h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className={`ml-3 text-gray-600 ${textSize}`}>Chargement...</span>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-12 md:py-16 text-gray-500">
                  <div className="text-3xl md:text-4xl mb-2 md:mb-3">📭</div>
                  <p className={`font-medium ${textSize}`}>Aucune activité trouvée</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-b border-gray-200">
                        <th className={`${tableCellClass} text-left font-semibold`}>Date/Heure</th>
                        <th className={`${tableCellClass} text-left font-semibold`}>Utilisateur</th>
                        <th className={`${tableCellClass} text-left font-semibold`}>Action</th>
                        <th className={`${tableCellClass} text-left font-semibold`}>Description</th>
                        {isAdmin && <th className={`${tableCellClass} text-left font-semibold`}>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <React.Fragment key={log.id}>
                          <tr className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                            expandedRow === log.id ? 'bg-blue-50' : ''
                          }`}>
                            <td className={tableCellClass}>
                              <div className="flex items-center gap-1">
                                <ClockIcon className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                                <span>{formatDate(log.dateAction)}</span>
                              </div>
                            </td>
                            <td className={tableCellClass}>
                              <div className="font-medium">{log.utilisateurNom}</div>
                              <div className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                                {log.role} • {log.coordination}
                              </div>
                            </td>
                            <td className={tableCellClass}>
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${getActionColor(log.type)}`}></span>
                                <span>
                                  {getActionIcon(log.type)} {getTypeLabel(log.type)}
                                </span>
                              </div>
                            </td>
                            <td className={tableCellClass}>
                              <div className="truncate max-w-[150px] md:max-w-xs" title={log.description}>
                                {log.description}
                              </div>
                            </td>
                            {isAdmin && (
                              <td className={tableCellClass}>
                                <div className="flex gap-1 md:gap-2">
                                  <motion.button
                                    onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-2 py-1 md:px-3 md:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-xs"
                                  >
                                    Détails
                                  </motion.button>
                                  {canAnnuler() && !log.annulee && (
                                    <motion.button
                                      onClick={() => handleUndo(log.id)}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      className="px-2 py-1 md:px-3 md:py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all text-xs"
                                    >
                                      Annuler
                                    </motion.button>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                          
                          {/* Ligne détaillée */}
                          {expandedRow === log.id && (
                            <tr className="bg-blue-50 border-b border-blue-100">
                              <td colSpan={isAdmin ? 5 : 4} className="px-4 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-bold text-gray-700 mb-2 text-sm">Informations</h4>
                                    <div className="space-y-1 text-xs">
                                      <div><span className="font-medium">ID:</span> {log.id}</div>
                                      <div><span className="font-medium">Carte ID:</span> {log.carteId || 'N/A'}</div>
                                      <div><span className="font-medium">IP:</span> {log.ipAddress || 'Inconnue'}</div>
                                      <div><span className="font-medium">Annulée:</span> {log.annulee ? 'Oui' : 'Non'}</div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-bold text-gray-700 mb-2 text-sm">Valeurs modifiées</h4>
                                    <div className="space-y-2 text-xs">
                                      <div>
                                        <span className="font-medium">Ancienne:</span>
                                        <pre className="mt-1 p-2 bg-gray-100 rounded overflow-x-auto max-h-32">
                                          {formatJsonValue(log.ancienneValeur)}
                                        </pre>
                                      </div>
                                      <div>
                                        <span className="font-medium">Nouvelle:</span>
                                        <pre className="mt-1 p-2 bg-gray-100 rounded overflow-x-auto max-h-32">
                                          {formatJsonValue(log.nouvelleValeur)}
                                        </pre>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-4 md:px-6 py-3 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200">
                  <div className={`flex justify-between items-center ${textSize}`}>
                    <span>{pagination.total} total</span>
                    
                    <div className="flex gap-1 md:gap-2">
                      <motion.button
                        onClick={() => fetchLogs(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-2 py-1 md:px-3 md:py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-all text-xs"
                      >
                        Précédent
                      </motion.button>
                      
                      <span className="px-2 py-1 md:px-3 md:py-2 bg-orange-500 text-white rounded-lg text-xs">
                        {pagination.page}
                      </span>
                      
                      <motion.button
                        onClick={() => fetchLogs(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-2 py-1 md:px-3 md:py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-all text-xs"
                      >
                        Suivant
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}

        {/* Vue Imports (Admin uniquement) */}
        {activeTab === 'imports' && isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 p-4 md:p-6"
          >
            <h2 className={`font-bold text-gray-800 mb-4 ${isMobile ? 'text-base' : 'text-xl'}`}>
              Historique des imports
            </h2>

            {importsLoading ? (
              <div className="flex justify-center items-center py-8 md:py-12">
                <div className="w-6 h-6 md:w-8 md:h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className={`ml-3 text-gray-600 ${textSize}`}>Chargement...</span>
              </div>
            ) : imports.length === 0 ? (
              <div className="text-center py-8 md:py-12 text-gray-500">
                <div className="text-3xl md:text-4xl mb-2">📭</div>
                <p className={`font-medium ${textSize}`}>Aucun import trouvé</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                      <th className={tableCellClass}>Date</th>
                      <th className={tableCellClass}>Utilisateur</th>
                      <th className={tableCellClass}>Coordination</th>
                      <th className={tableCellClass}>Cartes</th>
                      <th className={tableCellClass}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {imports.map((imp) => (
                      <tr key={imp.id} className="border-b border-gray-100 hover:bg-blue-50">
                        <td className={tableCellClass}>{formatDate(imp.dateImport)}</td>
                        <td className={tableCellClass}>
                          <div className="font-medium">{imp.utilisateurComplet}</div>
                          <div className="text-xs text-gray-500">@{imp.utilisateurNom}</div>
                        </td>
                        <td className={tableCellClass}>{imp.coordination}</td>
                        <td className={tableCellClass}>
                          <span className="font-bold text-blue-600">{imp.nombreCartes}</span>
                        </td>
                        <td className={tableCellClass}>
                          <motion.button
                            onClick={() => {
                              setSelectedImport(imp.id);
                              setDialogOpen(true);
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-3 py-1 md:px-4 md:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-xs"
                          >
                            Annuler
                          </motion.button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* Vue Backup (Admin uniquement) */}
        {activeTab === 'backup' && isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 p-4 md:p-6"
          >
            <h2 className={`font-bold text-gray-800 mb-4 ${isMobile ? 'text-base' : 'text-xl'}`}>
              Sauvegardes disponibles
            </h2>

            {backupsLoading ? (
              <div className="flex justify-center items-center py-8 md:py-12">
                <div className="w-6 h-6 md:w-8 md:h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className={`ml-3 text-gray-600 ${textSize}`}>Chargement...</span>
              </div>
            ) : backups.length === 0 ? (
              <div className="text-center py-8 md:py-12 text-gray-500">
                <div className="text-3xl md:text-4xl mb-2">📭</div>
                <p className={`font-medium ${textSize}`}>Aucune sauvegarde disponible</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                      <th className={tableCellClass}>Nom</th>
                      <th className={tableCellClass}>Date</th>
                      <th className={tableCellClass}>Type</th>
                      <th className={tableCellClass}>Taille</th>
                      <th className={tableCellClass}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backups.map((backup) => (
                      <tr key={backup.id} className="border-b border-gray-100 hover:bg-green-50">
                        <td className={tableCellClass}>
                          <div className="font-medium">{backup.name}</div>
                          {backup.encrypted && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                              Chiffré
                            </span>
                          )}
                        </td>
                        <td className={tableCellClass}>{backup.created}</td>
                        <td className={tableCellClass}>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            backup.type === 'SQL' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {backup.type}
                          </span>
                        </td>
                        <td className={tableCellClass}>{backup.size}</td>
                        <td className={tableCellClass}>
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-xs"
                            >
                              Télécharger
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all text-xs"
                            >
                              Restaurer
                            </motion.button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Modal d'annulation */}
      {dialogOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 max-w-md w-full mx-auto"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <ShieldExclamationIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h3 className={`font-bold text-gray-800 ${isMobile ? 'text-base' : 'text-lg'}`}>
                Confirmation d'annulation
              </h3>
            </div>
            
            <p className={`text-gray-600 mb-4 md:mb-6 ${textSize}`}>
              Êtes-vous sûr de vouloir annuler cette importation ?
              Cette action est irréversible.
            </p>
            
            <div className="flex justify-end gap-2 md:gap-3">
              <motion.button
                onClick={() => setDialogOpen(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm"
              >
                Annuler
              </motion.button>
              <motion.button
                onClick={handleAnnulerImport}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium text-sm shadow-lg"
              >
                Confirmer
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Journal;