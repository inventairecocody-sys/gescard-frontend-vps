import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { 
  HomeIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UsersIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  Bars3Icon,
  ChevronDownIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface NavbarProps {
  role?: string;
}

const Navbar: React.FC<NavbarProps> = ({ role: propRole }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { canView } = usePermissions();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const userRole = user?.role || propRole || 'Opérateur';

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 640);
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    checkScreen();
    window.addEventListener('resize', checkScreen);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('resize', checkScreen);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const isActiveLink = (path: string) => {
    if (path === "/home") return location.pathname === "/home" || location.pathname === "/dashboard";
    return location.pathname === path;
  };

  const handleLogout = async () => {
    await logout();
    setShowLogoutConfirm(false);
    navigate('/login');
  };

  const navItems = [
    { path: "/home",           label: "Accueil",         labelShort: "Accueil",   icon: HomeIcon,             color: "from-[#F77F00] to-[#FF9E40]", hoverColor: "hover:bg-orange-50 hover:text-[#F77F00]", permission: true },
    { path: "/inventaire",     label: "Inventaire",      labelShort: "Recherche", icon: MagnifyingGlassIcon,  color: "from-[#F77F00] to-[#FF9E40]", hoverColor: "hover:bg-orange-50 hover:text-[#F77F00]", permission: canView('inventaire') },
    { path: "/dashboard",      label: "Tableau de bord", labelShort: "Tableau",   icon: ChartBarIcon,         color: "from-[#F77F00] to-[#FF9E40]", hoverColor: "hover:bg-orange-50 hover:text-[#F77F00]", permission: canView('dashboard') },
    { path: "/journal",        label: "Journal",         labelShort: "Journal",   icon: DocumentTextIcon,     color: "from-[#F77F00] to-[#FF9E40]", hoverColor: "hover:bg-orange-50 hover:text-[#F77F00]", permission: canView('journal') },
    { path: "/gestion-comptes",label: "Gestion comptes", labelShort: "Comptes",   icon: UsersIcon,            color: "from-[#F77F00] to-[#FF9E40]", hoverColor: "hover:bg-orange-50 hover:text-[#F77F00]", permission: canView('gestion-comptes') },
    { path: "/profil",         label: "Profil",          labelShort: "Profil",    icon: UserIcon,             color: "from-[#F77F00] to-[#FF9E40]", hoverColor: "hover:bg-orange-50 hover:text-[#F77F00]", permission: canView('profil') },
  ].filter(item => item.permission);

  const navbarClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
    isScrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100' : 'bg-white/90 backdrop-blur-md border-b border-gray-100'
  }`;

  return (
    <>
      <nav className={navbarClasses} role="navigation" aria-label="Navigation principale">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-14 md:h-16">

            {/* ── Logo : image + GESCARD + coordination ── */}
            <div className="flex items-center flex-shrink-0">
              <Link to="/home" className="flex items-center gap-2.5">
                {/* Image logo uniquement */}
                <div className="relative flex-shrink-0">
                  <img
                    src="/logo-placeholder.jpeg"
                    alt="GESCARD"
                    className="w-8 h-8 md:w-10 md:h-10 rounded-xl object-contain shadow-md border border-orange-100"
                  />
                  <div className="absolute -top-1 -right-1 w-2 h-2 md:w-2.5 md:h-2.5 bg-green-500 rounded-full border border-white animate-pulse" />
                </div>


              </Link>
            </div>

            {/* ── Menu Desktop ── */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2 flex-1 justify-center pl-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative px-3 py-2 rounded-lg transition-all duration-300 font-medium text-xs xl:text-sm whitespace-nowrap ${
                      isActiveLink(item.path)
                        ? `text-white bg-gradient-to-r ${item.color} shadow-md`
                        : `text-gray-700 ${item.hoverColor}`
                    }`}
                    aria-current={isActiveLink(item.path) ? "page" : undefined}
                    title={item.label}
                  >
                    <span className="flex items-center gap-1.5">
                      <Icon className="w-4 h-4" />
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
                );
              })}

              {/* Déconnexion */}
              <motion.button
                onClick={() => setShowLogoutConfirm(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-xs xl:text-sm font-medium shadow hover:shadow-md transition-all duration-300 ml-1"
                title="Déconnexion"
              >
                <span className="flex items-center gap-1.5">
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  <span className="hidden xl:inline">Déconnexion</span>
                  <span className="xl:hidden">Sortir</span>
                </span>
              </motion.button>

              {/* Badge rôle */}
              <div className="ml-2 px-2 py-1 bg-gradient-to-r from-[#F77F00]/10 to-[#FF9E40]/10 rounded-full border border-[#F77F00]/20 flex items-center gap-1">
                <ShieldCheckIcon className="w-3 h-3 text-[#F77F00]" />
                <span className="text-xs font-semibold text-[#F77F00] truncate max-w-[80px]">{userRole}</span>
              </div>
            </div>

            {/* ── Menu tablette ── */}
            <div className="hidden md:flex lg:hidden items-center gap-2">
              {navItems.slice(0, 3).map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative p-2 rounded-lg transition-all duration-300 ${
                      isActiveLink(item.path)
                        ? `text-white bg-gradient-to-r ${item.color} shadow-md`
                        : `text-gray-700 ${item.hoverColor}`
                    }`}
                    title={item.label}
                  >
                    <Icon className="w-4 h-4" />
                  </Link>
                );
              })}

              {navItems.length > 3 && (
                <div className="relative group">
                  <button className="p-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:bg-gray-200">
                    <ChevronDownIcon className="w-4 h-4" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    {navItems.slice(3).map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link key={item.path} to={item.path} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg">
                          <span className="flex items-center gap-2"><Icon className="w-4 h-4" /><span>{item.label}</span></span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              <motion.button
                onClick={() => setShowLogoutConfirm(true)}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white shadow"
                title="Déconnexion"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
              </motion.button>
            </div>

            {/* ── Menu mobile ── */}
            <div className="flex items-center gap-2 md:hidden">
              <div className="px-2 py-1 bg-gradient-to-r from-[#F77F00]/10 to-[#FF9E40]/10 rounded-full border border-[#F77F00]/20">
                <span className="text-xs font-semibold text-[#F77F00]">
                  {userRole.length > 8 ? userRole.substring(0, 6) + '...' : userRole}
                </span>
              </div>
              <motion.button onClick={() => setShowLogoutConfirm(true)} whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white shadow" title="Déconnexion">
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
              </motion.button>
              <motion.button onClick={() => setIsMenuOpen(!isMenuOpen)} whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg shadow-lg bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white">
                {isMenuOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Overlay mobile */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMenuOpen(false)} />
          )}
        </AnimatePresence>

        {/* Drawer mobile */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="md:hidden bg-white shadow-2xl border-t border-gray-200 absolute top-full left-0 right-0 overflow-hidden z-50"
            >
              <div className="py-2 px-2 space-y-1 max-h-[70vh] overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)}
                      className={`block px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm relative ${
                        isActiveLink(item.path) ? `text-white bg-gradient-to-r ${item.color} shadow-lg` : `text-gray-700 bg-gray-50 hover:bg-gray-100`
                      }`}
                    >
                      <span className="flex items-center justify-between">
                        <span className="flex items-center gap-3"><Icon className="w-5 h-5" /><span>{item.label}</span></span>
                        {isActiveLink(item.path) && <motion.div layoutId="mobile-navbar-indicator" className="w-2 h-2 bg-white rounded-full" />}
                      </span>
                    </Link>
                  );
                })}

                <div className="border-t border-gray-200 my-2 pt-2">
                  <div className="px-4 py-3 bg-gradient-to-r from-[#F77F00]/10 to-[#FF9E40]/10 rounded-xl">
                    <div className="text-xs text-gray-600 mb-2">Connecté en tant que</div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheckIcon className="w-4 h-4 text-[#F77F00]" />
                        <span className="font-semibold text-[#F77F00] text-sm">{userRole}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600">En ligne</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/90 rounded-lg p-2 text-center">
                        <BuildingOfficeIcon className="w-3 h-3 mx-auto mb-1 text-gray-500" />
                        <div className="text-gray-500">Coordination</div>
                        <div className="font-medium text-gray-800 truncate">{user?.coordination || 'Non spécifiée'}</div>
                      </div>
                      <div className="bg-white/90 rounded-lg p-2 text-center">
                        <UserIcon className="w-3 h-3 mx-auto mb-1 text-gray-500" />
                        <div className="text-gray-500">Utilisateur</div>
                        <div className="font-medium text-gray-800 truncate">{user?.nomUtilisateur || 'Utilisateur'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
                <div className="text-center space-y-1">
                  <div className="text-xs text-gray-600 font-medium">GESCARD v2.0.0</div>
                  <div className="text-xs text-gray-500">© 2025 Tous droits réservés</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <div className={`${isMobile ? 'h-14' : 'h-16'}`}></div>

      {/* Modal déconnexion */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 max-w-md w-full mx-auto border border-red-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 md:gap-4 mb-4">
                <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center`}>
                  <ArrowRightOnRectangleIcon className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
                </div>
                <h3 className={`font-bold text-gray-800 ${isMobile ? 'text-base' : 'text-lg'}`}>Confirmer la déconnexion</h3>
              </div>
              <p className={`text-gray-600 mb-4 md:mb-6 leading-relaxed ${isMobile ? 'text-sm' : 'text-base'}`}>
                Êtes-vous sûr de vouloir vous déconnecter ?
              </p>
              <div className="flex justify-end gap-2 md:gap-3">
                <motion.button onClick={() => setShowLogoutConfirm(false)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className={`px-4 py-2 md:px-6 md:py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium ${isMobile ? 'text-sm' : ''}`}>
                  Annuler
                </motion.button>
                <motion.button onClick={handleLogout} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className={`px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-lg flex items-center gap-2 ${isMobile ? 'text-sm' : ''}`}>
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  Déconnexion
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;