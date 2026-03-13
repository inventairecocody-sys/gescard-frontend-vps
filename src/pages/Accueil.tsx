// src/pages/Accueil.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
// ✅ Import de BACKEND_URL — source unique de vérité, s'adapte dev/prod automatiquement
import { BACKEND_URL } from '../Services/api/client';

/* ─────────────────────────────────────────
   Données
───────────────────────────────────────── */
const quotes = [
  'Ensemble, allons plus loin.',
  'Chaque carte distribuée rapproche notre objectif.',
  'Votre engagement fait la différence.',
  'Restons concentrés, restons efficaces.',
  'Une équipe soudée réussit toujours.',
  'Le professionnalisme est notre force.',
  "Aujourd'hui, faisons mieux qu'hier.",
  'Petit effort, grand résultat.',
];

const informations = [
  {
    tag: 'Opération',
    title: 'Opération Spéciale de Distribution',
    body: `Nous informons tous les chefs d'équipe ainsi que l'ensemble des opérateurs de la Coordination Abidjan Nord Cocody que débutera ce lundi 17 l'opération spéciale de distribution de grande ampleur lancée par notre direction.\n\nNous invitons chacun à se mobiliser pleinement afin d'assurer la distribution du maximum de cartes. Notre coordination doit figurer parmi les meilleures de Côte d'Ivoire.\n\nJe compte sur votre engagement et votre détermination pour atteindre nos objectifs.`,
    date: 'Lundi 17',
  },
  {
    tag: 'Général',
    title: 'Informations Générales',
    body: `La Coordination Abidjan Nord Cocody reste engagée dans l'amélioration continue de nos services. N'hésitez pas à remonter toutes suggestions d'amélioration.`,
    date: 'En cours',
  },
];

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

function formatDate(): string {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/* ─────────────────────────────────────────
   Composant principal
───────────────────────────────────────── */
const Accueil: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [infoIdx, setInfoIdx] = useState(0);
  const [infoDir, setInfoDir] = useState(1);
  const [time, setTime] = useState(new Date());

  /* Horloge temps réel */
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* Rotation automatique des informations */
  useEffect(() => {
    const t = setInterval(() => {
      setInfoDir(1);
      setInfoIdx(p => (p + 1) % informations.length);
    }, 10000);
    return () => clearInterval(t);
  }, []);

  const prevInfo = () => {
    setInfoDir(-1);
    setInfoIdx(p => (p - 1 + informations.length) % informations.length);
  };
  const nextInfo = () => {
    setInfoDir(1);
    setInfoIdx(p => (p + 1) % informations.length);
  };

  const displayName =
    user?.nomComplet || user?.nomUtilisateur || 'Utilisateur';
  const role = user?.role || '';

  /* Variants d'animation info */
  const slideVariants = {
    enter:  (d: number) => ({ opacity: 0, x: d * 40 }),
    center: { opacity: 1, x: 0 },
    exit:   (d: number) => ({ opacity: 0, x: d * -40 }),
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Outfit', sans-serif; }

        @keyframes tickerSlide {
          from { transform: translateX(100vw); }
          to   { transform: translateX(-100%); }
        }
        .ticker-quote {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          white-space: nowrap;
          color: rgba(255,255,255,.93);
          font-size: 13px;
          font-weight: 500;
          letter-spacing: .6px;
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-1 { animation: fadeSlideUp .55s cubic-bezier(.22,1,.36,1) .10s both; }
        .anim-2 { animation: fadeSlideUp .55s cubic-bezier(.22,1,.36,1) .22s both; }
        .anim-3 { animation: fadeSlideUp .55s cubic-bezier(.22,1,.36,1) .34s both; }
        .anim-4 { animation: fadeSlideUp .55s cubic-bezier(.22,1,.36,1) .46s both; }

        .card-hover {
          transition: box-shadow .25s, transform .25s;
        }
        .card-hover:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 50px rgba(0,0,0,.10);
        }

        .tag-pill {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 3px 10px;
          border-radius: 20px;
        }
      `}</style>

      <div className="min-h-screen" style={{ background: 'linear-gradient(145deg,#ecfdf5 0%,#ffffff 40%,#fff7ed 80%,#fefce8 100%)' }}>

        {/* ── Ticker séquentiel ── */}
        <div
          className="overflow-hidden relative"
          style={{ background: 'linear-gradient(90deg,#2E8B57,#0077B6)', height: 44 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={infoIdx % quotes.length}
              initial={{ x: '100vw' }}
              animate={{ x: '-110%' }}
              transition={{ duration: 12, ease: 'linear' }}
              onAnimationComplete={() => {
                setInfoIdx(p => p + 1);
              }}
              className="absolute inset-y-0 flex items-center"
              style={{ left: 0 }}
            >
              <span className="ticker-quote">
                <span style={{ color: 'rgba(255,255,255,.35)', fontSize: 18 }}>—</span>
                {quotes[infoIdx % quotes.length]}
                <span style={{ color: 'rgba(255,255,255,.35)', fontSize: 18 }}>—</span>
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Contenu principal ── */}
        <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">

          {/* ── Bloc héro : Présentation utilisateur ── */}
          <section className="anim-1">
            <div
              className="relative overflow-hidden rounded-3xl p-8 md:p-10"
              style={{
                background: 'linear-gradient(135deg, #F77F00 0%, #FF9E40 55%, #FFBF69 100%)',
                boxShadow: '0 8px 40px rgba(247,127,0,.22)',
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,.14) 1px,transparent 1px)', backgroundSize: '22px 22px' }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 120% 140% at 100% -10%, rgba(46,139,87,.22) 0%, transparent 55%)' }}
              />
              <div
                className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
                style={{ border: '2px solid rgba(255,255,255,.12)' }}
              />
              <div
                className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full pointer-events-none"
                style={{ border: '2px solid rgba(255,255,255,.08)' }}
              />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-4 mb-1 flex-wrap">
                    <p className="text-white/70 text-sm font-light tracking-widest uppercase">
                      {formatDate()}
                    </p>
                    <div className="flex items-center gap-2 bg-white/15 border border-white/25 px-3 py-1 rounded-full backdrop-blur-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse flex-shrink-0" />
                      <span className="text-white font-semibold text-sm tabular-nums tracking-widest">
                        {time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-white" style={{ textShadow: '0 2px 16px rgba(0,0,0,.12)' }}>
                      {getGreeting()}, {displayName}
                    </h1>
                    <button
                      onClick={() => navigate('/recherche')}
                      className="flex items-center gap-2.5 bg-white text-[#F77F00] font-bold text-sm px-6 py-3 rounded-full transition-all hover:scale-105 hover:shadow-xl flex-shrink-0 ml-4"
                      style={{ boxShadow: '0 6px 24px rgba(0,0,0,.18)', fontSize: '15px' }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                      Accéder à l'inventaire
                    </button>

                    {/* ✅ BACKEND_URL garantit l'absence de double /api */}
                    <a
                      href={`${BACKEND_URL}/api/updates/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-white/15 border border-white/30 text-white font-semibold text-sm px-5 py-3 rounded-full transition-all hover:bg-white/25 hover:scale-105 flex-shrink-0 backdrop-blur-sm"
                      style={{ fontSize: '14px' }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Télécharger le logiciel
                    </a>
                  </div>
                  {role && (
                    <span className="tag-pill bg-white/20 text-white border border-white/30">
                      {role}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ── Grille 2 colonnes : Message bienvenue + Informations ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ── Message de bienvenue ── */}
            <section className="anim-2">
              <div
                className="card-hover h-full bg-white rounded-3xl border p-7"
                style={{ borderColor: 'rgba(247,127,0,.15)', boxShadow: '0 4px 24px rgba(0,0,0,.06)' }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#F77F00,#FF9E40)' }}
                  >
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800 text-base">Message de Bienvenue</h2>
                    <p className="text-xs text-gray-400 font-light">De la Responsable</p>
                  </div>
                </div>

                <div className="h-px mb-5" style={{ background: 'linear-gradient(90deg,#F77F00,rgba(247,127,0,.05))' }} />

                <div className="space-y-3 text-gray-600 text-sm leading-relaxed">
                  <p><strong className="text-gray-800">Chers collaborateurs,</strong></p>
                  <p>
                    J'ai le plaisir de vous annoncer la mise en place de notre nouveau logiciel Web de recherche rapide de cartes GESCARD. Cette plateforme a été conçue pour faciliter et améliorer nos services de distribution, en permettant à chacun d'effectuer des recherches plus simples, plus rapides et plus efficaces.
                  </p>
                  <p>
                    Cet outil est désormais accessible à tous les membres de la coordination et constitue une étape importante dans la modernisation de notre travail au quotidien. Je vous encourage à l'utiliser pleinement afin d'optimiser nos performances et de mieux servir nos bénéficiaires.
                  </p>
                  <p>Bienvenue sur cette nouvelle plateforme, et merci pour votre engagement continu.</p>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end">
                  <p className="text-sm font-semibold" style={{ color: '#F77F00' }}>La Responsable</p>
                </div>
              </div>
            </section>

            {/* ── Informations défilantes ── */}
            <section className="anim-3">
              <div
                className="card-hover h-full bg-white rounded-3xl border p-7 flex flex-col"
                style={{ borderColor: 'rgba(0,119,182,.15)', boxShadow: '0 4px 24px rgba(0,0,0,.06)' }}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#0077B6,#2E8B57)' }}
                    >
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-800 text-base">Informations</h2>
                      <p className="text-xs text-gray-400 font-light">Coordination Abidjan Nord Cocody</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={prevInfo}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={nextInfo}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                    >
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="h-px mb-5" style={{ background: 'linear-gradient(90deg,#0077B6,rgba(0,119,182,.05))' }} />

                <div className="flex-1 overflow-hidden relative">
                  <AnimatePresence mode="wait" custom={infoDir}>
                    <motion.div
                      key={infoIdx}
                      custom={infoDir}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className="tag-pill text-white"
                          style={{ background: 'linear-gradient(135deg,#0077B6,#2E8B57)' }}
                        >
                          {informations[infoIdx].tag}
                        </span>
                        <span className="text-xs text-gray-400">{informations[infoIdx].date}</span>
                      </div>

                      <h3 className="font-bold text-gray-800 text-base mb-3">
                        {informations[infoIdx].title}
                      </h3>

                      <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                        {informations[infoIdx].body}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="flex justify-center gap-1.5 mt-5 pt-4 border-t border-gray-100">
                  {informations.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setInfoDir(i > infoIdx ? 1 : -1); setInfoIdx(i); }}
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: i === infoIdx ? 24 : 6,
                        background: i === infoIdx ? '#0077B6' : '#e5e7eb',
                      }}
                    />
                  ))}
                  <p className="ml-auto text-xs font-semibold text-[#2E8B57]">La Responsable</p>
                </div>
              </div>
            </section>
          </div>

        </main>

        {/* ── Footer ── */}
        <footer className="mt-10 border-t" style={{ borderColor: 'rgba(0,0,0,.06)' }}>
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-gray-400 font-light tracking-wide">
              © {new Date().getFullYear()} GESCARD — Coordination Abidjan Nord Cocody
            </p>
            <p className="text-xs text-gray-400 font-light">Simplicité, rapidité, maîtrise.</p>
            {/* ✅ BACKEND_URL garantit l'absence de double /api */}
            <a
              href={`${BACKEND_URL}/api/updates/download`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-[#F77F00] font-semibold hover:underline transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Télécharger GESCARD
            </a>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Accueil;