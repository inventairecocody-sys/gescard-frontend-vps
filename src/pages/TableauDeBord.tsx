// src/pages/TableauDeBord.tsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from "recharts";
import {
  ArrowPathIcon, WifiIcon, SignalSlashIcon,
  ChartBarIcon, BuildingOfficeIcon, TrophyIcon,
  CheckCircleIcon, ClockIcon, ArrowTrendingUpIcon,
  ExclamationTriangleIcon, FunnelIcon, XMarkIcon,
  GlobeAltIcon, MapPinIcon, ChevronDownIcon,
  ChevronRightIcon, BuildingStorefrontIcon,
  ArrowDownTrayIcon, CalendarDaysIcon,
  ArrowTrendingDownIcon, MinusIcon,
} from "@heroicons/react/24/outline";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import { StatistiquesService } from "../Services/api/statistiques";
import type { AgenceStats, PointTemporel, Granularite } from "../Services/api/statistiques";
import BoutonRapport from "../components/BoutonRapport"; // ✅ Import du composant BoutonRapport

// ─── Types ────────────────────────────────────────────────────
interface GlobalStats {
  total: number; retires: number; restants: number; tauxRetrait: number;
  metadata?: { sites_actifs: number; premiere_importation: string; derniere_importation: string };
}
interface SiteStats {
  site: string; coordination: string;
  total: number; retires: number; restants: number; tauxRetrait: number;
}
interface CoordStats {
  coordination: string;
  coordination_id?: number;
  total: number; retires: number; restants: number; tauxRetrait: number;
  sites: SiteStats[];
}

// ─── Palette ──────────────────────────────────────────────────
const C = {
  orange:  "#F77F00", orange2: "#FF9E40",
  green:   "#16a34a", green2:  "#22c55e",
  blue:    "#0077B6", blue2:   "#38bdf8",
  violet:  "#7c3aed", gray:    "#6b7280",
  teal:    "#0d9488", teal2:   "#2dd4bf",
};
const BAR_PALETTE   = [C.orange, C.orange2, "#fb923c", "#fdba74", "#fcd34d", "#fbbf24", "#f59e0b", "#d97706"];
const COORD_PALETTE = ["#F77F00","#0077B6","#16a34a","#7c3aed","#0d9488","#dc2626","#f59e0b","#6366f1"];

// ─── Utilitaires ──────────────────────────────────────────────
const fmt     = (n: number) => n.toLocaleString("fr-FR");
const pct     = (a: number, t: number) => t > 0 ? Math.round((a / t) * 100) : 0;
const color   = (t: number) => t >= 75 ? "text-green-600" : t >= 50 ? "text-orange-500" : "text-red-500";
const bgColor = (t: number) => t >= 75 ? "bg-green-50 border-green-200 text-green-700"
                              : t >= 50 ? "bg-orange-50 border-orange-200 text-orange-700"
                                        : "bg-red-50 border-red-200 text-red-700";
const badge   = (t: number) => t >= 75 ? '🏆 Excellent' : t >= 50 ? '📈 En progression' : '⚠️ À améliorer';

const fmtPeriode = (p: string, g: Granularite): string => {
  if (!p) return "";
  const d = new Date(p);
  if (g === "jour")    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  if (g === "semaine") {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const ys = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const wn = Math.ceil((((date as any) - (ys as any)) / 86400000 + 1) / 7);
    return `S${wn} ${d.getFullYear()}`;
  }
  return d.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
};

const exportCSV = (data: Record<string, any>[], fileName: string) => {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows    = [headers.join(";"), ...data.map(r => headers.map(h => String(r[h] ?? "").replace(/;/g, ",")).join(";"))];
  const blob    = new Blob(["\uFEFF" + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url     = URL.createObjectURL(blob);
  const a       = document.createElement("a");
  a.href = url; a.download = `${fileName}_${new Date().toISOString().slice(0,10)}.csv`; a.click();
  URL.revokeObjectURL(url);
};

// ─── Sous-composants de base ──────────────────────────────────

const KpiCard: React.FC<{
  label: string; value: number | string; sub?: string;
  gradient: string; icon: React.ReactNode; delay?: number;
  tendance?: { direction: string; pourcentage: number | null };
  onClick?: () => void;
}> = ({ label, value, sub, gradient, icon, delay = 0, tendance, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    onClick={onClick}
    className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${gradient} shadow-lg
      ${onClick ? 'cursor-pointer hover:scale-[1.02] transition-transform' : ''}`}
  >
    <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
    <div className="absolute -bottom-6 -right-2 w-16 h-16 rounded-full bg-white/10" />
    <div className="relative z-10">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">{icon}</div>
        {tendance && tendance.pourcentage !== null && (
          <div className="flex items-center gap-1 bg-white/20 rounded-lg px-2 py-1">
            {tendance.direction === "hausse"
              ? <ArrowTrendingUpIcon className="w-3 h-3 text-white" />
              : tendance.direction === "baisse"
              ? <ArrowTrendingDownIcon className="w-3 h-3 text-white" />
              : <MinusIcon className="w-3 h-3 text-white" />}
            <span className="text-white text-[10px] font-bold">
              {tendance.direction !== "stable" ? `${Math.abs(tendance.pourcentage)}%` : "="}
            </span>
          </div>
        )}
      </div>
      <div className="text-3xl font-black text-white tracking-tight mb-1">
        {typeof value === "number" ? fmt(value) : value}
      </div>
      <div className="text-white/90 font-semibold text-sm">{label}</div>
      {sub && <div className="text-white/70 text-xs mt-0.5">{sub}</div>}
    </div>
  </motion.div>
);

const SectionHeader: React.FC<{
  icon: React.ReactNode; title: string; sub?: string; action?: React.ReactNode;
}> = ({ icon, title, sub, action }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 bg-gradient-to-br from-[#F77F00] to-[#FF9E40] rounded-xl flex items-center justify-center shadow-sm">
        {icon}
      </div>
      <div>
        <h2 className="font-bold text-gray-800 text-base">{title}</h2>
        {sub && <p className="text-xs text-gray-500">{sub}</p>}
      </div>
    </div>
    {action}
  </div>
);

const ProgressBar: React.FC<{ value: number; delay?: number; color?: string }> = ({ value, delay = 0, color: col }) => (
  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
    <motion.div
      initial={{ width: 0 }} animate={{ width: `${Math.min(value, 100)}%` }}
      transition={{ duration: 0.9, delay, ease: "easeOut" }}
      className="h-2 rounded-full"
      style={{ background: col || `linear-gradient(to right, ${C.orange}, ${C.orange2})` }}
    />
  </div>
);

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-orange-100 rounded-xl shadow-xl p-3 text-xs min-w-[140px]">
      <p className="font-bold text-gray-700 mb-1.5 truncate max-w-[200px]">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="flex items-center justify-between gap-3 font-semibold" style={{ color: p.color }}>
          <span>{p.name}</span><span>{fmt(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

// ─── Sélecteur granularité ─────────────────────────────────────
const GranulariteSelector: React.FC<{
  value: Granularite; onChange: (g: Granularite) => void;
}> = ({ value, onChange }) => (
  <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
    {(["jour", "semaine", "mois"] as Granularite[]).map(g => (
      <button key={g} onClick={() => onChange(g)}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize
          ${value === g ? "bg-white text-[#F77F00] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
        {g}
      </button>
    ))}
  </div>
);

// ─── Hook temporel ─────────────────────────────────────────────
const useTemporel = (
  granularite: Granularite,
  niveau: string,
  id?: string | number,
  periodes: number = 12,
) => {
  const [evolution,  setEvolution]  = useState<PointTemporel[]>([]);
  const [tendance,   setTendance]   = useState<any>(null);
  const [loadingTmp, setLoadingTmp] = useState(false);

  const fetchTemporel = useCallback(async () => {
    if (!niveau) return;
    setLoadingTmp(true);
    try {
      const res = await StatistiquesService.getEvolutionTemporelle(granularite, niveau as any, id, periodes);
      setEvolution(res.evolution || []);
      setTendance(res.tendance   || null);
    } catch { setEvolution([]); setTendance(null); }
    finally  { setLoadingTmp(false); }
  }, [granularite, niveau, id, periodes]);

  useEffect(() => { fetchTemporel(); }, [fetchTemporel]);
  return { evolution, tendance, loadingTmp };
};

// ─── Graphique temporel ────────────────────────────────────────
const GraphiqueTemporel: React.FC<{
  data:        PointTemporel[];
  granularite: Granularite;
  loading?:    boolean;
  showCumul?:  boolean;
}> = ({ data, granularite, loading, showCumul = false }) => {
  const formatted = useMemo(() =>
    data.map(p => ({ ...p, label: fmtPeriode(p.periode, granularite) })),
    [data, granularite]);

  if (loading) return (
    <div className="h-52 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#F77F00] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!data.length) return (
    <div className="h-52 flex items-center justify-center text-gray-400 text-sm">
      Aucune donnée disponible pour cette période
    </div>
  );
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={formatted} margin={{ top: 5, right: 10, left: 0, bottom: 35 }}>
        <defs>
          <linearGradient id="gRetraits" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={C.orange} stopOpacity={0.3} />
            <stop offset="95%" stopColor={C.orange} stopOpacity={0.02} />
          </linearGradient>
          {showCumul && (
            <linearGradient id="gCumul" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={C.blue} stopOpacity={0.25} />
              <stop offset="95%" stopColor={C.blue} stopOpacity={0.02} />
            </linearGradient>
          )}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: C.gray }} angle={-35} textAnchor="end" interval={0} height={50} />
        <YAxis tick={{ fontSize: 10, fill: C.gray }} tickFormatter={v => fmt(v)} />
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" iconSize={9} formatter={v => <span className="text-xs text-gray-500 font-medium">{v}</span>} />
        <Area type="monotone" dataKey="nb_retraits" name="Retraits" stroke={C.orange} fill="url(#gRetraits)" strokeWidth={2} dot={{ r: 3, fill: C.orange }} />
        {showCumul && <Area type="monotone" dataKey="cumul_retraits" name="Cumul" stroke={C.blue} fill="url(#gCumul)" strokeWidth={2} dot={false} />}
      </AreaChart>
    </ResponsiveContainer>
  );
};

// ─── Classement podium ─────────────────────────────────────────
const Classement: React.FC<{
  items: Array<{ nom: string; taux: number; total: number; retires: number }>;
  couleurBar?: string;
}> = ({ items, couleurBar }) => (
  <div className="space-y-2">
    {items.slice(0, 8).map((item, i) => (
      <div key={item.nom} className="flex items-center gap-3">
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0
          ${i === 0 ? "bg-yellow-100 text-yellow-700" : i === 1 ? "bg-gray-100 text-gray-600" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-gray-50 text-gray-400"}`}>
          {i + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-700 truncate max-w-[160px]" title={item.nom}>{item.nom}</span>
            <span className={`text-xs font-bold ml-2 flex-shrink-0 ${color(item.taux)}`}>{item.taux}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <motion.div initial={{ width: 0 }} animate={{ width: `${item.taux}%` }} transition={{ duration: 0.8, delay: i * 0.05 }}
              className="h-1.5 rounded-full" style={{ background: couleurBar || `linear-gradient(to right,${C.orange},${C.orange2})` }} />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
            <span>{fmt(item.retires)} retirées</span><span>{fmt(item.total)} total</span>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// ─── Filtre ───────────────────────────────────────────────────
interface FiltreState {
  coordination:    string;
  coordination_id: number | null;
  agence:          string;
  agence_id:       number | null;
  site:            string;
  seuilMin:        number;
  seuilMax:        number;
}

const FiltrePanel: React.FC<{
  filtres:        FiltreState;
  setFiltres:     (f: FiltreState) => void;
  coordinations:  Array<{ id: number; nom: string }>;
  agences:        AgenceStats[];
  sites:          string[];
  isAdmin:        boolean;
  isGestionnaire: boolean;
}> = ({ filtres, setFiltres, coordinations, agences, sites, isAdmin, isGestionnaire }) => {
  const [open, setOpen] = useState(false);
  const hasFiltre   = !!(filtres.coordination || filtres.agence || filtres.site || filtres.seuilMin > 0 || filtres.seuilMax < 100);
  const countFiltre = [filtres.coordination, filtres.agence, filtres.site, filtres.seuilMin > 0, filtres.seuilMax < 100].filter(Boolean).length;
  const reset = () => setFiltres({ coordination: '', coordination_id: null, agence: '', agence_id: null, site: '', seuilMin: 0, seuilMax: 100 });

  const agencesFiltrees = useMemo(() =>
    filtres.coordination ? agences.filter(a => a.coordination_nom === filtres.coordination) : agences,
    [agences, filtres.coordination]);

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {hasFiltre && (
          <button onClick={reset} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 rounded-lg px-2.5 py-1.5 transition-all">
            <XMarkIcon className="w-3 h-3" />Effacer
          </button>
        )}
        <button onClick={() => setOpen(o => !o)}
          className={`flex items-center gap-2 text-sm font-semibold rounded-xl px-4 py-2 border transition-all
            ${open || hasFiltre ? 'bg-orange-50 text-[#F77F00] border-orange-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
          <FunnelIcon className="w-4 h-4" />Filtres
          {countFiltre > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#F77F00] text-white text-[10px] font-bold flex items-center justify-center">{countFiltre}</span>
          )}
          <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 z-30 bg-white rounded-2xl border border-gray-200 shadow-2xl p-5 min-w-[320px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Filtres d'analyse</h3>
              <button onClick={() => setOpen(false)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {isAdmin && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Coordination</label>
                  <select value={filtres.coordination}
                    onChange={e => {
                      const found = coordinations.find(c => c.nom === e.target.value);
                      setFiltres({ ...filtres, coordination: e.target.value, coordination_id: found?.id ?? null, agence: '', agence_id: null, site: '' });
                    }}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F77F00]/30 focus:border-[#F77F00]">
                    <option value="">Toutes les coordinations</option>
                    {coordinations.map(c => <option key={c.id} value={c.nom}>{c.nom}</option>)}
                  </select>
                </div>
              )}
              {(isAdmin || isGestionnaire) && agencesFiltrees.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Agence</label>
                  <select value={filtres.agence}
                    onChange={e => {
                      const found = agencesFiltrees.find(a => a.agence_nom === e.target.value);
                      setFiltres({ ...filtres, agence: e.target.value, agence_id: found?.agence_id ?? null, site: '' });
                    }}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F77F00]/30 focus:border-[#F77F00]">
                    <option value="">Toutes les agences</option>
                    {agencesFiltrees.map(a => <option key={a.agence_id} value={a.agence_nom}>{a.agence_nom}</option>)}
                  </select>
                </div>
              )}
              {(isAdmin || isGestionnaire) && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Site</label>
                  <select value={filtres.site}
                    onChange={e => setFiltres({ ...filtres, site: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F77F00]/30 focus:border-[#F77F00]">
                    <option value="">Tous les sites</option>
                    {sites.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Taux de retrait : {filtres.seuilMin}% — {filtres.seuilMax}%
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-[10px] text-gray-400 mb-1 block">Min</label>
                    <input type="range" min={0} max={filtres.seuilMax} value={filtres.seuilMin}
                      onChange={e => setFiltres({ ...filtres, seuilMin: Number(e.target.value) })}
                      className="w-full accent-[#F77F00]" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-gray-400 mb-1 block">Max</label>
                    <input type="range" min={filtres.seuilMin} max={100} value={filtres.seuilMax}
                      onChange={e => setFiltres({ ...filtres, seuilMax: Number(e.target.value) })}
                      className="w-full accent-[#F77F00]" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={reset} className="flex-1 py-2 border border-gray-200 text-gray-500 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors">Réinitialiser</button>
                <button onClick={() => setOpen(false)} className="flex-1 py-2 bg-[#F77F00] hover:bg-[#e46f00] text-white rounded-xl text-xs font-bold transition-colors">Appliquer</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Tableau sites ─────────────────────────────────────────────
const TableauSites: React.FC<{
  sites:     SiteStats[];
  title?:    string;
  onExport?: () => void;
}> = ({ sites, title, onExport }) => (
  <div>
    {onExport && (
      <div className="flex justify-end mb-2">
        <button onClick={onExport}
          className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 transition-colors font-medium">
          <ArrowDownTrayIcon className="w-3.5 h-3.5" />Exporter CSV
        </button>
      </div>
    )}
    <div className="overflow-auto rounded-xl border border-gray-100" style={{ maxHeight: 360 }}>
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white sticky top-0 z-10">
            {(title ? ["#","Site","Coord.","Total","Retirées","Restantes","Taux"] : ["#","Site","Total","Retirées","Restantes","Taux"])
              .map(h => <th key={h} className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {sites.length === 0
            ? <tr><td colSpan={7} className="text-center py-8 text-gray-400">Aucun site</td></tr>
            : sites.map((s, i) => {
                const t = s.tauxRetrait;
                return (
                  <motion.tr key={`${s.site}-${i}`}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.02 }}
                    className={`border-b border-gray-50 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"} hover:bg-orange-50/40`}>
                    <td className="px-3 py-2.5 text-gray-400 font-medium w-8">{i + 1}</td>
                    <td className="px-3 py-2.5 font-semibold text-gray-700 max-w-[130px] truncate" title={s.site}>{s.site}</td>
                    {title && <td className="px-3 py-2.5 text-gray-500 max-w-[100px] truncate">{s.coordination || '—'}</td>}
                    <td className="px-3 py-2.5 font-bold text-gray-800">{fmt(s.total)}</td>
                    <td className="px-3 py-2.5"><span className="text-green-700 font-bold">{fmt(s.retires)}</span></td>
                    <td className="px-3 py-2.5"><span className="text-blue-700 font-bold">{fmt(s.restants)}</span></td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-gray-100 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full" style={{ width: `${t}%`, background: `linear-gradient(to right,${C.orange},${C.orange2})` }} />
                        </div>
                        <span className={`font-bold ${color(t)}`}>{t}%</span>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
        </tbody>
      </table>
    </div>
  </div>
);

// ═══════════════════════════════════════════════
// VUE SITE
// ═══════════════════════════════════════════════
const VueSite: React.FC<{ stats: SiteStats; nomSite: string }> = ({ stats, nomSite }) => {
  const [granularite, setGranularite] = useState<Granularite>("mois");
  const { evolution, tendance, loadingTmp } = useTemporel(
    granularite, "site", stats.site,
    granularite === "jour" ? 30 : granularite === "semaine" ? 24 : 12
  );
  const t = stats.tauxRetrait;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard label="Total cartes"    value={stats.total}   sub="Ce site"
          gradient="from-[#F77F00] to-[#FF9E40]" icon={<ChartBarIcon className="w-5 h-5 text-white" />} delay={0} />
        <KpiCard label="Retirées"        value={stats.retires}  sub="Délivrées"
          gradient="from-green-500 to-emerald-600" icon={<CheckCircleIcon className="w-5 h-5 text-white" />} delay={0.05} tendance={tendance} />
        <KpiCard label="Restantes"       value={stats.restants} sub="En attente"
          gradient="from-blue-500 to-sky-600" icon={<ClockIcon className="w-5 h-5 text-white" />} delay={0.1} />
        <KpiCard label="Taux de retrait" value={`${t}%`} sub="Performance site"
          gradient="from-violet-500 to-purple-600" icon={<ArrowTrendingUpIcon className="w-5 h-5 text-white" />} delay={0.15} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <SectionHeader icon={<ArrowTrendingUpIcon className="w-4 h-4 text-white" />} title={`Progression — ${nomSite}`} />
          <div className="flex items-end justify-between mb-3">
            <span className="text-5xl font-black text-[#F77F00]">{t}%</span>
            <div className="text-right text-xs text-gray-400 space-y-0.5">
              <div className="text-green-600 font-semibold">{fmt(stats.retires)} retirées</div>
              <div className="text-blue-600 font-semibold">{fmt(stats.restants)} restantes</div>
            </div>
          </div>
          <ProgressBar value={t} delay={0.3} />
          <div className="flex justify-between text-xs text-gray-400 mt-1.5"><span>0%</span><span>50%</span><span>100%</span></div>
          <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${bgColor(t)}`}>{badge(t)}</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <SectionHeader icon={<ChartBarIcon className="w-4 h-4 text-white" />} title="Répartition" sub="Retirées vs Restantes" />
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={[{ name: "Retirées", value: stats.retires }, { name: "Restantes", value: stats.restants }]}
                cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value"
                label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                <Cell fill={C.green} /><Cell fill={C.blue} />
              </Pie>
              <Tooltip formatter={(v: any) => fmt(v)} />
              <Legend iconType="circle" iconSize={10} formatter={v => <span className="text-xs text-gray-600 font-medium">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Évolution temporelle */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <SectionHeader icon={<CalendarDaysIcon className="w-4 h-4 text-white" />}
          title="Évolution des retraits" sub={nomSite}
          action={<GranulariteSelector value={granularite} onChange={setGranularite} />}
        />
        <GraphiqueTemporel data={evolution} granularite={granularite} loading={loadingTmp} />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// VUE COORDINATION
// ═══════════════════════════════════════════════
const VueCoordination: React.FC<{
  coord:        CoordStats;
  sitesFiltres: SiteStats[];
  agences:      AgenceStats[];
  topN:         number;
  setTopN:      (n: number) => void;
}> = ({ coord, sitesFiltres, agences, topN, setTopN }) => {
  const [granularite, setGranularite] = useState<Granularite>("mois");
  const { evolution, tendance, loadingTmp } = useTemporel(
    granularite, "coordination", coord.coordination_id,
    granularite === "jour" ? 30 : granularite === "semaine" ? 24 : 12
  );
  const [expanded, setExpanded] = useState(false);

  const pieData  = [{ name: "Retirées", value: coord.retires }, { name: "Restantes", value: coord.restants }];
  const topSites = useMemo(() => [...sitesFiltres].sort((a, b) => b.retires - a.retires).slice(0, topN), [sitesFiltres, topN]);

  // Agences de cette coordination pour classement
  const agencesCoord = useMemo(() =>
    agences.filter(a => a.coordination_nom === coord.coordination)
      .sort((a, b) => b.taux_retrait - a.taux_retrait)
      .map(a => ({ nom: a.agence_nom, taux: a.taux_retrait, total: a.total_cartes, retires: a.cartes_retirees })),
    [agences, coord]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard label="Total cartes"    value={coord.total}   sub={`${coord.sites.length} sites`}
          gradient="from-[#F77F00] to-[#FF9E40]" icon={<ChartBarIcon className="w-5 h-5 text-white" />} delay={0} />
        <KpiCard label="Retirées"        value={coord.retires}  sub="Délivrées"
          gradient="from-green-500 to-emerald-600" icon={<CheckCircleIcon className="w-5 h-5 text-white" />} delay={0.05} tendance={tendance} />
        <KpiCard label="Restantes"       value={coord.restants} sub="En attente"
          gradient="from-blue-500 to-sky-600" icon={<ClockIcon className="w-5 h-5 text-white" />} delay={0.1} />
        <KpiCard label="Taux de retrait" value={`${coord.tauxRetrait}%`} sub="Cette coordination"
          gradient="from-violet-500 to-purple-600" icon={<ArrowTrendingUpIcon className="w-5 h-5 text-white" />} delay={0.15} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <SectionHeader icon={<ArrowTrendingUpIcon className="w-4 h-4 text-white" />} title="Taux de retrait" sub={coord.coordination} />
          <div className="flex items-end justify-between mb-3">
            <span className="text-5xl font-black text-[#F77F00]">{coord.tauxRetrait}%</span>
            <div className="text-right text-xs space-y-0.5">
              <div className="text-green-600 font-semibold">{fmt(coord.retires)} retirées</div>
              <div className="text-blue-600 font-semibold">{fmt(coord.restants)} restantes</div>
            </div>
          </div>
          <ProgressBar value={coord.tauxRetrait} delay={0.3} />
          <div className="flex justify-between text-xs text-gray-400 mt-1.5"><span>0%</span><span>50%</span><span>100%</span></div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border bg-green-50 border-green-200 text-green-700 p-3">
              <div className="text-2xl font-black">{fmt(coord.retires)}</div>
              <div className="text-xs font-medium mt-0.5">Retirées</div>
            </div>
            <div className="rounded-xl border bg-blue-50 border-blue-200 text-blue-700 p-3">
              <div className="text-2xl font-black">{fmt(coord.restants)}</div>
              <div className="text-xs font-medium mt-0.5">Restantes</div>
            </div>
          </div>
          <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${bgColor(coord.tauxRetrait)}`}>{badge(coord.tauxRetrait)}</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <SectionHeader icon={<ChartBarIcon className="w-4 h-4 text-white" />} title="Répartition" sub="Retirées vs Restantes" />
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value"
                label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                <Cell fill={C.green} /><Cell fill={C.blue} />
              </Pie>
              <Tooltip formatter={(v: any) => fmt(v)} />
              <Legend iconType="circle" iconSize={10} formatter={v => <span className="text-xs text-gray-600 font-medium">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Évolution temporelle */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <SectionHeader icon={<CalendarDaysIcon className="w-4 h-4 text-white" />}
          title="Évolution des retraits" sub={coord.coordination}
          action={<GranulariteSelector value={granularite} onChange={setGranularite} />}
        />
        <GraphiqueTemporel data={evolution} granularite={granularite} loading={loadingTmp} />
      </div>

      {/* Classement agences */}
      {agencesCoord.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <SectionHeader icon={<TrophyIcon className="w-4 h-4 text-white" />}
            title="Classement des agences" sub={`${agencesCoord.length} agence(s) — par taux de retrait`} />
          <Classement items={agencesCoord} couleurBar={`linear-gradient(to right,${C.teal},${C.teal2})`} />
        </div>
      )}

      {/* Top sites */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <SectionHeader icon={<TrophyIcon className="w-4 h-4 text-white" />}
          title="Top sites — cartes retirées"
          sub={`${topSites.length} meilleurs sites de la coordination`}
          action={
            <select value={topN} onChange={e => setTopN(Number(e.target.value))}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#F77F00]">
              {[5, 8, 10, 15].map(n => <option key={n} value={n}>Top {n}</option>)}
            </select>
          }
        />
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={topSites} margin={{ top: 0, right: 10, left: 0, bottom: 45 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="site" tick={{ fontSize: 10, fill: C.gray }} angle={-35} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 10, fill: C.gray }} tickFormatter={v => fmt(v)} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="retires"  name="Retirées"  radius={[4, 4, 0, 0]}>
              {topSites.map((_, i) => <Cell key={i} fill={BAR_PALETTE[i % BAR_PALETTE.length]} />)}
            </Bar>
            <Bar dataKey="restants" name="Restantes" radius={[4, 4, 0, 0]} fill="#dbeafe" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tableau sites */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <SectionHeader icon={<MapPinIcon className="w-4 h-4 text-white" />}
          title="Détail par site" sub={`${sitesFiltres.length} site${sitesFiltres.length > 1 ? 's' : ''}`}
          action={
            <button onClick={() => setExpanded(e => !e)}
              className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 transition-colors font-medium">
              {expanded ? 'Réduire' : 'Agrandir'}
              <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          }
        />
        <div style={{ maxHeight: expanded ? 'none' : 360 }} className="overflow-auto rounded-xl border border-gray-100">
          <TableauSites sites={sitesFiltres.sort((a, b) => b.total - a.total)}
            onExport={() => exportCSV(sitesFiltres.map(s => ({
              Site: s.site, Total: s.total, Retirées: s.retires, Restantes: s.restants, "Taux (%)": s.tauxRetrait,
            })), `coord_${coord.coordination}_sites`)} />
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// VUE AGENCE
// ═══════════════════════════════════════════════
const VueAgence: React.FC<{
  agence:       AgenceStats;
  sitesFiltres: SiteStats[];
  topN:         number;
  setTopN:      (n: number) => void;
}> = ({ agence, sitesFiltres, topN, setTopN }) => {
  const [granularite, setGranularite] = useState<Granularite>("mois");
  const { evolution, tendance, loadingTmp } = useTemporel(
    granularite, "agence", agence.agence_id,
    granularite === "jour" ? 30 : granularite === "semaine" ? 24 : 12
  );

  const t        = agence.taux_retrait;
  const topSites = useMemo(() => [...sitesFiltres].sort((a, b) => b.retires - a.retires).slice(0, topN), [sitesFiltres, topN]);
  const pieData  = [{ name: "Retirées", value: agence.cartes_retirees }, { name: "Restantes", value: agence.cartes_restantes }];

  const classementSites = useMemo(() =>
    [...sitesFiltres].sort((a, b) => b.tauxRetrait - a.tauxRetrait).slice(0, 8).map(s => ({
      nom: s.site, taux: s.tauxRetrait, total: s.total, retires: s.retires,
    })), [sitesFiltres]);

  return (
    <div className="space-y-5">
      {/* Bandeau info */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-2xl px-5 py-3">
        <BuildingStorefrontIcon className="w-5 h-5 text-teal-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="font-bold text-teal-800 text-sm">{agence.agence_nom}</span>
          <span className="text-teal-600 text-xs ml-2">— Coordination : {agence.coordination_nom}</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-teal-700 flex-shrink-0">
          <span><span className="font-bold">{agence.nombre_sites}</span> sites</span>
          <span><span className="font-bold">{agence.nombre_agents}</span> agents</span>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard label="Total cartes"    value={agence.total_cartes}    sub={`${agence.nombre_sites} sites`}
          gradient="from-[#F77F00] to-[#FF9E40]" icon={<ChartBarIcon className="w-5 h-5 text-white" />} delay={0} />
        <KpiCard label="Retirées"        value={agence.cartes_retirees}  sub="Délivrées"
          gradient="from-green-500 to-emerald-600" icon={<CheckCircleIcon className="w-5 h-5 text-white" />} delay={0.05} tendance={tendance} />
        <KpiCard label="Restantes"       value={agence.cartes_restantes} sub="En attente"
          gradient="from-blue-500 to-sky-600" icon={<ClockIcon className="w-5 h-5 text-white" />} delay={0.1} />
        <KpiCard label="Taux de retrait" value={`${t}%`} sub="Performance agence"
          gradient="from-teal-500 to-cyan-600" icon={<ArrowTrendingUpIcon className="w-5 h-5 text-white" />} delay={0.15} />
      </div>

      {/* Jauge + Camembert */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <SectionHeader icon={<ArrowTrendingUpIcon className="w-4 h-4 text-white" />} title="Taux de retrait" sub={agence.agence_nom} />
          <div className="flex items-end justify-between mb-3">
            <span className="text-5xl font-black text-[#F77F00]">{t}%</span>
            <div className="text-right text-xs space-y-0.5">
              <div className="text-green-600 font-semibold">{fmt(agence.cartes_retirees)} retirées</div>
              <div className="text-blue-600 font-semibold">{fmt(agence.cartes_restantes)} restantes</div>
            </div>
          </div>
          <ProgressBar value={t} delay={0.3} color={`linear-gradient(to right,${C.teal},${C.teal2})`} />
          <div className="flex justify-between text-xs text-gray-400 mt-1.5"><span>0%</span><span>50%</span><span>100%</span></div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl border bg-green-50 border-green-200 text-green-700 p-3">
              <div className="text-xl font-black">{fmt(agence.cartes_retirees)}</div>
              <div className="text-xs font-medium mt-0.5">Retirées</div>
            </div>
            <div className="rounded-xl border bg-blue-50 border-blue-200 text-blue-700 p-3">
              <div className="text-xl font-black">{fmt(agence.cartes_restantes)}</div>
              <div className="text-xs font-medium mt-0.5">Restantes</div>
            </div>
            <div className="rounded-xl border bg-teal-50 border-teal-200 text-teal-700 p-3">
              <div className="text-xl font-black">{agence.nombre_agents}</div>
              <div className="text-xs font-medium mt-0.5">Agents</div>
            </div>
          </div>
          <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${bgColor(t)}`}>{badge(t)}</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <SectionHeader icon={<ChartBarIcon className="w-4 h-4 text-white" />} title="Répartition" sub="Retirées vs Restantes" />
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value"
                label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                <Cell fill={C.teal} /><Cell fill={C.blue} />
              </Pie>
              <Tooltip formatter={(v: any) => fmt(v)} />
              <Legend iconType="circle" iconSize={10} formatter={v => <span className="text-xs text-gray-600 font-medium">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Évolution temporelle */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <SectionHeader icon={<CalendarDaysIcon className="w-4 h-4 text-white" />}
          title="Évolution des retraits" sub={agence.agence_nom}
          action={<GranulariteSelector value={granularite} onChange={setGranularite} />}
        />
        <GraphiqueTemporel data={evolution} granularite={granularite} loading={loadingTmp} />
      </div>

      {/* Classement sites */}
      {classementSites.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <SectionHeader icon={<TrophyIcon className="w-4 h-4 text-white" />}
            title="Classement des sites" sub={`${sitesFiltres.length} site(s) — par taux de retrait`} />
          <Classement items={classementSites} />
        </div>
      )}

      {/* Top sites bar chart */}
      {topSites.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <SectionHeader icon={<TrophyIcon className="w-4 h-4 text-white" />}
            title="Top sites — cartes retirées"
            sub={`${topSites.length} meilleurs sites de l'agence`}
            action={
              <select value={topN} onChange={e => setTopN(Number(e.target.value))}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#F77F00]">
                {[5, 8, 10, 15].map(n => <option key={n} value={n}>Top {n}</option>)}
              </select>
            }
          />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topSites} margin={{ top: 0, right: 10, left: 0, bottom: 45 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="site" tick={{ fontSize: 10, fill: C.gray }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 10, fill: C.gray }} tickFormatter={v => fmt(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="retires"  name="Retirées"  radius={[4, 4, 0, 0]}>
                {topSites.map((_, i) => <Cell key={i} fill={BAR_PALETTE[i % BAR_PALETTE.length]} />)}
              </Bar>
              <Bar dataKey="restants" name="Restantes" radius={[4, 4, 0, 0]} fill="#ccfbf1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tableau sites */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <SectionHeader icon={<MapPinIcon className="w-4 h-4 text-white" />}
          title="Détail des sites" sub={`${sitesFiltres.length} site${sitesFiltres.length > 1 ? 's' : ''} rattaché${sitesFiltres.length > 1 ? 's' : ''}`}
        />
        {sitesFiltres.length > 0
          ? <TableauSites sites={sitesFiltres.sort((a, b) => b.total - a.total)}
              onExport={() => exportCSV(sitesFiltres.map(s => ({
                Site: s.site, Total: s.total, Retirées: s.retires, Restantes: s.restants, "Taux (%)": s.tauxRetrait,
              })), `agence_${agence.agence_nom}_sites`)} />
          : (
            <div className="text-center py-10 text-gray-400">
              <MapPinIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucun site rattaché à cette agence</p>
            </div>
          )
        }
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// VUE GLOBALE
// ═══════════════════════════════════════════════
const VueGlobale: React.FC<{
  globales:     GlobalStats;
  coordData:    CoordStats[];
  allSites:     SiteStats[];
  sitesFiltres: SiteStats[];
  topN:         number;
  setTopN:      (n: number) => void;
}> = ({ globales, coordData, allSites, sitesFiltres, topN, setTopN }) => {
  const [granularite, setGranularite] = useState<Granularite>("mois");
  const { evolution, tendance, loadingTmp } = useTemporel(
    granularite, "global", undefined,
    granularite === "jour" ? 30 : granularite === "semaine" ? 24 : 12
  );

  const pieData    = [{ name: "Retirées", value: globales.retires }, { name: "Restantes", value: globales.restants }];
  const topSites   = useMemo(() => [...sitesFiltres].sort((a, b) => b.retires - a.retires).slice(0, topN), [sitesFiltres, topN]);
  const tauxGlobal = pct(globales.retires, globales.total);

  // Classement coordinations par taux
  const classementCoord = useMemo(() =>
    [...coordData].sort((a, b) => b.tauxRetrait - a.tauxRetrait).map(c => ({
      nom: c.coordination, taux: c.tauxRetrait, total: c.total, retires: c.retires,
    })), [coordData]);

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total cartes"     value={globales.total}   sub="Toutes coordinations"
          gradient="from-[#F77F00] to-[#FF9E40]" icon={<ChartBarIcon className="w-5 h-5 text-white" />} delay={0} />
        <KpiCard label="Cartes retirées"  value={globales.retires}  sub="Délivrance complétée"
          gradient="from-green-500 to-emerald-600" icon={<CheckCircleIcon className="w-5 h-5 text-white" />} delay={0.05} tendance={tendance} />
        <KpiCard label="Cartes restantes" value={globales.restants} sub="En attente de retrait"
          gradient="from-blue-500 to-sky-600" icon={<ClockIcon className="w-5 h-5 text-white" />} delay={0.1} />
        <KpiCard label="Taux de retrait"  value={`${tauxGlobal}%`}
          sub={`${allSites.length} sites · ${coordData.length} coordinations`}
          gradient="from-violet-500 to-purple-600" icon={<ArrowTrendingUpIcon className="w-5 h-5 text-white" />} delay={0.15} />
      </div>

      {/* Jauge + Camembert */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <SectionHeader icon={<ArrowTrendingUpIcon className="w-4 h-4 text-white" />} title="Taux de retrait global" sub="Progression cumulée" />
          <div className="flex items-end justify-between mb-3">
            <span className="text-5xl font-black text-[#F77F00]">{tauxGlobal}%</span>
            <div className="text-right text-xs space-y-0.5">
              <div className="text-green-600 font-semibold">{fmt(globales.retires)} retirées</div>
              <div className="text-blue-600 font-semibold">{fmt(globales.restants)} restantes</div>
            </div>
          </div>
          <ProgressBar value={tauxGlobal} delay={0.3} />
          <div className="flex justify-between text-xs text-gray-400 mt-1.5"><span>0%</span><span>50%</span><span>100%</span></div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border bg-green-50 border-green-200 text-green-700 p-3">
              <div className="text-2xl font-black">{fmt(globales.retires)}</div>
              <div className="text-xs font-medium mt-0.5">Retirées</div>
            </div>
            <div className="rounded-xl border bg-blue-50 border-blue-200 text-blue-700 p-3">
              <div className="text-2xl font-black">{fmt(globales.restants)}</div>
              <div className="text-xs font-medium mt-0.5">Restantes</div>
            </div>
          </div>
          <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${bgColor(tauxGlobal)}`}>{badge(tauxGlobal)}</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <SectionHeader icon={<ChartBarIcon className="w-4 h-4 text-white" />} title="Répartition globale" sub="Retirées vs Restantes" />
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value"
                label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                <Cell fill={C.green} /><Cell fill={C.blue} />
              </Pie>
              <Tooltip formatter={(v: any) => fmt(v)} />
              <Legend iconType="circle" iconSize={10} formatter={v => <span className="text-xs text-gray-600 font-medium">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Évolution temporelle */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <SectionHeader icon={<CalendarDaysIcon className="w-4 h-4 text-white" />}
          title="Évolution des retraits"
          sub={tendance ? `Tendance : ${tendance.direction === "hausse" ? "📈" : tendance.direction === "baisse" ? "📉" : "➡️"} ${tendance.pourcentage !== null ? Math.abs(tendance.pourcentage) + "% vs période précédente" : "stable"}` : undefined}
          action={<GranulariteSelector value={granularite} onChange={setGranularite} />}
        />
        <GraphiqueTemporel data={evolution} granularite={granularite} loading={loadingTmp} showCumul />
      </motion.div>

      {/* Classement coordinations + comparatif bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <SectionHeader icon={<TrophyIcon className="w-4 h-4 text-white" />}
            title="Classement coordinations" sub="Par taux de retrait" />
          <Classement items={classementCoord} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <SectionHeader icon={<BuildingOfficeIcon className="w-4 h-4 text-white" />}
            title="Comparatif coordinations" sub="Cartes retirées vs restantes" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[...coordData].sort((a, b) => b.total - a.total).slice(0, 6)}
              margin={{ top: 0, right: 10, left: 0, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="coordination" tick={{ fontSize: 10, fill: C.gray }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 10, fill: C.gray }} tickFormatter={v => fmt(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="retires"  name="Retirées"  radius={[4, 4, 0, 0]}>
                {coordData.slice(0, 6).map((_, i) => <Cell key={i} fill={COORD_PALETTE[i % COORD_PALETTE.length]} />)}
              </Bar>
              <Bar dataKey="restants" name="Restantes" radius={[4, 4, 0, 0]} fill="#dbeafe" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Cards coordinations */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <SectionHeader icon={<BuildingOfficeIcon className="w-4 h-4 text-white" />}
          title="Par coordination" sub={`${coordData.length} coordination(s)`} />
        {coordData.length === 0
          ? <p className="text-center text-gray-400 text-sm py-8">Aucune donnée</p>
          : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coordData.map((c, i) => (
              <motion.div key={c.coordination}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 + i * 0.04 }}
                className="rounded-xl border border-gray-100 p-4 hover:border-orange-200 hover:bg-orange-50/20 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-bold text-gray-700 text-sm truncate max-w-[140px]" title={c.coordination}>{c.coordination}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${bgColor(c.tauxRetrait)}`}>{c.tauxRetrait}%</span>
                </div>
                <ProgressBar value={c.tauxRetrait} delay={0.4 + i * 0.05} />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>{fmt(c.retires)} retirées</span><span>{fmt(c.total)} total</span>
                </div>
                <div className="flex gap-2 mt-2.5 text-xs">
                  <span className="flex-1 text-center py-1 bg-green-50 text-green-700 rounded-lg font-semibold">{fmt(c.retires)}</span>
                  <span className="flex-1 text-center py-1 bg-blue-50 text-blue-700 rounded-lg font-semibold">{fmt(c.restants)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        }
      </motion.div>

      {/* Top sites */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <SectionHeader icon={<TrophyIcon className="w-4 h-4 text-white" />}
          title="Top sites — cartes retirées" sub={`${topSites.length} meilleurs sites`}
          action={
            <select value={topN} onChange={e => setTopN(Number(e.target.value))}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#F77F00]">
              {[5, 8, 10, 15].map(n => <option key={n} value={n}>Top {n}</option>)}
            </select>
          }
        />
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={topSites} margin={{ top: 0, right: 10, left: 0, bottom: 45 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="site" tick={{ fontSize: 10, fill: C.gray }} angle={-35} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 10, fill: C.gray }} tickFormatter={v => fmt(v)} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="retires"  name="Retirées"  radius={[4, 4, 0, 0]}>
              {topSites.map((_, i) => <Cell key={i} fill={BAR_PALETTE[i % BAR_PALETTE.length]} />)}
            </Bar>
            <Bar dataKey="restants" name="Restantes" radius={[4, 4, 0, 0]} fill="#dbeafe" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Tableau global */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <SectionHeader icon={<MapPinIcon className="w-4 h-4 text-white" />}
          title="Détail par site" sub={`${sitesFiltres.length} site${sitesFiltres.length > 1 ? 's' : ''}`} />
        <TableauSites sites={sitesFiltres.sort((a, b) => b.total - a.total)} title="global"
          onExport={() => exportCSV(sitesFiltres.map(s => ({
            Site: s.site, Coordination: s.coordination, Total: s.total,
            Retirées: s.retires, Restantes: s.restants, "Taux (%)": s.tauxRetrait,
          })), "global_sites")} />
      </motion.div>

      {/* Graphique area top 6 sites (conservé de la version précédente) */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <SectionHeader icon={<ArrowTrendingUpIcon className="w-4 h-4 text-white" />}
          title="Comparaison — Top 6 sites" sub="Total / Retirées / Restantes" />
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={[...allSites].sort((a, b) => b.total - a.total).slice(0, 6)} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="gTotal"    x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C.orange} stopOpacity={0.25} /><stop offset="95%" stopColor={C.orange} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gRetires"  x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C.green}  stopOpacity={0.25} /><stop offset="95%" stopColor={C.green}  stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gRestants" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C.blue}   stopOpacity={0.25} /><stop offset="95%" stopColor={C.blue}   stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="site" tick={{ fontSize: 10, fill: C.gray }} angle={-20} textAnchor="end" height={40} />
            <YAxis tick={{ fontSize: 10, fill: C.gray }} tickFormatter={v => fmt(v)} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={9} formatter={v => <span className="text-xs text-gray-500 font-medium">{v}</span>} />
            <Area type="monotone" dataKey="total"    name="Total"     stroke={C.orange} fill="url(#gTotal)"    strokeWidth={2} dot={{ r: 3, fill: C.orange }} />
            <Area type="monotone" dataKey="retires"  name="Retirées"  stroke={C.green}  fill="url(#gRetires)"  strokeWidth={2} dot={{ r: 3, fill: C.green  }} />
            <Area type="monotone" dataKey="restants" name="Restantes" stroke={C.blue}   fill="url(#gRestants)" strokeWidth={2} dot={{ r: 3, fill: C.blue   }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// PAGE PRINCIPALE
// ═══════════════════════════════════════════════
const TableauDeBord: React.FC = () => {
  const { user, hasRole } = useAuth();
  const isAdmin        = hasRole(['Administrateur']);
  const isGestionnaire = hasRole(['Gestionnaire']);
  const isChef         = hasRole(["Chef d'équipe"]);

  const [globales,   setGlobales]   = useState<GlobalStats | null>(null);
  const [allSites,   setAllSites]   = useState<SiteStats[]>([]);
  const [coordData,  setCoordData]  = useState<CoordStats[]>([]);
  const [allAgences, setAllAgences] = useState<AgenceStats[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [lastUpdate, setLastUpdate] = useState("");
  const [isOnline,   setIsOnline]   = useState(navigator.onLine);
  const [topN,       setTopN]       = useState(8);

  type NiveauId = 'global' | 'coordination' | 'agence' | 'site';
  const niveaux: Array<{ id: NiveauId; label: string; icon: React.ReactNode }> = useMemo(() => {
    if (isAdmin) return [
      { id: 'global',       label: 'Global',          icon: <GlobeAltIcon className="w-4 h-4" />            },
      { id: 'coordination', label: 'Coordination',     icon: <BuildingOfficeIcon className="w-4 h-4" />      },
      { id: 'agence',       label: 'Agence',           icon: <BuildingStorefrontIcon className="w-4 h-4" />  },
      { id: 'site',         label: 'Site',             icon: <MapPinIcon className="w-4 h-4" />              },
    ];
    if (isGestionnaire) return [
      { id: 'coordination', label: 'Ma coordination',  icon: <BuildingOfficeIcon className="w-4 h-4" />      },
      { id: 'agence',       label: 'Agence',           icon: <BuildingStorefrontIcon className="w-4 h-4" />  },
      { id: 'site',         label: 'Sites',            icon: <MapPinIcon className="w-4 h-4" />              },
    ];
    if (isChef) return [
      { id: 'agence', label: 'Mon agence', icon: <BuildingStorefrontIcon className="w-4 h-4" /> },
      { id: 'site',   label: 'Sites',      icon: <MapPinIcon className="w-4 h-4" />             },
    ];
    return [{ id: 'site', label: 'Mon site', icon: <MapPinIcon className="w-4 h-4" /> }];
  }, [isAdmin, isGestionnaire, isChef]);

  const [niveauActif, setNiveauActif] = useState<NiveauId>(niveaux[0].id);

  const [filtres, setFiltres] = useState<FiltreState>({
    coordination:    isGestionnaire ? (user?.coordination || '') : '',
    coordination_id: null,
    agence:          '',
    agence_id:       null,
    site:            '',
    seuilMin:        0,
    seuilMax:        100,
  });

  // Listes pour selects
  const coordinations = useMemo(() =>
    [...new Map(allAgences.map(a => [a.coordination_id, { id: a.coordination_id, nom: a.coordination_nom }])).values()]
      .sort((a, b) => a.nom.localeCompare(b.nom)),
    [allAgences]);

  const agencesFiltrees = useMemo(() => {
    let data = [...allAgences];
    if (isGestionnaire && user?.coordination) data = data.filter(a => a.coordination_nom === user.coordination);
    if (filtres.coordination) data = data.filter(a => a.coordination_nom === filtres.coordination);
    return data;
  }, [allAgences, filtres.coordination, isGestionnaire, user]);

  const sitesDisponibles = useMemo(() => {
    let src = allSites;
    if (filtres.coordination) src = src.filter(s => s.coordination === filtres.coordination);
    return src.map(s => s.site);
  }, [allSites, filtres.coordination]);

  const sitesFiltres = useMemo(() => {
    let data = [...allSites];
    if (isGestionnaire && user?.coordination) data = data.filter(s => s.coordination === user.coordination);
    if (filtres.coordination) data = data.filter(s => s.coordination === filtres.coordination);
    if (filtres.site)         data = data.filter(s => s.site === filtres.site);
    data = data.filter(s => s.tauxRetrait >= filtres.seuilMin && s.tauxRetrait <= filtres.seuilMax);
    return data;
  }, [allSites, filtres, isGestionnaire, user]);

  const coordFiltrees = useMemo(() => {
    let data = [...coordData];
    if (isGestionnaire && user?.coordination) data = data.filter(c => c.coordination === user.coordination);
    if (filtres.coordination) data = data.filter(c => c.coordination === filtres.coordination);
    return data;
  }, [coordData, filtres, isGestionnaire, user]);

  const coordActive = useMemo(() => {
    if (filtres.coordination) return coordFiltrees.find(c => c.coordination === filtres.coordination) || coordFiltrees[0];
    return coordFiltrees[0];
  }, [coordFiltrees, filtres]);

  const agenceActive = useMemo(() => {
    if (filtres.agence) return agencesFiltrees.find(a => a.agence_nom === filtres.agence) || agencesFiltrees[0];
    if (isChef && user?.agence) return agencesFiltrees.find(a => a.agence_nom === user.agence) || agencesFiltrees[0];
    return agencesFiltrees[0];
  }, [agencesFiltrees, filtres, isChef, user]);

  const sitesAgenceActive = useMemo(() => {
    if (!agenceActive) return sitesFiltres;
    return sitesFiltres.filter(s => s.coordination === agenceActive.coordination_nom);
  }, [agenceActive, sitesFiltres]);

  const siteActif = useMemo(() => {
    if (filtres.site) return sitesFiltres.find(s => s.site === filtres.site) || sitesFiltres[0];
    if (!isAdmin && !isGestionnaire && user?.agence) return sitesFiltres.find(s => s.site === user.agence) || sitesFiltres[0];
    return sitesFiltres[0];
  }, [sitesFiltres, filtres, isAdmin, isGestionnaire, user]);

  const globalFiltrees = useMemo<GlobalStats>(() => {
    const total    = sitesFiltres.reduce((s, x) => s + x.total,   0);
    const retires  = sitesFiltres.reduce((s, x) => s + x.retires, 0);
    const restants = sitesFiltres.reduce((s, x) => s + x.restants,0);
    return { total, retires, restants, tauxRetrait: pct(retires, total) };
  }, [sitesFiltres]);

  // Réseau
  useEffect(() => {
    const on = () => setIsOnline(true); const off = () => setIsOnline(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  const fetchData = useCallback(async (force = false) => {
    if (!isOnline && !force) { setError("Mode hors ligne."); setLoading(false); return; }
    try {
      setLoading(true); setError("");
      const [g, s, agRes] = await Promise.all([
        StatistiquesService.getStatistiquesGlobales(),
        StatistiquesService.getStatistiquesParSite(),
        StatistiquesService.getStatistiquesParAgence(),   // retourne { agences, classement, totaux }
      ]);
      setGlobales(g);
      setAllAgences(agRes.agences || []);  // ✅ correction : extraire .agences

      const adapted: SiteStats[] = (Array.isArray(s) ? s : []).map((x: any) => ({
        site:         x.site,
        coordination: x.coordination || "",
        total:        x.total,
        retires:      x.retires,
        restants:     x.restants,
        tauxRetrait:  pct(x.retires, x.total),
      }));
      setAllSites(adapted);

      // Construire coordData depuis les sites + enrichir coordination_id depuis agences
      const coordMap: Record<string, CoordStats> = {};
      adapted.forEach(si => {
        const c = si.coordination || "Non défini";
        if (!coordMap[c]) {
          const agenceRef = (agRes.agences || []).find((a: AgenceStats) => a.coordination_nom === c);
          coordMap[c] = {
            coordination:    c,
            coordination_id: agenceRef?.coordination_id,
            total: 0, retires: 0, restants: 0, tauxRetrait: 0, sites: [],
          };
        }
        coordMap[c].total    += si.total;
        coordMap[c].retires  += si.retires;
        coordMap[c].restants += si.restants;
        coordMap[c].sites.push(si);
      });
      Object.values(coordMap).forEach(c => { c.tauxRetrait = pct(c.retires, c.total); });
      setCoordData(Object.values(coordMap).sort((a, b) => b.total - a.total));
      setLastUpdate(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
    } catch (e: any) { setError(e.message || "Erreur de chargement"); }
    finally { setLoading(false); }
  }, [isOnline]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { const t = setInterval(() => fetchData(), 300000); return () => clearInterval(t); }, [fetchData]);

  const titreNiveau = useMemo(() => {
    if (niveauActif === 'global')       return 'Vue globale';
    if (niveauActif === 'coordination') return coordActive?.coordination || 'Coordination';
    if (niveauActif === 'agence')       return agenceActive?.agence_nom  || 'Agence';
    return siteActif?.site || 'Site';
  }, [niveauActif, coordActive, agenceActive, siteActif]);

  if (loading && !globales) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-orange-50 to-white">
      <Navbar />
      <div className="w-14 h-14 border-4 border-[#F77F00] border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-600 font-medium">Chargement du tableau de bord…</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Navbar />

      <AnimatePresence>
        {!isOnline && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            className="bg-amber-100 border-b border-amber-300 text-amber-800 text-center text-sm py-2 flex items-center justify-center gap-2">
            <SignalSlashIcon className="w-4 h-4" /> Mode hors ligne — données en cache
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#F77F00] via-[#FF8C00] to-[#FF9E40] shadow-lg">
        <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">Tableau de bord</h1>
              <p className="text-white/80 text-sm mt-0.5 flex items-center gap-2 flex-wrap">
                <span>{user?.coordination || 'Toutes coordinations'}</span>
                <span className="text-white/50">·</span>
                <span className="font-semibold">{titreNiveau}</span>
                {lastUpdate && (
                  <span className="flex items-center gap-1 text-white/60 text-xs">
                    <ClockIcon className="w-3 h-3" />{lastUpdate}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {isOnline && (
                <div className="flex items-center gap-1.5 text-green-800 text-xs bg-green-100 border border-green-300 px-3 py-1.5 rounded-full">
                  <WifiIcon className="w-3.5 h-3.5" /><span className="font-semibold">En ligne</span>
                </div>
              )}
              <BoutonRapport /> {/* ✅ Bouton de téléchargement des rapports ajouté ici */}
              <button onClick={() => fetchData(true)} disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-xl border border-white/30 transition-all disabled:opacity-60">
                <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />Actualiser
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-6 space-y-5">

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />{error}
              <button onClick={() => setError('')} className="ml-auto"><XMarkIcon className="w-4 h-4" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation + Filtres */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center bg-white border border-gray-200 rounded-2xl p-1 gap-1 shadow-sm">
            {niveaux.map((n, i) => (
              <React.Fragment key={n.id}>
                <button onClick={() => setNiveauActif(n.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all
                    ${niveauActif === n.id
                      ? 'bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                  {n.icon}
                  <span className="hidden sm:inline">{n.label}</span>
                </button>
                {i < niveaux.length - 1 && <ChevronRightIcon className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />}
              </React.Fragment>
            ))}
          </div>
          {(isAdmin || isGestionnaire) && (
            <FiltrePanel
              filtres={filtres} setFiltres={setFiltres}
              coordinations={coordinations}
              agences={agencesFiltrees}
              sites={sitesDisponibles}
              isAdmin={isAdmin} isGestionnaire={isGestionnaire}
            />
          )}
        </div>

        {/* Chips filtres actifs */}
        {(filtres.coordination || filtres.agence || filtres.site || filtres.seuilMin > 0 || filtres.seuilMax < 100) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400 font-medium">Filtres actifs :</span>
            {filtres.coordination && (
              <span className="flex items-center gap-1.5 bg-orange-100 text-orange-700 border border-orange-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                <BuildingOfficeIcon className="w-3 h-3" />{filtres.coordination}
                <button onClick={() => setFiltres({ ...filtres, coordination: '', coordination_id: null, agence: '', agence_id: null, site: '' })}>
                  <XMarkIcon className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {filtres.agence && (
              <span className="flex items-center gap-1.5 bg-teal-100 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                <BuildingStorefrontIcon className="w-3 h-3" />{filtres.agence}
                <button onClick={() => setFiltres({ ...filtres, agence: '', agence_id: null, site: '' })}>
                  <XMarkIcon className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {filtres.site && (
              <span className="flex items-center gap-1.5 bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                <MapPinIcon className="w-3 h-3" />{filtres.site}
                <button onClick={() => setFiltres({ ...filtres, site: '' })}><XMarkIcon className="w-2.5 h-2.5" /></button>
              </span>
            )}
            {(filtres.seuilMin > 0 || filtres.seuilMax < 100) && (
              <span className="flex items-center gap-1.5 bg-violet-100 text-violet-700 border border-violet-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                Taux {filtres.seuilMin}%–{filtres.seuilMax}%
                <button onClick={() => setFiltres({ ...filtres, seuilMin: 0, seuilMax: 100 })}><XMarkIcon className="w-2.5 h-2.5" /></button>
              </span>
            )}
            <span className="text-xs text-gray-400">— {sitesFiltres.length} site{sitesFiltres.length > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Contenu */}
        <AnimatePresence mode="wait">
          <motion.div key={`${niveauActif}-${filtres.coordination}-${filtres.agence}-${filtres.site}`}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}>

            {niveauActif === 'global' && globales && (
              <VueGlobale globales={globalFiltrees} coordData={coordFiltrees}
                allSites={allSites} sitesFiltres={sitesFiltres} topN={topN} setTopN={setTopN} />
            )}

            {niveauActif === 'coordination' && (
              coordActive
                ? <VueCoordination
                    coord={coordActive}
                    sitesFiltres={sitesFiltres.filter(s => s.coordination === coordActive.coordination)}
                    agences={allAgences}
                    topN={topN} setTopN={setTopN}
                  />
                : <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
                    <BuildingOfficeIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 font-semibold">Aucune coordination disponible</p>
                    <p className="text-gray-400 text-sm mt-1">Sélectionnez une coordination dans les filtres</p>
                  </div>
            )}

            {niveauActif === 'agence' && (
              agenceActive
                ? <VueAgence agence={agenceActive} sitesFiltres={sitesAgenceActive} topN={topN} setTopN={setTopN} />
                : <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
                    <BuildingStorefrontIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 font-semibold">Aucune agence disponible</p>
                    <p className="text-gray-400 text-sm mt-1">Sélectionnez une agence dans les filtres</p>
                  </div>
            )}

            {niveauActif === 'site' && (
              siteActif
                ? <VueSite stats={siteActif} nomSite={siteActif.site} />
                : <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
                    <MapPinIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 font-semibold">Aucun site disponible</p>
                    <p className="text-gray-400 text-sm mt-1">Vérifiez vos filtres ou sélectionnez un site</p>
                  </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-400 pb-4 pt-2">
          <span>GESCARD v3.2.0</span>
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Sync toutes les 5 min
          </span>
        </div>
      </div>
    </div>
  );
};

export default TableauDeBord;