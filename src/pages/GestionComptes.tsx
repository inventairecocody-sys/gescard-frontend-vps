import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { UtilisateursService } from '../Services/api/utilisateurs';
import type { CreateUtilisateurData, UpdateUtilisateurData } from '../Services/api/utilisateurs';
import { 
  UsersIcon, 
  UserPlusIcon, 
  PencilIcon, 
  ShieldCheckIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  KeyIcon,
  BuildingOfficeIcon,
  BuildingStorefrontIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Utilisateur {
  id: number;
  nomUtilisateur: string;
  role: 'Administrateur' | 'Gestionnaire' | "Chef d'équipe" | 'Opérateur';
  coordination: string;
  agence: string;
  email?: string;
  telephone?: string;
  actif: boolean;
  dateCreation: string;
  derniereConnexion?: string;
}

// Liste des agences possibles
const AGENCES = [
  'BINGERVILLE',
  'CHU D\'ANGRÉ',
  'Lycée hôtelier',
  'ADJAMÉ',
  'BÂTIMENT U DE L\'UNIVERSITÉ FELIX-HOUPHOUET COCODY',
  'VICE-PRÉSIDENCE DE L\'UNIVERSITÉ FELIX-HOUPHOUET COCODY'
];

const GestionComptes: React.FC = () => {
  const { user } = useAuth();
  const { canEdit } = usePermissions();
  
  const isAdmin = user?.role === 'Administrateur';
  
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAgence, setFilterAgence] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Utilisateur | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Statistiques
  const [stats, setStats] = useState({
    total: 0,
    actifs: 0,
    inactifs: 0,
    administrateurs: 0,
    gestionnaires: 0,
    chefsEquipe: 0,
    operateurs: 0
  });

  // Modal de confirmation
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'delete' | 'activate' | 'resetPassword';
    action: () => Promise<void>;
  }>({
    show: false,
    title: '',
    message: '',
    type: 'delete',
    action: async () => {}
  });

  // Formulaire création/édition
  const [formData, setFormData] = useState({
    nomUtilisateur: '',
    role: 'Opérateur' as Utilisateur['role'],
    coordination: '',
    agence: '',
    email: '',
    telephone: '',
    motDePasse: '',
    confirmerMotDePasse: ''
  });

  // Responsive
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

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

  // Classes responsives
  const containerClass = isMobile ? 'px-3 py-4' : isTablet ? 'px-6 py-6' : 'container mx-auto px-4 py-8';
  const titleSize = isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl';
  const textSize = isMobile ? 'text-xs' : isTablet ? 'text-sm' : 'text-base';
  const inputSize = isMobile ? 'px-3 py-2 text-sm' : isTablet ? 'px-4 py-2.5' : 'px-4 py-3';
  const buttonSize = isMobile ? 'px-3 py-2 text-xs' : isTablet ? 'px-4 py-2.5 text-sm' : 'px-4 py-3';
  const iconSize = isMobile ? 'w-4 h-4' : isTablet ? 'w-5 h-5' : 'w-5 h-5';
  const gridCols = isMobile ? 'grid-cols-2' : isTablet ? 'grid-cols-3' : 'grid-cols-7';

  // Charger les utilisateurs
  const fetchUtilisateurs = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log('🔄 Chargement des utilisateurs...');
      const response = await UtilisateursService.getUtilisateurs({ limit: 100 });
      
      // Adapter la réponse au format attendu
      let usersList: Utilisateur[] = [];
      
      if (response && response.data) {
        usersList = response.data.map((u: any) => ({
          id: u.id,
          nomUtilisateur: u.nomUtilisateur || u.nom || '',
          role: u.role || 'Opérateur',
          coordination: u.coordination || '',
          agence: u.agence || 'BINGERVILLE',
          email: u.email,
          telephone: u.telephone,
          actif: u.actif !== false,
          dateCreation: u.dateCreation || new Date().toISOString(),
          derniereConnexion: u.derniereConnexion
        }));
      }
      
      console.log('✅ Utilisateurs chargés:', usersList.length);
      setUtilisateurs(usersList);
      calculerStats(usersList);
      
    } catch (error: any) {
      console.error('❌ Erreur chargement utilisateurs:', error);
      setError('Impossible de charger les utilisateurs');
      setUtilisateurs([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  // Calculer les statistiques
  const calculerStats = (liste: Utilisateur[]) => {
    setStats({
      total: liste.length,
      actifs: liste.filter(u => u.actif).length,
      inactifs: liste.filter(u => !u.actif).length,
      administrateurs: liste.filter(u => u.role === 'Administrateur').length,
      gestionnaires: liste.filter(u => u.role === 'Gestionnaire').length,
      chefsEquipe: liste.filter(u => u.role === "Chef d'équipe").length,
      operateurs: liste.filter(u => u.role === 'Opérateur').length
    });
  };

  useEffect(() => {
    fetchUtilisateurs();
  }, [fetchUtilisateurs]);

  // Filtrer les utilisateurs
  const filteredUsers = utilisateurs.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.nomUtilisateur.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      user.coordination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.agence.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'actif' && user.actif) ||
      (filterStatus === 'inactif' && !user.actif);
    const matchesAgence = filterAgence === 'all' || user.agence === filterAgence;
    
    return matchesSearch && matchesRole && matchesStatus && matchesAgence;
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Créer un utilisateur
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.motDePasse !== formData.confirmerMotDePasse) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (formData.motDePasse.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    try {
      const newUserData: CreateUtilisateurData = {
        nomUtilisateur: formData.nomUtilisateur,
        role: formData.role,
        coordination: formData.coordination,
        agence: formData.agence,
        email: formData.email || undefined,
        telephone: formData.telephone || undefined,
        motDePasse: formData.motDePasse
      };
      
      await UtilisateursService.createUtilisateur(newUserData);
      
      setSuccess('Utilisateur créé avec succès');
      setShowCreateModal(false);
      resetForm();
      fetchUtilisateurs();
      
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erreur lors de la création');
    }
  };

  // Mettre à jour un utilisateur
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingUser) return;
    
    try {
      const updateData: UpdateUtilisateurData = {
        role: formData.role,
        coordination: formData.coordination,
        agence: formData.agence,
        email: formData.email || undefined,
        telephone: formData.telephone || undefined
      };
      
      if (formData.motDePasse) {
        if (formData.motDePasse !== formData.confirmerMotDePasse) {
          setError('Les mots de passe ne correspondent pas');
          return;
        }
        if (formData.motDePasse.length < 6) {
          setError('Le mot de passe doit contenir au moins 6 caractères');
          return;
        }
        updateData.motDePasse = formData.motDePasse;
      }
      
      await UtilisateursService.updateUtilisateur(editingUser.id, updateData);
      
      setSuccess('Utilisateur modifié avec succès');
      setShowEditModal(false);
      resetForm();
      fetchUtilisateurs();
      
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erreur lors de la modification');
    }
  };

  // Activer/Désactiver un utilisateur
  const handleToggleStatus = async (user: Utilisateur) => {
    const action = user.actif ? 'désactiver' : 'réactiver';
    
    setConfirmModal({
      show: true,
      title: `${user.actif ? 'Désactiver' : 'Réactiver'} l'utilisateur`,
      message: `Voulez-vous ${action} ${user.nomUtilisateur} ?`,
      type: user.actif ? 'delete' : 'activate',
      action: async () => {
        try {
          if (user.actif) {
            // Désactiver l'utilisateur (soft delete)
            await UtilisateursService.deleteUtilisateur(user.id);
          } else {
            // Réactiver l'utilisateur
            await UtilisateursService.activateUtilisateur(user.id);
          }
          
          setSuccess(`Utilisateur ${action} avec succès`);
          fetchUtilisateurs();
        } catch (error: any) {
          setError(error.response?.data?.error || 'Erreur lors de l\'opération');
        }
      }
    });
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      nomUtilisateur: '',
      role: 'Opérateur',
      coordination: '',
      agence: '',
      email: '',
      telephone: '',
      motDePasse: '',
      confirmerMotDePasse: ''
    });
    setEditingUser(null);
  };

  // Obtenir la couleur du rôle
  const getRoleColor = (role: Utilisateur['role']) => {
    switch (role) {
      case 'Administrateur': return 'bg-purple-100 text-purple-800';
      case 'Gestionnaire': return 'bg-blue-100 text-blue-800';
      case "Chef d'équipe": return 'bg-amber-100 text-amber-800';
      case 'Opérateur': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir l'icône du rôle
  const getRoleIcon = (role: Utilisateur['role']) => {
    switch (role) {
      case 'Administrateur': return <ShieldCheckIcon className="w-4 h-4" />;
      case 'Gestionnaire': return <UsersIcon className="w-4 h-4" />;
      case "Chef d'équipe": return <UserIcon className="w-4 h-4" />;
      case 'Opérateur': return <UserIcon className="w-4 h-4" />;
    }
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Si pas admin, message d'accès refusé
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Navbar />
        <div className={containerClass}>
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 p-8 md:p-12 text-center">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <XCircleIcon className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
            </div>
            <h2 className={`font-bold text-gray-800 mb-2 ${titleSize}`}>
              Accès non autorisé
            </h2>
            <p className={`text-gray-600 ${textSize}`}>
              Cette page est réservée aux administrateurs.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white py-4 shadow-lg">
        <div className={containerClass}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`${titleSize} font-bold flex items-center gap-3`}>
                <UsersIcon className={iconSize} />
                Gestion des Comptes
              </h1>
              <p className={`text-white/90 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Administration des utilisateurs
              </p>
            </div>
            
            {/* Bouton actualiser */}
            <motion.button
              onClick={fetchUtilisateurs}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`${buttonSize} bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center gap-2 transition-colors`}
              disabled={loading}
            >
              <ArrowPathIcon className={`${iconSize} ${loading ? 'animate-spin' : ''}`} />
              {!isMobile && 'Actualiser'}
            </motion.button>
          </div>
        </div>
      </div>

      <div className={containerClass}>
        
        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 md:p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center justify-between"
          >
            <span className={textSize}>{error}</span>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
              ✕
            </button>
          </motion.div>
        )}
        
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 md:p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center justify-between"
          >
            <span className={textSize}>{success}</span>
            <button onClick={() => setSuccess('')} className="text-green-500 hover:text-green-700">
              ✕
            </button>
          </motion.div>
        )}

        {/* Statistiques */}
        <div className={`grid ${gridCols} gap-3 mb-6`}>
          {[
            { label: 'Total', value: stats.total, color: 'bg-blue-500' },
            { label: 'Actifs', value: stats.actifs, color: 'bg-green-500' },
            { label: 'Inactifs', value: stats.inactifs, color: 'bg-red-500' },
            { label: 'Admins', value: stats.administrateurs, color: 'bg-purple-500' },
            { label: 'Gestionnaires', value: stats.gestionnaires, color: 'bg-blue-500' },
            { label: 'Chefs', value: stats.chefsEquipe, color: 'bg-amber-500' },
            { label: 'Opérateurs', value: stats.operateurs, color: 'bg-green-500' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-200"
            >
              <div className={`text-lg md:text-2xl font-bold text-gray-800`}>
                {stat.value}
              </div>
              <div className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Filtres et actions */}
        <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                <input
                  type="text"
                  placeholder="Rechercher (nom, email, coordination, agence...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-9 md:pl-10 pr-3 ${inputSize} border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent`}
                />
              </div>
            </div>
            
            {/* Filtres */}
            <div className="flex flex-wrap gap-2">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className={`${inputSize} border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent`}
              >
                <option value="all">Tous rôles</option>
                <option value="Administrateur">Admin</option>
                <option value="Gestionnaire">Gestionnaire</option>
                <option value="Chef d'équipe">Chef d'équipe</option>
                <option value="Opérateur">Opérateur</option>
              </select>
              
              <select
                value={filterAgence}
                onChange={(e) => setFilterAgence(e.target.value)}
                className={`${inputSize} border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent`}
              >
                <option value="all">Toutes agences</option>
                {AGENCES.map(agence => (
                  <option key={agence} value={agence}>{agence}</option>
                ))}
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`${inputSize} border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent`}
              >
                <option value="all">Tous statuts</option>
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
              </select>
            </div>
            
            {/* Bouton créer */}
            <motion.button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`${buttonSize} bg-gradient-to-r from-[#F77F00] to-[#0077B6] text-white rounded-lg flex items-center gap-2 font-medium shadow-lg`}
            >
              <UserPlusIcon className={iconSize} />
              <span>Nouvel utilisateur</span>
            </motion.button>
          </div>
        </div>

        {/* Tableau des utilisateurs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          
          {loading ? (
            <div className="p-8 text-center">
              <ArrowPathIcon className="w-8 h-8 text-[#0077B6] animate-spin mx-auto mb-3" />
              <p className="text-gray-600">Chargement des utilisateurs...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-[#0077B6]/10 to-[#2E8B57]/10">
                    <tr>
                      <th className={`px-3 md:px-6 py-3 text-left font-semibold text-gray-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        Utilisateur
                      </th>
                      <th className={`px-3 md:px-6 py-3 text-left font-semibold text-gray-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        Rôle
                      </th>
                      <th className={`px-3 md:px-6 py-3 text-left font-semibold text-gray-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        Coordination
                      </th>
                      <th className={`px-3 md:px-6 py-3 text-left font-semibold text-gray-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        Agence
                      </th>
                      <th className={`px-3 md:px-6 py-3 text-left font-semibold text-gray-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        Statut
                      </th>
                      <th className={`px-3 md:px-6 py-3 text-left font-semibold text-gray-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        Création
                      </th>
                      <th className={`px-3 md:px-6 py-3 text-left font-semibold text-gray-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentUsers.map((userItem) => (
                      <motion.tr 
                        key={userItem.id} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* Utilisateur */}
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <div className="font-medium text-gray-900 text-sm md:text-base">
                            @{userItem.nomUtilisateur}
                          </div>
                          {userItem.email && (
                            <div className="text-xs text-gray-500 mt-1">{userItem.email}</div>
                          )}
                          {userItem.telephone && (
                            <div className="text-xs text-gray-500">{userItem.telephone}</div>
                          )}
                        </td>
                        
                        {/* Rôle */}
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <span className={`inline-flex items-center px-2 py-1 md:px-3 md:py-1.5 rounded-full text-xs font-medium ${getRoleColor(userItem.role)}`}>
                            {getRoleIcon(userItem.role)}
                            <span className="ml-1 hidden md:inline">{userItem.role}</span>
                          </span>
                        </td>
                        
                        {/* Coordination */}
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <div className="flex items-center text-sm text-gray-900">
                            <BuildingOfficeIcon className="w-4 h-4 mr-2 text-gray-400 hidden md:block" />
                            <span className="text-xs md:text-sm">{userItem.coordination}</span>
                          </div>
                        </td>
                        
                        {/* Agence */}
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <div className="flex items-center text-sm text-gray-900">
                            <BuildingStorefrontIcon className="w-4 h-4 mr-2 text-gray-400 hidden md:block" />
                            <span className="text-xs md:text-sm">{userItem.agence}</span>
                          </div>
                        </td>
                        
                        {/* Statut */}
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          {userItem.actif ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircleIcon className="w-3 h-3 mr-1" />
                              <span className="hidden md:inline">Actif</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <XCircleIcon className="w-3 h-3 mr-1" />
                              <span className="hidden md:inline">Inactif</span>
                            </span>
                          )}
                        </td>
                        
                        {/* Date création */}
                        <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-500">
                          <div className="flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-2 text-gray-400 hidden md:block" />
                            {formatDate(userItem.dateCreation)}
                          </div>
                        </td>
                        
                        {/* Actions */}
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <div className="flex items-center gap-1 md:gap-2">
                            
                            {/* Édition */}
                            {canEdit('gestion-comptes') && (
                              <>
                                <motion.button
                                  onClick={() => {
                                    setEditingUser(userItem);
                                    setFormData({
                                      nomUtilisateur: userItem.nomUtilisateur,
                                      role: userItem.role,
                                      coordination: userItem.coordination,
                                      agence: userItem.agence,
                                      email: userItem.email || '',
                                      telephone: userItem.telephone || '',
                                      motDePasse: '',
                                      confirmerMotDePasse: ''
                                    });
                                    setShowEditModal(true);
                                  }}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="p-1.5 md:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Modifier"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </motion.button>
                                
                                <motion.button
                                  onClick={() => handleToggleStatus(userItem)}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className={`p-1.5 md:p-2 rounded-lg transition-colors ${
                                    userItem.actif 
                                      ? 'text-red-600 hover:bg-red-50' 
                                      : 'text-green-600 hover:bg-green-50'
                                  }`}
                                  title={userItem.actif ? 'Désactiver' : 'Réactiver'}
                                >
                                  {userItem.actif ? (
                                    <XCircleIcon className="w-4 h-4" />
                                  ) : (
                                    <CheckCircleIcon className="w-4 h-4" />
                                  )}
                                </motion.button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-3 md:px-6 py-3 md:py-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className={`text-gray-600 ${textSize}`}>
                      {indexOfFirst + 1}-{Math.min(indexOfLast, filteredUsers.length)} sur {filteredUsers.length}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className={`px-2 py-1 md:px-3 md:py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors`}
                      >
                        Précédent
                      </button>
                      
                      <span className="px-2 py-1 md:px-3 md:py-1 bg-[#0077B6] text-white rounded-lg text-sm">
                        {currentPage}
                      </span>
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className={`px-2 py-1 md:px-3 md:py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors`}
                      >
                        Suivant
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal création */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h3 className={`font-bold text-gray-900 flex items-center gap-2 ${isMobile ? 'text-base' : 'text-xl'}`}>
                    <UserPlusIcon className="w-5 h-5" />
                    Nouvel utilisateur
                  </h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <form onSubmit={handleCreateUser} className="space-y-3 md:space-y-4">
                  
                  <div>
                    <label className={`block font-medium text-gray-700 mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      Nom d'utilisateur *
                    </label>
                    <input
                      type="text"
                      value={formData.nomUtilisateur}
                      onChange={(e) => setFormData({...formData, nomUtilisateur: e.target.value})}
                      className={`w-full ${inputSize} border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent`}
                      required
                      minLength={3}
                    />
                  </div>
                  
                  <div>
                    <label className={`block font-medium text-gray-700 mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      Rôle *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value as Utilisateur['role']})}
                      className={`w-full ${inputSize} border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent`}
                    >
                      <option value="Opérateur">Opérateur</option>
                      <option value="Chef d'équipe">Chef d'équipe</option>
                      <option value="Gestionnaire">Gestionnaire</option>
                      <option value="Administrateur">Administrateur</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block font-medium text-gray-700 mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      Coordination *
                    </label>
                    <input
                      type="text"
                      value={formData.coordination}
                      onChange={(e) => setFormData({...formData, coordination: e.target.value})}
                      className={`w-full ${inputSize} border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent`}
                      required
                      placeholder="Ex: ABIDJAN NORD-COCODY"
                    />
                  </div>
                  
                  <div>
                    <label className={`block font-medium text-gray-700 mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      Agence *
                    </label>
                    <select
                      value={formData.agence}
                      onChange={(e) => setFormData({...formData, agence: e.target.value})}
                      className={`w-full ${inputSize} border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent`}
                      required
                    >
                      <option value="">Sélectionner une agence</option>
                      {AGENCES.map(agence => (
                        <option key={agence} value={agence}>{agence}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block font-medium text-gray-700 mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className={`w-full ${inputSize} border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block font-medium text-gray-700 mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                      className={`w-full ${inputSize} border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block font-medium text-gray-700 mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      Mot de passe *
                    </label>
                    <input
                      type="password"
                      value={formData.motDePasse}
                      onChange={(e) => setFormData({...formData, motDePasse: e.target.value})}
                      className={`w-full ${inputSize} border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent`}
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <div>
                    <label className={`block font-medium text-gray-700 mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      Confirmer le mot de passe *
                    </label>
                    <input
                      type="password"
                      value={formData.confirmerMotDePasse}
                      onChange={(e) => setFormData({...formData, confirmerMotDePasse: e.target.value})}
                      className={`w-full ${inputSize} border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent`}
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2 md:gap-3 mt-4 md:mt-6">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className={`px-3 py-2 md:px-4 md:py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${textSize}`}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className={`px-3 py-2 md:px-4 md:py-2 bg-gradient-to-r from-[#0077B6] to-[#2E8B57] text-white rounded-lg font-semibold hover:shadow-lg transition-shadow ${textSize}`}
                    >
                      Créer
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal édition */}
      <AnimatePresence>
        {showEditModal && editingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h3 className={`font-bold text-gray-900 flex items-center gap-2 ${isMobile ? 'text-base' : 'text-xl'}`}>
                    <PencilIcon className="w-5 h-5" />
                    Modifier {editingUser.nomUtilisateur}
                  </h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <form onSubmit={handleUpdateUser} className="space-y-3 md:space-y-4">
                  
                  <div>
                    <label className={`block font-medium text-gray-700 mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      Nom d'utilisateur
                    </label>
                    <input
                      type="text"
                      value={formData.nomUtilisateur}
                      disabled
                      className={`w-full ${inputSize} border border-gray-300 bg-gray-50 rounded-lg`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block font-medium text-gray-700 mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      Rôle *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value as Utilisateur['role']})}
                      className={`w-full ${inputSize} border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent`}
                    >
                      <option value="Opérateur">Opérateur</option>
                      <option value="Chef d'équipe">Chef d'équipe</option>
                      <option value="Gestionnaire">Gestionnaire</option>
                      <option value="Administrateur">Administrateur</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block font-medium text-gray-700 mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      Coordination *
                    </label>
                    <input
                      type="text"
                      value={formData.coordination}
                      onChange={(e) => setFormData({...formData, coordination: e.target.value})}
                      className={`w-full ${inputSize} border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent`}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className={`block font-medium text-gray-700 mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      Agence *
                    </label>
                    <select
                      value={formData.agence}
                      onChange={(e) => setFormData({...formData, agence: e.target.value})}
                      className={`w-full ${inputSize} border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent`}
                      required
                    >
                      <option value="">Sélectionner une agence</option>
                      {AGENCES.map(agence => (
                        <option key={agence} value={agence}>{agence}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block font-medium text-gray-700 mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className={`w-full ${inputSize} border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block font-medium text-gray-700 mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                      className={`w-full ${inputSize} border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent`}
                    />
                  </div>
                  
                  <div className="border-t pt-3 md:pt-4 mt-3 md:mt-4">
                    <h4 className={`font-medium text-gray-700 mb-2 flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      <KeyIcon className="w-4 h-4" />
                      Changer le mot de passe (optionnel)
                    </h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className={`block text-gray-600 mb-1 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                          Nouveau mot de passe
                        </label>
                        <input
                          type="password"
                          value={formData.motDePasse}
                          onChange={(e) => setFormData({...formData, motDePasse: e.target.value})}
                          className={`w-full ${inputSize} border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent`}
                          minLength={6}
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-gray-600 mb-1 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                          Confirmer
                        </label>
                        <input
                          type="password"
                          value={formData.confirmerMotDePasse}
                          onChange={(e) => setFormData({...formData, confirmerMotDePasse: e.target.value})}
                          className={`w-full ${inputSize} border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent`}
                          minLength={6}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 md:gap-3 mt-4 md:mt-6">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className={`px-3 py-2 md:px-4 md:py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${textSize}`}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className={`px-3 py-2 md:px-4 md:py-2 bg-gradient-to-r from-[#0077B6] to-[#2E8B57] text-white rounded-lg font-semibold hover:shadow-lg transition-shadow ${textSize}`}
                    >
                      Enregistrer
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de confirmation */}
      <AnimatePresence>
        {confirmModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            >
              <div className="p-4 md:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${
                    confirmModal.type === 'delete' ? 'bg-red-100 text-red-600' :
                    confirmModal.type === 'activate' ? 'bg-green-100 text-green-600' :
                    'bg-amber-100 text-amber-600'
                  }`}>
                    <ExclamationTriangleIcon className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <h3 className={`font-bold text-gray-900 ${isMobile ? 'text-base' : 'text-lg'}`}>
                    {confirmModal.title}
                  </h3>
                </div>
                
                <p className={`text-gray-600 mb-4 md:mb-6 ${textSize}`}>
                  {confirmModal.message}
                </p>
                
                <div className="flex justify-end gap-2 md:gap-3">
                  <button
                    onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                    className={`px-3 py-2 md:px-4 md:py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${textSize}`}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={async () => {
                      await confirmModal.action();
                      setConfirmModal({ ...confirmModal, show: false });
                    }}
                    className={`px-3 py-2 md:px-4 md:py-2 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow ${textSize} ${
                      confirmModal.type === 'delete' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                      confirmModal.type === 'activate' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      'bg-gradient-to-r from-amber-500 to-yellow-500'
                    }`}
                  >
                    Confirmer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GestionComptes;