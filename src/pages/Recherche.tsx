// src/pages/Recherche.tsx
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon, FunnelIcon, ArrowPathIcon,
  DocumentArrowUpIcon, CheckCircleIcon, XCircleIcon,
  ChevronDownIcon, MapPinIcon, CalendarIcon, UserIcon,
  PhoneIcon, IdentificationIcon, BuildingOfficeIcon,
  GlobeAltIcon,
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

// ─── Types ────────────────────────────────────────────────────
interface CriteresRecherche {
  coordination: string; lieuEnrolement: string; siteRetrait: string;
  rangement: string; nom: string; prenoms: string; lieuNaissance: string;
  dateNaissance: string; delivrance: string; dateDelivrance: string; contactRetrait: string;
}

interface CarteEtendue {
  id: number; coordination: string; lieuEnrolement: string; siteRetrait: string;
  rangement: string; nom: string; prenoms: string; dateNaissance: string;
  lieuNaissance: string; contact: string; delivrance: string; contactRetrait: string;
  dateDelivrance: string; dateCreation: string; dateModification?: string;
  createurId?: number; moderateurId?: number;
}

// ─── Helpers ──────────────────────────────────────────────────
const inputCls = "w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E07B00]/20 focus:border-[#E07B00] transition-all";

const FilterField: React.FC<{ label: string; icon: React.ReactNode; children: React.ReactNode }> = ({ label, icon, children }) => (
  <div>
    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
      <span className="text-[#E07B00]">{icon}</span>{label}
    </label>
    {children}
  </div>
);

// ─── Toast ────────────────────────────────────────────────────
const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 40, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 20, scale: 0.95 }}
    className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-semibold whitespace-nowrap ${
      type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-gradient-to-r from-red-500 to-rose-500'
    }`}
  >
    {type === 'success' ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
    <span>{message}</span>
    <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100 text-lg leading-none">×</button>
  </motion.div>
);

// ─── Page principale ──────────────────────────────────────────
const Recherche: React.FC = () => {
  const { user, hasRole }        = useAuth();
  const { canImport }            = usePermissions();
  const isChefEquipe             = hasRole(["Chef d'équipe"]);
  const isOperateur              = hasRole(['Opérateur']);

  const [resultats,        setResultats]        = useState<CarteEtendue[]>([]);
  const [loading,          setLoading]          = useState(false);
  const [importLoading,    setImportLoading]    = useState(false);
  const [hasModifications, setHasModifications] = useState(false);
  const [totalResultats,   setTotalResultats]   = useState(0);
  const [currentPage,      setCurrentPage]      = useState(1);
  const [totalPages,       setTotalPages]       = useState(1);
  const [showImportModal,  setShowImportModal]  = useState(false);
  const [importMode,       setImportMode]       = useState<'standard' | 'smart'>('standard');
  const [showFilters,      setShowFilters]      = useState(true);
  const [toast,            setToast]            = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Référence aux cartes originales pour détecter les modifications
  const cartesOriginalesRef = useRef<CarteEtendue[]>([]);

  const [criteres, setCriteres] = useState<CriteresRecherche>({
    coordination: '', lieuEnrolement: '', siteRetrait: '', rangement: '',
    nom: '', prenoms: '', lieuNaissance: '', dateNaissance: '',
    delivrance: '', dateDelivrance: '', contactRetrait: '',
  });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Recherche ──
  const handleRecherche = async (page = 1) => {
    setLoading(true);
    try {
      const params: QueryParams = { page, limit: 50 };
      if (criteres.coordination)   params.coordination   = criteres.coordination;
      if (criteres.lieuEnrolement) params.lieuEnrolement = criteres.lieuEnrolement;
      if (criteres.siteRetrait)    params.siteRetrait    = criteres.siteRetrait;
      if (criteres.rangement)      params.rangement      = criteres.rangement;
      if (criteres.nom)            params.nom            = criteres.nom;
      if (criteres.prenoms)        params.prenoms        = criteres.prenoms;
      if (criteres.lieuNaissance)  params.lieuNaissance  = criteres.lieuNaissance;
      if (criteres.dateNaissance)  params.dateNaissance  = criteres.dateNaissance;
      if (criteres.delivrance)     params.delivrance     = criteres.delivrance === 'oui' ? true : criteres.delivrance === 'non' ? false : undefined;
      if (criteres.dateDelivrance) params.dateDelivrance = criteres.dateDelivrance;
      if (criteres.contactRetrait) params.contactRetrait = criteres.contactRetrait;

      const response = await CartesService.getCartes(params);

      const cartesConverties: CarteEtendue[] = response.data.map((carte: any) => ({
        id:               carte.id,
        coordination:     carte.coordination   || '',
        lieuEnrolement:   carte.lieuEnrolement || carte["LIEU D'ENROLEMENT"] || '',
        siteRetrait:      carte.siteRetrait    || carte["SITE DE RETRAIT"]   || '',
        rangement:        carte.rangement      || '',
        nom:              carte.nom            || '',
        prenoms:          carte.prenoms        || carte.prenom               || '',
        dateNaissance:    carte.dateNaissance  || carte["DATE DE NAISSANCE"] || '',
        lieuNaissance:    carte.lieuNaissance  || carte["LIEU NAISSANCE"]    || '',
        contact:          carte.contact        || '',
        delivrance:       carte.delivrance != null ? String(carte.delivrance) : '',
        contactRetrait:   carte.contactRetrait || carte["CONTACT DE RETRAIT"] || '',
        dateDelivrance:   carte.dateDelivrance || carte["DATE DE DELIVRANCE"]  || '',
        dateCreation:     carte.dateCreation   || carte.dateimport             || new Date().toISOString(),
        dateModification: carte.dateModification,
        createurId:       carte.createurId,
        moderateurId:     carte.moderateurId,
      }));

      setResultats(cartesConverties);
      // ✅ Snapshot des originaux pour comparaison future
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
  };

  // ── Mapping colonnes DB ──
  const toDbColumns = (carte: Partial<CarteEtendue>): Record<string, any> => {
    const m: Record<string, any> = {};
    if (carte.lieuEnrolement !== undefined) m["LIEU D'ENROLEMENT"] = carte.lieuEnrolement;
    if (carte.siteRetrait    !== undefined) m["SITE DE RETRAIT"]   = carte.siteRetrait;
    if (carte.rangement      !== undefined) m["rangement"]          = carte.rangement;
    if (carte.nom            !== undefined) m["nom"]                = carte.nom;
    if (carte.prenoms        !== undefined) m["prenoms"]            = carte.prenoms;
    if (carte.dateNaissance  !== undefined) m["DATE DE NAISSANCE"]  = carte.dateNaissance || null;
    if (carte.lieuNaissance  !== undefined) m["LIEU NAISSANCE"]     = carte.lieuNaissance;
    if (carte.contact        !== undefined) m["contact"]            = carte.contact;
    if (carte.delivrance     !== undefined) m["delivrance"]         = carte.delivrance;
    if (carte.contactRetrait !== undefined) m["CONTACT DE RETRAIT"] = carte.contactRetrait;
    if (carte.dateDelivrance !== undefined) m["DATE DE DELIVRANCE"] = carte.dateDelivrance || null;
    if (carte.coordination   !== undefined) m["coordination"]       = carte.coordination;
    return m;
  };

  // ── Sauvegarde ──
  // ✅ FIX : Comparaison par ID (Map) et non par index pour éviter les faux négatifs
  const handleSaveModifications = async () => {
    const origMap = new Map(cartesOriginalesRef.current.map(c => [c.id, c]));

    const modifiees = resultats.filter((carte) => {
      const orig = origMap.get(carte.id);
      if (!orig) return false;
      return (
        carte.delivrance     !== orig.delivrance     ||
        carte.contactRetrait !== orig.contactRetrait ||
        carte.dateDelivrance !== orig.dateDelivrance ||
        carte.nom            !== orig.nom            ||
        carte.prenoms        !== orig.prenoms        ||
        carte.rangement      !== orig.rangement      ||
        carte.lieuEnrolement !== orig.lieuEnrolement ||
        carte.siteRetrait    !== orig.siteRetrait
      );
    });

    if (modifiees.length === 0) {
      showToast('Aucune modification à sauvegarder', 'error');
      return;
    }

    try {
      for (const carte of modifiees) {
        const payload = isChefEquipe
          ? toDbColumns({ delivrance: carte.delivrance, contactRetrait: carte.contactRetrait, dateDelivrance: carte.dateDelivrance })
          : toDbColumns(carte);
        await CartesService.updateCarte(carte.id, payload);
      }
      setHasModifications(false);
      cartesOriginalesRef.current = resultats.map(c => ({ ...c }));
      showToast(`${modifiees.length} modification(s) enregistrée(s) avec succès`);
    } catch {
      showToast("Erreur lors de l'enregistrement", 'error');
    }
  };

  const handleImport = async (file: File) => {
    setImportLoading(true);
    try {
      const result   = await ImportExportService.importFile(file, importMode);
      const imported = result.stats?.imported ?? 0;
      const updated  = result.stats?.updated  ?? 0;
      const errors   = result.stats?.errors   ?? 0;
      setShowImportModal(false);
      showToast(`Import terminé — ${imported} ajoutée(s), ${updated} mise(s) à jour${errors > 0 ? `, ${errors} erreur(s)` : ''}`);
      if (imported > 0 || updated > 0) handleRecherche(currentPage);
    } catch (error: any) {
      showToast(error.response?.data?.message || "Erreur lors de l'import", 'error');
    } finally {
      setImportLoading(false);
    }
  };

  const handleUpdateResultats = (nouvellesCartes: CarteEtendue[]) => {
    setResultats(nouvellesCartes);
    setHasModifications(true);
  };

  const handleReset = () => {
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
  };

  const handlePageChange = (newPage: number) => {
    if (hasModifications && !window.confirm('Des modifications non sauvegardées seront perdues. Continuer ?')) return;
    handleRecherche(newPage);
  };

  const activeFiltersCount = Object.values(criteres).filter(v => v !== '').length;

  // ── Render ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-5">

        {/* ── En-tête ── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Recherche de cartes</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {user?.coordination
                ? <span className="text-[#E07B00] font-semibold">{user.coordination}</span>
                : 'Toutes les coordinations'
              }
              {totalResultats > 0 && (
                <span className="ml-2">· <strong className="text-gray-700">{totalResultats.toLocaleString('fr-FR')}</strong> carte(s)</span>
              )}
            </p>
          </div>
          {canImport() && (
            <button onClick={() => setShowImportModal(true)} disabled={importLoading}
              className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#E07B00] to-[#F5980A] text-white text-sm font-semibold rounded-xl shadow hover:shadow-md transition-all disabled:opacity-50">
              {importLoading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <DocumentArrowUpIcon className="w-4 h-4" />}
              Importer
            </button>
          )}
        </motion.div>

        {/* ── Panneau filtres ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-[#E07B00] to-[#F5980A] rounded-lg flex items-center justify-center">
                <FunnelIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-bold text-gray-800 text-sm">Critères de recherche</span>
                {activeFiltersCount > 0 && (
                  <span className="ml-2 text-xs bg-amber-50 text-[#E07B00] border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
                    {activeFiltersCount} actif(s)
                  </span>
                )}
              </div>
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
              <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${showFilters ? '' : '-rotate-90'}`} />
              {showFilters ? 'Masquer' : 'Afficher'}
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                  <FilterField label="Coordination" icon={<BuildingOfficeIcon className="w-3.5 h-3.5" />}>
                    <CoordinationDropdown
                      value={criteres.coordination}
                      onChange={v => setCriteres(c => ({ ...c, coordination: v }))}
                      placeholder="Sélectionner une coordination" />
                  </FilterField>

                  <FilterField label="Lieu d'enrôlement" icon={<MapPinIcon className="w-3.5 h-3.5" />}>
                    <input type="text" value={criteres.lieuEnrolement}
                      onChange={e => setCriteres(c => ({ ...c, lieuEnrolement: e.target.value }))}
                      placeholder="Lieu d'enrôlement…" className={inputCls} />
                  </FilterField>

                  <FilterField label="Site de retrait" icon={<GlobeAltIcon className="w-3.5 h-3.5" />}>
                    <SiteDropdown multiple={false} selectedSites={criteres.siteRetrait}
                      onChange={v => setCriteres(c => ({ ...c, siteRetrait: v as string }))}
                      placeholder="Sélectionner un site" />
                  </FilterField>

                  <FilterField label="Rangement" icon={<IdentificationIcon className="w-3.5 h-3.5" />}>
                    <input type="text" value={criteres.rangement}
                      onChange={e => setCriteres(c => ({ ...c, rangement: e.target.value }))}
                      placeholder="N° de rangement…" className={inputCls} />
                  </FilterField>

                  <FilterField label="Nom" icon={<UserIcon className="w-3.5 h-3.5" />}>
                    <input type="text" value={criteres.nom}
                      onChange={e => setCriteres(c => ({ ...c, nom: e.target.value }))}
                      placeholder="Nom…" className={inputCls} />
                  </FilterField>

                  <FilterField label="Prénom(s)" icon={<UserIcon className="w-3.5 h-3.5" />}>
                    <input type="text" value={criteres.prenoms}
                      onChange={e => setCriteres(c => ({ ...c, prenoms: e.target.value }))}
                      placeholder="Prénoms…" className={inputCls} />
                  </FilterField>

                  <FilterField label="Lieu de naissance" icon={<MapPinIcon className="w-3.5 h-3.5" />}>
                    <input type="text" value={criteres.lieuNaissance}
                      onChange={e => setCriteres(c => ({ ...c, lieuNaissance: e.target.value }))}
                      placeholder="Lieu de naissance…" className={inputCls} />
                  </FilterField>

                  <FilterField label="Date de naissance" icon={<CalendarIcon className="w-3.5 h-3.5" />}>
                    <input type="date" value={criteres.dateNaissance}
                      onChange={e => setCriteres(c => ({ ...c, dateNaissance: e.target.value }))}
                      className={inputCls} />
                  </FilterField>

                  <FilterField label="Délivrance" icon={<CheckCircleIcon className="w-3.5 h-3.5" />}>
                    <select value={criteres.delivrance}
                      onChange={e => setCriteres(c => ({ ...c, delivrance: e.target.value }))}
                      className={inputCls}>
                      <option value="">Tous</option>
                      <option value="oui">Délivrées</option>
                      <option value="non">Non délivrées</option>
                    </select>
                  </FilterField>

                  <FilterField label="Date de délivrance" icon={<CalendarIcon className="w-3.5 h-3.5" />}>
                    <input type="date" value={criteres.dateDelivrance}
                      onChange={e => setCriteres(c => ({ ...c, dateDelivrance: e.target.value }))}
                      className={inputCls} />
                  </FilterField>

                  <FilterField label="Contact de retrait" icon={<PhoneIcon className="w-3.5 h-3.5" />}>
                    <input type="text" value={criteres.contactRetrait}
                      onChange={e => setCriteres(c => ({ ...c, contactRetrait: e.target.value }))}
                      placeholder="Contact de retrait…" className={inputCls} />
                  </FilterField>

                </div>

                {/* Actions filtres */}
                <div className="px-5 pb-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                  <button onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                    <ArrowPathIcon className="w-4 h-4" />
                    Réinitialiser
                  </button>
                  <button onClick={() => handleRecherche(1)} disabled={loading}
                    className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-[#E07B00] to-[#F5980A] text-white text-sm font-bold rounded-xl shadow hover:shadow-md transition-all disabled:opacity-50">
                    {loading
                      ? <><ArrowPathIcon className="w-4 h-4 animate-spin" />Recherche…</>
                      : <><MagnifyingGlassIcon className="w-4 h-4" />Rechercher</>
                    }
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 flex flex-col items-center gap-3">
            <ArrowPathIcon className="w-10 h-10 text-[#E07B00] animate-spin" />
            <p className="text-gray-400 text-sm">Recherche en cours…</p>
          </div>
        )}

        {/* ── Résultats ── */}
        {!loading && resultats.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

            {/* Header résultats */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <span className="font-bold text-gray-800 text-sm">Résultats</span>
                <span className="ml-2 text-xs text-gray-400">
                  {totalResultats.toLocaleString('fr-FR')} carte(s) · p.{currentPage}/{totalPages}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1}
                  className="w-8 h-8 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 text-sm transition-all">←</button>
                <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-[#E07B00] font-bold text-xs rounded-lg">
                  {currentPage}/{totalPages}
                </span>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}
                  className="w-8 h-8 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 text-sm transition-all">→</button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <TableCartesExcel
                cartes={resultats as any}
                role={user?.role || ''}
                onUpdateCartes={handleUpdateResultats as any}
                canEdit={!isOperateur}
                editFields={isChefEquipe ? ['delivrance', 'contactRetrait', 'dateDelivrance'] : undefined}
              />
            </div>

            <AnimatePresence>
              {hasModifications && !isOperateur && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-5 py-4 border-t border-gray-100 bg-emerald-50/50 flex items-center justify-between gap-3">
                  <p className="text-sm text-emerald-700 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    Des modifications sont en attente d'enregistrement
                  </p>
                  <button onClick={handleSaveModifications}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-bold rounded-xl shadow hover:shadow-md transition-all">
                    <CheckCircleIcon className="w-4 h-4" />
                    Enregistrer les modifications
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── État vide ── */}
        {!loading && resultats.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MagnifyingGlassIcon className="w-7 h-7 text-gray-300" />
            </div>
            <h3 className="font-bold text-gray-700 text-lg mb-1">Aucune carte trouvée</h3>
            <p className="text-gray-400 text-sm">Utilisez les filtres de recherche ci-dessus pour trouver des cartes</p>
          </div>
        )}
      </div>

      <ImportModal isOpen={showImportModal}
        onClose={() => { setShowImportModal(false); setImportMode('standard'); }}
        onFileSelect={handleImport} isImporting={importLoading}
        mode={importMode} onModeChange={setImportMode} />

      <AnimatePresence>
        {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default Recherche;