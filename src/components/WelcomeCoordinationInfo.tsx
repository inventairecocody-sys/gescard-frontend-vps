// WelcomeCoordinationInfo.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HandRaisedIcon,
  RocketLaunchIcon,
  SparklesIcon,
  PhoneIcon,
  UserGroupIcon,
  BoltIcon,
  ClockIcon,
  ArrowPathIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

// La prop isMobile a été supprimée car non utilisée
const WelcomeCoordinationInfo: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Informations simplifiées
  const infoSlides = [
    {
      type: "welcome",
      icon: HandRaisedIcon,
      title: "BIENVENUE SUR GESCARD",
      message: "Nouvelle plateforme de gestion électronique des cartes"
    },
    {
      type: "distribution",
      icon: RocketLaunchIcon,
      title: "OPÉRATION DE DISTRIBUTION EN COURS",
      message: "Début le Lundi 17 Novembre 2025 - Excellents résultats"
    },
    {
      type: "new-year",
      icon: SparklesIcon,
      title: "MEILLEURS VŒUX 2026",
      message: "Excellente et prospère année à toute l'équipe"
    },
    {
      type: "contact",
      icon: PhoneIcon,
      title: "CONTACT & INFORMATIONS",
      message: "Coordination Abidjan Nord-Cocody - 07 76 73 51 15"
    },
    {
      type: "performance",
      icon: BoltIcon,
      title: "PERFORMANCE",
      message: "Plateforme rapide et efficace - Temps réel"
    },
    {
      type: "team",
      icon: UserGroupIcon,
      title: "ESPRIT D'ÉQUIPE",
      message: "Ensemble, construisons une administration moderne"
    }
  ];

  // Défilement automatique toutes les 30 secondes
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % infoSlides.length);
    }, 30000);
    
    return () => clearInterval(slideTimer);
  }, [infoSlides.length]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + infoSlides.length) % infoSlides.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % infoSlides.length);
  };

  const currentSlideData = infoSlides[currentSlide];
  const CurrentIcon = currentSlideData.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
    >
      {/* En-tête avec titre "Informations" */}
      <div className="bg-[#F77F00] text-white p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <InformationCircleIcon className="w-5 h-5" />
            <h2 className="font-bold">Informations GESCARD</h2>
          </div>
          <div className="flex items-center gap-2 text-xs bg-white/20 px-2 py-1 rounded-full">
            <ArrowPathIcon className="w-3 h-3" />
            <span>Défilement 30s</span>
          </div>
        </div>
      </div>

      {/* Corps avec l'info défilante */}
      <div className="p-4">
        <div className="flex items-center gap-2">
          {/* Bouton précédent */}
          <motion.button
            onClick={handlePrevSlide}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>

          {/* Contenu défilant */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <CurrentIcon className="w-4 h-4 text-[#F77F00]" />
                  </div>
                  <h3 className="font-bold text-[#F77F00] text-sm md:text-base">
                    {currentSlideData.title}
                  </h3>
                </div>
                <p className="text-gray-700 text-xs md:text-sm">
                  {currentSlideData.message}
                </p>
                
                {/* Indicateurs de progression */}
                <div className="flex justify-center gap-1 mt-3">
                  {infoSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index === currentSlide 
                          ? 'w-4 bg-[#F77F00]' 
                          : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Info ${index + 1}`}
                    />
                  ))}
                </div>
                
                {/* Indication du temps */}
                <div className="text-[10px] text-gray-400 mt-2 flex items-center justify-center gap-1">
                  <ClockIcon className="w-3 h-3" />
                  <span>Prochain message dans 30s</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bouton suivant */}
          <motion.button
            onClick={handleNextSlide}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Footer avec compteur */}
      <div className="border-t border-gray-200 p-2 bg-gray-50 text-center">
        <span className="text-xs text-gray-500">
          {currentSlide + 1} / {infoSlides.length} - Mis à jour régulièrement
        </span>
      </div>
    </motion.div>
  );
};

export default WelcomeCoordinationInfo;