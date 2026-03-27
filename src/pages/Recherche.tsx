// src/pages/Recherche.tsx
import React, { useState, useRef, useCallback, useMemo,} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon, FunnelIcon, ArrowPathIcon,
  DocumentArrowUpIcon, CheckCircleIcon, XCircleIcon,
  ChevronDownIcon, MapPinIcon, CalendarIcon, UserIcon,
  PhoneIcon, IdentificationIcon, BuildingOfficeIcon,
  GlobeAltIcon, ArrowDownTrayIcon, TableCellsIcon,
  ChevronLeftIcon, ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useAuth }             from '../hooks/useAuth';
import { usePermissions }      from '../hooks/usePermissions';
import { CartesService }       from '../Services/api/cartes';
import { ImportExportService } from '../Services/api/import-export';
import type { QueryParams }    from '../types';
import TableCartesExcel        from '../components/TableCartesExcel';
import ImportModal             from '../components/ImportModal';
import SiteDropdown            from '../components/SiteDropdown';
import CoordinationDropdown    from '../components/CoordinationDropdown';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CriteresRecherche {
  coordination: string;
  lieuEnrolement: string;
  siteRetrait: string;
  rangement: string;
  nom: string;
  prenoms: string;
  lieuNaissance: string;
  dateNaissance: string;
  delivrance: string;
  dateDelivrance: string;
  contactRetrait: string;
}

interface CarteEtendue {
  id: number;
  coordination: string;
  lieuEnrolement: string;
  siteRetrait: string;
  rangement: string;
  nom: string;
  prenoms: string;
  dateNaissance: string;
  lieuNaissance: string;
  contact: string;
  delivrance: string;
  contactRetrait: string;
  dateDelivrance: string;
  dateCreation: string;
  dateModification?: string;
  createurId?: number;
  moderateurId?: number;
}

// ─── Constantes ───────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 50;
const TOAST_DURATION = 3500;

// ─── Helpers UI ───────────────────────────────────────────────────────────────
const inputCls = "w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E07B00]/20 focus:border-[#E07B00] transition-all placeholder:text-gray-300";
const selectCls = "w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E07B00]/20 focus:border-[#E07B00] transition-all text-gray-700 appearance-none";

// ─── Composants UI ────────────────────────────────────────────────────────────

const FilterField: React.FC<{
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
}> = ({ label, icon, children, active }) => (
  <div className={`transition-all ${active ? 'relative' : ''}`}>
    <label className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide mb-1.5 transition-colors ${
      active ? 'text-[#E07B00]' : 'text-gray-400'
    }`}>
      <span className={`transition-colors ${active ? 'text-[#E07B00]' : 'text-gray-400'}`}>{icon}</span>
      {label}
      {active && <span className="w-1.5 h-1.5 rounded-full bg-[#E07B00] ml-auto animate-pulse" />}
    </label>
    {children}
  </div>
);

const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({
  message, type, onClose,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 40, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 20, scale: 0.95 }}
    className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-semibold max-w-[90vw] ${
      type === 'success'
        ? 'bg-gradient-to-r from-emerald-500 to-green-500'
        : 'bg-gradient-to-r from-red-500 to-rose-500'
    }`}
  >
    {type === 'success'
      ? <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
      : <XCircleIcon className="w-5 h-5 flex-shrink-0" />}
    <span className="truncate">{message}</span>
    <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100 text-lg leading-none flex-shrink-0">×</button>
  </motion.div>
);

const LoadingSpinner: React.FC<{ text?: string; subtext?: string }> = ({ 
  text = "Recherche en cours…", 
  subtext = "Interrogation de la base de données" 
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 flex flex-col items-center gap-4"
  >
    <div className="relative">
      <div className="w-16 h-16 rounded-full border-4 border-orange-100" />
      <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-[#E07B00] border-t-transparent animate-spin" />
    </div>
    <div className="text-center">
      <p className="text-gray-700 font-semibold">{text}</p>
      <p className="text-gray-400 text-sm mt-1">{subtext}</p>
    </div>
  </motion.div>
);

const EmptyState: React.FC<{ onOpenFilters: () => void }> = ({ onOpenFilters }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 text-center"
  >
    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-gray-100">
      <MagnifyingGlassIcon className="w-8 h-8 text-gray-300" />
    </div>
    <h3 className="font-bold text-gray-700 text-lg mb-2">Aucune carte trouvée</h3>
    <p className="text-gray-400 text-sm max-w-sm mx-auto">
      Utilisez les filtres de recherche ci-dessus pour trouver des cartes. Vous pouvez combiner plusieurs critères.
    </p>
    <button
      onClick={onOpenFilters}
      className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 text-[#E07B00] text-sm font-semibold rounded-xl hover:bg-amber-100 transition-all"
    >
      <FunnelIcon className="w-4 h-4" />
      Ouvrir les filtres
    </button>
  </motion.div>
);

// ─── Pagination ───────────────────────────────────────────────────────────────
const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  totalResultats: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}> = ({ currentPage, totalPages, totalResultats, itemsPerPage, onPageChange, className = "" }) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalResultats);

  const getPageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const delta = 1;
    
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between gap-2 ${className}`}>
      <span className="text-xs text-gray-400">
        Affichage {startItem}–{endItem} sur {totalResultats.toLocaleString('fr-FR')}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeftIcon className="w-3.5 h-3.5" />
          Préc.
        </button>
        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers.map((p, idx) =>
            p === '...' ? (
              <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p as number)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                  p === currentPage
                    ? 'bg-gradient-to-br from-[#E07B00] to-[#F5980A] text-white shadow-sm shadow-orange-200'
                    : 'border border-gray-200 text-gray-600 hover:bg-amber-50 hover:border-amber-200 hover:text-[#E07B00]'
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Suiv.
          <ChevronRightIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// ─── Page principale ──────────────────────────────────────────────────────────
const Recherche: React.FC = () => {
  const { user, hasRole } = useAuth();
  const { canImport } = usePermissions();
  
  const isChefEquipe = hasRole(["Chef d'équipe"]);
  const isOperateur = hasRole(['Opérateur']);

  // États
  const [resultats, setResultats] = useState<CarteEtendue[]>([]);
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState<'csv' | 'excel' | null>(null);
  const [hasModifications, setHasModifications] = useState(false);
  const [totalResultats, setTotalResultats] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importMode, setImportMode] = useState<'standard' | 'smart'>('standard');
  const [showFilters, setShowFilters] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Refs
  const cartesOriginalesRef = useRef<CarteEtendue[]>([]);

  // État des critères
  const [criteres, setCriteres] = useState<CriteresRecherche>({
    coordination: '', lieuEnrolement: '', siteRetrait: '', rangement: '',
    nom: '', prenoms: '', lieuNaissance: '', dateNaissance: '',
    delivrance: '', dateDelivrance: '', contactRetrait: '',
  });

  // Calcul du nombre de filtres actifs
  const activeFiltersCount = useMemo(() => 
    Object.values(criteres).filter(v => v !== '').length, 
    [criteres]
  );

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), TOAST_DURATION);
  }, []);

  // Conversion carte DB -> format étendu
  const convertToExtendedCarte = useCallback((carte: any): CarteEtendue => ({
    id: carte.id,
    coordination: carte.coordination || '',
    lieuEnrolement: carte.lieuEnrolement || carte["LIEU D'ENROLEMENT"] || '',
    siteRetrait: carte.siteRetrait || carte["SITE DE RETRAIT"] || '',
    rangement: carte.rangement || '',
    nom: carte.nom || '',
    prenoms: carte.prenoms || carte.prenom || '',
    dateNaissance: carte.dateNaissance || carte["DATE DE NAISSANCE"] || '',
    lieuNaissance: carte.lieuNaissance || carte["LIEU NAISSANCE"] || '',
    contact: carte.contact || '',
    delivrance: carte.delivrance != null ? String(carte.delivrance) : '',
    contactRetrait: carte.contactRetrait || carte["CONTACT DE RETRAIT"] || '',
    dateDelivrance: carte.dateDelivrance || carte["DATE DE DELIVRANCE"] || '',
    dateCreation: carte.dateCreation || carte.dateimport || new Date().toISOString(),
    dateModification: carte.dateModification,
    createurId: carte.createurId,
    moderateurId: carte.moderateurId,
  }), []);

  // ── Recherche ──────────────────────────────────────────────────────────────
  const handleRecherche = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: QueryParams = { page, limit: ITEMS_PER_PAGE };
      
      // Ajout des critères non vides
      Object.entries(criteres).forEach(([key, value]) => {
        if (value) {
          if (key === 'delivrance') {
            params.delivrance = value === 'oui' ? true : value === 'non' ? false : undefined;
          } else if (value) {
            (params as any)[key] = value;
          }
        }
      });

      const response = await CartesService.getCartes(params);
      const cartesConverties = response.data.map(convertToExtendedCarte);

      setResultats(cartesConverties);
      cartesOriginalesRef.current = cartesConverties.map(c => ({ ...c }));
      setTotalResultats(response.pagination.total);
      setCurrentPage(response.pagination.page);
      setTotalPages(response.pagination.totalPages);
      setHasModifications(false);
    } catch {
      setResultats([]);
      showToast('Erreur lors de la recherche', 'error');
    } finally {
      setLoading(false);
    }
  }, [criteres, convertToExtendedCarte, showToast]);

  // ── Mapping colonnes DB ────────────────────────────────────────────────────
  const toDbColumns = useCallback((carte: Partial<CarteEtendue>): Record<string, any> => {
    const m: Record<string, any> = {};
    if (carte.lieuEnrolement !== undefined) m["LIEU D'ENROLEMENT"] = carte.lieuEnrolement;
    if (carte.siteRetrait !== undefined) m["SITE DE RETRAIT"] = carte.siteRetrait;
    if (carte.rangement !== undefined) m["rangement"] = carte.rangement;
    if (carte.nom !== undefined) m["nom"] = carte.nom;
    if (carte.prenoms !== undefined) m["prenoms"] = carte.prenoms;
    if (carte.dateNaissance !== undefined) m["DATE DE NAISSANCE"] = carte.dateNaissance || null;
    if (carte.lieuNaissance !== undefined) m["LIEU NAISSANCE"] = carte.lieuNaissance;
    if (carte.contact !== undefined) m["contact"] = carte.contact;
    if (carte.delivrance !== undefined) m["delivrance"] = carte.delivrance;
    if (carte.contactRetrait !== undefined) m["CONTACT DE RETRAIT"] = carte.contactRetrait;
    if (carte.dateDelivrance !== undefined) m["DATE DE DELIVRANCE"] = carte.dateDelivrance || null;
    if (carte.coordination !== undefined) m["coordination"] = carte.coordination;
    return m;
  }, []);

  // ── Sauvegarde ──────────────────────────────────────────────────────────────
  const handleSaveModifications = useCallback(async () => {
    const origMap = new Map(cartesOriginalesRef.current.map(c => [c.id, c]));
    const modifiees = resultats.filter((carte) => {
      const orig = origMap.get(carte.id);
      if (!orig) return false;
      return (
        carte.delivrance !== orig.delivrance ||
        carte.contactRetrait !== orig.contactRetrait ||
        carte.dateDelivrance !== orig.dateDelivrance ||
        carte.nom !== orig.nom ||
        carte.prenoms !== orig.prenoms ||
        carte.rangement !== orig.rangement ||
        carte.lieuEnrolement !== orig.lieuEnrolement ||
        carte.siteRetrait !== orig.siteRetrait
      );
    });

    if (modifiees.length === 0) {
      showToast('Aucune modification à sauvegarder', 'error');
      return;
    }

    try {
      for (const carte of modifiees) {
        const payload = isChefEquipe
          ? toDbColumns({ 
              delivrance: carte.delivrance, 
              contactRetrait: carte.contactRetrait, 
              dateDelivrance: carte.dateDelivrance 
            })
          : toDbColumns(carte);
        await CartesService.updateCarte(carte.id, payload);
      }
      setHasModifications(false);
      cartesOriginalesRef.current = resultats.map(c => ({ ...c }));
      showToast(`${modifiees.length} modification(s) enregistrée(s) avec succès`);
    } catch {
      showToast("Erreur lors de l'enregistrement", 'error');
    }
  }, [resultats, isChefEquipe, toDbColumns, showToast]);

  // ── Exports ────────────────────────────────────────────────────────────────
  const handleExportResultatsCSV = useCallback(async () => {
    if (resultats.length === 0) {
      showToast('Aucun résultat à exporter', 'error');
      return;
    }
    setExportLoading('csv');
    try {
      const headers = [
        "LIEU D'ENROLEMENT", "SITE DE RETRAIT", "RANGEMENT", "NOM", "PRENOMS",
        "DATE DE NAISSANCE", "LIEU NAISSANCE", "CONTACT", "DELIVRANCE",
        "CONTACT DE RETRAIT", "DATE DE DELIVRANCE", "COORDINATION",
      ];
      const rows = resultats.map(c => [
        c.lieuEnrolement, c.siteRetrait, c.rangement, c.nom, c.prenoms,
        c.dateNaissance, c.lieuNaissance, c.contact, c.delivrance,
        c.contactRetrait, c.dateDelivrance, c.coordination,
      ]);
      const csvContent = '\uFEFF' + [headers, ...rows].map(row =>
        row.map(v => {
          const s = (v ?? '').toString().replace(/"/g, '""');
          return s.includes(';') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
        }).join(';')
      ).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resultats-recherche-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(`${resultats.length} carte(s) exportée(s) en CSV`);
    } catch {
      showToast("Erreur lors de l'export CSV", 'error');
    } finally {
      setExportLoading(null);
    }
  }, [resultats, showToast]);

  const handleExportResultatsExcel = useCallback(async () => {
    if (resultats.length === 0) {
      showToast('Aucun résultat à exporter', 'error');
      return;
    }
    setExportLoading('excel');
    try {
      const params = new URLSearchParams();
      Object.entries(criteres).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      const blob = await ImportExportService.exportCartes('excel', Object.fromEntries(params));
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resultats-recherche-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Export Excel des résultats téléchargé');
    } catch {
      showToast("Export Excel indisponible, utilisez le CSV", 'error');
    } finally {
      setExportLoading(null);
    }
  }, [resultats, criteres, showToast]);

  const handleExportToutCSV = useCallback(async () => {
    setExportLoading('csv');
    try {
      const blob = await ImportExportService.exportCartes('csv');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `export-complet-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Export CSV complet téléchargé');
    } catch {
      showToast("Erreur lors de l'export CSV complet", 'error');
    } finally {
      setExportLoading(null);
    }
  }, [showToast]);

  const handleExportToutExcel = useCallback(async () => {
    setExportLoading('excel');
    try {
      const blob = await ImportExportService.exportCartes('excel');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `export-complet-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Export Excel complet téléchargé');
    } catch {
      showToast("Erreur lors de l'export Excel complet", 'error');
    } finally {
      setExportLoading(null);
    }
  }, [showToast]);

  // ── Import ─────────────────────────────────────────────────────────────────
  const handleImport = useCallback(async (file: File) => {
    setImportLoading(true);
    try {
      const result = await ImportExportService.importFile(file, importMode);
      const imported = result.stats?.imported ?? 0;
      const updated = result.stats?.updated ?? 0;
      const errors = result.stats?.errors ?? 0;
      setShowImportModal(false);
      showToast(`Import terminé — ${imported} ajoutée(s), ${updated} mise(s) à jour${errors > 0 ? `, ${errors} erreur(s)` : ''}`);
      if (imported > 0 || updated > 0) handleRecherche(currentPage);
    } catch (error: any) {
      showToast(error.response?.data?.message || "Erreur lors de l'import", 'error');
    } finally {
      setImportLoading(false);
    }
  }, [importMode, handleRecherche, currentPage, showToast]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleUpdateResultats = useCallback((nouvellesCartes: CarteEtendue[]) => {
    setResultats(nouvellesCartes);
    setHasModifications(true);
  }, []);

  const handleReset = useCallback(() => {
    setCriteres({
      coordination: '', lieuEnrolement: '', siteRetrait: '', rangement: '',
      nom: '', prenoms: '', lieuNaissance: '', dateNaissance: '',
      delivrance: '', dateDelivrance: '', contactRetrait: '',
    });
    setResultats([]);
    setTotalResultats(0);
    setCurrentPage(1);
    setTotalPages(1);
    setHasModifications(false);
    cartesOriginalesRef.current = [];
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    if (hasModifications && !window.confirm('Des modifications non sauvegardées seront perdues. Continuer ?')) return;
    handleRecherche(newPage);
  }, [hasModifications, handleRecherche]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/40 via-white to-orange-50/20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-5">

        {/* ══════════════════════════════════════════════════════════
            En-tête
        ══════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-start justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#E07B00] to-[#F5980A] rounded-xl flex items-center justify-center shadow-md shadow-orange-200 flex-shrink-0">
                <MagnifyingGlassIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight">
                  Recherche de cartes
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  {user?.coordination
                    ? <span className="text-[#E07B00] font-semibold">{user.coordination}</span>
                    : 'Toutes les coordinations'
                  }
                  {totalResultats > 0 && (
                    <span className="ml-2">
                      · <strong className="text-gray-700">{totalResultats.toLocaleString('fr-FR')}</strong> carte(s) trouvée(s)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Boutons Export + Import */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {canImport() && (
              <>
                <button
                  onClick={handleExportToutCSV}
                  disabled={exportLoading === 'csv'}
                  title="Exporter toutes les données en CSV"
                  className="flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl shadow-sm hover:bg-amber-50 hover:border-amber-300 hover:text-[#E07B00] transition-all disabled:opacity-50"
                >
                  {exportLoading === 'csv'
                    ? <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    : <ArrowDownTrayIcon className="w-4 h-4" />}
                  <span className="hidden sm:inline">CSV</span>
                </button>

                <button
                  onClick={handleExportToutExcel}
                  disabled={exportLoading === 'excel'}
                  title="Exporter toutes les données en Excel"
                  className="flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl shadow-sm hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all disabled:opacity-50"
                >
                  {exportLoading === 'excel'
                    ? <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    : <TableCellsIcon className="w-4 h-4" />}
                  <span className="hidden sm:inline">Excel</span>
                </button>

                <div className="w-px h-6 bg-gray-200 hidden sm:block" />

                <button
                  onClick={() => setShowImportModal(true)}
                  disabled={importLoading}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#E07B00] to-[#F5980A] text-white text-sm font-semibold rounded-xl shadow hover:shadow-md transition-all disabled:opacity-50"
                >
                  {importLoading
                    ? <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    : <DocumentArrowUpIcon className="w-4 h-4" />}
                  <span className="hidden sm:inline">Importer</span>
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════
            Panneau Filtres
        ══════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-[#E07B00] to-[#F5980A] rounded-xl flex items-center justify-center shadow-sm shadow-orange-100">
                <FunnelIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-bold text-gray-800 text-sm">Critères de recherche</span>
                {activeFiltersCount > 0 ? (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs bg-amber-50 text-[#E07B00] border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
                      {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={handleReset}
                      className="text-xs text-gray-400 hover:text-red-400 transition-colors underline underline-offset-2"
                    >
                      Tout effacer
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 mt-0.5">Aucun filtre actif</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium"
            >
              <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform duration-200 ${showFilters ? '' : '-rotate-90'}`} />
              {showFilters ? 'Réduire' : 'Développer'}
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <FilterField label="Coordination" icon={<BuildingOfficeIcon className="w-3.5 h-3.5" />} active={!!criteres.coordination}>
                    <CoordinationDropdown
                      value={criteres.coordination}
                      onChange={v => setCriteres(c => ({ ...c, coordination: v }))}
                      placeholder="Toutes les coordinations" 
                    />
                  </FilterField>

                  <FilterField label="Lieu d'enrôlement" icon={<MapPinIcon className="w-3.5 h-3.5" />} active={!!criteres.lieuEnrolement}>
                    <input 
                      type="text" 
                      value={criteres.lieuEnrolement}
                      onChange={e => setCriteres(c => ({ ...c, lieuEnrolement: e.target.value }))}
                      placeholder="Lieu d'enrôlement…" 
                      className={inputCls} 
                    />
                  </FilterField>

                  <FilterField label="Site de retrait" icon={<GlobeAltIcon className="w-3.5 h-3.5" />} active={!!criteres.siteRetrait}>
                    <SiteDropdown 
                      multiple={false} 
                      selectedSites={criteres.siteRetrait}
                      onChange={v => setCriteres(c => ({ ...c, siteRetrait: v as string }))}
                      placeholder="Sélectionner un site" 
                    />
                  </FilterField>

                  <FilterField label="Rangement" icon={<IdentificationIcon className="w-3.5 h-3.5" />} active={!!criteres.rangement}>
                    <input 
                      type="text" 
                      value={criteres.rangement}
                      onChange={e => setCriteres(c => ({ ...c, rangement: e.target.value }))}
                      placeholder="N° de rangement…" 
                      className={inputCls} 
                    />
                  </FilterField>

                  <FilterField label="Nom" icon={<UserIcon className="w-3.5 h-3.5" />} active={!!criteres.nom}>
                    <input 
                      type="text" 
                      value={criteres.nom}
                      onChange={e => setCriteres(c => ({ ...c, nom: e.target.value }))}
                      placeholder="Nom…" 
                      className={inputCls} 
                    />
                  </FilterField>

                  <FilterField label="Prénom(s)" icon={<UserIcon className="w-3.5 h-3.5" />} active={!!criteres.prenoms}>
                    <input 
                      type="text" 
                      value={criteres.prenoms}
                      onChange={e => setCriteres(c => ({ ...c, prenoms: e.target.value }))}
                      placeholder="Prénoms…" 
                      className={inputCls} 
                    />
                  </FilterField>

                  <FilterField label="Lieu de naissance" icon={<MapPinIcon className="w-3.5 h-3.5" />} active={!!criteres.lieuNaissance}>
                    <input 
                      type="text" 
                      value={criteres.lieuNaissance}
                      onChange={e => setCriteres(c => ({ ...c, lieuNaissance: e.target.value }))}
                      placeholder="Lieu de naissance…" 
                      className={inputCls} 
                    />
                  </FilterField>

                  <FilterField label="Date de naissance" icon={<CalendarIcon className="w-3.5 h-3.5" />} active={!!criteres.dateNaissance}>
                    <input 
                      type="date" 
                      value={criteres.dateNaissance}
                      onChange={e => setCriteres(c => ({ ...c, dateNaissance: e.target.value }))}
                      className={inputCls} 
                    />
                  </FilterField>

                  <FilterField label="Délivrance" icon={<CheckCircleIcon className="w-3.5 h-3.5" />} active={!!criteres.delivrance}>
                    <select 
                      value={criteres.delivrance}
                      onChange={e => setCriteres(c => ({ ...c, delivrance: e.target.value }))}
                      className={selectCls}
                    >
                      <option value="">Toutes</option>
                      <option value="oui">✅ Délivrées</option>
                      <option value="non">⬜ Non délivrées</option>
                    </select>
                  </FilterField>

                  <FilterField label="Date de délivrance" icon={<CalendarIcon className="w-3.5 h-3.5" />} active={!!criteres.dateDelivrance}>
                    <input 
                      type="date" 
                      value={criteres.dateDelivrance}
                      onChange={e => setCriteres(c => ({ ...c, dateDelivrance: e.target.value }))}
                      className={inputCls} 
                    />
                  </FilterField>

                  <FilterField label="Contact de retrait" icon={<PhoneIcon className="w-3.5 h-3.5" />} active={!!criteres.contactRetrait}>
                    <input 
                      type="text" 
                      value={criteres.contactRetrait}
                      onChange={e => setCriteres(c => ({ ...c, contactRetrait: e.target.value }))}
                      placeholder="Contact de retrait…" 
                      className={inputCls} 
                    />
                  </FilterField>
                </div>

                <div className="px-5 pb-5 pt-2 border-t border-gray-100 flex items-center justify-between gap-3">
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-700 transition-all font-medium"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                    Réinitialiser
                  </button>
                  <button
                    onClick={() => handleRecherche(1)}
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-[#E07B00] to-[#F5980A] text-white text-sm font-bold rounded-xl shadow hover:shadow-md transition-all disabled:opacity-50 active:scale-95"
                  >
                    {loading
                      ? <><ArrowPathIcon className="w-4 h-4 animate-spin" />Recherche en cours…</>
                      : <><MagnifyingGlassIcon className="w-4 h-4" />Rechercher</>
                    }
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════
            Loading / Résultats / Empty State
        ══════════════════════════════════════════════════════════ */}
        {loading ? (
          <LoadingSpinner />
        ) : resultats.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
          >
            {/* Header avec pagination */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-gray-100 gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <span className="font-bold text-gray-800 text-sm">
                    {totalResultats.toLocaleString('fr-FR')} carte{totalResultats > 1 ? 's' : ''} trouvée{totalResultats > 1 ? 's' : ''}
                  </span>
                  {totalPages > 1 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Page {currentPage} sur {totalPages} · {resultats.length} affichée{resultats.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Préc.</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {(() => {
                      const pages: (number | string)[] = [];
                      const delta = 1;
                      for (let i = 1; i <= totalPages; i++) {
                        if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                          pages.push(i);
                        } else if (pages[pages.length - 1] !== '...') {
                          pages.push('...');
                        }
                      }
                      return pages.map((p, idx) =>
                        p === '...' ? (
                          <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">…</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => handlePageChange(p as number)}
                            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                              p === currentPage
                                ? 'bg-gradient-to-br from-[#E07B00] to-[#F5980A] text-white shadow-sm shadow-orange-200'
                                : 'border border-gray-200 text-gray-600 hover:bg-amber-50 hover:border-amber-200 hover:text-[#E07B00]'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      );
                    })()}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <span className="hidden sm:inline">Suiv.</span>
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Tableau */}
            <TableCartesExcel
              cartes={resultats as any}
              role={user?.role || ''}
              onUpdateCartes={handleUpdateResultats as any}
              canEdit={!isOperateur}
              editFields={isChefEquipe ? ['delivrance', 'contactRetrait', 'dateDelivrance'] : undefined}
              onExportCSV={canImport() ? handleExportResultatsCSV : undefined}
              onExportExcel={canImport() ? handleExportResultatsExcel : undefined}
            />

            {/* Barre sauvegarde */}
            <AnimatePresence>
              {hasModifications && !isOperateur && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 sm:px-5 py-4 border-t border-emerald-100 bg-gradient-to-r from-emerald-50/80 to-green-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <p className="text-sm text-emerald-700 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse flex-shrink-0" />
                    Des modifications sont en attente d'enregistrement
                  </p>
                  <button
                    onClick={handleSaveModifications}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-bold rounded-xl shadow hover:shadow-md transition-all w-full sm:w-auto justify-center"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    Enregistrer les modifications
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination bas de page */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalResultats={totalResultats}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
              className="px-4 sm:px-5 py-3 border-t border-gray-100 bg-gray-50/40"
            />
          </motion.div>
        ) : (
          <EmptyState onOpenFilters={() => setShowFilters(true)} />
        )}
      </div>

      {/* Modales & Notifications */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => { setShowImportModal(false); setImportMode('standard'); }}
        onFileSelect={handleImport}
        isImporting={importLoading}
        mode={importMode}
        onModeChange={setImportMode}
      />

      <AnimatePresence>
        {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {exportLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-2xl text-sm font-semibold text-gray-700"
          >
            <ArrowPathIcon className="w-4 h-4 animate-spin text-[#E07B00]" />
            Export {exportLoading === 'csv' ? 'CSV' : 'Excel'} en cours…
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Recherche;