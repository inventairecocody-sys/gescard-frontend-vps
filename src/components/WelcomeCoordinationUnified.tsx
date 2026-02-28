 import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HandRaisedIcon,
  RocketLaunchIcon,
  SparklesIcon,
  PhoneIcon,
  HeartIcon,
  TrophyIcon,
  UserGroupIcon,
  BoltIcon,
  CheckBadgeIcon,
  BuildingOfficeIcon,
  ClockIcon,
  ArrowPathIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface WelcomeCoordinationUnifiedProps {
  isMobile?: boolean;
}

const WelcomeCoordinationUnified: React.FC<WelcomeCoordinationUnifiedProps> = ({ isMobile = false }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Toutes les informations combinées qui défilent automatiquement
  const allSlides = [
    {
      type: "welcome",
      icon: HandRaisedIcon,
      title: "BIENVENUE SUR GESCARD",
      subtitle: "Nouvelle plateforme • Innovation • Performance",
      color: "from-[#F77F00] via-[#0077B6] to-[#2E8B57]",
      urgency: "normal",
      content: (
        <div className="space-y-4 md:space-y-6">
          <div className="space-y-4">
            <p className={`${isMobile ? 'text-sm' : 'text-base'} leading-relaxed text-gray-700`}>
              <strong className="text-[#F77F00]">Chers collaborateurs,</strong>
            </p>
            
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-3 md:p-4 border border-blue-200">
              <p className={`${isMobile ? 'text-sm' : 'text-base'} leading-relaxed text-gray-700`}>
                J'ai le plaisir de vous annoncer la mise en place de notre nouveau logiciel Web de recherche rapide de cartes <strong className="text-blue-600">GESCARD</strong>.
              </p>
            </div>

            <p className={`${isMobile ? 'text-sm' : 'text-base'} leading-relaxed text-gray-700`}>
              Cette plateforme a été conçue pour <strong className="text-blue-600">faciliter et améliorer</strong> nos services de distribution.
            </p>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 md:p-4 border border-green-200">
              <p className={`${isMobile ? 'text-sm' : 'text-base'} leading-relaxed text-gray-700`}>
                Cet outil constitue une <strong className="text-green-600">étape importante</strong> dans la modernisation de notre travail.
              </p>
            </div>
          </div>

          {/* VALEURS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {[
              { icon: BoltIcon, label: "Rapidité", desc: "Recherches express", color: "orange" },
              { icon: CheckBadgeIcon, label: "Précision", desc: "Résultats exacts", color: "blue" },
              { icon: UserGroupIcon, label: "Collaboration", desc: "Travail d'équipe", color: "green" },
              { icon: SparklesIcon, label: "Innovation", desc: "Technologie moderne", color: "purple" }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className={`bg-gradient-to-br from-${item.color}-50 to-${item.color}-100 rounded-xl p-2 md:p-3 text-center border border-${item.color}-200`}>
                  <Icon className={`w-5 h-5 md:w-6 md:h-6 mx-auto mb-1 md:mb-2 text-${item.color}-600`} />
                  <div className={`font-semibold text-gray-800 ${isMobile ? 'text-xs' : 'text-sm'}`}>{item.label}</div>
                  <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-600 mt-1`}>{item.desc}</div>
                </div>
              );
            })}
          </div>

          {/* SIGNATURE */}
          <div className="border-t border-gray-200 pt-3 md:pt-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-[#0077B6] to-[#2E8B57] rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xs md:text-sm">RL</span>
              </div>
              <div>
                <p className={`font-bold text-[#F77F00] ${isMobile ? 'text-sm' : 'text-base'}`}>La Responsable</p>
                <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Coordination Abidjan Nord-Cocody</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      type: "distribution",
      icon: RocketLaunchIcon,
      title: "OPÉRATION DE DISTRIBUTION EN COURS",
      subtitle: "Continuez vos efforts exceptionnels !",
      color: "from-green-600 to-emerald-500",
      urgency: "success",
      content: (
        <div className="space-y-4 md:space-y-6">
          
          {/* MESSAGE DE REMERCIEMENT */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 md:p-4 border border-green-200">
            <div className="text-center mb-3 md:mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-2">
                <HandRaisedIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h3 className={`font-bold text-gray-800 ${isMobile ? 'text-base' : 'text-lg'}`}>
                UN GRAND MERCI À TOUS !
              </h3>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-white/80 rounded-lg border border-green-300">
                <div className="flex items-center gap-2 mb-1">
                  <CheckBadgeIcon className="w-4 h-4 text-green-600" />
                  <span className={`font-bold text-green-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>OPÉRATION LANCÉE</span>
                </div>
                <p className={`text-gray-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Début le <strong className="text-green-600">Lundi 17 Novembre 2025</strong>
                </p>
              </div>
              
              <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-emerald-300">
                <div className="flex items-center gap-2 mb-1">
                  <TrophyIcon className="w-4 h-4 text-emerald-600" />
                  <span className={`font-bold text-emerald-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>EXCELLENT DÉBUT</span>
                </div>
                <p className={`text-gray-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Grâce à votre mobilisation
                </p>
              </div>
            </div>
          </div>

          {/* CARTES D'INFORMATION */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
            {[
              { icon: ClockIcon, label: "Début", value: "17 Nov 2025", color: "blue" },
              { icon: CheckBadgeIcon, label: "Statut", value: "En cours", color: "green" },
              { icon: TrophyIcon, label: "Objectif", value: "Excellence", color: "purple" }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className={`bg-gradient-to-br from-${item.color}-50 to-${item.color}-100 rounded-xl p-2 md:p-3 border border-${item.color}-200`}>
                  <Icon className={`w-4 h-4 md:w-5 md:h-5 text-${item.color}-600 mb-1`} />
                  <h4 className={`font-bold text-gray-800 ${isMobile ? 'text-xs' : 'text-sm'}`}>{item.label}</h4>
                  <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>{item.value}</p>
                </div>
              );
            })}
          </div>

          {/* MESSAGE FINAL */}
          <div className="text-center bg-gradient-to-r from-[#F77F00] to-[#FF9E40] rounded-xl p-3 md:p-4 text-white">
            <p className={`font-bold ${isMobile ? 'text-sm' : 'text-base'}`}>
              Votre dévouement fait notre force !
            </p>
          </div>
        </div>
      )
    },
    {
      type: "new-year",
      icon: SparklesIcon,
      title: "MEILLEURS VŒUX 2026",
      subtitle: "Excellente et prospère année 2026 !",
      color: "from-purple-600 via-pink-500 to-orange-500",
      urgency: "celebration",
      content: (
        <div className="space-y-4 md:space-y-6">
          
          {/* DÉCORATION SPÉCIALE */}
          <div className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-xl md:rounded-2xl p-4 md:p-6 border border-purple-200 overflow-hidden">
            
            {/* Confettis décoratifs */}
            <div className="absolute top-2 left-2 w-2 h-2 bg-yellow-400 rounded-full"></div>
            <div className="absolute top-4 right-3 w-1 h-1 bg-blue-400 rounded-full"></div>
            <div className="absolute bottom-3 left-4 w-2 h-2 bg-red-400 rounded-full"></div>
            
            <div className="text-center relative z-10">
              <div className="flex justify-center mb-3 md:mb-4">
                <div className="relative">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl">
                    <SparklesIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                </div>
              </div>
              
              <h3 className={`font-bold text-gray-800 mb-2 md:mb-3 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                  BONNE ANNÉE 2026 !
                </span>
              </h3>
              
              <div className="bg-white/80 rounded-xl p-3 mb-3 border border-purple-100">
                <p className={`text-gray-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Que cette nouvelle année soit remplie de succès
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { icon: HeartIcon, label: "Bonheur", color: "red" },
                  { icon: BoltIcon, label: "Santé", color: "green" },
                  { icon: StarIcon, label: "Prospérité", color: "yellow" },
                  { icon: CheckBadgeIcon, label: "Réussite", color: "blue" }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className={`bg-gradient-to-br from-${item.color}-50 to-${item.color}-100 rounded-lg p-2 text-center`}>
                      <Icon className={`w-4 h-4 mx-auto text-${item.color}-600`} />
                      <div className={`font-medium text-gray-800 ${isMobile ? 'text-xs' : 'text-sm'}`}>{item.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      type: "contact",
      icon: PhoneIcon,
      title: "CONTACT & INFORMATIONS",
      subtitle: "Restons connectés",
      color: "from-[#0077B6] to-[#2E8B57]",
      urgency: "normal",
      content: (
        <div className="space-y-4 md:space-y-6">
          
          {/* MESSAGE */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-3 md:p-4 border border-blue-200">
            <p className={`text-gray-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              La Coordination Abidjan Nord Cocody reste engagée dans l'amélioration continue.
            </p>
          </div>

          {/* CONTACT RAPIDE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center border border-blue-200">
              <PhoneIcon className="w-5 h-5 text-[#0077B6] mx-auto mb-2" />
              <div className={`font-bold text-gray-800 ${isMobile ? 'text-sm' : 'text-base'}`}>07 76 73 51 15</div>
              <div className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Contact Direct</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 text-center border border-green-200">
              <BuildingOfficeIcon className="w-5 h-5 text-[#2E8B57] mx-auto mb-2" />
              <div className={`font-bold text-gray-800 ${isMobile ? 'text-sm' : 'text-base'}`}>ÉliteMultiservices</div>
              <div className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Gestionnaire</div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 text-center border border-orange-200">
              <CheckBadgeIcon className="w-5 h-5 text-[#F77F00] mx-auto mb-2" />
              <div className={`font-bold text-gray-800 ${isMobile ? 'text-sm' : 'text-base'}`}>Plateforme Active</div>
              <div className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>24h/24 - 7j/7</div>
            </div>
          </div>

          {/* SIGNATURE */}
          <div className="flex items-center justify-center gap-3 pt-3 border-t border-gray-200">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-[#0077B6] to-[#2E8B57] rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xs md:text-sm">RL</span>
            </div>
            <div className="text-center">
              <p className={`font-bold text-[#F77F00] ${isMobile ? 'text-sm' : 'text-base'}`}>La Responsable</p>
              <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Coordination Abidjan Nord-Cocody</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  // Cycle automatique des slides
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % allSlides.length);
    }, 15000);
    
    return () => clearInterval(slideTimer);
  }, [allSlides.length]);

  const currentSlideData = allSlides[currentSlide];
  const CurrentIcon = currentSlideData.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-xl md:rounded-2xl shadow-xl border border-gray-200 overflow-hidden`}
    >
      
      {/* En-tête dynamique */}
      <div className={`bg-gradient-to-r ${currentSlideData.color} text-white p-3 md:p-6 relative overflow-hidden`}>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2 md:gap-3">
            <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-white/20 rounded-lg md:rounded-xl flex items-center justify-center backdrop-blur-sm`}>
              <CurrentIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-white`} />
            </div>
            <div>
              <h2 className={`font-bold ${isMobile ? 'text-base' : 'text-lg md:text-xl'}`}>
                {currentSlideData.title}
              </h2>
              <p className={`text-white/90 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {currentSlideData.subtitle}
              </p>
            </div>
          </div>
          
          {/* Indicateur de progression */}
          <div className="flex items-center gap-2">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">
              <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {currentSlide + 1}/{allSlides.length}
              </span>
            </div>
            <div className="bg-black/20 px-2 py-1 rounded-lg flex items-center gap-1">
              <ArrowPathIcon className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-white/80`} />
              <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-white/80`}>Auto</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="p-3 md:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {currentSlideData.content}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-4 md:mt-6">
          
          {/* Boutons de navigation */}
          <div className="flex flex-wrap justify-center gap-1 md:gap-2 mb-3">
            {allSlides.map((slide, index) => {
              const SlideIcon = slide.icon;
              return (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 flex items-center gap-1 ${
                    index === currentSlide
                      ? slide.urgency === "success"
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                        : slide.urgency === "celebration"
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'bg-gradient-to-r from-[#0077B6] to-[#2E8B57] text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <SlideIcon className="w-3 h-3 md:w-4 md:h-4" />
                  <span className={isMobile ? 'sr-only' : ''}>
                    {slide.type === "welcome" ? "Bienvenue" : 
                     slide.type === "distribution" ? "Distribution" :
                     slide.type === "new-year" ? "2026" : "Contact"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Points de navigation */}
          <div className="flex justify-center gap-1 md:gap-2">
            {allSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? allSlides[index].urgency === "success"
                      ? 'bg-green-500 scale-125' 
                      : allSlides[index].urgency === "celebration"
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 scale-125'
                      : 'bg-[#0077B6] scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-2 md:p-3 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 md:gap-2">
            <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${
              currentSlideData.urgency === "success" ? 'bg-green-500' : 
              currentSlideData.urgency === "celebration" ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-[#0077B6]'
            }`} />
            <span className={`text-gray-600 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
              {currentSlideData.type === "welcome" ? "Message d'accueil" : 
               currentSlideData.type === "distribution" ? "Opération en cours" :
               currentSlideData.type === "new-year" ? "Vœux 2026" : "Contact"}
            </span>
          </div>
          
          <div className={`text-gray-500 flex items-center gap-1 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
            <ArrowPathIcon className="w-3 h-3" />
            <span>Défilement auto</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomeCoordinationUnified;