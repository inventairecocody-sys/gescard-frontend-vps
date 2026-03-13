// src/pages/Journal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClockIcon, DocumentTextIcon, ArrowPathIcon, FunnelIcon,
  ArchiveBoxIcon, ChevronDownIcon,
  ChevronUpIcon, MagnifyingGlassIcon, XMarkIcon,
  CheckCircleIcon, PencilIcon, TrashIcon, ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon, InboxArrowDownIcon, ArrowUpTrayIcon,
  ExclamationTriangleIcon, InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { JournalService } from '../Services/api/journal';

// ─── Types ────────────────────────────────────────────────────
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
  page: number; limit: number; total: number; totalPages: number;
}

interface ImportBatch {
  id: string; nombreCartes: number; dateImport: string;
  utilisateurNom: string; utilisateurComplet: string; coordination: string;
}

// ─── Config types ─────────────────────────────────────────────
const TYPE_CONFIG: Record<string, {
  label: string; bg: string; text: string; border: string; icon: React.ReactNode;
}> = {
  CREATE:  { label: 'Création',      bg: 'bg-green-50',   text: 'text-green-700',  border: 'border-green-200',  icon: <CheckCircleIcon         className="w-3.5 h-3.5" /> },
  UPDATE:  { label: 'Modification',  bg: 'bg-orange-50',  text: 'text-orange-700', border: 'border-orange-200', icon: <PencilIcon              className="w-3.5 h-3.5" /> },
  DELETE:  { label: 'Suppression',   bg: 'bg-red-50',     text: 'text-red-700',    border: 'border-red-200',    icon: <TrashIcon               className="w-3.5 h-3.5" /> },
  LOGIN:   { label: 'Connexion',     bg: 'bg-blue-50',    text: 'text-blue-700',   border: 'border-blue-200',   icon: <ArrowRightOnRectangleIcon className="w-3.5 h-3.5" /> },
  LOGOUT:  { label: 'Déconnexion',   bg: 'bg-gray-50',    text: 'text-gray-700',   border: 'border-gray-200',   icon: <ArrowLeftOnRectangleIcon className="w-3.5 h-3.5" /> },
  IMPORT:  { label: 'Import',        bg: 'bg-purple-50',  text: 'text-purple-700', border: 'border-purple-200', icon: <InboxArrowDownIcon      className="w-3.5 h-3.5" /> },
  EXPORT:  { label: 'Export',        bg: 'bg-indigo-50',  text: 'text-indigo-700', border: 'border-indigo-200', icon: <ArrowUpTrayIcon         className="w-3.5 h-3.5" /> },
};

const DOT_COLOR: Record<string, string> = {
  CREATE: 'bg-green-500', UPDATE: 'bg-orange-500', DELETE: 'bg-red-500',
  LOGIN:  'bg-blue-500',  LOGOUT: 'bg-gray-400',   IMPORT: 'bg-purple-500', EXPORT: 'bg-indigo-500',
};

// ─── Utilitaires ──────────────────────────────────────────────
const fmtDate = (d: string) => {
  try { return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return d; }
};

const fmtJson = (v: any) => {
  if (!v) return 'Aucune';
  try { return JSON.stringify(typeof v === 'string' ? JSON.parse(v) : v, null, 2); }
  catch { return String(v); }
};

// ─── Composants ───────────────────────────────────────────────
const TypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const c = TYPE_CONFIG[type] || { label: type, bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: null };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      {c.icon}{c.label}
    </span>
  );
};

const TabBtn: React.FC<{
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string; count?: number;
}> = ({ active, onClick, icon, label, count }) => (
  <button onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
      active
        ? 'bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white shadow-md'
        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
    }`}>
    {icon}
    {label}
    {count !== undefined && (
      <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
        {count}
      </span>
    )}
  </button>
);

// ─── Page principale ──────────────────────────────────────────
const Journal: React.FC = () => {
  const { user, hasRole } = useAuth();
  const { canAnnuler } = usePermissions();

  const isAdmin       = hasRole(['Administrateur']);
  const isGestionnaire = hasRole(['Gestionnaire']);

  const [logs,    setLogs]    = useState<JournalEntry[]>([]);
  const [imports, setImports] = useState<ImportBatch[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 50, total: 0, totalPages: 0 });

  const [loading,        setLoading]        = useState(false);
  const [importsLoading, setImportsLoading] = useState(false);
  const [activeTab,      setActiveTab]      = useState<'journal' | 'imports'>('journal');
  const [showFilters,    setShowFilters]    = useState(false);
  const [expandedRow,    setExpandedRow]    = useState<number | null>(null);

  const [filters, setFilters] = useState({
    dateDebut: '', dateFin: '', utilisateur: '', type: '',
    coordination: user?.coordination || '',
  });

  // ── Fetch logs ─────────────────────────────────────────────
  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: pagination.limit, ...filters };
      if (isGestionnaire && user?.coordination) params.coordination = user.coordination;
      const response = await JournalService.getActions(params);
      setLogs(response.data);
      setPagination(response.pagination);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, filters, isGestionnaire, user?.coordination]);

  const fetchImports = useCallback(async () => {
    setImportsLoading(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      setImports([]);
    } finally {
      setImportsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'journal') fetchLogs();
    else fetchImports();
  }, [activeTab, fetchLogs, fetchImports]);

  const handleUndo = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment annuler cette action ?')) return;
    try {
      await JournalService.annulerAction(id);
      fetchLogs(pagination.page);
    } catch { /* silencieux */ }
  };

  const resetFilters = () => setFilters({
    dateDebut: '', dateFin: '', utilisateur: '', type: '',
    coordination: user?.coordination || '',
  });

  const hasActiveFilters = filters.dateDebut || filters.dateFin || filters.utilisateur || filters.type;

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-5">

        {/* ── En-tête ── */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Journal d'activité</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {isAdmin ? 'Toutes les actions' : 'Actions de votre coordination'} •{' '}
              <span className="text-[#F77F00] font-semibold">{pagination.total} entrée(s)</span>
            </p>
          </div>
          <button
            onClick={() => activeTab === 'journal' ? fetchLogs(pagination.page) : fetchImports()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 shadow-sm transition-all disabled:opacity-50 self-start sm:self-auto">
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </motion.div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-2 flex-wrap">
          <TabBtn active={activeTab === 'journal'} onClick={() => setActiveTab('journal')}
            icon={<DocumentTextIcon className="w-4 h-4" />} label="Journal" count={pagination.total} />
          {isAdmin && (
            <TabBtn active={activeTab === 'imports'} onClick={() => setActiveTab('imports')}
              icon={<ArchiveBoxIcon className="w-4 h-4" />} label="Imports" count={imports.length} />
          )}
        </div>

        {/* ── Tab Journal ── */}
        {activeTab === 'journal' && (
          <div className="space-y-4">

            {/* Barre filtres */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                {/* Recherche rapide */}
                <div className="flex-1 min-w-[200px] relative">
                  <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={filters.utilisateur}
                    onChange={e => setFilters(f => ({ ...f, utilisateur: e.target.value }))}
                    placeholder="Rechercher un utilisateur…"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F77F00]/30 focus:border-[#F77F00]" />
                </div>

                {/* Filtre type */}
                <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
                  className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F77F00]/30 focus:border-[#F77F00]">
                  <option value="">Tous les types</option>
                  {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>

                {/* Bouton filtres avancés */}
                <button onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    showFilters || hasActiveFilters
                      ? 'bg-orange-50 border-orange-300 text-[#F77F00]'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}>
                  <FunnelIcon className="w-4 h-4" />
                  Filtres {hasActiveFilters && <span className="w-2 h-2 bg-[#F77F00] rounded-full" />}
                  {showFilters ? <ChevronUpIcon className="w-3.5 h-3.5" /> : <ChevronDownIcon className="w-3.5 h-3.5" />}
                </button>

                {/* Appliquer */}
                <button onClick={() => fetchLogs(1)}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white text-sm font-semibold rounded-xl shadow hover:shadow-md transition-all">
                  Appliquer
                </button>
              </div>

              {/* Filtres avancés */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="border-t border-gray-100 mt-4 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Date début</label>
                        <input type="date" value={filters.dateDebut}
                          onChange={e => setFilters(f => ({ ...f, dateDebut: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F77F00]/30 focus:border-[#F77F00]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Date fin</label>
                        <input type="date" value={filters.dateFin}
                          onChange={e => setFilters(f => ({ ...f, dateFin: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F77F00]/30 focus:border-[#F77F00]" />
                      </div>
                      <div className="flex items-end">
                        <button onClick={() => { resetFilters(); fetchLogs(1); }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all">
                          <XMarkIcon className="w-4 h-4" /> Réinitialiser
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tableau */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

              {/* Barre info */}
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <span className="text-xs text-gray-500 font-medium">
                  {logs.length} entrée(s) affichée(s) sur {pagination.total}
                </span>
                <span className="text-xs text-gray-400">
                  Page {pagination.page} / {Math.max(1, pagination.totalPages)}
                </span>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <ArrowPathIcon className="w-8 h-8 text-[#F77F00] animate-spin" />
                  <p className="text-gray-500 text-sm">Chargement du journal…</p>
                </div>
              ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <DocumentTextIcon className="w-12 h-12 text-gray-200" />
                  <p className="text-gray-500 font-medium">Aucune activité trouvée</p>
                  <p className="text-gray-400 text-sm">Modifiez vos filtres ou revenez plus tard</p>
                </div>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white">
                          {['Date / Heure', 'Utilisateur', 'Type', 'Description', 'Actions'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map((log, i) => (
                          <React.Fragment key={log.id}>
                            <motion.tr
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                              transition={{ delay: i * 0.02 }}
                              className={`border-b border-gray-50 transition-colors cursor-pointer ${
                                expandedRow === log.id ? 'bg-orange-50/40' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                              } hover:bg-orange-50/30`}
                              onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                            >
                              {/* Date */}
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center gap-1.5 text-gray-600">
                                  <ClockIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                  <span className="text-xs">{fmtDate(log.dateAction)}</span>
                                </div>
                              </td>
                              {/* Utilisateur */}
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 bg-gradient-to-br from-[#F77F00] to-[#FF9E40] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                    {(log.utilisateurNom || log.utilisateurId?.toString() || "?").charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-800 text-sm">{log.utilisateurNom || `Utilisateur #${log.utilisateurId}`}</div>
                                    <div className="text-xs text-gray-400">{log.role || "—"} · {log.coordination || "—"}</div>
                                  </div>
                                </div>
                              </td>
                              {/* Type */}
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${DOT_COLOR[log.type] || 'bg-gray-400'}`} />
                                  <TypeBadge type={log.type} />
                                </div>
                              </td>
                              {/* Description */}
                              <td className="px-4 py-3 max-w-[300px]">
                                <p className="text-sm text-gray-600 truncate" title={log.description}>{log.description}</p>
                                {log.annulee && (
                                  <span className="text-xs text-red-500 font-medium flex items-center gap-1 mt-0.5">
                                    <ExclamationTriangleIcon className="w-3 h-3" /> Annulée
                                  </span>
                                )}
                              </td>
                              {/* Actions */}
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                                  <button
                                    onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                    title="Voir les détails">
                                    <InformationCircleIcon className="w-4 h-4" />
                                  </button>
                                  {isAdmin && canAnnuler() && !log.annulee && ['CREATE', 'UPDATE', 'DELETE', 'IMPORT'].includes(log.type) && (
                                    <button onClick={() => handleUndo(log.id)}
                                      className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                                      title="Annuler cette action">
                                      <ArrowPathIcon className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </motion.tr>

                            {/* Ligne détail expandée */}
                            <AnimatePresence>
                              {expandedRow === log.id && (
                                <tr>
                                  <td colSpan={5} className="p-0">
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="overflow-hidden bg-blue-50/50 border-b border-blue-100"
                                    >
                                      <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Infos générales */}
                                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Informations</h4>
                                          <div className="space-y-2 text-xs">
                                            {[
                                              { label: 'ID action', value: log.id },
                                              { label: 'Carte ID',  value: log.carteId || '—' },
                                              { label: 'IP',        value: log.ipAddress || 'Inconnue' },
                                              { label: 'Annulée',   value: log.annulee ? 'Oui' : 'Non' },
                                            ].map(item => (
                                              <div key={item.label} className="flex justify-between">
                                                <span className="text-gray-400 font-medium">{item.label}</span>
                                                <span className="text-gray-700 font-semibold">{item.value}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                        {/* Ancienne valeur */}
                                        <div className="bg-white rounded-xl border border-red-100 p-4">
                                          <h4 className="text-xs font-bold text-red-400 uppercase tracking-wide mb-3">Avant</h4>
                                          <pre className="text-xs text-gray-600 overflow-auto max-h-32 leading-relaxed">
                                            {fmtJson(log.ancienneValeur)}
                                          </pre>
                                        </div>
                                        {/* Nouvelle valeur */}
                                        <div className="bg-white rounded-xl border border-green-100 p-4">
                                          <h4 className="text-xs font-bold text-green-500 uppercase tracking-wide mb-3">Après</h4>
                                          <pre className="text-xs text-gray-600 overflow-auto max-h-32 leading-relaxed">
                                            {fmtJson(log.nouvelleValeur)}
                                          </pre>
                                        </div>
                                      </div>
                                    </motion.div>
                                  </td>
                                </tr>
                              )}
                            </AnimatePresence>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="md:hidden divide-y divide-gray-100">
                    {logs.map((log, i) => (
                      <motion.div key={log.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                        className="p-4 hover:bg-orange-50/20 transition-colors"
                        onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#F77F00] to-[#FF9E40] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {(log.utilisateurNom || log.utilisateurId?.toString() || "?").charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-800 text-sm">{log.utilisateurNom || `Utilisateur #${log.utilisateurId}`}</div>
                              <div className="text-xs text-gray-400">{fmtDate(log.dateAction)}</div>
                            </div>
                          </div>
                          <TypeBadge type={log.type} />
                        </div>
                        <p className="text-xs text-gray-500 mt-2 ml-10 line-clamp-2">{log.description}</p>

                        {/* Détail mobile */}
                        <AnimatePresence>
                          {expandedRow === log.id && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 ml-10 grid grid-cols-2 gap-2 overflow-hidden">
                              <div className="bg-gray-50 rounded-lg p-2.5 text-xs">
                                <div className="text-gray-400 font-medium mb-1">Carte ID</div>
                                <div className="font-bold text-gray-700">{log.carteId || '—'}</div>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-2.5 text-xs">
                                <div className="text-gray-400 font-medium mb-1">IP</div>
                                <div className="font-bold text-gray-700">{log.ipAddress || 'Inconnue'}</div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-3">
                      <span className="text-xs text-gray-500">{pagination.total} total</span>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => fetchLogs(pagination.page - 1)} disabled={pagination.page <= 1}
                          className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-all">
                          Précédent
                        </button>
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          const p = Math.max(1, Math.min(pagination.page - 2, pagination.totalPages - 4)) + i;
                          return (
                            <button key={p} onClick={() => fetchLogs(p)}
                              className={`w-8 h-8 text-xs rounded-lg font-medium transition-all ${
                                p === pagination.page
                                  ? 'bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white shadow-sm'
                                  : 'border border-gray-200 hover:bg-gray-50 text-gray-600'
                              }`}>
                              {p}
                            </button>
                          );
                        })}
                        <button onClick={() => fetchLogs(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}
                          className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-all">
                          Suivant
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Tab Imports ── */}
        {activeTab === 'imports' && isAdmin && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Historique des imports</h2>
              <p className="text-xs text-gray-400 mt-0.5">Tous les imports Excel effectués</p>
            </div>

            {importsLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <ArrowPathIcon className="w-8 h-8 text-[#F77F00] animate-spin" />
                <p className="text-gray-500 text-sm">Chargement…</p>
              </div>
            ) : imports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <ArchiveBoxIcon className="w-12 h-12 text-gray-200" />
                <p className="text-gray-500 font-medium">Aucun import trouvé</p>
                <p className="text-gray-400 text-sm">Les imports Excel apparaîtront ici</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white">
                      {['Date', 'Utilisateur', 'Coordination', 'Cartes importées', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {imports.map((imp, i) => (
                      <motion.tr key={imp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-orange-50/20 transition-colors">
                        <td className="px-4 py-3 text-xs text-gray-600">{fmtDate(imp.dateImport)}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-800 text-sm">{imp.utilisateurComplet || imp.utilisateurNom}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{imp.coordination}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full text-xs font-bold">
                            <InboxArrowDownIcon className="w-3.5 h-3.5" />
                            {imp.nombreCartes.toLocaleString('fr-FR')} cartes
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {canAnnuler() && (
                            <button onClick={() => handleUndo(parseInt(imp.id))}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-600 border border-amber-200 bg-amber-50 rounded-xl hover:bg-amber-100 font-medium transition-all">
                              <ArrowPathIcon className="w-3.5 h-3.5" /> Annuler
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal;