// src/components/TableCartesExcel.tsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PencilIcon, CheckCircleIcon, LockClosedIcon, LockOpenIcon,
  DocumentTextIcon, CalendarIcon, PhoneIcon, UserIcon,
  MapPinIcon, BuildingOfficeIcon, CheckIcon,
} from '@heroicons/react/24/outline';

const ORANGE = '#E07B00';
const GREEN  = '#2E7D52';

interface TableCartesExcelProps {
  cartes: any[];
  role: string;
  onUpdateCartes: (cartes: any[]) => void;
  canEdit?: boolean;
  editFields?: string[];
  onExportCSV?: () => void;
  onExportExcel?: () => void;
}

const TableCartesExcel: React.FC<TableCartesExcelProps> = ({
  cartes, role, onUpdateCartes, canEdit = true, editFields = [],
}) => {
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; field: string } | null>(null);
  const [editValue,   setEditValue]   = useState('');
  const [localCartes, setLocalCartes] = useState<any[]>(cartes);
  const [isMobile,    setIsMobile]    = useState(false);
  const [isTablet,    setIsTablet]    = useState(false);

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setIsMobile(w < 640);
      setIsTablet(w >= 640 && w < 1024);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ✅ FIX : Ne réinitialiser localCartes que lors d'un nouveau jeu de données
  // (nouvelle recherche), PAS à chaque mise à jour qui écraserait les modifications en cours
  const prevIdsRef = useRef<string>('');
  useEffect(() => {
    const nextIds = cartes.map((c: any) => c.id).join(',');
    if (prevIdsRef.current !== nextIds) {
      setLocalCartes(cartes);
      prevIdsRef.current = nextIds;
    }
  }, [cartes]);

  const isChefEquipe = role === "Chef d'équipe";
  const isOperateur  = role === 'Opérateur';
  const chefFields   = ['delivrance', 'contactRetrait', 'dateDelivrance'];

  const isFieldEditable = (field: string): boolean => {
    if (!canEdit || isOperateur) return false;
    if (isChefEquipe) return chefFields.includes(field);
    if (editFields?.length) return editFields.includes(field);
    return true;
  };

  // Colonnes adaptées selon l'écran
  const colonnesDesktop = [
    { key: 'coordination',   label: 'Coordination',   icon: BuildingOfficeIcon, width: 'min-w-[130px]' },
    { key: 'lieuEnrolement', label: "Lieu Enr.",       icon: MapPinIcon,         width: 'min-w-[130px]' },
    { key: 'siteRetrait',    label: 'Site Retrait',    icon: MapPinIcon,         width: 'min-w-[130px]' },
    { key: 'rangement',      label: 'Rangement',       icon: DocumentTextIcon,   width: 'min-w-[110px]' },
    { key: 'nom',            label: 'Nom',             icon: UserIcon,           width: 'min-w-[110px]' },
    { key: 'prenoms',        label: 'Prénom(s)',       icon: UserIcon,           width: 'min-w-[110px]' },
    { key: 'lieuNaissance',  label: 'Lieu Naiss.',     icon: MapPinIcon,         width: 'min-w-[130px]' },
    { key: 'dateNaissance',  label: 'Date Naiss.',     icon: CalendarIcon,       width: 'min-w-[110px]' },
    { key: 'contact',        label: 'Contact',         icon: PhoneIcon,          width: 'min-w-[110px]' },
    { key: 'delivrance',     label: 'Délivrance',      icon: CheckCircleIcon,    width: 'min-w-[150px]' },
    { key: 'contactRetrait', label: 'Contact Retrait', icon: PhoneIcon,          width: 'min-w-[120px]' },
    { key: 'dateDelivrance', label: 'Date Retrait',    icon: CalendarIcon,       width: 'min-w-[110px]' },
  ];
  const colonnesTablet = [
    { key: 'coordination',   label: 'Coord.',     icon: BuildingOfficeIcon, width: 'min-w-[100px]' },
    { key: 'siteRetrait',    label: 'Site',       icon: MapPinIcon,         width: 'min-w-[100px]' },
    { key: 'rangement',      label: 'Rang.',      icon: DocumentTextIcon,   width: 'min-w-[90px]'  },
    { key: 'nom',            label: 'Nom',        icon: UserIcon,           width: 'min-w-[100px]' },
    { key: 'prenoms',        label: 'Prénoms',    icon: UserIcon,           width: 'min-w-[100px]' },
    { key: 'contact',        label: 'Contact',    icon: PhoneIcon,          width: 'min-w-[100px]' },
    { key: 'delivrance',     label: 'Délivrance', icon: CheckCircleIcon,    width: 'min-w-[130px]' },
    { key: 'contactRetrait', label: 'Ctt. Ret.',  icon: PhoneIcon,          width: 'min-w-[100px]' },
    { key: 'dateDelivrance', label: 'Date Ret.',  icon: CalendarIcon,       width: 'min-w-[100px]' },
  ];
  const colonnesMobile = [
    { key: 'nom',            label: 'Nom',       icon: UserIcon,           width: 'min-w-[90px]'  },
    { key: 'prenoms',        label: 'Prénoms',   icon: UserIcon,           width: 'min-w-[90px]'  },
    { key: 'rangement',      label: 'Rang.',     icon: DocumentTextIcon,   width: 'min-w-[70px]'  },
    { key: 'delivrance',     label: 'Délivré',   icon: CheckCircleIcon,    width: 'min-w-[120px]' },
    { key: 'contactRetrait', label: 'Contact',   icon: PhoneIcon,          width: 'min-w-[90px]'  },
    { key: 'dateDelivrance', label: 'Date Ret.', icon: CalendarIcon,       width: 'min-w-[90px]'  },
  ];
  const colonnes = isMobile ? colonnesMobile : isTablet ? colonnesTablet : colonnesDesktop;

  const cellPx = isMobile ? 'px-2 py-2'   : isTablet ? 'px-3 py-2.5' : 'px-4 py-2.5';
  const headPx = isMobile ? 'px-2 py-2.5' : isTablet ? 'px-3 py-3'   : 'px-4 py-3';
  const textSz = isMobile ? 'text-xs'     : 'text-sm';
  const iconSz = isMobile ? 'w-3 h-3'     : 'w-4 h-4';

  const isDelivre = (val: any): boolean => {
    if (!val) return false;
    const s = String(val).trim();
    return s !== '' && !['NON', 'non', 'Non', 'false', '0'].includes(s);
  };

  const getDelivranceDisplay = (val: any): string => {
    if (!val) return '—';
    const s = String(val).trim();
    if (!s) return '—';
    if (['NON', 'non', 'Non', 'false', '0'].includes(s)) return 'Non délivré';
    if (['OUI', 'oui', 'Oui', 'true', '1'].includes(s)) return 'Délivré';
    return s;
  };

  const getCellValue = (carte: any, field: string): string => {
    switch (field) {
      case 'coordination':   return carte.coordination   || '-';
      case 'lieuEnrolement': return carte.lieuEnrolement || carte["LIEU D'ENROLEMENT"] || '-';
      case 'siteRetrait':    return carte.siteRetrait    || carte["SITE DE RETRAIT"]   || '-';
      case 'rangement':      return carte.rangement      || '-';
      case 'nom':            return carte.nom            || '-';
      case 'prenoms':        return carte.prenoms        || carte.prenom               || '-';
      case 'lieuNaissance':  return carte.lieuNaissance  || carte["LIEU NAISSANCE"]    || '-';
      case 'dateNaissance':  return carte.dateNaissance  || carte["DATE DE NAISSANCE"] || '-';
      case 'contact':        return carte.contact        || '-';
      case 'delivrance':     return getDelivranceDisplay(carte.delivrance);
      case 'contactRetrait': return carte.contactRetrait || carte["CONTACT DE RETRAIT"] || '-';
      case 'dateDelivrance': return carte.dateDelivrance || carte["DATE DE DELIVRANCE"]  || '-';
      default: return '-';
    }
  };

  const formatDate = (s: string): string => {
    if (!s || s === '-') return '-';
    try { const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleDateString('fr-FR'); }
    catch { return s; }
  };

  const handleCellClick = (rowIndex: number, field: string) => {
    if (!isFieldEditable(field) || field === 'delivrance') return;
    const v = getCellValue(localCartes[rowIndex], field);
    setEditValue(v === '-' ? '' : v);
    setEditingCell({ rowIndex, field });
  };

  const handleSaveEdit = () => {
    if (!editingCell) return;
    const { rowIndex, field } = editingCell;
    const updated = [...localCartes];
    updated[rowIndex] = { ...updated[rowIndex], [field]: editValue };
    setLocalCartes(updated);
    onUpdateCartes(updated);
    setEditingCell(null);
    setEditValue('');
  };

  const handleDelivranceToggle = (rowIndex: number) => {
    if (!isFieldEditable('delivrance')) return;
    const updated = [...localCartes];
    updated[rowIndex] = {
      ...updated[rowIndex],
      delivrance: isDelivre(updated[rowIndex].delivrance) ? '' : 'OUI',
    };
    setLocalCartes(updated);
    onUpdateCartes(updated);
  };

  const handleDelivranceEdit = (rowIndex: number) => {
    if (!isFieldEditable('delivrance')) return;
    const cur = getCellValue(localCartes[rowIndex], 'delivrance');
    setEditValue(['—', 'Non délivré'].includes(cur) ? '' : cur);
    setEditingCell({ rowIndex, field: 'delivrance' });
  };

  const handleDelivranceSave = () => {
    if (!editingCell || editingCell.field !== 'delivrance') return;
    const updated = [...localCartes];
    updated[editingCell.rowIndex] = {
      ...updated[editingCell.rowIndex],
      delivrance: editValue.trim(),
    };
    setLocalCartes(updated);
    onUpdateCartes(updated);
    setEditingCell(null);
    setEditValue('');
  };

  // ✅ FIX : Comptage des modifs par id (pas par index) pour l'affichage
  const cartesModifiees = localCartes.filter((carte) => {
    const orig = cartes.find((c: any) => c.id === carte.id);
    return orig && chefFields.some(f => carte[f] !== orig[f]);
  });

  if (!localCartes.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <DocumentTextIcon className="w-12 h-12 text-gray-200" />
        <p className="text-gray-400 text-sm">Aucune carte à afficher</p>
      </div>
    );
  }

  return (
    <div>
      {/* ── En-tête table ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/60">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">
            {localCartes.length} carte{localCartes.length > 1 ? 's' : ''}
          </span>
          {cartesModifiees.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-amber-50 border border-amber-200 text-amber-700">
              {cartesModifiees.length} modif.
            </span>
          )}
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
          isOperateur  ? 'bg-gray-50 text-gray-500 border-gray-200'
          : isChefEquipe ? 'bg-amber-50 text-amber-700 border-amber-200'
          : 'bg-emerald-50 border-emerald-200'
        }`} style={!isOperateur && !isChefEquipe ? { color: GREEN } : {}}>
          {isOperateur  ? <><LockClosedIcon className="w-3 h-3 mr-1" />Lecture</> :
           isChefEquipe ? <><PencilIcon className="w-3 h-3 mr-1" />Limité</> :
                          <><LockOpenIcon className="w-3 h-3 mr-1" />Édition</>}
        </div>
      </div>

      {/* ── Tableau ── */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: `linear-gradient(135deg, ${GREEN} 0%, #3a9c68 100%)` }} className="text-white">
              {colonnes.map(col => {
                const Icon = col.icon;
                return (
                  <th key={col.key} className={`${headPx} text-left border-r border-white/10 ${col.width}`}>
                    <div className="flex items-center gap-2">
                      <Icon className={`${iconSz} opacity-80 flex-shrink-0`} />
                      <span className={`${textSz} font-semibold whitespace-nowrap`}>{col.label}</span>
                      {!isFieldEditable(col.key) && <LockClosedIcon className="w-3 h-3 opacity-40" />}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {localCartes.map((carte, rowIndex) => (
                <motion.tr key={carte.id || rowIndex}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(rowIndex * 0.015, 0.4) }}
                  className={`border-b border-gray-50 transition-colors ${
                    isDelivre(carte.delivrance)
                      ? 'bg-emerald-50/40 hover:bg-emerald-50/70'
                      : rowIndex % 2 === 0
                        ? 'bg-white hover:bg-amber-50/20'
                        : 'bg-gray-50/30 hover:bg-amber-50/20'
                  }`}
                >
                  {colonnes.map(col => {
                    const cellValue  = getCellValue(carte, col.key);
                    const isEditing  = editingCell?.rowIndex === rowIndex && editingCell?.field === col.key;
                    const editable   = isFieldEditable(col.key);
                    const displayVal = col.key.toLowerCase().includes('date') ? formatDate(cellValue) : cellValue;

                    if (col.key === 'delivrance') {
                      const delivered = isDelivre(carte.delivrance);
                      return (
                        <td key={col.key} className={`${cellPx} border-r border-gray-50 ${col.width}`}>
                          {isEditing ? (
                            <input type="text" value={editValue} autoFocus
                              onChange={e => setEditValue(e.target.value)}
                              onBlur={handleDelivranceSave}
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleDelivranceSave();
                                else if (e.key === 'Escape') setEditingCell(null);
                              }}
                              placeholder="Nom livreur ou mention…"
                              className={`w-full px-2 py-1 border-2 rounded-lg bg-amber-50 focus:outline-none ${textSz}`}
                              style={{ borderColor: ORANGE }} />
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDelivranceToggle(rowIndex)}
                                disabled={!editable}
                                className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                  !editable ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                                }`}
                                style={delivered
                                  ? { backgroundColor: GREEN, borderColor: GREEN }
                                  : { backgroundColor: 'white', borderColor: '#d1d5db' }}>
                                {delivered && <CheckIcon className={`${isMobile ? 'w-2 h-2' : 'w-3 h-3'} text-white`} />}
                              </button>
                              <span
                                onClick={() => editable && handleDelivranceEdit(rowIndex)}
                                className={`truncate flex-1 ${textSz} ${editable ? 'cursor-pointer hover:underline' : ''}`}
                                style={delivered
                                  ? { color: GREEN, fontWeight: 600 }
                                  : { color: '#9ca3af', fontStyle: 'italic' }}>
                                {displayVal}
                              </span>
                              {editable && !isMobile && <PencilIcon className="w-3 h-3 text-gray-300 flex-shrink-0" />}
                            </div>
                          )}
                        </td>
                      );
                    }

                    return (
                      <td key={col.key} className={`${cellPx} border-r border-gray-50 ${col.width}`}
                        onClick={() => editable && handleCellClick(rowIndex, col.key)}>
                        {isEditing ? (
                          <input type="text" value={editValue} autoFocus
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={handleSaveEdit}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSaveEdit();
                              else if (e.key === 'Escape') setEditingCell(null);
                            }}
                            className={`w-full px-2 py-1 border-2 rounded-lg bg-amber-50 focus:outline-none ${textSz}`}
                            style={{ borderColor: ORANGE }} />
                        ) : (
                          <div className={`flex items-center justify-between gap-1 ${
                            editable ? 'cursor-pointer hover:bg-amber-50/40 rounded px-1 -mx-1' : ''
                          }`}>
                            <span className={`truncate ${textSz} text-gray-700`}>{displayVal}</span>
                            {editable && !isMobile && <PencilIcon className="w-3 h-3 text-gray-300 flex-shrink-0" />}
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

      {/* ── Pied ── */}
      <div className="px-5 py-3 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ORANGE }} />
            Éditable
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: GREEN }} />
            Délivrée
          </span>
          {!isOperateur && (
            <span className="text-gray-300 hidden md:inline">
              · Cliquez sur une cellule pour modifier
              {isChefEquipe && ' (3 champs autorisés)'}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400">
          {localCartes.length} ligne{localCartes.length > 1 ? 's' : ''}
          {cartesModifiees.length > 0 && (
            <span className="ml-2 font-semibold" style={{ color: ORANGE }}>
              · {cartesModifiees.length} modif. en attente
            </span>
          )}
        </span>
      </div>
    </div>
  );
};

export default TableCartesExcel;