// src/pages/administration/MisesAJour.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDownTrayIcon, CloudArrowUpIcon, CheckCircleIcon,
  ExclamationTriangleIcon, ClockIcon, TrashIcon, DocumentTextIcon,
  ArrowPathIcon, ShieldCheckIcon, ComputerDesktopIcon,
  InformationCircleIcon, XMarkIcon, ChevronRightIcon,
  ServerStackIcon, DocumentCheckIcon, BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import axios from 'axios';

// VITE_API_URL = 'https://gescardcocody.com/api' → on enlève le /api trailing
const _RAW_URL = (import.meta.env.VITE_API_URL || 'https://gescardcocody.com/api').replace(/\/api\/?$/, '');
const API_BASE = _RAW_URL; // ex: https://gescardcocody.com

// ─── Types ────────────────────────────────────────────────────
interface VersionInfo {
  version:       string | null;
  release_notes: string;
  published_at:  string | null;
  published_by:  string;
  file_size:     number | null;
  mandatory:     boolean;
  download_url:  string | null;
}

interface VersionHistorique {
  filename:   string;
  version:    string;
  size:       number;
  created_at: string;
}

interface Site {
  id:               string;
  nom:              string;
  coordination_nom: string;
}

// ─── Utilitaires ──────────────────────────────────────────────
const formatSize = (bytes: number | null) => {
  if (!bytes) return '—';
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
  return `${(bytes / 1024).toFixed(0)} Ko`;
};

const formatDate = (iso: string | null) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

// ─── Composants ───────────────────────────────────────────────
const SectionCard: React.FC<{
  icon: React.ReactNode; title: string; sub?: string;
  children: React.ReactNode; className?: string;
}> = ({ icon, title, sub, children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
      <div className="w-9 h-9 bg-gradient-to-br from-[#F77F00] to-[#FF9E40] rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="font-bold text-gray-800 text-sm">{title}</h2>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const KpiTile: React.FC<{
  label: string; value: string; gradient: string; icon: React.ReactNode;
}> = ({ label, value, gradient, icon }) => (
  <div className={`rounded-xl p-4 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
    <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full bg-white/10" />
    <div className="relative z-10 flex items-center gap-3">
      <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">{icon}</div>
      <div>
        <div className="text-white/70 text-xs font-medium">{label}</div>
        <div className="text-white font-black text-base leading-tight">{value}</div>
      </div>
    </div>
  </div>
);

// ─── Page principale ──────────────────────────────────────────
const MisesAJour: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token   = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // ── États : Mises à jour logiciel ────────────────────────────
  const [versionActuelle, setVersionActuelle] = useState<VersionInfo | null>(null);
  const [historique,      setHistorique]      = useState<VersionHistorique[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [uploading,       setUploading]       = useState(false);
  const [uploadProgress,  setUploadProgress]  = useState(0);
  const [error,           setError]           = useState('');
  const [success,         setSuccess]         = useState('');
  const [confirmDel,      setConfirmDel]      = useState<string | null>(null);
  const [confirmRestore,  setConfirmRestore]  = useState<string | null>(null);
  const [confirmClear,    setConfirmClear]    = useState(false);
  const [restoring,       setRestoring]       = useState(false);
  const [clearing,        setClearing]        = useState(false);
  const [formData,        setFormData]        = useState({
    version: '', release_notes: '', mandatory: false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver,     setDragOver]     = useState(false);

  // ── États : Fichier hors-ligne ───────────────────────────────
  const [sites,           setSites]           = useState<Site[]>([]);
  const [selectedSite,    setSelectedSite]    = useState('');
  const [validite,        setValidite]        = useState(7);
  const [includeCards,    setIncludeCards]    = useState(false);
  const [filterBySite,    setFilterBySite]    = useState(false); // ✅ nouvelle option
  const [generatingFile,  setGeneratingFile]  = useState(false);
  const [loadingSites,    setLoadingSites]    = useState(true);
  const [initError,       setInitError]       = useState('');
  const [initSuccess,     setInitSuccess]     = useState('');

  // ── Chargement : versions logiciel ──────────────────────────
  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const [latest, hist] = await Promise.all([
        axios.get(`${API_BASE}/api/updates/latest`),
        axios.get(`${API_BASE}/api/updates/history`, { headers }),
      ]);
      setVersionActuelle(latest.data.version ? latest.data : null);
      setHistorique(hist.data.versions || []);
    } catch {
      setError('Impossible de charger les données.');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { charger(); }, [charger]);

  // ── Chargement : sites pour fichier hors-ligne ───────────────
  const fetchSites = useCallback(async () => {
    try {
      setLoadingSites(true);
      const res = await axios.get(`${API_BASE}/api/init-file/sites`, { headers });
      const liste: Site[] = res.data.sites || [];
      setSites(liste);
      if (liste.length > 0) setSelectedSite(liste[0].id);
    } catch {
      setInitError('Impossible de charger la liste des sites.');
    } finally {
      setLoadingSites(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchSites(); }, [fetchSites]);

  // ── Sélection fichier .exe ───────────────────────────────────
  const handleFile = (file: File | null) => {
    if (!file) return;
    if (!file.name.endsWith('.exe')) { setError('Seuls les fichiers .exe sont acceptés.'); return; }
    setSelectedFile(file);
    setError('');
    const match = file.name.match(/v?(\d+\.\d+\.\d+)/);
    if (match) setFormData(f => ({ ...f, version: match[1] }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    handleFile(e.dataTransfer.files[0] || null);
  };

  // ── Publication version logiciel ─────────────────────────────
  const handlePublish = async () => {
    if (!selectedFile) { setError('Sélectionnez un fichier .exe.'); return; }
    if (!formData.version.match(/^\d+\.\d+\.\d+$/)) { setError('Format invalide. Ex : 1.2.3'); return; }

    setUploading(true); setUploadProgress(0); setError(''); setSuccess('');
    const data = new FormData();
    data.append('file',          selectedFile);
    data.append('version',       formData.version);
    data.append('release_notes', formData.release_notes);
    data.append('mandatory',     String(formData.mandatory));

    try {
      await axios.post(`${API_BASE}/api/updates/publish`, data, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => setUploadProgress(Math.round(((e.loaded || 0) / (e.total || 1)) * 100)),
      });
      setSuccess(`✓ Version ${formData.version} publiée avec succès !`);
      setSelectedFile(null);
      setFormData({ version: '', release_notes: '', mandatory: false });
      if (fileInputRef.current) fileInputRef.current.value = '';
      await charger();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erreur lors de la publication.');
    } finally {
      setUploading(false); setUploadProgress(0);
    }
  };

  // ── Suppression version ──────────────────────────────────────
  const handleDelete = async (version: string) => {
    try {
      await axios.delete(`${API_BASE}/api/updates/${version}`, { headers });
      setSuccess(`Version ${version} supprimée.`);
      setConfirmDel(null);
      await charger();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erreur lors de la suppression.');
    }
  };

  // ── Restauration ancienne version ────────────────────────────
  const handleRestore = async (version: string) => {
    setRestoring(true);
    try {
      await axios.post(`${API_BASE}/api/updates/restore/${version}`, {}, { headers });
      setSuccess(`Version ${version} restaurée. Les logiciels terrain recevront cette version.`);
      setConfirmRestore(null);
      await charger();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erreur lors de la restauration.');
    } finally {
      setRestoring(false);
    }
  };

  // ── Vider toutes les versions ─────────────────────────────────
  const handleClearAll = async () => {
    setClearing(true);
    try {
      await axios.delete(`${API_BASE}/api/updates/clear-all`, { headers });
      setSuccess('Toutes les versions ont été supprimées.');
      setConfirmClear(false);
      await charger();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erreur lors de la suppression.');
    } finally {
      setClearing(false);
    }
  };

  // ── Génération fichier hors-ligne ────────────────────────────
  const handleGenerateInitFile = async () => {
    if (!selectedSite) { setInitError('Veuillez sélectionner un site.'); return; }
    setGeneratingFile(true);
    setInitError('');
    setInitSuccess('');

    try {
      const response = await axios.post(
        `${API_BASE}/api/init-file/generate`,
        {
          site_id:        selectedSite,
          validite_jours: validite,
          include_cards:  includeCards,
          filter_by_site: includeCards ? filterBySite : false, // ✅ envoi de l'option
        },
        { headers, responseType: 'blob' }
      );

      // Déclencher le téléchargement dans le navigateur
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.download = `${selectedSite}-init.gescard`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      const siteLabel = sites.find(s => s.id === selectedSite)?.nom || selectedSite;
      const cartesMsg = includeCards
        ? filterBySite
          ? `cartes du site uniquement`
          : `toutes les cartes`
        : `sans cartes`;
      setInitSuccess(`Fichier généré pour "${siteLabel}" · Validité : ${validite} jour(s) · ${cartesMsg}. Envoyez-le au responsable du site.`);
    } catch (e: any) {
      // Si le blob contient une erreur JSON, on la lit
      try {
        const text = await (e.response?.data as Blob)?.text?.();
        const json = text ? JSON.parse(text) : null;
        setInitError(json?.message || 'Erreur lors de la génération du fichier.');
      } catch {
        setInitError('Erreur lors de la génération du fichier.');
      }
    } finally {
      setGeneratingFile(false);
    }
  };

  // ── Loader ───────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center gap-4">
      <ArrowPathIcon className="w-8 h-8 text-[#F77F00] animate-spin" />
      <span className="text-gray-600 font-medium">Chargement…</span>
    </div>
  );

  // ── Rendu ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6">

        {/* ── En-tête ── */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Mises à jour logiciel</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Administration — <span className="text-[#F77F00] font-semibold">GESCARD Desktop</span>
            </p>
          </div>
          <button onClick={charger}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 shadow-sm transition-all self-start sm:self-auto">
            <ArrowPathIcon className="w-4 h-4" />
            Actualiser
          </button>
        </motion.div>

        {/* ── Alerts MAJ logiciel ── */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{error}</span>
              <button onClick={() => setError('')}><XMarkIcon className="w-4 h-4 text-red-400 hover:text-red-600" /></button>
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
              <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{success}</span>
              <button onClick={() => setSuccess('')}><XMarkIcon className="w-4 h-4 text-green-400 hover:text-green-600" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── KPI row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiTile
            label="Version actuelle"
            value={versionActuelle?.version ? `v${versionActuelle.version}` : 'Aucune'}
            gradient="from-[#F77F00] to-[#FF9E40]"
            icon={<ComputerDesktopIcon className="w-5 h-5 text-white" />}
          />
          <KpiTile
            label="Taille"
            value={formatSize(versionActuelle?.file_size || null)}
            gradient="from-blue-500 to-sky-600"
            icon={<ArrowDownTrayIcon className="w-5 h-5 text-white" />}
          />
          <KpiTile
            label="Versions archivées"
            value={String(historique.length)}
            gradient="from-violet-500 to-purple-600"
            icon={<ClockIcon className="w-5 h-5 text-white" />}
          />
          <KpiTile
            label="Type"
            value={versionActuelle?.mandatory ? 'Obligatoire' : 'Optionnelle'}
            gradient={versionActuelle?.mandatory ? 'from-red-500 to-rose-600' : 'from-green-500 to-emerald-600'}
            icon={<ShieldCheckIcon className="w-5 h-5 text-white" />}
          />
        </div>

        {/* ── Ligne principale : Version actuelle + Publication ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Version actuelle */}
          <SectionCard
            icon={<InformationCircleIcon className="w-4 h-4 text-white" />}
            title="Version publiée"
            sub="Actuellement disponible pour les utilisateurs"
          >
            {!versionActuelle?.version ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <ComputerDesktopIcon className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium text-sm">Aucune version publiée</p>
                <p className="text-gray-400 text-xs mt-1">Publiez une première version ci-contre</p>
              </div>
            ) : (
              <div className="space-y-4">

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#F77F00] to-[#FF9E40] rounded-xl flex items-center justify-center shadow">
                      <CheckCircleIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Version</div>
                      <div className="text-xl font-black text-[#F77F00]">v{versionActuelle.version}</div>
                    </div>
                  </div>
                  {versionActuelle.mandatory && (
                    <span className="flex items-center gap-1.5 text-xs bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded-full font-semibold">
                      <ShieldCheckIcon className="w-3.5 h-3.5" /> Obligatoire
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                      <ArrowDownTrayIcon className="w-3 h-3" /> Taille
                    </div>
                    <div className="font-bold text-gray-700 text-sm">{formatSize(versionActuelle.file_size)}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                      <ClockIcon className="w-3 h-3" /> Publiée le
                    </div>
                    <div className="font-bold text-gray-700 text-xs leading-snug">{formatDate(versionActuelle.published_at)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2.5">
                  <div className="w-6 h-6 bg-gradient-to-br from-[#F77F00] to-[#FF9E40] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {versionActuelle.published_by?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <span>Publiée par <strong className="text-gray-700">{versionActuelle.published_by || '—'}</strong></span>
                </div>

                {versionActuelle.release_notes && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 mb-2">
                      <DocumentTextIcon className="w-3.5 h-3.5" /> Notes de version
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{versionActuelle.release_notes}</p>
                  </div>
                )}

                <a href={`${API_BASE}/api/updates/download`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-[#F77F00] text-[#F77F00] font-semibold text-sm rounded-xl hover:bg-orange-50 transition-all">
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Tester le téléchargement
                </a>
              </div>
            )}
          </SectionCard>

          {/* Formulaire publication */}
          <SectionCard
            icon={<CloudArrowUpIcon className="w-4 h-4 text-white" />}
            title="Publier une nouvelle version"
            sub="Déposez le fichier .exe et renseignez les informations"
          >
            <div className="space-y-4">

              {/* Zone dépôt fichier */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                  selectedFile
                    ? 'border-green-400 bg-green-50'
                    : dragOver
                      ? 'border-[#F77F00] bg-orange-50 scale-[1.01]'
                      : 'border-gray-300 bg-gray-50/50 hover:border-[#F77F00] hover:bg-orange-50/40'
                }`}
              >
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-700 truncate max-w-[160px]">{selectedFile.name}</p>
                      <p className="text-xs text-gray-400">{formatSize(selectedFile.size)}</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); setSelectedFile(null); }}
                      className="ml-2 p-1 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all">
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <CloudArrowUpIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">Glissez ou cliquez pour sélectionner</p>
                    <p className="text-xs text-gray-400 mt-1">Fichier .exe · Max 500 Mo</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept=".exe" className="hidden"
                  onChange={e => handleFile(e.target.files?.[0] || null)} />
              </div>

              {/* Version + Obligatoire */}
              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Numéro de version <span className="text-red-500">*</span>
                  </label>
                  <input type="text" placeholder="Ex : 1.2.3" value={formData.version}
                    onChange={e => setFormData(f => ({ ...f, version: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F77F00]/30 focus:border-[#F77F00]" />
                </div>
                <div className="flex items-center gap-2.5 pb-0.5">
                  <div className="relative">
                    <input type="checkbox" id="mandatory" checked={formData.mandatory}
                      onChange={e => setFormData(f => ({ ...f, mandatory: e.target.checked }))}
                      className="sr-only" />
                    <div onClick={() => setFormData(f => ({ ...f, mandatory: !f.mandatory }))}
                      className={`w-10 h-6 rounded-full cursor-pointer transition-all duration-200 ${formData.mandatory ? 'bg-red-500' : 'bg-gray-200'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${formData.mandatory ? 'left-5' : 'left-1'}`} />
                    </div>
                  </div>
                  <label htmlFor="mandatory" className="text-xs text-gray-600 cursor-pointer select-none"
                    onClick={() => setFormData(f => ({ ...f, mandatory: !f.mandatory }))}>
                    <span className="font-semibold">Obligatoire</span><br />
                    <span className="text-gray-400">Forcer la MAJ</span>
                  </label>
                </div>
              </div>

              {/* Notes de version */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes de version</label>
                <textarea rows={3} placeholder="Décrivez les nouveautés, corrections de bugs…"
                  value={formData.release_notes}
                  onChange={e => setFormData(f => ({ ...f, release_notes: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F77F00]/30 focus:border-[#F77F00] resize-none" />
              </div>

              {/* Barre de progression */}
              <AnimatePresence>
                {uploading && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <ArrowPathIcon className="w-3 h-3 animate-spin text-[#F77F00]" /> Envoi en cours…
                      </span>
                      <span className="font-bold text-[#F77F00]">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        className="h-2.5 rounded-full bg-gradient-to-r from-[#F77F00] to-[#FF9E40]"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bouton publier */}
              <button onClick={handlePublish}
                disabled={uploading || !selectedFile || !formData.version}
                className="w-full py-3 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white font-bold text-sm rounded-xl shadow hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {uploading
                  ? <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Publication en cours…</>
                  : <><CloudArrowUpIcon className="w-4 h-4" /> Publier la version</>
                }
              </button>
            </div>
          </SectionCard>
        </div>

        {/* ── Historique ── */}
        <SectionCard
          icon={<ClockIcon className="w-4 h-4 text-white" />}
          title="Historique des versions"
          sub={`${historique.length} version(s) archivée(s)`}
          className=""
        >
          {historique.length > 0 && (
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setConfirmClear(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-all"
              >
                <TrashIcon className="w-3.5 h-3.5" />
                Vider tout
              </button>
            </div>
          )}
          {historique.length === 0 ? (
            <div className="text-center py-8">
              <ClockIcon className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Aucun historique disponible</p>
            </div>
          ) : (
            <div className="space-y-2">
              {historique
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((v, i) => {
                  const isActive = versionActuelle?.version === v.version;
                  return (
                    <motion.div key={v.version}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200'
                          : 'bg-gray-50/50 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isActive ? 'bg-gradient-to-br from-[#F77F00] to-[#FF9E40]' : 'bg-gray-200'
                        }`}>
                          {isActive
                            ? <CheckCircleIcon className="w-4 h-4 text-white" />
                            : <ClockIcon className="w-4 h-4 text-gray-500" />
                          }
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-black text-base ${isActive ? 'text-[#F77F00]' : 'text-gray-700'}`}>
                              v{v.version}
                            </span>
                            {isActive && (
                              <span className="text-xs bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full font-semibold">
                                Actuelle
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <ArrowDownTrayIcon className="w-3 h-3" /> {formatSize(v.size)}
                            </span>
                            <ChevronRightIcon className="w-2.5 h-2.5" />
                            <span className="flex items-center gap-1">
                              <ClockIcon className="w-3 h-3" /> {formatDate(v.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isActive && (
                          <>
                            <button
                              onClick={() => setConfirmRestore(v.version)}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-500 border border-blue-200 rounded-xl hover:bg-blue-50 transition-all"
                              title="Restaurer cette version comme version active"
                            >
                              <ArrowPathIcon className="w-3.5 h-3.5" />
                              Restaurer
                            </button>
                            <button onClick={() => setConfirmDel(v.version)}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                              title="Supprimer cette version">
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              }
            </div>
          )}
        </SectionCard>

        {/* ═══════════════════════════════════════════════════════
            ── SECTION : Fichier d'initialisation hors-ligne ──
        ════════════════════════════════════════════════════════ */}
        <SectionCard
          icon={<ServerStackIcon className="w-4 h-4 text-white" />}
          title="Fichier d'initialisation hors-ligne"
          sub="Générer un fichier .gescard pour un poste sans connexion internet"
        >
          <div className="space-y-5">

            {/* Bandeau info */}
            <div className="flex gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <InformationCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                Ce fichier chiffré permettra à un poste hors-ligne de démarrer avec
                les comptes et données du site sélectionné. Il expire automatiquement
                après la durée choisie.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Colonne gauche : formulaire */}
              <div className="space-y-4">

                {/* Sélecteur de site */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
                    <BuildingOfficeIcon className="w-3.5 h-3.5 text-gray-400" />
                    Site cible
                  </label>
                  {loadingSites ? (
                    <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
                  ) : (
                    <select
                      value={selectedSite}
                      onChange={e => setSelectedSite(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F77F00]/30 focus:border-[#F77F00] bg-gray-50"
                    >
                      {sites.length === 0
                        ? <option value="">Aucun site disponible</option>
                        : sites.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.nom} — {s.coordination_nom}
                            </option>
                          ))
                      }
                    </select>
                  )}
                </div>

                {/* Slider validité */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
                    <ClockIcon className="w-3.5 h-3.5 text-gray-400" />
                    Validité
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range" min={1} max={30} value={validite}
                      onChange={e => setValidite(Number(e.target.value))}
                      className="flex-1 accent-orange-500"
                    />
                    <span className="w-20 text-center px-2 py-1.5 bg-orange-50 text-orange-700 font-bold rounded-xl text-sm border border-orange-200 flex-shrink-0">
                      {validite}j
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Expire le{' '}
                    <span className="font-medium text-gray-600">
                      {new Date(Date.now() + validite * 86400000).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </span>
                  </p>
                </div>

                {/* Option inclure cartes */}
                <div
                  onClick={() => {
                    setIncludeCards(v => !v);
                    if (includeCards) setFilterBySite(false); // reset filter si on décoche
                  }}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    includeCards ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                    includeCards ? 'bg-orange-500 border-orange-500' : 'border-gray-300 bg-white'
                  }`}>
                    {includeCards && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-700">Inclure les cartes</p>
                    <p className="text-xs text-gray-500 truncate">Fichier plus volumineux, données immédiates</p>
                  </div>
                  <ExclamationTriangleIcon className={`w-4 h-4 flex-shrink-0 ${includeCards ? 'text-orange-400' : 'text-gray-300'}`} />
                </div>

                {/* ✅ Option filtre par site — visible seulement si "Inclure les cartes" est coché */}
                <AnimatePresence>
                  {includeCards && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div
                        onClick={() => setFilterBySite(v => !v)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          filterBySite ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                          filterBySite ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white'
                        }`}>
                          {filterBySite && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-700">Cartes du site uniquement</p>
                          <p className="text-xs text-gray-500 truncate">
                            {filterBySite
                              ? 'Seulement les cartes de ce site — fichier plus léger'
                              : 'Par défaut : toutes les cartes sont incluses'}
                          </p>
                        </div>
                        <BuildingOfficeIcon className={`w-4 h-4 flex-shrink-0 ${filterBySite ? 'text-blue-400' : 'text-gray-300'}`} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

              {/* Colonne droite : récapitulatif */}
              <div className="flex flex-col justify-between gap-4">

                {/* Récap */}
                {selectedSite ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 flex-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1 mb-3">
                      <DocumentCheckIcon className="w-3.5 h-3.5" />
                      Récapitulatif
                    </p>
                    {[
                      ['Site',           sites.find(s => s.id === selectedSite)?.nom           || selectedSite],
                      ['Coordination',   sites.find(s => s.id === selectedSite)?.coordination_nom || '—'],
                      ['Validité',       `${validite} jour${validite > 1 ? 's' : ''}`],
                      ['Cartes incluses', includeCards ? 'Oui' : 'Non'],
                      ...(includeCards ? [['Périmètre cartes', filterBySite ? 'Site uniquement' : 'Toutes les cartes']] : []),
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between text-sm">
                        <span className="text-gray-500">{label}</span>
                        <span className={`font-semibold ${
                          label === 'Périmètre cartes' && filterBySite ? 'text-blue-600' : 'text-gray-800'
                        }`}>{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-400 text-center">Sélectionnez un site<br />pour voir le récapitulatif</p>
                  </div>
                )}

                {/* Bouton générer */}
                <button
                  onClick={handleGenerateInitFile}
                  disabled={generatingFile || !selectedSite || loadingSites}
                  className="w-full py-3 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white font-bold text-sm rounded-xl shadow hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {generatingFile ? (
                    <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Génération en cours…</>
                  ) : (
                    <><ArrowDownTrayIcon className="w-4 h-4" /> Générer le fichier .gescard</>
                  )}
                </button>

                {/* Note sécurité */}
                <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
                  <ShieldCheckIcon className="w-3 h-3" />
                  Chiffré · Signé · Expiration automatique
                </p>
              </div>
            </div>

            {/* Alerts hors-ligne */}
            <AnimatePresence>
              {initError && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{initError}</span>
                  <button onClick={() => setInitError('')}><XMarkIcon className="w-4 h-4 text-red-400 hover:text-red-600" /></button>
                </motion.div>
              )}
              {initSuccess && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
                  <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{initSuccess}</span>
                  <button onClick={() => setInitSuccess('')}><XMarkIcon className="w-4 h-4 text-green-400 hover:text-green-600" /></button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </SectionCard>
        {/* ── Fin section hors-ligne ── */}

      </div>

      {/* ── Modal confirmation suppression ── */}
      <AnimatePresence>
        {confirmDel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setConfirmDel(null)}
          >
            <motion.div initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrashIcon className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 text-center mb-1">Supprimer la version</h3>
              <p className="text-gray-500 text-sm text-center mb-6">
                Supprimer définitivement la version <strong className="text-gray-800">v{confirmDel}</strong> ?<br />
                Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDel(null)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 text-sm font-medium transition-all">
                  Annuler
                </button>
                <button onClick={() => handleDelete(confirmDel)}
                  className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-semibold text-sm shadow hover:shadow-md hover:from-red-600 transition-all">
                  Supprimer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal confirmation restauration ── */}
      <AnimatePresence>
        {confirmRestore && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setConfirmRestore(null)}
          >
            <motion.div initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ArrowPathIcon className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 text-center mb-1">Restaurer la version</h3>
              <p className="text-gray-500 text-sm text-center mb-2">
                Définir <strong className="text-gray-800">v{confirmRestore}</strong> comme version active ?
              </p>
              <p className="text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-center mb-6">
                Les logiciels terrain recevront cette version à leur prochaine connexion.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmRestore(null)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 text-sm font-medium transition-all">
                  Annuler
                </button>
                <button onClick={() => handleRestore(confirmRestore)} disabled={restoring}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-sky-500 text-white rounded-xl font-semibold text-sm shadow hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {restoring ? <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Restauration…</> : 'Restaurer'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal confirmation vider tout ── */}
      <AnimatePresence>
        {confirmClear && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setConfirmClear(false)}
          >
            <motion.div initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrashIcon className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 text-center mb-1">Vider toutes les versions</h3>
              <p className="text-gray-500 text-sm text-center mb-2">
                Supprimer <strong className="text-gray-800">toutes les versions</strong> archivées, y compris la version active ?
              </p>
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-center mb-6">
                ⚠️ Les logiciels terrain ne recevront plus de mise à jour jusqu'à la prochaine publication.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmClear(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 text-sm font-medium transition-all">
                  Annuler
                </button>
                <button onClick={handleClearAll} disabled={clearing}
                  className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-semibold text-sm shadow hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {clearing ? <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Suppression…</> : 'Tout supprimer'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MisesAJour;