import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  SparklesIcon,
  ChartBarIcon,
  UserIcon,
  DocumentTextIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: "orange" | "blue" | "green" | "red" | "purple";
  icon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "gradient" | "outline";
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subtitle,
  color = "blue",
  icon,
  size = "md",
  variant = "solid",
  trend,
  loading = false,
  onClick
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

  // Configuration des couleurs
  const colorConfig = {
    orange: {
      solid: "bg-orange-50 border-orange-200 text-orange-800",
      gradient: "bg-gradient-to-br from-[#F77F00] to-[#FF9E40] text-white",
      outline: "bg-white border-2 border-[#F77F00] text-[#F77F00]"
    },
    blue: {
      solid: "bg-blue-50 border-blue-200 text-blue-800",
      gradient: "bg-gradient-to-br from-[#0077B6] to-[#2E8B57] text-white",
      outline: "bg-white border-2 border-[#0077B6] text-[#0077B6]"
    },
    green: {
      solid: "bg-green-50 border-green-200 text-green-800",
      gradient: "bg-gradient-to-br from-[#2E8B57] to-[#3CB371] text-white",
      outline: "bg-white border-2 border-[#2E8B57] text-[#2E8B57]"
    },
    red: {
      solid: "bg-red-50 border-red-200 text-red-800",
      gradient: "bg-gradient-to-br from-red-500 to-red-600 text-white",
      outline: "bg-white border-2 border-red-500 text-red-500"
    },
    purple: {
      solid: "bg-purple-50 border-purple-200 text-purple-800",
      gradient: "bg-gradient-to-br from-purple-500 to-purple-600 text-white",
      outline: "bg-white border-2 border-purple-500 text-purple-500"
    }
  };

  // Configuration des tailles responsive
  const sizeConfig = {
    sm: {
      padding: isMobile ? "p-3" : "p-4",
      title: isMobile ? "text-xs font-medium" : "text-xs font-medium",
      value: isMobile ? "text-lg font-bold" : "text-xl font-bold",
      subtitle: isMobile ? "text-xs" : "text-xs",
      icon: isMobile ? "w-5 h-5" : "w-6 h-6",
      gap: isMobile ? "gap-1.5" : "gap-2"
    },
    md: {
      padding: isMobile ? "p-4" : "p-6",
      title: isMobile ? "text-sm font-semibold" : "text-sm font-semibold",
      value: isMobile ? "text-xl font-bold" : "text-2xl font-bold",
      subtitle: isMobile ? "text-xs" : "text-sm",
      icon: isMobile ? "w-6 h-6" : "w-8 h-8",
      gap: isMobile ? "gap-2" : "gap-3"
    },
    lg: {
      padding: isMobile ? "p-5" : "p-8",
      title: isMobile ? "text-base font-semibold" : "text-base font-semibold",
      value: isMobile ? "text-2xl font-bold" : "text-3xl font-bold",
      subtitle: isMobile ? "text-sm" : "text-base",
      icon: isMobile ? "w-7 h-7" : "w-9 h-9",
      gap: isMobile ? "gap-2" : "gap-4"
    }
  };

  const currentSize = sizeConfig[size];
  const colorStyles = colorConfig[color][variant];

  // Icône par défaut selon la couleur
  const getDefaultIcon = () => {
    switch (color) {
      case 'orange': return <ChartBarIcon className={currentSize.icon} />;
      case 'blue': return <DocumentTextIcon className={currentSize.icon} />;
      case 'green': return <BuildingOfficeIcon className={currentSize.icon} />;
      case 'red': return <UserIcon className={currentSize.icon} />;
      case 'purple': return <SparklesIcon className={currentSize.icon} />;
      default: return <ChartBarIcon className={currentSize.icon} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!loading && onClick ? { scale: 1.02, y: -2 } : {}}
      whileTap={!loading && onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`
        rounded-xl md:rounded-2xl shadow-lg transition-all duration-300 border
        ${currentSize.padding} ${colorStyles}
        ${loading ? 'opacity-70' : ''}
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      <div className={`flex items-start justify-between ${currentSize.gap}`}>
        <div className="flex-1 min-w-0">
          {/* Titre */}
          <h3 className={`${currentSize.title} mb-1 md:mb-2 opacity-90 truncate`}>
            {title}
          </h3>
          
          {/* Valeur */}
          {loading ? (
            <div className="flex items-center gap-2 md:gap-3">
              <div className={`w-4 h-4 md:w-5 md:h-5 border-2 ${
                variant === "gradient" ? "border-white" : "border-current"
              } border-t-transparent rounded-full animate-spin`} />
              <span className={currentSize.value}>Chargement...</span>
            </div>
          ) : (
            <p className={`${currentSize.value} mb-1 truncate`}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
          )}
          
          {/* Sous-titre */}
          {subtitle && (
            <p className={`${currentSize.subtitle} opacity-80 mt-0.5 md:mt-1 truncate`}>
              {subtitle}
            </p>
          )}
          
          {/* Indicateur de tendance */}
          {trend && !loading && (
            <div className={`flex items-center gap-1 mt-1 md:mt-2 text-xs md:text-sm ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend.isPositive ? (
                <ArrowTrendingUpIcon className="w-3 h-3 md:w-4 md:h-4" />
              ) : (
                <ArrowTrendingDownIcon className="w-3 h-3 md:w-4 md:h-4" />
              )}
              <span className="font-medium">{trend.value}%</span>
            </div>
          )}
        </div>
        
        {/* Icône */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className={`
            flex-shrink-0
            ${variant === "gradient" ? '' : 'opacity-70'}
          `}
        >
          {icon || getDefaultIcon()}
        </motion.div>
      </div>

      {/* Barre de progression décorative */}
      {variant === "gradient" && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="h-1 bg-white/30 rounded-full mt-3 md:mt-4 overflow-hidden"
        >
          <div className="h-full bg-white/50 animate-pulse w-1/3 rounded-full" />
        </motion.div>
      )}
    </motion.div>
  );
};

// Variantes préconfigurées
export const SmallStatCard: React.FC<Omit<StatCardProps, 'size'>> = (props) => (
  <StatCard size="sm" {...props} />
);

export const MediumStatCard: React.FC<Omit<StatCardProps, 'size'>> = (props) => (
  <StatCard size="md" {...props} />
);

export const LargeStatCard: React.FC<Omit<StatCardProps, 'size'>> = (props) => (
  <StatCard size="lg" {...props} />
);

// Cartes spécifiques
export const TotalCartesCard: React.FC<Omit<StatCardProps, 'title' | 'color' | 'icon'>> = (props) => (
  <StatCard 
    title="Total des Cartes" 
    color="orange" 
    icon={<DocumentTextIcon />}
    {...props} 
  />
);

export const CartesDelivreesCard: React.FC<Omit<StatCardProps, 'title' | 'color' | 'icon'>> = (props) => (
  <StatCard 
    title="Cartes Délivrées" 
    color="blue" 
    icon={<ChartBarIcon />}
    {...props} 
  />
);

export const CartesEnAttenteCard: React.FC<Omit<StatCardProps, 'title' | 'color' | 'icon'>> = (props) => (
  <StatCard 
    title="Cartes en Attente" 
    color="green" 
    icon={<BuildingOfficeIcon />}
    {...props} 
  />
);

export default StatCard;