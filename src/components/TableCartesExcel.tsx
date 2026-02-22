import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
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
  CheckIcon
} from '@heroicons/react/24/outline';

interface TableCartesExcelProps {
  cartes: Carte[];
  role: string;
  onUpdateCartes: (cartes: Carte[]) => void;
  canEdit?: boolean;
  editFields?: string[];
}

const TableCartesExcel: React.FC<TableCartesExcelProps> = ({ 
  cartes, 
  role, 
  onUpdateCartes,
  canEdit = true,
  editFields = []
}) => {
  // useAuth est utilisé implicitement via le hook usePermissions
  useAuth();
  usePermissions();
  
  const [editingCell, setEditingCell] = useState<{rowIndex: number, field: string} | null>(null);
  const [editValue, setEditValue] = useState("");
  const [localCartes, setLocalCartes] = useState<Carte[]>(cartes);
  
  // Responsive
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mettre à jour les cartes locales quand les props changent
  useEffect(() => {
    setLocalCartes(cartes);
  }, [cartes]);

  // Configuration des permissions
  const isChefEquipe = role === "Chef d'équipe";
  const isOperateur = role === "Opérateur";

  // Champs autorisés pour Chef d'équipe
  const chefEquipeFields = ['delivrance', 'contactRetrait', 'dateDelivrance'];

  // Vérifier si un champ est éditable
  const isFieldEditable = (field: string): boolean => {
    if (!canEdit) return false;
    if (isOperateur) return false;
    if (isChefEquipe) {
      return chefEquipeFields.includes(field);
    }
    if (editFields.length > 0) {
      return editFields.includes(field);
    }
    return true; // Admin/Gestionnaire : tous les champs
  };

  // Colonnes avec design harmonisé
  const colonnes = [
    { key: "nom", label: "Nom", icon: UserIcon, width: "w-24 md:w-28" },
    { key: "prenom", label: "Prénom", icon: UserIcon, width: "w-24 md:w-28" },
    { key: "telephone", label: "Téléphone", icon: PhoneIcon, width: "w-20 md:w-24" },
    { key: "lieuNaissance", label: "Lieu Naissance", icon: MapPinIcon, width: "w-28 md:w-32" },
    { key: "dateNaissance", label: "Date Naiss.", icon: CalendarIcon, width: "w-24 md:w-28" },
    { key: "adresse", label: "Adresse", icon: BuildingOfficeIcon, width: "w-28 md:w-32" },
    { key: "delivrance", label: "Délivrance", icon: CheckCircleIcon, width: "w-20 md:w-24" },
    { key: "contactRetrait", label: "Contact Retrait", icon: PhoneIcon, width: "w-20 md:w-24" },
    { key: "dateDelivrance", label: "Date Retrait", icon: CalendarIcon, width: "w-24 md:w-28" }
  ];

  // Obtenir la valeur d'une cellule
  const getCellValue = (carte: Carte, field: string): string => {
    switch (field) {
      case 'nom': return carte.nom || '-';
      case 'prenom': return carte.prenom || '-';
      case 'telephone': return carte.telephone || '-';
      case 'lieuNaissance': return carte.lieuNaissance || '-';
      case 'dateNaissance': return carte.dateNaissance || '-';
      case 'adresse': return carte.adresse || '-';
      case 'delivrance': return carte.delivrance ? 'Oui' : 'Non';
      case 'contactRetrait': return carte.contactRetrait || '-';
      case 'dateDelivrance': return carte.dateDelivrance || '-';
      default: return '-';
    }
  };

  // Clic sur une cellule pour édition
  const handleCellClick = (rowIndex: number, field: string) => {
    if (!isFieldEditable(field)) return;
    
    const currentValue = getCellValue(localCartes[rowIndex], field);
    setEditValue(currentValue === '-' ? '' : currentValue);
    setEditingCell({ rowIndex, field });
  };

  // Sauvegarde de l'édition
  const handleSaveEdit = () => {
    if (!editingCell) return;
    
    const { rowIndex, field } = editingCell;
    const updatedCartes = [...localCartes];
    
    // Mettre à jour la valeur
    if (field === 'delivrance') {
      updatedCartes[rowIndex] = {
        ...updatedCartes[rowIndex],
        [field]: editValue.toLowerCase() === 'oui' || editValue === 'true' || editValue === '1'
      };
    } else {
      updatedCartes[rowIndex] = {
        ...updatedCartes[rowIndex],
        [field]: editValue
      };
    }
    
    setLocalCartes(updatedCartes);
    onUpdateCartes(updatedCartes);
    setEditingCell(null);
    setEditValue("");
  };

  // Changement de checkbox
  const handleCheckboxChange = (rowIndex: number, field: string, checked: boolean) => {
    if (!isFieldEditable(field)) return;
    
    const updatedCartes = [...localCartes];
    updatedCartes[rowIndex] = {
      ...updatedCartes[rowIndex],
      [field]: checked
    };
    
    setLocalCartes(updatedCartes);
    onUpdateCartes(updatedCartes);
  };

  // Formatage des dates
  const formatDate = (dateString: string): string => {
    if (!dateString || dateString === '-') return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  };

  // Compter les modifications
  const cartesModifiees = localCartes.filter((carte, index) => {
    const originale = cartes[index];
    if (!originale) return false;
    
    return chefEquipeFields.some(field => 
      carte[field as keyof Carte] !== originale[field as keyof Carte]
    );
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <DocumentTextIcon className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
            <div>
              <h3 className={`font-bold ${isMobile ? 'text-sm' : 'text-base'}`}>
                Résultats
              </h3>
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
          
          {/* Badge permissions */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            isOperateur ? 'bg-gray-500/20 text-gray-200' :
            isChefEquipe ? 'bg-orange-500/20 text-orange-200' :
            'bg-green-500/20 text-green-200'
          }`}>
            {isOperateur ? (
              <>
                <LockClosedIcon className="w-3 h-3" />
                <span>Lecture seule</span>
              </>
            ) : isChefEquipe ? (
              <>
                <PencilIcon className="w-3 h-3" />
                <span>Édition limitée</span>
              </>
            ) : (
              <>
                <LockOpenIcon className="w-3 h-3" />
                <span>Édition complète</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tableau avec scroll */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          
          {/* En-têtes */}
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
                      <Icon className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                      <span className="truncate">{col.label}</span>
                      {!editable && (
                        <LockClosedIcon className={`${isMobile ? 'w-2 h-2' : 'w-3 h-3'} opacity-70`} />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          
          {/* Corps */}
          <tbody>
            <AnimatePresence>
              {localCartes.map((carte, rowIndex) => (
                <motion.tr 
                  key={rowIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: rowIndex * 0.02 }}
                  className={`border-b border-gray-100 transition-colors ${
                    carte.delivrance ? 'bg-green-50/50 hover:bg-green-100/50' : 'hover:bg-orange-50/30'
                  }`}
                >
                  {colonnes.map((col) => {
                    const cellValue = getCellValue(carte, col.key);
                    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.field === col.key;
                    const editable = isFieldEditable(col.key);
                    const displayValue = col.key.includes('date') ? formatDate(cellValue) : cellValue;
                    
                    return (
                      <td 
                        key={col.key}
                        className={`px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm border-r border-gray-100 ${col.width}`}
                        onClick={() => editable && handleCellClick(rowIndex, col.key)}
                      >
                        {col.key === 'delivrance' ? (
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => handleCheckboxChange(rowIndex, 'delivrance', !carte.delivrance)}
                              disabled={!editable}
                              className={`w-5 h-5 md:w-6 md:h-6 rounded-lg border-2 transition-all flex items-center justify-center ${
                                carte.delivrance
                                  ? 'bg-[#2E8B57] border-[#2E8B57] text-white'
                                  : 'bg-white border-gray-300 hover:border-[#F77F00]'
                              } ${!editable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              {carte.delivrance && <CheckIcon className="w-3 h-3 md:w-4 md:h-4" />}
                            </button>
                          </div>
                        ) : isEditing ? (
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
                            <span className={`truncate ${
                              col.key === 'delivrance' && cellValue === 'Oui' ? 'text-[#2E8B57] font-semibold' : ''
                            }`}>
                              {displayValue}
                            </span>
                            {editable && !isEditing && (
                              <PencilIcon className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
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
          
          {/* Légende */}
          <div className="flex items-center gap-2 md:gap-4">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-[#F77F00] rounded-full"></div>
              <span className={isMobile ? 'text-[10px]' : ''}>Éditable</span>
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-[#2E8B57] rounded-full"></div>
              <span className={isMobile ? 'text-[10px]' : ''}>Retirée</span>
            </span>
            <span className="flex items-center gap-1">
              <LockClosedIcon className="w-3 h-3 text-gray-400" />
              <span className={isMobile ? 'text-[10px]' : ''}>Verrouillé</span>
            </span>
          </div>

          {/* Compteur */}
          <div className="text-gray-500">
            {localCartes.length} ligne{localCartes.length > 1 ? 's' : ''}
            {cartesModifiees.length > 0 && (
              <span className="ml-2 text-[#F77F00] font-medium">
                • {cartesModifiees.length} modif.
              </span>
            )}
          </div>
        </div>

        {/* Instructions */}
        {!isOperateur && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className={`text-gray-500 flex items-center gap-1 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
              <PencilIcon className="w-3 h-3" />
              Cliquez sur une cellule pour modifier
              {isChefEquipe && (
                <span className="ml-2 text-orange-600">
                  (3 champs autorisés)
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableCartesExcel;