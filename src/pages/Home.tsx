import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import WelcomeCoordinationUnified from "../components/WelcomeCoordinationUnified";
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
  BoltIcon,
  DevicePhoneMobileIcon,
  DocumentArrowDownIcon,
  ChartBarIcon,
  LockClosedIcon,
  UsersIcon,
  ArrowPathIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

const Home: React.FC = () => {
  const { user } = useAuth();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Responsive
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Détection responsive
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
  const cardPadding = isMobile ? 'p-3' : isTablet ? 'p-4' : 'p-6';
  const iconSize = isMobile ? 'w-4 h-4' : isTablet ? 'w-5 h-5' : 'w-6 h-6';
  const gridCols = isMobile ? 'grid-cols-2' : isTablet ? 'grid-cols-3' : 'grid-cols-4';

  // Mise à jour de l'heure
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Formatage date/heure
  const formattedDate = currentTime.toLocaleDateString('fr-FR', { 
    weekday: isMobile ? 'short' : 'long',
    year: 'numeric', 
    month: isMobile ? 'short' : 'long', 
    day: 'numeric' 
  });

  const formattedTime = currentTime.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: isMobile ? undefined : '2-digit'
  });

  // ✅ Nom complet de l'utilisateur (nomComplet) - MAINTENANT VALIDE
  const getUserDisplayName = () => {
    if (user?.nomComplet) {                 // ← Plus d'erreur TypeScript
      return user.nomComplet;
    }
    if (user?.nomUtilisateur) {
      return user.nomUtilisateur;
    }
    return 'Utilisateur';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar />
      
      {/* Composant WelcomeCoordinationUnified */}
      <WelcomeCoordinationUnified />

      {/* Header principal */}
      <div className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white py-4 shadow-lg">
        <div className={containerClass}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            
            {/* Informations utilisateur */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-white/20 rounded-xl flex items-center justify-center`}>
                  <HomeIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-white`} />
                </div>
                <div>
                  <h1 className={`${titleSize} font-bold`}>
                    Accueil
                  </h1>
                  <p className={`text-white/90 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {user?.coordination || 'COORDINATION ABIDJAN NORD-COCODY'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <UserIcon className={`${iconSize} text-white/80`} />
                  <p className={`${textSize} text-white/90`}>
                    Bienvenue, <span className="font-semibold text-white">{getUserDisplayName()}</span>
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <span className={`${isMobile ? 'text-xs' : 'text-sm'} px-2 py-1 bg-white/20 rounded-lg flex items-center gap-1`}>
                    <BuildingOfficeIcon className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                    {user?.coordination || 'Coordination'}
                  </span>
                  <span className={`${isMobile ? 'text-xs' : 'text-sm'} px-2 py-1 bg-white/20 rounded-lg flex items-center gap-1`}>
                    <ShieldCheckIcon className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                    {user?.role || 'Rôle'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Date et heure */}
            <div className={`w-full md:w-auto bg-white/20 backdrop-blur-sm rounded-xl ${cardPadding} text-center border border-white/30`}>
              <div className="flex items-center justify-center gap-2 text-white/90 mb-1">
                <CalendarIcon className={`${iconSize}`} />
                <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
                  {formattedDate}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 font-bold text-white">
                <ClockIcon className={`${iconSize}`} />
                <span className={`${isMobile ? 'text-base' : 'text-lg'} font-mono`}>
                  {formattedTime}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className={containerClass}>
        
        {/* Carte recherche rapide */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 md:mb-6"
        >
          <Link to="/inventaire">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative bg-white rounded-2xl p-4 md:p-5 shadow-lg border border-gray-200 hover:border-blue-300 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="relative">
                    <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-gradient-to-br from-[#0077B6] to-[#00A8E8] rounded-xl flex items-center justify-center shadow-lg`}>
                      <MagnifyingGlassIcon className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
                    </div>
                    <div className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                  
                  <div>
                    <h3 className={`font-bold text-gray-800 group-hover:text-[#0077B6] transition-colors ${isMobile ? 'text-sm' : 'text-base'}`}>
                      Recherche Avancée
                    </h3>
                    <p className={`text-gray-600 group-hover:text-gray-700 transition-colors ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      Accès direct à l'inventaire
                    </p>
                  </div>
                </div>
                
                <ArrowRightIcon className={`${iconSize} text-gray-400 group-hover:text-[#0077B6] transform group-hover:translate-x-1 transition-all duration-300`} />
              </div>
            </motion.div>
          </Link>
        </motion.section>

        {/* Caractéristiques GESCARD */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 md:mb-8"
        >
          <div className="bg-gradient-to-r from-[#0077B6] to-[#2E8B57] rounded-2xl p-4 md:p-6 text-white shadow-xl relative overflow-hidden">
            
            <div className="relative z-10">
              <div className="text-center mb-4 md:mb-6">
                <h2 className={`font-bold ${titleSize} mb-2`}>
                  Caractéristiques GESCARD
                </h2>
                <p className={`${textSize} text-blue-100`}>
                  Une plateforme puissante et intuitive
                </p>
              </div>

              <div className={`grid ${gridCols} gap-2 md:gap-3`}>
                {[
                  { icon: CheckBadgeIcon, title: "Plateforme Active", desc: "Système Opérationnel" },
                  { icon: DevicePhoneMobileIcon, title: "Mobile", desc: "Responsive" },
                  { icon: DocumentArrowDownIcon, title: "Export", desc: "Excel/CSV" },
                  { icon: BoltIcon, title: "Rapidité", desc: "Performance" },
                  { icon: LockClosedIcon, title: "Sécurité", desc: "Données protégées" },
                  { icon: ChartBarIcon, title: "Statistiques", desc: "Analyses" },
                  { icon: UsersIcon, title: "Collaboration", desc: "Équipe unifiée" },
                  { icon: ArrowPathIcon, title: "Actualisation", desc: "Temps réel" }
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div 
                      key={index}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="bg-white/10 rounded-xl p-2 md:p-3 text-center backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all duration-300"
                    >
                      <Icon className={`${iconSize} mx-auto mb-1 md:mb-2 text-white`} />
                      <div className={`font-semibold ${isMobile ? 'text-xs' : 'text-sm'} mb-0.5 md:mb-1`}>
                        {item.title}
                      </div>
                      <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-white/80`}>
                        {item.desc}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="text-center mt-4 md:mt-6">
                <Link to="/inventaire">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white text-[#0077B6] px-4 py-2 md:px-6 md:py-3 rounded-xl font-bold hover:bg-gray-50 transition-all duration-300 shadow-lg flex items-center justify-center gap-2 mx-auto"
                  >
                    <span>Explorer GESCARD</span>
                    <ArrowRightIcon className={`${iconSize}`} />
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Avantages */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4"
        >
          {[
            {
              icon: BoltIcon,
              title: "Gain de Temps",
              desc: "Réduction significative du temps de recherche",
              color: "from-[#F77F00] to-[#FF9E40]"
            },
            {
              icon: CheckBadgeIcon,
              title: "Précision",
              desc: "Élimination des erreurs manuelles",
              color: "from-[#0077B6] to-[#2E8B57]"
            },
            {
              icon: ChartBarIcon,
              title: "Productivité",
              desc: "Augmentation de l'efficacité des équipes",
              color: "from-[#2E8B57] to-[#0077B6]"
            }
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className={`bg-gradient-to-r ${item.color} rounded-xl ${cardPadding} text-white shadow-lg`}
              >
                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                  <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-white/20 rounded-lg flex items-center justify-center`}>
                    <Icon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  </div>
                  <div>
                    <h3 className={`font-bold ${isMobile ? 'text-sm' : 'text-base'}`}>{item.title}</h3>
                  </div>
                </div>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-white/90`}>
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.section>
      </div>
    </div>
  );
};

export default Home;