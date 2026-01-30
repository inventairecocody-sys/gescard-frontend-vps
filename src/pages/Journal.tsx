import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from "../components/Navbar";
import api from '../service/api';

interface JournalEntry {
    JournalID: number;
    UtilisateurID: number;
    NomUtilisateur: string;
    NomComplet: string;
    Role: string;
    Agence: string;
    DateAction: string;
    Action: string;
    TableAffectee: string;
    LigneAffectee: string;
    IPUtilisateur: string;
    Systeme: string;
    UserName: string;
    RoleUtilisateur: string;
    ActionType: string;
    TableName: string;
    RecordId: string;
    OldValue: string;
    NewValue: string;
    AdresseIP: string;
    UserId: number;
    ImportBatchID?: string;
    DetailsAction: string;
}

interface PaginationInfo {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

interface ImportBatch {
    ImportBatchID: string;
    nombreCartes: number;
    dateImport: string;
    NomUtilisateur: string;
    NomComplet: string;
    Agence: string;
}

interface BackupFile {
    id: string;
    name: string;
    created: string;
    size: string;
    type: 'SQL' | 'JSON' | 'ENCRYPTED';
    viewLink?: string;
    downloadUrl?: string;
    encrypted?: boolean;
}

interface BackupStats {
    total_backups: number;
    last_backup: string;
    sql_backups: number;
    json_backups: number;
}

const Journal: React.FC = () => {
    const [logs, setLogs] = useState<JournalEntry[]>([]);
    const [imports, setImports] = useState<ImportBatch[]>([]);
    const [backups, setBackups] = useState<BackupFile[]>([]);
    const [backupStats, setBackupStats] = useState<BackupStats | null>(null);
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        pageSize: 50,
        total: 0,
        totalPages: 0
    });
    const [filters, setFilters] = useState({
        dateDebut: '',
        dateFin: '',
        utilisateur: '',
        actionType: '',
        tableName: ''
    });
    const [loading, setLoading] = useState(false);
    const [importsLoading, setImportsLoading] = useState(false);
    const [backupsLoading, setBackupsLoading] = useState(false);
    const [selectedImport, setSelectedImport] = useState<string | null>(null);
    const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
    const [createBackupDialogOpen, setCreateBackupDialogOpen] = useState(false);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'journal' | 'imports' | 'backup'>('journal');
    const [creatingBackup, setCreatingBackup] = useState(false);
    const [restoringBackup, setRestoringBackup] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    const userRole = localStorage.getItem("role") || localStorage.getItem("Role") || "Operateur";
    const isAdmin = userRole === 'Administrateur';

    // 🎨 CONFIGURATION DES COULEURS PAR TYPE D'ACTION
    const getActionColor = (actionType: string) => {
        const colors: { [key: string]: string } = {
            'IMPORT_CARTE': 'bg-green-500',
            'CREATION_CARTE': 'bg-green-500',
            'MODIFICATION_CARTE': 'bg-orange-500',
            'SUPPRESSION_CARTE': 'bg-red-500',
            'ANNULATION_IMPORT': 'bg-red-500',
            'EXPORT_CARTES': 'bg-blue-500',
            'EXPORT_RECHERCHE': 'bg-blue-500',
            'DEBUT_IMPORT': 'bg-blue-400',
            'FIN_IMPORT': 'bg-blue-400',
            'BACKUP_CREATE': 'bg-purple-500',
            'BACKUP_RESTORE': 'bg-indigo-500',
            'BACKUP_DELETE': 'bg-red-500',
            'TELECHARGEMENT_TEMPLATE': 'bg-purple-500',
            'CONNEXION': 'bg-gray-500',
            'DECONNEXION': 'bg-gray-400',
            'ANNULATION': 'bg-yellow-500',
            'ANNULATION_MANUEL': 'bg-yellow-600'
        };
        return colors[actionType] || 'bg-gray-500';
    };

    const getActionIcon = (actionType: string) => {
        const icons: { [key: string]: string } = {
            'IMPORT_CARTE': '📤',
            'CREATION_CARTE': '👤',
            'MODIFICATION_CARTE': '✏️',
            'SUPPRESSION_CARTE': '🗑️',
            'ANNULATION_IMPORT': '❌',
            'EXPORT_CARTES': '📥',
            'EXPORT_RECHERCHE': '📊',
            'DEBUT_IMPORT': '⏳',
            'FIN_IMPORT': '✅',
            'BACKUP_CREATE': '💾',
            'BACKUP_RESTORE': '🔄',
            'BACKUP_DELETE': '🗑️',
            'TELECHARGEMENT_TEMPLATE': '📋',
            'CONNEXION': '🔐',
            'DECONNEXION': '🚪',
            'ANNULATION': '↩️',
            'ANNULATION_MANUEL': '↩️'
        };
        return icons[actionType] || '📝';
    };

    // ✅ FONCTION FETCH LOGS
    const fetchLogs = async (page: number = 1) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                pageSize: pagination.pageSize.toString(),
                ...filters
            });

            const response = await api.get(`/api/journal?${queryParams}`);
            setLogs(response.data.logs);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Erreur chargement journal:', error);
            alert('Erreur lors du chargement du journal');
        } finally {
            setLoading(false);
        }
    };

    // ✅ FONCTION FETCH IMPORTS
    const fetchImports = async () => {
        setImportsLoading(true);
        try {
            const response = await api.get('/api/journal/imports');
            setImports(response.data);
        } catch (error) {
            console.error('Erreur chargement imports:', error);
            alert('Erreur lors du chargement des imports');
        } finally {
            setImportsLoading(false);
        }
    };

    // ✅ FONCTION FETCH BACKUPS
    const fetchBackups = async () => {
        setBackupsLoading(true);
        try {
            const response = await api.get('/api/backup/list');
            setBackups(response.data.backups);
            
            // Récupérer les statistiques
            const statsResponse = await api.get('/api/backup/stats');
            setBackupStats(statsResponse.data.stats);
        } catch (error) {
            console.error('Erreur chargement backups:', error);
            setBackups([]);
        } finally {
            setBackupsLoading(false);
        }
    };

    // ✅ FONCTION CRÉER BACKUP
    const handleCreateBackup = async () => {
        if (!isAdmin) {
            alert('❌ Seuls les administrateurs peuvent créer des sauvegardes');
            return;
        }

        setCreatingBackup(true);
        try {
            await api.post('/api/backup/create');
            
            alert('✅ Backup en cours de création... Vérifiez les logs pour la progression.');
            
            // Rafraîchir la liste des backups après un délai
            setTimeout(() => {
                fetchBackups();
                fetchLogs(); // Pour voir l'action dans le journal
            }, 5000);
            
            setCreateBackupDialogOpen(false);
        } catch (error) {
            console.error('Erreur création backup:', error);
            alert('❌ Erreur lors de la création du backup');
        } finally {
            setCreatingBackup(false);
        }
    };

    // ✅ FONCTION RESTAURER BACKUP
    const handleRestoreBackup = async () => {
        if (!isAdmin) {
            alert('❌ Seuls les administrateurs peuvent restaurer des sauvegardes');
            return;
        }

        if (confirmText !== 'CONFIRMER_RESTAURATION') {
            alert('⚠️ Veuillez taper "CONFIRMER_RESTAURATION" pour confirmer');
            return;
        }

        setRestoringBackup(true);
        try {
            await api.post('/api/backup/restore', {
                confirm: 'YES_I_CONFIRM_RESTORE',
                backupId: selectedBackup
            });
            
            alert('✅ Restauration lancée ! Cette opération peut prendre plusieurs minutes.');
            
            // Fermer le dialog et réinitialiser
            setRestoreDialogOpen(false);
            setConfirmText('');
            setSelectedBackup(null);
            
            // Rafraîchir après un délai
            setTimeout(() => {
                fetchBackups();
                fetchLogs();
            }, 10000);
        } catch (error) {
            console.error('Erreur restauration:', error);
            alert('❌ Erreur lors de la restauration');
        } finally {
            setRestoringBackup(false);
        }
    };

    // ✅ FONCTION TÉLÉCHARGER BACKUP
    const handleDownloadBackup = async (backupId: string, backupName: string) => {
        try {
            const response = await api.post('/api/backup/download', { backupId });
            
            // Créer un lien de téléchargement
            const downloadUrl = response.data.links.download;
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.click();
            
            // Journaliser le téléchargement
            await api.post('/api/journal/log', {
                actionType: 'BACKUP_DOWNLOAD',
                details: `Téléchargement du backup: ${backupName}`,
                utilisateurId: localStorage.getItem("userId"),
                nomUtilisateur: localStorage.getItem("nomUtilisateur"),
                role: userRole
            });
            
        } catch (error) {
            console.error('Erreur téléchargement:', error);
            alert('❌ Erreur lors du téléchargement');
        }
    };

    // ✅ FONCTION ANNULATION IMPORT
    const handleAnnulerImport = async () => {
        try {
            await api.post('/api/journal/annuler-import', { importBatchID: selectedImport });
            
            setDialogOpen(false);
            setSelectedImport(null);
            
            alert('✅ Importation annulée avec succès');
            
            // Rafraîchir les données
            fetchLogs();
            fetchImports();
        } catch (error) {
            console.error('Erreur annulation:', error);
            alert('❌ Erreur lors de l\'annulation de l\'importation');
        }
    };

    // ✅ FONCTION POUR ANNULER LES ACTIONS
    const handleUndo = async (journalId: number) => {
        if (!window.confirm("Voulez-vous vraiment annuler cette action ?")) return;

        try {
            await api.post(`/api/journal/undo/${journalId}`);
            alert("✅ Action annulée avec succès !");
            fetchLogs();
        } catch (error) {
            console.error("Erreur annulation:", error);
            alert("❌ Erreur lors de l'annulation.");
        }
    };

    // CHARGEMENT INITIAL
    useEffect(() => {
        if (activeTab === 'journal') {
            fetchLogs();
        } else if (activeTab === 'imports') {
            fetchImports();
        } else if (activeTab === 'backup') {
            fetchBackups();
        }
    }, [filters, activeTab]);

    const handleFilterChange = (field: string, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('fr-FR');
    };

    const handleResetFilters = () => {
        setFilters({
            dateDebut: '',
            dateFin: '',
            utilisateur: '',
            actionType: '',
            tableName: ''
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
            <Navbar />
            
            {/* 🎯 EN-TÊTE AVEC STYLE ORANGE */}
            <div className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white py-4 shadow-lg">
                <div className="container mx-auto px-6">
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        <span className="bg-white/20 p-2 rounded-xl">📊</span>
                        Journal d'Activité & Gestion des Sauvegardes
                    </h1>
                    <p className="text-white/90 mt-1 text-sm">
                        Surveillance système complète - COORDINATION ABIDJAN NORD-COCODY
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6 py-6">
                {/* TABS DE NAVIGATION */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <motion.button
                        onClick={() => setActiveTab('journal')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 ${
                            activeTab === 'journal'
                                ? 'bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        <span className="text-lg">📝</span>
                        Journal
                    </motion.button>
                    
                    <motion.button
                        onClick={() => {
                            setActiveTab('imports');
                            fetchImports();
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 ${
                            activeTab === 'imports'
                                ? 'bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        <span className="text-lg">📦</span>
                        Imports
                    </motion.button>
                    
                    <motion.button
                        onClick={() => {
                            setActiveTab('backup');
                            fetchBackups();
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 ${
                            activeTab === 'backup'
                                ? 'bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        <span className="text-lg">💾</span>
                        Sauvegardes
                    </motion.button>
                </div>

                {/* BOUTON ACTUALISER */}
                <div className="mb-6">
                    <motion.button
                        onClick={() => {
                            if (activeTab === 'journal') fetchLogs();
                            else if (activeTab === 'imports') fetchImports();
                            else if (activeTab === 'backup') fetchBackups();
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center gap-3 font-semibold shadow-lg"
                    >
                        <span className="text-lg">🔄</span>
                        Actualiser
                    </motion.button>
                </div>

                {/* CONTENU DES TABS */}
                {activeTab === 'journal' && (
                    /* VUE JOURNAL COMPLET */
                    <>
                        {/* FILTRES */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 p-6 mb-6"
                        >
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
                                <span className="text-xl">🔍</span>
                                Filtres avancés
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {/* Date de début */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date de début
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.dateDebut}
                                        onChange={(e) => handleFilterChange('dateDebut', e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>
                                
                                {/* Date de fin */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date de fin
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.dateFin}
                                        onChange={(e) => handleFilterChange('dateFin', e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>
                                
                                {/* Utilisateur */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Utilisateur
                                    </label>
                                    <input
                                        type="text"
                                        value={filters.utilisateur}
                                        onChange={(e) => handleFilterChange('utilisateur', e.target.value)}
                                        placeholder="Nom utilisateur..."
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>
                                
                                {/* Type d'action */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Type d'action
                                    </label>
                                    <select
                                        value={filters.actionType}
                                        onChange={(e) => handleFilterChange('actionType', e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    >
                                        <option value="">Tous les types</option>
                                        <option value="IMPORT_CARTE">Import carte</option>
                                        <option value="CREATION_CARTE">Création carte</option>
                                        <option value="MODIFICATION_CARTE">Modification carte</option>
                                        <option value="SUPPRESSION_CARTE">Suppression carte</option>
                                        <option value="EXPORT_CARTES">Export cartes</option>
                                        <option value="ANNULATION_IMPORT">Annulation import</option>
                                        <option value="CONNEXION">Connexion</option>
                                        <option value="DECONNEXION">Déconnexion</option>
                                        <option value="BACKUP_CREATE">Création backup</option>
                                        <option value="BACKUP_RESTORE">Restauration backup</option>
                                    </select>
                                </div>
                                
                                {/* Table affectée */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Table affectée
                                    </label>
                                    <select
                                        value={filters.tableName}
                                        onChange={(e) => handleFilterChange('tableName', e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    >
                                        <option value="">Toutes les tables</option>
                                        <option value="Cartes">Cartes</option>
                                        <option value="Utilisateurs">Utilisateurs</option>
                                        <option value="Agences">Agences</option>
                                        <option value="Journal">Journal</option>
                                        <option value="Imports">Imports</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-3 mt-6">
                                <motion.button
                                    onClick={handleResetFilters}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-6 py-2 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium"
                                >
                                    Réinitialiser
                                </motion.button>
                                
                                <motion.button
                                    onClick={() => fetchLogs(1)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-semibold"
                                >
                                    Appliquer filtres
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* TABLEAU DES LOGS */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 overflow-hidden"
                        >
                            {/* En-tête avec infos de pagination */}
                            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-gray-600">
                                        Affichage <span className="font-bold">{logs.length}</span> logs sur <span className="font-bold">{pagination.total}</span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Page <span className="font-bold">{pagination.page}</span> sur <span className="font-bold">{pagination.totalPages}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tableau */}
                            {loading ? (
                                <div className="flex justify-center items-center py-20">
                                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="ml-4 text-gray-600 text-lg">Chargement du journal...</span>
                                </div>
                            ) : logs.length === 0 ? (
                                <div className="text-center py-16 text-gray-500">
                                    <div className="text-4xl mb-3">📭</div>
                                    <p className="text-lg font-medium">Aucune activité trouvée</p>
                                    <p className="mt-2">Essayez de modifier vos filtres ou vérifiez la connexion</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-b border-gray-200">
                                                <th className="px-4 py-3 text-left font-semibold">Date/Heure</th>
                                                <th className="px-4 py-3 text-left font-semibold">Utilisateur</th>
                                                <th className="px-4 py-3 text-left font-semibold">Action</th>
                                                <th className="px-4 py-3 text-left font-semibold">Table</th>
                                                <th className="px-4 py-3 text-left font-semibold">Détails</th>
                                                {isAdmin && (
                                                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {logs.map((log) => (
                                                <React.Fragment key={log.JournalID}>
                                                    <tr className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                                        expandedRow === log.JournalID ? 'bg-blue-50' : ''
                                                    }`}>
                                                        <td className="px-4 py-3">
                                                            <div className="text-gray-700">{formatDate(log.DateAction)}</div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="font-medium text-gray-800">{log.NomComplet}</div>
                                                            <div className="text-xs text-gray-500">
                                                                @{log.NomUtilisateur} • {log.Agence}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`w-2 h-2 rounded-full ${getActionColor(log.ActionType)}`}></span>
                                                                <span className="font-medium text-gray-700">
                                                                    {getActionIcon(log.ActionType)} {log.ActionType.replace(/_/g, ' ')}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                                                {log.TableName || log.TableAffectee}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="text-gray-600 truncate max-w-xs" title={log.DetailsAction}>
                                                                {log.DetailsAction || log.Action}
                                                            </div>
                                                        </td>
                                                        {isAdmin && (
                                                            <td className="px-4 py-3">
                                                                <div className="flex gap-2">
                                                                    <motion.button
                                                                        onClick={() => setExpandedRow(expandedRow === log.JournalID ? null : log.JournalID)}
                                                                        whileHover={{ scale: 1.05 }}
                                                                        whileTap={{ scale: 0.95 }}
                                                                        className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center gap-2 text-sm"
                                                                    >
                                                                        <span>📋</span>
                                                                        Détails
                                                                    </motion.button>
                                                                    {(log.ActionType.includes('CREATION') || log.ActionType.includes('MODIFICATION') || log.ActionType.includes('SUPPRESSION')) && (
                                                                        <motion.button
                                                                            onClick={() => handleUndo(log.JournalID)}
                                                                            whileHover={{ scale: 1.05 }}
                                                                            whileTap={{ scale: 0.95 }}
                                                                            className="px-3 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 flex items-center gap-2 text-sm"
                                                                        >
                                                                            <span>↩️</span>
                                                                            Annuler
                                                                        </motion.button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        )}
                                                    </tr>
                                                    
                                                    {/* Ligne détaillée */}
                                                    {expandedRow === log.JournalID && (
                                                        <tr className="bg-blue-50 border-b border-blue-100">
                                                            <td colSpan={isAdmin ? 6 : 5} className="px-4 py-6">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                                    <div>
                                                                        <h4 className="font-bold text-gray-700 mb-2">📋 Informations de base</h4>
                                                                        <div className="space-y-2 text-sm">
                                                                            <div><span className="font-medium">ID:</span> {log.JournalID}</div>
                                                                            <div><span className="font-medium">ID Ligne:</span> {log.RecordId || log.LigneAffectee}</div>
                                                                            <div><span className="font-medium">Batch Import:</span> {log.ImportBatchID || 'N/A'}</div>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <h4 className="font-bold text-gray-700 mb-2">👤 Utilisateur</h4>
                                                                        <div className="space-y-2 text-sm">
                                                                            <div><span className="font-medium">Rôle:</span> <span className="px-2 py-1 bg-gray-100 rounded text-xs">{log.Role || log.RoleUtilisateur}</span></div>
                                                                            <div><span className="font-medium">IP:</span> {log.AdresseIP || log.IPUtilisateur}</div>
                                                                            <div><span className="font-medium">Système:</span> {log.Systeme}</div>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <h4 className="font-bold text-gray-700 mb-2">🔄 Changements</h4>
                                                                        <div className="space-y-2 text-sm">
                                                                            <div>
                                                                                <span className="font-medium">Ancienne valeur:</span>
                                                                                <div className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono overflow-x-auto">
                                                                                    {log.OldValue ? JSON.stringify(JSON.parse(log.OldValue), null, 2) : 'Aucune'}
                                                                                </div>
                                                                            </div>
                                                                            <div>
                                                                                <span className="font-medium">Nouvelle valeur:</span>
                                                                                <div className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono overflow-x-auto">
                                                                                    {log.NewValue ? JSON.stringify(JSON.parse(log.NewValue), null, 2) : 'Aucune'}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-gray-600">
                                            {pagination.total} entrées totales
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            <motion.button
                                                onClick={() => fetchLogs(pagination.page - 1)}
                                                disabled={pagination.page <= 1}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                                            >
                                                Précédent
                                            </motion.button>
                                            
                                            <div className="flex items-center gap-2">
                                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                                    let pageNum;
                                                    if (pagination.totalPages <= 5) {
                                                        pageNum = i + 1;
                                                    } else if (pagination.page <= 3) {
                                                        pageNum = i + 1;
                                                    } else if (pagination.page >= pagination.totalPages - 2) {
                                                        pageNum = pagination.totalPages - 4 + i;
                                                    } else {
                                                        pageNum = pagination.page - 2 + i;
                                                    }
                                                    
                                                    return (
                                                        <motion.button
                                                            key={pageNum}
                                                            onClick={() => fetchLogs(pageNum)}
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                                                                pagination.page === pageNum
                                                                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold'
                                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            }`}
                                                        >
                                                            {pageNum}
                                                        </motion.button>
                                                    );
                                                })}
                                            </div>
                                            
                                            <motion.button
                                                onClick={() => fetchLogs(pagination.page + 1)}
                                                disabled={pagination.page >= pagination.totalPages}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                                            >
                                                Suivant
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}

                {activeTab === 'imports' && (
                    /* VUE IMPORTS */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 p-6 mb-6"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                <span className="text-2xl">📦</span>
                                Historique des imports
                            </h2>
                            
                            <div className="text-sm text-gray-600">
                                {imports.length} batch{imports.length !== 1 ? 's' : ''} d'import
                            </div>
                        </div>

                        {importsLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="ml-3 text-gray-600">Chargement des imports...</span>
                            </div>
                        ) : imports.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <div className="text-4xl mb-3">📭</div>
                                <p className="text-lg font-medium">Aucun import trouvé</p>
                                <p className="mt-2">Les imports seront affichés ici après traitement</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-2xl border border-gray-200">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                                            <th className="px-4 py-3 text-left font-semibold">Batch ID</th>
                                            <th className="px-4 py-3 text-left font-semibold">Date</th>
                                            <th className="px-4 py-3 text-left font-semibold">Utilisateur</th>
                                            <th className="px-4 py-3 text-left font-semibold">Agence</th>
                                            <th className="px-4 py-3 text-left font-semibold">Nombre de cartes</th>
                                            {isAdmin && (
                                                <th className="px-4 py-3 text-left font-semibold">Actions</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {imports.map((imp) => (
                                            <tr key={imp.ImportBatchID} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="font-mono text-sm font-medium text-gray-800">
                                                        {imp.ImportBatchID}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-gray-700">{formatDate(imp.dateImport)}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-gray-800">{imp.NomComplet}</div>
                                                    <div className="text-xs text-gray-500">@{imp.NomUtilisateur}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                                        {imp.Agence}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg">🃏</span>
                                                        <span className="font-bold text-lg text-blue-600">{imp.nombreCartes}</span>
                                                        <span className="text-sm text-gray-500">cartes</span>
                                                    </div>
                                                </td>
                                                {isAdmin && (
                                                    <td className="px-4 py-3">
                                                        <motion.button
                                                            onClick={() => {
                                                                setSelectedImport(imp.ImportBatchID);
                                                                setDialogOpen(true);
                                                            }}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center gap-2 text-sm"
                                                        >
                                                            <span>❌</span>
                                                            Annuler import
                                                        </motion.button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Note importante */}
                        {isAdmin && imports.length > 0 && (
                            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl text-yellow-600">⚠️</span>
                                    <div>
                                        <h3 className="font-bold text-yellow-800">Attention</h3>
                                        <p className="text-yellow-700 text-sm mt-1">
                                            L'annulation d'un import supprimera toutes les cartes de ce batch. 
                                            Cette action est irréversible.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'backup' && (
                    /* NOUVELLE VUE BACKUP */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* STATISTIQUES BACKUP */}
                        {backupStats && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg">
                                    <div className="text-3xl font-bold mb-2">{backupStats.total_backups}</div>
                                    <div className="text-sm opacity-90">Sauvegardes totales</div>
                                </div>
                                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-lg">
                                    <div className="text-3xl font-bold mb-2">{backupStats.sql_backups}</div>
                                    <div className="text-sm opacity-90">Backups SQL</div>
                                </div>
                                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg">
                                    <div className="text-3xl font-bold mb-2">{backupStats.json_backups}</div>
                                    <div className="text-sm opacity-90">Backups JSON</div>
                                </div>
                                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl p-6 shadow-lg">
                                    <div className="text-lg font-bold mb-2">
                                        {backupStats.last_backup === 'jamais' ? 'Jamais' : new Date(backupStats.last_backup).toLocaleDateString('fr-FR')}
                                    </div>
                                    <div className="text-sm opacity-90">Dernier backup</div>
                                </div>
                            </div>
                        )}

                        {/* ACTIONS BACKUP */}
                        {isAdmin && (
                            <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-green-100 p-6">
                                <div className="flex flex-wrap gap-4">
                                    <motion.button
                                        onClick={() => setCreateBackupDialogOpen(true)}
                                        disabled={creatingBackup}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all duration-300 flex items-center gap-3 font-semibold shadow-lg"
                                    >
                                        {creatingBackup ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Création...
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-lg">💾</span>
                                                Créer un backup
                                            </>
                                        )}
                                    </motion.button>

                                    <motion.button
                                        onClick={() => {
                                            setSelectedBackup(null);
                                            setRestoreDialogOpen(true);
                                        }}
                                        disabled={backups.length === 0}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-300 flex items-center gap-3 font-semibold shadow-lg"
                                    >
                                        <span className="text-lg">🔄</span>
                                        Restaurer backup
                                    </motion.button>

                                    <motion.button
                                        onClick={fetchBackups}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 flex items-center gap-3 font-semibold shadow-lg"
                                    >
                                        <span className="text-lg">🔄</span>
                                        Actualiser liste
                                    </motion.button>
                                </div>

                                <div className="mt-4 text-sm text-gray-600">
                                    <p>💡 <span className="font-semibold">Backup automatique:</span> Tous les jours à 13h30 UTC (heure d'Abidjan)</p>
                                    <p>🔐 <span className="font-semibold">Stockage:</span> Google Drive (dossier "gescard_backups")</p>
                                </div>
                            </div>
                        )}

                        {/* LISTE DES BACKUPS */}
                        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-blue-100 p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                                <span className="text-2xl">📁</span>
                                Liste des sauvegardes disponibles
                            </h2>

                            {backupsLoading ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="ml-3 text-gray-600">Chargement des sauvegardes...</span>
                                </div>
                            ) : backups.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <div className="text-4xl mb-3">📭</div>
                                    <p className="text-lg font-medium">Aucune sauvegarde disponible</p>
                                    {isAdmin && (
                                        <p className="mt-2">Cliquez sur "Créer un backup" pour créer votre première sauvegarde</p>
                                    )}
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-2xl border border-gray-200">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                                                <th className="px-4 py-3 text-left font-semibold">Nom</th>
                                                <th className="px-4 py-3 text-left font-semibold">Date</th>
                                                <th className="px-4 py-3 text-left font-semibold">Type</th>
                                                <th className="px-4 py-3 text-left font-semibold">Taille</th>
                                                {isAdmin && (
                                                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {backups.map((backup) => (
                                                <tr key={backup.id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium text-gray-800">{backup.name}</div>
                                                        {backup.encrypted && (
                                                            <span className="inline-block mt-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                                                                🔐 Chiffré
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-gray-700">{backup.created}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                            backup.type === 'SQL' ? 'bg-blue-100 text-blue-700' :
                                                            backup.type === 'JSON' ? 'bg-green-100 text-green-700' :
                                                            'bg-purple-100 text-purple-700'
                                                        }`}>
                                                            {backup.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-gray-700">{backup.size}</span>
                                                    </td>
                                                    {isAdmin && (
                                                        <td className="px-4 py-3">
                                                            <div className="flex gap-2">
                                                                <motion.button
                                                                    onClick={() => handleDownloadBackup(backup.id, backup.name)}
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center gap-2 text-sm"
                                                                >
                                                                    <span>⬇️</span>
                                                                    Télécharger
                                                                </motion.button>
                                                                <motion.button
                                                                    onClick={() => {
                                                                        setSelectedBackup(backup.id);
                                                                        setRestoreDialogOpen(true);
                                                                    }}
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    className="px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center gap-2 text-sm"
                                                                >
                                                                    <span>🔄</span>
                                                                    Restaurer
                                                                </motion.button>
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* INFO POUR NON-ADMINS */}
                        {!isAdmin && backups.length > 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">⚠️</span>
                                    <div>
                                        <h3 className="font-bold text-yellow-800">Accès limité</h3>
                                        <p className="text-yellow-700 text-sm mt-1">
                                            Vous avez une vue en lecture seule des sauvegardes. 
                                            Seuls les administrateurs peuvent créer, restaurer ou télécharger des sauvegardes.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* MODAL DE CONFIRMATION D'ANNULATION D'IMPORT */}
            {dialogOpen && (
                <ModalConfirmation
                    title="Confirmation d'annulation"
                    message="Êtes-vous sûr de vouloir annuler cette importation ? Toutes les cartes de ce batch seront définitivement supprimées."
                    onCancel={() => setDialogOpen(false)}
                    onConfirm={handleAnnulerImport}
                    confirmText="Confirmer l'annulation"
                    confirmColor="red"
                />
            )}

            {/* MODAL CRÉATION BACKUP */}
            {createBackupDialogOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-auto border border-green-100"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                                <span className="text-white text-xl">💾</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Créer une sauvegarde</h3>
                        </div>
                        
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Cette action va créer une sauvegarde complète de votre base de données.
                            La sauvegarde sera stockée sur Google Drive et pourra prendre plusieurs minutes.
                        </p>
                        
                        <div className="space-y-4 mb-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-blue-600">📁</span>
                                    <div>
                                        <div className="font-medium text-blue-800">Google Drive</div>
                                        <div className="text-sm text-blue-700">Dossier: gescard_backups</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-green-600">🔄</span>
                                    <div>
                                        <div className="font-medium text-green-800">Backup automatique</div>
                                        <div className="text-sm text-green-700">Tous les jours à 13h30 UTC</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-3">
                            <motion.button
                                onClick={() => setCreateBackupDialogOpen(false)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium"
                            >
                                Annuler
                            </motion.button>
                            <motion.button
                                onClick={handleCreateBackup}
                                disabled={creatingBackup}
                                whileHover={{ scale: creatingBackup ? 1 : 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all duration-300 font-semibold shadow-lg flex items-center gap-3"
                            >
                                {creatingBackup ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Création...
                                    </>
                                ) : (
                                    <>
                                        <span>💾</span>
                                        Créer le backup
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* MODAL RESTAURATION BACKUP */}
            {restoreDialogOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-auto border border-red-100"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                                <span className="text-white text-xl">⚠️</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Restauration de backup</h3>
                        </div>
                        
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                            <div className="flex items-start gap-3">
                                <span className="text-red-600 text-xl">🚨</span>
                                <div>
                                    <div className="font-bold text-red-800">ATTENTION: OPÉRATION DANGEREUSE</div>
                                    <div className="text-sm text-red-700 mt-1">
                                        Cette opération va REMPLACER TOUTES les données actuelles par celles du backup.
                                        Les données actuelles seront PERDUES si vous n'avez pas de sauvegarde récente.
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {selectedBackup && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                                <div className="font-medium text-blue-800 mb-2">Backup sélectionné:</div>
                                <div className="text-sm text-blue-700">
                                    {backups.find(b => b.id === selectedBackup)?.name || 'Inconnu'}
                                </div>
                            </div>
                        )}
                        
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Tapez "CONFIRMER_RESTAURATION" pour confirmer:
                            </label>
                            <input
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                placeholder="CONFIRMER_RESTAURATION"
                            />
                        </div>
                        
                        <div className="flex justify-end gap-3">
                            <motion.button
                                onClick={() => {
                                    setRestoreDialogOpen(false);
                                    setConfirmText('');
                                    setSelectedBackup(null);
                                }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium"
                            >
                                Annuler
                            </motion.button>
                            <motion.button
                                onClick={handleRestoreBackup}
                                disabled={restoringBackup}
                                whileHover={{ scale: restoringBackup ? 1 : 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 transition-all duration-300 font-semibold shadow-lg flex items-center gap-3"
                            >
                                {restoringBackup ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Restauration...
                                    </>
                                ) : (
                                    <>
                                        <span>🔄</span>
                                        Restaurer
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

// Composant Modal réutilisable
interface ModalConfirmationProps {
    title: string;
    message: string;
    onCancel: () => void;
    onConfirm: () => void;
    confirmText: string;
    confirmColor?: 'red' | 'green' | 'blue';
}

const ModalConfirmation: React.FC<ModalConfirmationProps> = ({ 
    title, 
    message, 
    onCancel, 
    onConfirm, 
    confirmText, 
    confirmColor = 'red' 
}) => {
    const colorClasses = {
        red: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
        green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
        blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-auto border border-gray-200"
            >
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">⚠️</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>
                
                <div className="flex justify-end gap-3">
                    <motion.button
                        onClick={onCancel}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium"
                    >
                        Annuler
                    </motion.button>
                    <motion.button
                        onClick={onConfirm}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-6 py-3 bg-gradient-to-r ${colorClasses[confirmColor]} text-white rounded-xl transition-all duration-300 font-semibold shadow-lg`}
                    >
                        {confirmText}
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Journal;