// src/components/TableCartesExcel.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Carte } from "../types";
import {
  PencilIcon,
  CheckCircleIcon,
  LockClosedIcon,
  LockOpenIcon,
  DocumentTextIcon,
  CalendarIcon,
  PhoneIcon,
  UserIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CheckIcon,
  ArrowDownTrayIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';

interface TableCartesExcelProps {
  cartes: Carte[];
  role: string;
  onUpdateCartes: (cartes: Carte[]) => void;
  canEdit?: boolean;
  editFields?: string[];
  onExportCSV?: () => void;
  onExportExcel?: () => void;
}

const TableCartesExcel: React.FC<TableCartesExcelProps> = ({
  cartes,
  role,
  onUpdateCartes,
  canEdit = true,
  editFields = [],
  onExportCSV,
  onExportExcel,
}) => {
  const [editingCell, setEditingCell] = useState<{rowIndex: number, field: string} | null>(null);
  const [editValue, setEditValue] = useState("");
  const [localCartes, setLocalCartes] = useState<Carte[]>(cartes);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setLocalCartes(cartes);
  }, [cartes]);

  const isChefEquipe = role === "Chef d'équipe";
  const isOperateur  = role === "Opérateur";
  const chefEquipeFields = ['delivrance', 'contactRetrait', 'dateDelivrance'];

  const isFieldEditable = (field: string): boolean => {
    if (!canEdit) return false;
    if (isOperateur) return false;
    if (isChefEquipe) return chefEquipeFields.includes(field);
    if (editFields && editFields.length > 0) return editFields.includes(field);
    return true;
  };

  const colonnes = [
    { key: "coordination",   label: "Coordination",    icon: BuildingOfficeIcon, width: "w-28 md:w-32" },
    { key: "lieuEnrolement", label: "Lieu Enr.",        icon: MapPinIcon,         width: "w-28 md:w-32" },
    { key: "siteRetrait",    label: "Site Retrait",     icon: MapPinIcon,         width: "w-28 md:w-32" },
    { key: "rangement",      label: "Rangement",        icon: DocumentTextIcon,   width: "w-24 md:w-28" },
    { key: "nom",            label: "Nom",              icon: UserIcon,           width: "w-24 md:w-28" },
    // ✅ CORRECTION: "prenoms" (avec s) = nom réel de la colonne en base
    { key: "prenoms",        label: "Prénom(s)",        icon: UserIcon,           width: "w-24 md:w-28" },
    { key: "lieuNaissance",  label: "Lieu Naiss.",      icon: MapPinIcon,         width: "w-28 md:w-32" },
    { key: "dateNaissance",  label: "Date Naiss.",      icon: CalendarIcon,       width: "w-24 md:w-28" },
    // ✅ CORRECTION: contact est une colonne directe en base
    { key: "contact",        label: "Contact",          icon: PhoneIcon,          width: "w-24 md:w-28" },
    // ✅ CORRECTION: delivrance affiche la valeur brute de la BDD (nom livreur ou mention)
    { key: "delivrance",     label: "Délivrance",       icon: CheckCircleIcon,    width: "w-32 md:w-40" },
    { key: "contactRetrait", label: "Contact Retrait",  icon: PhoneIcon,          width: "w-24 md:w-28" },
    { key: "dateDelivrance", label: "Date Retrait",     icon: CalendarIcon,       width: "w-24 md:w-28" },
  ];

  // ✅ Teste si une carte est délivrée : colonne vide = non délivrée
  // La valeur peut être un nom de personne, "OUI", "DELIVRE", etc.
  const isDelivre = (val: any): boolean => {
    if (val === null || val === undefined) return false;
    const s = String(val).trim();
    if (s === '') return false;
    // Valeurs explicitement "non délivré"
    if (['NON', 'non', 'Non', 'false', 'FALSE', '0'].includes(s)) return false;
    // Toute autre valeur non vide = délivré (nom du livreur, "OUI", "DELIVRE", etc.)
    return true;
  };

  // ✅ Affiche la valeur brute de delivrance depuis la BDD
  // Si vide → "Non délivré", sinon on affiche la valeur telle quelle (nom, mention, etc.)
  const getDelivranceDisplay = (val: any): string => {
    if (val === null || val === undefined) return '—';
    const s = String(val).trim();
    if (s === '') return '—';
    if (['NON', 'non', 'Non', 'false', 'FALSE', '0'].includes(s)) return 'Non délivré';
    if (['OUI', 'oui', 'Oui', 'true', 'TRUE', '1'].includes(s)) return 'Délivré';
    // Valeur personnalisée (nom du livreur, mention personnalisée, etc.)
    return s;
  };

  const getCellValue = (carte: any, field: string): string => {
    switch (field) {
      case 'coordination':   return carte.coordination   || '-';
      case 'lieuEnrolement': return carte.lieuEnrolement || carte["LIEU D'ENROLEMENT"] || '-';
      case 'siteRetrait':    return carte.siteRetrait    || carte["SITE DE RETRAIT"]   || '-';
      case 'rangement':      return carte.rangement      || '-';
      case 'nom':            return carte.nom            || '-';
      // ✅ CORRECTION: lire prenoms (avec s) — c'est le vrai nom de colonne en base
      case 'prenoms':        return carte.prenoms        || carte.prenom               || '-';
      case 'lieuNaissance':  return carte.lieuNaissance  || carte["LIEU NAISSANCE"]    || '-';
      case 'dateNaissance':  return carte.dateNaissance  || carte["DATE DE NAISSANCE"] || '-';
      // ✅ CORRECTION: contact est retourné directement par le backend
      case 'contact':        return carte.contact        || '-';
      // ✅ CORRECTION: afficher la valeur brute de la BDD
      case 'delivrance':     return getDelivranceDisplay(carte.delivrance);
      case 'contactRetrait': return carte.contactRetrait || carte["CONTACT DE RETRAIT"] || '-';
      case 'dateDelivrance': return carte.dateDelivrance || carte["DATE DE DELIVRANCE"]  || '-';
      default: return '-';
    }
  };

  const handleCellClick = (rowIndex: number, field: string) => {
    if (!isFieldEditable(field)) return;
    if (field === 'delivrance') return; // delivrance a sa propre logique d'édition
    const currentValue = getCellValue(localCartes[rowIndex], field);
    setEditValue(currentValue === '-' ? '' : currentValue);
    setEditingCell({ rowIndex, field });
  };

  const handleSaveEdit = () => {
    if (!editingCell) return;
    const { rowIndex, field } = editingCell;
    const updatedCartes = [...localCartes];
    updatedCartes[rowIndex] = { ...updatedCartes[rowIndex], [field]: editValue };
    setLocalCartes(updatedCartes);
    onUpdateCartes(updatedCartes);
    setEditingCell(null);
    setEditValue("");
  };

  // ✅ Pour delivrance : bascule entre '' (non délivré) et 'OUI' (délivré)
  const handleDelivranceToggle = (rowIndex: number) => {
    if (!isFieldEditable('delivrance')) return;
    const updatedCartes = [...localCartes];
    const current = (updatedCartes[rowIndex] as any).delivrance;
    const nowDelivre = isDelivre(current);
    // Si déjà délivré → vider (non délivré). Si non délivré → mettre 'OUI'
    (updatedCartes[rowIndex] as any).delivrance = nowDelivre ? '' : 'OUI';
    setLocalCartes(updatedCartes);
    onUpdateCartes(updatedCartes);
  };

  // ✅ Édition inline de la valeur delivrance (pour entrer un nom de livreur)
  const handleDelivranceEdit = (rowIndex: number) => {
    if (!isFieldEditable('delivrance')) return;
    const current = getCellValue(localCartes[rowIndex], 'delivrance');
    setEditValue(current === '—' || current === 'Non délivré' ? '' : current);
    setEditingCell({ rowIndex, field: 'delivrance' });
  };

  const handleDelivranceSave = () => {
    if (!editingCell || editingCell.field !== 'delivrance') return;
    const { rowIndex } = editingCell;
    const updatedCartes = [...localCartes];
    (updatedCartes[rowIndex] as any).delivrance = editValue.trim();
    setLocalCartes(updatedCartes);
    onUpdateCartes(updatedCartes);
    setEditingCell(null);
    setEditValue("");
  };

  const formatDate = (dateString: string): string => {
    if (!dateString || dateString === '-') return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('fr-FR');
    } catch { return dateString; }
  };

  // ✅ Export CSV local avec toutes les colonnes y compris prenoms et contact
  const handleExportCSVLocal = () => {
    if (onExportCSV) { onExportCSV(); return; }

    const headers = colonnes.map(c => c.label);
    const rows = localCartes.map(carte =>
      colonnes.map(col => {
        const val = getCellValue(carte, col.key);
        return `"${val.replace(/"/g, '""')}"`;
      }).join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `resultats-cartes-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ✅ Export Excel local via SheetJS (si disponible) ou fallback CSV
  const handleExportExcelLocal = () => {
    if (onExportExcel) { onExportExcel(); return; }
    // Fallback CSV si pas de handler parent
    handleExportCSVLocal();
  };

  const cartesModifiees = localCartes.filter((carte, index) => {
    const originale = cartes[index];
    if (!originale) return false;
    return chefEquipeFields.some(f => (carte as any)[f] !== (originale as any)[f]);
  });

  if (localCartes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 p-8 md:p-12 text-center"
      >
        <DocumentTextIcon className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
        <h3 className={`font-semibold text-gray-600 mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
          Aucune carte à afficher
        </h3>
        <p className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
          Utilisez la recherche pour trouver des cartes
        </p>
      </motion.div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 overflow-hidden">

      {/* En-tête */}
      <div className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white px-3 md:px-6 py-2 md:py-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 md:gap-3">
            <DocumentTextIcon className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
            <div>
              <h3 className={`font-bold ${isMobile ? 'text-sm' : 'text-base'}`}>Résultats</h3>
              <p className={`text-white/90 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {localCartes.length} carte{localCartes.length > 1 ? 's' : ''}
                {cartesModifiees.length > 0 && (
                  <span className="ml-2 bg-yellow-500/20 text-yellow-200 px-2 py-0.5 rounded-full text-xs">
                    {cartesModifiees.length} modif.
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* ✅ Bouton Export CSV */}
            <button
              onClick={handleExportCSVLocal}
              title="Exporter les résultats en CSV"
              className={`flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-lg transition-all font-medium ${isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'}`}
            >
              <DocumentTextIcon className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
              <span>CSV</span>
            </button>

            {/* ✅ Bouton Export Excel */}
            <button
              onClick={handleExportExcelLocal}
              title="Exporter les résultats en Excel"
              className={`flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-lg transition-all font-medium ${isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'}`}
            >
              <TableCellsIcon className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
              <span>Excel</span>
            </button>

            {/* Badge permissions */}
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              isOperateur  ? 'bg-gray-500/20 text-gray-200' :
              isChefEquipe ? 'bg-orange-500/20 text-orange-200' :
                             'bg-green-500/20 text-green-200'
            }`}>
              {isOperateur ? (
                <><LockClosedIcon className="w-3 h-3" /><span>Lecture</span></>
              ) : isChefEquipe ? (
                <><PencilIcon className="w-3 h-3" /><span>Limité</span></>
              ) : (
                <><LockOpenIcon className="w-3 h-3" /><span>Édition</span></>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tableau avec scroll */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-[#0077B6] to-[#2E8B57] text-white">
              {colonnes.map((col) => {
                const Icon = col.icon;
                const editable = isFieldEditable(col.key);
                return (
                  <th
                    key={col.key}
                    className={`px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold border-r border-white/20 ${col.width}`}
                  >
                    <div className="flex items-center gap-1 md:gap-2">
                      <Icon className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} flex-shrink-0`} />
                      <span className="truncate">{col.label}</span>
                      {!editable && <LockClosedIcon className="w-3 h-3 opacity-60 flex-shrink-0" />}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {localCartes.map((carte, rowIndex) => (
                <motion.tr
                  key={(carte as any).id || rowIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: Math.min(rowIndex * 0.02, 0.5) }}
                  className={`border-b border-gray-100 transition-colors ${
                    isDelivre((carte as any).delivrance)
                      ? 'bg-green-50/50 hover:bg-green-100/50'
                      : 'hover:bg-orange-50/30'
                  }`}
                >
                  {colonnes.map((col) => {
                    const cellValue  = getCellValue(carte, col.key);
                    const isEditing  = editingCell?.rowIndex === rowIndex && editingCell?.field === col.key;
                    const editable   = isFieldEditable(col.key);
                    const displayVal = col.key.toLowerCase().includes('date')
                      ? formatDate(cellValue)
                      : cellValue;

                    // ✅ Colonne delivrance : affichage spécial avec checkbox + valeur brute BDD
                    if (col.key === 'delivrance') {
                      const delivered = isDelivre((carte as any).delivrance);
                      return (
                        <td
                          key={col.key}
                          className={`px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm border-r border-gray-100 ${col.width}`}
                        >
                          {isEditing ? (
                            // Mode édition : input texte libre (nom livreur ou mention)
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={handleDelivranceSave}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleDelivranceSave();
                                else if (e.key === 'Escape') setEditingCell(null);
                              }}
                              placeholder="Nom livreur ou mention..."
                              className="w-full px-2 py-1 border-2 border-[#F77F00] rounded-lg bg-yellow-50 focus:outline-none text-xs md:text-sm"
                              autoFocus
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              {/* Checkbox pour basculer délivré/non délivré */}
                              <button
                                onClick={() => handleDelivranceToggle(rowIndex)}
                                disabled={!editable}
                                className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center flex-shrink-0 ${
                                  delivered
                                    ? 'bg-[#2E8B57] border-[#2E8B57] text-white'
                                    : 'bg-white border-gray-300 hover:border-[#F77F00]'
                                } ${!editable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                              >
                                {delivered && <CheckIcon className="w-3 h-3" />}
                              </button>

                              {/* Valeur brute de la BDD (nom livreur, mention, "OUI", etc.) */}
                              <span
                                onClick={() => editable && handleDelivranceEdit(rowIndex)}
                                className={`truncate flex-1 ${
                                  delivered
                                    ? 'text-[#2E8B57] font-semibold'
                                    : 'text-gray-400 italic'
                                } ${editable ? 'cursor-pointer hover:underline' : ''}`}
                                title={delivered ? String((carte as any).delivrance || '') : 'Non délivré'}
                              >
                                {displayVal}
                              </span>

                              {editable && !isEditing && (
                                <PencilIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              )}
                            </div>
                          )}
                        </td>
                      );
                    }

                    // Toutes les autres colonnes
                    return (
                      <td
                        key={col.key}
                        className={`px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm border-r border-gray-100 ${col.width}`}
                        onClick={() => editable && handleCellClick(rowIndex, col.key)}
                      >
                        {isEditing ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleSaveEdit}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit();
                              else if (e.key === 'Escape') setEditingCell(null);
                            }}
                            className="w-full px-2 py-1 border-2 border-[#F77F00] rounded-lg bg-yellow-50 focus:outline-none text-xs md:text-sm"
                            autoFocus
                          />
                        ) : (
                          <div className={`flex items-center justify-between ${
                            editable ? 'cursor-pointer hover:bg-orange-100/50 rounded px-1' : ''
                          }`}>
                            <span className="truncate">{displayVal}</span>
                            {editable && !isEditing && (
                              <PencilIcon className="w-3 h-3 text-gray-400 flex-shrink-0 ml-1" />
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pied de tableau */}
      <div className="bg-gray-50/80 border-t border-gray-200 px-3 md:px-6 py-2 md:py-3">
        <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-gray-600">
          <div className="flex items-center gap-2 md:gap-4">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-[#F77F00] rounded-full"></div>
              <span>Éditable</span>
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-[#2E8B57] rounded-full"></div>
              <span>Délivrée</span>
            </span>
            <span className="flex items-center gap-1 text-gray-400 italic">
              <span>Colonne Délivrance = valeur brute BDD (vide = non délivré)</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Boutons export en bas */}
            <button onClick={handleExportCSVLocal} className="flex items-center gap-1 text-[#F77F00] hover:underline font-medium">
              <ArrowDownTrayIcon className="w-3 h-3" />
              <span>CSV</span>
            </button>
            <button onClick={handleExportExcelLocal} className="flex items-center gap-1 text-[#0077B6] hover:underline font-medium">
              <ArrowDownTrayIcon className="w-3 h-3" />
              <span>Excel</span>
            </button>
            <span className="text-gray-500">
              {localCartes.length} ligne{localCartes.length > 1 ? 's' : ''}
              {cartesModifiees.length > 0 && (
                <span className="ml-2 text-[#F77F00] font-medium">• {cartesModifiees.length} modif.</span>
              )}
            </span>
          </div>
        </div>

        {!isOperateur && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className={`text-gray-500 flex items-center gap-1 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
              <PencilIcon className="w-3 h-3" />
              Cliquez sur une cellule pour modifier • Colonne Délivrance : cliquez sur le texte pour entrer un nom/mention
              {isChefEquipe && <span className="ml-2 text-orange-600">(3 champs autorisés)</span>}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableCartesExcel;