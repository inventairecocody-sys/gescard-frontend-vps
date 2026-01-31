import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { journalApi } from "../service/api";

interface NavbarProps {
  role?: string;
}

const Navbar: React.FC<NavbarProps> = ({ role }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userRole, setUserRole] = useState("Operateur");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      if (width < 1024) setIsMobile(true); // Changé à 1024 pour tablette
      else setIsMobile(false);
    };
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('scroll', handleScroll);
    
    const storedRole = role || 
                      localStorage.getItem("role") || 
                      localStorage.getItem("Role") || 
                      "Operateur";
    setUserRole(storedRole);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [role]);

  const handleAccueilClick = async (e: React.MouseEvent) => {
    if (location.pathname === "/home" || location.pathname === "/dashboard") {
      e.preventDefault();
      
      await journalApi.logAction(
        'REFRESH_ACCUEIL', 
        'Rafraîchissement manuel de la page d\'accueil'
      );
      
      window.location.reload();
    }
  };

  const toggleMenu = async () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    
    if (newState) {
      await journalApi.logAction(
        'MENU_MOBILE_OUVERT', 
        'Ouverture du menu mobile'
      );
    }
  };

  const isActiveLink = (path: string) => {
    if (path === "/home") {
      return location.pathname === "/home" || location.pathname === "/dashboard";
    }
    return location.pathname === path;
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirmed = async () => {
    const userId = localStorage.getItem("userId");
    const nomUtilisateur = localStorage.getItem("nomUtilisateur");
    
    const itemsToRemove = [
      "token", "role", "Role", 
      "NomUtilisateur", "nomUtilisateur",
      "NomComplet", "nomComplet",
      "Agence", "agence",
      "Email", "email",
      "userId", "loginTime"
    ];
    
    itemsToRemove.forEach(item => localStorage.removeItem(item));
    
    try {
      await journalApi.logLogout(nomUtilisateur || userId || 'unknown', true);
      console.log('✅ Déconnexion journalisée avec succès');
    } catch (error) {
      console.warn('⚠️ Journalisation de la déconnexion échouée:', error);
    } finally {
      setShowLogoutConfirm(false);
      navigate("/");
    }
  };

  const handleJournalClick = async (e: React.MouseEvent) => {
    await journalApi.logAction(
      'ACCES_JOURNAL', 
      'Accès à la page du journal d\'activité'
    );
    
    if (location.pathname === "/journal") {
      e.preventDefault();
      window.location.reload();
    }
  };

  const handleRechercheClick = async () => {
    await journalApi.logAction(
      'ACCES_RECHERCHE', 
      'Accès à la page de recherche'
    );
  };

  const handleDashboardClick = async () => {
    await journalApi.logAction(
      'ACCES_DASHBOARD', 
      'Accès au tableau de bord'
    );
  };

  const handleProfilClick = async () => {
    await journalApi.logAction(
      'ACCES_PROFIL', 
      'Accès à la page de profil'
    );
  };

  const handleGestionComptesClick = async () => {
    await journalApi.logAction(
      'ACCES_GESTION_COMPTES', 
      'Accès à la page de gestion des comptes'
    );
  };

  // ✅ CONFIGURATION DES ACCÈS PAR RÔLE
  const canAccessDashboard = ["Administrateur", "Superviseur"].includes(userRole);
  const canAccessJournal = ["Administrateur"].includes(userRole);
  const canAccessProfil = true;
  const canAccessGestionComptes = ["Administrateur"].includes(userRole);

  // ✅ Navigation items avec labels raccourcis pour desktop
  const navItems = [
    {
      path: "/home",
      label: "Accueil",
      labelShort: "🏠", // Version courte pour desktop
      icon: "🏠",
      color: "from-orange-500 to-orange-400",
      hoverColor: "hover:bg-orange-50 hover:text-orange-600",
      accessible: true,
      onClick: handleAccueilClick
    },
    {
      path: "/inventaire",
      label: "Recherche",
      labelShort: "🔍", // Version courte
      icon: "🔍",
      color: "from-blue-600 to-green-500",
      hoverColor: "hover:bg-blue-50 hover:text-blue-600",
      accessible: true,
      onClick: handleRechercheClick
    },
    {
      path: "/dashboard",
      label: "Tableau",
      labelShort: "📊", // Version courte
      icon: "📊",
      color: "from-green-500 to-blue-600",
      hoverColor: "hover:bg-green-50 hover:text-green-600",
      accessible: canAccessDashboard,
      onClick: handleDashboardClick
    },
    {
      path: "/journal",
      label: "Journal",
      labelShort: "📝", // Version courte
      icon: "📝",
      color: "from-purple-500 to-indigo-600",
      hoverColor: "hover:bg-purple-50 hover:text-purple-600",
      accessible: canAccessJournal,
      onClick: handleJournalClick
    },
    {
      path: "/gestion-comptes",
      label: "Comptes",
      labelShort: "👥", // Version courte
      icon: "👥",
      color: "from-purple-600 to-indigo-700",
      hoverColor: "hover:bg-purple-50 hover:text-purple-700",
      accessible: canAccessGestionComptes,
      onClick: handleGestionComptesClick
    },
    {
      path: "/profil",
      label: "Profil",
      labelShort: "👤", // Version courte
      icon: "👤",
      color: "from-orange-500 to-blue-600",
      hoverColor: "hover:bg-orange-50 hover:text-orange-600",
      accessible: canAccessProfil,
      onClick: handleProfilClick
    }
  ];

  const getFirstName = () => {
    const nomComplet = localStorage.getItem("nomComplet") || localStorage.getItem("NomComplet") || "";
    return nomComplet.split(' ')[0] || "Utilisateur";
  };

  const getFormattedAgence = () => {
    const agence = localStorage.getItem("agence") || localStorage.getItem("Agence") || "";
    if (agence.length > 15) {
      return agence.substring(0, 12) + '...';
    }
    return agence || "Non spécifiée";
  };

  const navbarClasses = `
    fixed top-0 left-0 right-0 z-50 
    transition-all duration-300 ease-in-out
    ${isScrolled 
      ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100' 
      : 'bg-white/90 backdrop-blur-md border-b border-gray-100'
    }
  `;

  return (
    <>
      <nav 
        className={navbarClasses}
        role="navigation"
        aria-label="Navigation principale"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-14 md:h-16">
            {/* Logo - Version compacte */}
            <div className="flex items-center flex-shrink-0">
              <Link to="/home" className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-r from-orange-500 to-blue-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-white text-sm md:text-base">🎴</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-2 h-2 md:w-2.5 md:h-2.5 bg-green-500 rounded-full border border-white animate-pulse"></div>
                </div>
                
                <div className="text-left hidden md:block">
                  <span className="font-bold bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent text-sm">
                    GESCARD
                  </span>
                  <span className="block text-xs text-gray-500 truncate max-w-[120px]">
                    Cocody • EMS
                  </span>
                </div>
              </Link>
            </div>

            {/* Menu Desktop - VERSION COMPACTE ET OPTIMISÉE */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2 flex-1 justify-center">
              {navItems
                .filter(item => item.accessible)
                .map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={item.onClick}
                    className={`relative px-3 py-2 rounded-lg transition-all duration-300 font-medium text-xs xl:text-sm whitespace-nowrap ${
                      isActiveLink(item.path)
                        ? `text-white bg-gradient-to-r ${item.color} shadow-md`
                        : `text-gray-700 ${item.hoverColor}`
                    }`}
                    aria-current={isActiveLink(item.path) ? "page" : undefined}
                    title={item.label} // Tooltip avec le nom complet
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="text-sm">{item.icon}</span>
                      {/* Affiche le label court sur desktop */}
                      <span className="hidden xl:inline">{item.label}</span>
                      <span className="xl:hidden">{item.labelShort}</span>
                    </span>
                    {isActiveLink(item.path) && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2/3 h-0.5 bg-white rounded-full"
                      />
                    )}
                  </Link>
                ))}
              
              {/* Bouton Déconnexion compact */}
              <motion.button
                onClick={handleLogoutClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-xs xl:text-sm font-medium shadow hover:shadow-md transition-all duration-300 ml-1"
                title="Déconnexion"
              >
                <span className="flex items-center gap-1.5">
                  <span>🚪</span>
                  <span className="hidden xl:inline">Déconnexion</span>
                  <span className="xl:hidden">Sortir</span>
                </span>
              </motion.button>

              {/* Indicateur de rôle compact */}
              <div className="ml-2 px-2 py-1 bg-gradient-to-r from-orange-500/10 to-blue-600/10 rounded-full border border-orange-500/20">
                <span className="text-xs font-semibold text-orange-600 truncate max-w-[80px]">
                  {userRole}
                </span>
              </div>
            </div>

            {/* Menu pour tablettes (md à lg) */}
            <div className="hidden md:flex lg:hidden items-center gap-2">
              {navItems
                .filter(item => item.accessible)
                .slice(0, 3) // Affiche seulement les 3 premiers sur tablette
                .map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={item.onClick}
                    className={`relative px-2 py-2 rounded-lg transition-all duration-300 font-medium text-xs ${
                      isActiveLink(item.path)
                        ? `text-white bg-gradient-to-r ${item.color} shadow-md`
                        : `text-gray-700 ${item.hoverColor}`
                    }`}
                    title={item.label}
                  >
                    <span className="flex items-center gap-1">
                      <span className="text-sm">{item.icon}</span>
                    </span>
                  </Link>
                ))}
              
              {/* Menu déroulant pour les autres liens sur tablette */}
              <div className="relative group">
                <button className="px-2 py-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:bg-gray-200">
                  <span className="text-sm">⋯</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {navItems
                    .filter(item => item.accessible)
                    .slice(3) // Affiche les liens restants
                    .map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={item.onClick}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                      >
                        <span className="flex items-center gap-2">
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </span>
                      </Link>
                    ))}
                </div>
              </div>
              
              <motion.button
                onClick={handleLogoutClick}
                whileTap={{ scale: 0.95 }}
                className="px-2 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white shadow"
                title="Déconnexion"
              >
                <span className="text-sm">🚪</span>
              </motion.button>
            </div>

            {/* Menu Mobile (smartphones) */}
            <div className="flex items-center gap-2 md:hidden">
              <div className="px-2 py-1 bg-gradient-to-r from-orange-500/10 to-blue-600/10 rounded-full border border-orange-500/20">
                <span className="text-xs font-semibold text-orange-600">
                  {userRole.length > 8 ? userRole.substring(0, 6) + '...' : userRole}
                </span>
              </div>
              
              <motion.button
                onClick={handleLogoutClick}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white shadow"
                title="Déconnexion"
              >
                <span className="text-sm">🚪</span>
              </motion.button>
              
              <motion.button
                onClick={toggleMenu}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-lg shadow-lg ${
                  isMenuOpen 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white' 
                    : 'bg-gradient-to-r from-blue-600 to-green-500 text-white'
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  {isMenuOpen ? '✕' : '☰'}
                </div>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Overlay Mobile */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Menu Mobile */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="md:hidden bg-white shadow-2xl border-t border-gray-200 absolute top-full left-0 right-0 overflow-hidden z-50"
              style={{ maxHeight: "calc(100vh - 56px)" }}
            >
              <div className="py-2 px-2 space-y-1 max-h-[70vh] overflow-y-auto">
                {navItems
                  .filter(item => item.accessible)
                  .map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={(e) => {
                        if (item.onClick) item.onClick(e);
                        setIsMenuOpen(false);
                      }}
                      className={`block px-4 py-3 rounded-xl transition-all duration-300 font-semibold text-sm relative ${
                        isActiveLink(item.path)
                          ? `text-white bg-gradient-to-r ${item.color} shadow-lg`
                          : `text-gray-700 bg-gray-50 hover:bg-gray-100`
                      }`}
                    >
                      <span className="flex items-center justify-between">
                        <span className="flex items-center gap-3">
                          <span className="text-lg">{item.icon}</span>
                          <span>{item.label}</span>
                        </span>
                        
                        {isActiveLink(item.path) && (
                          <motion.div
                            layoutId="mobile-navbar-indicator"
                            className="w-2 h-2 bg-white rounded-full"
                          />
                        )}
                      </span>
                    </Link>
                  ))}
                
                {/* Info utilisateur */}
                <div className="border-t border-gray-200 my-2 pt-2">
                  <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-blue-50 rounded-xl">
                    <div className="text-xs text-gray-600 mb-1">Connecté en tant que</div>
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-orange-600">{userRole}</div>
                      <div className="text-xs text-blue-600 font-medium">{getFirstName()}</div>
                    </div>
                    
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/90 rounded-lg p-2 text-center">
                        <div className="text-gray-500">Agence</div>
                        <div className="font-medium text-gray-800 truncate">
                          {getFormattedAgence()}
                        </div>
                      </div>
                      <div className="bg-white/90 rounded-lg p-2 text-center">
                        <div className="text-gray-500">Statut</div>
                        <div className="font-medium text-green-500">En ligne</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Actions rapides */}
                <div className="px-4 py-2">
                  <div className="text-xs text-gray-500 mb-2">Actions rapides</div>
                  <div className="grid grid-cols-2 gap-2">
                    <motion.button
                      onClick={async () => {
                        await handleProfilClick();
                        navigate("/profil");
                        setIsMenuOpen(false);
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-blue-500/20 rounded-lg p-3 text-center hover:bg-blue-50 transition-colors"
                    >
                      <div className="text-blue-600 text-sm font-medium">👤 Profil</div>
                    </motion.button>
                    <motion.button
                      onClick={async () => {
                        await handleRechercheClick();
                        navigate("/inventaire");
                        setIsMenuOpen(false);
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gradient-to-r from-orange-500/10 to-blue-600/10 border border-orange-500/20 rounded-lg p-3 text-center hover:bg-orange-50 transition-colors"
                    >
                      <div className="text-orange-600 text-sm font-medium">🔍 Recherche</div>
                    </motion.button>
                  </div>
                  
                  {/* Bouton Journal (seulement si admin) */}
                  {canAccessJournal && (
                    <motion.button
                      onClick={async (e) => {
                        await handleJournalClick(e);
                        if (!(e as any).defaultPrevented) {
                          navigate("/journal");
                          setIsMenuOpen(false);
                        }
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full mt-2 bg-gradient-to-r from-purple-500/10 to-indigo-600/10 border border-purple-500/20 rounded-lg p-3 text-center hover:bg-purple-50 transition-colors"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-purple-600 text-sm font-medium">📝 Journal</span>
                      </div>
                    </motion.button>
                  )}
                  
                  {/* Bouton Gestion des Comptes (seulement si admin) */}
                  {canAccessGestionComptes && (
                    <motion.button
                      onClick={async () => {
                        await handleGestionComptesClick();
                        navigate("/gestion-comptes");
                        setIsMenuOpen(false);
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full mt-2 bg-gradient-to-r from-purple-600/10 to-indigo-700/10 border border-purple-600/20 rounded-lg p-3 text-center hover:bg-purple-50 transition-colors"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-purple-700 text-sm font-medium">👥 Gestion Comptes</span>
                      </div>
                    </motion.button>
                  )}
                </div>
              </div>
              
              {/* Pied de menu */}
              <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
                <div className="text-center space-y-1">
                  <div className="text-xs text-gray-600 font-medium">COORDINATION ABIDJAN NORD-COCODY</div>
                  <div className="text-xs text-gray-500">ÉliteMultiservices</div>
                  <div className="text-xs text-orange-600 font-semibold">📞 07 76 73 51 15</div>
                  <div className="text-xs text-gray-400 mt-1">GESCARD v1.0.0</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      
      <div className={`${isMobile ? 'h-14' : 'h-16'}`}></div>

      {/* Modal de déconnexion */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
              onClick={() => setShowLogoutConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-auto border border-red-100"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">🚪</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Confirmer la déconnexion</h3>
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Êtes-vous sûr de vouloir vous déconnecter ? 
                  Vous devrez vous reconnecter pour accéder à nouveau à l'application.
                </p>
                
                <div className="flex justify-end gap-3">
                  <motion.button
                    onClick={() => setShowLogoutConfirm(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium"
                  >
                    Annuler
                  </motion.button>
                  <motion.button
                    onClick={handleLogoutConfirmed}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold shadow-lg flex items-center gap-3"
                  >
                    <span>🚪</span>
                    Déconnexion
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;