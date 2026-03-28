// src/components/TableCartesExcel.tsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PencilIcon, CheckCircleIcon, LockClosedIcon, LockOpenIcon,
  DocumentTextIcon, CalendarIcon, PhoneIcon, UserIcon,
  MapPinIcon, BuildingOfficeIcon, CheckIcon,
  ArrowDownTrayIcon, TableCellsIcon, ListBulletIcon, Squares2X2Icon,
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

const formatDate = (s: string): string => {
  if (!s || s === '-') return '—';
  try {
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : d.toLocaleDateString('fr-FR');
  } catch { return s; }
};

const getCellValue = (carte: any, field: string): string => {
  switch (field) {
    case 'coordination':   return carte.coordination   || '—';
    case 'lieuEnrolement': return carte.lieuEnrolement || carte["LIEU D'ENROLEMENT"] || '—';
    case 'siteRetrait':    return carte.siteRetrait    || carte["SITE DE RETRAIT"]   || '—';
    case 'rangement':      return carte.rangement      || '—';
    case 'nom':            return carte.nom            || '—';
    case 'prenoms':        return carte.prenoms        || carte.prenom               || '—';
    case 'lieuNaissance':  return carte.lieuNaissance  || carte["LIEU NAISSANCE"]    || '—';
    case 'dateNaissance':  return carte.dateNaissance  || carte["DATE DE NAISSANCE"] || '—';
    case 'contact':        return carte.contact        || '—';
    case 'delivrance':     return getDelivranceDisplay(carte.delivrance);
    case 'contactRetrait': return carte.contactRetrait || carte["CONTACT DE RETRAIT"] || '—';
    case 'dateDelivrance': return carte.dateDelivrance || carte["DATE DE DELIVRANCE"]  || '—';
    default: return '—';
  }
};

// ─── Colonnes Desktop (toutes les colonnes) ───────────────────────────────────
const colonnesDesktop = [
  { key: 'coordination',   label: 'Coordination',    icon: BuildingOfficeIcon, width: 'min-w-[130px]' },
  { key: 'lieuEnrolement', label: "Lieu Enrôlement", icon: MapPinIcon,         width: 'min-w-[140px]' },
  { key: 'siteRetrait',    label: 'Site Retrait',    icon: MapPinIcon,         width: 'min-w-[130px]' },
  { key: 'rangement',      label: 'Rangement',       icon: DocumentTextIcon,   width: 'min-w-[110px]' },
  { key: 'nom',            label: 'Nom',             icon: UserIcon,           width: 'min-w-[120px]' },
  { key: 'prenoms',        label: 'Prénom(s)',       icon: UserIcon,           width: 'min-w-[120px]' },
  { key: 'lieuNaissance',  label: 'Lieu Naissance',  icon: MapPinIcon,         width: 'min-w-[130px]' },
  { key: 'dateNaissance',  label: 'Date Naissance',  icon: CalendarIcon,       width: 'min-w-[120px]' },
  { key: 'contact',        label: 'Contact',         icon: PhoneIcon,          width: 'min-w-[120px]' },
  { key: 'delivrance',     label: 'Délivrance',      icon: CheckCircleIcon,    width: 'min-w-[160px]' },
  { key: 'contactRetrait', label: 'Contact Retrait', icon: PhoneIcon,          width: 'min-w-[130px]' },
  { key: 'dateDelivrance', label: 'Date Retrait',    icon: CalendarIcon,       width: 'min-w-[120px]' },
];

// ─── Colonnes Tablette (toutes les colonnes, labels courts) ───────────────────
const colonnesTablet = [
  { key: 'coordination',   label: 'Coord.',      icon: BuildingOfficeIcon, width: 'min-w-[100px]' },
  { key: 'lieuEnrolement', label: 'Lieu Enr.',   icon: MapPinIcon,         width: 'min-w-[110px]' },
  { key: 'siteRetrait',    label: 'Site',        icon: MapPinIcon,         width: 'min-w-[100px]' },
  { key: 'rangement',      label: 'Rang.',       icon: DocumentTextIcon,   width: 'min-w-[90px]'  },
  { key: 'nom',            label: 'Nom',         icon: UserIcon,           width: 'min-w-[100px]' },
  { key: 'prenoms',        label: 'Prénoms',     icon: UserIcon,           width: 'min-w-[100px]' },
  { key: 'lieuNaissance',  label: 'Lieu Naiss.', icon: MapPinIcon,         width: 'min-w-[110px]' },
  { key: 'dateNaissance',  label: 'Date Naiss.', icon: CalendarIcon,       width: 'min-w-[100px]' },
  { key: 'contact',        label: 'Contact',     icon: PhoneIcon,          width: 'min-w-[100px]' },
  { key: 'delivrance',     label: 'Délivrance',  icon: CheckCircleIcon,    width: 'min-w-[140px]' },
  { key: 'contactRetrait', label: 'Ctt. Ret.',   icon: PhoneIcon,          width: 'min-w-[100px]' },
  { key: 'dateDelivrance', label: 'Date Ret.',   icon: CalendarIcon,       width: 'min-w-[100px]' },
];

// ─── Card View Mobile ─────────────────────────────────────────────────────────
interface CardViewProps {
  cartes: any[];
  isFieldEditable: (field: string) => boolean;
  onDelivranceToggle: (rowIndex: number) => void;
  onDelivranceEdit: (rowIndex: number) => void;
  onCellEdit: (rowIndex: number, field: string) => void;
  editingCell: { rowIndex: number; field: string } | null;
  editValue: string;
  setEditValue: (v: string) => void;
  handleSaveEdit: () => void;
  setEditingCell: (v: any) => void;
}

// Champs de la grille identité (hors délivrance gérée à part)
const identiteFields: { key: string; label: string; icon: React.ElementType; isDate?: boolean }[] = [
  { key: 'lieuNaissance',  label: 'Lieu de naissance',  icon: MapPinIcon },
  { key: 'dateNaissance',  label: 'Date de naissance',  icon: CalendarIcon, isDate: true },
  { key: 'lieuEnrolement', label: "Lieu d'enrôlement",  icon: MapPinIcon },
  { key: 'siteRetrait',    label: 'Site de retrait',    icon: MapPinIcon },
  { key: 'contact',        label: 'Contact',            icon: PhoneIcon },
];

const CardView: React.FC<CardViewProps> = ({
  cartes, isFieldEditable,
  onDelivranceToggle, onDelivranceEdit, onCellEdit,
  editingCell, editValue, setEditValue, handleSaveEdit, setEditingCell,
}) => {
  return (
    <div className="divide-y divide-gray-100">
      {cartes.map((carte, rowIndex) => {
        const delivered        = isDelivre(carte.delivrance);
        const delivranceVal    = getCellValue(carte, 'delivrance');
        const dateDelivranceVal = formatDate(getCellValue(carte, 'dateDelivrance'));
        const contactRetraitVal = getCellValue(carte, 'contactRetrait');
        const rangement        = getCellValue(carte, 'rangement');
        const coordination     = getCellValue(carte, 'coordination');
        const delivranceEditable = isFieldEditable('delivrance');

        // Initiales pour fallback logo
        const nomInitiale    = (carte.nom    || '').charAt(0).toUpperCase();
        const prenomInitiale = (carte.prenoms || carte.prenom || '').charAt(0).toUpperCase();

        return (
          <motion.div
            key={carte.id || rowIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(rowIndex * 0.04, 0.5) }}
            className="bg-white"
          >
            {/* ══ CARTE ══════════════════════════════════════════════ */}
            <div className="mx-3 my-3 rounded-2xl border border-gray-200 overflow-hidden shadow-sm">

              {/* ── Header blanc avec ligne orange en bas ── */}
              <div className="bg-white border-b-2 px-4 pt-4 pb-3" style={{ borderBottomColor: ORANGE }}>

                {/* Ligne 1 : Logo + Nom + Badge */}
                <div className="flex items-start gap-3">
                  {/* Logo */}
                  <div className="w-11 h-11 rounded-full border-2 flex items-center justify-center flex-shrink-0 overflow-hidden bg-amber-50"
                    style={{ borderColor: ORANGE }}>
                    <img
                      src="/logo-placeholder.png"
                      alt="logo"
                      className="w-7 h-7 object-contain"
                      onError={(e) => {
                        const t = e.currentTarget;
                        t.style.display = 'none';
                        const fb = t.nextSibling as HTMLElement;
                        if (fb) fb.style.display = 'flex';
                      }}
                    />
                    {/* Fallback initiales si logo absent */}
                    <span
                      className="text-sm font-semibold hidden items-center justify-center w-full h-full"
                      style={{ color: ORANGE, display: 'none' }}
                    >
                      {nomInitiale}{prenomInitiale}
                    </span>
                  </div>

                  {/* Nom + Prénom */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-base leading-tight truncate">
                      {getCellValue(carte, 'nom')}
                    </p>
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                      {getCellValue(carte, 'prenoms')}
                    </p>
                  </div>

                  {/* Badge délivrance */}
                  <button
                    onClick={() => onDelivranceToggle(rowIndex)}
                    disabled={!delivranceEditable}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border flex-shrink-0 transition-all ${
                      delivered
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'bg-gray-50 border-gray-200 text-gray-400'
                    } ${delivranceEditable ? 'cursor-pointer' : 'cursor-default opacity-70'}`}
                  >
                    <span className={'w-2 h-2 rounded-full flex-shrink-0 ' + (delivered ? 'bg-emerald-400' : 'bg-gray-300')} />
                    {delivered ? 'Délivrée' : 'En attente'}
                  </button>
                </div>

                {/* Ligne 2 : Pills Rangement + Coordination */}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {rangement !== '—' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                      <DocumentTextIcon className="w-3 h-3" />
                      Rang. {rangement}
                    </span>
                  )}
                  {coordination !== '—' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
                      style={{ background: '#fff8f0', borderColor: '#fed7aa', color: '#92400e' }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ORANGE }} />
                      {coordination}
                    </span>
                  )}
                </div>
              </div>

              {/* ── Corps : Section Identité ── */}
              <div className="px-4 pt-3 pb-0">
                {/* Titre section orange */}
                <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b" style={{ borderBottomColor: '#fed7aa' }}>
                  <UserIcon className="w-3 h-3 flex-shrink-0" style={{ color: ORANGE }} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: ORANGE }}>
                    Identité
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 pb-3">
                  {identiteFields.map(({ key, label, icon: Icon, isDate }) => {
                    const val        = getCellValue(carte, key);
                    const displayVal = isDate ? formatDate(val) : val;
                    const editable   = isFieldEditable(key);
                    const isEmpty    = val === '—';
                    const isEditing  = editingCell?.rowIndex === rowIndex && editingCell?.field === key;

                    return (
                      <div key={key} className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 flex items-center gap-1 mb-0.5">
                          <Icon className="w-3 h-3 flex-shrink-0" />
                          {label}
                        </p>
                        {isEditing ? (
                          <input
                            type={isDate ? 'date' : 'text'}
                            value={editValue}
                            autoFocus
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={handleSaveEdit}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSaveEdit();
                              else if (e.key === 'Escape') setEditingCell(null);
                            }}
                            className="w-full px-2 py-1 text-xs border-2 rounded-lg bg-amber-50 focus:outline-none"
                            style={{ borderColor: ORANGE }}
                          />
                        ) : (
                          <p
                            onClick={() => editable && onCellEdit(rowIndex, key)}
                            className={`text-xs truncate rounded px-1 -mx-1 py-0.5 ${
                              isEmpty ? 'text-gray-300 italic' : 'text-gray-800'
                            } ${editable ? 'cursor-pointer hover:bg-amber-50/60 active:bg-amber-100' : ''}`}
                          >
                            {displayVal}
                            {editable && !isEmpty && (
                              <PencilIcon className="inline-block w-2.5 h-2.5 ml-1 text-gray-300" />
                            )}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Section Délivrance ── */}
              <div className="px-4 pt-0 pb-3">
                {/* Titre section orange */}
                <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b" style={{ borderBottomColor: '#fed7aa' }}>
                  <CheckCircleIcon className="w-3 h-3 flex-shrink-0" style={{ color: ORANGE }} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: ORANGE }}>
                    Délivrance
                  </span>
                </div>

                {/* Bloc côte à côte : Statut | Date de retrait */}
                <div className={'grid grid-cols-2 gap-0 rounded-xl overflow-hidden border ' +
                  (delivered ? 'border-emerald-200' : 'border-gray-200')}>

                  {/* Cellule Statut (gauche) */}
                  <div className={'p-2.5 border-r ' + (delivered ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200')}>
                    <p className={'text-[10px] font-semibold uppercase tracking-wide mb-1.5 flex items-center gap-1 ' +
                      (delivered ? 'text-emerald-600' : 'text-gray-400')}>
                      <CheckCircleIcon className="w-3 h-3" />
                      Statut
                    </p>
                    <div className="flex items-center gap-1.5">
                      {/* Checkbox cliquable */}
                      <button
                        onClick={() => onDelivranceToggle(rowIndex)}
                        disabled={!delivranceEditable}
                        className={'w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-all ' +
                          (!delivranceEditable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer')}
                        style={delivered
                          ? { backgroundColor: GREEN, borderColor: GREEN }
                          : { backgroundColor: 'white', borderColor: '#d1d5db' }}
                      >
                        {delivered && <CheckIcon className="w-2.5 h-2.5 text-white" />}
                      </button>
                      <div className="min-w-0">
                        <p className={'text-xs font-semibold truncate ' + (delivered ? 'text-emerald-700' : 'text-gray-400 italic')}>
                          {delivered ? 'Délivrée' : 'Non délivrée'}
                        </p>
                        {/* Nom de la personne qui a retiré */}
                        {delivered && delivranceVal !== 'Délivré' && delivranceVal !== '—' && (
                          <p
                            onClick={() => delivranceEditable && onDelivranceEdit(rowIndex)}
                            className={'text-[11px] text-emerald-600 truncate mt-0.5 ' + (delivranceEditable ? 'cursor-pointer hover:underline' : '')}
                          >
                            {delivranceVal}
                          </p>
                        )}
                      </div>
                      {delivranceEditable && (
                        <PencilIcon className="w-3 h-3 text-gray-300 flex-shrink-0 ml-auto" />
                      )}
                    </div>
                  </div>

                  {/* Cellule Date de retrait (droite) */}
                  <div className={'p-2.5 ' + (delivered ? 'bg-emerald-50' : 'bg-gray-50')}>
                    <p className={'text-[10px] font-semibold uppercase tracking-wide mb-1.5 flex items-center gap-1 ' +
                      (delivered ? 'text-emerald-600' : 'text-gray-400')}>
                      <CalendarIcon className="w-3 h-3" />
                      Date retrait
                    </p>
                    {editingCell?.rowIndex === rowIndex && editingCell?.field === 'dateDelivrance' ? (
                      <input
                        type="date"
                        value={editValue}
                        autoFocus
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={handleSaveEdit}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleSaveEdit();
                          else if (e.key === 'Escape') setEditingCell(null);
                        }}
                        className="w-full px-1.5 py-0.5 text-xs border-2 rounded-lg bg-amber-50 focus:outline-none"
                        style={{ borderColor: ORANGE }}
                      />
                    ) : (
                      <p
                        onClick={() => isFieldEditable('dateDelivrance') && onCellEdit(rowIndex, 'dateDelivrance')}
                        className={'text-xs font-medium truncate ' +
                          (dateDelivranceVal === '—' ? 'text-gray-300 italic' : (delivered ? 'text-emerald-700' : 'text-gray-600')) +
                          (isFieldEditable('dateDelivrance') ? ' cursor-pointer hover:underline' : '')}
                      >
                        {dateDelivranceVal}
                      </p>
                    )}

                    {/* Contact retrait */}
                    {contactRetraitVal !== '—' && (
                      <p className="text-[11px] text-gray-400 truncate mt-1">{contactRetraitVal}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Footer ── */}
              <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <span className="text-[11px] text-gray-400">ID #{carte.id || '—'}</span>
                {delivranceEditable && (
                  <button
                    onClick={() => onDelivranceEdit(rowIndex)}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all"
                    style={{ color: ORANGE, borderColor: '#fed7aa', background: '#fff8f0' }}
                  >
                    <PencilIcon className="w-3 h-3" />
                    Modifier
                  </button>
                )}
              </div>

            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// ─── Composant principal ───────────────────────────────────────────────────────
const TableCartesExcel: React.FC<TableCartesExcelProps> = ({
  cartes, role, onUpdateCartes, canEdit = true, editFields = [],
  onExportCSV, onExportExcel,
}) => {
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; field: string } | null>(null);
  const [editValue,   setEditValue]   = useState('');
  const [localCartes, setLocalCartes] = useState<any[]>(cartes);
  const [viewMode,    setViewMode]    = useState<'table' | 'card'>('table');
  const [screenSize,  setScreenSize]  = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const tableRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setScreenSize('mobile');
        setViewMode('card');    // Mobile → card par défaut
      } else if (w < 1024) {
        setScreenSize('tablet');
        setViewMode('table');   // Tablette → tableau par défaut
      } else {
        setScreenSize('desktop');
        setViewMode('table');
      }
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Détecter si le tableau dépasse et afficher l'indicateur de scroll
  useEffect(() => {
    const el = tableRef.current;
    if (!el) return;
    const check = () => setShowScrollHint(el.scrollWidth > el.clientWidth);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [localCartes, viewMode]);

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

  const isMobile  = screenSize === 'mobile';
  const isTablet  = screenSize === 'tablet';
  const colonnes  = isTablet ? colonnesTablet : colonnesDesktop;
  const cellPx    = isTablet ? 'px-3 py-2.5' : 'px-4 py-3';
  const headPx    = isTablet ? 'px-3 py-3'   : 'px-4 py-3.5';
  const textSz    = isTablet ? 'text-xs'     : 'text-sm';
  const iconSz    = isTablet ? 'w-3 h-3'     : 'w-4 h-4';

  // ── Handlers ──────────────────────────────────────────────────
  const handleCellClick = (rowIndex: number, field: string) => {
    if (!isFieldEditable(field) || field === 'delivrance') return;
    const v = getCellValue(localCartes[rowIndex], field);
    setEditValue(v === '—' ? '' : v);
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

  const cartesModifiees = localCartes.filter((carte) => {
    const orig = cartes.find((c: any) => c.id === carte.id);
    return orig && chefFields.some(f => carte[f] !== orig[f]);
  });

  if (!localCartes.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <DocumentTextIcon className="w-12 h-12 text-gray-200" />
        <p className="text-gray-400 text-sm">Aucune carte à afficher</p>
      </div>
    );
  }

  return (
    <div>
      {/* ── Barre d'outils ──────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/60 gap-3 flex-wrap">

        {/* Gauche : compteur + modifs */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-700">
            {localCartes.length} carte{localCartes.length > 1 ? 's' : ''}
          </span>
          {cartesModifiees.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-amber-50 border border-amber-200 text-amber-700">
              {cartesModifiees.length} modif.
            </span>
          )}
        </div>

        {/* Droite : toggle vue + exports + rôle */}
        <div className="flex items-center gap-2 flex-wrap">

          {/* Toggle Table / Card (visible sur mobile et tablette) */}
          {!isMobile && (
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('table')}
                title="Vue tableau"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  viewMode === 'table'
                    ? 'bg-white shadow text-gray-800'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <ListBulletIcon className="w-3.5 h-3.5" />
                {!isTablet && 'Tableau'}
              </button>
              <button
                onClick={() => setViewMode('card')}
                title="Vue fiches"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  viewMode === 'card'
                    ? 'bg-white shadow text-gray-800'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Squares2X2Icon className="w-3.5 h-3.5" />
                {!isTablet && 'Fiches'}
              </button>
            </div>
          )}

          {/* Exports */}
          {(onExportCSV || onExportExcel) && (
            <div className="flex items-center gap-1.5">
              {onExportCSV && (
                <button
                  onClick={onExportCSV}
                  title="Exporter en CSV"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-amber-50 hover:border-amber-300 hover:text-[#E07B00] transition-all text-gray-600 bg-white"
                >
                  <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                  {!isMobile && 'CSV'}
                </button>
              )}
              {onExportExcel && (
                <button
                  onClick={onExportExcel}
                  title="Exporter en Excel"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all text-gray-600 bg-white"
                >
                  <TableCellsIcon className="w-3.5 h-3.5" />
                  {!isMobile && 'Excel'}
                </button>
              )}
            </div>
          )}

          {/* Badge rôle */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
            isOperateur
              ? 'bg-gray-50 text-gray-500 border-gray-200'
              : isChefEquipe
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            {isOperateur  ? <><LockClosedIcon className="w-3 h-3" />Lecture</>  :
             isChefEquipe ? <><PencilIcon     className="w-3 h-3" />Limité</>   :
                            <><LockOpenIcon   className="w-3 h-3" />Édition</>}
          </div>
        </div>
      </div>

      {/* ── Indicateur scroll horizontal (tablette/desktop en mode tableau) ── */}
      <AnimatePresence>
        {viewMode === 'table' && showScrollHint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-center gap-2 py-1.5 bg-amber-50 border-b border-amber-100 text-xs text-amber-600 font-medium"
          >
            <span>←</span>
            <span>Faites défiler horizontalement pour voir toutes les colonnes</span>
            <span>→</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Vue Fiches (Card View) ─────────────────────────────── */}
      {viewMode === 'card' ? (
        <CardView
          cartes={localCartes}
          isFieldEditable={isFieldEditable}
          onDelivranceToggle={handleDelivranceToggle}
          onDelivranceEdit={handleDelivranceEdit}
          onCellEdit={handleCellClick}
          editingCell={editingCell}
          editValue={editValue}
          setEditValue={setEditValue}
          handleSaveEdit={handleSaveEdit}
          setEditingCell={setEditingCell}
        />
      ) : (
        /* ── Vue Tableau ───────────────────────────────────────── */
        <div ref={tableRef} className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ background: `linear-gradient(135deg, ${GREEN} 0%, #3a9c68 100%)` }} className="text-white">
                {colonnes.map(col => {
                  const Icon = col.icon;
                  return (
                    <th key={col.key} className={`${headPx} text-left border-r border-white/10 ${col.width} sticky top-0`}>
                      <div className="flex items-center gap-2">
                        <Icon className={`${iconSz} opacity-80 flex-shrink-0`} />
                        <span className={`${textSz} font-semibold whitespace-nowrap`}>{col.label}</span>
                        {!isFieldEditable(col.key) && <LockClosedIcon className="w-3 h-3 opacity-40 ml-auto" />}
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
                    key={carte.id || rowIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(rowIndex * 0.015, 0.4) }}
                    className={`border-b border-gray-50 transition-colors group ${
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
                      const isEmpty    = cellValue === '—';

                      // ── Colonne Délivrance : traitement spécial ──
                      if (col.key === 'delivrance') {
                        const delivered = isDelivre(carte.delivrance);
                        return (
                          <td key={col.key} className={`${cellPx} border-r border-gray-50 ${col.width}`}>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editValue}
                                autoFocus
                                onChange={e => setEditValue(e.target.value)}
                                onBlur={handleDelivranceSave}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') handleDelivranceSave();
                                  else if (e.key === 'Escape') setEditingCell(null);
                                }}
                                placeholder="Nom livreur ou mention…"
                                className={`w-full px-2 py-1 border-2 rounded-lg bg-amber-50 focus:outline-none ${textSz}`}
                                style={{ borderColor: ORANGE }}
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleDelivranceToggle(rowIndex)}
                                  disabled={!editable}
                                  className={`${isTablet ? 'w-4 h-4' : 'w-5 h-5'} rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                    !editable ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-110'
                                  }`}
                                  style={delivered
                                    ? { backgroundColor: GREEN, borderColor: GREEN }
                                    : { backgroundColor: 'white', borderColor: '#d1d5db' }}
                                >
                                  {delivered && <CheckIcon className={`${isTablet ? 'w-2 h-2' : 'w-3 h-3'} text-white`} />}
                                </button>
                                <span
                                  onClick={() => editable && handleDelivranceEdit(rowIndex)}
                                  className={`truncate flex-1 ${textSz} ${editable ? 'cursor-pointer hover:underline' : ''}`}
                                  style={delivered
                                    ? { color: GREEN, fontWeight: 600 }
                                    : { color: '#9ca3af', fontStyle: 'italic' }}
                                >
                                  {displayVal}
                                </span>
                                {editable && <PencilIcon className="w-3 h-3 text-gray-300 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />}
                              </div>
                            )}
                          </td>
                        );
                      }

                      // ── Cellule standard ──
                      return (
                        <td
                          key={col.key}
                          className={`${cellPx} border-r border-gray-50 ${col.width} ${editable ? 'cursor-pointer' : ''}`}
                          onClick={() => editable && handleCellClick(rowIndex, col.key)}
                        >
                          {isEditing ? (
                            <input
                              type={col.key.toLowerCase().includes('date') ? 'date' : 'text'}
                              value={editValue}
                              autoFocus
                              onChange={e => setEditValue(e.target.value)}
                              onBlur={handleSaveEdit}
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleSaveEdit();
                                else if (e.key === 'Escape') setEditingCell(null);
                              }}
                              className={`w-full px-2 py-1 border-2 rounded-lg bg-amber-50 focus:outline-none ${textSz}`}
                              style={{ borderColor: ORANGE }}
                            />
                          ) : (
                            <div className={`flex items-center justify-between gap-1 ${
                              editable ? 'hover:bg-amber-50/40 rounded px-1 -mx-1' : ''
                            }`}>
                              <span className={`truncate ${textSz} ${isEmpty ? 'text-gray-300 italic' : 'text-gray-700'}`}>
                                {displayVal}
                              </span>
                              {editable && (
                                <PencilIcon className="w-3 h-3 text-gray-300 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
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
      )}

      {/* ── Pied de tableau ─────────────────────────────────────── */}
      <div className="px-4 py-3 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ORANGE }} />
            Éditable
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: GREEN }} />
            Délivrée
          </span>
          {!isOperateur && !isMobile && (
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