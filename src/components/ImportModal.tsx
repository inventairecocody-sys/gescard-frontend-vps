// src/components/ImportModal.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../Services/api/client";
import {
  DocumentArrowUpIcon,
  DocumentTextIcon,
  TableCellsIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: File) => Promise<void> | void;
  isImporting: boolean;
  mode?: 'standard' | 'smart';
  onModeChange?: (mode: 'standard' | 'smart') => void;
}

const ImportModal: React.FC<ImportModalProps> = ({
  isOpen, onClose, onFileSelect, isImporting, mode = 'standard', onModeChange
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [hideInstructions, setHideInstructions] = useState(
    localStorage.getItem('hideImportInstructions') === 'true'
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [recommendation, setRecommendation] = useState<string>('');

  const [isMobile, setIsMobile] = useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const validateFile = (f: File): boolean => {
    setValidationError(null);
    setRecommendation('');
    const isCSV = f.name.toLowerCase().endsWith('.csv');
    const isExcel = /\.(xlsx|xls)$/i.test(f.name);
    if (!isCSV && !isExcel) { setValidationError('Format non supporté. Utilisez .csv, .xlsx ou .xls'); return false; }
    if (f.size > 50 * 1024 * 1024) { setValidationError(`Fichier trop volumineux (${(f.size/1024/1024).toFixed(1)} MB). Maximum: 50 MB`); return false; }
    if (f.size === 0) { setValidationError('Le fichier est vide'); return false; }
    const mb = f.size / (1024 * 1024);
    if (isExcel && mb > 10) setRecommendation('Pour de meilleures performances, convertissez ce fichier en CSV');
    else if (isCSV) setRecommendation('Format CSV optimisé pour les imports volumineux');
    return true;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { if (validateFile(f)) setFile(f); else setFile(null); }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) { if (validateFile(f)) setFile(f); else setFile(null); }
  };

  const handleSubmit = async () => {
    if (!file || !onFileSelect) return;
    try {
      await onFileSelect(file);
      if (hideInstructions) localStorage.setItem('hideImportInstructions', 'true');
      handleClose();
    } catch (err) { console.error('Erreur import:', err); }
  };

  const handleClose = () => {
    setFile(null); setValidationError(null); setIsDragging(false); setRecommendation('');
    onClose();
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${['B','KB','MB','GB'][i]}`;
  };

  const handleDownloadTemplate = async (format: 'csv' | 'excel') => {
    try {
      if (format === 'csv') {
        const csv = `NOM,PRENOM,TELEPHONE,EMAIL,DATE_NAISSANCE,LIEU_NAISSANCE,CONTACT_RETRAIT\nKOUAME,Jean,01234567,jean@email.com,2001-07-12,Abidjan,07654321\nTRAORE,Amina,09876543,amina@email.com,2015-01-25,Abidjan,01234567`;
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'template-import-cartes.csv';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        const response = await api.get('/import-export/template', { responseType: 'blob' });
        const url = window.URL.createObjectURL(response.data);
        const a = document.createElement('a');
        a.href = url; a.download = 'template-import-cartes.xlsx';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
      alert(`Template ${format.toUpperCase()} téléchargé !`);
    } catch { alert('Erreur lors du téléchargement du template'); }
  };

  if (!isOpen) return null;

  const ext = file?.name.split('.').pop()?.toUpperCase() || '';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="relative bg-white w-full max-w-xl sm:rounded-2xl shadow-2xl max-h-[95vh] overflow-y-auto"
          style={{ borderRadius: isMobile ? '20px 20px 0 0' : undefined }}
        >
          {/* Drag handle mobile */}
          {isMobile && <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-1" />}

          {/* ── Header ── */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] px-5 py-4 sm:rounded-t-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <DocumentArrowUpIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-black text-white text-base leading-tight">
                    {mode === 'smart' ? 'Synchronisation intelligente' : 'Importation de données'}
                  </h2>
                  <p className="text-white/80 text-xs mt-0.5">
                    {mode === 'smart' ? 'Synchronise sans créer de doublons' : 'Ajouter de nouvelles cartes'}
                  </p>
                </div>
              </div>
              <button onClick={handleClose} disabled={isImporting}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors text-white disabled:opacity-50 flex-shrink-0">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-5">

            {/* ── Mode selector ── */}
            {onModeChange && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2.5">Mode d'importation</p>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { id: 'standard', label: 'Standard', desc: 'Ajoute seulement', icon: DocumentTextIcon, color: 'blue' },
                    { id: 'smart',    label: 'Intelligent', desc: 'Synchronise', icon: SparklesIcon, color: 'green' },
                  ] as const).map(m => (
                    <button
                      key={m.id}
                      onClick={() => onModeChange(m.id)}
                      disabled={isImporting}
                      className={`relative p-4 rounded-xl border-2 transition-all text-left group
                        ${mode === m.id
                          ? m.color === 'blue' ? 'border-blue-500 bg-blue-50' : 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'}
                        ${isImporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {mode === m.id && (
                        <div className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center ${m.color === 'blue' ? 'bg-blue-500' : 'bg-emerald-500'}`}>
                          <CheckCircleIcon className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                      <m.icon className={`w-6 h-6 mb-2 ${mode === m.id ? (m.color === 'blue' ? 'text-blue-600' : 'text-emerald-600') : 'text-gray-400'}`} />
                      <p className={`font-bold text-sm ${mode === m.id ? (m.color === 'blue' ? 'text-blue-800' : 'text-emerald-800') : 'text-gray-700'}`}>{m.label}</p>
                      <p className={`text-xs mt-0.5 ${mode === m.id ? (m.color === 'blue' ? 'text-blue-600' : 'text-emerald-600') : 'text-gray-400'}`}>{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Info mode ── */}
            <div className={`rounded-xl p-4 border ${mode === 'smart' ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${mode === 'smart' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                  {mode === 'smart' ? <SparklesIcon className="w-4 h-4 text-emerald-600" /> : <InformationCircleIcon className="w-4 h-4 text-blue-600" />}
                </div>
                <ul className="space-y-1.5">
                  {(mode === 'smart' ? [
                    'Met à jour la délivrance si différente',
                    'Conserve les contacts existants',
                    'Ajoute les nouvelles personnes automatiquement',
                  ] : [
                    'Ajoute uniquement les nouvelles cartes',
                    'Ignore les entrées déjà existantes',
                  ]).map((item, i) => (
                    <li key={i} className={`flex items-start gap-2 text-xs font-medium ${mode === 'smart' ? 'text-emerald-700' : 'text-blue-700'}`}>
                      <CheckCircleIcon className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${mode === 'smart' ? 'text-emerald-500' : 'text-blue-500'}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── Templates ── */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2.5">Télécharger un template</p>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { format: 'csv' as const, label: 'CSV', sub: 'Optimisé', icon: DocumentTextIcon, cls: 'border-green-200 hover:border-green-400 text-green-700 bg-green-50 hover:bg-green-100' },
                  { format: 'excel' as const, label: 'Excel', sub: 'Compatible', icon: TableCellsIcon, cls: 'border-blue-200 hover:border-blue-400 text-blue-700 bg-blue-50 hover:bg-blue-100' },
                ].map(t => (
                  <button key={t.format} onClick={() => handleDownloadTemplate(t.format)} disabled={isImporting}
                    className={`flex items-center gap-3 px-4 py-3 border-2 rounded-xl font-semibold text-sm transition-all ${t.cls} disabled:opacity-50`}>
                    <t.icon className="w-5 h-5 flex-shrink-0" />
                    <div className="text-left">
                      <div>{t.label}</div>
                      <div className="text-xs opacity-70 font-normal">{t.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Zone dépôt fichier ── */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2.5">Fichier à importer</p>
              <div
                onDragOver={e => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                onDragLeave={e => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
                onDrop={handleDrop}
                onClick={() => !isImporting && document.getElementById('import-file-input')?.click()}
                className={`relative border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer overflow-hidden
                  ${isDragging ? 'border-[#F77F00] bg-orange-50 scale-[1.01]' : file ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50 hover:border-[#F77F00] hover:bg-orange-50/40'}
                  ${isImporting ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                <input type="file" id="import-file-input" accept=".xlsx,.xls,.csv" className="hidden"
                  onChange={handleFileSelect} disabled={isImporting} />

                {file ? (
                  <div className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-green-800 text-sm truncate">{file.name}</p>
                      <p className="text-green-600 text-xs mt-0.5">{formatSize(file.size)} · {ext}</p>
                      {recommendation && (
                        <p className="text-blue-600 text-xs mt-1 flex items-center gap-1">
                          <InformationCircleIcon className="w-3 h-3 flex-shrink-0" />{recommendation}
                        </p>
                      )}
                    </div>
                    {!isImporting && (
                      <button onClick={e => { e.stopPropagation(); setFile(null); }}
                        className="w-7 h-7 bg-white rounded-lg border border-gray-200 hover:border-red-200 hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all flex-shrink-0">
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-colors ${isDragging ? 'bg-orange-100' : 'bg-gray-100'}`}>
                      <CloudArrowUpIcon className={`w-7 h-7 ${isDragging ? 'text-[#F77F00]' : 'text-gray-400'}`} />
                    </div>
                    <p className="font-bold text-gray-700 text-sm">
                      {isDragging ? 'Déposez le fichier ici' : 'Glissez-déposez ou cliquez pour sélectionner'}
                    </p>
                    <p className="text-gray-400 text-xs mt-1.5">CSV, XLSX, XLS · Maximum 50 MB</p>
                  </div>
                )}
              </div>

              {/* Erreur validation */}
              <AnimatePresence>
                {validationError && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mt-3 flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl p-3">
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 text-xs font-medium">{validationError}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Instructions ── */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2.5">
                <InformationCircleIcon className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <h4 className="font-bold text-amber-800 text-sm">Instructions</h4>
              </div>
              <ul className="space-y-1.5">
                {['Colonnes NOM et PRENOM sont obligatoires', 'Format des dates : AAAA-MM-JJ (ex: 2024-01-15)', 'Encodage recommandé : UTF-8'].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-amber-700">
                    <span className="text-amber-500 font-bold mt-0.5">•</span>{item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Option masquer */}
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div onClick={() => {
                const v = !hideInstructions;
                setHideInstructions(v);
                localStorage.setItem('hideImportInstructions', String(v));
              }}
                className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${hideInstructions ? 'bg-[#F77F00]' : 'bg-gray-200'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${hideInstructions ? 'left-4' : 'left-0.5'}`} />
              </div>
              <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">Ne plus afficher ces instructions</span>
            </label>

            {/* ── Boutons ── */}
            <div className="flex gap-3 pt-1">
              <button onClick={handleClose} disabled={isImporting}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-semibold text-sm transition-all disabled:opacity-50">
                Annuler
              </button>
              <button onClick={handleSubmit} disabled={!file || isImporting || !!validationError}
                className="flex-1 py-3 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] hover:from-[#e46f00] hover:to-[#FF8C00] text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md disabled:shadow-none">
                {isImporting ? (
                  <><ArrowPathIcon className="w-4 h-4 animate-spin" />{mode === 'smart' ? 'Synchronisation…' : 'Importation…'}</>
                ) : (
                  <><CloudArrowUpIcon className="w-4 h-4" />{mode === 'smart' ? 'Synchroniser' : 'Importer'}</>
                )}
              </button>
            </div>
          </div>

          {/* Pied */}
          <div className="border-t border-gray-100 bg-gray-50 px-5 py-3 sm:rounded-b-2xl">
            <p className="text-gray-400 text-xs flex items-center gap-1.5">
              <InformationCircleIcon className="w-3.5 h-3.5 flex-shrink-0" />
              L'import peut prendre quelques minutes selon la taille du fichier
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ImportModal;