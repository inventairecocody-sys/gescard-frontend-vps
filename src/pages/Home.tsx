// Home.tsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import WelcomeCoordinationInfo from "../components/WelcomeCoordinationInfo";
import { useAuth } from '../hooks/useAuth';
import { 
  HomeIcon, 
  ClockIcon, 
  CalendarIcon, 
  BuildingOfficeIcon,
  UserIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  UserCircleIcon,
  DocumentTextIcon,
  BoltIcon,
  DevicePhoneMobileIcon,
  LockClosedIcon,
  ChartBarIcon,
  UsersIcon,
  ArrowPathIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

interface User {
  id?: string;
  nomComplet?: string;
  nomUtilisateur?: string;
  email?: string;
  role?: string;
  coordination?: string;
}

const Home: React.FC = () => {
  const { user } = useAuth() as { user: User | null };
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDirectorMessage, setShowDirectorMessage] = useState(false);
  
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

  const containerClass = isMobile ? 'px-3 py-4' : isTablet ? 'px-6 py-6' : 'container mx-auto px-4 py-8';
  const titleSize = isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl';
  // iconSize a été supprimé car non utilisé
  const gridCols = isMobile ? 'grid-cols-2' : isTablet ? 'grid-cols-3' : 'grid-cols-4';

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('fr-FR', { 
    weekday: isMobile ? 'short' : 'long',
    year: 'numeric', 
    month: isMobile ? 'short' : 'long', 
    day: 'numeric' 
  });

  const formattedTime = currentTime.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const getUserDisplayName = () => {
    if (user?.nomComplet) return user.nomComplet;
    if (user?.nomUtilisateur) return user.nomUtilisateur;
    return 'Utilisateur';
  };

  // Message de la responsable
  const directorMessage = {
    title: "Mot de la Responsable",
    content: "Chers collaborateurs, j'ai le plaisir de vous annoncer la mise en place de notre nouveau logiciel Web de recherche rapide de cartes GESCARD. Cette plateforme a été conçue pour faciliter et améliorer nos services de distribution. Cet outil constitue une étape importante dans la modernisation de notre travail. Ensemble, construisons une administration plus efficace.",
    signature: "La Responsable",
    coordination: "Coordination Abidjan Nord-Cocody",
    initials: "RL"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header avec informations utilisateur et date */}
      <div className="bg-white border-b border-gray-200 py-4 shadow-sm">
        <div className={containerClass}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            
            {/* Partie gauche: Bienvenue et infos utilisateur */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#F77F00] rounded-xl flex items-center justify-center shadow-sm">
                  <HomeIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className={`${titleSize} font-bold text-gray-800`}>Bienvenue sur GESCARD</h1>
                  <p className="text-sm text-gray-500">{user?.coordination || 'COORDINATION'}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  <UserIcon className="w-4 h-4 text-[#F77F00]" />
                  <span className="font-medium">{getUserDisplayName()}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <ShieldCheckIcon className="w-4 h-4 text-[#F77F00]" />
                  <span>{user?.role || 'Rôle'}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <BuildingOfficeIcon className="w-4 h-4 text-[#F77F00]" />
                  <span>{user?.coordination || 'Coordination'}</span>
                </div>
              </div>
            </div>
            
            {/* Partie droite: Date et heure */}
            <div className="bg-gray-100 rounded-xl p-3 text-center min-w-[180px]">
              <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                <CalendarIcon className="w-4 h-4 text-[#F77F00]" />
                <span className="text-sm font-medium">{formattedDate}</span>
              </div>
              <div className="flex items-center justify-center gap-2 font-bold text-gray-800">
                <ClockIcon className="w-4 h-4 text-[#F77F00]" />
                <span className="text-lg font-mono">{formattedTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className={containerClass}>
        
        {/* SECTION 1: Mot de la responsable avec photo */}
        <section className="mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex flex-col md:flex-row">
              
              {/* Partie gauche - Message */}
              {showDirectorMessage && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="md:w-2/3 p-5"
                >
                  <h2 className="font-bold text-lg text-[#F77F00] mb-3">{directorMessage.title}</h2>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    {directorMessage.content}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F77F00] rounded-full flex items-center justify-center text-white font-bold">
                      {directorMessage.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{directorMessage.signature}</p>
                      <p className="text-xs text-gray-500">{directorMessage.coordination}</p>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Partie droite - Photo cliquable */}
              <div 
                className={`${showDirectorMessage ? 'md:w-1/3' : 'md:w-full'} bg-gradient-to-br from-gray-50 to-gray-100 p-5 flex flex-col items-center justify-center cursor-pointer`}
                onClick={() => setShowDirectorMessage(!showDirectorMessage)}
              >
                <div className="w-28 h-28 md:w-32 md:h-32 bg-[#F77F00] rounded-full flex items-center justify-center mb-3 shadow-md hover:shadow-lg transition-shadow">
                  <UserCircleIcon className="w-16 h-16 md:w-20 md:h-20 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 text-center">La Responsable</h3>
                <p className="text-xs text-gray-500 text-center mb-2">Coordination</p>
                <div className="text-[#F77F00] text-xs flex items-center gap-1 bg-orange-50 px-3 py-1 rounded-full">
                  <span>{showDirectorMessage ? "Masquer" : "Lire le message"}</span>
                  <ArrowRightIcon className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Informations défilantes */}
        <section className="mb-6">
          <WelcomeCoordinationInfo />
        </section>

        {/* SECTION 3: Lien visible vers inventaire */}
        <section className="mb-6">
          <Link to="/inventaire">
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="bg-[#F77F00] text-white rounded-xl p-4 shadow-md flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold">Accès à l'inventaire</h2>
                  <p className="text-xs text-white/80">Recherche rapide de cartes</p>
                </div>
              </div>
              <ArrowRightIcon className="w-5 h-5" />
            </motion.div>
          </Link>
        </section>

        {/* SECTION 4: Caractéristiques GESCARD */}
        <section className="mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h2 className="font-bold text-gray-800 mb-4 text-center">Caractéristiques GESCARD</h2>
            <div className={`grid ${gridCols} gap-3`}>
              {[
                { icon: CheckBadgeIcon, title: "Active" },
                { icon: DevicePhoneMobileIcon, title: "Mobile" },
                { icon: DocumentTextIcon, title: "Export" },
                { icon: BoltIcon, title: "Rapide" },
                { icon: LockClosedIcon, title: "Sécurisé" },
                { icon: ChartBarIcon, title: "Statistiques" },
                { icon: UsersIcon, title: "Collaboration" },
                { icon: ArrowPathIcon, title: "Temps réel" }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="w-10 h-10 mx-auto bg-orange-50 rounded-lg flex items-center justify-center mb-1">
                      <Icon className="w-5 h-5 text-[#F77F00]" />
                    </div>
                    <span className="text-xs text-gray-600">{item.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 5: Avantages */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { icon: BoltIcon, title: "Gain de temps" },
            { icon: CheckBadgeIcon, title: "Précision" },
            { icon: ChartBarIcon, title: "Productivité" }
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 text-center">
                <Icon className="w-8 h-8 text-[#F77F00] mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-700">{item.title}</span>
              </div>
            );
          })}
        </section>

        {/* Footer simple */}
        <div className="mt-8 text-center text-gray-400 text-xs border-t border-gray-200 pt-4">
          GESCARD - Gestion Électronique des Cartes
        </div>
      </div>
    </div>
  );
};

export default Home;