// src/pages/Inventaire.tsx
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import TableCartesExcel from "../components/TableCartesExcel";
import ImportModal from "../components/ImportModal";
import SiteDropdown from "../components/SiteDropdown";
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { CartesService } from '../Services/api/cartes';
import { ImportExportService } from '../Services/api/import-export';
import type { QueryParams } from '../types';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ArrowPathIcon,
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  TableCellsIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  IdentificationIcon,
  BuildingOfficeIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

interface CriteresRecherche {
  coordination: string;
  lieuEnrolement: string;
  siteRetrait: string;
  rangement: string;
  nom: string;
  prenoms: string;
  lieuNaissance: string;
  dateNaissance: string;
  delivrance: string;
  dateDelivrance: string;
  contactRetrait: string;
}

interface ExportProgress {
  percentage: number;
  loaded: number;
  total: number;
  speed: string;
  estimatedTime: string;
}

// ✅ CORRECTION : interface alignée exactement sur ce que retourne le backend
// Le backend retourne : prenoms (avec s), contact, lieuEnrolement, siteRetrait, etc.
interface CarteEtendue {
  id: number;
  coordination: string;
  lieuEnrolement: string;
  siteRetrait: string;
  rangement: string;
  nom: string;
  // ✅ "prenoms" avec s = nom réel de la colonne en base de données
  prenoms: string;
  dateNaissance: string;
  lieuNaissance: string;
  // ✅ "contact" est une colonne directe en base (numéro de téléphone)
  contact: string;
  // ✅ "delivrance" est une string brute en BDD (vide = non délivré, sinon nom livreur / mention)
  delivrance: string;
  contactRetrait: string;
  dateDelivrance: string;
  dateCreation: string;
  dateModification?: string;
  createurId?: number;
  moderateurId?: number;
}

const Inventaire: React.FC = () => {
  const { user, hasRole } = useAuth();
  const { canImport, canExport } = usePermissions();
  
  const isChefEquipe = hasRole(["Chef d'équipe"]);
  const isOperateur = hasRole(['Opérateur']);

  const [resultats, setResultats] = useState<CarteEtendue[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [hasModifications, setHasModifications] = useState(false);
  const [totalResultats, setTotalResultats] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importMode, setImportMode] = useState<'standard' | 'smart'>('standard');
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    percentage: 0,
    loaded: 0,
    total: 0,
    speed: '0 KB/s',
    estimatedTime: ''
  });
  
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const [criteres, setCriteres] = useState<CriteresRecherche>({
    coordination: "",
    lieuEnrolement: "",
    siteRetrait: "",
    rangement: "",
    nom: "",
    prenoms: "",
    lieuNaissance: "",
    dateNaissance: "",
    delivrance: "",
    dateDelivrance: "",
    contactRetrait: ""
  });

  const [showFilters, setShowFilters] = useState(true);
  const exportStartTimeRef = useRef<number>(0);
  const currentExportFormat = useRef<'csv' | 'excel'>('csv');
  // ✅ Snapshot des cartes au moment du chargement — pour détecter les vraies modifications
  const cartesOriginalesRef = useRef<CarteEtendue[]>([]);

  useEffect(() => {
    const checkScreen = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const containerClass = isMobile ? 'px-3 py-4' : isTablet ? 'px-6 py-6' : 'container mx-auto px-4 py-8';
  const titleSize = isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl';
  const textSize = isMobile ? 'text-xs' : isTablet ? 'text-sm' : 'text-base';
  const inputSize = isMobile ? 'px-3 py-2 text-sm' : isTablet ? 'px-4 py-2.5' : 'px-4 py-3';
  const buttonSize = isMobile ? 'px-3 py-2 text-xs' : isTablet ? 'px-4 py-2.5 text-sm' : 'px-4 py-3';
  const iconSize = isMobile ? 'w-4 h-4' : isTablet ? 'w-5 h-5' : 'w-5 h-5';
  const gridCols = isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-3';

  const handleRecherche = async (page: number = 1) => {
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

      // ✅ CORRECTION MAPPING COMPLET
      // Le backend retourne les colonnes avec aliases camelCase via SELECT ... AS "..."
      // - "LIEU D'ENROLEMENT" → lieuEnrolement
      // - "SITE DE RETRAIT"   → siteRetrait
      // - "LIEU NAISSANCE"    → lieuNaissance
      // - "DATE DE NAISSANCE" → dateNaissance (formaté YYYY-MM-DD)
      // - "CONTACT DE RETRAIT"→ contactRetrait
      // - "DATE DE DELIVRANCE"→ dateDelivrance (formaté YYYY-MM-DD)
      // - prenoms             → prenoms (colonne directe, avec s)
      // - contact             → contact (colonne directe)
      // - delivrance          → delivrance (string brute, vide = non délivré)
      const cartesConverties: CarteEtendue[] = response.data.map((carte: any) => ({
        id:             carte.id,
        coordination:   carte.coordination   || '',
        lieuEnrolement: carte.lieuEnrolement || carte["LIEU D'ENROLEMENT"] || '',
        siteRetrait:    carte.siteRetrait    || carte["SITE DE RETRAIT"]   || '',
        rangement:      carte.rangement      || '',
        nom:            carte.nom            || '',
        // ✅ prenoms avec s — colonne directe retournée telle quelle par le backend
        prenoms:        carte.prenoms        || carte.prenom               || '',
        dateNaissance:  carte.dateNaissance  || carte["DATE DE NAISSANCE"] || '',
        lieuNaissance:  carte.lieuNaissance  || carte["LIEU NAISSANCE"]    || '',
        // ✅ contact — colonne directe retournée telle quelle par le backend
        contact:        carte.contact        || '',
        // ✅ delivrance — string brute de la BDD
        // Ne pas convertir en boolean ! La valeur peut être :
        // '' ou null → non délivré
        // 'OUI' / 'DELIVRE' → délivré simplement
        // 'Jean Koua' → nom de la personne qui a délivré
        delivrance:     carte.delivrance != null ? String(carte.delivrance) : '',
        contactRetrait: carte.contactRetrait || carte["CONTACT DE RETRAIT"] || '',
        dateDelivrance: carte.dateDelivrance || carte["DATE DE DELIVRANCE"]  || '',
        dateCreation:   carte.dateCreation   || carte.dateimport             || new Date().toISOString(),
        dateModification: carte.dateModification,
        createurId:     carte.createurId,
        moderateurId:   carte.moderateurId,
      }));

      setResultats(cartesConverties);
      // ✅ Sauvegarder une copie profonde comme référence pour détecter les modifications
      cartesOriginalesRef.current = cartesConverties.map((c) => ({ ...c }));
      setTotalResultats(response.pagination.total);
      setCurrentPage(response.pagination.page);
      setTotalPages(response.pagination.totalPages);
      setHasModifications(false);
      
    } catch (error) {
      console.error("Erreur recherche:", error);
      setResultats([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Mapping camelCase (frontend) → noms réels de colonnes en base de données
  // Le backend updateCarte fait `"${key}" = $n` directement, il faut donc les vrais noms
  const toDbColumns = (carte: Partial<CarteEtendue>): Record<string, any> => {
    const mapped: Record<string, any> = {};
    if (carte.lieuEnrolement !== undefined) mapped["LIEU D'ENROLEMENT"] = carte.lieuEnrolement;
    if (carte.siteRetrait    !== undefined) mapped["SITE DE RETRAIT"]    = carte.siteRetrait;
    if (carte.rangement      !== undefined) mapped["rangement"]           = carte.rangement;
    if (carte.nom            !== undefined) mapped["nom"]                 = carte.nom;
    if (carte.prenoms        !== undefined) mapped["prenoms"]             = carte.prenoms;
    if (carte.dateNaissance  !== undefined) mapped["DATE DE NAISSANCE"]   = carte.dateNaissance  || null;
    if (carte.lieuNaissance  !== undefined) mapped["LIEU NAISSANCE"]      = carte.lieuNaissance;
    if (carte.contact        !== undefined) mapped["contact"]             = carte.contact;
    if (carte.delivrance     !== undefined) mapped["delivrance"]          = carte.delivrance;
    if (carte.contactRetrait !== undefined) mapped["CONTACT DE RETRAIT"]  = carte.contactRetrait;
    if (carte.dateDelivrance !== undefined) mapped["DATE DE DELIVRANCE"]  = carte.dateDelivrance || null;
    if (carte.coordination   !== undefined) mapped["coordination"]        = carte.coordination;
    return mapped;
  };

  const handleSaveModifications = async () => {
    try {
      // Comparer chaque carte avec l'original pour n'envoyer que les cartes vraiment modifiées
      const cartesModifiees = resultats.filter((carte, index) => {
        const originale = cartesOriginalesRef.current[index];
        if (!originale) return false;
        return (
          carte.delivrance     !== originale.delivrance     ||
          carte.contactRetrait !== originale.contactRetrait ||
          carte.dateDelivrance !== originale.dateDelivrance ||
          carte.nom            !== originale.nom            ||
          carte.prenoms        !== originale.prenoms        ||
          carte.rangement      !== originale.rangement      ||
          carte.lieuEnrolement !== originale.lieuEnrolement ||
          carte.siteRetrait    !== originale.siteRetrait
        );
      });
      
      if (cartesModifiees.length === 0) {
        alert('Aucune modification à sauvegarder');
        return;
      }

      for (const carte of cartesModifiees) {
        // ✅ Convertir en noms de colonnes réels avant d'envoyer au backend
        let payload: Record<string, any>;

        if (isChefEquipe) {
          // Chef d'équipe : seulement les 3 champs autorisés
          payload = toDbColumns({
            delivrance:     carte.delivrance,
            contactRetrait: carte.contactRetrait,
            dateDelivrance: carte.dateDelivrance,
          });
        } else {
          // Autres rôles : toutes les colonnes
          payload = toDbColumns(carte);
        }

        await CartesService.updateCarte(carte.id, payload);
      }
      
      setHasModifications(false);
      alert(`${cartesModifiees.length} modification(s) enregistrée(s) avec succès !`);
      
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      alert("Erreur lors de l'enregistrement");
    }
  };

  const handleImport = async (file: File) => {
    setImportLoading(true);
    try {
      const result = await ImportExportService.importFile(file, importMode);

      const imported = result.stats?.imported ?? 0;
      const updated  = result.stats?.updated  ?? 0;
      const errors   = result.stats?.errors   ?? 0;

      const msg = [
        `✅ Import terminé !`,
        `• ${imported} nouvelle(s) carte(s)`,
        `• ${updated} mise(s) à jour`,
        errors > 0 ? `• ⚠️ ${errors} erreur(s)` : null,
      ].filter(Boolean).join('\n');

      alert(msg);
      setShowImportModal(false);

      if (imported > 0 || updated > 0) {
        handleRecherche(currentPage);
      }

    } catch (error: any) {
      console.error('Erreur import:', error);
      const msg = error.response?.data?.message || error.response?.data?.erreur || error.message || "Erreur lors de l'import";
      alert(`❌ ${msg}`);
    } finally {
      setImportLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    if (!canExport()) return;
    
    currentExportFormat.current = format;
    setExportLoading(true);
    setShowProgressModal(true);
    exportStartTimeRef.current = Date.now();
    
    setExportProgress({
      percentage: 0, loaded: 0, total: 0,
      speed: '0 KB/s', estimatedTime: 'Calcul...'
    });

    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev.percentage >= 80) return prev;
        return { ...prev, percentage: prev.percentage + 5, estimatedTime: 'En cours...' };
      });
    }, 600);

    try {
      const blob = await ImportExportService.exportComplete(format);

      clearInterval(interval);

      setExportProgress({
        percentage: 100, loaded: blob.size, total: blob.size,
        speed: '—', estimatedTime: 'Terminé'
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().split('T')[0];
      a.download = `export-cartes-${timestamp}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setTimeout(() => setShowProgressModal(false), 1000);

    } catch (error: any) {
      clearInterval(interval);
      console.error('Erreur export:', error);
      setShowProgressModal(false);
      const msg = error.response?.data?.message || error.response?.data?.erreur || error.message || "Erreur lors de l'export";
      alert(`❌ ${msg}`);
    } finally {
      setExportLoading(false);
    }
  };

  const handleDownloadTemplate = async (format: 'csv' | 'excel') => {
    try {
      if (format === 'csv') {
        const csvTemplate = `COORDINATION,LIEU_ENROLEMENT,SITE_RETRAIT,RANGEMENT,NOM,PRENOMS,LIEU_NAISSANCE,DATE_NAISSANCE,DELIVRANCE,DATE_DELIVRANCE,CONTACT_RETRAIT
COORDINATION NORD,ABIDJAN,SITE PRINCIPAL,A-01,KOUAME,JEAN,ABIDJAN,1990-01-01,OUI,2024-01-01,0708091011
COORDINATION SUD,YAMOUSSOUKRO,SECONDAIRE,B-02,TRAORE,AMINA,BOUAKE,1995-05-15,NON,,0607080910`;
        
        const blob = new Blob([csvTemplate], { type: 'text/csv;charset=utf-8;' });
        const url  = window.URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = 'template-import-cartes.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
      alert(`Template ${format.toUpperCase()} téléchargé !`);
    } catch (error) {
      console.error('Erreur téléchargement template:', error);
    }
  };

  const handleUpdateResultats = (nouvellesCartes: CarteEtendue[]) => {
    setResultats(nouvellesCartes);
    setHasModifications(true);
  };

  const handleReset = () => {
    setCriteres({
      coordination: "", lieuEnrolement: "", siteRetrait: "", rangement: "",
      nom: "", prenoms: "", lieuNaissance: "", dateNaissance: "",
      delivrance: "", dateDelivrance: "", contactRetrait: ""
    });
    setResultats([]);
    setTotalResultats(0);
    setCurrentPage(1);
    setTotalPages(1);
  };

  const handleSiteChange = (value: string | string[]) => {
    setCriteres({...criteres, siteRetrait: value as string});
  };

  const handlePageChange = (newPage: number) => {
    if (hasModifications) {
      const confirmChange = window.confirm(
        "Des modifications non sauvegardées. Continuer sans sauvegarder ?"
      );
      if (!confirmChange) return;
    }
    handleRecherche(newPage);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar />
      
      <div className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white py-4 shadow-lg">
        <div className={containerClass}>
          <h1 className={`${titleSize} font-bold`}>Inventaire des Cartes</h1>
          <p className={`text-white/90 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {user?.coordination || 'COORDINATION'}
          </p>
        </div>
      </div>

      <div className={containerClass}>
        
        {/* Critères de recherche */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 p-4 md:p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-gradient-to-r from-[#F77F00] to-[#FF9E40] rounded-xl flex items-center justify-center`}>
                <MagnifyingGlassIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-white`} />
              </div>
              <h2 className={`font-bold text-gray-800 ${isMobile ? 'text-base' : 'text-xl'}`}>
                Recherche avancée
              </h2>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`${buttonSize} bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center gap-2 transition-colors`}
            >
              <FunnelIcon className={iconSize} />
              {!isMobile && (showFilters ? 'Masquer' : 'Filtres')}
            </button>
          </div>
          
          {showFilters && (
            <div className={`grid ${gridCols} gap-3 md:gap-4 mb-4 md:mb-6`}>
              
              <div>
                <label className={`block font-medium text-gray-700 mb-1 ${isMobile ? 'text-xs' : 'text-sm'} flex items-center gap-1`}>
                  <BuildingOfficeIcon className="w-3 h-3 text-orange-500" />
                  COORDINATION
                </label>
                <input type="text" value={criteres.coordination}
                  onChange={(e) => setCriteres({...criteres, coordination: e.target.value})}
                  placeholder="Coordination..."
                  className={`w-full bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 ${inputSize}`}
                />
              </div>

              <div>
                <label className={`block font-medium text-gray-700 mb-1 ${isMobile ? 'text-xs' : 'text-sm'} flex items-center gap-1`}>
                  <MapPinIcon className="w-3 h-3 text-orange-500" />
                  LIEU D'ENROLEMENT
                </label>
                <input type="text" value={criteres.lieuEnrolement}
                  onChange={(e) => setCriteres({...criteres, lieuEnrolement: e.target.value})}
                  placeholder="Lieu d'enrolement..."
                  className={`w-full bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 ${inputSize}`}
                />
              </div>

              <div>
                <label className={`block font-medium text-gray-700 mb-1 ${isMobile ? 'text-xs' : 'text-sm'} flex items-center gap-1`}>
                  <GlobeAltIcon className="w-3 h-3 text-orange-500" />
                  SITE DE RETRAIT
                </label>
                <SiteDropdown 
                  multiple={false}
                  selectedSites={criteres.siteRetrait}
                  onChange={handleSiteChange}
                  placeholder="Sélectionner un site de retrait"
                  className="w-full"
                />
              </div>

              <div>
                <label className={`block font-medium text-gray-700 mb-1 ${isMobile ? 'text-xs' : 'text-sm'} flex items-center gap-1`}>
                  <IdentificationIcon className="w-3 h-3 text-orange-500" />
                  RANGEMENT
                </label>
                <input type="text" value={criteres.rangement}
                  onChange={(e) => setCriteres({...criteres, rangement: e.target.value})}
                  placeholder="N° de rangement..."
                  className={`w-full bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 ${inputSize}`}
                />
              </div>

              <div>
                <label className={`block font-medium text-gray-700 mb-1 ${isMobile ? 'text-xs' : 'text-sm'} flex items-center gap-1`}>
                  <UserIcon className="w-3 h-3 text-orange-500" />
                  NOM
                </label>
                <input type="text" value={criteres.nom}
                  onChange={(e) => setCriteres({...criteres, nom: e.target.value})}
                  placeholder="Nom..."
                  className={`w-full bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 ${inputSize}`}
                />
              </div>

              <div>
                <label className={`block font-medium text-gray-700 mb-1 ${isMobile ? 'text-xs' : 'text-sm'} flex items-center gap-1`}>
                  <UserIcon className="w-3 h-3 text-orange-500" />
                  PRÉNOMS
                </label>
                <input type="text" value={criteres.prenoms}
                  onChange={(e) => setCriteres({...criteres, prenoms: e.target.value})}
                  placeholder="Prénoms..."
                  className={`w-full bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 ${inputSize}`}
                />
              </div>

              <div>
                <label className={`block font-medium text-gray-700 mb-1 ${isMobile ? 'text-xs' : 'text-sm'} flex items-center gap-1`}>
                  <MapPinIcon className="w-3 h-3 text-orange-500" />
                  LIEU NAISSANCE
                </label>
                <input type="text" value={criteres.lieuNaissance}
                  onChange={(e) => setCriteres({...criteres, lieuNaissance: e.target.value})}
                  placeholder="Lieu de naissance..."
                  className={`w-full bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 ${inputSize}`}
                />
              </div>

              <div>
                <label className={`block font-medium text-gray-700 mb-1 ${isMobile ? 'text-xs' : 'text-sm'} flex items-center gap-1`}>
                  <CalendarIcon className="w-3 h-3 text-orange-500" />
                  DATE DE NAISSANCE
                </label>
                <input type="date" value={criteres.dateNaissance}
                  onChange={(e) => setCriteres({...criteres, dateNaissance: e.target.value})}
                  className={`w-full bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 ${inputSize}`}
                />
              </div>

              <div>
                <label className={`block font-medium text-gray-700 mb-1 ${isMobile ? 'text-xs' : 'text-sm'} flex items-center gap-1`}>
                  <CheckCircleIcon className="w-3 h-3 text-orange-500" />
                  DÉLIVRANCE
                </label>
                <select value={criteres.delivrance}
                  onChange={(e) => setCriteres({...criteres, delivrance: e.target.value})}
                  className={`w-full bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 ${inputSize}`}
                >
                  <option value="">Tous</option>
                  <option value="oui">Délivrées</option>
                  <option value="non">Non délivrées</option>
                </select>
              </div>

              <div>
                <label className={`block font-medium text-gray-700 mb-1 ${isMobile ? 'text-xs' : 'text-sm'} flex items-center gap-1`}>
                  <CalendarIcon className="w-3 h-3 text-orange-500" />
                  DATE DE DÉLIVRANCE
                </label>
                <input type="date" value={criteres.dateDelivrance}
                  onChange={(e) => setCriteres({...criteres, dateDelivrance: e.target.value})}
                  className={`w-full bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 ${inputSize}`}
                />
              </div>

              <div>
                <label className={`block font-medium text-gray-700 mb-1 ${isMobile ? 'text-xs' : 'text-sm'} flex items-center gap-1`}>
                  <PhoneIcon className="w-3 h-3 text-orange-500" />
                  CONTACT DE RETRAIT
                </label>
                <input type="text" value={criteres.contactRetrait}
                  onChange={(e) => setCriteres({...criteres, contactRetrait: e.target.value})}
                  placeholder="Contact de retrait..."
                  className={`w-full bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 ${inputSize}`}
                />
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <motion.button
              onClick={() => handleRecherche(1)}
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white rounded-xl hover:from-[#e46f00] hover:to-[#FF8C00] disabled:opacity-50 font-semibold transition-all shadow-lg ${buttonSize} px-8 flex items-center justify-center gap-2`}
            >
              {loading ? (
                <><ArrowPathIcon className={`${iconSize} animate-spin`} /><span>Recherche...</span></>
              ) : (
                <><MagnifyingGlassIcon className={iconSize} /><span>Rechercher</span></>
              )}
            </motion.button>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-4 border-t border-gray-200 mt-4">
            <div className="flex gap-2">
              <motion.button onClick={handleReset} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className={`${buttonSize} text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium flex items-center gap-2`}
              >
                <ArrowPathIcon className={iconSize} />
                {!isMobile && 'Réinitialiser'}
              </motion.button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {canImport() && (
                <motion.button onClick={() => setShowImportModal(true)} disabled={importLoading}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className={`${buttonSize} bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all font-medium flex items-center gap-2 shadow-lg`}
                >
                  {importLoading ? (
                    <><ArrowPathIcon className={`${iconSize} animate-spin`} /><span>Import...</span></>
                  ) : (
                    <><DocumentArrowUpIcon className={iconSize} /><span>Importer</span></>
                  )}
                </motion.button>
              )}
              
              {canExport() && (
                <motion.button onClick={() => handleExport('csv')} disabled={exportLoading}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className={`${buttonSize} bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all font-medium flex items-center gap-2 shadow-lg`}
                >
                  <DocumentTextIcon className={iconSize} />
                  CSV
                </motion.button>
              )}
              
              {canExport() && (
                <motion.button onClick={() => handleExport('excel')} disabled={exportLoading}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className={`${buttonSize} bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 transition-all font-medium flex items-center gap-2 shadow-lg`}
                >
                  <TableCellsIcon className={iconSize} />
                  Excel
                </motion.button>
              )}
              
              {canImport() && (
                <div className="relative group">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className={`${buttonSize} text-blue-600 bg-white border border-blue-300 rounded-xl hover:bg-blue-50 transition-all font-medium flex items-center gap-2`}
                  >
                    <DocumentTextIcon className={iconSize} />
                    Template
                    <ChevronDownIcon className={`${iconSize} group-hover:rotate-180 transition-transform`} />
                  </motion.button>
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button onClick={() => handleDownloadTemplate('csv')}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
                    >
                      <DocumentTextIcon className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Template CSV</span>
                    </button>
                    <button onClick={() => handleDownloadTemplate('excel')}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <TableCellsIcon className="w-4 h-4 text-orange-500" />
                      <span className="text-sm">Template Excel</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Résultats */}
        {resultats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 p-4 md:p-6 mb-6"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-3">
              <div>
                <h2 className={`font-bold text-gray-800 ${isMobile ? 'text-base' : 'text-xl'}`}>Résultats</h2>
                <p className={`text-gray-600 ${textSize}`}>
                  {totalResultats} carte{totalResultats > 1 ? 's' : ''} trouvée{totalResultats > 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <motion.button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1}
                  whileHover={{ scale: currentPage <= 1 ? 1 : 1.05 }}
                  className="w-8 h-8 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-30 flex items-center justify-center"
                >←</motion.button>
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-lg font-medium text-sm">
                  {currentPage} / {totalPages}
                </span>
                <motion.button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}
                  whileHover={{ scale: currentPage >= totalPages ? 1 : 1.05 }}
                  className="w-8 h-8 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-30 flex items-center justify-center"
                >→</motion.button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <TableCartesExcel 
                cartes={resultats as any}
                role={user?.role || ''}
                onUpdateCartes={handleUpdateResultats as any}
                canEdit={!isOperateur}
                editFields={isChefEquipe ? ['delivrance', 'contactRetrait', 'dateDelivrance'] : undefined}
                onExportCSV={() => handleExport('csv')}
                onExportExcel={() => handleExport('excel')}
              />
            </div>

            {hasModifications && !isOperateur && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 md:mt-6 flex justify-end"
              >
                <motion.button onClick={handleSaveModifications}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className={`${buttonSize} bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 font-semibold shadow-lg flex items-center gap-2`}
                >
                  <CheckCircleIcon className={iconSize} />
                  Enregistrer les modifications
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}

        {resultats.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 p-8 md:p-12 text-center"
          >
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <XCircleIcon className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
            </div>
            <h3 className={`font-bold text-gray-800 mb-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
              Aucune carte trouvée
            </h3>
            <p className={`text-gray-600 max-w-md mx-auto ${textSize}`}>
              Utilisez les filtres de recherche pour trouver des cartes
            </p>
          </motion.div>
        )}

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 p-8 md:p-12 text-center"
          >
            <div className="flex flex-col items-center gap-4">
              <ArrowPathIcon className="w-8 h-8 md:w-10 md:h-10 text-[#F77F00] animate-spin" />
              <p className={`text-gray-600 font-medium ${textSize}`}>Recherche en cours...</p>
            </div>
          </motion.div>
        )}
      </div>

      <ImportModal
        isOpen={showImportModal}
        onClose={() => { setShowImportModal(false); setImportMode('standard'); }}
        onFileSelect={handleImport}
        isImporting={importLoading}
        mode={importMode}
        onModeChange={setImportMode}
      />

      {showProgressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 md:p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] rounded-xl flex items-center justify-center">
                <DocumentArrowDownIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div>
                <h3 className={`font-bold text-gray-800 ${isMobile ? 'text-base' : 'text-lg'}`}>Export en cours</h3>
                <p className={`text-gray-600 ${textSize}`}>{currentExportFormat.current.toUpperCase()}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progression</span>
                <span>{exportProgress.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div 
                  className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${exportProgress.percentage}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 md:gap-3 mb-4">
              <div className="bg-gray-50 p-2 md:p-3 rounded-xl">
                <p className="text-gray-500 text-xs">Vitesse</p>
                <p className={`font-semibold text-gray-800 ${textSize}`}>{exportProgress.speed}</p>
              </div>
              <div className="bg-gray-50 p-2 md:p-3 rounded-xl">
                <p className="text-gray-500 text-xs">Temps restant</p>
                <p className={`font-semibold text-gray-800 ${textSize}`}>{exportProgress.estimatedTime}</p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button onClick={() => setShowProgressModal(false)}
                className={`px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors ${textSize}`}
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Inventaire;