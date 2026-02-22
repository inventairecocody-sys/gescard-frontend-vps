import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MagnifyingGlassIcon, 
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "filled" | "outline";
  className?: string;
  autoFocus?: boolean;
  debounceMs?: number;
  showSearchIcon?: boolean;
  showClearButton?: boolean;
  loading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Rechercher des cartes...",
  size = "md",
  variant = "default",
  className = "",
  autoFocus = false,
  debounceMs = 300,
  showSearchIcon = true,
  showClearButton = true,
  loading = false
}) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Responsive
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Debounce pour éviter trop d'appels
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      onSearch(value);
    }, debounceMs);

    setDebounceTimer(timer);
  };

  const clearSearch = () => {
    setQuery("");
    onSearch("");
  };

  // Configuration des tailles responsive
  const sizeConfig = {
    sm: {
      padding: isMobile ? 'px-3 py-2' : 'px-4 py-2',
      text: isMobile ? 'text-xs' : 'text-sm',
      rounded: 'rounded-lg',
      icon: isMobile ? 'w-4 h-4' : 'w-5 h-5'
    },
    md: {
      padding: isMobile ? 'px-4 py-2.5' : 'px-6 py-3',
      text: isMobile ? 'text-sm' : 'text-base',
      rounded: 'rounded-xl',
      icon: isMobile ? 'w-5 h-5' : 'w-5 h-5'
    },
    lg: {
      padding: isMobile ? 'px-5 py-3' : 'px-8 py-4',
      text: isMobile ? 'text-base' : 'text-lg',
      rounded: 'rounded-xl md:rounded-2xl',
      icon: isMobile ? 'w-5 h-5' : 'w-6 h-6'
    }
  };

  // Configuration des variants
  const variantConfig = {
    default: "bg-white border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100",
    filled: "bg-gray-50 border border-gray-200 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100",
    outline: "bg-transparent border-2 border-gray-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
  };

  const currentSize = sizeConfig[size];
  
  const baseClasses = `
    w-full transition-all duration-300 font-medium
    placeholder-gray-400 text-gray-800
    ${currentSize.padding}
    ${currentSize.text}
    ${currentSize.rounded}
    ${variantConfig[variant]}
    ${className}
  `;

  return (
    <div className="relative w-full">
      <motion.div
        initial={false}
        animate={{ 
          scale: isFocused ? 1.01 : 1,
        }}
        className="relative"
      >
        {/* Icône de recherche */}
        {showSearchIcon && (
          <div className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <motion.div
              animate={{ rotate: isFocused ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <MagnifyingGlassIcon className={currentSize.icon} />
            </motion.div>
          </div>
        )}

        {/* Champ de recherche */}
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`${baseClasses} ${
            showSearchIcon ? 'pl-10 md:pl-12' : 'pl-4'
          } ${showClearButton && query ? 'pr-10 md:pr-12' : 'pr-4'}`}
        />

        {/* Bouton de suppression / Loading */}
        <AnimatePresence>
          {query && showClearButton && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={clearSearch}
              className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors duration-200"
              type="button"
              aria-label="Effacer la recherche"
            >
              {loading ? (
                <div className={`${currentSize.icon} border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin`} />
              ) : (
                <XMarkIcon className={currentSize.icon} />
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Indicateur de recherche */}
      <AnimatePresence>
        {query && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute -bottom-5 left-0 text-[10px] md:text-xs text-gray-500 font-medium flex items-center gap-1"
          >
            <SparklesIcon className="w-3 h-3 text-orange-400" />
            <span>Recherche en cours...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Effet de focus décoratif */}
      <motion.div
        initial={false}
        animate={{ 
          scale: isFocused ? 1 : 0.95,
          opacity: isFocused ? 0.5 : 0
        }}
        className={`absolute inset-0 bg-gradient-to-r from-orange-100 to-transparent ${currentSize.rounded} -z-10 blur-sm`}
      />

      {/* Raccourci clavier */}
      {!isMobile && !query && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs border border-gray-200 rounded px-1.5 py-0.5 bg-gray-50">
          ⌘K
        </div>
      )}
    </div>
  );
};

// Version simplifiée avec recherche instantanée
export const InstantSearchBar: React.FC<Omit<SearchBarProps, 'debounceMs'>> = (props) => (
  <SearchBar debounceMs={0} showClearButton={true} {...props} />
);

// Version pour la recherche avec délai
export const DebouncedSearchBar: React.FC<SearchBarProps> = (props) => (
  <SearchBar debounceMs={300} {...props} />
);

export default SearchBar;