import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { AuthService } from "../Services/api/auth";
import { TokenService } from "../Services/storage/token";
import { UserIcon, LockClosedIcon, ArrowRightIcon, WifiIcon, ServerIcon } from '@heroicons/react/24/outline';

interface LoginFormData {
  NomUtilisateur: string;
  MotDePasse: string;
}

type LoginErrorType = 
  | 'identifiants_invalides' 
  | 'utilisateur_introuvable' 
  | 'erreur_serveur' 
  | 'erreur_reseau' 
  | 'erreur_validation' 
  | 'compte_bloque' 
  | '';

type ApiStatus = 'verification' | 'en_ligne' | 'hors_ligne';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    NomUtilisateur: "",
    MotDePasse: ""
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [errorType, setErrorType] = useState<LoginErrorType>('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus>('verification');
  const [showPassword, setShowPassword] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Détection responsive
  useEffect(() => {
    const checkScreen = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  // ✅ CORRECTION CRITIQUE - Vérification API sans boucle
  useEffect(() => {
    const checkApiConnection = async () => {
      // Vérifier si on a un token
      const token = TokenService.getToken();
      
      if (!token) {
        // Pas de token = API considérée comme disponible
        setApiStatus('en_ligne');
        return;
      }

      try {
        await AuthService.verifyToken();
        setApiStatus('en_ligne');
      } catch {
        setApiStatus('hors_ligne');
      }
    };
    
    checkApiConnection();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errorMessage) {
      setErrorMessage("");
      setErrorType('');
    }
  };

  const validateForm = (): { valide: boolean; erreur?: string; type?: LoginErrorType } => {
    const username = formData.NomUtilisateur.trim();
    const password = formData.MotDePasse;

    if (!username) {
      return { 
        valide: false, 
        erreur: "Le nom d'utilisateur est obligatoire", 
        type: 'erreur_validation' 
      };
    }
    if (!password) {
      return { 
        valide: false, 
        erreur: "Le mot de passe est obligatoire", 
        type: 'erreur_validation' 
      };
    }
    if (password.length < 6) {
      return { 
        valide: false, 
        erreur: "Le mot de passe doit contenir au moins 6 caractères", 
        type: 'erreur_validation' 
      };
    }
    return { valide: true };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const validation = validateForm();
    if (!validation.valide) {
      setErrorMessage(validation.erreur!);
      setErrorType(validation.type!);
      return;
    }

    if (attemptCount >= 5) {
      setErrorMessage("Trop de tentatives. Réessayez dans 15 minutes.");
      setErrorType('compte_bloque');
      return;
    }

    if (apiStatus !== 'en_ligne') {
      setErrorMessage("Serveur inaccessible. Veuillez réessayer plus tard.");
      setErrorType('erreur_reseau');
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setErrorType('');

    try {
      const response = await AuthService.login(formData);
      setAuth(response.token, response.utilisateur.role, response.utilisateur);
      
      // ✅ CORRIGÉ: Rediriger vers HOME au lieu de DASHBOARD
      navigate('/home');
    } catch (err: any) {
      console.error("Erreur de connexion:", err);
      const nouvellesTentatives = attemptCount + 1;
      setAttemptCount(nouvellesTentatives);

      let messageUtilisateur = "Erreur de connexion";
      let typeErreur: LoginErrorType = 'erreur_serveur';

      if (err.response) {
        const status = err.response.status;
        if (status === 401) {
          messageUtilisateur = "Nom d'utilisateur ou mot de passe incorrect";
          typeErreur = 'identifiants_invalides';
          if (nouvellesTentatives >= 3) {
            messageUtilisateur += ` (${5 - nouvellesTentatives} tentative(s) restante(s))`;
          }
        } else if (status === 403) {
          messageUtilisateur = "Compte désactivé. Contactez l'administrateur.";
          typeErreur = 'compte_bloque';
        } else if (status === 500) {
          messageUtilisateur = "Erreur serveur. Contactez l'administrateur.";
          typeErreur = 'erreur_serveur';
        }
      } else if (err.request) {
        messageUtilisateur = "Impossible de contacter le serveur. Vérifiez votre connexion.";
        typeErreur = 'erreur_reseau';
      }

      setErrorMessage(messageUtilisateur);
      setErrorType(typeErreur);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryConnection = () => {
    window.location.reload();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const fillTestAccount = (username: string, password: string) => {
    setFormData({ NomUtilisateur: username, MotDePasse: password });
  };

  // Classes responsives
  const getIconSize = () => {
    if (isMobile) return 'w-4 h-4';
    if (isTablet) return 'w-5 h-5';
    return 'w-6 h-6';
  };

  const getTextSize = () => {
    if (isMobile) return 'text-xs';
    if (isTablet) return 'text-sm';
    return 'text-base';
  };

  const getInputSize = () => {
    if (isMobile) return 'px-4 py-3 text-sm';
    if (isTablet) return 'px-5 py-4';
    return 'px-6 py-5';
  };

  const getButtonSize = () => {
    if (isMobile) return 'py-3 text-sm';
    if (isTablet) return 'py-4';
    return 'py-5';
  };

  const getLogoSize = () => {
    if (isMobile) return 'w-12 h-12';
    if (isTablet) return 'w-16 h-16';
    return 'w-20 h-20';
  };

  const getTitleSize = () => {
    if (isMobile) return 'text-xl';
    if (isTablet) return 'text-2xl';
    return 'text-3xl';
  };

  const iconSize = getIconSize();
  const textSize = getTextSize();
  const inputSize = getInputSize();
  const buttonSize = getButtonSize();
  const logoSize = getLogoSize();
  const titleSize = getTitleSize();

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col ${isMobile ? 'text-sm' : ''}`}>
      {/* Barre de statut API */}
      <div className={`fixed top-0 left-0 right-0 z-50 py-2 px-4 text-center flex items-center justify-between ${
        apiStatus === 'en_ligne' ? 'bg-green-100 text-green-800' : 
        apiStatus === 'verification' ? 'bg-yellow-100 text-yellow-800' : 
        'bg-red-100 text-red-800'
      }`}>
        <div className="flex items-center space-x-2 overflow-hidden">
          <WifiIcon className={`${iconSize} flex-shrink-0`} />
          <span className={`truncate ${textSize}`}>
            {apiStatus === 'en_ligne' && 'Serveur connecté'}
            {apiStatus === 'verification' && 'Vérification du serveur...'}
            {apiStatus === 'hors_ligne' && 'Serveur indisponible'}
          </span>
        </div>
        {apiStatus !== 'verification' && (
          <button 
            onClick={handleRetryConnection}
            className={`${textSize} px-2 py-1 rounded bg-white bg-opacity-50 hover:bg-opacity-100 transition-all`}
          >
            Rafraîchir
          </button>
        )}
      </div>

      {/* Espace pour la barre de statut */}
      <div className="h-8 md:h-10"></div>

      {/* HEADER */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between px-4 md:px-8 lg:px-12 py-3">
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="relative">
              <img 
                src="/logo-placeholder.jpeg" 
                alt="Logo GESCARD" 
                className={`${logoSize} object-contain drop-shadow-sm`}
                loading="eager" 
              />
              <div className={`absolute -top-1 -right-1 ${isMobile ? 'w-3 h-3' : 'w-4 h-4 md:w-5 md:h-5'} bg-[#F77F00] rounded-full border-2 border-white`}></div>
            </div>
            <div>
              <h1 className={`${isMobile ? 'text-lg' : 'text-xl md:text-2xl'} font-bold text-gray-800 leading-tight`}>
                GESCARD
              </h1>
              <p className={`text-[#F77F00] ${isMobile ? 'text-xs' : 'text-sm md:text-base'} font-semibold`}>
                Gestion des Cartes
              </p>
            </div>
          </div>
          <div className={`${isMobile ? 'hidden' : 'flex'} items-center space-x-2 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white px-4 py-2 rounded-full shadow-lg`}>
            <ServerIcon className="w-4 h-4" />
            <span className="text-sm font-medium">v2.0.0</span>
          </div>
        </div>
        <div className="flex h-1 w-full bg-gradient-to-r from-[#F77F00] via-[#2E8B57] to-[#0077B6]"></div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 flex items-center justify-center px-3 md:px-6 lg:px-8 py-4 md:py-8">
        <div className="w-full max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4 }}
            className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12'} items-center`}
          >
            {/* Zone gauche - Présentation */}
            <div className={`text-center ${isMobile ? '' : 'lg:text-left'} space-y-4 md:space-y-8`}>
              <motion.div 
                initial={{ opacity: 0, x: -30 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 0.2, duration: 0.6 }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-orange-50 to-blue-50 rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-xl border border-orange-100">
                  <img 
                    src="/decorative-image.jpeg" 
                    alt="Interface GESCARD" 
                    className={`w-full ${isMobile ? 'h-40' : 'h-48 md:h-64'} object-cover rounded-xl md:rounded-2xl shadow-lg border-2 border-orange-200`}
                    loading="lazy" 
                  />
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.3, duration: 0.6 }}
                className="space-y-3 md:space-y-6"
              >
                <h2 className={`font-bold text-gray-900 leading-tight ${titleSize}`}>
                  Bienvenue sur{" "}
                  <span className="bg-gradient-to-r from-[#F77F00] to-[#0077B6] bg-clip-text text-transparent">
                    GESCARD
                  </span>
                </h2>
                <p className={`text-gray-600 leading-relaxed max-w-2xl ${textSize}`}>
                  Solution complète pour la gestion et le suivi des cartes de la coordination.
                </p>
                <div className={`flex flex-wrap ${isMobile ? 'gap-2' : 'gap-3'} justify-center lg:justify-start`}>
                  {[
                    "Recherche rapide", 
                    "Gestion centralisée", 
                    "Mise à jour instantanée", 
                    "Statistiques détaillées"
                  ].map((feature, index) => (
                    <motion.span 
                      key={feature}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className={`bg-white/80 backdrop-blur-sm border border-orange-200 ${
                        isMobile ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm'
                      } rounded-full font-medium text-gray-700 shadow-sm`}
                    >
                      {feature}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Zone droite - Formulaire */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative"
            >
              <div className={`bg-white/90 backdrop-blur-lg ${
                isMobile ? 'rounded-xl p-4' : 'rounded-3xl p-6 md:p-8 lg:p-10'
              } shadow-xl md:shadow-2xl border border-orange-100`}>
                {/* En-tête du formulaire */}
                <div className="text-center mb-6 md:mb-8">
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    transition={{ delay: 0.4, type: "spring" }}
                    className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} bg-gradient-to-r from-[#F77F00] to-[#FF9E40] ${
                      isMobile ? 'rounded-xl' : 'rounded-2xl'
                    } flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg`}
                  >
                    <LockClosedIcon className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-white`} />
                  </motion.div>
                  <h3 className={`font-bold text-gray-900 mb-2 ${isMobile ? 'text-xl' : 'text-2xl md:text-3xl'}`}>
                    Connexion
                  </h3>
                  <p className={`text-[#F77F00] font-medium ${textSize}`}>
                    Accédez à votre espace
                  </p>
                </div>

                <form onSubmit={handleSubmit} className={`${isMobile ? 'space-y-4' : isTablet ? 'space-y-5' : 'space-y-6'}`}>
                  {/* Nom d'utilisateur */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.5 }}
                  >
                    <label htmlFor="NomUtilisateur" className={`block font-semibold text-gray-700 mb-1 md:mb-2 ${textSize}`}>
                      Nom d'utilisateur
                    </label>
                    <div className="relative">
                      <UserIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${iconSize}`} />
                      <input
                        id="NomUtilisateur"
                        name="NomUtilisateur"
                        type="text"
                        value={formData.NomUtilisateur}
                        onChange={handleChange}
                        placeholder="Votre identifiant"
                        className={`w-full bg-gray-50 border border-gray-200 ${inputSize} pl-10 md:pl-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-all duration-300`}
                        disabled={isLoading}
                        autoComplete="username"
                      />
                    </div>
                  </motion.div>

                  {/* Mot de passe */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.6 }}
                  >
                    <div className="flex justify-between items-center mb-1 md:mb-2">
                      <label htmlFor="MotDePasse" className={`block font-semibold text-gray-700 ${textSize}`}>
                        Mot de passe
                      </label>
                    </div>
                    <div className="relative">
                      <LockClosedIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${iconSize}`} />
                      <input
                        id="MotDePasse"
                        name="MotDePasse"
                        type={showPassword ? "text" : "password"}
                        value={formData.MotDePasse}
                        onChange={handleChange}
                        placeholder="Votre mot de passe"
                        className={`w-full bg-gray-50 border border-gray-200 ${inputSize} pl-10 md:pl-12 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-all duration-300`}
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
                  </motion.div>

                  {/* Message d'erreur */}
                  {errorMessage && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      className={`px-4 py-3 rounded-xl text-sm font-medium ${
                        errorType === 'identifiants_invalides' ? 'bg-red-50 border border-red-200 text-red-800' :
                        errorType === 'erreur_reseau' ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' :
                        errorType === 'compte_bloque' ? 'bg-gray-100 border border-gray-300 text-gray-800' :
                        'bg-orange-50 border border-orange-200 text-orange-800'
                      }`}
                      role="alert"
                    >
                      <div className="flex items-start">
                        <span className="mr-2">⚠</span>
                        <div className="flex-1">
                          <p>{errorMessage}</p>
                          {errorType === 'identifiants_invalides' && attemptCount >= 3 && (
                            <p className="mt-1 text-xs font-semibold">
                              {5 - attemptCount} tentative(s) restante(s)
                            </p>
                          )}
                          {errorType === 'erreur_reseau' && (
                            <p className="mt-1 text-xs">
                              Vérifiez votre connexion internet
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Bouton de connexion */}
                  <motion.button
                    type="submit"
                    disabled={isLoading || apiStatus !== 'en_ligne'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    whileHover={{ scale: (isLoading || apiStatus !== 'en_ligne') ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full font-bold ${buttonSize} rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center ${
                      isLoading || apiStatus !== 'en_ligne' 
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white hover:shadow-xl'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <div className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} border-2 border-white border-t-transparent rounded-full animate-spin mr-2`}></div>
                        <span>Connexion...</span>
                      </>
                    ) : apiStatus !== 'en_ligne' ? (
                      <>
                        <WifiIcon className={`${iconSize} mr-2`} />
                        <span>Serveur indisponible</span>
                      </>
                    ) : (
                      <>
                        <span>Se connecter</span>
                        <ArrowRightIcon className={`${iconSize} ml-2`} />
                      </>
                    )}
                  </motion.button>

                  {/* Indicateur de tentatives */}
                  {attemptCount > 0 && attemptCount < 5 && (
                    <div className={`text-center ${textSize} text-gray-500`}>
                      Tentatives : {attemptCount} / 5
                    </div>
                  )}

                  {/* Support */}
                  <div className={`text-center ${textSize} text-gray-500 pt-2`}>
                    <p>Support : contact@gescard.com</p>
                  </div>
                </form>

                {/* Comptes de test (développement uniquement) */}
                {import.meta.env.DEV && (
                  <div className={`mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 ${textSize}`}>
                    <p className="font-medium mb-2">Comptes de test :</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => fillTestAccount('UFHB02', '123456')}
                        className="p-2 bg-orange-100 hover:bg-orange-200 rounded text-xs"
                      >
                        Admin
                      </button>
                      <button 
                        onClick={() => fillTestAccount('UFHB01', '123456')}
                        className="p-2 bg-blue-100 hover:bg-blue-200 rounded text-xs"
                      >
                        Gestionnaire
                      </button>
                      <button 
                        onClick={() => fillTestAccount('UFHB06', '123456')}
                        className="p-2 bg-green-100 hover:bg-green-200 rounded text-xs"
                      >
                        Chef d'équipe
                      </button>
                      <button 
                        onClick={() => fillTestAccount('UFHB05', '123456')}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                      >
                        Opérateur
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-orange-100 py-3 md:py-6">
        <div className="text-center">
          <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm md:text-base'}`}>
            © 2025 <span className="font-bold text-[#F77F00]">GESCARD</span> – <span className="text-gray-500">Gestion des Cartes</span>
          </p>
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 mt-1`}>
            Version 2.0.0 • Coordination Abidjan Nord-Cocody
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Login;