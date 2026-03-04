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
  CloudArrowUpIcon
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
  isOpen,
  onClose,
  onFileSelect,
  isImporting,
  mode = 'standard',
  onModeChange
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [hideInstructions, setHideInstructions] = useState(
    localStorage.getItem('hideImportInstructions') === 'true'
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [recommendation, setRecommendation] = useState<string>('');

  // Responsive
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const validateFile = (selectedFile: File): boolean => {
    setValidationError(null);
    setRecommendation('');
    
    const isCSV = selectedFile.name.toLowerCase().endsWith('.csv');
    const isExcel = /\.(xlsx|xls)$/i.test(selectedFile.name);
    
    if (!isCSV && !isExcel) {
      setValidationError('Format non supporté. Utilisez .csv, .xlsx ou .xls');
      return false;
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (selectedFile.size > maxSize) {
      const sizeMB = (selectedFile.size / 1024 / 1024).toFixed(2);
      setValidationError(`Fichier trop volumineux (${sizeMB}MB). Maximum: 50MB`);
      return false;
    }

    if (selectedFile.size === 0) {
      setValidationError('Le fichier est vide');
      return false;
    }

    const sizeMB = selectedFile.size / (1024 * 1024);
    
    if (isExcel && sizeMB > 10) {
      setRecommendation('Pour de meilleures performances, convertissez ce fichier Excel en CSV');
    } else if (isCSV) {
      setRecommendation('Format CSV optimisé pour les performances');
    } else if (isExcel && sizeMB > 5) {
      setRecommendation('Pour les gros fichiers, utilisez CSV pour éviter les timeouts');
    }

    return true;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      } else {
        setFile(null);
      }
    }
  };

  const handleSubmit = async () => {
    if (file && onFileSelect) {
      try {
        await onFileSelect(file);
        if (hideInstructions) {
          localStorage.setItem('hideImportInstructions', 'true');
        }
        handleClose();
      } catch (error) {
        console.error('Erreur lors de l\'import:', error);
      }
    }
  };

  const handleClose = () => {
    setFile(null);
    setValidationError(null);
    setIsDragging(false);
    setRecommendation('');
    onClose();
  };

  const handleHideInstructionsChange = (checked: boolean) => {
    setHideInstructions(checked);
    localStorage.setItem('hideImportInstructions', checked.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      } else {
        setFile(null);
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownloadTemplate = async (format: 'csv' | 'excel') => {
    try {
      if (format === 'csv') {
        const csvTemplate = `NOM,PRENOM,TELEPHONE,EMAIL,DATE_NAISSANCE,LIEU_NAISSANCE,CONTACT_RETRAIT
KOUAME,Jean,01234567,jean@email.com,2001-07-12,Abidjan,07654321
TRAORE,Amina,09876543,amina@email.com,2015-01-25,Abidjan,01234567`;
        
        const blob = new Blob([csvTemplate], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'template-import-cartes.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        // ✅ BUG #2 CORRIGÉ : baseURL axios = '.../api', le chemin ne doit pas re-inclure '/api'
        // L'ancien chemin '/api/import-export/template' produisait → /api/api/import-export/template (404)
        const response = await api.get('/import-export/template', {
          responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(response.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'template-import-cartes.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
      
      alert(`Template ${format.toUpperCase()} téléchargé !`);
    } catch (error) {
      console.error('Erreur téléchargement template:', error);
      alert('Erreur lors du téléchargement du template');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          
          {/* En-tête */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white px-4 md:px-6 py-3 md:py-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-3">
                <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-white/20 rounded-lg flex items-center justify-center`}>
                  <DocumentArrowUpIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-white`} />
                </div>
                <div>
                  <h2 className={`font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>
                    {mode === 'smart' ? 'Synchronisation Intelligente' : 'Importation Standard'}
                  </h2>
                  <p className={`text-white/90 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {mode === 'smart' 
                      ? 'Synchronise les données sans créer de doublons' 
                      : 'Ajoute de nouvelles cartes'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isImporting}
                className={`${isMobile ? 'w-7 h-7' : 'w-8 h-8'} rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors disabled:opacity-50`}
                aria-label="Fermer"
              >
                <XMarkIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
              </button>
            </div>
          </div>

          {/* Contenu */}
          <div className="p-4 md:p-6">
            
            {/* Sélection du mode */}
            {onModeChange && (
              <div className="mb-4 md:mb-6">
                <p className={`font-semibold text-gray-700 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Mode d'importation :
                </p>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  <button
                    onClick={() => onModeChange('standard')}
                    disabled={isImporting}
                    className={`p-2 md:p-3 border rounded-lg transition-all flex flex-col items-center justify-center ${
                      mode === 'standard'
                        ? 'border-[#0077B6] bg-blue-50 text-[#0077B6] ring-2 ring-blue-100'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    } ${isImporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <DocumentTextIcon className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} mb-1`} />
                    <p className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>Standard</p>
                    <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} opacity-75 mt-1`}>
                      Ajoute seulement
                    </p>
                  </button>
                  
                  <button
                    onClick={() => onModeChange('smart')}
                    disabled={isImporting}
                    className={`p-2 md:p-3 border rounded-lg transition-all flex flex-col items-center justify-center ${
                      mode === 'smart'
                        ? 'border-[#2E8B57] bg-green-50 text-[#2E8B57] ring-2 ring-green-100'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    } ${isImporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <ArrowPathIcon className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} mb-1`} />
                    <p className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>Intelligent</p>
                    <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} opacity-75 mt-1`}>
                      Synchronise
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Instructions selon le mode */}
            <div className="mb-4 md:mb-6">
              {mode === 'smart' ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 md:p-4">
                  <h3 className={`font-bold text-green-800 mb-2 flex items-center gap-2 ${isMobile ? 'text-sm' : 'text-base'}`}>
                    <ArrowPathIcon className="w-4 h-4" />
                    Avantages de la synchronisation
                  </h3>
                  <ul className="text-green-700 text-xs md:text-sm space-y-1">
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Met à jour la <strong>DÉLIVRANCE</strong> si différente</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Conserve les <strong>CONTACTS</strong> existants</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Ajoute les nouvelles personnes</span>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
                  <h3 className={`font-bold text-blue-800 mb-2 flex items-center gap-2 ${isMobile ? 'text-sm' : 'text-base'}`}>
                    <DocumentTextIcon className="w-4 h-4" />
                    Caractéristiques
                  </h3>
                  <ul className="text-blue-700 text-xs md:text-sm space-y-1">
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Ajoute de nouvelles cartes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Ignore les doublons existants</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Templates */}
            <div className="mb-4 md:mb-6">
              <p className={`font-semibold text-gray-700 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Télécharger un template :
              </p>
              <div className="flex gap-2 md:gap-3">
                <button
                  onClick={() => handleDownloadTemplate('csv')}
                  disabled={isImporting}
                  className="flex-1 px-3 py-2 md:px-4 md:py-3 bg-green-100 text-green-700 border border-green-300 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
                >
                  <DocumentTextIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  <div className="text-left">
                    <p className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>CSV</p>
                    <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} opacity-75`}>Optimisé</p>
                  </div>
                </button>
                <button
                  onClick={() => handleDownloadTemplate('excel')}
                  disabled={isImporting}
                  className="flex-1 px-3 py-2 md:px-4 md:py-3 bg-blue-100 text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                >
                  <TableCellsIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  <div className="text-left">
                    <p className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>Excel</p>
                    <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} opacity-75`}>Compatible</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Sélection de fichier */}
            <div className="mb-4 md:mb-6">
              <label className={`font-semibold text-gray-700 mb-2 block ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Sélectionnez un fichier :
              </label>
              <div 
                className={`border-2 border-dashed rounded-xl p-4 md:p-6 text-center transition-colors cursor-pointer ${
                  isDragging 
                    ? 'border-[#F77F00] bg-orange-50/50' 
                    : file 
                      ? 'border-green-500 bg-green-50/30' 
                      : 'border-gray-300 bg-gray-50 hover:border-[#F77F00]'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
                role="button"
                tabIndex={0}
              >
                <input
                  type="file"
                  id="file-input"
                  onChange={handleFileSelect}
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  disabled={isImporting}
                />
                <div className={`${isImporting ? 'opacity-50' : ''}`}>
                  <CloudArrowUpIcon className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12'} mx-auto mb-2 md:mb-3 text-gray-400`} />
                  <p className={`text-gray-600 mb-1 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {file ? file.name : isDragging ? 'Déposez le fichier' : 'Cliquez ou glissez-déposez'}
                  </p>
                  <p className={`text-gray-500 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                    Formats: .csv, .xlsx, .xls (max 50MB)
                  </p>
                </div>
              </div>
              
              {/* Info fichier */}
              {file && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div className="truncate">
                        <p className="font-medium text-green-800 text-xs md:text-sm truncate">{file.name}</p>
                        <p className="text-green-700 text-[10px] md:text-xs">
                          {formatFileSize(file.size)} • {file.name.split('.').pop()?.toUpperCase()}
                        </p>
                        {recommendation && (
                          <p className="text-blue-700 text-[10px] md:text-xs mt-1 flex items-center gap-1">
                            <InformationCircleIcon className="w-3 h-3" />
                            {recommendation}
                          </p>
                        )}
                      </div>
                    </div>
                    {!isImporting && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100 flex-shrink-0"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
              
              {/* Erreur */}
              {validationError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-red-700 text-xs md:text-sm">{validationError}</p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Instructions */}
            <div className="mb-4 md:mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4">
              <h4 className={`font-bold text-yellow-800 mb-2 flex items-center gap-2 ${isMobile ? 'text-sm' : 'text-base'}`}>
                <InformationCircleIcon className="w-4 h-4" />
                Instructions
              </h4>
              <ul className="text-yellow-700 text-xs md:text-sm space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-0.5 shrink-0">•</span>
                  <span><strong>NOM</strong> et <strong>PRENOM</strong> obligatoires</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-0.5 shrink-0">•</span>
                  <span>Format dates: <strong>AAAA-MM-JJ</strong></span>
                </li>
              </ul>
            </div>

            {/* Option "Ne plus afficher" */}
            <div className="mb-4 md:mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideInstructions}
                  onChange={(e) => handleHideInstructionsChange(e.target.checked)}
                  className="h-4 w-4 text-[#F77F00] rounded focus:ring-[#F77F00]"
                  disabled={isImporting}
                />
                <span className={`text-gray-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Ne plus afficher ces instructions
                </span>
              </label>
            </div>

            {/* Boutons */}
            <div className="flex gap-2 md:gap-3">
              <button
                onClick={handleClose}
                disabled={isImporting}
                className="flex-1 px-3 py-2 md:px-4 md:py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium text-xs md:text-sm"
              >
                Annuler
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={!file || isImporting || !!validationError}
                className="flex-1 px-3 py-2 md:px-4 md:py-3 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white rounded-lg hover:from-[#e46f00] hover:to-[#FF8C00] disabled:opacity-50 transition-colors font-medium text-xs md:text-sm flex items-center justify-center gap-2"
              >
                {isImporting ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    <span>{mode === 'smart' ? 'Sync...' : 'Import...'}</span>
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="w-4 h-4" />
                    <span>{mode === 'smart' ? 'Synchroniser' : 'Importer'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Pied de page */}
          <div className="border-t border-gray-200 bg-gray-50 px-4 md:px-6 py-2 md:py-3 rounded-b-xl">
            <p className={`text-gray-600 flex items-center gap-2 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
              <InformationCircleIcon className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
              <span>L'import peut prendre quelques minutes selon la taille</span>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ImportModal;
  