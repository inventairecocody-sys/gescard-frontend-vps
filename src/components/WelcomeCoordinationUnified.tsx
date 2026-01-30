import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeCoordinationUnifiedProps {
  isMobile?: boolean;
}

const WelcomeCoordinationUnified: React.FC<WelcomeCoordinationUnifiedProps> = ({ isMobile = false }) => {
  const [activeSection, setActiveSection] = useState<'welcome' | 'coordination'>('welcome');
  const [infoIndex, setInfoIndex] = useState(0);
  
  // Informations de coordination (cycle)
  const coordinationInfos = [
    {
      icon: "🎉",
      type: "nouvelle-annee",
      urgency: "celebration",
      color: "from-purple-600 to-pink-500",
      badge: "✨ 2026",
      deadline: "Toute l'année 2026",
      content: (
        <div className="space-y-3">
          <p className="font-semibold text-gray-800">
            Meilleurs vœux pour 2026 !
          </p>
          <p className="text-gray-700 text-sm">
            C'est avec une immense joie que nous vous souhaitons une EXCELLENTE et PROSPÈRE ANNÉE 2026 !
            Que cette nouvelle année soit remplie de bonheur, santé, prospérité et réussite.
          </p>
        </div>
      )
    },
    {
      icon: "🚨",
      type: "distribution",
      urgency: "critical",
      color: "from-red-600 to-orange-500",
      badge: "🚨 URGENT",
      deadline: "DÉBUT IMMÉDIAT",
      content: (
        <div className="space-y-3">
          <p className="font-semibold text-gray-800">
            Distribution Spéciale
          </p>
          <p className="text-gray-700 text-sm">
            OPÉRATION SPÉCIALE DE DISTRIBUTION - Mobilisation totale requise pour assurer la distribution du maximum de cartes.
            Notre coordination DOIT figurer parmi les MEILLEURES.
          </p>
        </div>
      )
    },
    {
      icon: "ℹ️",
      type: "information",
      urgency: "normal",
      color: "from-[#0077B6] to-[#2E8B57]",
      badge: "📋 INFORMATION",
      deadline: "Permanent",
      content: (
        <div className="space-y-3">
          <p className="font-semibold text-gray-800">
            Amélioration Continue
          </p>
          <p className="text-gray-700 text-sm">
            La Coordination reste engagée dans l'amélioration continue de nos services.
            Vos suggestions sont essentielles pour notre progression collective.
          </p>
        </div>
      )
    }
  ];

  // Cycle automatique des informations de coordination
  useEffect(() => {
    const infoTimer = setInterval(() => {
      setInfoIndex((prev) => (prev + 1) % coordinationInfos.length);
    }, 10000); // Change toutes les 10 secondes
    return () => clearInterval(infoTimer);
  }, [coordinationInfos.length]);

  const currentInfo = coordinationInfos[infoIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden ${
        isMobile ? 'shadow-lg' : 'shadow-xl'
      }`}
    >
      {/* EN-TÊTE UNIFIÉE */}
      <div className="bg-gradient-to-r from-[#F77F00] via-[#0077B6] to-[#2E8B57] text-white p-4 md:p-6 relative overflow-hidden">
        {/* Dégradé d'arrière-plan */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F77F00]/20 via-[#0077B6]/20 to-[#2E8B57]/20"></div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3 md:gap-4">
            <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30`}>
              {activeSection === 'welcome' ? (
                <span className={`${isMobile ? 'text-2xl' : 'text-3xl'}`}>👋</span>
              ) : (
                <span className={`${isMobile ? 'text-2xl' : 'text-3xl'}`}>📢</span>
              )}
            </div>
            <div>
              <h2 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {activeSection === 'welcome' ? 'Bienvenue GESCARD' : 'Coordination Info'}
              </h2>
              <p className="text-white/90 text-sm mt-1">
                {activeSection === 'welcome' 
                  ? 'Nouvelle plateforme • Innovation • Performance' 
                  : 'Messages importants • Actualités • Alertes'}
              </p>
            </div>
          </div>
          
          {/* INDICATEUR DE SECTION */}
          <div className="flex bg-white/20 backdrop-blur-sm rounded-xl p-1 border border-white/30">
            <button
              onClick={() => setActiveSection('welcome')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeSection === 'welcome'
                  ? 'bg-white text-[#F77F00] shadow-lg'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>👋</span>
                <span className={isMobile ? 'text-sm' : ''}>Bienvenue</span>
              </div>
            </button>
            <button
              onClick={() => setActiveSection('coordination')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeSection === 'coordination'
                  ? 'bg-white text-[#0077B6] shadow-lg'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>📢</span>
                <span className={isMobile ? 'text-sm' : ''}>Coordination</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="p-4 md:p-6">
        <AnimatePresence mode="wait">
          {activeSection === 'welcome' ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 md:space-y-6"
            >
              {/* MESSAGE DE BIENVENUE */}
              <div className="space-y-4">
                <p className={`${isMobile ? 'text-sm' : 'text-lg'} leading-relaxed text-gray-700`}>
                  <strong className="text-[#F77F00]">Chers collaborateurs,</strong>
                </p>
                
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                  <p className={`${isMobile ? 'text-sm' : 'text-lg'} leading-relaxed text-gray-700`}>
                    J'ai le plaisir de vous annoncer la mise en place de notre nouveau logiciel Web de recherche rapide de cartes <strong className="text-blue-600">GESCARD</strong>.
                  </p>
                </div>

                <p className={`${isMobile ? 'text-sm' : 'text-lg'} leading-relaxed text-gray-700`}>
                  Cette plateforme a été conçue pour <strong className="text-blue-600">faciliter et améliorer</strong> nos services de distribution, en permettant à chacun d'effectuer des recherches plus <strong className="text-blue-600">simples, plus rapides et plus efficaces</strong>.
                </p>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <p className={`${isMobile ? 'text-sm' : 'text-lg'} leading-relaxed text-gray-700`}>
                    Cet outil est désormais accessible à tous les membres de la coordination et constitue une <strong className="text-green-600">étape importante</strong> dans la modernisation de notre travail au quotidien.
                  </p>
                </div>

                <p className={`${isMobile ? 'text-sm' : 'text-lg'} leading-relaxed text-gray-700`}>
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
            </motion.div>
          ) : (
            <motion.div
              key="coordination"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 md:space-y-6"
            >
              {/* CARTE D'INFORMATION ACTUELLE */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={infoIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`rounded-xl p-4 md:p-5 border shadow-sm ${
                    currentInfo.urgency === "celebration"
                      ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
                      : currentInfo.urgency === "critical"
                      ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'
                      : 'bg-gradient-to-br from-blue-50 to-green-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      currentInfo.urgency === "celebration"
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                        : currentInfo.urgency === "critical"
                        ? 'bg-gradient-to-r from-red-500 to-orange-500'
                        : 'bg-gradient-to-r from-[#0077B6] to-[#2E8B57]'
                    }`}>
                      <span className="text-white text-xl">{currentInfo.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-800">
                          {currentInfo.type === "nouvelle-annee" 
                            ? "NOUVELLE ANNÉE 2026" 
                            : currentInfo.type === "distribution"
                            ? "ALERTE DISTRIBUTION"
                            : "INFORMATION IMPORTANTE"}
                        </h3>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          currentInfo.urgency === "celebration"
                            ? 'bg-purple-100 text-purple-700'
                            : currentInfo.urgency === "critical"
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {currentInfo.badge}
                        </span>
                      </div>
                      {currentInfo.content}
                      <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                        <span>📅</span>
                        <span>{currentInfo.deadline}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* BOUTONS DE NAVIGATION DES INFOS */}
              <div className="flex justify-center gap-2">
                {coordinationInfos.map((info, index) => (
                  <button
                    key={index}
                    onClick={() => setInfoIndex(index)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      index === infoIndex
                        ? info.urgency === "celebration"
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                          : info.urgency === "critical"
                          ? 'bg-red-500 text-white shadow-lg'
                          : 'bg-[#0077B6] text-white shadow-lg'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <span>{info.icon}</span>
                    <span>
                      {info.type === "nouvelle-annee" 
                        ? "2026" 
                        : info.type === "distribution"
                        ? "Urgent"
                        : "Info"}
                    </span>
                  </button>
                ))}
              </div>

              {/* INDICATEURS DE PAGE */}
              <div className="flex justify-center gap-2">
                {coordinationInfos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setInfoIndex(index)}
                    className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${
                      index === infoIndex 
                        ? coordinationInfos[index].urgency === "celebration"
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 scale-125' 
                          : coordinationInfos[index].urgency === "critical"
                          ? 'bg-red-500 scale-125'
                          : 'bg-[#0077B6] scale-125'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>

              {/* CONTACT RAPIDE */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span>📞</span> Contact Rapide
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                    <div className="text-[#F77F00] text-lg mb-1">📞</div>
                    <div className="font-semibold text-gray-800">07 76 73 51 15</div>
                    <div className="text-xs text-gray-600 mt-1">Contact Direct</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                    <div className="text-[#0077B6] text-lg mb-1">🏢</div>
                    <div className="font-semibold text-gray-800">ÉliteMultiservices</div>
                    <div className="text-xs text-gray-600 mt-1">Gestionnaire</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                    <div className="text-[#2E8B57] text-lg mb-1">✅</div>
                    <div className="font-semibold text-gray-800">Plateforme Active</div>
                    <div className="text-xs text-gray-600 mt-1">Système Opérationnel</div>
                  </div>
                </div>
              </div>

              {/* APPEL À L'ACTION */}
              <div className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] rounded-xl p-4 text-white text-center">
                <p className="font-bold text-lg mb-2">Ensemble vers l'excellence !</p>
                <p className="text-white/90 text-sm">
                  Merci pour votre engagement et votre dévouement au service de notre coordination.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER AVEC INDICATEUR */}
      <div className="border-t border-gray-200 p-3 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              activeSection === 'welcome' ? 'bg-[#F77F00]' : 'bg-[#0077B6]'
            }`}></div>
            <span>
              {activeSection === 'welcome' ? 'Message de Bienvenue' : 'Informations Coordination'}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {activeSection === 'welcome' ? '✨ Innovation & Performance' : '📢 Actualités en temps réel'}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomeCoordinationUnified;