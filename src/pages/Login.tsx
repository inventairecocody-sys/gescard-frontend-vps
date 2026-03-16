import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { AuthService } from "../Services/api/auth";
import { UserIcon, LockClosedIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

interface LoginFormData {
  NomUtilisateur: string;
  MotDePasse: string;
}

type NotificationType = 'error' | 'warning' | 'success';

interface Notification {
  message: string;
  type: NotificationType;
}

const notificationStyles: Record<NotificationType, { container: string; badge: string; icon: string }> = {
  error: {
    container: 'bg-red-50 border-red-100 text-red-600',
    badge: 'bg-red-100 text-red-500',
    icon: '!',
  },
  warning: {
    container: 'bg-amber-50 border-amber-100 text-amber-700',
    badge: 'bg-amber-100 text-amber-600',
    icon: '!',
  },
  success: {
    container: 'bg-green-50 border-green-100 text-green-700',
    badge: 'bg-green-100 text-green-600',
    icon: '✓',
  },
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    NomUtilisateur: "",
    MotDePasse: "",
  });
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (notification) setNotification(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validations frontend — type warning (pas critique, juste un rappel)
    if (!formData.NomUtilisateur.trim()) {
      setNotification({ message: "Veuillez saisir votre nom d'utilisateur.", type: 'warning' });
      return;
    }
    if (!formData.MotDePasse) {
      setNotification({ message: 'Veuillez saisir votre mot de passe.', type: 'warning' });
      return;
    }

    setIsLoading(true);
    setNotification(null);

    try {
      const response = await AuthService.login(formData);
      setNotification({ message: 'Connexion réussie ! Redirection en cours...', type: 'success' });
      setAuth(response.token, response.utilisateur.role, response.utilisateur);
      setTimeout(() => navigate('/home'), 900);
    } catch (err: any) {
      const status = err.response?.status;

      if (status === 401) {
        setNotification({
          message: 'Identifiant ou mot de passe incorrect. Veuillez réessayer.',
          type: 'error',
        });
      } else if (status === 403) {
        setNotification({
          message: 'Votre compte est désactivé. Contactez un administrateur.',
          type: 'error',
        });
      } else if (status === 429) {
        setNotification({
          message: 'Trop de tentatives. Veuillez patienter quelques instants.',
          type: 'warning',
        });
      } else if (err.code === 'ERR_NETWORK') {
        setNotification({
          message: 'Serveur inaccessible. Vérifiez votre connexion réseau.',
          type: 'error',
        });
      } else {
        setNotification({
          message: 'Une erreur est survenue. Réessayez dans un moment.',
          type: 'error',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Outfit', sans-serif; }

        @keyframes blob {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(40px,-60px) scale(1.12); }
          66%      { transform: translate(-25px,30px) scale(0.88); }
        }
        .animate-blob  { animation: blob 14s ease-in-out infinite; }
        .blob-delay-1  { animation-delay: 2.5s; }
        .blob-delay-2  { animation-delay: 5s;   }
        .blob-delay-3  { animation-delay: 7.5s; }
        .blob-delay-4  { animation-delay: 3.5s; }
        .blob-delay-5  { animation-delay: 1s;   }

        @keyframes floatLogo {
          0%,100% { transform: translateY(0)   scale(1);    }
          50%      { transform: translateY(-9px) scale(1.03); }
        }
        .animate-float-logo { animation: floatLogo 6s ease-in-out infinite; }

        @keyframes floatLeft {
          0%,100% { transform: translateY(0)    rotate(-4deg); }
          50%      { transform: translateY(-20px) rotate(-4deg); }
        }
        .animate-float-left { animation: floatLeft 7s ease-in-out infinite; }

        @keyframes floatRightTop {
          0%,100% { transform: translateY(0)    rotate(4deg); }
          50%      { transform: translateY(-18px) rotate(4deg); }
        }

        @keyframes floatRightBot {
          0%,100% { transform: translateY(0)    rotate(-5deg); }
          50%      { transform: translateY(-14px) rotate(-5deg); }
        }

        @keyframes floatDot {
          0%,100% { transform: translateY(0);    opacity: 1;   }
          50%      { transform: translateY(-18px); opacity: .45; }
        }

        @keyframes dash {
          from { stroke-dashoffset: 900; }
          to   { stroke-dashoffset: 0;   }
        }
        .svg-line { fill: none; stroke-dasharray: 5 18; animation: dash 28s linear infinite; }

        .input-login {
          background: rgba(249,250,251,.85);
          border: 1.5px solid #e5e7eb;
          transition: all .25s ease;
        }
        .input-login:focus {
          background: #fff;
          border-color: #F77F00;
          box-shadow: 0 0 0 4px rgba(247,127,0,.09), 0 2px 8px rgba(247,127,0,.12);
          outline: none;
        }
        .input-login.input-warning {
          border-color: #F59E0B;
          box-shadow: 0 0 0 3px rgba(245,158,11,.10);
        }

        .btn-login {
          background: linear-gradient(135deg, #F77F00 0%, #FF9E40 50%, #FFBF69 100%);
          background-size: 200% auto;
          transition: all .3s ease;
          box-shadow: 0 4px 22px rgba(247,127,0,.38);
        }
        .btn-login:hover:not(:disabled) {
          background-position: right center;
          box-shadow: 0 8px 30px rgba(247,127,0,.55);
          transform: translateY(-1px);
        }
        .btn-login:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 4px 15px rgba(247,127,0,.3);
        }
        .btn-login:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      <div
        className="relative min-h-screen overflow-hidden flex items-center justify-center"
        style={{ background: "linear-gradient(145deg, #ecfdf5 0%, #ffffff 38%, #fff7ed 72%, #fefce8 100%)" }}
      >

        {/* Grille de points */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(74,222,128,.18) 1.2px, transparent 1.2px)",
            backgroundSize: "30px 30px",
          }}
        />

        {/* Blobs avec parallax */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)`,
            transition: "transform .15s ease-out",
          }}
        >
          <div className="absolute animate-blob rounded-full pointer-events-none"
            style={{ width:600, height:600, background:"radial-gradient(circle,#86efac,#4ade80)", opacity:.17, top:"-18%", left:"-12%", filter:"blur(110px)" }} />
          <div className="absolute animate-blob blob-delay-1 rounded-full pointer-events-none"
            style={{ width:440, height:440, background:"radial-gradient(circle,#bbf7d0,#6ee7b7)", opacity:.15, top:"54%", right:"-13%", filter:"blur(110px)" }} />
          <div className="absolute animate-blob blob-delay-2 rounded-full pointer-events-none"
            style={{ width:400, height:400, background:"radial-gradient(circle,#fed7aa,#fb923c)", opacity:.11, bottom:"-10%", left:"10%", filter:"blur(110px)" }} />
          <div className="absolute animate-blob blob-delay-3 rounded-full pointer-events-none"
            style={{ width:310, height:310, background:"radial-gradient(circle,#fde68a,#fbbf24)", opacity:.14, top:"12%", left:"50%", filter:"blur(110px)" }} />
          <div className="absolute animate-blob blob-delay-4 rounded-full pointer-events-none"
            style={{ width:250, height:250, background:"radial-gradient(circle,#a7f3d0,#34d399)", opacity:.12, top:"40%", left:"3%", filter:"blur(110px)" }} />
          <div className="absolute animate-blob blob-delay-5 rounded-full pointer-events-none"
            style={{ width:190, height:190, background:"radial-gradient(circle,#fed7aa,#F77F00)", opacity:.09, top:"4%", right:"4%", filter:"blur(110px)" }} />
        </div>

        {/* Lignes SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path className="svg-line" d="M-100,300 C200,80 500,520 900,200 S1300,420 1800,150"   stroke="rgba(74,222,128,.11)"  strokeWidth="1.5" />
          <path className="svg-line" d="M-100,530 C250,310 550,710 950,430 S1350,610 1800,330"  stroke="rgba(74,222,128,.07)"  strokeWidth="1"   style={{ animationDelay:"7s" }} />
          <path className="svg-line" d="M0,740 C300,520 650,840 1050,640 S1450,780 1820,520"    stroke="rgba(247,127,0,.06)"   strokeWidth="1.2" style={{ animationDelay:"14s" }} />
          <path className="svg-line" d="M150,40 C400,260 730,10 1050,220 S1430,60 1720,270"     stroke="rgba(74,222,128,.06)"  strokeWidth="1"   style={{ animationDelay:"3.5s" }} />
          <path className="svg-line" d="M0,165 C300,365 600,65 900,315 S1300,115 1700,415"      stroke="rgba(251,191,36,.05)"  strokeWidth="1"   style={{ animationDelay:"10s" }} />
          <path className="svg-line" d="M-80,640 C150,420 450,750 800,560 S1200,700 1600,480"   stroke="rgba(134,197,134,.08)" strokeWidth="1"   style={{ animationDelay:"5s" }} />
        </svg>

        {/* Hexagones */}
        <svg className="absolute pointer-events-none hidden md:block" style={{ top:"5%", right:"17%", width:78, height:78, opacity:.08 }} viewBox="0 0 100 100">
          <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="#4ade80" strokeWidth="2.5" />
        </svg>
        <svg className="absolute pointer-events-none hidden md:block" style={{ bottom:"11%", left:"13%", width:58, height:58, opacity:.08 }} viewBox="0 0 100 100">
          <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="#F77F00" strokeWidth="2.5" />
        </svg>
        <svg className="absolute pointer-events-none hidden md:block" style={{ top:"34%", right:"1.5%", width:42, height:42, opacity:.06 }} viewBox="0 0 100 100">
          <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="#86efac" />
        </svg>
        <svg className="absolute pointer-events-none hidden md:block" style={{ top:"55%", left:"1%", width:34, height:34, opacity:.07 }} viewBox="0 0 100 100">
          <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="#fbbf24" strokeWidth="2" />
        </svg>

        {/* Formes géométriques */}
        <div className="absolute pointer-events-none hidden md:block" style={{ width:360, height:360, border:"2px solid rgba(74,222,128,.11)", top:-90, left:-90, borderRadius:60, transform:"rotate(15deg)" }} />
        <div className="absolute pointer-events-none hidden md:block" style={{ width:260, height:260, border:"1.5px solid rgba(247,127,0,.08)", bottom:-65, right:-65, borderRadius:48, transform:"rotate(-18deg)" }} />
        <div className="absolute pointer-events-none hidden md:block" style={{ width:150, height:150, background:"linear-gradient(135deg,rgba(134,197,134,.10),rgba(74,222,128,.04))", top:"7%", right:"5%", borderRadius:30, transform:"rotate(10deg)" }} />
        <div className="absolute pointer-events-none hidden md:block" style={{ width:95, height:95, background:"linear-gradient(135deg,rgba(247,127,0,.09),rgba(251,191,36,.04))", bottom:"9%", left:"4%", borderRadius:22, transform:"rotate(-28deg)" }} />
        <div className="absolute pointer-events-none hidden md:block" style={{ width:68, height:68, border:"1.5px solid rgba(74,222,128,.18)", top:"43%", right:"2.5%", borderRadius:16, transform:"rotate(7deg)" }} />
        <div className="absolute pointer-events-none hidden md:block" style={{ width:52, height:52, border:"1.5px solid rgba(247,127,0,.11)", top:"19%", left:"2%", borderRadius:13, transform:"rotate(-12deg)" }} />
        <div className="absolute pointer-events-none hidden md:block" style={{ width:115, height:115, border:"1px solid rgba(134,197,134,.11)", bottom:"18%", right:"7%", borderRadius:26, transform:"rotate(22deg)" }} />

        {/* Cercles concentriques */}
        <div className="absolute rounded-full pointer-events-none hidden md:block" style={{ width:240, height:240, border:"1.5px solid rgba(74,222,128,.15)", top:6, right:20 }} />
        <div className="absolute rounded-full pointer-events-none hidden md:block" style={{ width:155, height:155, border:"1px solid rgba(74,222,128,.09)", top:48, right:63 }} />
        <div className="absolute rounded-full pointer-events-none hidden md:block" style={{ width:76, height:76, border:"1px solid rgba(74,222,128,.16)", top:93, right:106 }} />
        <div className="absolute rounded-full pointer-events-none hidden md:block" style={{ width:190, height:190, border:"1.5px solid rgba(247,127,0,.09)", bottom:20, left:16 }} />
        <div className="absolute rounded-full pointer-events-none hidden md:block" style={{ width:115, height:115, border:"1px solid rgba(247,127,0,.07)", bottom:58, left:52 }} />
        <div className="absolute rounded-full pointer-events-none hidden md:block" style={{ width:56, height:56, border:"1px solid rgba(247,127,0,.10)", bottom:97, left:90 }} />

        {/* Points flottants */}
        {[
          { w:12, bg:"rgba(74,222,128,.38)",  t:"10%", l:"7%",  dur:5.2, del:0   },
          { w:7,  bg:"rgba(74,222,128,.26)",  t:"23%", l:"28%", dur:7,   del:.8  },
          { w:14, bg:"rgba(247,127,0,.16)",   t:"68%", l:"78%", dur:6.5, del:1.5 },
          { w:8,  bg:"rgba(74,222,128,.28)",  t:"83%", l:"17%", dur:8,   del:2.4 },
          { w:6,  bg:"rgba(247,127,0,.14)",   t:"37%", l:"92%", dur:5.8, del:.4  },
          { w:10, bg:"rgba(74,222,128,.20)",  t:"56%", l:"54%", dur:7.2, del:3.1 },
          { w:5,  bg:"rgba(251,191,36,.26)",  t:"17%", l:"72%", dur:6,   del:1.2 },
          { w:11, bg:"rgba(74,222,128,.20)",  t:"77%", l:"40%", dur:9,   del:.6  },
          { w:7,  bg:"rgba(247,127,0,.18)",   t:"30%", l:"2%",  dur:6.8, del:2   },
          { w:9,  bg:"rgba(74,222,128,.26)",  t:"60%", l:"94%", dur:5.5, del:1.8 },
          { w:6,  bg:"rgba(251,191,36,.20)",  t:"49%", l:"23%", dur:7.5, del:4   },
          { w:8,  bg:"rgba(247,127,0,.11)",   t:"91%", l:"61%", dur:6.2, del:3.5 },
        ].map((d, i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none hidden md:block"
            style={{
              width: d.w, height: d.w,
              background: d.bg,
              top: d.t, left: d.l,
              animation: `floatDot ${d.dur}s ease-in-out ${d.del}s infinite`,
            }}
          />
        ))}

        {/* ══ Image décorative GAUCHE — centre ══ */}
        <div className="absolute left-[3.5%] top-1/2 -translate-y-1/2 z-10 hidden xl:block">
          <div className="animate-float-left relative">
            <img
              src="/decorative-image.jpeg"
              alt="Illustration GESCARD"
              className="w-56 h-56 object-cover rounded-[30px]"
              style={{ boxShadow: "0 24px 60px rgba(0,0,0,.12), 0 0 0 2px rgba(74,222,128,.16)" }}
            />
            <div className="absolute pointer-events-none" style={{ inset:-12, borderRadius:42, border:"1.5px dashed rgba(74,222,128,.28)" }} />
            <div className="absolute pointer-events-none" style={{ inset:-24, borderRadius:54, border:"1px dashed rgba(74,222,128,.14)" }} />
          </div>
        </div>

        {/* ══ Image décorative DROITE — haut ══ */}
        <div className="absolute right-[3.5%] top-[10%] z-10 hidden xl:block">
          <div className="relative" style={{ animation: "floatRightTop 8s ease-in-out 1.5s infinite" }}>
            <img
              src="/decorative-image.jpeg"
              alt="Illustration GESCARD"
              className="w-48 h-48 object-cover rounded-[26px]"
              style={{
                boxShadow: "0 20px 55px rgba(0,0,0,.12), 0 0 0 2px rgba(247,127,0,.16)",
                transform: "rotate(4deg)",
              }}
            />
            <div className="absolute pointer-events-none" style={{ inset:-12, borderRadius:36, border:"1.5px dashed rgba(247,127,0,.26)", transform:"rotate(4deg)" }} />
            <div className="absolute pointer-events-none" style={{ inset:-22, borderRadius:46, border:"1px dashed rgba(247,127,0,.12)", transform:"rotate(4deg)" }} />
          </div>
        </div>

        {/* ══ Image décorative DROITE — bas (logo) ══ */}
        <div className="absolute right-[5%] bottom-[8%] z-10 hidden xl:block">
          <div className="relative" style={{ animation: "floatRightBot 7s ease-in-out 3s infinite" }}>
            <img
              src="/logo-placeholder.jpeg"
              alt="Logo GESCARD"
              className="w-32 h-32 object-contain rounded-[22px] bg-white"
              style={{
                boxShadow: "0 16px 44px rgba(0,0,0,.10), 0 0 0 2px rgba(74,222,128,.16)",
                transform: "rotate(-5deg)",
                padding: "10px",
              }}
            />
            <div className="absolute pointer-events-none" style={{ inset:-10, borderRadius:30, border:"1.5px dashed rgba(74,222,128,.26)", transform:"rotate(-5deg)" }} />
            <div className="absolute pointer-events-none" style={{ inset:-20, borderRadius:40, border:"1px dashed rgba(74,222,128,.12)", transform:"rotate(-5deg)" }} />
          </div>
        </div>

        {/* ══ Carte de connexion ══ */}
        <div className="relative z-10 w-full max-w-md px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: "rgba(255,255,255,.98)",
              borderRadius: 28,
              overflow: "hidden",
              boxShadow: "0 0 0 1px rgba(74,222,128,.14), 0 24px 70px rgba(0,0,0,.10), 0 0 100px rgba(134,197,134,.07)",
            }}
          >

            {/* Header orange */}
            <div
              className="relative px-8 py-8 text-center overflow-hidden"
              style={{ background: "linear-gradient(135deg, #F77F00 0%, #FF9E40 55%, #FFBF69 100%)" }}
            >
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse 120% 140% at 95% -5%, rgba(74,222,128,.26) 0%, transparent 52%)" }} />
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse 90% 80% at 50% 130%, rgba(255,255,255,.18) 0%, transparent 65%)" }} />
              <div className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,.17) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
              <div className="absolute pointer-events-none"
                style={{ bottom:-55, left:"50%", transform:"translateX(-50%)", width:210, height:110, border:"2px solid rgba(255,255,255,.10)", borderRadius:"0 0 110px 110px" }} />

              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.25, type: "spring", stiffness: 200, damping: 15 }}
                className="relative z-10 flex justify-center mb-4"
              >
                <div
                  className="animate-float-logo flex items-center justify-center overflow-hidden"
                  style={{
                    width: 88, height: 88, borderRadius: 24,
                    background: "#fff",
                    boxShadow: "0 10px 40px rgba(0,0,0,.20), 0 0 0 3px rgba(255,255,255,.55)",
                  }}
                >
                  <img
                    src="/logo-placeholder.jpeg"
                    alt="Logo GESCARD"
                    style={{ width: "80%", height: "80%", objectFit: "contain" }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative z-10"
              >
                <h1 className="text-3xl font-bold mb-1 text-white tracking-widest"
                  style={{ textShadow: "0 2px 18px rgba(0,0,0,.18)" }}>
                  GESCARD
                </h1>
                <p className="text-white/75 text-xs font-light tracking-[4px] uppercase">
                  Gestion des Cartes
                </p>
              </motion.div>
            </div>

            {/* Formulaire */}
            <div className="px-8 py-8">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-400 text-sm mb-6 text-center font-light"
              >
                Connectez-vous à votre espace
              </motion.p>

              <form onSubmit={handleSubmit} className="space-y-5">

                <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 }}>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-2 uppercase tracking-widest">
                    Nom d'utilisateur
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                    <input
                      name="NomUtilisateur"
                      type="text"
                      value={formData.NomUtilisateur}
                      onChange={handleChange}
                      placeholder="Votre identifiant"
                      className={`input-login w-full pl-11 pr-4 py-3.5 rounded-xl text-gray-800 text-sm font-medium placeholder:text-gray-300 placeholder:font-normal ${
                        notification?.type === 'warning' && !formData.NomUtilisateur.trim() ? 'input-warning' : ''
                      }`}
                      disabled={isLoading}
                      autoComplete="username"
                    />
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.62 }}>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-2 uppercase tracking-widest">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                    <input
                      name="MotDePasse"
                      type={showPassword ? "text" : "password"}
                      value={formData.MotDePasse}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`input-login w-full pl-11 pr-12 py-3.5 rounded-xl text-gray-800 text-sm font-medium placeholder:text-gray-300 placeholder:font-normal ${
                        notification?.type === 'warning' && !formData.MotDePasse ? 'input-warning' : ''
                      }`}
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#F77F00] transition-colors text-base leading-none"
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </motion.div>

                {/* Bloc notification — erreur / warning / succès */}
                <AnimatePresence mode="wait">
                  {notification && (
                    <motion.div
                      key={notification.message}
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm border ${notificationStyles[notification.type].container}`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${notificationStyles[notification.type].badge}`}>
                        {notificationStyles[notification.type].icon}
                      </span>
                      <span className="font-medium">{notification.message}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-login w-full py-3.5 text-white font-semibold rounded-xl flex items-center justify-center gap-2.5"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span>Connexion en cours...</span>
                      </>
                    ) : (
                      <>
                        <span>Se connecter</span>
                        <ArrowRightIcon className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </motion.div>
              </form>

              <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-300 font-light tracking-wider">
                  © {new Date().getFullYear()} GESCARD — Tous droits réservés
                </p>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </>
  );
};

export default Login;