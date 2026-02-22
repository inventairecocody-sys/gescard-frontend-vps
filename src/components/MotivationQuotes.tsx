import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  SparklesIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

interface MotivationQuotesProps {
  isMobile?: boolean;
}

const MotivationQuotes: React.FC<MotivationQuotesProps> = ({ isMobile = false }) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const quotes = [
    { text: "« Ensemble, allons plus loin. »" },
    { text: "« Chaque carte distribuée rapproche notre objectif. »" },
    { text: "« Votre engagement fait la différence. »" },
    { text: "« Restons concentrés, restons efficaces. »" },
    { text: "« Une équipe soudée réussit toujours. »" },
    { text: "« Le professionnalisme est notre force. »" },
    { text: "« Aujourd'hui, faisons mieux qu'hier. »" },
    { text: "« Petit effort, grand résultat. »" },
    { text: "« L'excellence est un choix quotidien. »" },
    { text: "« Chaque détail compte pour la réussite. »" }
  ];

  useEffect(() => {
    if (isPaused) return;
    
    const quoteTimer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 8000);
    
    return () => clearInterval(quoteTimer);
  }, [quotes.length, isPaused]);

  const handlePrevious = () => {
    setQuoteIndex((prev) => (prev - 1 + quotes.length) % quotes.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 15000);
  };

  const handleNext = () => {
    setQuoteIndex((prev) => (prev + 1) % quotes.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 15000);
  };

  return (
    <div className={`relative bg-gradient-to-r from-[#2E8B57] to-[#0077B6] text-white ${
      isMobile ? 'py-2' : 'py-3 md:py-4'
    } overflow-hidden`}>
      
      {/* Éléments décoratifs */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-20 h-20 bg-white rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-white rounded-full filter blur-3xl"></div>
      </div>
      
      <div className={`${isMobile ? 'px-3' : 'container mx-auto px-4 md:px-6'} relative z-10`}>
        <div className="flex items-center justify-between gap-2 md:gap-4">
          
          {/* Bouton précédent */}
          <motion.button
            onClick={handlePrevious}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`${isMobile ? 'p-1' : 'p-1.5 md:p-2'} rounded-full bg-white/20 hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50`}
            aria-label="Citation précédente"
          >
            <ChevronLeftIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
          </motion.button>

          {/* Contenu principal */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={quoteIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <div className="flex flex-col items-center gap-1 md:gap-2">
                  
                  {/* Indicateurs de progression */}
                  <div className="flex items-center justify-center gap-1">
                    {quotes.map((_, index) => (
                      <div
                        key={index}
                        className={`h-0.5 md:h-1 rounded-full transition-all duration-300 ${
                          index === quoteIndex 
                            ? 'bg-white w-3 md:w-4' 
                            : 'bg-white/30 w-1 md:w-1'
                        }`}
                      />
                    ))}
                  </div>
                  
                  {/* Citation avec icônes décoratives */}
                  <div className="flex items-center justify-center gap-2 md:gap-4">
                    <SparklesIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-white/70`} />
                    <p className={`font-medium italic ${
                      isMobile 
                        ? 'text-xs md:text-sm' 
                        : 'text-sm md:text-base lg:text-lg'
                    } max-w-2xl`}>
                      {quotes[quoteIndex].text}
                    </p>
                    <SparklesIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-white/70`} />
                  </div>
                  
                  {/* Compteur */}
                  {!isMobile && (
                    <div className="text-xs text-white/60">
                      {quoteIndex + 1} / {quotes.length}
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bouton suivant */}
          <motion.button
            onClick={handleNext}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`${isMobile ? 'p-1' : 'p-1.5 md:p-2'} rounded-full bg-white/20 hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50`}
            aria-label="Citation suivante"
          >
            <ChevronRightIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
          </motion.button>
        </div>
        
        {/* Navigation mobile supplémentaire */}
        {isMobile && (
          <div className="flex items-center justify-center mt-1">
            <div className="text-xs text-white/60">
              {quoteIndex + 1} / {quotes.length}
            </div>
          </div>
        )}
        
        {/* Astuce */}
        {!isMobile && (
          <div className="text-xs text-white/50 text-center mt-2 flex items-center justify-center gap-1">
            <LightBulbIcon className="w-3 h-3" />
            <span>Les citations changent automatiquement toutes les 8 secondes</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MotivationQuotes;