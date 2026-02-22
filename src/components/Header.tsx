import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  HomeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UsersIcon,
  FolderIcon,
  Cog6ToothIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

interface HeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  gradient?: "orange" | "blue" | "green" | "red" | "purple";
  size?: "sm" | "md" | "lg";
  centered?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle,
  icon,
  gradient = "orange",
  size = "md",
  centered = false,
  showBackButton = false,
  onBack,
  actions,
  breadcrumbs = []
}) => {
  
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

  // Configuration des gradients
  const gradientConfig = {
    orange: "from-[#F77F00] to-[#FF9E40]",
    blue: "from-[#0077B6] to-[#2E8B57]",
    green: "from-[#2E8B57] to-[#3CB371]",
    red: "from-red-500 to-red-600",
    purple: "from-purple-500 to-purple-600"
  };

  // Configuration des tailles
  const sizeConfig = {
    sm: {
      title: isMobile ? "text-base" : "text-lg md:text-xl",
      subtitle: isMobile ? "text-xs" : "text-sm md:text-base",
      padding: isMobile ? "py-2" : "py-3 md:py-4",
      icon: isMobile ? "w-5 h-5" : "w-6 h-6 md:w-7 md:h-7",
      container: isMobile ? "px-3" : "px-4 md:px-6"
    },
    md: {
      title: isMobile ? "text-lg" : "text-xl md:text-2xl",
      subtitle: isMobile ? "text-xs" : "text-sm md:text-base",
      padding: isMobile ? "py-3" : "py-4 md:py-5",
      icon: isMobile ? "w-6 h-6" : "w-7 h-7 md:w-8 md:h-8",
      container: isMobile ? "px-3" : "px-4 md:px-6"
    },
    lg: {
      title: isMobile ? "text-xl" : "text-2xl md:text-3xl",
      subtitle: isMobile ? "text-sm" : "text-base md:text-lg",
      padding: isMobile ? "py-4" : "py-5 md:py-6",
      icon: isMobile ? "w-7 h-7" : "w-8 h-8 md:w-9 md:h-9",
      container: isMobile ? "px-3" : "px-4 md:px-6"
    }
  };

  const currentSize = sizeConfig[size];

  // Icône par défaut selon le gradient
  const getDefaultIcon = () => {
    switch (gradient) {
      case 'orange': return <DocumentTextIcon className={currentSize.icon} />;
      case 'blue': return <ChartBarIcon className={currentSize.icon} />;
      case 'green': return <UsersIcon className={currentSize.icon} />;
      case 'red': return <FolderIcon className={currentSize.icon} />;
      case 'purple': return <Cog6ToothIcon className={currentSize.icon} />;
      default: return <HomeIcon className={currentSize.icon} />;
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`bg-gradient-to-r ${gradientConfig[gradient]} text-white shadow-lg ${isMobile ? 'rounded-lg' : 'rounded-xl md:rounded-2xl'} mb-3 md:mb-6 ${currentSize.padding}`}
    >
      <div className={currentSize.container}>
        
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 md:gap-2 text-white/80 text-xs md:text-sm mb-2">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span>/</span>}
                {crumb.href ? (
                  <a 
                    href={crumb.href} 
                    className="hover:text-white transition-colors"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Ligne principale */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-3 ${centered ? 'items-center' : ''}`}>
          <div className={`flex items-center gap-2 md:gap-4 ${centered ? 'justify-center' : ''}`}>
            
            {/* Bouton retour */}
            {showBackButton && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onBack}
                className="p-1.5 md:p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                aria-label="Retour"
              >
                <ArrowLeftIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
              </motion.button>
            )}

            {/* Icône */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="bg-white/20 p-2 md:p-3 rounded-lg md:rounded-xl backdrop-blur-sm"
            >
              {icon || getDefaultIcon()}
            </motion.div>

            {/* Contenu texte */}
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className={`font-bold ${currentSize.title} leading-tight`}
              >
                {title}
              </motion.h1>
              
              {subtitle && (
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className={`text-white/90 mt-0.5 md:mt-1 ${currentSize.subtitle}`}
                >
                  {subtitle}
                </motion.p>
              )}
            </div>
          </div>

          {/* Actions */}
          {actions && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className={`flex items-center gap-2 ${centered ? 'justify-center' : ''}`}
            >
              {actions}
            </motion.div>
          )}
        </div>

        {/* Barre de progression décorative */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="h-0.5 md:h-1 bg-white/30 rounded-full mt-3 md:mt-4 overflow-hidden"
        >
          <div className="h-full bg-white/50 animate-pulse w-1/3 rounded-full"></div>
        </motion.div>
      </div>
    </motion.header>
  );
};

// Variantes préconfigurées pour usage rapide
export const PageHeader: React.FC<Omit<HeaderProps, 'size'>> = (props) => (
  <Header size="lg" {...props} />
);

export const SectionHeader: React.FC<Omit<HeaderProps, 'size'>> = (props) => (
  <Header size="md" {...props} />
);

export const CardHeader: React.FC<Omit<HeaderProps, 'size' | 'gradient'> & { noGradient?: boolean }> = ({ 
  noGradient, 
  ...props 
}) => (
  <div className={`${!noGradient ? 'bg-gradient-to-r from-gray-50 to-white' : ''} border-b border-gray-200 p-4 md:p-6`}>
    <div className="flex items-center gap-3">
      {props.icon && (
        <div className="text-[#F77F00]">{props.icon}</div>
      )}
      <div>
        <h3 className="font-bold text-gray-800 text-base md:text-lg">{props.title}</h3>
        {props.subtitle && (
          <p className="text-sm text-gray-600 mt-1">{props.subtitle}</p>
        )}
      </div>
    </div>
  </div>
);

export default Header;