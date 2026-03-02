import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { AuthService } from "../Services/api/auth";
import { UserIcon, LockClosedIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

interface LoginFormData {
  NomUtilisateur: string;
  MotDePasse: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    NomUtilisateur: "",
    MotDePasse: ""
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Détection responsive
  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!formData.NomUtilisateur.trim()) {
      setErrorMessage("Nom d'utilisateur requis");
      return;
    }
    if (!formData.MotDePasse) {
      setErrorMessage("Mot de passe requis");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await AuthService.login(formData);
      setAuth(response.token, response.utilisateur.role, response.utilisateur);
      navigate('/home');
    } catch (err: any) {
      console.error("Erreur de connexion:", err);

      if (err.response?.status === 401) {
        setErrorMessage("Identifiants incorrects");
      } else if (err.response?.status === 403) {
        setErrorMessage("Compte désactivé");
      } else if (err.code === 'ERR_NETWORK') {
        setErrorMessage("Serveur inaccessible");
      } else {
        setErrorMessage("Erreur de connexion");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Classes responsives
  const containerClass = isMobile ? 'px-4 py-4' : 'px-6 py-8';
  const logoSize = isMobile ? 'w-16 h-16' : 'w-20 h-20';
  const titleSize = isMobile ? 'text-2xl' : 'text-3xl';
  const inputClass = isMobile 
    ? 'w-full px-4 py-3 text-sm pl-10' 
    : 'w-full px-5 py-4 text-base pl-12';
  const buttonClass = isMobile 
    ? 'w-full py-3 text-sm font-semibold' 
    : 'w-full py-4 text-base font-semibold';
  const iconSize = isMobile ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
      
      {/* Conteneur centré */}
      <div className={`w-full max-w-md ${containerClass}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        >
          {/* En-tête avec logo */}
          <div className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] p-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex justify-center mb-3"
            >
              <div className={`${logoSize} bg-white rounded-2xl flex items-center justify-center shadow-lg`}>
                <img 
                  src="/logo-placeholder.jpeg" 
                  alt="Logo GESCARD" 
                  className="w-3/4 h-3/4 object-contain"
                />
              </div>
            </motion.div>
            <h1 className={`${titleSize} font-bold text-white mb-1`}>GESCARD</h1>
            <p className="text-white/90 text-sm">Gestion des Cartes</p>
          </div>

          {/* Formulaire */}
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Nom d'utilisateur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nom d'utilisateur
                </label>
                <div className="relative">
                  <UserIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${iconSize}`} />
                  <input
                    name="NomUtilisateur"
                    type="text"
                    value={formData.NomUtilisateur}
                    onChange={handleChange}
                    placeholder="Votre identifiant"
                    className={`${inputClass} bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all duration-300`}
                    disabled={isLoading}
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <LockClosedIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${iconSize}`} />
                  <input
                    name="MotDePasse"
                    type={showPassword ? "text" : "password"}
                    value={formData.MotDePasse}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`${inputClass} bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all duration-300 pr-10`}
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#F77F00] transition-colors"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Message d'erreur élégant */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500">•</span>
                    <span>{errorMessage}</span>
                  </div>
                </motion.div>
              )}

              {/* Bouton de connexion */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`${buttonClass} bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white rounded-xl hover:from-[#e46f00] hover:to-[#FF8C00] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Connexion...</span>
                  </>
                ) : (
                  <>
                    <span>Se connecter</span>
                    <ArrowRightIcon className={iconSize} />
                  </>
                )}
              </motion.button>
            </form>

            {/* Ligne discrète */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-center text-xs text-gray-400">
                © 2025 GESCARD
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Comptes de test - UNIQUEMENT en développement */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
          <div className="space-y-1">
            <button 
              onClick={() => setFormData({ NomUtilisateur: 'UFHB02', MotDePasse: '123456' })}
              className="w-full text-left px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded text-gray-600 text-xs"
            >
              Admin
            </button>
            <button 
              onClick={() => setFormData({ NomUtilisateur: 'UFHB01', MotDePasse: '123456' })}
              className="w-full text-left px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded text-gray-600 text-xs"
            >
              Gestionnaire
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;