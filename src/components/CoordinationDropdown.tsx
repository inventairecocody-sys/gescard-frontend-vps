// src/components/CoordinationDropdown.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDownIcon, ChevronUpIcon,
  MagnifyingGlassIcon, XMarkIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/24/outline';
import api from '../Services/api/client';

interface CoordinationDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const CoordinationDropdown: React.FC<CoordinationDropdownProps> = ({
  value,
  onChange,
  placeholder = 'Sélectionner une coordination',
  className = '',
  disabled = false,
}) => {
  const [coordinations, setCoordinations] = useState<string[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState('');
  const [isOpen,         setIsOpen]         = useState(false);
  const [filtered,       setFiltered]       = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // ✅ Même pattern que SiteDropdown — baseURL inclut déjà /api
      const res = await api.get('/cartes/coordinations');
      const list: string[] = res.data.coordinations || res.data || [];
      setCoordinations(list);
      setFiltered(list);
    } catch {
      // Fallback silencieux
      setCoordinations([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    setFiltered(
      search === ''
        ? coordinations
        : coordinations.filter(c => c.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, coordinations]);

  const handleSelect = (coord: string) => {
    onChange(coord === value ? '' : coord); // re-clic = désélection
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-gray-50 border rounded-xl text-sm transition-all focus:outline-none ${
          isOpen
            ? 'border-[#E07B00] ring-2 ring-[#E07B00]/20'
            : 'border-gray-200 hover:border-[#E07B00]/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <BuildingOffice2Icon className="w-4 h-4 text-[#E07B00] flex-shrink-0" />
          <span className={`truncate ${value ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
            {loading ? 'Chargement…' : value || placeholder}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {value && (
            <button type="button" onClick={handleClear}
              className="p-0.5 hover:bg-gray-200 rounded-full transition-all">
              <XMarkIcon className="w-3 h-3 text-gray-400" />
            </button>
          )}
          {isOpen
            ? <ChevronUpIcon className="w-4 h-4 text-gray-400" />
            : <ChevronDownIcon className="w-4 h-4 text-gray-400" />
          }
        </div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
          >
            {/* Recherche */}
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input type="text" value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Filtrer…"
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#E07B00]" />
              </div>
            </div>

            {/* Options */}
            <div className="max-h-52 overflow-y-auto">
              {loading ? (
                <div className="px-4 py-3 text-sm text-gray-400 text-center">Chargement…</div>
              ) : filtered.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-400 text-center">Aucun résultat</div>
              ) : (
                filtered.map(coord => (
                  <button key={coord} type="button"
                    onClick={() => handleSelect(coord)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-orange-50 transition-colors ${
                      coord === value ? 'bg-orange-50 text-[#E07B00] font-semibold' : 'text-gray-700'
                    }`}
                  >
                    <span>{coord}</span>
                    {coord === value && (
                      <div className="w-4 h-4 bg-[#E07B00] rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoordinationDropdown;