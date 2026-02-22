import React from "react";
import { motion } from "framer-motion";
import { ArrowPathIcon } from '@heroicons/react/24/outline';  // ✅ Garder seulement celui utilisé

interface ButtonProps {
  text: string;
  onClick?: () => void;
  color?: "orange" | "blue" | "green" | "red" | "gray";
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "outline" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  text, 
  onClick, 
  color = "orange",
  size = "md",
  variant = "solid",
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  type = 'button',
  className = ''
}) => {
  
  // Configuration des couleurs
  const colorConfig = {
    orange: {
      solid: "bg-gradient-to-r from-[#F77F00] to-[#FF9E40] hover:from-[#e46f00] hover:to-[#FF8C00] text-white shadow-lg hover:shadow-xl focus:ring-2 focus:ring-orange-300 focus:ring-offset-2",
      outline: "border-2 border-[#F77F00] text-[#F77F00] hover:bg-[#F77F00] hover:text-white focus:ring-2 focus:ring-orange-300 focus:ring-offset-2",
      ghost: "text-[#F77F00] hover:bg-orange-50 focus:ring-2 focus:ring-orange-300 focus:ring-offset-2"
    },
    blue: {
      solid: "bg-gradient-to-r from-[#0077B6] to-[#2E8B57] hover:from-[#005a8c] hover:to-[#1e6b47] text-white shadow-lg hover:shadow-xl focus:ring-2 focus:ring-blue-300 focus:ring-offset-2",
      outline: "border-2 border-[#0077B6] text-[#0077B6] hover:bg-[#0077B6] hover:text-white focus:ring-2 focus:ring-blue-300 focus:ring-offset-2",
      ghost: "text-[#0077B6] hover:bg-blue-50 focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
    },
    green: {
      solid: "bg-gradient-to-r from-[#2E8B57] to-[#3CB371] hover:from-[#1e6b47] hover:to-[#2E8B57] text-white shadow-lg hover:shadow-xl focus:ring-2 focus:ring-green-300 focus:ring-offset-2",
      outline: "border-2 border-[#2E8B57] text-[#2E8B57] hover:bg-[#2E8B57] hover:text-white focus:ring-2 focus:ring-green-300 focus:ring-offset-2",
      ghost: "text-[#2E8B57] hover:bg-green-50 focus:ring-2 focus:ring-green-300 focus:ring-offset-2"
    },
    red: {
      solid: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl focus:ring-2 focus:ring-red-300 focus:ring-offset-2",
      outline: "border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white focus:ring-2 focus:ring-red-300 focus:ring-offset-2",
      ghost: "text-red-500 hover:bg-red-50 focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
    },
    gray: {
      solid: "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg hover:shadow-xl focus:ring-2 focus:ring-gray-300 focus:ring-offset-2",
      outline: "border-2 border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white focus:ring-2 focus:ring-gray-300 focus:ring-offset-2",
      ghost: "text-gray-500 hover:bg-gray-50 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
    }
  };

  // Configuration des tailles
  const sizeConfig = {
    sm: "px-3 py-2 text-xs md:text-sm rounded-lg gap-1.5",
    md: "px-4 py-2.5 text-sm md:text-base rounded-xl gap-2",
    lg: "px-6 py-3 md:px-8 md:py-4 text-base md:text-lg rounded-xl md:rounded-2xl gap-2.5"
  };

  // Icône de chargement
  const getLoadingIcon = () => {
    return <ArrowPathIcon className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} animate-spin`} />;
  };

  const baseClasses = `
    font-semibold transition-all duration-300 flex items-center justify-center
    ${sizeConfig[size]}
    ${colorConfig[color][variant]}
    ${fullWidth ? 'w-full' : ''}
    ${disabled || loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
    focus:outline-none active:scale-95
    ${className}
  `;

  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      className={baseClasses.trim()}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
    >
      {loading ? (
        <>
          {getLoadingIcon()}
          <span>{text}</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="flex items-center">{icon}</span>
          )}
          <span>{text}</span>
          {icon && iconPosition === 'right' && (
            <span className="flex items-center">{icon}</span>
          )}
        </>
      )}
    </motion.button>
  );
};

// Variantes préconfigurées pour usage rapide
export const PrimaryButton: React.FC<Omit<ButtonProps, 'color' | 'variant'>> = (props) => (
  <Button color="orange" variant="solid" {...props} />
);

export const SecondaryButton: React.FC<Omit<ButtonProps, 'color' | 'variant'>> = (props) => (
  <Button color="blue" variant="outline" {...props} />
);

export const SuccessButton: React.FC<Omit<ButtonProps, 'color' | 'variant'>> = (props) => (
  <Button color="green" variant="solid" {...props} />
);

export const DangerButton: React.FC<Omit<ButtonProps, 'color' | 'variant'>> = (props) => (
  <Button color="red" variant="solid" {...props} />
);

export const IconButton: React.FC<Omit<ButtonProps, 'size'> & { icon: React.ReactNode }> = ({ text, icon, ...props }) => (
  <Button size="sm" text={text} icon={icon} iconPosition="left" {...props} />
);

export default Button;