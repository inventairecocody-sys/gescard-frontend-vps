import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserPlus, Edit, Trash2, Shield, User, CheckCircle, 
  XCircle, Search, RefreshCw, Key, Building, Calendar,
  Save, X, UserCog, AlertCircle
} from 'lucide-react';
import { userApi, journalApi } from '../service/api';
import type { UserType } from '../types';

const GestionComptes: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    chefsEquipe: 0,
    operators: 0
  });

  // États pour les modales de confirmation
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'delete' | 'activate' | 'resetPassword' | 'create' | 'update';
    action: () => Promise<void>;
  }>({
    show: false,
    title: '',
    message: '',
    type: 'delete',
    action: async () => {}
  });

  // Listes des agences et rôles
  const AGENCES = [
    'BINGERVILLE',
    'CHU D\'ANGRÉ',
    'Lycée hôtelier',
    'ADJAMÉ',
    'BÂTIMENT U DE L\'UNIVERSITÉ FELIX-HOUPHOUET COCODY',
    'VICE-PRÉSIDENCE DE L\'UNIVERSITÉ FELIX-HOUPHOUET COCODY'
  ];

  const ROLES = ['Opérateur', 'Chef d\'équipe', 'Administrateur'];

  // État pour l'édition en ligne
  const [editableUsers, setEditableUsers] = useState<{[key: number]: Partial<UserType>}>({});

  // Formulaire pour création
  const [formData, setFormData] = useState({
    nomUtilisateur: '',
    nomComplet: '',
    email: '',
    agence: '',
    role: 'Opérateur',
    motDePasse: '',
    confirmerMotDePasse: ''
  });

  // Fonction pour nettoyer les données utilisateur
  const cleanUserData = (user: any): UserType => {
    return {
      id: user.id || user.Id || user.userId || Math.random(),
      nomUtilisateur: user.nomUtilisateur || user.NomUtilisateur || user.username || '',
      nomComplet: user.nomComplet || user.NomComplet || 'Utilisateur',
      email: user.email || user.Email || '',
      agence: user.agence || user.Agence || '',
      role: user.role || user.Role || 'Opérateur',
      actif: user.actif !== undefined ? user.actif : 
             user.Actif !== undefined ? user.Actif : 
             user.isActive !== undefined ? user.isActive : true,
      dateCreation: user.dateCreation || user.createdAt || user.DateCreation || new Date().toISOString(),
    };
  };

  // Charger les utilisateurs
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await userApi.getAll();
      
      if (response.data && Array.isArray(response.data)) {
        const cleanedUsers = response.data.map(cleanUserData);
        setUsers(cleanedUsers);
        calculateStats(cleanedUsers);
        setEditableUsers({});
        await journalApi.logAction('LOAD_USERS', 'Chargement de la liste des utilisateurs');
      } else {
        setUsers([]);
        setError('Format de données invalide reçu du serveur');
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      const errorMessage = error.response?.data?.message || 'Impossible de charger les utilisateurs';
      setError(errorMessage);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculer les statistiques
  const calculateStats = (usersList: UserType[]) => {
    const stats = {
      total: usersList.length,
      active: usersList.filter(u => u.actif).length,
      inactive: usersList.filter(u => !u.actif).length,
      admins: usersList.filter(u => u.role === 'Administrateur').length,
      chefsEquipe: usersList.filter(u => u.role === 'Chef d\'équipe').length,
      operators: usersList.filter(u => u.role === 'Opérateur').length
    };
    setStats(stats);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtrer les utilisateurs
  const filteredUsers = users.filter(user => {
    const nomUtilisateur = user.nomUtilisateur || '';
    const nomComplet = user.nomComplet || '';
    const email = user.email || '';
    
    const matchesSearch = searchTerm === '' || 
      nomUtilisateur.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nomComplet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && user.actif) ||
      (filterStatus === 'inactive' && !user.actif);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Fonction pour afficher une modale de confirmation
  const showConfirmationModal = (
    title: string, 
    message: string, 
    type: typeof confirmModal.type, 
    action: () => Promise<void>
  ) => {
    setConfirmModal({
      show: true,
      title,
      message,
      type,
      action
    });
  };

  // Activer l'édition en ligne pour un champ
  const startEditing = (userId: number, field: keyof UserType, value: string) => {
    setEditableUsers(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value
      }
    }));
  };

  // Sauvegarder les modifications en ligne
  const saveInlineEdit = async (userId: number) => {
    const user = users.find(u => u.id === userId);
    const edits = editableUsers[userId];
    
    if (!user || !edits) return;

    showConfirmationModal(
      'Confirmer les modifications',
      `Voulez-vous enregistrer les modifications pour ${user.nomComplet} ?`,
      'update',
      async () => {
        try {
          setError('');
          setSuccess('');
          
          const updateData: any = {};
          
          if (edits.nomComplet !== undefined && edits.nomComplet.trim() !== user.nomComplet) {
            updateData.NomComplet = edits.nomComplet.trim();
          }
          
          if (edits.email !== undefined && edits.email.trim() !== user.email) {
            updateData.Email = edits.email.trim();
          }
          
          if (edits.agence !== undefined && edits.agence.trim() !== user.agence) {
            updateData.Agence = edits.agence.trim();
          }
          
          if (edits.role !== undefined && edits.role !== user.role) {
            updateData.Role = edits.role;
          }
          
          if (Object.keys(updateData).length > 0) {
            await userApi.update(userId, updateData);
            
            setSuccess('Modifications enregistrées avec succès');
            await journalApi.logAction(
              'UPDATE_USER', 
              `Modification de l'utilisateur: ${user.nomUtilisateur}`
            );
            
            fetchUsers();
          }
          
          setEditableUsers(prev => {
            const newState = { ...prev };
            delete newState[userId];
            return newState;
          });
          
        } catch (error: any) {
          setError(error.response?.data?.message || 'Erreur lors de la modification');
        }
      }
    );
  };

  // Annuler l'édition en ligne
  const cancelInlineEdit = (userId: number) => {
    setEditableUsers(prev => {
      const newState = { ...prev };
      delete newState[userId];
      return newState;
    });
  };

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
    
    if (!formData.nomUtilisateur.trim() || !formData.nomComplet.trim()) {
      setError('Le nom d\'utilisateur et le nom complet sont obligatoires');
      return;
    }
    
    showConfirmationModal(
      'Créer un nouvel utilisateur',
      `Voulez-vous créer le compte pour ${formData.nomComplet} avec le rôle ${formData.role} ?`,
      'create',
      async () => {
        try {
          setError('');
          setSuccess('');
          
          await userApi.create({
            NomUtilisateur: formData.nomUtilisateur.trim(),
            NomComplet: formData.nomComplet.trim(),
            Email: formData.email.trim() || undefined,
            Agence: formData.agence.trim() || undefined,
            Role: formData.role,
            MotDePasse: formData.motDePasse
          });
          
          setSuccess('Utilisateur créé avec succès');
          await journalApi.logAction(
            'CREATE_USER', 
            `Création de l'utilisateur: ${formData.nomUtilisateur}`
          );
          
          setShowCreateModal(false);
          resetForm();
          fetchUsers();
        } catch (error: any) {
          setError(error.response?.data?.message || 'Erreur lors de la création');
        }
      }
    );
  };

  // Modifier un utilisateur (modal)
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingUser) return;
    
    if (!formData.nomComplet.trim()) {
      setError('Le nom complet est obligatoire');
      return;
    }
    
    showConfirmationModal(
      'Mettre à jour l\'utilisateur',
      `Voulez-vous enregistrer les modifications pour ${editingUser.nomComplet} ?`,
      'update',
      async () => {
        try {
          setError('');
          setSuccess('');
          
          const updateData: any = {
            NomComplet: formData.nomComplet.trim(),
            Email: formData.email.trim() || undefined,
            Agence: formData.agence.trim() || undefined,
            Role: formData.role
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
            updateData.MotDePasse = formData.motDePasse;
          }
          
          await userApi.update(editingUser.id, updateData);
          
          setSuccess('Utilisateur modifié avec succès');
          await journalApi.logAction(
            'UPDATE_USER', 
            `Modification de l'utilisateur: ${editingUser.nomUtilisateur}`
          );
          
          setShowEditModal(false);
          resetForm();
          fetchUsers();
        } catch (error: any) {
          setError(error.response?.data?.message || 'Erreur lors de la modification');
        }
      }
    );
  };

  // Activer/Désactiver un utilisateur
  const handleToggleStatus = async (user: UserType) => {
    const action = user.actif ? 'désactiver' : 'réactiver';
    const nomAffichage = user.nomComplet || user.nomUtilisateur || 'Utilisateur';
    
    showConfirmationModal(
      `${user.actif ? 'Désactiver' : 'Réactiver'} l'utilisateur`,
      `Voulez-vous ${action} ${nomAffichage} ?`,
      user.actif ? 'delete' : 'activate',
      async () => {
        try {
          if (user.actif) {
            await userApi.delete(user.id);
            await journalApi.logAction(
              'DEACTIVATE_USER', 
              `Désactivation de l'utilisateur: ${user.nomUtilisateur}`
            );
          } else {
            await userApi.activate(user.id);
            await journalApi.logAction(
              'ACTIVATE_USER', 
              `Réactivation de l'utilisateur: ${user.nomUtilisateur}`
            );
          }
          
          setSuccess(`Utilisateur ${action} avec succès`);
          fetchUsers();
        } catch (error: any) {
          setError(error.response?.data?.message || 'Erreur lors de l\'opération');
        }
      }
    );
  };

  // Réinitialiser le mot de passe
  const handleResetPassword = async (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const newPassword = prompt('Entrez le nouveau mot de passe (minimum 6 caractères):');
    if (!newPassword || newPassword.length < 6) {
      alert('Mot de passe invalide ou trop court');
      return;
    }
    
    showConfirmationModal(
      'Réinitialiser le mot de passe',
      `Voulez-vous réinitialiser le mot de passe de ${user.nomComplet} ?`,
      'resetPassword',
      async () => {
        try {
          await userApi.resetPassword(userId, { newPassword });
          setSuccess('Mot de passe réinitialisé avec succès');
          await journalApi.logAction('RESET_PASSWORD', 'Réinitialisation du mot de passe utilisateur');
        } catch (error: any) {
          setError(error.response?.data?.message || 'Erreur lors de la réinitialisation');
        }
      }
    );
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      nomUtilisateur: '',
      nomComplet: '',
      email: '',
      agence: '',
      role: 'Opérateur',
      motDePasse: '',
      confirmerMotDePasse: ''
    });
    setEditingUser(null);
  };

  // Obtenir la couleur du rôle
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Administrateur': return 'bg-purple-100 text-purple-800';
      case 'Chef d\'équipe': return 'bg-amber-100 text-amber-800';
      case 'Opérateur': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir l'icône du rôle
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Administrateur': return <Shield className="w-4 h-4" />;
      case 'Chef d\'équipe': return <UserCog className="w-4 h-4" />;
      case 'Opérateur': return <User className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Effacer les messages après délai
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-[#0077B6] to-[#2E8B57] rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              Gestion des Comptes
            </h1>
            <p className="text-gray-600 mt-2">
              Gérez les utilisateurs, leurs rôles et leurs permissions
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              onClick={fetchUsers}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-gradient-to-r from-[#0077B6] to-[#2E8B57] text-white rounded-lg hover:shadow-lg transition-shadow"
              title="Actualiser"
              disabled={loading}
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </motion.button>
            
            <motion.button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gradient-to-r from-[#F77F00] to-[#0077B6] text-white rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg transition-shadow"
              disabled={loading}
            >
              <UserPlus className="w-5 h-5" />
              <span>Nouveau compte</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Messages d'erreur/succès */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl"
        >
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
              ✕
            </button>
          </div>
        </motion.div>
      )}
      
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl"
        >
          <div className="flex items-center justify-between">
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="text-green-500 hover:text-green-700">
              ✕
            </button>
          </div>
        </motion.div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, bg: 'from-blue-100 to-cyan-100', text: 'text-[#0077B6]' },
          { label: 'Actifs', value: stats.active, bg: 'from-green-100 to-emerald-100', text: 'text-[#2E8B57]' },
          { label: 'Inactifs', value: stats.inactive, bg: 'from-red-100 to-orange-100', text: 'text-[#F77F00]' },
          { label: 'Administrateurs', value: stats.admins, bg: 'from-purple-100 to-violet-100', text: 'text-purple-600' },
          { label: 'Chefs d\'équipe', value: stats.chefsEquipe, bg: 'from-amber-100 to-yellow-100', text: 'text-amber-600' },
          { label: 'Opérateurs', value: stats.operators, bg: 'from-green-100 to-teal-100', text: 'text-green-600' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
          >
            <div className={`text-2xl font-bold ${stat.text}`}>{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par nom, email ou username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent"
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent"
              disabled={loading}
            >
              <option value="all">Tous les rôles</option>
              {ROLES.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent"
              disabled={loading}
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0077B6] mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement des utilisateurs...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {searchTerm || filterRole !== 'all' || filterStatus !== 'all' 
                ? 'Aucun utilisateur ne correspond aux critères' 
                : 'Aucun utilisateur trouvé'}
            </p>
            {(searchTerm || filterRole !== 'all' || filterStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterRole('all');
                  setFilterStatus('all');
                }}
                className="mt-3 text-[#0077B6] hover:text-[#005a8c] text-sm"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-[#0077B6]/10 to-[#2E8B57]/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Nom d'utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Nom complet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Agence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Création
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsers.map((user) => {
                    const isEditing = editableUsers[user.id];
                    const currentData = isEditing ? { ...user, ...editableUsers[user.id] } : user;
                    
                    return (
                      <motion.tr 
                        key={user.id} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        {/* Nom d'utilisateur */}
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            @{user.nomUtilisateur || 'inconnu'}
                          </div>
                        </td>
                        
                        {/* Nom complet - éditable */}
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <input
                              type="text"
                              value={currentData.nomComplet || ''}
                              onChange={(e) => startEditing(user.id, 'nomComplet', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0077B6] focus:border-transparent"
                              placeholder="Nom complet"
                            />
                          ) : (
                            <div className="font-medium text-gray-900">
                              {user.nomComplet || 'Utilisateur'}
                            </div>
                          )}
                        </td>
                        
                        {/* Rôle - éditable */}
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <select
                              value={currentData.role || 'Opérateur'}
                              onChange={(e) => startEditing(user.id, 'role', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0077B6] focus:border-transparent text-sm"
                            >
                              {ROLES.map(role => (
                                <option key={role} value={role}>{role}</option>
                              ))}
                            </select>
                          ) : (
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${getRoleColor(user.role || 'Opérateur')}`}>
                              {getRoleIcon(user.role || 'Opérateur')}
                              <span className="ml-2">{user.role || 'Opérateur'}</span>
                            </span>
                          )}
                        </td>
                        
                        {/* Agence - éditable */}
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <select
                              value={currentData.agence || ''}
                              onChange={(e) => startEditing(user.id, 'agence', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0077B6] focus:border-transparent text-sm"
                            >
                              <option value="">Sélectionner une agence</option>
                              {AGENCES.map(agence => (
                                <option key={agence} value={agence}>{agence}</option>
                              ))}
                            </select>
                          ) : (
                            <div className="flex items-center text-sm text-gray-900">
                              <Building className="w-4 h-4 mr-2 text-gray-400" />
                              {user.agence || 'Non spécifiée'}
                            </div>
                          )}
                        </td>
                        
                        {/* Statut */}
                        <td className="px-6 py-4">
                          {user.actif ? (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-2" />
                              Actif
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <XCircle className="w-3 h-3 mr-2" />
                              Inactif
                            </span>
                          )}
                        </td>
                        
                        {/* Date de création */}
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {formatDate(user.dateCreation)}
                          </div>
                        </td>
                        
                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {isEditing ? (
                              <>
                                <motion.button
                                  onClick={() => saveInlineEdit(user.id)}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Sauvegarder"
                                >
                                  <Save className="w-4 h-4" />
                                </motion.button>
                                
                                <motion.button
                                  onClick={() => cancelInlineEdit(user.id)}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Annuler"
                                >
                                  <X className="w-4 h-4" />
                                </motion.button>
                              </>
                            ) : (
                              <>
                                <motion.button
                                  onClick={() => startEditing(user.id, 'nomComplet', user.nomComplet || '')}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="p-2 text-[#0077B6] hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Modifier en ligne"
                                >
                                  <Edit className="w-4 h-4" />
                                </motion.button>
                                
                                <motion.button
                                  onClick={() => {
                                    setEditingUser(user);
                                    setFormData({
                                      nomUtilisateur: user.nomUtilisateur || '',
                                      nomComplet: user.nomComplet || '',
                                      email: user.email || '',
                                      agence: user.agence || '',
                                      role: user.role || 'Opérateur',
                                      motDePasse: '',
                                      confirmerMotDePasse: ''
                                    });
                                    setShowEditModal(true);
                                  }}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                  title="Modifier en détail"
                                >
                                  <UserCog className="w-4 h-4" />
                                </motion.button>
                                
                                <motion.button
                                  onClick={() => handleResetPassword(user.id)}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="p-2 text-[#F77F00] hover:bg-amber-50 rounded-lg transition-colors"
                                  title="Réinitialiser mot de passe"
                                >
                                  <Key className="w-4 h-4" />
                                </motion.button>
                                
                                <motion.button
                                  onClick={() => handleToggleStatus(user)}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className={`p-2 rounded-lg transition-colors ${
                                    user.actif 
                                      ? 'text-red-600 hover:bg-red-50' 
                                      : 'text-green-600 hover:bg-green-50'
                                  }`}
                                  title={user.actif ? 'Désactiver' : 'Réactiver'}
                                >
                                  {user.actif ? (
                                    <Trash2 className="w-4 h-4" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4" />
                                  )}
                                </motion.button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 px-6 py-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-gray-600">
                    Affichage de {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} sur {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Précédent
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm ${
                              currentPage === pageNum
                                ? 'bg-[#0077B6] text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

      {/* Modal de création */}
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
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Nouveau compte utilisateur
                  </h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
                
                <form onSubmit={handleCreateUser}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom d'utilisateur *
                      </label>
                      <input
                        type="text"
                        value={formData.nomUtilisateur}
                        onChange={(e) => setFormData({...formData, nomUtilisateur: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent"
                        required
                        placeholder="john.doe"
                        minLength={3}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        value={formData.nomComplet}
                        onChange={(e) => setFormData({...formData, nomComplet: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent"
                        required
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent"
                        placeholder="john@example.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Agence
                      </label>
                      <select
                        value={formData.agence}
                        onChange={(e) => setFormData({...formData, agence: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent"
                      >
                        <option value="">Sélectionner une agence</option>
                        {AGENCES.map(agence => (
                          <option key={agence} value={agence}>{agence}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rôle *
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent"
                      >
                        {ROLES.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mot de passe *
                      </label>
                      <input
                        type="password"
                        value={formData.motDePasse}
                        onChange={(e) => setFormData({...formData, motDePasse: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent"
                        required
                        placeholder="●●●●●●●●"
                        minLength={6}
                      />
                      <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmer le mot de passe *
                      </label>
                      <input
                        type="password"
                        value={formData.confirmerMotDePasse}
                        onChange={(e) => setFormData({...formData, confirmerMotDePasse: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent"
                        required
                        placeholder="●●●●●●●●"
                        minLength={6}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-[#0077B6] to-[#2E8B57] text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
                    >
                      Créer le compte
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal d'édition détaillée */}
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
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Edit className="w-5 h-5" />
                    Modifier le compte
                  </h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
                
                <form onSubmit={handleUpdateUser}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom d'utilisateur
                      </label>
                      <input
                        type="text"
                        value={formData.nomUtilisateur}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 bg-gray-50 rounded-lg"
                      />
                      <p className="text-xs text-gray-500 mt-1">Le nom d'utilisateur ne peut pas être modifié</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        value={formData.nomComplet}
                        onChange={(e) => setFormData({...formData, nomComplet: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Agence
                      </label>
                      <select
                        value={formData.agence}
                        onChange={(e) => setFormData({...formData, agence: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent"
                      >
                        <option value="">Sélectionner une agence</option>
                        {AGENCES.map(agence => (
                          <option key={agence} value={agence}>{agence}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rôle *
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent"
                      >
                        {ROLES.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="border-t pt-4 mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        Changer le mot de passe (optionnel)
                      </h4>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Nouveau mot de passe
                          </label>
                          <input
                            type="password"
                            value={formData.motDePasse}
                            onChange={(e) => setFormData({...formData, motDePasse: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent"
                            placeholder="●●●●●●●●"
                            minLength={6}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Confirmer le mot de passe
                          </label>
                          <input
                            type="password"
                            value={formData.confirmerMotDePasse}
                            onChange={(e) => setFormData({...formData, confirmerMotDePasse: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent"
                            placeholder="●●●●●●●●"
                            minLength={6}
                          />
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-2">
                        Laissez vide pour conserver le mot de passe actuel
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-[#0077B6] to-[#2E8B57] text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
                    >
                      Enregistrer les modifications
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
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${
                    confirmModal.type === 'delete' ? 'bg-red-100 text-red-600' :
                    confirmModal.type === 'activate' ? 'bg-green-100 text-green-600' :
                    confirmModal.type === 'resetPassword' ? 'bg-amber-100 text-amber-600' :
                    confirmModal.type === 'create' ? 'bg-blue-100 text-blue-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {confirmModal.title}
                  </h3>
                </div>
                
                <p className="text-gray-600 mb-6">
                  {confirmModal.message}
                </p>
                
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={async () => {
                      await confirmModal.action();
                      setConfirmModal({ ...confirmModal, show: false });
                    }}
                    className={`px-4 py-2 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow ${
                      confirmModal.type === 'delete' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                      confirmModal.type === 'activate' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      confirmModal.type === 'resetPassword' ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                      confirmModal.type === 'create' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                      'bg-gradient-to-r from-purple-500 to-violet-500'
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