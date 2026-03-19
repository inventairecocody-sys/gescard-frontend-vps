// src/pages/administration/Comptes.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UsersIcon, UserPlusIcon, PencilIcon, ShieldCheckIcon, UserIcon,
  CheckCircleIcon, XCircleIcon, MagnifyingGlassIcon, ArrowPathIcon,
  KeyIcon, BuildingOfficeIcon, BuildingStorefrontIcon, CalendarIcon,
  ExclamationTriangleIcon, FunnelIcon, XMarkIcon, EyeIcon, EyeSlashIcon,
  MapPinIcon, PlusIcon, TrashIcon, LinkIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { UtilisateursService } from '../../Services/api/utilisateurs';
import apiClient from '../../Services/api/client';

// ─── Types ────────────────────────────────────────────────────
interface Utilisateur {
  id: number;
  nomUtilisateur: string;
  nomComplet?: string;
  role: 'Administrateur' | 'Gestionnaire' | "Chef d'équipe" | 'Opérateur';
  coordination: string;
  agence: string;
  email?: string;
  telephone?: string;
  actif: boolean;
  dateCreation: string;
  derniereConnexion?: string;
  sites?: SiteRef[];
}

interface Agence {
  id: number;
  nom: string;
  coordination_id: number;
  coordination_nom?: string;
  coordination_code?: string;
  responsable?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  description?: string;
  is_active: boolean;
  nombre_sites?: number;
  nombre_agents?: number;
}

interface SiteRef {
  id: string;
  nom: string;
  coordination_id: number;
  coordination_nom?: string;
  est_site_principal?: boolean;
}

interface Coordination {
  id: number;
  nom: string;
  code: string;
  responsable?: string;
  telephone?: string;
  email?: string;
  region?: string;
  ville_principale?: string;
  nombre_sites?: number;
  nombre_agents?: number;
  description?: string;
  is_active: boolean;
}

interface Site {
  id: string;
  nom: string;
  coordination_id: number;
  coordination_nom?: string;
  coordination_code?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  responsable_nom?: string;
  responsable_email?: string;
  is_active: boolean;
  total_cards?: number;
  pending_cards?: number;
  synced_cards?: number;
}

// ─── Constantes ───────────────────────────────────────────────
const ROLES_OPTIONS = ['Opérateur', "Chef d'équipe", 'Gestionnaire', 'Administrateur'] as const;

const ROLE_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  'Administrateur': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Gestionnaire':   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'   },
  "Chef d'équipe":  { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200'  },
  'Opérateur':      { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200'  },
};

const TABS = [
  { id: 'utilisateurs',  label: 'Utilisateurs',  icon: UsersIcon },
  { id: 'coordinations', label: 'Coordinations', icon: BuildingOfficeIcon },
  { id: 'agences',       label: 'Agences',        icon: BuildingStorefrontIcon },
  { id: 'sites',         label: 'Sites',           icon: MapPinIcon },
] as const;
type TabId = typeof TABS[number]['id'];

const fmt = (d: string) => {
  try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
  catch { return d; }
};

const inputCls = "w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F77F00]/30 focus:border-[#F77F00] transition-all";
const inputDisabledCls = "w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm text-gray-500";

// ─── Services API ─────────────────────────────────────────────
const AgencesService = {
  getAll: (params?: { coordination_id?: number }) =>
    apiClient.get<{ success: boolean; agences: Agence[] }>('/agences', { params }),
  create: (data: Partial<Agence> & { CoordinationId: number; Nom: string }) =>
    apiClient.post('/agences', data),
  update: (id: number, data: Partial<Agence>) =>
    apiClient.put(`/agences/${id}`, data),
  delete: (id: number) => apiClient.delete(`/agences/${id}`),
};

const CoordinationsService = {
  getAll: () => apiClient.get<{ success: boolean; coordinations: Coordination[] }>('/coordinations'),
  create: (data: Partial<Coordination>) => apiClient.post('/coordinations', data),
  update: (id: number, data: Partial<Coordination>) => apiClient.put(`/coordinations/${id}`, data),
  delete: (id: number) => apiClient.delete(`/coordinations/${id}`),
};

const SitesService = {
  getAll: (params?: { coordination_id?: number; is_active?: boolean }) =>
    apiClient.get<{ success: boolean; sites: Site[] }>('/sites', { params }),
  create: (data: any) => apiClient.post('/sites', data),
  update: (id: string, data: any) => apiClient.put(`/sites/${id}`, data),
  delete: (id: string) => apiClient.delete(`/sites/${id}`),
  toggle: (id: string) => apiClient.patch(`/sites/${id}/toggle`),
  getSitesList: () => apiClient.get<{ success: boolean; sites: SiteRef[] }>('/sites'),
};

// ─── Composants réutilisables ─────────────────────────────────
const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const s = ROLE_STYLE[role] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.bg} ${s.text} ${s.border}`}>
      {role === 'Administrateur' ? <ShieldCheckIcon className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
      {role}
    </span>
  );
};

const StatCard: React.FC<{ label: string; value: number | string; color: string; icon: React.ReactNode }> = ({ label, value, color, icon }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>{icon}</div>
    <div>
      <div className="text-2xl font-black text-gray-800">{value}</div>
      <div className="text-xs text-gray-500 font-medium">{label}</div>
    </div>
  </motion.div>
);

const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const Modal: React.FC<{
  onClose: () => void; title: string; icon: React.ReactNode;
  children: React.ReactNode; maxWidth?: string;
}> = ({ onClose, title, icon, children, maxWidth = 'max-w-lg' }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    onClick={onClose}>
    <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[92vh] overflow-y-auto`}
      onClick={e => e.stopPropagation()}>
      <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-[#F77F00] to-[#FF9E40] rounded-xl flex items-center justify-center shadow-sm">{icon}</div>
          <h3 className="font-bold text-gray-800 text-base">{title}</h3>
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </motion.div>
  </motion.div>
);

const AlertBanner: React.FC<{ type: 'error' | 'success'; message: string; onClose: () => void }> = ({ type, message, onClose }) => (
  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm border ${type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
    {type === 'error' ? <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" /> : <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />}
    <span className="flex-1">{message}</span>
    <button onClick={onClose}><XMarkIcon className="w-4 h-4 opacity-60 hover:opacity-100" /></button>
  </motion.div>
);

const ConfirmModal: React.FC<{
  title: string; message: string; type: 'danger' | 'success';
  onConfirm: () => void; onCancel: () => void;
}> = ({ title, message, type, onConfirm, onCancel }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
    onClick={onCancel}>
    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
      className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${type === 'danger' ? 'bg-red-100' : 'bg-green-100'}`}>
        <ExclamationTriangleIcon className={`w-6 h-6 ${type === 'danger' ? 'text-red-500' : 'text-green-600'}`} />
      </div>
      <h3 className="font-bold text-gray-800 text-center mb-2">{title}</h3>
      <p className="text-gray-600 text-sm text-center mb-6">{message}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium transition-all">
          Annuler
        </button>
        <button onClick={onConfirm}
          className={`flex-1 py-2.5 text-white rounded-xl font-semibold text-sm shadow transition-all ${
            type === 'danger'
              ? 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600'
              : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
          }`}>
          Confirmer
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// ─── Formulaire utilisateur ───────────────────────────────────
const UserForm: React.FC<{
  formData: any; setFormData: any;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEdit?: boolean;
  submitLabel: string;
  sites: SiteRef[];
  selectedSiteIds: string[];
  setSelectedSiteIds: (ids: string[]) => void;
  coordinations: Coordination[];
  agences: Agence[];
}> = ({ formData, setFormData, onSubmit, onCancel, isEdit, submitLabel, sites, selectedSiteIds, setSelectedSiteIds, coordinations, agences }) => {
  const [showPwd,  setShowPwd]  = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const set = (key: string, val: any) => setFormData((f: any) => ({ ...f, [key]: val }));

  const toggleSite = (siteId: string) => {
    setSelectedSiteIds(
      selectedSiteIds.includes(siteId)
        ? selectedSiteIds.filter(id => id !== siteId)
        : [...selectedSiteIds, siteId]
    );
  };

  const selectedCoord = coordinations.find(c => c.nom === formData.coordination);
  const agencesFiltrees = selectedCoord
    ? agences.filter(a => a.coordination_id === selectedCoord.id && a.is_active)
    : agences.filter(a => a.is_active);

  const sitesFiltres: SiteRef[] = formData.agence_id
    ? sites.filter(s => s.coordination_id === selectedCoord?.id)
    : sites.filter(s => !selectedCoord || s.coordination_id === selectedCoord.id);

  const sitesByCoord: Record<string, SiteRef[]> = {};
  sitesFiltres.forEach(s => {
    const key = s.coordination_nom || 'Sites';
    if (!sitesByCoord[key]) sitesByCoord[key] = [];
    sitesByCoord[key].push(s);
  });

  const handleCoordChange = (nom: string) => {
    setFormData((f: any) => ({ ...f, coordination: nom, agence_id: '', agence: '' }));
    setSelectedSiteIds([]);
  };

  const handleAgenceChange = (id: string) => {
    const agence = agences.find(a => a.id === parseInt(id));
    setFormData((f: any) => ({ ...f, agence_id: id ? parseInt(id) : '', agence: agence?.nom || '' }));
    setSelectedSiteIds([]);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Nom complet">
        <input type="text" value={formData.nomComplet} onChange={e => set('nomComplet', e.target.value)}
          placeholder="Ex : KOUASSI Jean-Baptiste" className={inputCls} />
      </Field>

      <Field label="Nom d'utilisateur" required>
        {isEdit
          ? <input type="text" value={formData.nomUtilisateur} disabled className={inputDisabledCls} />
          : <input type="text" value={formData.nomUtilisateur} onChange={e => set('nomUtilisateur', e.target.value)}
              placeholder="Ex : jkouassi" className={inputCls} required minLength={3} />
        }
      </Field>

      <Field label="Rôle" required>
        <select value={formData.role} onChange={e => set('role', e.target.value)} className={inputCls} required>
          {ROLES_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Coordination">
          <select value={formData.coordination} onChange={e => handleCoordChange(e.target.value)} className={inputCls}>
            <option value="">Sélectionner…</option>
            {coordinations.filter(c => c.is_active).map(c => (
              <option key={c.id} value={c.nom}>{c.nom}</option>
            ))}
          </select>
        </Field>
        <Field label="Agence">
          <select value={formData.agence_id || ''} onChange={e => handleAgenceChange(e.target.value)} className={inputCls}>
            <option value="">Sélectionner…</option>
            {agencesFiltrees.map(a => (
              <option key={a.id} value={a.id}>{a.nom}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Email">
          <input type="email" value={formData.email} onChange={e => set('email', e.target.value)}
            placeholder="email@exemple.com" className={inputCls} />
        </Field>
        <Field label="Téléphone">
          <input type="tel" value={formData.telephone} onChange={e => set('telephone', e.target.value)}
            placeholder="+225 07 00 00 00" className={inputCls} />
        </Field>
      </div>

      {/* Sites liés */}
      {(
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5" />
            Sites associés {!isEdit && <span className="text-red-500">*</span>}
          </p>
          {!selectedCoord ? (
            <div className="flex items-center gap-2 px-3 py-3 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-sm text-gray-400 italic">
              <MapPinIcon className="w-4 h-4 flex-shrink-0" />
              Sélectionnez d'abord une coordination pour voir les sites disponibles
            </div>
          ) : sitesFiltres.length === 0 ? (
            <p className="text-sm text-gray-400 italic px-1">Aucun site disponible pour cette coordination</p>
          ) : (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="max-h-52 overflow-y-auto divide-y divide-gray-100">
                {sitesFiltres.map((site, idx) => {
                  const checked = selectedSiteIds.includes(site.id);
                  const isPrincipal = selectedSiteIds[0] === site.id && checked;
                  return (
                    <label key={site.id}
                      className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                        checked ? 'bg-orange-50' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      } hover:bg-orange-50/60`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSite(site.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#F77F00] focus:ring-[#F77F00]/30 cursor-pointer"
                      />
                      <BuildingStorefrontIcon className={`w-4 h-4 flex-shrink-0 ${checked ? 'text-[#F77F00]' : 'text-gray-400'}`} />
                      <span className={`text-sm flex-1 ${checked ? 'font-semibold text-[#F77F00]' : 'text-gray-700'}`}>
                        {site.nom}
                      </span>
                      {isPrincipal && (
                        <span className="text-[10px] font-bold bg-[#F77F00] text-white px-1.5 py-0.5 rounded-full">
                          ★ Principal
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
              <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">{sitesFiltres.length} site(s) disponible(s)</span>
                {selectedSiteIds.length > 0 && (
                  <span className="text-xs font-semibold text-[#F77F00]">
                    {selectedSiteIds.length} sélectionné(s)
                  </span>
                )}
              </div>
            </div>
          )}
          {selectedCoord && selectedSiteIds.length > 0 && (
            <p className="text-xs text-[#F77F00] mt-2 font-medium flex items-center gap-1">
              <span>★ Site principal :</span>
              <span className="font-bold">{sites.find(s => s.id === selectedSiteIds[0])?.nom || selectedSiteIds[0]}</span>
              <span className="text-gray-400 font-normal">(premier sélectionné)</span>
            </p>
          )}
        </div>
      )}

      {/* Mot de passe */}
      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <KeyIcon className="w-3.5 h-3.5" />
          {isEdit ? 'Changer le mot de passe (optionnel)' : 'Mot de passe'}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Mot de passe" required={!isEdit}>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} value={formData.motDePasse}
                onChange={e => set('motDePasse', e.target.value)}
                className={inputCls + ' pr-9'} minLength={6} required={!isEdit} />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPwd ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </Field>
          <Field label="Confirmer" required={!isEdit}>
            <div className="relative">
              <input type={showPwd2 ? 'text' : 'password'} value={formData.confirmerMotDePasse}
                onChange={e => set('confirmerMotDePasse', e.target.value)}
                className={inputCls + ' pr-9'} minLength={6} required={!isEdit} />
              <button type="button" onClick={() => setShowPwd2(v => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPwd2 ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </Field>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 text-sm font-medium transition-all">
          Annuler
        </button>
        <button type="submit"
          className="px-5 py-2.5 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white rounded-xl font-semibold text-sm shadow hover:shadow-md transition-all">
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

// ─── Formulaire Coordination ──────────────────────────────────
const CoordinationForm: React.FC<{
  data: Partial<Coordination>; setData: (d: Partial<Coordination>) => void;
  onSubmit: (e: React.FormEvent) => void; onCancel: () => void; submitLabel: string;
}> = ({ data, setData, onSubmit, onCancel, submitLabel }) => {
  const set = (key: string, val: string) => setData({ ...data, [key]: val });
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nom" required>
          <input type="text" value={data.nom || ''} onChange={e => set('nom', e.target.value)}
            placeholder="Ex : ABIDJAN NORD COCODY" className={inputCls} required />
        </Field>
        <Field label="Code">
          <input type="text" value={data.code || ''} onChange={e => set('code', e.target.value)}
            placeholder="Ex : ANC (auto-généré si vide)" className={inputCls} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Responsable">
          <input type="text" value={data.responsable || ''} onChange={e => set('responsable', e.target.value)}
            placeholder="Nom du responsable" className={inputCls} />
        </Field>
        <Field label="Téléphone">
          <input type="tel" value={data.telephone || ''} onChange={e => set('telephone', e.target.value)}
            placeholder="+225 07 00 00 00" className={inputCls} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Email">
          <input type="email" value={data.email || ''} onChange={e => set('email', e.target.value)}
            placeholder="coord@gescard.ci" className={inputCls} />
        </Field>
        <Field label="Région">
          <input type="text" value={data.region || ''} onChange={e => set('region', e.target.value)}
            placeholder="Ex : Abidjan" className={inputCls} />
        </Field>
      </div>
      <Field label="Ville principale">
        <input type="text" value={data.ville_principale || ''} onChange={e => set('ville_principale', e.target.value)}
          placeholder="Ex : Cocody" className={inputCls} />
      </Field>
      <Field label="Description">
        <textarea value={data.description || ''} onChange={e => set('description', e.target.value)}
          placeholder="Description…" rows={2} className={inputCls + ' resize-none'} />
      </Field>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 text-sm font-medium transition-all">
          Annuler
        </button>
        <button type="submit"
          className="px-5 py-2.5 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white rounded-xl font-semibold text-sm shadow hover:shadow-md transition-all">
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

// ─── Formulaire Agence ───────────────────────────────────────
const AgenceForm: React.FC<{
  data: Partial<Agence>; setData: (d: Partial<Agence>) => void;
  coordinations: Coordination[];
  onSubmit: (e: React.FormEvent) => void; onCancel: () => void;
  submitLabel: string; isEdit?: boolean;
}> = ({ data, setData, coordinations, onSubmit, onCancel, submitLabel, isEdit }) => {
  const set = (key: string, val: any) => setData({ ...data, [key]: val });
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nom de l'agence" required>
          <input type="text" value={data.nom || ''} onChange={e => set('nom', e.target.value)}
            placeholder="Ex : BINGERVILLE" className={inputCls} required />
        </Field>
        <Field label="Coordination" required>
          <select value={data.coordination_id || ''} onChange={e => set('coordination_id', parseInt(e.target.value))}
            className={inputCls} required disabled={isEdit}>
            <option value="">Sélectionner…</option>
            {coordinations.filter(c => c.is_active).map(c => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Responsable">
          <input type="text" value={data.responsable || ''} onChange={e => set('responsable', e.target.value)}
            placeholder="Nom du responsable" className={inputCls} />
        </Field>
        <Field label="Téléphone">
          <input type="tel" value={data.telephone || ''} onChange={e => set('telephone', e.target.value)}
            placeholder="+225 07 00 00 00" className={inputCls} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Email">
          <input type="email" value={data.email || ''} onChange={e => set('email', e.target.value)}
            placeholder="agence@gescard.ci" className={inputCls} />
        </Field>
        <Field label="Adresse">
          <input type="text" value={data.adresse || ''} onChange={e => set('adresse', e.target.value)}
            placeholder="Adresse" className={inputCls} />
        </Field>
      </div>
      <Field label="Description">
        <textarea value={data.description || ''} onChange={e => set('description', e.target.value)}
          placeholder="Description…" rows={2} className={inputCls + ' resize-none'} />
      </Field>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 text-sm font-medium transition-all">
          Annuler
        </button>
        <button type="submit"
          className="px-5 py-2.5 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white rounded-xl font-semibold text-sm shadow hover:shadow-md transition-all">
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

// ─── Formulaire Site ──────────────────────────────────────────
const SiteForm: React.FC<{
  data: any; setData: (d: any) => void;
  coordinations: Coordination[];
  agences: Agence[];
  onSubmit: (e: React.FormEvent) => void; onCancel: () => void;
  submitLabel: string; isEdit?: boolean;
}> = ({ data, setData, coordinations, agences, onSubmit, onCancel, submitLabel, isEdit }) => {
  const set = (key: string, val: any) => setData({ ...data, [key]: val });

  const agencesFiltrees = data.CoordinationId || data.coordination_id
    ? agences.filter(a => a.coordination_id === (data.CoordinationId || data.coordination_id) && a.is_active)
    : agences.filter(a => a.is_active);

  const handleCoordChange = (val: string) => {
    setData({ ...data, CoordinationId: parseInt(val), AgenceId: '' });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nom du site" required>
          <input type="text" value={data.Nom || data.nom || ''} onChange={e => set('Nom', e.target.value)}
            placeholder="Ex : MAIRIE DE COCODY" className={inputCls} required />
        </Field>
        <Field label="Coordination" required>
          <select value={data.CoordinationId || data.coordination_id || ''}
            onChange={e => handleCoordChange(e.target.value)}
            className={inputCls} required disabled={isEdit}>
            <option value="">Sélectionner…</option>
            {coordinations.filter(c => c.is_active).map(c => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Agence">
        <select value={data.AgenceId || data.agence_id || ''}
          onChange={e => set('AgenceId', e.target.value ? parseInt(e.target.value) : '')}
          className={inputCls}>
          <option value="">Sélectionner une agence…</option>
          {agencesFiltrees.map(a => (
            <option key={a.id} value={a.id}>{a.nom}</option>
          ))}
        </select>
      </Field>
      <Field label="Adresse">
        <input type="text" value={data.adresse || ''} onChange={e => set('adresse', e.target.value)}
          placeholder="Adresse complète" className={inputCls} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Téléphone">
          <input type="tel" value={data.telephone || ''} onChange={e => set('telephone', e.target.value)}
            placeholder="+225 07 00 00 00" className={inputCls} />
        </Field>
        <Field label="Email">
          <input type="email" value={data.email || ''} onChange={e => set('email', e.target.value)}
            placeholder="site@gescard.ci" className={inputCls} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Responsable">
          <input type="text" value={data.responsable_nom || ''} onChange={e => set('responsable_nom', e.target.value)}
            placeholder="Nom du responsable" className={inputCls} />
        </Field>
        <Field label="Email responsable">
          <input type="email" value={data.responsable_email || ''} onChange={e => set('responsable_email', e.target.value)}
            placeholder="resp@gescard.ci" className={inputCls} />
        </Field>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 text-sm font-medium transition-all">
          Annuler
        </button>
        <button type="submit"
          className="px-5 py-2.5 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white rounded-xl font-semibold text-sm shadow hover:shadow-md transition-all">
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

// ═══════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ═══════════════════════════════════════════════════════════════
const Comptes: React.FC = () => {
  const { user } = useAuth();
  usePermissions();

  const isAdmin   = user?.role === 'Administrateur';
  const peutGerer = ['Administrateur', 'Gestionnaire', "Chef d'équipe"].includes(user?.role || '');

  const [activeTab, setActiveTab] = useState<TabId>('utilisateurs');

  // Alertes
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const showError   = (msg: string) => { setError(msg);   setTimeout(() => setError(''),   5000); };
  const showSuccess = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };

  // ── Confirmation ──────────────────────────────────────────
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean; title: string; message: string;
    type: 'danger' | 'success'; action: () => Promise<void>;
  }>({ show: false, title: '', message: '', type: 'danger', action: async () => {} });

  const askConfirm = (title: string, message: string, type: 'danger' | 'success', action: () => Promise<void>) =>
    setConfirmModal({ show: true, title, message, type, action });

  // ─────────────────────────────────────────────────────────
  // UTILISATEURS
  // ─────────────────────────────────────────────────────────
  const [utilisateurs,    setUtilisateurs]    = useState<Utilisateur[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [searchTerm,      setSearchTerm]      = useState('');
  const [filterRole,      setFilterRole]      = useState('all');
  const [filterStatus,    setFilterStatus]    = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal,   setShowEditModal]   = useState(false);
  const [editingUser,     setEditingUser]     = useState<Utilisateur | null>(null);
  const [currentPage,     setCurrentPage]     = useState(1);
  const [sitesList,       setSitesList]       = useState<SiteRef[]>([]);
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([]);
  const PER_PAGE = 10;

  const emptyUserForm = {
    nomUtilisateur: '', nomComplet: '', role: 'Opérateur' as Utilisateur['role'],
    coordination: '', agence: '', email: '', telephone: '',
    motDePasse: '', confirmerMotDePasse: '',
  };
  const [userForm, setUserForm] = useState(emptyUserForm);

  const fetchUtilisateurs = useCallback(async () => {
    if (!peutGerer) { setLoading(false); return; }
    setLoading(true);
    try {
      const response = await UtilisateursService.getUtilisateurs({ limit: 200 });
      const list: Utilisateur[] = (response?.data || []).map((u: any) => ({
        id:                u.id,
        nomUtilisateur:    u.nomUtilisateur    || u.nomutilisateur    || '',
        nomComplet:        u.nomComplet        || u.nomcomplet        || '',
        role:              u.role              || 'Opérateur',
        coordination:      u.coordination      || '',
        agence:            u.agence            || '',
        email:             u.email,
        telephone:         u.telephone,
        actif:             u.actif !== false,
        dateCreation:      u.dateCreation      || u.datecreation      || new Date().toISOString(),
        derniereConnexion: u.derniereConnexion || u.derniereconnexion,
        sites:             u.sites             || [],
      }));
      setUtilisateurs(list);
    } catch { showError('Impossible de charger les utilisateurs'); }
    finally { setLoading(false); }
  }, [peutGerer]);

  const fetchSitesList = useCallback(async () => {
    try {
      const res = await SitesService.getAll();
      const refs: SiteRef[] = (res.data.sites || []).map((s: Site) => ({
        id: s.id,
        nom: s.nom,
        coordination_id: s.coordination_id,
        coordination_nom: s.coordination_nom,
      }));
      setSitesList(refs);
    } catch { /* silencieux */ }
  }, []);

  useEffect(() => {
    fetchUtilisateurs();
    fetchSitesList();
    fetchCoordinations();
    fetchAgences();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statsU = {
    total:           utilisateurs.length,
    actifs:          utilisateurs.filter(u => u.actif).length,
    inactifs:        utilisateurs.filter(u => !u.actif).length,
    administrateurs: utilisateurs.filter(u => u.role === 'Administrateur').length,
    gestionnaires:   utilisateurs.filter(u => u.role === 'Gestionnaire').length,
    chefs:           utilisateurs.filter(u => u.role === "Chef d'équipe").length,
    operateurs:      utilisateurs.filter(u => u.role === 'Opérateur').length,
  };

  const filtered = utilisateurs.filter(u => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q ||
      u.nomUtilisateur.toLowerCase().includes(q) ||
      (u.nomComplet?.toLowerCase() || '').includes(q) ||
      (u.email?.toLowerCase() || '').includes(q) ||
      u.coordination.toLowerCase().includes(q) ||
      u.agence.toLowerCase().includes(q);
    const matchRole   = filterRole   === 'all' || u.role === filterRole;
    const matchStatus = filterStatus === 'all' ||
      (filterStatus === 'actif' && u.actif) ||
      (filterStatus === 'inactif' && !u.actif);
    return matchSearch && matchRole && matchStatus;
  });

  const totalPages   = Math.ceil(filtered.length / PER_PAGE);
  const currentUsers = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  // ✅ CORRECTION PRINCIPALE : PascalCase pour correspondre au backend
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userForm.motDePasse !== userForm.confirmerMotDePasse) {
      showError('Mots de passe différents');
      return;
    }
    if (userForm.role !== 'Administrateur' && selectedSiteIds.length === 0) {
      showError('Au moins un site doit être sélectionné');
      return;
    }
    try {
      await UtilisateursService.createUtilisateur({
        NomUtilisateur: userForm.nomUtilisateur,        // ✅ PascalCase
        NomComplet:     userForm.nomComplet || undefined, // ✅ PascalCase
        Role:           userForm.role,                   // ✅ PascalCase
        Coordination:   userForm.coordination || undefined,
        Agence:         userForm.agence || undefined,
        Email:          userForm.email || undefined,
        MotDePasse:     userForm.motDePasse,             // ✅ PascalCase
        SiteIds:        selectedSiteIds,
      } as any);
      showSuccess('Utilisateur créé avec succès');
      setShowCreateModal(false);
      setUserForm(emptyUserForm);
      setSelectedSiteIds([]);
      fetchUtilisateurs();
    } catch (e: any) {
      showError(e.response?.data?.message || 'Erreur lors de la création');
    }
  };

  // ✅ CORRECTION : PascalCase pour la mise à jour également
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (userForm.motDePasse && userForm.motDePasse !== userForm.confirmerMotDePasse) {
      showError('Mots de passe différents');
      return;
    }
    try {
      const data: any = {
        NomComplet:   userForm.nomComplet   || undefined, // ✅ PascalCase
        Role:         userForm.role,                      // ✅ PascalCase
        Coordination: userForm.coordination || undefined,
        Agence:       userForm.agence       || undefined,
        Email:        userForm.email        || undefined,
        SiteIds:      selectedSiteIds,
      };
      if (userForm.motDePasse) data.MotDePasse = userForm.motDePasse; // ✅ PascalCase
      await UtilisateursService.updateUtilisateur(editingUser.id, data);
      showSuccess('Utilisateur modifié avec succès');
      setShowEditModal(false);
      setUserForm(emptyUserForm);
      setSelectedSiteIds([]);
      fetchUtilisateurs();
    } catch (e: any) {
      showError(e.response?.data?.message || 'Erreur lors de la modification');
    }
  };

  const handleToggleStatus = (u: Utilisateur) => {
    askConfirm(
      `${u.actif ? 'Désactiver' : 'Réactiver'} l'utilisateur`,
      `Voulez-vous ${u.actif ? 'désactiver' : 'réactiver'} ${u.nomComplet || u.nomUtilisateur} ?`,
      u.actif ? 'danger' : 'success',
      async () => {
        try {
          if (u.actif) await UtilisateursService.deleteUtilisateur(u.id);
          else         await UtilisateursService.activateUtilisateur(u.id);
          showSuccess(`Utilisateur ${u.actif ? 'désactivé' : 'réactivé'} avec succès`);
          fetchUtilisateurs();
        } catch (e: any) { showError(e.response?.data?.message || 'Erreur'); }
      }
    );
  };

  const openEditUser = (u: Utilisateur) => {
    setEditingUser(u);
    setUserForm({
      nomUtilisateur: u.nomUtilisateur, nomComplet: u.nomComplet || '',
      role: u.role, coordination: u.coordination, agence: u.agence,
      email: u.email || '', telephone: u.telephone || '',
      motDePasse: '', confirmerMotDePasse: '',
    });
    setSelectedSiteIds((u.sites || []).map(s => s.id));
    setShowEditModal(true);
  };

  const handleDeleteUser = (u: Utilisateur) => {
    askConfirm(
      'Supprimer le compte utilisateur',
      `Supprimer définitivement le compte "${u.nomComplet || u.nomUtilisateur}" ? Cette action est irréversible.`,
      'danger',
      async () => {
        try {
          await UtilisateursService.deleteUtilisateur(u.id);
          showSuccess(`Compte de ${u.nomComplet || u.nomUtilisateur} supprimé`);
          fetchUtilisateurs();
        } catch (e: any) {
          showError(e.response?.data?.message || 'Erreur lors de la suppression');
        }
      }
    );
  };

  // ─────────────────────────────────────────────────────────
  // COORDINATIONS
  // ─────────────────────────────────────────────────────────
  const [coordinations,  setCoordinations]  = useState<Coordination[]>([]);
  const [coordLoading,   setCoordLoading]   = useState(false);
  const [showCoordModal, setShowCoordModal] = useState(false);
  const [editingCoord,   setEditingCoord]   = useState<Coordination | null>(null);
  const [coordForm,      setCoordForm]      = useState<Partial<Coordination>>({});
  const [coordSearch,    setCoordSearch]    = useState('');

  const fetchCoordinations = useCallback(async () => {
    setCoordLoading(true);
    try {
      const res = await CoordinationsService.getAll();
      setCoordinations(res.data.coordinations || []);
    } catch { showError('Impossible de charger les coordinations'); }
    finally { setCoordLoading(false); }
  }, []);

  // ─────────────────────────────────────────────────────────
  // AGENCES
  // ─────────────────────────────────────────────────────────
  const [agences,           setAgences]           = useState<Agence[]>([]);
  const [agenceLoading,     setAgenceLoading]     = useState(false);
  const [showAgenceModal,   setShowAgenceModal]   = useState(false);
  const [editingAgence,     setEditingAgence]     = useState<Agence | null>(null);
  const [agenceForm,        setAgenceForm]        = useState<Partial<Agence>>({});
  const [agenceSearch,      setAgenceSearch]      = useState('');
  const [agenceFilterCoord, setAgenceFilterCoord] = useState('all');

  const fetchAgences = useCallback(async () => {
    setAgenceLoading(true);
    try {
      const res = await AgencesService.getAll();
      setAgences(res.data.agences || []);
    } catch { showError('Impossible de charger les agences'); }
    finally { setAgenceLoading(false); }
  }, []);

  useEffect(() => { if (activeTab === 'agences') fetchAgences(); }, [activeTab, fetchAgences]);

  const handleCreateAgence = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await AgencesService.create({
        Nom:            agenceForm.nom || '',
        CoordinationId: agenceForm.coordination_id!,
        Responsable:    agenceForm.responsable,
        Telephone:      agenceForm.telephone,
        Email:          agenceForm.email,
        Adresse:        agenceForm.adresse,
        Description:    agenceForm.description,
      } as any);
      showSuccess('Agence créée avec succès');
      setShowAgenceModal(false);
      setAgenceForm({});
      fetchAgences();
    } catch (e: any) { showError(e.response?.data?.message || 'Erreur'); }
  };

  const handleUpdateAgence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgence) return;
    try {
      await AgencesService.update(editingAgence.id, {
        Nom:         agenceForm.nom,
        Responsable: agenceForm.responsable,
        Telephone:   agenceForm.telephone,
        Email:       agenceForm.email,
        Adresse:     agenceForm.adresse,
        Description: agenceForm.description,
        IsActive:    agenceForm.is_active,
      } as any);
      showSuccess('Agence modifiée avec succès');
      setShowAgenceModal(false);
      setEditingAgence(null);
      setAgenceForm({});
      fetchAgences();
    } catch (e: any) { showError(e.response?.data?.message || 'Erreur'); }
  };

  const handleDeleteAgence = (a: Agence) => {
    askConfirm(
      'Supprimer l\'agence',
      `Supprimer "${a.nom}" ? Impossible si des sites y sont rattachés.`,
      'danger',
      async () => {
        try {
          await AgencesService.delete(a.id);
          showSuccess('Agence supprimée');
          fetchAgences();
        } catch (e: any) { showError(e.response?.data?.message || 'Erreur'); }
      }
    );
  };

  const openEditAgence = (a: Agence) => {
    setEditingAgence(a);
    setAgenceForm({ ...a });
    setShowAgenceModal(true);
  };

  const filteredAgences = agences.filter(a => {
    const matchSearch = !agenceSearch || a.nom.toLowerCase().includes(agenceSearch.toLowerCase());
    const matchCoord  = agenceFilterCoord === 'all' || String(a.coordination_id) === agenceFilterCoord;
    return matchSearch && matchCoord;
  });

  useEffect(() => { if (activeTab === 'coordinations') fetchCoordinations(); }, [activeTab, fetchCoordinations]);

  const handleCreateCoord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await CoordinationsService.create(coordForm);
      showSuccess('Coordination créée avec succès');
      setShowCoordModal(false);
      setCoordForm({});
      fetchCoordinations();
      fetchSitesList();
    } catch (e: any) { showError(e.response?.data?.message || 'Erreur'); }
  };

  const handleUpdateCoord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoord) return;
    try {
      await CoordinationsService.update(editingCoord.id, coordForm);
      showSuccess('Coordination modifiée avec succès');
      setShowCoordModal(false);
      setEditingCoord(null);
      setCoordForm({});
      fetchCoordinations();
    } catch (e: any) { showError(e.response?.data?.message || 'Erreur'); }
  };

  const handleDeleteCoord = (c: Coordination) => {
    askConfirm(
      'Supprimer la coordination',
      `Supprimer "${c.nom}" ? Impossible si des sites y sont rattachés.`,
      'danger',
      async () => {
        try {
          await CoordinationsService.delete(c.id);
          showSuccess('Coordination supprimée');
          fetchCoordinations();
        } catch (e: any) { showError(e.response?.data?.message || 'Erreur'); }
      }
    );
  };

  const openEditCoord = (c: Coordination) => {
    setEditingCoord(c);
    setCoordForm({ ...c });
    setShowCoordModal(true);
  };

  const filteredCoords = coordinations.filter(c =>
    !coordSearch ||
    c.nom.toLowerCase().includes(coordSearch.toLowerCase()) ||
    (c.code || '').toLowerCase().includes(coordSearch.toLowerCase())
  );

  // ─────────────────────────────────────────────────────────
  // SITES
  // ─────────────────────────────────────────────────────────
  const [sites,           setSites]           = useState<Site[]>([]);
  const [siteLoading,     setSiteLoading]     = useState(false);
  const [showSiteModal,   setShowSiteModal]   = useState(false);
  const [editingSite,     setEditingSite]     = useState<Site | null>(null);
  const [siteForm,        setSiteForm]        = useState<any>({});
  const [siteSearch,      setSiteSearch]      = useState('');
  const [siteFilterCoord, setSiteFilterCoord] = useState('all');

  const fetchSites = useCallback(async () => {
    setSiteLoading(true);
    try {
      const res = await SitesService.getAll();
      setSites(res.data.sites || []);
    } catch { showError('Impossible de charger les sites'); }
    finally { setSiteLoading(false); }
  }, []);

  useEffect(() => {
    if (activeTab === 'sites') {
      fetchSites();
      if (coordinations.length === 0) fetchCoordinations();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, fetchSites, fetchCoordinations]);

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await SitesService.create({
        Nom:             siteForm.Nom || siteForm.nom,
        CoordinationId:  siteForm.CoordinationId || siteForm.coordination_id,
        adresse:         siteForm.adresse,
        telephone:       siteForm.telephone,
        email:           siteForm.email,
        responsable_nom: siteForm.responsable_nom,
        responsable_email: siteForm.responsable_email,
      });
      showSuccess('Site créé avec succès');
      setShowSiteModal(false);
      setSiteForm({});
      fetchSites();
      fetchSitesList();
    } catch (e: any) { showError(e.response?.data?.message || 'Erreur'); }
  };

  const handleUpdateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSite) return;
    try {
      await SitesService.update(editingSite.id, {
        Nom:              siteForm.Nom || siteForm.nom,
        adresse:          siteForm.adresse,
        Telephone:        siteForm.telephone,
        Email:            siteForm.email,
        ResponsableNom:   siteForm.responsable_nom,
        ResponsableEmail: siteForm.responsable_email,
      });
      showSuccess('Site modifié avec succès');
      setShowSiteModal(false);
      setEditingSite(null);
      setSiteForm({});
      fetchSites();
    } catch (e: any) { showError(e.response?.data?.message || 'Erreur'); }
  };

  const handleToggleSite = (s: Site) => {
    askConfirm(
      `${s.is_active ? 'Désactiver' : 'Activer'} le site`,
      `Voulez-vous ${s.is_active ? 'désactiver' : 'activer'} le site "${s.nom}" ?`,
      s.is_active ? 'danger' : 'success',
      async () => {
        try {
          await SitesService.toggle(s.id);
          showSuccess(`Site ${s.is_active ? 'désactivé' : 'activé'}`);
          fetchSites();
        } catch (e: any) { showError(e.response?.data?.message || 'Erreur'); }
      }
    );
  };

  const handleDeleteSite = (s: Site) => {
    askConfirm(
      'Supprimer le site',
      `Supprimer "${s.nom}" (${s.id}) ? Impossible si des cartes ou utilisateurs y sont liés.`,
      'danger',
      async () => {
        try {
          await SitesService.delete(s.id);
          showSuccess('Site supprimé');
          fetchSites();
          fetchSitesList();
        } catch (e: any) { showError(e.response?.data?.message || 'Erreur'); }
      }
    );
  };

  const openEditSite = (s: Site) => {
    setEditingSite(s);
    setSiteForm({ ...s, Nom: s.nom, CoordinationId: s.coordination_id });
    setShowSiteModal(true);
  };

  const filteredSites = sites.filter(s => {
    const matchSearch = !siteSearch ||
      s.nom.toLowerCase().includes(siteSearch.toLowerCase()) ||
      s.id.toLowerCase().includes(siteSearch.toLowerCase());
    const matchCoord = siteFilterCoord === 'all' || String(s.coordination_id) === siteFilterCoord;
    return matchSearch && matchCoord;
  });

  // ─────────────────────────────────────────────────────────
  // RENDER — garde-fou accès
  // ─────────────────────────────────────────────────────────
  if (!peutGerer) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-10 text-center max-w-sm">
        <XCircleIcon className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h2 className="font-bold text-gray-800 mb-1">Accès non autorisé</h2>
        <p className="text-gray-500 text-sm">Cette page est réservée aux administrateurs.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">

        {/* En-tête */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Administration</h1>
            <p className="text-sm text-gray-500 mt-0.5">Gestion des comptes, coordinations et sites</p>
          </div>
        </motion.div>

        {/* Alertes */}
        <AnimatePresence>
          {error   && <AlertBanner type="error"   message={error}   onClose={() => setError('')}   />}
          {success && <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />}
        </AnimatePresence>

        {/* Onglets */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-1.5 flex gap-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            if (!isAdmin && tab.id !== 'utilisateurs') return null;
            const count = tab.id === 'utilisateurs' ? statsU.total
              : tab.id === 'coordinations' ? coordinations.length
              : tab.id === 'agences' ? agences.length
              : sites.length;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? 'bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}>
                <Icon className="w-4 h-4" />
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${active ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ═══════════════ TAB UTILISATEURS ═══════════════ */}
        {activeTab === 'utilisateurs' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {[
                { label: 'Total',           value: statsU.total,           color: 'bg-gradient-to-br from-[#F77F00] to-[#FF9E40]',   icon: <UsersIcon       className="w-5 h-5 text-white" /> },
                { label: 'Actifs',          value: statsU.actifs,          color: 'bg-gradient-to-br from-green-500 to-emerald-500', icon: <CheckCircleIcon className="w-5 h-5 text-white" /> },
                { label: 'Inactifs',        value: statsU.inactifs,        color: 'bg-gradient-to-br from-red-400 to-rose-500',      icon: <XCircleIcon     className="w-5 h-5 text-white" /> },
                { label: 'Administrateurs', value: statsU.administrateurs, color: 'bg-gradient-to-br from-purple-500 to-violet-600', icon: <ShieldCheckIcon className="w-5 h-5 text-white" /> },
                { label: 'Gestionnaires',   value: statsU.gestionnaires,   color: 'bg-gradient-to-br from-blue-500 to-sky-600',      icon: <UsersIcon       className="w-5 h-5 text-white" /> },
                { label: "Chefs d'équipe",  value: statsU.chefs,           color: 'bg-gradient-to-br from-amber-400 to-orange-500',  icon: <UserIcon        className="w-5 h-5 text-white" /> },
                { label: 'Opérateurs',      value: statsU.operateurs,      color: 'bg-gradient-to-br from-teal-500 to-cyan-600',     icon: <UserIcon        className="w-5 h-5 text-white" /> },
              ].map((s, i) => <StatCard key={i} {...s} />)}
            </div>

            {/* Filtres + actions */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-3">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    placeholder="Rechercher par nom, email, coordination…"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F77F00]/30 focus:border-[#F77F00]" />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <FunnelIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <select value={filterRole} onChange={e => { setFilterRole(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F77F00]/30">
                    <option value="all">Tous les rôles</option>
                    {ROLES_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F77F00]/30">
                    <option value="all">Tous les statuts</option>
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                  </select>
                  {(searchTerm || filterRole !== 'all' || filterStatus !== 'all') && (
                    <button onClick={() => { setSearchTerm(''); setFilterRole('all'); setFilterStatus('all'); setCurrentPage(1); }}
                      className="flex items-center gap-1 px-3 py-2.5 text-xs text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                      <XMarkIcon className="w-3.5 h-3.5" /> Réinitialiser
                    </button>
                  )}
                  <button onClick={fetchUtilisateurs} disabled={loading}
                    className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50">
                    <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                  <button onClick={() => { setUserForm(emptyUserForm); setSelectedSiteIds([]); setShowCreateModal(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white text-sm font-semibold rounded-xl shadow hover:shadow-md transition-all">
                    <UserPlusIcon className="w-4 h-4" /> Nouvel utilisateur
                  </button>
                </div>
              </div>
              {(searchTerm || filterRole !== 'all' || filterStatus !== 'all') && (
                <p className="text-xs text-gray-500 ml-1">{filtered.length} résultat(s) sur {utilisateurs.length}</p>
              )}
            </div>

            {/* Tableau utilisateurs */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <ArrowPathIcon className="w-8 h-8 text-[#F77F00] animate-spin" />
                  <p className="text-gray-500 text-sm">Chargement des utilisateurs…</p>
                </div>
              ) : currentUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <UsersIcon className="w-12 h-12 text-gray-200" />
                  <p className="text-gray-500 font-medium">Aucun utilisateur trouvé</p>
                  <p className="text-gray-400 text-sm">Modifiez vos filtres ou créez un nouvel utilisateur</p>
                </div>
              ) : (
                <>
                  {/* Desktop */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white">
                          {['Utilisateur', 'Rôle', 'Coordination', 'Sites', 'Statut', 'Création', 'Actions'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {currentUsers.map((u, i) => (
                          <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                            className="hover:bg-orange-50/30 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F77F00] to-[#FF9E40] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                  {(u.nomComplet || u.nomUtilisateur).charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  {u.nomComplet && <div className="font-semibold text-gray-800">{u.nomComplet}</div>}
                                  <div className={`text-gray-500 ${u.nomComplet ? 'text-xs' : 'font-medium text-gray-800'}`}>@{u.nomUtilisateur}</div>
                                  {u.email && <div className="text-xs text-gray-400">{u.email}</div>}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <BuildingOfficeIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                <span className="text-xs">{u.coordination || '—'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {(u.sites || []).length > 0
                                  ? (u.sites || []).slice(0, 2).map(s => (
                                    <span key={s.id} className={`text-xs px-1.5 py-0.5 rounded font-mono ${s.est_site_principal ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                                      {s.id}
                                    </span>
                                  ))
                                  : <span className="text-xs text-gray-400">—</span>
                                }
                                {(u.sites || []).length > 2 && (
                                  <span className="text-xs text-gray-400">+{(u.sites || []).length - 2}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${u.actif ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${u.actif ? 'bg-green-500' : 'bg-red-500'}`} />
                                {u.actif ? 'Actif' : 'Inactif'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5 text-gray-500">
                                <CalendarIcon className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="text-xs">{fmt(u.dateCreation)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <button onClick={() => openEditUser(u)}
                                  className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Modifier">
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleToggleStatus(u)}
                                  className={`p-1.5 rounded-lg transition-all ${u.actif ? 'text-amber-500 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}
                                  title={u.actif ? 'Désactiver' : 'Réactiver'}>
                                  {u.actif ? <XCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
                                </button>
                                <button onClick={() => handleDeleteUser(u)}
                                  className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-all" title="Supprimer">
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile */}
                  <div className="md:hidden divide-y divide-gray-100">
                    {currentUsers.map((u, i) => (
                      <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                        className="p-4 hover:bg-orange-50/20 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F77F00] to-[#FF9E40] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                              {(u.nomComplet || u.nomUtilisateur).charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              {u.nomComplet && <div className="font-semibold text-gray-800 text-sm truncate">{u.nomComplet}</div>}
                              <div className="text-xs text-gray-500">@{u.nomUtilisateur}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={() => openEditUser(u)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg">
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleToggleStatus(u)}
                              className={`p-1.5 rounded-lg ${u.actif ? 'text-amber-500 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}>
                              {u.actif ? <XCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
                            </button>
                            <button onClick={() => handleDeleteUser(u)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg">
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <RoleBadge role={u.role} />
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${u.actif ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${u.actif ? 'bg-green-500' : 'bg-red-500'}`} />
                            {u.actif ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                        {(u.coordination || u.agence) && (
                          <div className="mt-1.5 text-xs text-gray-400">
                            {u.coordination}{u.coordination && u.agence ? ' · ' : ''}{u.agence}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-3">
                      <span className="text-xs text-gray-500">
                        {(currentPage - 1) * PER_PAGE + 1}–{Math.min(currentPage * PER_PAGE, filtered.length)} sur {filtered.length}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                          className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-all">Précédent</button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const page = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                          return (
                            <button key={page} onClick={() => setCurrentPage(page)}
                              className={`w-8 h-8 text-xs rounded-lg font-medium transition-all ${page === currentPage ? 'bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white shadow-sm' : 'border border-gray-200 hover:bg-gray-50 text-gray-600'}`}>
                              {page}
                            </button>
                          );
                        })}
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                          className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-all">Suivant</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* ═══════════════ TAB COORDINATIONS ═══════════════ */}
        {activeTab === 'coordinations' && isAdmin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={coordSearch} onChange={e => setCoordSearch(e.target.value)}
                  placeholder="Rechercher une coordination…"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F77F00]/30 focus:border-[#F77F00]" />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={fetchCoordinations} disabled={coordLoading}
                  className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50">
                  <ArrowPathIcon className={`w-4 h-4 ${coordLoading ? 'animate-spin' : ''}`} />
                </button>
                <button onClick={() => { setEditingCoord(null); setCoordForm({ is_active: true }); setShowCoordModal(true); }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white text-sm font-semibold rounded-xl shadow hover:shadow-md transition-all">
                  <PlusIcon className="w-4 h-4" /> Nouvelle coordination
                </button>
              </div>
            </div>

            {coordLoading ? (
              <div className="flex justify-center py-16"><ArrowPathIcon className="w-8 h-8 text-[#F77F00] animate-spin" /></div>
            ) : filteredCoords.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
                <BuildingOfficeIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Aucune coordination trouvée</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredCoords.map((c, i) => (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F77F00] to-[#FF9E40] flex items-center justify-center flex-shrink-0">
                          <BuildingOfficeIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-sm leading-tight">{c.nom}</h3>
                          {c.code && <span className="text-xs font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{c.code}</span>}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${c.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {c.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs text-gray-500 mb-4">
                      {c.responsable      && <div className="flex items-center gap-1.5"><UserIcon    className="w-3.5 h-3.5" />{c.responsable}</div>}
                      {c.telephone        && <div className="flex items-center gap-1.5"><KeyIcon     className="w-3.5 h-3.5" />{c.telephone}</div>}
                      {c.ville_principale && <div className="flex items-center gap-1.5"><MapPinIcon  className="w-3.5 h-3.5" />{c.ville_principale}{c.region ? `, ${c.region}` : ''}</div>}
                      {c.description      && <div className="text-gray-400 italic line-clamp-2">{c.description}</div>}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex gap-3 text-xs text-gray-400">
                        {c.nombre_sites  !== undefined && <span><span className="font-semibold text-gray-600">{c.nombre_sites}</span> site(s)</span>}
                        {c.nombre_agents !== undefined && <span><span className="font-semibold text-gray-600">{c.nombre_agents}</span> agent(s)</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditCoord(c)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Modifier">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteCoord(c)}
                          className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-all" title="Supprimer">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ═══════════════ TAB AGENCES ═══════════════ */}
        {activeTab === 'agences' && isAdmin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 flex-wrap">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={agenceSearch} onChange={e => setAgenceSearch(e.target.value)}
                    placeholder="Rechercher une agence…"
                    className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F77F00]/30 focus:border-[#F77F00] w-56" />
                </div>
                <select value={agenceFilterCoord} onChange={e => setAgenceFilterCoord(e.target.value)}
                  className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F77F00]/30">
                  <option value="all">Toutes les coordinations</option>
                  {coordinations.map(c => <option key={c.id} value={String(c.id)}>{c.nom}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={fetchAgences} disabled={agenceLoading}
                  className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50">
                  <ArrowPathIcon className={`w-4 h-4 ${agenceLoading ? 'animate-spin' : ''}`} />
                </button>
                <button onClick={() => { setEditingAgence(null); setAgenceForm({ is_active: true }); setShowAgenceModal(true); }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white text-sm font-semibold rounded-xl shadow hover:shadow-md transition-all">
                  <PlusIcon className="w-4 h-4" /> Nouvelle agence
                </button>
              </div>
            </div>

            {agenceLoading ? (
              <div className="flex justify-center py-16"><ArrowPathIcon className="w-8 h-8 text-[#F77F00] animate-spin" /></div>
            ) : filteredAgences.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
                <BuildingStorefrontIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Aucune agence trouvée</p>
                <p className="text-gray-400 text-sm mt-1">Créez d'abord des coordinations, puis des agences</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredAgences.map((a, i) => (
                  <motion.div key={a.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F77F00] to-[#FF9E40] flex items-center justify-center flex-shrink-0">
                          <BuildingStorefrontIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-sm">{a.nom}</h3>
                          <p className="text-xs text-gray-400">{a.coordination_nom}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${a.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {a.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs text-gray-500 mb-4">
                      {a.responsable && <div className="flex items-center gap-1.5"><UserIcon   className="w-3.5 h-3.5" />{a.responsable}</div>}
                      {a.telephone   && <div className="flex items-center gap-1.5"><KeyIcon    className="w-3.5 h-3.5" />{a.telephone}</div>}
                      {a.adresse     && <div className="flex items-center gap-1.5"><MapPinIcon className="w-3.5 h-3.5" />{a.adresse}</div>}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex gap-3 text-xs text-gray-400">
                        <span><span className="font-semibold text-gray-600">{a.nombre_sites  ?? 0}</span> site(s)</span>
                        <span><span className="font-semibold text-gray-600">{a.nombre_agents ?? 0}</span> agent(s)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditAgence(a)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteAgence(a)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-all">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ═══════════════ TAB SITES ═══════════════ */}
        {activeTab === 'sites' && isAdmin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 flex-wrap">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={siteSearch} onChange={e => setSiteSearch(e.target.value)}
                    placeholder="Rechercher un site…"
                    className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F77F00]/30 focus:border-[#F77F00] w-56" />
                </div>
                <select value={siteFilterCoord} onChange={e => setSiteFilterCoord(e.target.value)}
                  className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F77F00]/30">
                  <option value="all">Toutes les coordinations</option>
                  {coordinations.map(c => <option key={c.id} value={String(c.id)}>{c.nom}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={fetchSites} disabled={siteLoading}
                  className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50">
                  <ArrowPathIcon className={`w-4 h-4 ${siteLoading ? 'animate-spin' : ''}`} />
                </button>
                <button onClick={() => { setEditingSite(null); setSiteForm({}); setShowSiteModal(true); }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white text-sm font-semibold rounded-xl shadow hover:shadow-md transition-all">
                  <PlusIcon className="w-4 h-4" /> Nouveau site
                </button>
              </div>
            </div>

            {siteLoading ? (
              <div className="flex justify-center py-16"><ArrowPathIcon className="w-8 h-8 text-[#F77F00] animate-spin" /></div>
            ) : filteredSites.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
                <BuildingStorefrontIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Aucun site trouvé</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white">
                        {['ID', 'Nom', 'Coordination', 'Responsable', 'Cartes', 'Statut', 'Actions'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredSites.map((s, i) => (
                        <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                          className="hover:bg-orange-50/30 transition-colors">
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{s.id}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-800">{s.nom}</div>
                            {s.adresse && <div className="text-xs text-gray-400 truncate max-w-[180px]">{s.adresse}</div>}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <BuildingOfficeIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              <span className="text-xs text-gray-600">{s.coordination_nom || '—'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">{s.responsable_nom || '—'}</td>
                          <td className="px-4 py-3">
                            <div className="text-xs">
                              <span className="font-semibold text-gray-700">{s.total_cards ?? 0}</span>
                              {(s.pending_cards ?? 0) > 0 && (
                                <span className="ml-1.5 text-amber-600">({s.pending_cards} en attente)</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${s.is_active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${s.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                              {s.is_active ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button onClick={() => openEditSite(s)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Modifier">
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleToggleSite(s)}
                                className={`p-1.5 rounded-lg transition-all ${s.is_active ? 'text-amber-500 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}
                                title={s.is_active ? 'Désactiver' : 'Activer'}>
                                {s.is_active ? <XCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
                              </button>
                              <button onClick={() => handleDeleteSite(s)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-all" title="Supprimer">
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400">
                  {filteredSites.length} site(s) affiché(s)
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* ── Modals Utilisateurs ── */}
      <AnimatePresence>
        {showCreateModal && (
          <Modal onClose={() => setShowCreateModal(false)} title="Nouvel utilisateur" icon={<UserPlusIcon className="w-4 h-4 text-white" />}>
            <UserForm formData={userForm} setFormData={setUserForm}
              onSubmit={handleCreateUser} onCancel={() => setShowCreateModal(false)}
              submitLabel="Créer l'utilisateur"
              sites={sitesList} selectedSiteIds={selectedSiteIds} setSelectedSiteIds={setSelectedSiteIds}
              coordinations={coordinations} agences={agences} />
          </Modal>
        )}
        {showEditModal && editingUser && (
          <Modal onClose={() => setShowEditModal(false)}
            title={`Modifier — ${editingUser.nomComplet || editingUser.nomUtilisateur}`}
            icon={<PencilIcon className="w-4 h-4 text-white" />}>
            <UserForm formData={userForm} setFormData={setUserForm}
              onSubmit={handleUpdateUser} onCancel={() => setShowEditModal(false)}
              isEdit submitLabel="Enregistrer les modifications"
              sites={sitesList} selectedSiteIds={selectedSiteIds} setSelectedSiteIds={setSelectedSiteIds}
              coordinations={coordinations} agences={agences} />
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Modals Coordinations ── */}
      <AnimatePresence>
        {showCoordModal && (
          <Modal onClose={() => setShowCoordModal(false)}
            title={editingCoord ? `Modifier — ${editingCoord.nom}` : 'Nouvelle coordination'}
            icon={<BuildingOfficeIcon className="w-4 h-4 text-white" />}>
            <CoordinationForm data={coordForm} setData={setCoordForm}
              onSubmit={editingCoord ? handleUpdateCoord : handleCreateCoord}
              onCancel={() => { setShowCoordModal(false); setEditingCoord(null); setCoordForm({}); }}
              submitLabel={editingCoord ? 'Enregistrer' : 'Créer la coordination'} />
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Modals Agences ── */}
      <AnimatePresence>
        {showAgenceModal && (
          <Modal onClose={() => setShowAgenceModal(false)}
            title={editingAgence ? `Modifier — ${editingAgence.nom}` : 'Nouvelle agence'}
            icon={<BuildingStorefrontIcon className="w-4 h-4 text-white" />}>
            <AgenceForm data={agenceForm} setData={setAgenceForm} coordinations={coordinations}
              onSubmit={editingAgence ? handleUpdateAgence : handleCreateAgence}
              onCancel={() => { setShowAgenceModal(false); setEditingAgence(null); setAgenceForm({}); }}
              isEdit={!!editingAgence}
              submitLabel={editingAgence ? 'Enregistrer' : 'Créer l\'agence'} />
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Modals Sites ── */}
      <AnimatePresence>
        {showSiteModal && (
          <Modal onClose={() => setShowSiteModal(false)}
            title={editingSite ? `Modifier — ${editingSite.nom}` : 'Nouveau site'}
            icon={<MapPinIcon className="w-4 h-4 text-white" />}>
            <SiteForm data={siteForm} setData={setSiteForm} coordinations={coordinations} agences={agences}
              onSubmit={editingSite ? handleUpdateSite : handleCreateSite}
              onCancel={() => { setShowSiteModal(false); setEditingSite(null); setSiteForm({}); }}
              isEdit={!!editingSite}
              submitLabel={editingSite ? 'Enregistrer' : 'Créer le site'} />
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Modal Confirmation ── */}
      <AnimatePresence>
        {confirmModal.show && (
          <ConfirmModal
            title={confirmModal.title}
            message={confirmModal.message}
            type={confirmModal.type}
            onConfirm={async () => { await confirmModal.action(); setConfirmModal(m => ({ ...m, show: false })); }}
            onCancel={() => setConfirmModal(m => ({ ...m, show: false }))} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Comptes;