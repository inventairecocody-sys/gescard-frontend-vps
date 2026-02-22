import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../Services/api/client';
import { 
  ChevronDownIcon, 
  ChevronUpIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface SiteDropdownProps {
  multiple?: boolean;
  onChange: (value: string | string[]) => void;
  selectedSites?: string[] | string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

const SiteDropdown: React.FC<SiteDropdownProps> = ({ 
  multiple = false, 
  onChange, 
  selectedSites = multiple ? [] : '', 
  placeholder = "Rechercher un site...",
  className = "",
  disabled = false,
  loading: externalLoading = false
}) => {
  const [sites, setSites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSites, setFilteredSites] = useState<string[]>([]);

  // Responsive
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const loadSites = useCallback(async () => {
    if (externalLoading) return;
    
    setLoading(true);
    try {
      const response = await api.get('/api/import-export/sites');
      setSites(response.data.sites || []);
      setFilteredSites(response.data.sites || []);
    } catch (error) {
      console.error('Erreur chargement sites:', error);
      setSites([]);
      setFilteredSites([]);
    } finally {
      setLoading(false);
    }
  }, [externalLoading]);

  useEffect(() => {
    loadSites();
  }, [loadSites]);

  useEffect(() => {
    if (search === '') {
      setFilteredSites(sites);
    } else {
      const filtered = sites.filter(site =>
        site.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredSites(filtered);
    }
  }, [search, sites]);

  const handleSiteSelect = (site: string) => {
    if (disabled) return;
    
    if (multiple) {
      const currentSites = selectedSites as string[];
      const newSites = currentSites.includes(site)
        ? currentSites.filter(s => s !== site)
        : [...currentSites, site];
      onChange(newSites);
    } else {
      onChange(site);
      setIsOpen(false);
      setSearch('');
    }
  };

  const handleRemoveSite = (site: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    
    if (multiple) {
      const currentSites = selectedSites as string[];
      const newSites = currentSites.filter(s => s !== site);
      onChange(newSites);
    }
  };

  const getDisplayValue = () => {
    if (multiple) {
      const sites = selectedSites as string[];
      if (sites.length === 0) return '';
      return `${sites.length} site${sites.length > 1 ? 's' : ''} sélectionné${sites.length > 1 ? 's' : ''}`;
    } else {
      return selectedSites as string;
    }
  };

  const clearSelection = () => {
    if (disabled) return;
    
    if (multiple) {
      onChange([]);
    } else {
      onChange('');
      setSearch('');
    }
  };

  if (loading || externalLoading) {
    return (
      <div className={`relative ${className}`}>
        <div className={`w-full px-3 py-2.5 md:px-4 md:py-3 border border-gray-300 rounded-lg bg-gray-100 animate-pulse flex items-center gap-2 ${isMobile ? 'text-sm' : ''}`}>
          <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
          <span className="text-gray-500">Chargement des sites...</span>
        </div>
      </div>
    );
  }

  const selectedCount = multiple ? (selectedSites as string[]).length : 0;
  const hasSelection = multiple ? selectedCount > 0 : !!selectedSites;

  return (
    <div className={`relative w-full ${className}`}>
      
      {/* Champ principal */}
      <div className="relative">
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full px-3 py-2.5 md:px-4 md:py-3 bg-white border rounded-lg cursor-pointer transition-all duration-200 min-h-[42px] md:min-h-[48px] flex items-center flex-wrap gap-1.5 ${
            disabled 
              ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'
              : isOpen 
                ? 'ring-2 ring-[#F77F00] border-[#F77F00]' 
                : 'border-gray-300 hover:border-[#F77F00]'
          }`}
        >
          {/* Icône bâtiment */}
          <BuildingOfficeIcon className={`w-4 h-4 md:w-5 md:h-5 flex-shrink-0 ${
            isOpen ? 'text-[#F77F00]' : 'text-gray-400'
          }`} />

          {/* Affichage des sites sélectionnés (multi) */}
          {multiple && Array.isArray(selectedSites) && selectedSites.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-1 flex-1">
                {(selectedSites as string[]).slice(0, isMobile ? 1 : 2).map((site, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 bg-[#F77F00] text-white text-xs px-2 py-1 rounded-full"
                  >
                    <span className="truncate max-w-[80px] md:max-w-[120px]">{site}</span>
                    {!disabled && (
                      <button
                        type="button"
                        onClick={(e) => handleRemoveSite(site, e)}
                        className="text-white hover:text-gray-200"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
                {selectedCount > (isMobile ? 1 : 2) && (
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                    +{selectedCount - (isMobile ? 1 : 2)}
                  </span>
                )}
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ajouter..."
                disabled={disabled}
                className="flex-1 min-w-[80px] bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 text-sm"
                onClick={(e) => e.stopPropagation()}
              />
            </>
          ) : (
            <input
              type="text"
              value={multiple ? search : getDisplayValue()}
              onChange={(e) => {
                if (!disabled) {
                  setSearch(e.target.value);
                  if (!multiple) {
                    onChange(e.target.value);
                  }
                }
              }}
              placeholder={placeholder}
              disabled={disabled}
              className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 text-sm md:text-base"
              onFocus={() => !disabled && setIsOpen(true)}
            />
          )}
          
          {/* Boutons d'action */}
          <div className="flex items-center gap-1 ml-auto">
            {hasSelection && !disabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                type="button"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled) setIsOpen(!isOpen);
              }}
              disabled={disabled}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              type="button"
            >
              {isOpen ? (
                <ChevronUpIcon className="w-4 h-4 md:w-5 md:h-5" />
              ) : (
                <ChevronDownIcon className="w-4 h-4 md:w-5 md:h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && !disabled && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 md:max-h-96 overflow-hidden"
            >
              
              {/* Barre de recherche dans le dropdown */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-2">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher un site..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F77F00] focus:border-transparent text-sm"
                    autoFocus
                  />
                </div>
              </div>
              
              {/* Liste des sites */}
              <div className="overflow-y-auto max-h-60">
                {filteredSites.length === 0 ? (
                  <div className="px-4 py-6 text-gray-500 text-center">
                    <BuildingOfficeIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-medium">
                      {search ? 'Aucun site trouvé' : 'Aucun site disponible'}
                    </p>
                    {search && (
                      <p className="text-xs text-gray-400 mt-1">
                        Essayez d'autres termes
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="py-1">
                    {filteredSites.map((site, index) => {
                      const isSelected = multiple 
                        ? (selectedSites as string[]).includes(site)
                        : selectedSites === site;
                      
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.02 }}
                          onClick={() => handleSiteSelect(site)}
                          className={`px-3 py-2.5 md:px-4 md:py-3 cursor-pointer transition-colors flex items-center justify-between ${
                            isSelected 
                              ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' 
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {multiple && (
                              <div className={`w-4 h-4 border rounded flex items-center justify-center flex-shrink-0 ${
                                isSelected 
                                  ? 'bg-blue-500 border-blue-500' 
                                  : 'border-gray-300'
                              }`}>
                                {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
                              </div>
                            )}
                            <span className={`truncate ${isSelected ? 'font-medium' : ''}`}>
                              {site}
                            </span>
                          </div>
                          
                          {!multiple && isSelected && (
                            <CheckIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Pied du dropdown */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-2 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {filteredSites.length} résultat{filteredSites.length !== 1 ? 's' : ''}
                </span>
                
                {multiple && (
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-1.5 bg-[#F77F00] text-white text-sm rounded-lg hover:bg-[#e46f00] transition-colors"
                  >
                    Valider ({selectedCount})
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SiteDropdown;