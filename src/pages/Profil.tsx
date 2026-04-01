import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar";
import { useAuth } from '../hooks/useAuth';
import { UtilisateursService } from '../Services/api/utilisateurs';
import {
  UserIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';

// ✅ Ajout du champ nomComplet
interface UserProfile {
  id: number;
  nomUtilisateur: string;
  nomComplet?: string;
  role: 'Administrateur' | 'Gestionnaire' | "Chef d'équipe" | 'Opérateur';
  coordination: string;
  email?: string;
  telephone?: string;
  dateCreation?: string;
  derniereConnexion?: string;
}

const Profil: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Responsive
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
  const cardClass     = isMobile ? 'p-4' : isTablet ? 'p-6' : 'p-8';
  const titleSize     = isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl';
  const textSize      = isMobile ? 'text-xs' : isTablet ? 'text-sm' : 'text-base';
  const labelSize     = isMobile ? 'text-xs' : 'text-sm';
  const valueSize     = isMobile ? 'text-sm' : isTablet ? 'text-base' : 'text-lg';
  const iconSize      = isMobile ? 'w-8 h-8' : isTablet ? 'w-9 h-9' : 'w-10 h-10';
  const spacing       = isMobile ? 'space-y-3' : isTablet ? 'space-y-4' : 'space-y-6';
  const gridCols      = isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-3';

  // ✅ Charger le profil avec nomComplet
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);

      if (user) {
        const userId = (user as any).id;

        if (userId) {
          try {
            const userData = await UtilisateursService.getUtilisateurById(userId);
            setProfile({
              id: userData.id,
              nomUtilisateur: userData.nomUtilisateur,
              nomComplet: userData.nomComplet,           // ✅ récupéré depuis l'API
              role: userData.role as UserProfile['role'],
              coordination: userData.coordination,
              email: userData.email,
              telephone: userData.telephone,
              dateCreation: userData.dateCreation,
              derniereConnexion: userData.derniereConnexion,
            });
          } catch (apiError) {
            console.error('Erreur API getUtilisateurById:', apiError);
            // Fallback sur les données du contexte auth
            setProfile({
              id: userId,
              nomUtilisateur: (user as any).nomUtilisateur || 'Utilisateur',
              nomComplet: (user as any).nomComplet,      // ✅ fallback depuis le contexte
              role: (user as any).role || 'Opérateur',
              coordination: (user as any).coordination || 'Non défini',
              email: (user as any).email,
              telephone: (user as any).telephone,
              dateCreation: (user as any).dateCreation,
              derniereConnexion: (user as any).derniereConnexion,
            });
          }
        } else {
          setProfile({
            id: 0,
            nomUtilisateur: (user as any).nomUtilisateur || 'Utilisateur',
            nomComplet: (user as any).nomComplet,
            role: (user as any).role || 'Opérateur',
            coordination: (user as any).coordination || 'Non défini',
            email: (user as any).email,
            telephone: (user as any).telephone,
            dateCreation: (user as any).dateCreation,
            derniereConnexion: (user as any).derniereConnexion,
          });
        }
      } else {
        setError('Utilisateur non connecté');
      }
    } catch (err: any) {
      console.error('Erreur fetchProfile:', err);
      setError('Erreur lors de la récupération du profil');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setError('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre');
      return;
    }
    if (!currentPassword) {
      setError('Le mot de passe actuel est requis');
      return;
    }

    setChangingPassword(true);
    setError('');
    setSuccess('');

    try {
      const { apiClient } = await import('../Services/api/client');
      await apiClient.post('/profil/change-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setSuccess('Mot de passe modifié avec succès !');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Erreur handleChangePassword:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Erreur lors du changement de mot de passe'
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Administrateur':  return 'from-purple-600 to-purple-800';
      case 'Gestionnaire':    return 'from-blue-600 to-blue-800';
      case "Chef d'équipe":   return 'from-green-600 to-green-800';
      case 'Opérateur':       return 'from-gray-600 to-gray-800';
      default:                return 'from-orange-600 to-orange-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Navbar />
        <div className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white py-4 shadow-lg">
          <div className={containerClass}>
            <h1 className={`${titleSize} font-bold`}>Mon Profil</h1>
          </div>
        </div>
        <div className={containerClass}>
          <div className={`bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 ${cardClass} text-center`}>
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#F77F00] border-t-transparent rounded-full animate-spin"></div>
              <p className={`text-gray-600 font-medium ${textSize}`}>Chargement du profil...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar />

      {/* En-tête */}
      <div className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white py-4 shadow-lg">
        <div className={containerClass}>
          <h1 className={`${titleSize} font-bold`}>Mon Profil</h1>
          <p className={`text-white/90 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            Gestion de votre compte et sécurité
          </p>
        </div>
      </div>

      <div className={containerClass}>

        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-red-50 border border-red-200 text-red-700 ${isMobile ? 'px-3 py-2 rounded-lg' : 'px-4 py-3 rounded-2xl'} mb-4 md:mb-6`}
          >
            <div className="flex items-center gap-3">
              <span className="text-red-500">⚠</span>
              <span className="text-sm font-medium flex-1">{error}</span>
              <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 font-bold">×</button>
            </div>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-green-50 border border-green-200 text-green-700 ${isMobile ? 'px-3 py-2 rounded-lg' : 'px-4 py-3 rounded-2xl'} mb-4 md:mb-6`}
          >
            <div className="flex items-center gap-3">
              <span className="text-green-500">✓</span>
              <span className="text-sm font-medium flex-1">{success}</span>
              <button onClick={() => setSuccess('')} className="text-green-500 hover:text-green-700 font-bold">×</button>
            </div>
          </motion.div>
        )}

        {/* Layout principal */}
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 mb-6">

          {/* Colonne informations */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 ${cardClass} h-full`}
            >
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className={`${iconSize} bg-gradient-to-r from-[#0077B6] to-[#2E8B57] rounded-xl flex items-center justify-center`}>
                  <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div>
                  <h2 className={`${isMobile ? 'text-base' : 'text-xl'} font-bold text-gray-800`}>
                    Informations Personnelles
                  </h2>
                  <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    Détails de votre compte
                  </p>
                </div>
              </div>

              {profile && (
                <div className={spacing}>

                  {/* ✅ Nom complet — affiché en premier si disponible */}
                  {profile.nomComplet && (
                    <div>
                      <label className={`block font-semibold text-gray-700 mb-1 md:mb-2 ${labelSize}`}>
                        Nom
                      </label>
                      <div className={`w-full bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-semibold ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-3'}`}>
                        {profile.nomComplet}
                      </div>
                    </div>
                  )}

                  {/* ✅ Nom d'utilisateur */}
                  <div>
                    <label className={`block font-semibold text-gray-700 mb-1 md:mb-2 ${labelSize}`}>
                      Nom d'utilisateur
                    </label>
                    <div className={`w-full bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-3'}`}>
                      {profile.nomUtilisateur}
                    </div>
                  </div>

                  {/* Coordination */}
                  <div>
                    <label className={`block font-semibold text-gray-700 mb-1 md:mb-2 ${labelSize}`}>
                      Coordination
                    </label>
                    <div className={`w-full bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-3'}`}>
                      {profile.coordination}
                    </div>
                  </div>

                  {/* Email */}
                  {profile.email && (
                    <div>
                      <label className={`block font-semibold text-gray-700 mb-1 md:mb-2 ${labelSize}`}>
                        Email
                      </label>
                      <div className={`w-full bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-3'}`}>
                        {profile.email}
                      </div>
                    </div>
                  )}

                  {/* Téléphone */}
                  {profile.telephone && (
                    <div>
                      <label className={`block font-semibold text-gray-700 mb-1 md:mb-2 ${labelSize}`}>
                        Téléphone
                      </label>
                      <div className={`w-full bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-3'}`}>
                        {profile.telephone}
                      </div>
                    </div>
                  )}

                  {/* Rôle */}
                  <div>
                    <label className={`block font-semibold text-gray-700 mb-1 md:mb-2 ${labelSize}`}>
                      Rôle
                    </label>
                    <div className={`inline-block px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-white font-medium text-sm bg-gradient-to-r ${getRoleColor(profile.role)}`}>
                      {profile.role}
                    </div>
                  </div>

                </div>
              )}
            </motion.div>
          </div>

          {/* Colonne sécurité */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 ${cardClass} h-full`}
            >
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className={`${iconSize} bg-gradient-to-r from-[#F77F00] to-[#FF9E40] rounded-xl flex items-center justify-center`}>
                  <ShieldCheckIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div>
                  <h2 className={`${isMobile ? 'text-base' : 'text-xl'} font-bold text-gray-800`}>Sécurité</h2>
                  <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Gestion du mot de passe</p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className={spacing}>
                <div>
                  <label className={`block font-semibold text-gray-700 mb-1 md:mb-2 ${labelSize}`}>
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={`w-full bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-all ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-3'}`}
                    required
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className={`block font-semibold text-gray-700 mb-1 md:mb-2 ${labelSize}`}>
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-all ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-3'}`}
                    required
                    placeholder="Minimum 8 caractères"
                  />
                  <p className="text-gray-500 mt-1 text-xs">
                    Minimum 8 caractères, avec une majuscule, une minuscule et un chiffre
                  </p>
                </div>

                <div>
                  <label className={`block font-semibold text-gray-700 mb-1 md:mb-2 ${labelSize}`}>
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-all ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-3'}`}
                    required
                    placeholder="••••••••"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={changingPassword}
                  whileHover={{ scale: changingPassword ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white ${isMobile ? 'py-3 rounded-lg text-sm' : 'py-4 rounded-xl'} hover:from-[#e46f00] hover:to-[#FF8C00] disabled:opacity-50 font-semibold transition-all shadow-lg flex items-center justify-center gap-2 mt-3 md:mt-4`}
                >
                  {changingPassword ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Modification...</span>
                    </>
                  ) : (
                    <>
                      <KeyIcon className="w-4 h-4 md:w-5 md:h-5" />
                      <span>Changer le mot de passe</span>
                    </>
                  )}
                </motion.button>
              </form>

              {/* Déconnexion */}
              <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-orange-100">
                <motion.button
                  onClick={() => setShowLogoutConfirm(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full bg-gradient-to-r from-red-500 to-red-600 text-white ${isMobile ? 'py-3 rounded-lg text-sm' : 'py-4 rounded-xl'} hover:from-red-600 hover:to-red-700 font-semibold transition-all shadow-lg`}
                >
                  Se déconnecter
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Résumé */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 ${cardClass} mb-4 md:mb-6`}
          >
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className={`${iconSize} bg-gradient-to-r from-[#0077B6] to-[#2E8B57] rounded-xl flex items-center justify-center`}>
                <BuildingOfficeIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div>
                <h2 className={`${isMobile ? 'text-base' : 'text-xl'} font-bold text-gray-800`}>Résumé</h2>
                <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Aperçu de votre compte</p>
              </div>
            </div>

            <div className={`grid ${gridCols} gap-3 md:gap-4`}>

              {/* ✅ Carte Nom — affiche nomComplet ou nomUtilisateur */}
              <div className="bg-gradient-to-r from-[#0077B6] to-[#2E8B57] text-white rounded-xl md:rounded-2xl p-3 md:p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-blue-100 text-xs md:text-sm font-medium">
                      {profile.nomComplet ? 'Nom' : "Nom d'utilisateur"}
                    </p>
                    <p className={`font-bold mt-1 truncate ${valueSize}`}>
                      {profile.nomComplet || profile.nomUtilisateur}
                    </p>
                    {/* ✅ Si on affiche le nom complet, montrer aussi le nom d'utilisateur en dessous */}
                    {profile.nomComplet && (
                      <p className="text-blue-200 text-xs mt-0.5 truncate">
                        @{profile.nomUtilisateur}
                      </p>
                    )}
                  </div>
                  <div className={`${isMobile ? 'bg-white/20 p-2 rounded-lg' : 'bg-white/20 p-3 rounded-xl'} flex-shrink-0 ml-2`}>
                    <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Carte Rôle */}
              <div className={`bg-gradient-to-r ${getRoleColor(profile.role)} text-white rounded-xl md:rounded-2xl p-3 md:p-5 shadow-lg`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-xs md:text-sm font-medium">Rôle</p>
                    <p className={`font-bold mt-1 ${valueSize}`}>
                      {isMobile && profile.role.length > 10
                        ? profile.role.substring(0, 8) + '...'
                        : profile.role}
                    </p>
                  </div>
                  <div className="bg-white/20 p-2 md:p-3 rounded-lg md:rounded-xl">
                    <ShieldCheckIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Carte Coordination */}
              <div className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white rounded-xl md:rounded-2xl p-3 md:p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-orange-100 text-xs md:text-sm font-medium">Coordination</p>
                    <p className={`font-bold mt-1 truncate ${valueSize}`}>
                      {isMobile && profile.coordination.length > 15
                        ? profile.coordination.substring(0, 12) + '...'
                        : profile.coordination}
                    </p>
                  </div>
                  <div className="bg-white/20 p-2 md:p-3 rounded-lg md:rounded-xl flex-shrink-0 ml-2">
                    <BuildingOfficeIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* Support technique */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl md:rounded-2xl p-4 md:p-6"
        >
          <div className="flex items-start gap-3 md:gap-4">
            <div className={`${iconSize} bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0`}>
              <EnvelopeIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className={`font-bold text-gray-800 mb-2 ${isMobile ? 'text-sm' : 'text-lg'}`}>
                Support Technique
              </h3>
              <p className={`text-gray-700 mb-3 ${textSize}`}>
                En cas de difficulté, contactez le support technique :
              </p>
              <div className="bg-white/80 border border-blue-100 rounded-lg md:rounded-xl p-3 md:p-4">
                <a
                  href="mailto:support@gescard.com"
                  className="text-blue-600 hover:text-blue-800 font-bold text-sm md:text-base break-all"
                >
                  support@gescard.com
                </a>
              </div>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Modal confirmation déconnexion */}
      {showLogoutConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`bg-white ${isMobile ? 'rounded-lg p-4' : 'rounded-2xl p-6'} shadow-2xl max-w-sm w-full mx-auto border border-orange-100`}
          >
            <div className="text-center">
              <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} bg-gradient-to-r from-red-500 to-red-600 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4`}>
                <ShieldCheckIcon className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>

              <h3 className={`font-bold text-gray-800 mb-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                Confirmer la déconnexion
              </h3>

              <p className={`text-gray-600 mb-4 md:mb-6 ${textSize}`}>
                Êtes-vous sûr de vouloir vous déconnecter ?
              </p>

              <div className={`flex gap-2 md:gap-3 justify-center ${isMobile ? 'flex-col' : ''}`}>
                <motion.button
                  onClick={() => setShowLogoutConfirm(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`text-gray-600 border border-gray-300 hover:bg-gray-50 transition-all font-semibold ${isMobile ? 'py-2 rounded-lg text-sm' : 'px-6 py-3 rounded-xl'}`}
                >
                  Annuler
                </motion.button>
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all font-semibold shadow-lg ${isMobile ? 'py-2 rounded-lg text-sm mt-2' : 'px-6 py-3 rounded-xl'}`}
                >
                  Se déconnecter
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Profil;