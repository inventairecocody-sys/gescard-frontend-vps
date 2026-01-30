import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Carte } from "../service/CartesService";

interface TableCartesExcelProps {
  cartes: Carte[];
  role: string;
  onUpdateCartes: (cartes: Carte[]) => void;
  canEdit?: boolean;
}

// ✅ TYPE POUR LES CARTES AVEC TOUTES LES PROPRIÉTÉS
interface CarteComplete {
  ID?: string | number;
  id?: string | number;
  NOM?: string;
  PRENOMS?: string;
  CONTACT?: string;
  "LIEU D'ENROLEMENT"?: string;
  "SITE DE RETRAIT"?: string;
  RANGEMENT?: string;
  "DATE DE NAISSANCE"?: string;
  "LIEU NAISSANCE"?: string;
  DELIVRANCE?: string;
  "CONTACT DE RETRAIT"?: string;
  "DATE DE DELIVRANCE"?: string;
  RETIREE?: boolean;
  // Propriétés en minuscules (pour compatibilité)
  nom?: string;
  prenoms?: string;
  contact?: string;
  rangement?: string;
  delivrance?: string;
  [key: string]: any; // Pour les autres propriétés dynamiques
}

const TableCartesExcel: React.FC<TableCartesExcelProps> = ({ 
  cartes, 
  role, 
  onUpdateCartes,
  canEdit = true
}) => {
  const [editingCell, setEditingCell] = useState<{rowIndex: number, column: string} | null>(null);
  const [editValue, setEditValue] = useState("");
  const [localCartes, setLocalCartes] = useState<Carte[]>(cartes);

  // ✅ Mettre à jour les cartes locales quand les props changent
  useEffect(() => {
    setLocalCartes(cartes);
  }, [cartes]);

  // ✅ LOG DE DIAGNOSTIC
  useEffect(() => {
    if (localCartes.length > 0) {
      console.log("🔍 DIAGNOSTIC TableCartesExcel:");
      const firstCarte = localCartes[0] as unknown as CarteComplete;
      console.log("Structure de la première carte:", {
        id: firstCarte.ID || firstCarte.id,
        NOM: firstCarte.NOM,
        nom: firstCarte.nom,
        PRENOMS: firstCarte.PRENOMS,
        prenoms: firstCarte.prenoms,
        DELIVRANCE: firstCarte.DELIVRANCE,
        delivrance: firstCarte.delivrance,
        toutesLesCles: Object.keys(firstCarte)
      });
    }
  }, [localCartes]);

  // ✅ CONFIGURATION DES PERMISSIONS PAR RÔLE
  const getPermissionsByRole = () => {
    const roleLower = role?.toLowerCase() || "";
    
    if (roleLower.includes("administrateur")) {
      return {
        canEditAll: true,
        canModify: true
      };
    } else if (roleLower.includes("superviseur")) {
      return {
        canEditAll: true,
        canModify: true
      };
    } else if (roleLower.includes("chef d'équipe") || roleLower.includes("chef d'equipe")) {
      return {
        canEditAll: false,
        canModify: false
      };
    } else if (roleLower.includes("opérateur") || roleLower.includes("operateur")) {
      return {
        canEditAll: false,
        canModify: false
      };
    } else {
      return {
        canEditAll: false,
        canModify: false
      };
    }
  };

  // ✅ PERMISSIONS
  const permissions = getPermissionsByRole();

  // ✅ INTERFACE POUR LES COLONNES
  interface Colonne {
    key: string;
    label: string;
    editable: boolean;
    width: string;
    type?: "text" | "checkbox";
  }

  // ✅ COLONNES AVEC DESIGN HARMONISÉ
  const colonnes: Colonne[] = [
    { key: "NOM", label: "Nom", editable: permissions.canEditAll, width: "w-28", type: "text" },
    { key: "PRENOMS", label: "Prénoms", editable: permissions.canEditAll, width: "w-28", type: "text" },
    { key: "CONTACT", label: "Contact", editable: permissions.canEditAll, width: "w-24", type: "text" },
    { key: "LIEU D'ENROLEMENT", label: "Lieu Enrôlement", editable: permissions.canEditAll, width: "w-32", type: "text" },
    { key: "SITE DE RETRAIT", label: "Site Retrait", editable: permissions.canEditAll, width: "w-32", type: "text" },
    { key: "RANGEMENT", label: "Rangement", editable: permissions.canEditAll, width: "w-24", type: "text" },
    { key: "DATE DE NAISSANCE", label: "Date Naissance", editable: permissions.canEditAll, width: "w-28", type: "text" },
    { key: "LIEU NAISSANCE", label: "Lieu Naissance", editable: permissions.canEditAll, width: "w-28", type: "text" },
    { key: "DELIVRANCE", label: "Délivrance", editable: permissions.canModify, width: "w-24", type: "text" },
    { key: "CONTACT DE RETRAIT", label: "Contact Retrait", editable: permissions.canModify, width: "w-24", type: "text" },
    { key: "DATE DE DELIVRANCE", label: "Date Retrait", editable: permissions.canModify, width: "w-28", type: "text" },
    { key: "RETIREE", label: "Retirée", editable: permissions.canModify, width: "w-16", type: "checkbox" },
  ];

  // ✅ FONCTION POUR TROUVER UNE VALEUR INSENSIBLE À LA CASSE
  const findValue = (carte: CarteComplete, possibleKeys: string[]): any => {
    for (const key of possibleKeys) {
      const value = carte[key];
      if (value !== undefined && value !== null && value !== '') {
        return value;
      }
    }
    return '';
  };

  // ✅ FONCTION POUR OBTENIR LA VALEUR D'UNE CELLULE
  const getCellValue = (carte: CarteComplete, columnKey: string): any => {
    switch (columnKey) {
      case "NOM": 
        return findValue(carte, ["NOM", "nom"]);
      case "PRENOMS": 
        return findValue(carte, ["PRENOMS", "prenoms"]);
      case "CONTACT": 
        return findValue(carte, ["CONTACT", "contact"]);
      case "LIEU D'ENROLEMENT": 
        return carte["LIEU D'ENROLEMENT"] || '';
      case "SITE DE RETRAIT": 
        return carte["SITE DE RETRAIT"] || '';
      case "RANGEMENT": 
        return findValue(carte, ["RANGEMENT", "rangement"]);
      case "DATE DE NAISSANCE": 
        return carte["DATE DE NAISSANCE"] || '';
      case "LIEU NAISSANCE": 
        return carte["LIEU NAISSANCE"] || '';
      case "DELIVRANCE": 
        return findValue(carte, ["DELIVRANCE", "delivrance"]);
      case "CONTACT DE RETRAIT": 
        return carte["CONTACT DE RETRAIT"] || '';
      case "DATE DE DELIVRANCE": 
        return carte["DATE DE DELIVRANCE"] || '';
      case "RETIREE": 
        const delivrance = findValue(carte, ["DELIVRANCE", "delivrance"]);
        return delivrance && delivrance.toString().trim() !== '';
      default: 
        return "";
    }
  };

  // ✅ CLIC SUR UNE CELLULE POUR ÉDITION
  const handleCellClick = (rowIndex: number, column: string) => {
    const col = colonnes.find(col => col.key === column);
    if (col?.editable === true && col.type !== "checkbox" && canEdit) {
      const currentValue = getCellValue(localCartes[rowIndex] as unknown as CarteComplete, column);
      setEditValue(currentValue.toString());
      setEditingCell({ rowIndex, column });
    }
  };

  // ✅ MISE À JOUR SIMULTANÉE DES DEUX FORMATS
  const updateBothFormats = (carte: CarteComplete, keyMaj: string, keyMin: string, value: any) => {
    carte[keyMaj] = value;
    carte[keyMin] = value;
  };

  // ✅ FORMATE LES CARTES POUR L'ENVOI AU BACKEND
  const formatCartePourBackend = (carte: CarteComplete): any => {
    console.log('🔄 Formatage pour backend:', carte);
    
    const carteFormatee: any = {
      // ID est obligatoire pour le backend
      ID: carte.ID || carte.id,
      // Format standard attendu par le backend MSSQL
      NOM: carte.NOM || carte.nom || '',
      PRENOMS: carte.PRENOMS || carte.prenoms || '',
      CONTACT: carte.CONTACT || carte.contact || '',
      "LIEU D'ENROLEMENT": carte["LIEU D'ENROLEMENT"] || '',
      "SITE DE RETRAIT": carte["SITE DE RETRAIT"] || '',
      RANGEMENT: carte.RANGEMENT || carte.rangement || '',
      "DATE DE NAISSANCE": carte["DATE DE NAISSANCE"] || '',
      "LIEU NAISSANCE": carte["LIEU NAISSANCE"] || '',
      DELIVRANCE: carte.DELIVRANCE || carte.delivrance || '',
      "CONTACT DE RETRAIT": carte["CONTACT DE RETRAIT"] || '',
      "DATE DE DELIVRANCE": carte["DATE DE DELIVRANCE"] || ''
    };

    console.log('📤 Carte formatée:', carteFormatee);
    return carteFormatee;
  };

  // ✅ MODIFICATION D'UNE CELLULE
  const handleCellChange = (value: any, rowIndex: number, column: string) => {
    if (!canEdit) return;
    
    console.log('🔍 Modification cellule:', { rowIndex, column, value });
    
    const updatedCartes = [...localCartes] as unknown as CarteComplete[];
    const carteToUpdate = { 
      ...updatedCartes[rowIndex],
      // Assurer que l'ID est présent
      ID: updatedCartes[rowIndex].ID || updatedCartes[rowIndex].id,
      id: updatedCartes[rowIndex].id || updatedCartes[rowIndex].ID
    };
    
    switch (column) {
      case "NOM": 
        updateBothFormats(carteToUpdate, "NOM", "nom", value);
        break;
      case "PRENOMS": 
        updateBothFormats(carteToUpdate, "PRENOMS", "prenoms", value);
        break;
      case "CONTACT": 
        updateBothFormats(carteToUpdate, "CONTACT", "contact", value);
        break;
      case "LIEU D'ENROLEMENT": 
        carteToUpdate["LIEU D'ENROLEMENT"] = value; 
        break;
      case "SITE DE RETRAIT": 
        carteToUpdate["SITE DE RETRAIT"] = value; 
        break;
      case "RANGEMENT": 
        updateBothFormats(carteToUpdate, "RANGEMENT", "rangement", value);
        break;
      case "DATE DE NAISSANCE": 
        carteToUpdate["DATE DE NAISSANCE"] = value; 
        break;
      case "LIEU NAISSANCE": 
        carteToUpdate["LIEU NAISSANCE"] = value; 
        break;
      case "DELIVRANCE": 
        updateBothFormats(carteToUpdate, "DELIVRANCE", "delivrance", value);
        break;
      case "CONTACT DE RETRAIT": 
        carteToUpdate["CONTACT DE RETRAIT"] = value; 
        break;
      case "DATE DE DELIVRANCE": 
        carteToUpdate["DATE DE DELIVRANCE"] = value; 
        break;
      case "RETIREE":
        const delivranceValue = value ? "Retirée" : "";
        updateBothFormats(carteToUpdate, "DELIVRANCE", "delivrance", delivranceValue);
        break;
    }
    
    updatedCartes[rowIndex] = carteToUpdate;
    const newCartes = updatedCartes as unknown as Carte[];
    
    console.log('✅ Carte mise à jour:', {
      id: carteToUpdate.ID || carteToUpdate.id,
      NOM: carteToUpdate.NOM,
      PRENOMS: carteToUpdate.PRENOMS,
      DELIVRANCE: carteToUpdate.DELIVRANCE
    });
    
    // Mettre à jour l'état local
    setLocalCartes(newCartes);
    
    // Notifier le parent avec les cartes formatées pour le backend
    const cartesPourBackend = newCartes.map(carte => formatCartePourBackend(carte as unknown as CarteComplete));
    onUpdateCartes(cartesPourBackend as unknown as Carte[]);
  };

  // ✅ SAUVEGARDE DE L'ÉDITION
  const handleSaveEdit = () => {
    if (editingCell && canEdit) {
      handleCellChange(editValue, editingCell.rowIndex, editingCell.column);
      setEditingCell(null);
      setEditValue("");
    }
  };

  // ✅ CHANGEMENT DE CHECKBOX
  const handleCheckboxChange = (rowIndex: number, column: string, checked: boolean) => {
    if (!canEdit) return;
    handleCellChange(checked, rowIndex, column);
  };

  // ✅ FORMATAGE DES DATES
  const formatDate = (dateString: string): string => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  };

  // ✅ VÉRIFICATION DES PERMISSIONS
  const canEditCell = (columnKey: string): boolean => {
    const col = colonnes.find(col => col.key === columnKey);
    return col?.editable === true && canEdit;
  };

  // ✅ AFFICHAGE DES INFORMATIONS DE DEBUG
  const showDebugInfo = process.env.NODE_ENV === 'development';

  // ✅ BADGE DE STATUT DES PERMISSIONS
  interface PermissionBadge {
    text: string;
    color: string;
  }

  const getPermissionBadge = (): PermissionBadge => {
    if (permissions.canEditAll) {
      return { text: "✏️ Édition complète", color: "bg-green-100 text-green-800" };
    } else if (permissions.canModify) {
      return { text: "🔒 Édition limitée", color: "bg-orange-100 text-orange-800" };
    } else {
      return { text: "👀 Consultation seule", color: "bg-gray-100 text-gray-600" };
    }
  };

  const permissionBadge = getPermissionBadge();

  // ✅ COMPTEUR DE CARTES MODIFIÉES
  const cartesModifiees = localCartes.filter((carte, index) => {
    const carteOriginale = cartes[index] as unknown as CarteComplete;
    const carteActuelle = carte as unknown as CarteComplete;
    
    if (!carteOriginale) return false;
    
    const delivranceOriginale = carteOriginale.DELIVRANCE || carteOriginale.delivrance || '';
    const delivranceActuelle = carteActuelle.DELIVRANCE || carteActuelle.delivrance || '';
    
    return delivranceActuelle !== delivranceOriginale;
  });

  // ✅ AFFICHER UN MESSAGE SI AUCUNE DONNÉE
  if (localCartes.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 p-12 text-center text-gray-500"
      >
        <div className="text-4xl mb-3 text-[#F77F00]">📭</div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucune carte à afficher</h3>
        <p className="text-sm">Utilisez la recherche pour trouver des cartes spécifiques.</p>
      </motion.div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
      {/* En-tête du tableau */}
      <div className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">📋</span>
            <div>
              <h3 className="text-lg font-bold">Tableau Excel des Cartes</h3>
              <p className="text-white/90 text-sm">
                {localCartes.length} carte{localCartes.length > 1 ? 's' : ''} • 
                {cartesModifiees.length > 0 && (
                  <span className="ml-2 bg-yellow-500/20 text-yellow-200 px-2 py-0.5 rounded-full text-xs">
                    {cartesModifiees.length} modifiée{cartesModifiees.length > 1 ? 's' : ''}
                  </span>
                )}
                {showDebugInfo && (
                  <span className="ml-2 text-xs opacity-70">Rôle: {role}</span>
                )}
              </p>
            </div>
          </div>
          <div className={`text-sm px-3 py-1 rounded-full font-medium ${permissionBadge.color}`}>
            {permissionBadge.text}
          </div>
        </div>
      </div>

      {/* Tableau avec scroll */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* En-têtes des colonnes */}
          <thead>
            <tr className="bg-gradient-to-r from-[#0077B6] to-[#2E8B57] text-white">
              {showDebugInfo && (
                <th className="px-4 py-3 text-left text-sm font-semibold border-r border-white/20 w-16">
                  ID
                </th>
              )}
              {colonnes.map((col) => (
                <th 
                  key={col.key}
                  className={`px-4 py-3 text-left text-sm font-semibold border-r border-white/20 ${col.width} ${
                    col.editable !== true ? "opacity-80" : ""
                  }`}
                  title={col.editable !== true ? "Non éditable" : ""}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {col.editable !== true && (
                      <span className="text-xs opacity-70">🔒</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          {/* Corps du tableau */}
          <tbody>
            <AnimatePresence>
              {localCartes.map((carte, rowIndex) => {
                const carteComplete = carte as unknown as CarteComplete;
                const isRetiree = getCellValue(carteComplete, "RETIREE");
                const carteId = carteComplete.ID || carteComplete.id || rowIndex;
                
                return (
                  <motion.tr 
                    key={carteId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, delay: rowIndex * 0.02 }}
                    className={`border-b border-gray-100 transition-all duration-200 ${
                      isRetiree
                        ? "bg-green-50/50 hover:bg-green-100/50" 
                        : "bg-white hover:bg-orange-50/30"
                    } ${!canEdit ? "cursor-default" : ""}`}
                  >
                    {/* Colonne ID pour debug */}
                    {showDebugInfo && (
                      <td className="px-4 py-3 text-sm border-r border-gray-100 w-16 text-center bg-gray-50">
                        <span className="text-xs text-gray-500 font-mono">
                          {carteId}
                        </span>
                      </td>
                    )}
                    
                    {colonnes.map((col) => {
                      const cellValue = getCellValue(carteComplete, col.key);
                      const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.column === col.key;
                      const editable = canEditCell(col.key);
                      const cellKey = `${carteId}-${col.key}`;
                      
                      return (
                        <motion.td 
                          key={cellKey}
                          whileHover={editable && col.type !== "checkbox" ? { scale: 1.02 } : {}}
                          className={`px-4 py-3 text-sm border-r border-gray-100 ${col.width} ${
                            col.type === "checkbox" ? "text-center" : ""
                          } ${!editable ? "bg-gray-50/30" : ""}`}
                          onClick={() => editable && handleCellClick(rowIndex, col.key)}
                        >
                          {col.type === "checkbox" ? (
                            <motion.div 
                              className="flex justify-center"
                              whileHover={editable ? { scale: 1.1 } : {}}
                              whileTap={editable ? { scale: 0.9 } : {}}
                            >
                              <input
                                type="checkbox"
                                checked={!!cellValue}
                                onChange={(e) => handleCheckboxChange(rowIndex, col.key, e.target.checked)}
                                disabled={!editable}
                                className={`h-5 w-5 rounded-lg border-2 focus:ring-2 focus:ring-offset-1 transition-all ${
                                  cellValue 
                                    ? "bg-[#2E8B57] border-[#2E8B57] text-white focus:ring-green-200" 
                                    : "bg-white border-gray-300 focus:ring-orange-200"
                                } ${
                                  !editable 
                                    ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-200" 
                                    : "cursor-pointer"
                                }`}
                              />
                            </motion.div>
                          ) : isEditing ? (
                            <motion.input
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={handleSaveEdit}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit();
                                else if (e.key === 'Escape') {
                                  setEditingCell(null);
                                  setEditValue("");
                                }
                              }}
                              className="w-full px-3 py-2 border-2 border-[#F77F00] rounded-xl bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-orange-200 text-gray-800 font-medium"
                              autoFocus
                            />
                          ) : (
                            <motion.div 
                              className={`min-h-8 flex items-center truncate rounded-lg px-2 py-1 transition-all duration-200 ${
                                editable ? "cursor-pointer hover:bg-orange-100/50 hover:border hover:border-orange-200" : "cursor-default"
                              } ${
                                !editable ? "text-gray-500 bg-gray-50/50" : "text-gray-800"
                              }`}
                            >
                              {col.key.includes("DATE") ? (
                                <span className={`font-medium ${cellValue ? "text-[#0077B6]" : "text-gray-400"}`}>
                                  {formatDate(cellValue)}
                                </span>
                              ) : col.key === "DELIVRANCE" && cellValue ? (
                                <span className="text-[#2E8B57] font-semibold flex items-center gap-1">
                                  <span>✓</span>
                                  <span>{cellValue}</span>
                                </span>
                              ) : cellValue ? (
                                <span className={editable ? "font-medium" : ""}>{cellValue.toString()}</span>
                              ) : (
                                <span className="text-gray-400 italic">-</span>
                              )}
                              {!editable && col.editable === true && (
                                <span className="ml-1 text-xs text-gray-400">🔒</span>
                              )}
                            </motion.div>
                          )}
                        </motion.td>
                      );
                    })}
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pied de tableau informatif */}
      <div className="bg-gray-50/80 border-t border-gray-200 px-6 py-3">
        <div className="flex justify-between items-center text-xs text-gray-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-[#F77F00] rounded-full"></div>
              Cellules éditables
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-[#2E8B57] rounded-full"></div>
              Cartes retirées
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              Cellules verrouillées
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>{localCartes.length} carte{localCartes.length > 1 ? 's' : ''}</span>
            {cartesModifiees.length > 0 && (
              <span className="text-[#F77F00] font-semibold">
                • {cartesModifiees.length} modifiée{cartesModifiees.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        
        {/* Instructions pour l'utilisateur */}
        {permissions.canModify && canEdit && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              <span className="font-medium text-[#F77F00]">Instructions :</span> 
              Cliquez sur une cellule pour éditer, utilisez <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Entrée</kbd> pour sauvegarder, 
              <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs ml-1">Échap</kbd> pour annuler. 
              <span className="ml-2">Les modifications sont automatiquement enregistrées.</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableCartesExcel;