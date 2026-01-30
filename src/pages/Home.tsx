import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import MotivationQuotes from "../components/MotivationQuotes";
import WelcomeCoordinationUnified from "../components/WelcomeCoordinationUnified";

const Home: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);
  const [userData, setUserData] = useState({
    nomComplet: "",
    agence: "",
    role: ""
  });
  
  // Fonction pour récupérer les données utilisateur
  const getUserData = () => {
    const nomComplet = localStorage.getItem("nomComplet") || 
                      localStorage.getItem("NomComplet") || 
                      sessionStorage.getItem("nomComplet") || 
                      "Utilisateur";
    
    const agence = localStorage.getItem("agence") || 
                   localStorage.getItem("Agence") || 
                   sessionStorage.getItem("agence") || 
                   "Non spécifiée";
    
    const role = localStorage.getItem("role") || 
                 localStorage.getItem("Role") || 
                 sessionStorage.getItem("role") || 
                 "Utilisateur";
    
    return { nomComplet, agence, role };
  };

  // Détection responsive
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Charger les données utilisateur
    setUserData(getUserData());
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mise à jour de l'heure
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Formatage date/heure
  const formattedDate = isMobile 
    ? currentTime.toLocaleDateString('fr-FR', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      })
    : currentTime.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

  const formattedTime = currentTime.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Récupérer le prénom
  const getFirstName = () => {
    const fullName = userData.nomComplet;
    if (!fullName || fullName === "Utilisateur") return "Utilisateur";
    return fullName.split(' ')[0] || fullName;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar role={userData.role} />
      
      {/* Espace pour la navbar */}
      <div className="h-16 md:h-20"></div>
      
      {/* CITATIONS DE MOTIVATION */}
      <div className="px-3 md:px-6 py-2 md:py-4">
        <MotivationQuotes isMobile={isMobile} />
      </div>

      {/* EN-TÊTE PRINCIPAL */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white shadow-lg"
      >
        <div className="container mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Informations utilisateur */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-lg md:text-xl">🏠</span>
                </div>
                <div>
                  <h1 className="font-bold text-xl md:text-3xl">
                    Tableau de Bord
                  </h1>
                  <p className="text-xs md:text-sm text-white/80 mt-1">
                    COORDINATION ABIDJAN NORD-COCODY
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-base md:text-xl">👋</span>
                  <p className="text-sm md:text-lg text-white/90">
                    Bienvenue, <span className="font-semibold text-white">{getFirstName()}</span>
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs md:text-sm px-2 md:px-3 py-1 bg-white/20 rounded-lg backdrop-blur-sm flex items-center gap-1">
                    <span>🏢</span> {userData.agence}
                  </span>
                  <span className="text-xs md:text-sm px-2 md:px-3 py-1 bg-white/20 rounded-lg backdrop-blur-sm flex items-center gap-1">
                    <span>🎯</span> {userData.role}
                  </span>
                  <span className="text-xs md:text-sm px-2 md:px-3 py-1 bg-white/20 rounded-lg backdrop-blur-sm">
                    GESCARD Platform
                  </span>
                </div>
              </div>
            </div>
            
            {/* DATE ET HEURE */}
            <motion.div 
              className="w-full md:w-auto mt-3 md:mt-0"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="p-3 md:p-4 bg-white/20 backdrop-blur-sm rounded-2xl text-center border border-white/30">
                <div className="flex items-center justify-center gap-2 text-white/90 mb-1">
                  <span>📅</span>
                  <span className="text-xs md:text-sm font-medium">
                    {formattedDate}
                  </span>
                </div>
                <div className="font-bold text-white font-mono text-lg md:text-2xl">
                  {formattedTime}
                </div>
                <div className="text-xs md:text-sm text-white/70 mt-1">
                  Mise à jour en temps réel
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* CONTENU PRINCIPAL */}
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-6">
        
        {/* SECTION RECHERCHE RAPIDE */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4 md:mb-6"
        >
          <Link to="/inventaire">
            <motion.div
              whileHover={{ 
                scale: 1.02,
                y: -2,
                boxShadow: "0 12px 40px rgba(0, 119, 182, 0.15)"
              }}
              whileTap={{ scale: 0.98 }}
              className="group relative bg-white rounded-2xl p-4 md:p-5 shadow-lg border border-gray-200 hover:border-blue-300 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#0077B6] to-[#00A8E8] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-200 transition-shadow duration-300">
                      <span className="text-white text-lg">🔍</span>
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-gray-800 group-hover:text-[#0077B6] transition-colors duration-300">
                      Recherche Avancée
                    </h3>
                    <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                      Accès direct à l'outil de recherche GESCARD
                    </p>
                  </div>
                </div>
                
                <div className="text-gray-400 group-hover:text-[#0077B6] transform group-hover:translate-x-1 transition-all duration-300">
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.section>

        {/* SECTION UNIFIÉE : BIENVENUE + COORDINATION */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6 md:mb-8"
        >
          <WelcomeCoordinationUnified isMobile={isMobile} />
        </motion.div>

        {/* SECTION FONCTIONNALITÉS */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6 md:mb-8"
        >
          <div className="bg-gradient-to-r from-[#0077B6] to-[#2E8B57] rounded-2xl p-4 md:p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-4 md:mb-6">
                <h2 className="font-bold text-lg md:text-2xl mb-2">
                  Fonctionnalités GESCARD
                </h2>
                <p className="text-sm md:text-base text-blue-100">
                  Découvrez toutes les possibilités de notre plateforme
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: "🔍", title: "Recherche", desc: "Multi-critères" },
                  { icon: "📊", title: "Filtres", desc: "Avancés" },
                  { icon: "💾", title: "Export", desc: "Excel/PDF" },
                  { icon: "📱", title: "Mobile", desc: "Responsive" },
                  { icon: "⚡", title: "Rapidité", desc: "Instantané" },
                  { icon: "🔒", title: "Sécurité", desc: "Données protégées" },
                  { icon: "📈", title: "Stats", desc: "Analytiques" },
                  { icon: "🤝", title: "Collaboration", desc: "Équipe" }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="bg-white/10 rounded-xl p-3 md:p-4 text-center backdrop-blur-sm border border-white/20"
                  >
                    <div className="text-xl md:text-2xl mb-1 md:mb-2">{item.icon}</div>
                    <div className="font-semibold text-sm md:text-base">{item.title}</div>
                    <div className="text-xs md:text-sm text-white/80">{item.desc}</div>
                  </motion.div>
                ))}
              </div>

              <div className="text-center mt-4 md:mt-6">
                <Link to="/inventaire">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white text-[#0077B6] px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all duration-300 shadow-lg flex items-center justify-center gap-2 md:gap-3 mx-auto"
                  >
                    <span>🚀</span>
                    Découvrir GESCARD
                    <span>→</span>
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Home;