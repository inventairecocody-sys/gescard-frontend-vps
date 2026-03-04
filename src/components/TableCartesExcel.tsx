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
} from "@heroicons/react/24/outline";

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
  editFields = [],
}) => {
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    field: string;
  } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [localCartes, setLocalCartes] = useState<Carte[]>(cartes);

  // Responsive
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Mettre à jour les cartes locales quand les props changent
  useEffect(() => {
    setLocalCartes(cartes);
  }, [cartes]);

  // Configuration des permissions basée sur le rôle passé en props
  const isChefEquipe = role === "Chef d'équipe";
  const isOperateur = role === "Opérateur";

  // Champs autorisés pour Chef d'équipe
  const chefEquipeFields = ["delivrance", "contactRetrait", "dateDelivrance"];

  // Vérifier si un champ est éditable
  const isFieldEditable = (field: string): boolean => {
    if (!canEdit) return false;
    if (isOperateur) return false;
    if (isChefEquipe) {
      return chefEquipeFields.includes(field);
    }
    if (editFields && editFields.length > 0) {
      return editFields.includes(field);
    }
    return true; // Admin/Gestionnaire : tous les champs
  };

  // ✅ CORRECTION : Colonnes dans l'ordre demandé + champ contact ajouté + telephone supprimé
  const colonnes = [
    { key: "coordination",   label: "Coordination",      icon: BuildingOfficeIcon, width: "w-28 md:w-36" },
    { key: "lieuEnrolement", label: "Lieu d'enr.",       icon: MapPinIcon,         width: "w-28 md:w-36" },
    { key: "siteRetrait",    label: "Site retrait",      icon: MapPinIcon,         width: "w-28 md:w-36" },
    { key: "rangement",      label: "Rangement",         icon: DocumentTextIcon,   width: "w-24 md:w-28" },
    { key: "nom",            label: "Nom",               icon: UserIcon,           width: "w-24 md:w-28" },
    { key: "prenom",         label: "Prénoms",           icon: UserIcon,           width: "w-28 md:w-36" },
    { key: "dateNaissance",  label: "Date naiss.",       icon: CalendarIcon,       width: "w-24 md:w-28" },
    { key: "lieuNaissance",  label: "Lieu naiss.",       icon: MapPinIcon,         width: "w-28 md:w-32" },
    { key: "contact",        label: "Contact",           icon: PhoneIcon,          width: "w-24 md:w-28" },
    { key: "delivrance",     label: "Délivrance",        icon: CheckCircleIcon,    width: "w-32 md:w-40" },
    { key: "contactRetrait", label: "Contact retrait",   icon: PhoneIcon,          width: "w-28 md:w-32" },
    { key: "dateDelivrance", label: "Date délivrance",   icon: CalendarIcon,       width: "w-28 md:w-32" },
  ];

  // ✅ CORRECTION : getCellValue utilise les bonnes clés issues du mapping Inventaire.tsx
  // delivrance est un champ texte en base (pas un booléen)
  const getCellValue = (carte: Carte, field: string): string => {
    const c = carte as any;
    switch (field) {
      case "coordination":   return c.coordination   || "";
      case "lieuEnrolement": return c.lieuEnrolement || "";
      case "siteRetrait":    return c.siteRetrait    || "";
      case "rangement":      return c.rangement      || "";
      case "nom":            return c.nom            || "";
      case "prenom":         return c.prenom         || ""; // mappé depuis DB "prenoms"
      case "contact":        return c.contact        || ""; // ✅ champ contact direct
      case "lieuNaissance":  return c.lieuNaissance  || "";
      case "dateNaissance":  return c.dateNaissance  || "";
      case "delivrance":     return c.delivrance     || ""; // ✅ texte brut, pas booléen
      case "contactRetrait": return c.contactRetrait || "";
      case "dateDelivrance": return c.dateDelivrance || "";
      default:               return "";
    }
  };

  // Clic sur une cellule pour édition
  const handleCellClick = (rowIndex: number, field: string) => {
    if (!isFieldEditable(field)) return;
    const currentValue = getCellValue(localCartes[rowIndex], field);
    setEditValue(currentValue);
    setEditingCell({ rowIndex, field });
  };

  // ✅ CORRECTION : handleSaveEdit — delivrance est du texte, pas un booléen
  const handleSaveEdit = () => {
    if (!editingCell) return;
    const { rowIndex, field } = editingCell;
    const updatedCartes = [...localCartes];
    updatedCartes[rowIndex] = {
      ...updatedCartes[rowIndex],
      [field]: editValue,
    };
    setLocalCartes(updatedCartes);
    onUpdateCartes(updatedCartes);
    setEditingCell(null);
    setEditValue("");
  };

  // Formatage des dates
  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString("fr-FR");
    } catch {
      return dateString;
    }
  };

  // Compter les modifications
  const cartesModifiees = localCartes.filter((carte, index) => {
    const originale = cartes[index];
    if (!originale) return false;
    return chefEquipeFields.some(
      (field) =>
        (carte as any)[field] !== (originale as any)[field]
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
        <h3
          className={`font-semibold text-gray-600 mb-2 ${
            isMobile ? "text-base" : "text-lg"
          }`}
        >
          Aucune carte à afficher
        </h3>
        <p className={`text-gray-500 ${isMobile ? "text-xs" : "text-sm"}`}>
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
            <DocumentTextIcon className={`${isMobile ? "w-5 h-5" : "w-6 h-6"}`} />
            <div>
              <h3 className={`font-bold ${isMobile ? "text-sm" : "text-base"}`}>
                Résultats
              </h3>
              <p className={`text-white/90 ${isMobile ? "text-xs" : "text-sm"}`}>
                {localCartes.length} carte{localCartes.length > 1 ? "s" : ""}
                {cartesModifiees.length > 0 && (
                  <span className="ml-2 bg-yellow-500/20 text-yellow-200 px-2 py-0.5 rounded-full text-xs">
                    {cartesModifiees.length} modif.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Badge permissions */}
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              isOperateur
                ? "bg-gray-500/20 text-gray-200"
                : isChefEquipe
                ? "bg-orange-500/20 text-orange-200"
                : "bg-green-500/20 text-green-200"
            }`}
          >
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
                      <Icon className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} flex-shrink-0`} />
                      <span className="truncate">{col.label}</span>
                      {!editable && (
                        <LockClosedIcon
                          className={`${isMobile ? "w-2 h-2" : "w-3 h-3"} opacity-70 flex-shrink-0`}
                        />
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
                  // ✅ CORRECTION : delivrance est du texte, on vérifie s'il est non vide
                  className={`border-b border-gray-100 transition-colors ${
                    (carte as any).delivrance
                      ? "bg-green-50/50 hover:bg-green-100/50"
                      : "hover:bg-orange-50/30"
                  }`}
                >
                  {colonnes.map((col) => {
                    const cellValue = getCellValue(carte, col.key);
                    const isEditing =
                      editingCell?.rowIndex === rowIndex &&
                      editingCell?.field === col.key;
                    const editable = isFieldEditable(col.key);
                    const displayValue = col.key.includes("date")
                      ? formatDate(cellValue)
                      : cellValue;

                    return (
                      <td
                        key={col.key}
                        // ✅ CORRECTION : fond jaune + bordure visible sur toute la cellule en édition
                        className={`px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm border-r border-gray-100 ${col.width} ${
                          isEditing
                            ? "bg-amber-50 ring-2 ring-inset ring-orange-400"
                            : ""
                        }`}
                        onClick={() =>
                          editable && !isEditing && handleCellClick(rowIndex, col.key)
                        }
                      >
                        {isEditing ? (
                          // ✅ CORRECTION : input bien visible avec fond blanc et bordure orange
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleSaveEdit}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveEdit();
                              else if (e.key === "Escape") setEditingCell(null);
                            }}
                            className="w-full px-2 py-1 border-2 border-orange-500 rounded-lg bg-white focus:outline-none focus:border-orange-600 text-xs md:text-sm font-medium shadow-inner"
                            autoFocus
                          />
                        ) : col.key === "delivrance" ? (
                          // ✅ CORRECTION : délivrance affichée en texte brut, pas en checkbox
                          <div
                            className={`flex items-center gap-1 ${
                              editable
                                ? "cursor-pointer hover:bg-orange-100/50 rounded px-1"
                                : ""
                            }`}
                          >
                            {cellValue ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-medium text-xs">
                                <CheckIcon className="w-3 h-3 flex-shrink-0" />
                                {cellValue}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs italic">
                                Non délivré
                              </span>
                            )}
                            {editable && (
                              <PencilIcon className="w-3 h-3 text-orange-400 ml-auto flex-shrink-0" />
                            )}
                          </div>
                        ) : (
                          <div
                            className={`flex items-center justify-between ${
                              editable
                                ? "cursor-pointer hover:bg-orange-100/50 rounded px-1"
                                : ""
                            }`}
                          >
                            <span
                              className={`truncate ${
                                !cellValue ? "text-gray-300 italic text-xs" : ""
                              }`}
                            >
                              {displayValue || "—"}
                            </span>
                            {editable && (
                              <PencilIcon className="w-3 h-3 text-orange-300 flex-shrink-0 ml-1" />
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
              <span className={isMobile ? "text-[10px]" : ""}>Éditable</span>
            </span>
            {/* ✅ CORRECTION : libellé "Délivré" au lieu de "Retirée" */}
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-[#2E8B57] rounded-full"></div>
              <span className={isMobile ? "text-[10px]" : ""}>Délivré</span>
            </span>
            <span className="flex items-center gap-1">
              <LockClosedIcon className="w-3 h-3 text-gray-400" />
              <span className={isMobile ? "text-[10px]" : ""}>Verrouillé</span>
            </span>
          </div>

          {/* Compteur */}
          <div className="text-gray-500">
            {localCartes.length} ligne{localCartes.length > 1 ? "s" : ""}
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
            <p
              className={`text-gray-500 flex items-center gap-1 ${
                isMobile ? "text-[10px]" : "text-xs"
              }`}
            >
              <PencilIcon className="w-3 h-3" />
              Cliquez sur une cellule pour modifier
              {isChefEquipe && (
                <span className="ml-2 text-orange-600">(3 champs autorisés)</span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableCartesExcel;