import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, UserPlus, Edit, Trash2, Shield, User, CheckCircle, 
  XCircle, Search, RefreshCw, Eye, Key, Building, Calendar
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
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    supervisors: 0,
    operators: 0
  });

  // Formulaire
  const [formData, setFormData] = useState({
    nomUtilisateur: '',
    nomComplet: '',
    email: '',
    agence: '',
    role: 'Operateur',
    motDePasse: '',
    confirmerMotDePasse: ''
  });

  // Initialiser le formulaire pour l'édition
  const initEditForm = (user: UserType) => {
    setFormData({
      nomUtilisateur: user.nomUtilisateur || '',
      nomComplet: user.nomComplet || '',
      email: user.email || '',
      agence: user.agence || '',
      role: user.role || 'Operateur',
      motDePasse: '',
      confirmerMotDePasse: ''
    });
  };

  // Fonction pour nettoyer les données utilisateur
  const cleanUserData = (user: any): UserType => {
    return {
      id: user.id || user.Id || user.userId || Math.random(),
      nomUtilisateur: user.nomUtilisateur || user.NomUtilisateur || user.username || '',
      nomComplet: user.nomComplet || user.NomComplet || 'Utilisateur',
      email: user.email || user.Email || '',
      agence: user.agence || user.Agence || '',
      role: user.role || user.Role || 'Operateur',
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
      
      // DEBUG: Vérifier la structure des données
      console.log('Données utilisateurs brutes:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // Nettoyer et valider les données
        const cleanedUsers = response.data.map(cleanUserData);
        console.log('Utilisateurs nettoyés:', cleanedUsers);
        setUsers(cleanedUsers);
        calculateStats(cleanedUsers);
        await journalApi.logAction('LOAD_USERS', 'Chargement de la liste des utilisateurs');
      } else {
        console.warn('Les données ne sont pas un tableau:', response.data);
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
      supervisors: usersList.filter(u => u.role === 'Superviseur').length,
      operators: usersList.filter(u => u.role === 'Operateur').length
    };
    setStats(stats);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtrer les utilisateurs avec vérifications de sécurité
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
  };

  // Modifier un utilisateur
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) return;
    
    if (!formData.nomComplet.trim()) {
      setError('Le nom complet est obligatoire');
      return;
    }
    
    try {
      setError('');
      setSuccess('');
      
      // Ne pas envoyer le mot de passe s'il est vide
      const updateData: any = {
        NomComplet: formData.nomComplet.trim(),
        Email: formData.email.trim() || undefined,
        Agence: formData.agence.trim() || undefined,
        Role: formData.role
      };
      
      // Si un nouveau mot de passe est fourni
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
      
      await userApi.update(selectedUser.id, updateData);
      
      setSuccess('Utilisateur modifié avec succès');
      await journalApi.logAction(
        'UPDATE_USER', 
        `Modification de l'utilisateur: ${selectedUser.nomUtilisateur || 'Inconnu'}`
      );
      
      setShowEditModal(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erreur lors de la modification');
    }
  };

  // Supprimer/Désactiver un utilisateur
  const handleDeleteUser = async (user: UserType) => {
    const nomAffichage = user.nomComplet || user.nomUtilisateur || 'Utilisateur';
    if (!window.confirm(`Êtes-vous sûr de vouloir ${user.actif ? 'désactiver' : 'réactiver'} ${nomAffichage} ?`)) {
      return;
    }
    
    try {
      if (user.actif) {
        await userApi.delete(user.id);
        await journalApi.logAction(
          'DEACTIVATE_USER', 
          `Désactivation de l'utilisateur: ${user.nomUtilisateur || user.id}`
        );
      } else {
        await userApi.activate(user.id);
        await journalApi.logAction(
          'ACTIVATE_USER', 
          `Réactivation de l'utilisateur: ${user.nomUtilisateur || user.id}`
        );
      }
      
      setSuccess(`Utilisateur ${user.actif ? 'désactivé' : 'réactivé'} avec succès`);
      fetchUsers();
    } catch (error: any) {
      console.error('Erreur:', error);
      setError(error.response?.data?.message || 'Erreur lors de l\'opération');
    }
  };

  // Réinitialiser le mot de passe
  const handleResetPassword = async (userId: number) => {
    const newPassword = prompt('Entrez le nouveau mot de passe (minimum 6 caractères):');
    if (!newPassword || newPassword.length < 6) {
      alert('Mot de passe invalide ou trop court');
      return;
    }
    
    const confirmMessage = 'Êtes-vous sûr de vouloir réinitialiser le mot de passe ?';
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    try {
      await userApi.resetPassword(userId, { newPassword });
      setSuccess('Mot de passe réinitialisé avec succès');
      await journalApi.logAction('RESET_PASSWORD', 'Réinitialisation du mot de passe utilisateur');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erreur lors de la réinitialisation');
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      nomUtilisateur: '',
      nomComplet: '',
      email: '',
      agence: '',
      role: 'Operateur',
      motDePasse: '',
      confirmerMotDePasse: ''
    });
    setSelectedUser(null);
  };

  // Obtenir la couleur du rôle
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Administrateur': return 'bg-purple-100 text-purple-800';
      case 'Superviseur': return 'bg-blue-100 text-blue-800';
      case 'Operateur': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir l'icône du rôle
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Administrateur': return <Shield className="w-3 h-3" />;
      case 'Superviseur': return <Eye className="w-3 h-3" />;
      case 'Operateur': return <User className="w-3 h-3" />;
      default: return <User className="w-3 h-3" />;
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

  // Fonction pour obtenir l'initiale sécurisée
  const getSafeInitial = (name: string | undefined): string => {
    if (!name || typeof name !== 'string') return '?';
    return name.charAt(0).toUpperCase();
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blueMain to-greenMain rounded-xl">
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
              className="p-2 bg-gradient-to-r from-blueMain to-greenMain text-white rounded-lg hover:shadow-lg transition-shadow"
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
              className="px-4 py-2 bg-gradient-to-r from-orangeMain to-blueMain text-white rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg transition-shadow"
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
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-gray-600">Actifs</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          <div className="text-sm text-gray-600">Inactifs</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">{stats.admins}</div>
          <div className="text-sm text-gray-600">Administrateurs</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{stats.supervisors}</div>
          <div className="text-sm text-gray-600">Superviseurs</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{stats.operators}</div>
          <div className="text-sm text-gray-600">Opérateurs</div>
        </div>
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blueMain focus:border-transparent"
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blueMain focus:border-transparent"
              disabled={loading}
            >
              <option value="all">Tous les rôles</option>
              <option value="Administrateur">Administrateur</option>
              <option value="Superviseur">Superviseur</option>
              <option value="Operateur">Opérateur</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blueMain focus:border-transparent"
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blueMain mx-auto"></div>
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
                className="mt-3 text-blueMain hover:text-blue-700 text-sm"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Utilisateur
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
                    const nomAffichage = user.nomComplet || user.nomUtilisateur || 'Utilisateur';
                    const emailAffichage = user.email || '';
                    const agenceAffichage = user.agence || 'Non spécifiée';
                    
                    return (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-r from-blueMain/10 to-greenMain/10 text-blueMain font-semibold mr-3">
                              {/* CORRECTION ICI : Utilisation de getSafeInitial */}
                              {getSafeInitial(nomAffichage)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{nomAffichage}</div>
                              <div className="text-sm text-gray-500">
                                @{user.nomUtilisateur || 'inconnu'}
                                {emailAffichage && <span className="ml-2">• {emailAffichage}</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role || 'Operateur')}`}>
                            {getRoleIcon(user.role || 'Operateur')}
                            <span className="ml-1">{user.role || 'Opérateur'}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-900">
                            <Building className="w-4 h-4 mr-1 text-gray-400" />
                            {agenceAffichage}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {user.actif ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Actif
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <XCircle className="w-3 h-3 mr-1" />
                              Inactif
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                            {formatDate(user.dateCreation)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <motion.button
                              onClick={() => {
                                setSelectedUser(user);
                                initEditForm(user);
                                setShowEditModal(true);
                              }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            
                            <motion.button
                              onClick={() => handleResetPassword(user.id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Réinitialiser mot de passe"
                            >
                              <Key className="w-4 h-4" />
                            </motion.button>
                            
                            <motion.button
                              onClick={() => handleDeleteUser(user)}
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
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination améliorée */}
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
                                ? 'bg-blueMain text-white'
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
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blueMain focus:border-transparent"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blueMain focus:border-transparent"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blueMain focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Agence
                    </label>
                    <input
                      type="text"
                      value={formData.agence}
                      onChange={(e) => setFormData({...formData, agence: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blueMain focus:border-transparent"
                      placeholder="Abidjan-Cocody"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rôle *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blueMain focus:border-transparent"
                    >
                      <option value="Operateur">Opérateur</option>
                      <option value="Superviseur">Superviseur</option>
                      <option value="Administrateur">Administrateur</option>
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blueMain focus:border-transparent"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blueMain focus:border-transparent"
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
                    className="px-4 py-2 bg-gradient-to-r from-blueMain to-greenMain text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
                  >
                    Créer le compte
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal d'édition */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blueMain focus:border-transparent"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blueMain focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Agence
                    </label>
                    <input
                      type="text"
                      value={formData.agence}
                      onChange={(e) => setFormData({...formData, agence: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blueMain focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rôle *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blueMain focus:border-transparent"
                    >
                      <option value="Operateur">Opérateur</option>
                      <option value="Superviseur">Superviseur</option>
                      <option value="Administrateur">Administrateur</option>
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blueMain focus:border-transparent"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blueMain focus:border-transparent"
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
                    className="px-4 py-2 bg-gradient-to-r from-blueMain to-greenMain text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
                  >
                    Enregistrer les modifications
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default GestionComptes;