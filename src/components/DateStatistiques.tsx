// src/components/DateStatistiques.tsx
import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  XMarkIcon, CalendarDaysIcon, ArrowPathIcon,
  ChartBarIcon, BuildingOfficeIcon, MapPinIcon,
  CheckCircleIcon, BuildingStorefrontIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { apiClient } from "../Services/api/client";

// ─── Types ────────────────────────────────────────────────────
interface StatsJour {
  retraits_jour:       number;
  total_retires_cumul: number;
  total_cartes:        number;
}
interface LigneCoord {
  id:                  number;
  coordination:        string;
  retraits_jour:       number;
  total_retires_cumul: number;
  total_cartes:        number;
}
interface LigneAgence {
  agence_id:           number;
  agence:              string;
  coordination:        string;
  retraits_jour:       number;
  total_retires_cumul: number;
  total_cartes:        number;
}
interface LigneSite {
  site:                string;
  coordination:        string;
  agence:              string;
  retraits_jour:       number;
  total_retires_cumul: number;
  total_cartes:        number;
}
interface DonneesJour {
  date:          string;
  global:        StatsJour;
  coordinations: LigneCoord[];
  agences:       LigneAgence[];
  sites:         LigneSite[];
}

// ─── Utilitaires ──────────────────────────────────────────────
const fmt     = (n: number) => Number(n).toLocaleString("fr-FR");
const fmtTaux = (t: number) => t.toFixed(2).replace(".", ",") + "%";
const tColor  = (t: number) =>
  t >= 90 ? "#16a34a" : t >= 70 ? "#10b981" : t >= 50 ? "#f59e0b" : "#dc2626";

const BAR_PALETTE = ["#F77F00","#FF9E40","#fb923c","#fdba74","#fcd34d","#fbbf24","#f59e0b","#d97706"];

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-orange-100 rounded-xl shadow-xl p-3 text-xs min-w-[140px]">
      <p className="font-bold text-gray-700 mb-1.5 truncate max-w-[200px]">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="flex justify-between gap-3 font-semibold" style={{ color: p.color }}>
          <span>{p.name}</span><span>{fmt(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

// ─── Composant principal ───────────────────────────────────────
interface Props {
  isOpen:           boolean;
  onClose:          () => void;
  userRole:         string;
  userCoordination?: string;
}

const DateStatistiques: React.FC<Props> = ({ isOpen, onClose, userRole }) => {
  const today = new Date().toISOString().slice(0, 10);

  const [date,       setDate]       = useState(today);
  const [donnees,    setDonnees]    = useState<DonneesJour | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [onglet,     setOnglet]     = useState<"global" | "coordinations" | "agences" | "sites">("global");
  const [searchSite, setSearchSite] = useState("");

  const isAdmin = userRole === "Administrateur";
  const isGest  = userRole === "Gestionnaire";

  const fetchDonnees = useCallback(async (d: string) => {
    setLoading(true); setError("");
    try {
      const res = await apiClient.get(`/statistiques/journalieres`, { params: { date: d } });
      setDonnees(res.data);
    } catch (e: any) {
      setError(e.response?.data?.error || e.message || "Erreur de chargement");
      setDonnees(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchDonnees(date);
  }, [isOpen, date, fetchDonnees]);

  // Fermer avec Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const sitesFiltres = donnees?.sites.filter(s =>
    !searchSite || s.site.toLowerCase().includes(searchSite.toLowerCase())
  ) || [];

  const totalRetraitsJour = donnees?.global.retraits_jour || 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <CalendarDaysIcon className="w-6 h-6 text-white" />
              <div>
                <h2 className="text-lg font-black text-white">Statistiques Journalières</h2>
                <p className="text-white/80 text-xs">Retraits du jour basés sur la date de délivrance</p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors">
              <XMarkIcon className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Sélecteur de date */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-4 flex-shrink-0">
            <div className="flex items-center gap-2 flex-1">
              <label className="text-sm font-semibold text-gray-600 whitespace-nowrap">Date :</label>
              <input
                type="date"
                value={date}
                max={today}
                onChange={e => setDate(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F77F00]/30 focus:border-[#F77F00]"
              />
              <button onClick={() => fetchDonnees(date)} disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#F77F00] hover:bg-[#e46f00] text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-60">
                <ArrowPathIcon className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Actualiser
              </button>
            </div>
            {donnees && (
              <div className="text-xs text-gray-400">
                {new Date(date).toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
              </div>
            )}
          </div>

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto p-6">

            {/* Erreur */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
                <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />{error}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-16">
                <div className="w-10 h-10 border-3 border-[#F77F00] border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Données */}
            {!loading && donnees && (
              <div className="space-y-5">

                {/* KPIs globaux du jour */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Retraits du jour */}
                  <div className="bg-gradient-to-br from-[#F77F00] to-[#FF9E40] rounded-2xl p-5 shadow-sm relative overflow-hidden">
                    <div className="absolute -top-3 -right-3 w-20 h-20 rounded-full bg-white/10" />
                    <div className="relative z-10">
                      <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                        <CheckCircleIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-3xl font-black text-white">{fmt(totalRetraitsJour)}</div>
                      <div className="text-white/90 font-semibold text-sm">Retraits ce jour</div>
                      <div className="text-white/70 text-xs mt-0.5">
                        {new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                      </div>
                    </div>
                  </div>

                  {/* Cumul total retiré */}
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                    <div className="absolute -top-3 -right-3 w-20 h-20 rounded-full bg-white/10" />
                    <div className="relative z-10">
                      <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                        <ChartBarIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-3xl font-black text-white">{fmt(donnees.global.total_retires_cumul)}</div>
                      <div className="text-white/90 font-semibold text-sm">Total retiré (cumul)</div>
                      <div className="text-white/70 text-xs mt-0.5">
                        {donnees.global.total_cartes > 0
                          ? fmtTaux((donnees.global.total_retires_cumul / donnees.global.total_cartes) * 100)
                          : "—"} du total
                      </div>
                    </div>
                  </div>

                  {/* Part du jour */}
                  <div className="bg-gradient-to-br from-blue-500 to-sky-600 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                    <div className="absolute -top-3 -right-3 w-20 h-20 rounded-full bg-white/10" />
                    <div className="relative z-10">
                      <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                        <CalendarDaysIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-3xl font-black text-white">
                        {donnees.global.total_retires_cumul > 0
                          ? fmtTaux((totalRetraitsJour / donnees.global.total_retires_cumul) * 100)
                          : "—"}
                      </div>
                      <div className="text-white/90 font-semibold text-sm">Part du jour</div>
                      <div className="text-white/70 text-xs mt-0.5">sur total cumulé</div>
                    </div>
                  </div>
                </div>

                {/* Onglets */}
                <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
                  {[
                    { id: "global",        label: "Résumé",        icon: <ChartBarIcon className="w-3.5 h-3.5" />, show: true },
                    { id: "coordinations", label: "Coordinations", icon: <BuildingOfficeIcon className="w-3.5 h-3.5" />, show: isAdmin },
                    { id: "agences",       label: "Agences",       icon: <BuildingStorefrontIcon className="w-3.5 h-3.5" />, show: isAdmin || isGest },
                    { id: "sites",         label: "Sites",         icon: <MapPinIcon className="w-3.5 h-3.5" />, show: true },
                  ].filter(o => o.show).map(o => (
                    <button key={o.id} onClick={() => setOnglet(o.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all flex-1 justify-center
                        ${onglet === o.id ? "bg-white text-[#F77F00] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                      {o.icon}{o.label}
                    </button>
                  ))}
                </div>

                {/* Onglet Résumé */}
                {onglet === "global" && (
                  <div className="space-y-4">
                    {totalRetraitsJour === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <CalendarDaysIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="font-semibold">Aucun retrait enregistré ce jour</p>
                        <p className="text-sm mt-1">Aucune carte n'a été délivrée le {new Date(date).toLocaleDateString("fr-FR")}</p>
                      </div>
                    ) : (
                      <>
                        {/* Bar chart par coordination si admin */}
                        {isAdmin && donnees.coordinations.filter(c => c.retraits_jour > 0).length > 0 && (
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                              Retraits du jour par coordination
                            </p>
                            <ResponsiveContainer width="100%" height={180}>
                              <BarChart
                                data={donnees.coordinations.filter(c => c.retraits_jour > 0)}
                                margin={{ top: 0, right: 10, left: 0, bottom: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="coordination" tick={{ fontSize: 10, fill: "#6b7280" }} angle={-30} textAnchor="end" interval={0} />
                                <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} tickFormatter={v => fmt(v)} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="retraits_jour" name="Retraits" radius={[4, 4, 0, 0]}>
                                  {donnees.coordinations.map((_, i) => (
                                    <Cell key={i} fill={BAR_PALETTE[i % BAR_PALETTE.length]} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* Top 5 sites du jour */}
                        {donnees.sites.filter(s => s.retraits_jour > 0).length > 0 && (
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                              Top 5 sites — retraits du jour
                            </p>
                            <div className="space-y-2">
                              {[...donnees.sites]
                                .filter(s => s.retraits_jour > 0)
                                .sort((a, b) => b.retraits_jour - a.retraits_jour)
                                .slice(0, 5)
                                .map((s, i) => (
                                  <div key={s.site} className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0
                                      ${i === 0 ? "bg-yellow-100 text-yellow-700" : i === 1 ? "bg-gray-100 text-gray-600" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-gray-50 text-gray-400"}`}>
                                      {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex justify-between mb-0.5">
                                        <span className="text-xs font-semibold text-gray-700 truncate">{s.site}</span>
                                        <span className="text-xs font-bold text-[#F77F00] ml-2 flex-shrink-0">{fmt(s.retraits_jour)}</span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div className="h-1.5 rounded-full bg-gradient-to-r from-[#F77F00] to-[#FF9E40]"
                                          style={{ width: `${Math.min((s.retraits_jour / Math.max(...donnees.sites.map(x => x.retraits_jour))) * 100, 100)}%` }} />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Onglet Coordinations */}
                {onglet === "coordinations" && (
                  <div className="overflow-auto rounded-xl border border-gray-100">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white sticky top-0">
                          <th className="px-3 py-2.5 text-left font-semibold">Coordination</th>
                          <th className="px-3 py-2.5 text-center font-semibold">Retraits du jour</th>
                          <th className="px-3 py-2.5 text-center font-semibold">Total retiré</th>
                          <th className="px-3 py-2.5 text-center font-semibold">Total cartes</th>
                          <th className="px-3 py-2.5 text-center font-semibold">Taux cumulé</th>
                        </tr>
                      </thead>
                      <tbody>
                        {donnees.coordinations.length === 0 ? (
                          <tr><td colSpan={5} className="text-center py-8 text-gray-400">Aucune donnée</td></tr>
                        ) : (
                          [...donnees.coordinations]
                            .sort((a, b) => b.retraits_jour - a.retraits_jour)
                            .map((c, i) => {
                              const taux = c.total_cartes > 0 ? (c.total_retires_cumul / c.total_cartes) * 100 : 0;
                              return (
                                <tr key={c.id || i}
                                  className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"} hover:bg-orange-50/30`}>
                                  <td className="px-3 py-2.5 font-semibold text-gray-700">{c.coordination || "—"}</td>
                                  <td className="px-3 py-2.5 text-center">
                                    <span className={`font-bold text-sm ${c.retraits_jour > 0 ? "text-[#F77F00]" : "text-gray-400"}`}>
                                      {fmt(c.retraits_jour)}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2.5 text-center font-bold text-green-700">{fmt(c.total_retires_cumul)}</td>
                                  <td className="px-3 py-2.5 text-center text-gray-600">{fmt(c.total_cartes)}</td>
                                  <td className="px-3 py-2.5 text-center">
                                    <span className="font-bold text-xs" style={{ color: tColor(taux) }}>{fmtTaux(taux)}</span>
                                  </td>
                                </tr>
                              );
                            })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Onglet Agences */}
                {onglet === "agences" && (
                  <div className="overflow-auto rounded-xl border border-gray-100">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gradient-to-r from-[#0d9488] to-[#2dd4bf] text-white sticky top-0">
                          <th className="px-3 py-2.5 text-left font-semibold">Agence</th>
                          <th className="px-3 py-2.5 text-left font-semibold">Coordination</th>
                          <th className="px-3 py-2.5 text-center font-semibold">Retraits du jour</th>
                          <th className="px-3 py-2.5 text-center font-semibold">Total retiré</th>
                          <th className="px-3 py-2.5 text-center font-semibold">Taux cumulé</th>
                        </tr>
                      </thead>
                      <tbody>
                        {donnees.agences.length === 0 ? (
                          <tr><td colSpan={5} className="text-center py-8 text-gray-400">Aucune donnée</td></tr>
                        ) : (
                          [...donnees.agences]
                            .sort((a, b) => b.retraits_jour - a.retraits_jour)
                            .map((a, i) => {
                              const taux = a.total_cartes > 0 ? (a.total_retires_cumul / a.total_cartes) * 100 : 0;
                              return (
                                <tr key={a.agence_id || i}
                                  className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"} hover:bg-teal-50/30`}>
                                  <td className="px-3 py-2.5 font-semibold text-gray-700">{a.agence || "—"}</td>
                                  <td className="px-3 py-2.5 text-gray-500 text-xs">{a.coordination || "—"}</td>
                                  <td className="px-3 py-2.5 text-center">
                                    <span className={`font-bold text-sm ${a.retraits_jour > 0 ? "text-teal-600" : "text-gray-400"}`}>
                                      {fmt(a.retraits_jour)}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2.5 text-center font-bold text-green-700">{fmt(a.total_retires_cumul)}</td>
                                  <td className="px-3 py-2.5 text-center">
                                    <span className="font-bold text-xs" style={{ color: tColor(taux) }}>{fmtTaux(taux)}</span>
                                  </td>
                                </tr>
                              );
                            })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Onglet Sites */}
                {onglet === "sites" && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Rechercher un site..."
                      value={searchSite}
                      onChange={e => setSearchSite(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F77F00]/30 focus:border-[#F77F00]"
                    />
                    <div className="overflow-auto rounded-xl border border-gray-100" style={{ maxHeight: 400 }}>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gradient-to-r from-[#7c3aed] to-[#6366f1] text-white sticky top-0">
                            <th className="px-3 py-2.5 text-left font-semibold">#</th>
                            <th className="px-3 py-2.5 text-left font-semibold">Site</th>
                            {isAdmin && <th className="px-3 py-2.5 text-left font-semibold">Coordination</th>}
                            <th className="px-3 py-2.5 text-center font-semibold">Retraits du jour</th>
                            <th className="px-3 py-2.5 text-center font-semibold">Total retiré</th>
                            <th className="px-3 py-2.5 text-center font-semibold">Taux cumulé</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sitesFiltres.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-8 text-gray-400">Aucun site trouvé</td></tr>
                          ) : (
                            [...sitesFiltres]
                              .sort((a, b) => b.retraits_jour - a.retraits_jour)
                              .map((s, i) => {
                                const taux = s.total_cartes > 0 ? (s.total_retires_cumul / s.total_cartes) * 100 : 0;
                                return (
                                  <tr key={`${s.site}-${i}`}
                                    className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"} hover:bg-violet-50/30`}>
                                    <td className="px-3 py-2.5 text-gray-400 w-8">{i + 1}</td>
                                    <td className="px-3 py-2.5 font-semibold text-gray-700 max-w-[160px] truncate" title={s.site}>{s.site}</td>
                                    {isAdmin && <td className="px-3 py-2.5 text-gray-500 max-w-[120px] truncate">{s.coordination || "—"}</td>}
                                    <td className="px-3 py-2.5 text-center">
                                      <span className={`font-bold text-sm ${s.retraits_jour > 0 ? "text-[#F77F00]" : "text-gray-300"}`}>
                                        {fmt(s.retraits_jour)}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2.5 text-center font-bold text-green-700">{fmt(s.total_retires_cumul)}</td>
                                    <td className="px-3 py-2.5 text-center">
                                      <span className="font-bold text-xs" style={{ color: tColor(taux) }}>{fmtTaux(taux)}</span>
                                    </td>
                                  </tr>
                                );
                              })
                          )}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-gray-400 text-right">
                      {sitesFiltres.filter(s => s.retraits_jour > 0).length} site(s) actifs ce jour · {sitesFiltres.length} total
                    </p>
                  </div>
                )}

              </div>
            )}

            {/* Pas de données */}
            {!loading && !donnees && !error && (
              <div className="text-center py-16 text-gray-400">
                <CalendarDaysIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Sélectionnez une date pour voir les statistiques</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DateStatistiques;