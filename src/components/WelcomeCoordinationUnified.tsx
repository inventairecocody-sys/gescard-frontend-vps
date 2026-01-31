import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeCoordinationUnifiedProps {
  isMobile?: boolean;
}

const WelcomeCoordinationUnified: React.FC<WelcomeCoordinationUnifiedProps> = ({ isMobile = false }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Toutes les informations combinées qui défilent automatiquement
  const allSlides = [
    {
      type: "welcome",
      icon: "👋",
      title: "BIENVENUE SUR GESCARD",
      subtitle: "Nouvelle plateforme • Innovation • Performance",
      color: "from-[#F77F00] via-[#0077B6] to-[#2E8B57]",
      urgency: "normal",
      content: (
        <div className="space-y-4 md:space-y-6">
          <div className="space-y-4">
            <p className="text-lg leading-relaxed text-gray-700">
              <strong className="text-[#F77F00]">Chers collaborateurs,</strong>
            </p>
            
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
              <p className="text-lg leading-relaxed text-gray-700">
                J'ai le plaisir de vous annoncer la mise en place de notre nouveau logiciel Web de recherche rapide de cartes <strong className="text-blue-600">GESCARD</strong>.
              </p>
            </div>

            <p className="text-lg leading-relaxed text-gray-700">
              Cette plateforme a été conçue pour <strong className="text-blue-600">faciliter et améliorer</strong> nos services de distribution, en permettant à chacun d'effectuer des recherches plus <strong className="text-blue-600">simples, plus rapides et plus efficaces</strong>.
            </p>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <p className="text-lg leading-relaxed text-gray-700">
                Cet outil est désormais accessible à tous les membres de la coordination et constitue une <strong className="text-green-600">étape importante</strong> dans la modernisation de notre travail au quotidien.
              </p>
            </div>

            <p className="text-lg leading-relaxed text-gray-700">
              Je vous encourage à l'utiliser pleinement afin d'<strong className="text-[#F77F00]">optimiser nos performances</strong> et de <strong className="text-[#F77F00]">mieux servir nos bénéficiaires</strong>.
            </p>
          </div>

          {/* VALEURS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center border border-orange-200">
              <div className="text-[#F77F00] text-2xl mb-2">⚡</div>
              <div className="font-semibold text-gray-800 text-sm">Rapidité</div>
              <div className="text-xs text-gray-600 mt-1">Recherches express</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200">
              <div className="text-[#0077B6] text-2xl mb-2">🎯</div>
              <div className="font-semibold text-gray-800 text-sm">Précision</div>
              <div className="text-xs text-gray-600 mt-1">Résultats exacts</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border border-green-200">
              <div className="text-[#2E8B57] text-2xl mb-2">🤝</div>
              <div className="font-semibold text-gray-800 text-sm">Collaboration</div>
              <div className="text-xs text-gray-600 mt-1">Travail d'équipe</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border border-purple-200">
              <div className="text-purple-600 text-2xl mb-2">💡</div>
              <div className="font-semibold text-gray-800 text-sm">Innovation</div>
              <div className="text-xs text-gray-600 mt-1">Technologie moderne</div>
            </div>
          </div>

          {/* SIGNATURE */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-[#0077B6] to-[#2E8B57] rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">RL</span>
              </div>
              <div>
                <p className="font-bold text-[#F77F00]">La Responsable</p>
                <p className="text-sm text-gray-600">Coordination Abidjan Nord-Cocody</p>
                <p className="text-xs text-gray-500 mt-1 italic">Innovation • Performance • Excellence</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      type: "distribution",
      icon: "🚀",
      title: "OPÉRATION DE DISTRIBUTION EN COURS",
      subtitle: "Continuez vos efforts exceptionnels !",
      color: "from-green-600 to-emerald-500",
      urgency: "success",
      content: (
        <div className="space-y-6">
          {/* MESSAGE DE REMERCIEMENT ET D'ENCOURAGEMENT */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-3">
                <span className="text-2xl text-white">🙏</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                UN GRAND MERCI À TOUS !
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-white/80 rounded-lg border border-green-300">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl text-green-600">✅</span>
                  <span className="font-bold text-green-700">OPÉRATION LANCÉE</span>
                </div>
                <p className="text-gray-700">
                  Notre opération spéciale de distribution a débuté le <strong className="text-green-600">Lundi 17 Novembre 2025</strong> et se poursuit avec succès !
                </p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-emerald-300">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl text-emerald-600">💪</span>
                  <span className="font-bold text-emerald-700">EXCELLENT DÉBUT</span>
                </div>
                <p className="text-gray-700">
                  Grâce à votre mobilisation et votre engagement, nous avons réalisé un excellent début d'opération. Continuez sur cette lancée !
                </p>
              </div>
              
              <div className="p-4 bg-white/80 rounded-lg border border-green-300">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl text-blue-600">🎯</span>
                  <span className="font-bold text-blue-700">OBJECTIF : NOUS DÉMARQUER</span>
                </div>
                <p className="text-gray-700">
                  <strong className="text-blue-600">Redoublons d'efforts</strong> pour que notre coordination <strong className="text-blue-600">se démarque des autres</strong> et devienne un modèle d'excellence en Côte d'Ivoire.
                </p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-r from-green-200 to-emerald-200 rounded-lg border border-emerald-300">
                <p className="font-bold text-emerald-800 text-lg">
                  ENSEMBLE VERS L'EXCELLENCE !
                </p>
                <p className="text-sm text-emerald-700 mt-1">
                  Coordination Abidjan Nord-Cocody
                </p>
              </div>
            </div>
          </div>

          {/* CARTES D'INFORMATION */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
              <div className="text-blue-600 text-xl mb-2">📅</div>
              <h4 className="font-bold text-gray-800 mb-2">Début</h4>
              <p className="text-sm text-gray-600">
                Lundi 17 Novembre 2025
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <div className="text-green-600 text-xl mb-2">✅</div>
              <h4 className="font-bold text-gray-800 mb-2">Statut</h4>
              <p className="text-sm text-gray-600">
                En cours • Excellent
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
              <div className="text-purple-600 text-xl mb-2">🏆</div>
              <h4 className="font-bold text-gray-800 mb-2">Objectif</h4>
              <p className="text-sm text-gray-600">
                Se démarquer
              </p>
            </div>
          </div>

          {/* MESSAGE D'ENCOURAGEMENT FINAL */}
          <div className="text-center bg-gradient-to-r from-[#F77F00] to-[#FF9E40] rounded-xl p-4 text-white">
            <p className="font-bold text-lg">
              Votre dévouement fait notre force !
            </p>
            <p className="text-white/90 text-sm mt-1">
              Merci pour votre travail remarquable
            </p>
          </div>
        </div>
      )
    },
    {
      type: "new-year",
      icon: "🎉",
      title: "MEILLEURS VŒUX 2026",
      subtitle: "Excellente et prospère année 2026 !",
      color: "from-purple-600 via-pink-500 to-orange-500",
      urgency: "celebration",
      content: (
        <div className="space-y-6">
          {/* DÉCORATION SPÉCIALE NOUVELLE ANNÉE */}
          <div className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-2xl p-6 border border-purple-200 overflow-hidden">
            {/* Confettis décoratifs */}
            <div className="absolute top-4 left-4 w-3 h-3 bg-yellow-400 rounded-full"></div>
            <div className="absolute top-8 right-6 w-2 h-2 bg-blue-400 rounded-full"></div>
            <div className="absolute bottom-6 left-8 w-4 h-4 bg-red-400 rounded-full"></div>
            <div className="absolute bottom-10 right-10 w-2 h-2 bg-green-400 rounded-full"></div>
            
            <div className="text-center relative z-10">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl">
                    <span className="text-3xl">🎉</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-xs">✨</span>
                  </div>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                  BONNE ANNÉE 2026 !
                </span>
              </h3>
              
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                C'est avec une immense joie que nous vous souhaitons une <strong className="text-purple-600">EXCELLENTE</strong> et <strong className="text-pink-600">PROSPÈRE ANNÉE 2026</strong> !
              </p>
              
              <div className="bg-white/80 rounded-xl p-4 mb-6 border border-purple-100 shadow-sm">
                <p className="text-gray-700">
                  Que cette nouvelle année soit remplie de <span className="text-green-600 font-semibold">bonheur</span>, de <span className="text-blue-600 font-semibold">santé</span>, de <span className="text-yellow-600 font-semibold">prospérité</span> et de <span className="text-red-600 font-semibold">réussite</span> pour vous et vos proches.
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 text-center">
                  <div className="text-green-600 text-xl">❤️</div>
                  <div className="font-semibold text-sm">Bonheur</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 text-center">
                  <div className="text-blue-600 text-xl">💪</div>
                  <div className="font-semibold text-sm">Santé</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-3 text-center">
                  <div className="text-yellow-600 text-xl">💰</div>
                  <div className="font-semibold text-sm">Prospérité</div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-3 text-center">
                  <div className="text-red-600 text-xl">🎯</div>
                  <div className="font-semibold text-sm">Réussite</div>
                </div>
              </div>
            </div>
          </div>

          {/* MESSAGE DE FIN */}
          <div className="text-center">
            <p className="text-gray-600">
              Que 2026 nous apporte encore plus de succès et de réalisations pour notre coordination !
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">2026</span>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">🎯</span>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✨</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      type: "contact",
      icon: "📞",
      title: "CONTACT & INFORMATIONS",
      subtitle: "Restons connectés",
      color: "from-[#0077B6] to-[#2E8B57]",
      urgency: "normal",
      content: (
        <div className="space-y-6">
          {/* MESSAGE */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-200">
            <p className="text-lg leading-relaxed text-gray-700">
              La Coordination Abidjan Nord Cocody reste engagée dans l'amélioration continue de nos services. 
              N'hésitez pas à remonter toutes suggestions d'amélioration via les canaux dédiés.
            </p>
            <p className="mt-3 text-sm text-gray-600 italic">
              Votre feedback est essentiel pour notre progression collective.
            </p>
          </div>

          {/* CONTACT RAPIDE */}
          <div>
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
              <span className="text-[#0077B6]">📞</span> Contact Rapide
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200 hover:border-blue-300 transition-all duration-300">
                <div className="text-[#0077B6] text-2xl mb-3">📞</div>
                <div className="font-bold text-gray-800 text-lg">07 76 73 51 15</div>
                <div className="text-sm text-gray-600 mt-2">Contact Direct</div>
                <div className="text-xs text-gray-500 mt-1">Réponse immédiate</div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border border-green-200 hover:border-green-300 transition-all duration-300">
                <div className="text-[#2E8B57] text-2xl mb-3">🏢</div>
                <div className="font-bold text-gray-800">ÉliteMultiservices</div>
                <div className="text-sm text-gray-600 mt-2">Gestionnaire</div>
                <div className="text-xs text-gray-500 mt-1">Support administratif</div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center border border-orange-200 hover:border-orange-300 transition-all duration-300">
                <div className="text-[#F77F00] text-2xl mb-3">✅</div>
                <div className="font-bold text-gray-800">Plateforme Active</div>
                <div className="text-sm text-gray-600 mt-2">Système Opérationnel</div>
                <div className="text-xs text-gray-500 mt-1">24h/24 - 7j/7</div>
              </div>
            </div>
          </div>

          {/* APPEL À L'ACTION */}
          <div className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] rounded-xl p-5 text-white text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-2xl">🤝</span>
              <span className="text-2xl">✨</span>
              <span className="text-2xl">🎯</span>
            </div>
            <p className="font-bold text-xl mb-2">Ensemble vers l'excellence !</p>
            <p className="text-white/90">
              Merci pour votre engagement et votre dévouement au service de notre coordination.
            </p>
          </div>

          {/* SIGNATURE */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200">
            <div className="w-14 h-14 bg-gradient-to-r from-[#0077B6] to-[#2E8B57] rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold">RL</span>
            </div>
            <div className="text-center">
              <p className="font-bold text-[#F77F00]">La Responsable</p>
              <p className="text-gray-600">Coordination Abidjan Nord-Cocody</p>
              <p className="text-sm text-gray-500 mt-1 italic">Innovation • Performance • Excellence</p>
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
    }, 15000); // Change toutes les 15 secondes
    
    return () => clearInterval(slideTimer);
  }, []);

  const currentSlideData = allSlides[currentSlide];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden ${
        isMobile ? 'shadow-lg' : 'shadow-xl'
      }`}
    >
      {/* EN-TÊTE DYNAMIQUE */}
      <div className={`bg-gradient-to-r ${currentSlideData.color} text-white p-4 md:p-6 relative overflow-hidden`}>
        {/* Dégradé d'arrière-plan */}
        <div className="absolute inset-0 opacity-20">
          {currentSlideData.type === "new-year" && (
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 via-pink-300/20 to-purple-300/20"></div>
          )}
          {currentSlideData.type === "distribution" && (
            <div className="absolute inset-0 bg-gradient-to-r from-green-300/20 to-emerald-300/20"></div>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3 md:gap-4">
            <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30`}>
              <span className={`${isMobile ? 'text-2xl' : 'text-3xl'}`}>
                {currentSlideData.icon}
              </span>
            </div>
            <div>
              <h2 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {currentSlideData.title}
              </h2>
              <p className="text-white/90 text-sm mt-1">
                {currentSlideData.subtitle}
              </p>
            </div>
          </div>
          
          {/* INDICATEUR DE PROGRESSION */}
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1 border border-white/30">
              <span className="text-sm font-medium">
                {currentSlide + 1}/{allSlides.length}
              </span>
            </div>
            <div className="text-xs text-white/80 bg-black/20 px-2 py-1 rounded-lg">
              ⏱️ Auto
            </div>
          </div>
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="p-4 md:p-6">
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

        {/* INDICATEURS DE NAVIGATION */}
        <div className="mt-8">
          {/* BOUTONS DE NAVIGATION */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {allSlides.map((slide, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  index === currentSlide
                    ? slide.urgency === "success"
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                      : slide.urgency === "celebration"
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-gradient-to-r from-[#0077B6] to-[#2E8B57] text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <span>{slide.icon}</span>
                <span>
                  {slide.type === "welcome" 
                    ? "Bienvenue" 
                    : slide.type === "distribution"
                    ? "Distribution"
                    : slide.type === "new-year"
                    ? "2026"
                    : "Contact"}
                </span>
              </button>
            ))}
          </div>

          {/* POINTS DE NAVIGATION */}
          <div className="flex justify-center gap-2">
            {allSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? allSlides[index].urgency === "success"
                      ? 'bg-green-500 scale-125' 
                      : allSlides[index].urgency === "celebration"
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 scale-125'
                      : 'bg-[#0077B6] scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Aller au slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              currentSlideData.urgency === "success" 
                ? 'bg-green-500' 
                : currentSlideData.urgency === "celebration"
                ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                : 'bg-[#0077B6]'
            }`}></div>
            <span className="text-sm text-gray-600">
              {currentSlideData.type === "welcome" 
                ? "Message d'accueil" 
                : currentSlideData.type === "distribution"
                ? "Opération en cours"
                : currentSlideData.type === "new-year"
                ? "Vœux 2026"
                : "Informations pratiques"}
            </span>
          </div>
          
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <span>🔄</span>
            <span>Défilement automatique • Changement dans 15s</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomeCoordinationUnified;