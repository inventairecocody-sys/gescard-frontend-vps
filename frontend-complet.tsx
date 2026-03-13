// ========================================
// FRONTEND COMPLET CONSOLIDÉ
// Projet: Cartes Frontend
// Généré le: 12/03/2026 17:47:56
// ========================================

// ========== DÉPENDANCES ==========
/*
Dépendances: {
  "@emotion/react": "^11.14.0",
  "@emotion/styled": "^11.14.1",
  "@heroicons/react": "^2.2.0",
  "@mui/icons-material": "^7.3.4",
  "@mui/material": "^7.3.4",
  "axios": "^1.13.1",
  "framer-motion": "^12.23.24",
  "jwt-decode": "^4.0.0",
  "lucide-react": "^0.552.0",
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-hook-form": "^7.65.0",
  "react-hot-toast": "^2.6.0",
  "react-icons": "^5.5.0",
  "react-router-dom": "^6.30.1",
  "recharts": "^3.3.0",
  "xlsx": "^0.18.5",
  "zod": "^4.1.12"
}
DévDépendances: {
  "@eslint/js": "^9.36.0",
  "@types/node": "^24.6.0",
  "@types/react": "^19.2.14",
  "@types/react-dom": "^19.2.3",
  "@types/react-router-dom": "^5.3.3",
  "@typescript-eslint/eslint-plugin": "^8.56.0",
  "@typescript-eslint/parser": "^8.56.0",
  "@vitejs/plugin-react": "^5.0.4",
  "autoprefixer": "^10.4.21",
  "eslint": "^9.36.0",
  "eslint-plugin-react-hooks": "^5.2.0",
  "eslint-plugin-react-refresh": "^0.4.22",
  "globals": "^16.4.0",
  "postcss": "^8.5.6",
  "tailwindcss": "^3.4.13",
  "typescript": "~5.9.3",
  "typescript-eslint": "^8.45.0",
  "vite": "^7.1.7"
}
*/

// ========== FICHIERS DE CONFIGURATION ==========

// ----- vite.config.ts -----
import { defineConfig, loadEnv, ConfigEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv) => {
  // Charger les variables d'environnement
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    
    // Résolution des alias pour les imports
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@services': path.resolve(__dirname, './src/services'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@types': path.resolve(__dirname, './src/types'),
        '@context': path.resolve(__dirname, './src/context'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@assets': path.resolve(__dirname, './src/assets')
      }
    },
    
    // Configuration du serveur de développement
    server: {
      port: 5173,
      host: true,
      open: true,
      cors: true,
      
      // Proxy pour rediriger les appels API
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          rewrite: (path: string) => path.replace(/^\/api/, ''),
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.log('❌ Proxy error:', err);
            });
            proxy.on('proxyReq', (_proxyReq, req) => {
              console.log('🔄 [Proxy]', req.method, req.url);
            });
          }
        }
      },
      
      // Optimisations
      watch: {
        usePolling: true,
        interval: 100
      },
      
      // Headers de sécurité pour le développement
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
      }
    },
    
    // Configuration de build optimisée
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      minify: 'esbuild',
      target: 'es2020',
      cssCodeSplit: true,
      
      // Optimisation du chunking
      rollupOptions: {
        output: {
          // Séparation des vendors
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['framer-motion', '@heroicons/react'],
            'chart-vendor': ['recharts'],
            'utils-vendor': ['axios', 'jwt-decode', 'react-hot-toast'],
            'excel-vendor': ['xlsx']
          },
          
          // Nommage des fichiers
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name || '';
            
            if (/\.(css)$/.test(name)) {
              return 'assets/css/[name]-[hash][extname]';
            }
            if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(name)) {
              return 'assets/images/[name]-[hash][extname]';
            }
            if (/\.(woff2?|ttf|eot)$/.test(name)) {
              return 'assets/fonts/[name]-[hash][extname]';
            }
            return 'assets/misc/[name]-[hash][extname]';
          }
        }
      },
      
      // Compression
      assetsInlineLimit: 4096,
      
      // Limite d'avertissement
      chunkSizeWarningLimit: 1000,
      
      // Désactiver le rapport de taille en production
      reportCompressedSize: false,
      
      // Nettoyage avant build
      emptyOutDir: true
    },
    
    // Prévisualisation
    preview: {
      port: 4173,
      host: true,
      open: true,
      strictPort: true
    },
    
    // Optimisations générales
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'framer-motion',
        'axios',
        'jwt-decode',
        'react-hot-toast',
        '@heroicons/react'
      ]
    },
    
    // Variables d'environnement exposées
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
      'import.meta.env.VITE_NODE_ENV': JSON.stringify(mode),
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(env.VITE_APP_VERSION || '1.0.0')
    }
  };
});

// ----- tailwind.config.cjs -----
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  
  theme: {
    extend: {
      colors: {
        orangeMain: "#F77F00",
        orangeSecondary: "#FF9E40",
        greenMain: "#2E8B57",
        blueMain: "#0077B6",
        blueLight: "#00A8E8",
      },
      
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 20px -3px rgba(0, 0, 0, 0.1), 0 12px 25px -2px rgba(0, 0, 0, 0.06)',
        'hard': '0 10px 40px -5px rgba(0, 0, 0, 0.15), 0 20px 50px -2px rgba(0, 0, 0, 0.08)',
      },
      
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      
      backgroundImage: {
        'gradient-orange': 'linear-gradient(to right, #F77F00, #FF9E40)',
        'gradient-blue': 'linear-gradient(to right, #0077B6, #2E8B57)',
        'gradient-green': 'linear-gradient(to right, #2E8B57, #0077B6)',
      },
    },
  },
  
  plugins: [],
}

// ----- postcss.config.cjs -----
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

// ----- tsconfig.json -----
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}

// ----- eslint.config.js -----
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Désactiver complètement la règle no-explicit-any
      '@typescript-eslint/no-explicit-any': 'off',
      
      // Alternative : passer en warning au lieu d'erreur
      // '@typescript-eslint/no-explicit-any': 'warn',
      
      // Ou configuration plus permissive
      // '@typescript-eslint/no-explicit-any': ['error', { ignoreRestArgs: true }],
    },
  },
])

// ========== STYLES ET TYPES GLOBAUX ==========

// ----- src/index.css -----
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ============================================
   RESET ET STYLES DE BASE PERSONNALISÉS
   ============================================ */
@layer base {
  /* Reset amélioré */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    -webkit-text-size-adjust: 100%;
    -webkit-tap-highlight-color: transparent;
    scroll-behavior: smooth;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    overflow-x: hidden;
    min-height: 100vh;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  }

  /* Amélioration de la sélection de texte */
  ::selection {
    background-color: rgba(247, 127, 0, 0.3);
    color: #1f2937;
  }

  /* Scrollbar personnalisée */
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 5px;
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(45deg, #F77F00, #FF9E40);
    border-radius: 5px;
    border: 2px solid #f1f5f9;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(45deg, #e46f00, #FF8C00);
  }

  /* Empêche le zoom automatique sur iOS */
  input[type="text"],
  input[type="password"],
  input[type="email"],
  input[type="number"],
  textarea,
  select {
    font-size: 16px !important;
  }

  /* Focus visible amélioré */
  :focus-visible {
    outline: 2px solid #F77F00;
    outline-offset: 2px;
  }

  /* Désactiver les animations si préférées réduites */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}

/* ============================================
   COMPOSANTS PERSONNALISÉS
   ============================================ */
@layer components {
  /* Cartes */
  .card {
    @apply bg-white rounded-2xl shadow-soft border border-gray-200 hover:shadow-medium transition-shadow duration-300;
  }

  .card-gradient {
    @apply bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white rounded-2xl shadow-hard;
  }

  .data-card {
    @apply card hover:scale-[1.02] transition-all duration-300;
  }

  /* Boutons */
  .btn-primary {
    @apply bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white font-semibold py-3 px-6 rounded-xl 
           hover:from-[#e46f00] hover:to-[#FF8C00] hover:shadow-lg 
           active:scale-95 transition-all duration-300 
           disabled:opacity-50 disabled:cursor-not-allowed 
           focus:outline-none focus:ring-4 focus:ring-orange-300 focus:ring-opacity-50;
  }

  .btn-secondary {
    @apply bg-gradient-to-r from-[#0077B6] to-[#2E8B57] text-white font-semibold py-3 px-6 rounded-xl 
           hover:from-[#005B8C] hover:to-[#1B5E20] hover:shadow-lg 
           active:scale-95 transition-all duration-300 
           disabled:opacity-50 disabled:cursor-not-allowed 
           focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50;
  }

  .btn-outline {
    @apply border-2 border-[#F77F00] text-[#F77F00] font-semibold py-3 px-6 rounded-xl 
           hover:bg-[#F77F00] hover:text-white 
           active:scale-95 transition-all duration-300 
           disabled:opacity-50 disabled:cursor-not-allowed 
           focus:outline-none focus:ring-4 focus:ring-orange-300 focus:ring-opacity-50;
  }

  /* Formulaires */
  .input-field {
    @apply w-full px-4 py-3 bg-white border border-gray-300 rounded-xl 
           focus:outline-none focus:border-[#F77F00] focus:ring-4 focus:ring-orange-100 
           placeholder-gray-400 transition-all duration-300 
           disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .form-label {
    @apply block text-sm font-semibold text-gray-700 mb-2;
  }

  .search-form {
    @apply flex gap-2 p-2 bg-white rounded-xl shadow-soft;
  }

  .search-input {
    @apply flex-1 px-4 py-2 bg-transparent border-none focus:outline-none focus:ring-0;
  }

  /* Badges */
  .badge {
    @apply inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold;
  }

  .badge-orange {
    @apply bg-orange-100 text-[#F77F00];
  }

  .badge-blue {
    @apply bg-blue-100 text-[#0077B6];
  }

  .badge-green {
    @apply bg-green-100 text-[#2E8B57];
  }

  .status-indicator {
    @apply w-3 h-3 rounded-full;
  }

  .status-active {
    @apply bg-green-500 animate-pulse;
  }

  .status-inactive {
    @apply bg-gray-400;
  }

  .status-pending {
    @apply bg-yellow-500;
  }

  .status-error {
    @apply bg-red-500;
  }

  /* Alertes */
  .alert {
    @apply px-4 py-3 rounded-2xl border flex items-center gap-3;
  }

  .alert-success {
    @apply bg-green-50 border-green-200 text-green-800;
  }

  .alert-warning {
    @apply bg-orange-50 border-orange-200 text-orange-800;
  }

  .alert-error {
    @apply bg-red-50 border-red-200 text-red-800;
  }

  .alert-info {
    @apply bg-blue-50 border-blue-200 text-blue-800;
  }

  /* Tables */
  .table-container {
    @apply overflow-x-auto rounded-2xl border border-gray-200;
  }

  .table {
    @apply min-w-full divide-y divide-gray-200;
  }

  .table th {
    @apply px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50;
  }

  .table td {
    @apply px-6 py-4 whitespace-nowrap text-sm text-gray-800;
  }

  /* Navigation */
  .navbar-gradient {
    @apply bg-gradient-to-r from-[#F77F00] to-[#FF9E40];
  }

  .tab-container {
    @apply flex border-b border-gray-200;
  }

  .tab {
    @apply px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#F77F00] border-b-2 border-transparent hover:border-[#F77F00] transition-all duration-300;
  }

  .tab-active {
    @apply text-[#F77F00] border-b-2 border-[#F77F00];
  }

  /* Pagination */
  .pagination {
    @apply flex items-center gap-2;
  }

  .pagination-item {
    @apply w-10 h-10 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-300;
  }

  .pagination-active {
    @apply bg-[#F77F00] text-white hover:bg-[#e46f00];
  }

  /* Modals */
  .modal-overlay {
    @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
  }

  .modal-content {
    @apply bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-auto border border-gray-200;
  }

  /* Utilitaires */
  .glass {
    @apply bg-white/80 backdrop-blur-lg border border-white/20;
  }

  .skeleton {
    @apply animate-pulse bg-gray-200 rounded;
  }

  .gradient-text {
    @apply bg-gradient-to-r from-[#F77F00] to-[#0077B6] bg-clip-text text-transparent;
  }

  .app-theme-gradient {
    background: linear-gradient(135deg, #F77F00 0%, #FF9E40 50%, #0077B6 100%);
  }

  .notification-badge {
    @apply absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center;
  }

  .page-loader {
    @apply fixed inset-0 flex items-center justify-center bg-white z-50;
  }

  .section-container {
    @apply container mx-auto px-4 sm:px-6 lg:px-8;
  }

  .divider {
    @apply border-t border-gray-200 my-6;
  }

  .divider-gradient {
    @apply h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-8;
  }
}

/* ============================================
   UTILITAIRES PERSONNALISÉS
   ============================================ */
@layer utilities {
  /* Animations delays */
  .animation-delay-200 { animation-delay: 200ms; }
  .animation-delay-500 { animation-delay: 500ms; }
  .animation-delay-700 { animation-delay: 700ms; }
  .delay-100 { animation-delay: 100ms; }
  .delay-200 { animation-delay: 200ms; }
  .delay-300 { animation-delay: 300ms; }
  .delay-400 { animation-delay: 400ms; }
  .delay-500 { animation-delay: 500ms; }
  .delay-600 { animation-delay: 600ms; }
  .delay-700 { animation-delay: 700ms; }
  .delay-800 { animation-delay: 800ms; }
  .delay-900 { animation-delay: 900ms; }
  .delay-1000 { animation-delay: 1000ms; }

  /* Ombres */
  .shadow-soft {
    box-shadow: 0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04);
  }

  .shadow-medium {
    box-shadow: 0 4px 20px -3px rgba(0, 0, 0, 0.1), 0 12px 25px -2px rgba(0, 0, 0, 0.06);
  }

  .shadow-hard {
    box-shadow: 0 10px 40px -5px rgba(0, 0, 0, 0.15), 0 20px 50px -2px rgba(0, 0, 0, 0.08);
  }

  /* ✅ LINE-CLAMP - Version compatible avec tous les navigateurs */
  .line-clamp-1 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    line-clamp: 1; /* Version standard */
  }

  .text-ellipsis-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2; /* Version standard */
  }

  .text-ellipsis-3 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    line-clamp: 3; /* Version standard */
  }

  /* Aspect ratios */
  .aspect-video { aspect-ratio: 16 / 9; }
  .aspect-square { aspect-ratio: 1 / 1; }

  /* Flex utilities */
  .flex-center { @apply flex items-center justify-center; }
  .flex-between { @apply flex items-center justify-between; }
  .flex-start { @apply flex items-center justify-start; }
  .flex-end { @apply flex items-center justify-end; }

  /* Hide scrollbar */
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar { display: none; }

  /* Spinners */
  .spinner {
    @apply w-8 h-8 border-4 border-[#F77F00] border-t-transparent rounded-full animate-spin;
  }

  .spinner-small {
    @apply w-4 h-4 border-2 border-[#F77F00] border-t-transparent rounded-full animate-spin;
  }

  /* Accessibilité */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
}

/* ============================================
   ANIMATIONS
   ============================================ */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slide-left {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slide-right {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(247, 127, 0, 0.3); }
  50% { box-shadow: 0 0 40px rgba(247, 127, 0, 0.6); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Classes d'animation */
.animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
.animate-slide-up { animation: slide-up 0.6s ease-out forwards; }
.animate-slide-left { animation: slide-left 0.6s ease-out forwards; }
.animate-slide-right { animation: slide-right 0.6s ease-out forwards; }
.animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
.animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
.animate-float { animation: float 3s ease-in-out infinite; }

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 640px) {
  .mobile-hidden { display: none !important; }
  .mobile-stack { flex-direction: column !important; }
  .mobile-full-width { width: 100% !important; }
  .mobile-text-center { text-align: center !important; }
  .mobile-padding { padding: 1rem !important; }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .tablet-hidden { display: none !important; }
}

@media (max-width: 360px) {
  .xs-text-smaller { font-size: 0.75rem !important; }
  .xs-padding-smaller { padding: 0.5rem !important; }
}

// ----- src/global.d.ts -----
// Types globaux pour votre application

// Type pour les rôles utilisateur
type UserRole = 'Administrateur' | 'Gestionnaire' | "Chef d'équipe" | 'Opérateur';

// Interface pour les données utilisateur dans le localStorage
interface StoredUser {
  id: number;
  nomUtilisateur: string;
  role: UserRole;
  coordination: string;
  agence: string;
  email?: string;
  telephone?: string;
}

// Extension de l'interface Window pour les propriétés personnalisées
interface Window {
  __APP_VERSION__: string;
  __API_URL__: string;
}

// Type pour les réponses API
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

// Type pour la pagination
interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Type pour les paramètres de requête
interface QueryParams {
  [key: string]: string | number | boolean | undefined | null;
}

// ----- src/vite-env.d.ts -----
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_NODE_ENV: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_BACKEND_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Déclaration pour les modules CSS (si vous en utilisez)
declare module '*.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Déclaration pour les images
declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

// Déclaration pour les fichiers JSON
declare module '*.json' {
  const value: any;
  export default value;
}

// ========== DOSSIER: types ==========

// ----- src\types\index.ts -----
import type { ReactNode } from 'react';
export interface ApiResponse<T = unknown> {
export interface ApiError {
export interface PaginatedResponse<T> {
export interface QueryParams {
export type UserRole = 'Administrateur' | 'Gestionnaire' | "Chef d'équipe" | 'Opérateur';
export interface LoginCredentials {
export interface AuthResponse {
export interface Utilisateur {
export interface DecodedToken {
export interface Carte {
export interface CarteFormData {
export interface ChefEquipeEditFields {
export interface StatistiquesGlobales {
export interface StatistiqueSite {
export interface StatistiquesGlobalesLegacy {
export interface StatistiqueSiteLegacy {
export type ActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'IMPORT' | 'EXPORT';
export interface ActionJournal {
export interface AnnulationResponse {
export interface DashboardRefreshEventDetail {
export type DashboardRefreshEvent = CustomEvent<DashboardRefreshEventDetail>;
export interface BroadcastMessage {
export interface ChildrenProps {
export interface ClassNameProps {
export interface LoadingProps {
export interface DisabledProps {
export interface OnClickProps {
export interface ValidationResult {
export interface ErrorWithMessage {
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ID = string | number;
export const AGENCES = [
export type Agence = typeof AGENCES[number];
export const ROLES: UserRole[] = ['Administrateur', 'Gestionnaire', "Chef d'équipe", 'Opérateur'];
export interface ImportStats {
export interface ImportResponse extends ApiResponse {
export interface ExportProgress {

// ========================================
// TYPES API
// ========================================

  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

  success: false;
  error: string;
  code: string;
}

  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

  [key: string]: string | number | boolean | undefined | null;
}

// ========================================
// TYPES AUTHENTIFICATION
// ========================================


  NomUtilisateur: string;
  MotDePasse: string;
}

  token: string;
  utilisateur: Utilisateur;
}

// ✅ CORRIGÉ: Ajout de nomComplet
  id: number;
  nomUtilisateur: string;
  nomComplet: string;
  role: UserRole;
  coordination: string;
  agence: string;
  email?: string;
  telephone?: string;
  actif: boolean;
  dateCreation: string;
  derniereConnexion?: string;
}

  id: number;
  nomUtilisateur: string;
  role: UserRole;
  coordination: string;
  exp: number;
  iat: number;
}

// ========================================
// TYPES CARTES
// ========================================

  id: number;
  codeCarte?: string;
  nom?: string;
  prenom?: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  contact?: string;
  // ✅ CORRECTION : delivrance est du texte en base (nom de la personne ou "Délivré"),
  //                 pas un booléen. Une valeur non vide = carte délivrée.
  delivrance?: string;
  contactRetrait?: string;
  dateDelivrance?: string;
  coordination: string;
  lieuEnrolement?: string;
  siteRetrait?: string;
  rangement?: string;
  dateCreation: string;
  dateModification?: string;
  createurId?: number;
  moderateurId?: number;
}

  codeCarte?: string;
  nom?: string;
  prenom?: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  contact?: string;
  // ✅ CORRECTION : string pour correspondre à la réalité de la base
  delivrance?: string;
  contactRetrait?: string;
  dateDelivrance?: string;
  coordination?: string;
  lieuEnrolement?: string;
  siteRetrait?: string;
  rangement?: string;
}

  // ✅ CORRECTION : string pour correspondre à la réalité de la base
  delivrance?: string;
  contactRetrait?: string;
  dateDelivrance?: string;
}

// ========================================
// ✅ TYPES STATISTIQUES CORRIGÉS
// ========================================

  total: number;
  retires: number;
  restants: number;
  tauxRetrait: number;
  metadata?: {
    sites_actifs: number;
    beneficiaires_uniques: number;
    premiere_importation: string;
    derniere_importation: string;
  };
}

  site: string;
  total: number;
  retires: number;
  restants: number;
  tauxRetrait: number;
}

// Types pour compatibilité avec l'ancien code
  totalCartes: number;
  cartesDelivrees: number;
  cartesNonDelivrees: number;
  parCoordination: {
    coordination: string;
    total: number;
    delivrees: number;
  }[];
  evolutionJournaliere: {
    date: string;
    creations: number;
    modifications: number;
    delivrances: number;
  }[];
}

  site: string;
  total: number;
  delivrees: number;
  enAttente: number;
}

// ========================================
// TYPES JOURNAL
// ========================================


  id: number;
  type: ActionType;
  description: string;
  utilisateurId: number;
  utilisateurNom: string;
  role: UserRole;
  coordination: string;
  carteId?: number;
  ancienneValeur?: unknown;
  nouvelleValeur?: unknown;
  dateAction: string;
  ipAddress?: string;
  annulee: boolean;
}

  success: boolean;
  message: string;
  actionAnnulee: ActionJournal;
}

// ========================================
// TYPES ÉVÉNEMENTS
// ========================================

  force?: boolean;
  timestamp?: number;
  source?: string;
}


  type: 'data_updated' | 'refresh_needed' | 'user_action';
  timestamp: number;
  forceRefresh?: boolean;
  source?: string;
  data?: unknown;
}

// ========================================
// TYPES PROPS REACT
// ========================================

  children: ReactNode;
}

  className?: string;
}

  loading?: boolean;
}

  disabled?: boolean;
}

  onClick?: () => void;
}

// ========================================
// TYPES UTILITAIRES
// ========================================

  isValid: boolean;
  error?: string;
}

  message: string;
  code?: string;
  status?: number;
}


// ========================================
// CONSTANTES PARTAGÉES
// ========================================

  'BINGERVILLE',
  'CHU D\'ANGRÉ',
  'Lycée hôtelier',
  'ADJAMÉ',
  'BÂTIMENT U DE L\'UNIVERSITÉ FELIX-HOUPHOUET COCODY',
  'VICE-PRÉSIDENCE DE L\'UNIVERSITÉ FELIX-HOUPHOUET COCODY'
] as const;



// ========================================
// TYPES POUR LES RÉPONSES API SPÉCIFIQUES
// ========================================

  imported: number;
  updated: number;
  duplicates: number;
  errors: number;
}

  stats?: ImportStats;
  recommendation?: string;
}

  percentage: number;
  loaded: number;
  total: number;
  speed: string;
  estimatedTime: string;
}

// ========== DOSSIER: config ==========

// ----- src\config\api.config.ts -----
export const API_CONFIG = {
export const API_ENDPOINTS = {
  baseURL: import.meta.env.VITE_API_URL,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}

  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    verify: '/auth/verify',
    profile: '/profil',
    changePassword: '/profil/change-password'
  },
  cartes: {
    list: '/cartes',
    detail: (id: number) => `/cartes/${id}`,
    create: '/cartes',
    update: (id: number) => `/cartes/${id}`,
    delete: (id: number) => `/cartes/${id}`
  },
  utilisateurs: {
    list: '/utilisateurs',
    detail: (id: number) => `/utilisateurs/${id}`,
    create: '/utilisateurs',
    update: (id: number) => `/utilisateurs/${id}`
  },
  statistiques: {
    globales: '/statistiques/globales',
    sites: '/statistiques/sites'
  },
  journal: {
    list: '/journal',
    annuler: (id: number) => `/journal/${id}/annuler`
  }
}

// ----- src\config\roles.config.ts -----
export type UserRole = 'Administrateur' | 'Gestionnaire' | "Chef d'équipe" | 'Opérateur';
export interface Permission {
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
export const PAGES = {
// src/config/roles.config.ts


  page: string;
  actions: ('view' | 'create' | 'edit' | 'delete' | 'import' | 'export' | 'annuler')[];
  filter?: 'all' | 'coordination';
  fields?: string[];
}

  Administrateur: [
    { page: 'accueil',         actions: ['view'] },
    { page: 'tableau-de-bord', actions: ['view'], filter: 'all' },
    { page: 'recherche',       actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'import-export',   actions: ['import', 'export'] },
    { page: 'journal',         actions: ['view', 'annuler'] },
    { page: 'administration',  actions: ['view'] },
    { page: 'comptes',         actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'mises-a-jour',    actions: ['view', 'create', 'delete'] },
    { page: 'profil',          actions: ['view', 'edit'] },
  ],
  Gestionnaire: [
    { page: 'accueil',         actions: ['view'] },
    { page: 'tableau-de-bord', actions: ['view'], filter: 'coordination' },
    { page: 'recherche',       actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'import-export',   actions: ['import', 'export'] },
    { page: 'profil',          actions: ['view', 'edit'] },
  ],
  "Chef d'équipe": [
    { page: 'accueil',         actions: ['view'] },
    { page: 'recherche',       actions: ['view', 'edit'], fields: ['delivrance', 'CONTACT DE RETRAIT', 'DATE DE DELIVRANCE'] },
    { page: 'profil',          actions: ['view', 'edit'] },
  ],
  Opérateur: [
    { page: 'accueil',         actions: ['view'] },
    { page: 'recherche',       actions: ['view'] },
    { page: 'profil',          actions: ['view', 'edit'] },
  ],
};

  accueil:        '/accueil',
  tableauDeBord:  '/tableau-de-bord',
  recherche:      '/recherche',
  importExport:   '/import-export',
  journal:        '/journal',
  administration: '/administration',
  comptes:        '/administration/comptes',
  misesAJour:     '/administration/mises-a-jour',
  profil:         '/profil',
  telechargement: '/telechargement',
} as const;

// ========== DOSSIER: Services ==========

// ----- src\Services\api\auth.ts -----
// import { apiClient } from './client'; // CONSOLIDÉ
// import { TokenService } from '../storage/token'; // CONSOLIDÉ
// import type { LoginCredentials, AuthResponse, Utilisateur } from '../../types'; // CONSOLIDÉ
// import type { ApiResponse } from '../../types'; // CONSOLIDÉ
export const AuthService = {

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    // Stocker le token et l'utilisateur après connexion réussie
    if (response.data.token) {
      TokenService.setToken(response.data.token);
      TokenService.setUser(response.data.utilisateur);
    }
    
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Toujours effacer les tokens, même si la requête échoue
      TokenService.clear();
    }
  },

  async verifyToken(): Promise<Utilisateur> {
    const token = TokenService.getToken();
    
    if (!token) {
      throw new Error('Aucun token trouvé');
    }

    try {
      const response = await apiClient.get<ApiResponse<Utilisateur>>('/auth/verify');
      
      if (!response.data.data) {
        throw new Error('Token invalide');
      }
      
      // Mettre à jour l'utilisateur dans le storage
      TokenService.setUser(response.data.data);
      
      return response.data.data;
    } catch (error) {
      TokenService.clear();
      throw error;
    }
  },

  // ✅ CORRIGÉ: /profil → /profil/me
  async getProfile(): Promise<Utilisateur> {
    const response = await apiClient.get<ApiResponse<Utilisateur>>('/profil/me');
    
    if (!response.data.data) {
      throw new Error('Profil non trouvé');
    }
    
    return response.data.data;
  },

  // ✅ CORRIGÉ: /profil → /profil/me
  async updateProfile(data: Partial<Utilisateur>): Promise<Utilisateur> {
    const response = await apiClient.put<ApiResponse<Utilisateur>>('/profil/me', data);
    
    if (!response.data.data) {
      throw new Error('Erreur lors de la mise à jour');
    }
    
    // Mettre à jour l'utilisateur dans le storage
    const currentUser = TokenService.getUser();
    if (currentUser) {
      TokenService.setUser({ ...currentUser, ...response.data.data });
    }
    
    return response.data.data;
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/profil/change-password', { 
      oldPassword, 
      newPassword 
    });
  },

  async refreshToken(): Promise<{ token: string }> {
    const response = await apiClient.post<{ token: string }>('/auth/refresh');
    
    if (response.data.token) {
      TokenService.setToken(response.data.token);
    }
    
    return response.data;
  }
};

// ----- src\Services\api\cartes.ts -----
// import { apiClient } from './client'; // CONSOLIDÉ
import type { 
export const CartesService = {
  Carte, 
  CarteFormData, 
  PaginatedResponse, 
  QueryParams,
  ChefEquipeEditFields 
} from '../../types';

  async getCartes(params?: QueryParams): Promise<PaginatedResponse<Carte>> {
    const response = await apiClient.get<PaginatedResponse<Carte>>('/cartes', { params });
    return response.data;
  },

  async getCarteById(id: number): Promise<Carte> {
    const response = await apiClient.get<{ data: Carte }>(`/cartes/${id}`);
    return response.data.data;
  },

  async createCarte(data: CarteFormData): Promise<Carte> {
    const response = await apiClient.post<{ data: Carte }>('/cartes', data);
    return response.data.data;
  },

  async updateCarte(
    id: number, 
    data: Partial<CarteFormData> | ChefEquipeEditFields
  ): Promise<Carte> {
    const response = await apiClient.put<{ data: Carte }>(`/cartes/${id}`, data);
    return response.data.data;
  },

  async deleteCarte(id: number): Promise<void> {
    await apiClient.delete(`/cartes/${id}`);
  },

  async searchCartes(query: string): Promise<Carte[]> {
    const response = await apiClient.get<{ data: Carte[] }>('/cartes/search', {
      params: { q: query }
    });
    return response.data.data;
  }
};

// ----- src\Services\api\client.ts -----
import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
// import { TokenService } from '../storage/token'; // CONSOLIDÉ
import { toast } from 'react-hot-toast';
export default api;
export { api as apiClient };

// Configuration de l'API
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

class ApiClient {
  private static instance: ApiClient;
  private client: AxiosInstance;

  private constructor() {
    this.client = axios.create(API_CONFIG);
    this.setupInterceptors();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private setupInterceptors(): void {
    // INTERCEPTEUR REQUÊTE
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = TokenService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        if (import.meta.env.DEV) {
          console.log(`🌐 [API] ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
      },
      (error: AxiosError) => {
        console.error('❌ [API] Request Error:', error);
        return Promise.reject(error);
      }
    );

    // INTERCEPTEUR RÉPONSE (CORRIGÉ - ÉVITE LA BOUCLE)
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        if (import.meta.env.DEV) {
          console.log(`✅ [API] ${response.status} ${response.config.url}`);
        }
        return response;
      },
      (error: AxiosError) => {
        // Gestion 401 - Éviter la boucle infinie
        if (error.response?.status === 401) {
          const isLoginPage = window.location.pathname.includes('/login');
          
          if (!isLoginPage) {
            TokenService.clear();
            toast.error('Session expirée. Veuillez vous reconnecter.');
            
            setTimeout(() => {
              window.location.replace('/login');
            }, 100);
          } else {
            console.log('👤 Non authentifié, déjà sur login - pas de redirection');
          }
        }
        // Erreur 403 - Accès interdit
        else if (error.response?.status === 403) {
          toast.error("Vous n'avez pas les droits pour cette action");
        }
        // Erreur 404 - Ressource non trouvée
        else if (error.response?.status === 404) {
          toast.error('Ressource non trouvée');
        }
        // Erreur 422 - Validation
        else if (error.response?.status === 422) {
          const data = error.response.data as { error?: string };
          toast.error(data.error || 'Erreur de validation');
        }
        // Erreur 500 - Serveur
        else if (error.response?.status === 500) {
          toast.error('Erreur serveur. Veuillez réessayer plus tard.');
        }
        // Timeout
        else if (error.code === 'ECONNABORTED') {
          toast.error("Délai d'attente dépassé");
        }
        // Erreur réseau
        else if (!error.response) {
          toast.error('Impossible de contacter le serveur');
        }

        if (import.meta.env.DEV) {
          console.error('❌ [API] Response Error:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message
          });
        }
        return Promise.reject(error);
      }
    );
  }

  public getClient(): AxiosInstance {
    return this.client;
  }
}

// ✅ Export de l'instance par défaut ET nommée
const api = ApiClient.getInstance().getClient();

// ----- src\Services\api\import-export.ts -----
// import { apiClient } from './client'; // CONSOLIDÉ
// import type { ImportResponse, ExportProgress } from '../../types'; // CONSOLIDÉ
export const ImportExportService = {

  /**
   * Import d'un fichier (CSV ou Excel)
   * @param file - Fichier à importer
   * @param mode - 'standard' pour import simple, 'smart' pour import avec fusion intelligente
   */
  async importFile(file: File, mode: 'standard' | 'smart' = 'standard'): Promise<ImportResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    // ✅ CORRIGÉ: Endpoints corrects
    const endpoint = mode === 'smart' 
      ? '/import-export/import/smart-sync'  // ← Smart sync
      : '/import-export/import/csv';        // ← Import CSV standard
    
    const response = await apiClient.post<ImportResponse>(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 100)
        );
        console.log(`Upload: ${percentCompleted}%`);
      }
    });
    
    return response.data;
  },

  /**
   * Export des cartes
   * @param format - 'csv' ou 'excel'
   * @param params - Paramètres de filtre
   * @param onProgress - Callback de progression
   */
  async exportCartes(
    format: 'csv' | 'excel',
    params?: Record<string, string>,
    onProgress?: (progress: ExportProgress) => void
  ): Promise<Blob> {
    const endpoint = format === 'csv' 
      ? '/import-export/export/csv' 
      : '/import-export/export';
    
    const response = await apiClient.get(endpoint, {
      params,
      responseType: 'blob',
      onDownloadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress: ExportProgress = {
            percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            speed: '0 KB/s',
            estimatedTime: ''
          };
          onProgress(progress);
        }
      }
    });
    
    return response.data;
  },

  /**
   * Récupère la liste des sites
   */
  async getSites(): Promise<string[]> {
    const response = await apiClient.get<{ sites: string[] }>('/import-export/sites');
    return response.data.sites;
  },

  /**
   * Télécharge un template d'import
   * @param format - 'csv' ou 'excel'
   */
  async downloadTemplate(format: 'csv' | 'excel'): Promise<Blob> {
    const response = await apiClient.get('/import-export/template', {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Export complet (toutes les données)
   */
  async exportComplete(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const endpoint = format === 'csv'
      ? '/import-export/export/complete/csv'
      : '/import-export/export/complete';
    
    const response = await apiClient.get(endpoint, {
      responseType: 'blob'
    });
    
    return response.data;
  },

  /**
   * Export "tout en un" (choix automatique du format)
   */
  async exportAll(): Promise<Blob> {
    const response = await apiClient.get('/import-export/export/all', {
      responseType: 'blob'
    });
    
    return response.data;
  },

  /**
   * Export par site
   * @param site - Nom du site
   */
  async exportBySite(site: string): Promise<Blob> {
    const response = await apiClient.get('/import-export/export/site', {
      params: { siteRetrait: site },
      responseType: 'blob'
    });
    
    return response.data;
  }
};

// ----- src\Services\api\journal.ts -----
// import { apiClient } from './client'; // CONSOLIDÉ
// import type { ActionJournal, AnnulationResponse, PaginatedResponse, QueryParams } from '../../types'; // CONSOLIDÉ
export const JournalService = {

  async getActions(params?: QueryParams): Promise<PaginatedResponse<ActionJournal>> {
    const response = await apiClient.get<PaginatedResponse<ActionJournal>>('/journal', { params });
    return response.data;
  },

  async annulerAction(id: number): Promise<AnnulationResponse> {
    const response = await apiClient.post<AnnulationResponse>(`/journal/${id}/annuler`);
    return response.data;
  }
};

// ----- src\Services\api\profil.ts -----
// import api from './client'; // CONSOLIDÉ
export interface ProfilData {
export interface ActivityData {
export interface ProfilStats {
export const profilService = {
// src/Services/api/profil.ts

  id: number;
  nomUtilisateur: string;
  nomComplet: string;
  email: string;
  agence: string;
  role: string;
  coordination: string;
  datecreation: string;
  derniereconnexion: string;
}

  actiontype: string;
  action: string;
  dateaction: string;
  tablename: string;
  detailsaction: string;
}

  totalActions: number;
  actionsLast24h: number;
  actionsLast7Days: number;
  lastLogin: string | null;
  memberSince: string;
}

  /**
   * Récupérer le profil de l'utilisateur connecté
   * CORRECTION: Utilise /profil/me au lieu de /profil
   */
  async getProfile(): Promise<ProfilData> {
    const response = await api.get('/profil/me');
    return response.data.user || response.data;
  },

  /**
   * Mettre à jour le profil
   */
  async updateProfile(data: Partial<ProfilData>): Promise<any> {
    const response = await api.put('/profil/me', data);
    return response.data;
  },

  /**
   * Changer le mot de passe
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<any> {
    const response = await api.post('/profil/change-password', {
      currentPassword,
      newPassword,
      confirmPassword: newPassword
    });
    return response.data;
  },

  /**
   * Récupérer l'activité de l'utilisateur
   */
  async getActivity(page = 1, limit = 20): Promise<ActivityData[]> {
    const response = await api.get(`/profil/activity?page=${page}&limit=${limit}`);
    return response.data.activities || response.data;
  },

  /**
   * Récupérer les statistiques du profil
   */
  async getStats(): Promise<ProfilStats> {
    const response = await api.get('/profil/stats');
    return response.data.stats || response.data;
  },

  /**
   * Vérifier disponibilité du nom d'utilisateur
   */
  async checkUsername(username: string): Promise<boolean> {
    const response = await api.get(`/profil/check-username?username=${username}`);
    return response.data.available;
  },

  /**
   * Changer le nom d'utilisateur
   */
  async updateUsername(newUsername: string, password: string): Promise<any> {
    const response = await api.put('/profil/username', {
      newUsername,
      password
    });
    return response.data;
  }
};

// ----- src\Services\api\statistiques.ts -----
// import { apiClient } from './client'; // CONSOLIDÉ
// import type { StatistiquesGlobales, StatistiqueSite } from '../../types'; // CONSOLIDÉ
export const StatistiquesService = {
// src/Services/api/statistiques.ts


  /**
   * Récupérer les statistiques globales
   */
  async getStatistiquesGlobales(): Promise<StatistiquesGlobales> {
    const response = await apiClient.get('/statistiques/globales');

    return {
      total: response.data.total || 0,
      retires: response.data.retires || 0,
      restants: response.data.restants || 0,
      tauxRetrait: response.data.tauxRetrait || 0,
      metadata: response.data.metadata || {
        sites_actifs: 0,
        beneficiaires_uniques: 0,
        premiere_importation: '',
        derniere_importation: ''
      }
    };
  },

  /**
   * Récupérer les statistiques par site
   *
   * CORRECTION : Ajout d'une protection Array.isArray()
   *
   * Le backend avait un bug de cache qui retournait parfois un objet
   * { sites: [...], totals: {...}, count: N } au lieu d'un tableau,
   * ce qui causait "TypeError: Y.map is not a function" dans Dashboard.
   *
   * Ce bug est corrigé côté backend (statistiques.js), mais on garde
   * ici une double protection pour éviter tout crash futur.
   */
  async getStatistiquesParSite(): Promise<StatistiqueSite[]> {
    const response = await apiClient.get('/statistiques/sites');

    const sites = response.data.sites;

    // Cas normal : sites est un tableau
    if (Array.isArray(sites)) {
      return sites;
    }

    // Cas du bug de cache (ancienne structure) : sites est un objet
    // { sites: [...], totals: {...}, count: N }
    if (sites && Array.isArray((sites as any).sites)) {
      console.warn('[StatistiquesService] Structure de cache inattendue, extraction de sites.sites');
      return (sites as any).sites;
    }

    // Cas où response.data est directement un tableau
    if (Array.isArray(response.data)) {
      return response.data;
    }

    console.error('[StatistiquesService] Impossible d\'extraire un tableau depuis:', response.data);
    return [];
  },

  /**
   * Récupérer les statistiques détaillées (utile pour dashboard)
   */
  async getStatistiquesDetail(): Promise<any> {
    const response = await apiClient.get('/statistiques/detail');
    return response.data;
  },

  /**
   * Récupérer les statistiques rapides (pour widgets)
   */
  async getStatistiquesQuick(): Promise<any> {
    const response = await apiClient.get('/statistiques/quick');
    return response.data.stats || {};
  },

  /**
   * Forcer le rafraîchissement du cache
   */
  async refreshCache(): Promise<void> {
    await apiClient.post('/statistiques/refresh');
  }
};

// ----- src\Services\api\utilisateurs.ts -----
// import { apiClient } from './client'; // CONSOLIDÉ
import type {
export interface CreateUtilisateurData {
export interface UpdateUtilisateurData {
export const UtilisateursService = {
  Utilisateur,
  PaginatedResponse,
  QueryParams,
} from '../../types';

// ─── Interfaces ───────────────────────────────────────────────────────────────

// ✅ nomComplet ajouté
  nomUtilisateur: string;
  nomComplet?: string;
  role: string;
  coordination: string;
  agence: string;
  email?: string;
  telephone?: string;
  motDePasse: string;
}

// ✅ nomComplet ajouté
  nomComplet?: string;
  role?: string;
  coordination?: string;
  agence?: string;
  email?: string;
  telephone?: string;
  motDePasse?: string;
  actif?: boolean;
}

// ─── Service ──────────────────────────────────────────────────────────────────


  /**
   * ✅ BUG #4 CORRIGÉ
   * Le backend retourne { success, utilisateurs: [], pagination: {} }
   * et NON { data: [] } comme PaginatedResponse<T> l'attendait.
   */
  async getUtilisateurs(params?: QueryParams): Promise<PaginatedResponse<Utilisateur>> {
    const response = await apiClient.get<{
      success: boolean;
      utilisateurs: Utilisateur[];
      pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }>('/utilisateurs', { params });

    return {
      data: response.data.utilisateurs || [],
      pagination: {
        page:       response.data.pagination?.page       ?? 1,
        limit:      response.data.pagination?.limit      ?? 100,
        total:      response.data.pagination?.total      ?? 0,
        totalPages: response.data.pagination?.totalPages ?? 1,
      },
    };
  },

  /**
   * ✅ BUG #3 CORRIGÉ
   * Le backend retourne { success: true, utilisateur: { ... } }
   * et NON { data: { ... } }.
   */
  async getUtilisateurById(id: number): Promise<Utilisateur> {
    const response = await apiClient.get<{
      success: boolean;
      utilisateur: Utilisateur;
    }>(`/utilisateurs/${id}`);

    if (!response.data.utilisateur) {
      throw new Error(`Utilisateur ${id} non trouvé ou réponse invalide du serveur`);
    }
    return response.data.utilisateur;
  },

  async createUtilisateur(data: CreateUtilisateurData): Promise<Utilisateur> {
    const response = await apiClient.post<{ data: Utilisateur }>('/utilisateurs', data);
    return response.data.data;
  },

  async updateUtilisateur(id: number, data: UpdateUtilisateurData): Promise<Utilisateur> {
    const response = await apiClient.put<{ data: Utilisateur }>(`/utilisateurs/${id}`, data);
    return response.data.data;
  },

  async deleteUtilisateur(id: number): Promise<void> {
    await apiClient.delete(`/utilisateurs/${id}`);
  },

  async activateUtilisateur(id: number): Promise<void> {
    await apiClient.post(`/utilisateurs/${id}/activate`);
  }

};

// ----- src\Services\index.ts -----
// export * from './api/client'; // CONSOLIDÉ
// export * from './api/auth'; // CONSOLIDÉ
// export * from './api/cartes'; // CONSOLIDÉ
// export * from './api/utilisateurs'; // CONSOLIDÉ
// export * from './api/statistiques'; // CONSOLIDÉ
// export * from './api/journal'; // CONSOLIDÉ
// export * from './api/import-export'; // CONSOLIDÉ
// export * from './storage/token'; // CONSOLIDÉ


// ----- src\Services\interceptors\request.ts -----
import type { InternalAxiosRequestConfig } from 'axios';
// import { TokenService } from '../storage/token'; // CONSOLIDÉ
export function handleRequestInterceptor(

  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig {
  const token = TokenService.getToken();
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}

// ----- src\Services\interceptors\response.ts -----
import { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
// import { TokenService } from '../storage/token'; // CONSOLIDÉ
export async function handleResponseInterceptor(error: AxiosError): Promise<never> {

  const originalRequest = error.config;
  
  // Gestion des erreurs 401 (Non authentifié) - CORRIGÉ
  if (error.response?.status === 401 && originalRequest) {
    const isLoginPage = window.location.pathname.includes('/login');
    
    if (!isLoginPage) {
      TokenService.clear();
      toast.error('Session expirée. Veuillez vous reconnecter.');
      
      // Utiliser replace au lieu de href pour éviter la boucle
      setTimeout(() => {
        window.location.replace('/login');
      }, 100);
    } else {
      console.log('👤 Non authentifié, déjà sur login - pas de redirection');
    }
  }
  
  // Gestion des erreurs 403 (Accès interdit)
  if (error.response?.status === 403) {
    toast.error("Vous n'avez pas les droits pour effectuer cette action");
  }
  
  // Gestion des erreurs 422 (Validation)
  if (error.response?.status === 422) {
    const data = error.response.data as { error?: string };
    if (data.error) {
      toast.error(data.error);
    } else {
      toast.error('Erreur de validation des données');
    }
  }
  
  // Gestion des erreurs 500 (Serveur)
  if (error.response?.status === 500) {
    toast.error('Erreur serveur. Veuillez réessayer plus tard.');
  }
  
  // Gestion des erreurs réseau
  if (!error.response) {
    toast.error('Impossible de contacter le serveur. Vérifiez votre connexion.');
  }
  
  // Log en développement
  if (import.meta.env.DEV) {
    console.error('❌ [API] Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
  }
  
  return Promise.reject(error);
}

// ----- src\Services\storage\token.ts -----
export interface StoredUser {
export const TokenService = {
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

  id: number;
  nomUtilisateur: string;
  role: string;
  coordination: string;
  agence: string;
}

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  getUser(): StoredUser | null {
    const user = localStorage.getItem(USER_KEY);
    if (!user) return null;
    try {
      return JSON.parse(user) as StoredUser;
    } catch {
      return null;
    }
  },

  setUser(user: StoredUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  removeUser(): void {
    localStorage.removeItem(USER_KEY);
  },

  clear(): void {
    this.removeToken();
    this.removeUser();
  }
};

// ========== DOSSIER: hooks ==========

// ----- src\hooks\useApi.ts -----
import { useState, useCallback } from 'react';
import type { AxiosError } from 'axios';
import toast from 'react-hot-toast';
// import type { ApiResponse } from '../types'; // CONSOLIDÉ
export function useApi<T = unknown>(): UseApiReturn<T> {

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: AxiosError) => void;
  showSuccessToast?: boolean;
  successMessage?: string;
  showErrorToast?: boolean;
}

interface UseApiReturn<T> {
  loading: boolean;
  error: AxiosError | null;
  data: T | null;
  execute: (apiCall: () => Promise<T>, options?: UseApiOptions<T>) => Promise<T | undefined>;
  setData: (data: T | null) => void;
}

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AxiosError | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(
    async (
      apiCall: () => Promise<T>,
      options?: UseApiOptions<T>
    ): Promise<T | undefined> => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiCall();
        setData(result);
        
        if (options?.showSuccessToast) {
          toast.success(options.successMessage || 'Opération réussie');
        }
        
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const axiosError = err as AxiosError;
        setError(axiosError);
        
        if (options?.showErrorToast !== false) {
          const responseData = axiosError.response?.data as ApiResponse | undefined;
          const errorMessage = 
            responseData?.error || 
            (responseData?.data as { message?: string })?.message || 
            'Une erreur est survenue';
          
          toast.error(errorMessage);
        }
        
        options?.onError?.(axiosError);
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    data,
    execute,
    setData
  };
}

// ----- src\hooks\useAuth.ts -----
import { useContext } from 'react';
// import { AuthContext, type AuthContextType, type User } from '../context/AuthContext'; // CONSOLIDÉ
export const useAuth = (): AuthContextType => {
export const useUser = (): User | null => {
export const useHasRole = (roles: string[]): boolean => {
export const useUserCoordination = (): string | null => {

  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Hook spécifique pour obtenir l'utilisateur connecté
  const { user } = useAuth();
  return user;
};

// Hook pour vérifier les permissions
  const { hasRole } = useAuth();
  return hasRole(roles);
};

// Hook pour obtenir la coordination de l'utilisateur
  const { userCoordination } = useAuth();
  return userCoordination;
};

// ----- src\hooks\usePermissions.ts -----
// import { useAuth } from './useAuth'; // CONSOLIDÉ
// import type { UserRole, Permission } from '../config/roles.config'; // CONSOLIDÉ
// import { ROLE_PERMISSIONS } from '../config/roles.config'; // CONSOLIDÉ
export const usePermissions = () => {

  const { user } = useAuth();

  const getUserPermissions = (): Permission[] => {
    if (!user) return [];
    return ROLE_PERMISSIONS[user.role as UserRole] || [];
  };

  const canView = (page: string): boolean => {
    const permissions = getUserPermissions();
    const pagePermission = permissions.find(p => p.page === page);
    return pagePermission?.actions.includes('view') || false;
  };

  const canCreate = (page: string): boolean => {
    const permissions = getUserPermissions();
    const pagePermission = permissions.find(p => p.page === page);
    return pagePermission?.actions.includes('create') || false;
  };

  const canEdit = (page: string, field?: string): boolean => {
    const permissions = getUserPermissions();
    const pagePermission = permissions.find(p => p.page === page);
    
    if (!pagePermission?.actions.includes('edit')) return false;
    
    // Vérifier les champs modifiables pour Chef d'équipe
    if (field && pagePermission.fields) {
      return pagePermission.fields.includes(field);
    }
    
    return true;
  };

  const canDelete = (page: string): boolean => {
    const permissions = getUserPermissions();
    const pagePermission = permissions.find(p => p.page === page);
    return pagePermission?.actions.includes('delete') || false;
  };

  const canImport = (): boolean => {
    const permissions = getUserPermissions();
    const pagePermission = permissions.find(p => p.page === 'import-export');
    return pagePermission?.actions.includes('import') || false;
  };

  const canExport = (): boolean => {
    const permissions = getUserPermissions();
    const pagePermission = permissions.find(p => p.page === 'import-export');
    return pagePermission?.actions.includes('export') || false;
  };

  const canAnnuler = (): boolean => {
    const permissions = getUserPermissions();
    const pagePermission = permissions.find(p => p.page === 'journal');
    return pagePermission?.actions.includes('annuler') || false;
  };

  const getFilterByCoordination = (): boolean => {
    if (!user) return false;
    const permissions = getUserPermissions();
    const statsPermission = permissions.find(p => p.page === 'statistiques');
    return statsPermission?.filter === 'coordination';
  };

  return {
    user,
    getUserPermissions,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canImport,
    canExport,
    canAnnuler,
    getFilterByCoordination
  };
};

// ========== DOSSIER: context ==========

// ----- src\context\AuthContext.tsx -----
import { createContext } from "react";
export interface User {
export interface AuthContextType {
export const AuthContext = createContext<AuthContextType>({
// src/context/AuthContext.tsx

// Définition du type User plus précis - ✅ CORRIGÉ avec nomComplet
  id: number;
  nomUtilisateur: string;
  nomComplet: string;                    // ← AJOUTÉ (nom complet pour affichage)
  role: 'Administrateur' | 'Gestionnaire' | "Chef d'équipe" | 'Opérateur';
  coordination: string;
  agence: string;
  email?: string;
  telephone?: string;
  actif: boolean;
  dateCreation: string;
  derniereConnexion?: string;
}

// Définition du type pour le contexte
  token: string | null;
  role: 'Administrateur' | 'Gestionnaire' | "Chef d'équipe" | 'Opérateur' | null;
  user: User | null;
  setAuth: (token: string, role: string, userData?: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: string[]) => boolean;
  userCoordination: string | null;
}

// Création du contexte avec des valeurs par défaut
  token: null,
  role: null,
  user: null,
  setAuth: () => {},
  logout: () => {},
  isAuthenticated: false,
  hasRole: () => false,
  userCoordination: null,
});

// ========== DOSSIER: providers ==========

// ----- src\providers\AuthProvider.tsx -----
import { useState, useEffect } from "react";
import type { ReactNode } from "react";
// import { AuthContext, type User } from "../context/AuthContext"; // CONSOLIDÉ
export const AuthProvider = ({ children }: AuthProviderProps) => {

// Props du provider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider complet
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [role, setRole] = useState<'Administrateur' | 'Gestionnaire' | "Chef d'équipe" | 'Opérateur' | null>(
    localStorage.getItem("role") as 'Administrateur' | 'Gestionnaire' | "Chef d'équipe" | 'Opérateur' | null
  );
  const [user, setUser] = useState<User | null>(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        return JSON.parse(userData) as User;
      } catch {
        return null;
      }
    }
    return null;
  });

  // Fonction pour authentifier l'utilisateur
  const setAuth = (token: string, role: string, userData?: User): void => {
    const typedRole = role as 'Administrateur' | 'Gestionnaire' | "Chef d'équipe" | 'Opérateur';
    
    setToken(token);
    setRole(typedRole);
    
    // ✅ CORRIGÉ: Ajout de nomComplet dans l'objet par défaut
    setUser(userData || { 
      id: 0, 
      nomUtilisateur: 'Utilisateur',
      nomComplet: 'Utilisateur',          // ← AJOUTÉ
      role: typedRole, 
      coordination: '', 
      agence: '', 
      actif: true, 
      dateCreation: new Date().toISOString() 
    });

    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    }
  };

  // Fonction pour déconnecter l'utilisateur
  const logout = (): void => {
    setToken(null);
    setRole(null);
    setUser(null);

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
  };

  // Vérifier si l'utilisateur a un certain rôle
  const hasRole = (roles: string[]): boolean => {
    if (!role) return false;
    return roles.includes(role);
  };

  const isAuthenticated = !!token;
  const userCoordination = user?.coordination || null;

  // Vérification au chargement
  useEffect(() => {
    const checkTokenValidity = (): void => {
      if (token) {
        console.log("✅ Utilisateur authentifié :", { role, user });
      }
    };

    checkTokenValidity();
  }, [token, role, user]);

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        user,
        setAuth,
        logout,
        isAuthenticated,
        hasRole,
        userCoordination,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ========== DOSSIER: components ==========

// ----- src\components\Button.tsx -----
import React from "react";
import { motion } from "framer-motion";
import { ArrowPathIcon } from '@heroicons/react/24/outline';  // ✅ Garder seulement celui utilisé
export const PrimaryButton: React.FC<Omit<ButtonProps, 'color' | 'variant'>> = (props) => (
export const SecondaryButton: React.FC<Omit<ButtonProps, 'color' | 'variant'>> = (props) => (
export const SuccessButton: React.FC<Omit<ButtonProps, 'color' | 'variant'>> = (props) => (
export const DangerButton: React.FC<Omit<ButtonProps, 'color' | 'variant'>> = (props) => (
export const IconButton: React.FC<Omit<ButtonProps, 'size'> & { icon: React.ReactNode }> = ({ text, icon, ...props }) => (
export default Button;

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
  <Button color="orange" variant="solid" {...props} />
);

  <Button color="blue" variant="outline" {...props} />
);

  <Button color="green" variant="solid" {...props} />
);

  <Button color="red" variant="solid" {...props} />
);

  <Button size="sm" text={text} icon={icon} iconPosition="left" {...props} />
);


// ----- src\components\ChartCartes.tsx -----
import React, { useState, useEffect } from "react";
import { 
import { ChartBarIcon } from '@heroicons/react/24/outline';
export default ChartCartes;
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Tooltip,
  Legend
} from "recharts";

// Types pour les données
interface ChartDataItem {
  site: string;
  total: number;
  retirees?: number;
  delivrees?: number;
  enAttente?: number;
}

interface ChartCartesProps {
  data: ChartDataItem[];
  title?: string;
  height?: number;
  type?: 'bar' | 'pie' | 'line';
  showLegend?: boolean;
  showGrid?: boolean;
}

const ChartCartes: React.FC<ChartCartesProps> = ({ 
  data, 
  title = "Statistiques des Cartes par Site",
  height = 400,
  type = 'bar',
  showLegend = true,
  showGrid = true
}) => {
  
  // Responsive
  const [isMobile, setIsMobile] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>(type);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Adapter la hauteur pour mobile
  const chartHeight = isMobile ? height * 0.7 : height;

  // Calculer les totaux
  const totalCartes = data.reduce((sum, item) => sum + (item.total || 0), 0);
  const totalDelivrees = data.reduce((sum, item) => sum + (item.delivrees || item.retirees || 0), 0);
  const totalEnAttente = data.reduce((sum, item) => sum + (item.enAttente || (item.total - (item.delivrees || item.retirees || 0))), 0);

  // Format personnalisé pour le tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const delivrees = dataPoint.delivrees || dataPoint.retirees || 0;
      const enAttente = dataPoint.enAttente || (dataPoint.total - delivrees);
      
      return (
        <div className="bg-white/95 backdrop-blur-lg border border-orange-200 rounded-xl md:rounded-2xl p-3 md:p-4 shadow-xl max-w-[250px] md:max-w-xs">
          <p className="font-semibold text-gray-800 mb-2 text-sm md:text-base">
            {dataPoint.site}
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 md:w-3 md:h-3 bg-[#0077B6] rounded-full"></div>
                <span className="text-xs md:text-sm text-gray-600">Total:</span>
              </div>
              <span className="font-semibold text-[#0077B6] text-xs md:text-sm">
                {dataPoint.total.toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 md:w-3 md:h-3 bg-[#2E8B57] rounded-full"></div>
                <span className="text-xs md:text-sm text-gray-600">Délivrées:</span>
              </div>
              <span className="font-semibold text-[#2E8B57] text-xs md:text-sm">
                {delivrees.toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 md:w-3 md:h-3 bg-[#F77F00] rounded-full"></div>
                <span className="text-xs md:text-sm text-gray-600">En attente:</span>
              </div>
              <span className="font-semibold text-[#F77F00] text-xs md:text-sm">
                {enAttente.toLocaleString()}
              </span>
            </div>

            <div className="border-t border-gray-200 mt-2 pt-2">
              <p className="text-xs md:text-sm text-gray-500">
                Taux de délivrance: {dataPoint.total > 0 ? ((delivrees / dataPoint.total) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Format personnalisé pour le tooltip du pie chart
  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-lg border border-orange-200 rounded-xl md:rounded-2xl p-3 md:p-4 shadow-xl">
          <p className="font-semibold text-gray-800 text-sm md:text-base">{data.name}</p>
          <p className="text-xs md:text-sm text-gray-600 mt-1">
            Valeur: <span className="font-bold text-[#0077B6]">{data.value.toLocaleString()}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {totalCartes > 0 ? ((data.value / totalCartes) * 100).toFixed(1) : 0}% du total
          </p>
        </div>
      );
    }
    return null;
  };

  // Format personnalisé pour la légende
  const renderLegend = (props: any) => {
    const { payload } = props;
    if (!payload) return null;
    
    return (
      <div className="flex flex-wrap justify-center gap-3 md:gap-6 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-1.5 md:gap-2">
            <div 
              className="w-2 h-2 md:w-3 md:h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs md:text-sm font-medium text-gray-700">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  // Données pour le pie chart
  const pieData = [
    { name: 'Cartes délivrées', value: totalDelivrees, color: '#2E8B57' },
    { name: 'Cartes en attente', value: totalEnAttente, color: '#F77F00' }
  ];

  // Données pour le line chart (évolution)
  const lineData = data.map((item) => ({
    name: item.site,
    total: item.total,
    delivrees: item.delivrees || item.retirees || 0,
    enAttente: item.enAttente || (item.total - (item.delivrees || item.retirees || 0))
  }));

  return (
    <div className="bg-white/90 backdrop-blur-lg rounded-xl md:rounded-2xl shadow-xl border border-orange-100 p-3 md:p-6">
      
      {/* En-tête avec sélecteur de type */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 md:mb-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-gradient-to-r from-[#F77F00] to-[#FF9E40] rounded-lg md:rounded-xl flex items-center justify-center`}>
            <ChartBarIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-white`} />
          </div>
          <div>
            <h3 className={`font-bold text-gray-800 ${isMobile ? 'text-sm' : 'text-lg md:text-xl'}`}>
              {title}
            </h3>
            <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {data.length} site{data.length > 1 ? 's' : ''} • {totalCartes.toLocaleString()} cartes
            </p>
          </div>
        </div>

        {/* Sélecteur de type de graphique */}
        <div className="flex items-center gap-1 md:gap-2 bg-gray-100 p-1 rounded-lg self-start md:self-auto">
          <button
            onClick={() => setChartType('bar')}
            className={`px-2 py-1 md:px-3 md:py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors ${
              chartType === 'bar' 
                ? 'bg-white text-[#F77F00] shadow-sm' 
                : 'text-gray-600 hover:text-[#F77F00]'
            }`}
          >
            Barres
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`px-2 py-1 md:px-3 md:py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors ${
              chartType === 'pie' 
                ? 'bg-white text-[#F77F00] shadow-sm' 
                : 'text-gray-600 hover:text-[#F77F00]'
            }`}
          >
            Circulaire
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`px-2 py-1 md:px-3 md:py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors ${
              chartType === 'line' 
                ? 'bg-white text-[#F77F00] shadow-sm' 
                : 'text-gray-600 hover:text-[#F77F00]'
            }`}
          >
            Lignes
          </button>
        </div>
      </div>

      {/* Graphique */}
      <ResponsiveContainer width="100%" height={chartHeight}>
        {chartType === 'bar' && (
          <BarChart
            data={data}
            margin={{ 
              top: 10, 
              right: isMobile ? 10 : 30, 
              left: isMobile ? 0 : 10, 
              bottom: isMobile ? 40 : 60 
            }}
          >
            {showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#f0f0f0" 
                vertical={false}
              />
            )}
            <XAxis 
              dataKey="site"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: isMobile ? 10 : 12 }}
              angle={isMobile ? -45 : -30}
              textAnchor="end"
              height={isMobile ? 60 : 80}
              interval={isMobile ? 1 : 0}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 40 : 50}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend content={renderLegend} />}
            <Bar 
              dataKey="total" 
              name="Total des cartes"
              fill="#0077B6"
              radius={[4, 4, 0, 0]}
              maxBarSize={isMobile ? 30 : 50}
            />
            <Bar 
              dataKey={data[0]?.delivrees !== undefined ? "delivrees" : "retirees"} 
              name="Cartes délivrées"
              fill="#2E8B57"
              radius={[4, 4, 0, 0]}
              maxBarSize={isMobile ? 30 : 50}
            />
          </BarChart>
        )}

        {chartType === 'pie' && (
          <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={isMobile ? 40 : 60}
              outerRadius={isMobile ? 70 : 100}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              label={!isMobile ? (entry: any) => `${entry.name} ${((entry.value / totalCartes) * 100).toFixed(0)}%` : undefined}
              labelLine={!isMobile}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
            {showLegend && (
              <Legend 
                layout={isMobile ? 'horizontal' : 'vertical'}
                align="right"
                verticalAlign={isMobile ? 'bottom' : 'middle'}
                wrapperStyle={{ fontSize: isMobile ? 10 : 12 }}
              />
            )}
          </PieChart>
        )}

        {chartType === 'line' && (
          <LineChart
            data={lineData}
            margin={{ 
              top: 10, 
              right: isMobile ? 10 : 30, 
              left: isMobile ? 0 : 10, 
              bottom: isMobile ? 40 : 60 
            }}
          >
            {showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#f0f0f0" 
                vertical={false}
              />
            )}
            <XAxis 
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: isMobile ? 10 : 12 }}
              angle={isMobile ? -45 : -30}
              textAnchor="end"
              height={isMobile ? 60 : 80}
              interval={isMobile ? 1 : 0}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 40 : 50}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend content={renderLegend} />}
            <Line 
              type="monotone" 
              dataKey="total" 
              name="Total des cartes"
              stroke="#0077B6" 
              strokeWidth={2}
              dot={{ r: isMobile ? 3 : 4, fill: "#0077B6" }}
              activeDot={{ r: isMobile ? 5 : 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="delivrees" 
              name="Cartes délivrées"
              stroke="#2E8B57" 
              strokeWidth={2}
              dot={{ r: isMobile ? 3 : 4, fill: "#2E8B57" }}
              activeDot={{ r: isMobile ? 5 : 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="enAttente" 
              name="En attente"
              stroke="#F77F00" 
              strokeWidth={2}
              dot={{ r: isMobile ? 3 : 4, fill: "#F77F00" }}
              activeDot={{ r: isMobile ? 5 : 6 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>

      {/* Résumé des totaux */}
      <div className="grid grid-cols-3 gap-2 md:gap-4 mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-xs md:text-sm text-gray-600 mb-1">Total</div>
          <div className="font-bold text-[#0077B6] text-sm md:text-lg">
            {totalCartes.toLocaleString()}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs md:text-sm text-gray-600 mb-1">Délivrées</div>
          <div className="font-bold text-[#2E8B57] text-sm md:text-lg">
            {totalDelivrees.toLocaleString()}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs md:text-sm text-gray-600 mb-1">En attente</div>
          <div className="font-bold text-[#F77F00] text-sm md:text-lg">
            {totalEnAttente.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};


// ----- src\components\CoordinationDropdown.tsx -----
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
// import api from '../Services/api/client'; // CONSOLIDÉ
export default CoordinationDropdown;
// src/components/CoordinationDropdown.tsx
  ChevronDownIcon, ChevronUpIcon,
  MagnifyingGlassIcon, XMarkIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/24/outline';

interface CoordinationDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const CoordinationDropdown: React.FC<CoordinationDropdownProps> = ({
  value,
  onChange,
  placeholder = 'Sélectionner une coordination',
  className = '',
  disabled = false,
}) => {
  const [coordinations, setCoordinations] = useState<string[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState('');
  const [isOpen,         setIsOpen]         = useState(false);
  const [filtered,       setFiltered]       = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // ✅ Même pattern que SiteDropdown — baseURL inclut déjà /api
      const res = await api.get('/cartes/coordinations');
      const list: string[] = res.data.coordinations || res.data || [];
      setCoordinations(list);
      setFiltered(list);
    } catch {
      // Fallback silencieux
      setCoordinations([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    setFiltered(
      search === ''
        ? coordinations
        : coordinations.filter(c => c.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, coordinations]);

  const handleSelect = (coord: string) => {
    onChange(coord === value ? '' : coord); // re-clic = désélection
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-gray-50 border rounded-xl text-sm transition-all focus:outline-none ${
          isOpen
            ? 'border-[#E07B00] ring-2 ring-[#E07B00]/20'
            : 'border-gray-200 hover:border-[#E07B00]/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <BuildingOffice2Icon className="w-4 h-4 text-[#E07B00] flex-shrink-0" />
          <span className={`truncate ${value ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
            {loading ? 'Chargement…' : value || placeholder}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {value && (
            <button type="button" onClick={handleClear}
              className="p-0.5 hover:bg-gray-200 rounded-full transition-all">
              <XMarkIcon className="w-3 h-3 text-gray-400" />
            </button>
          )}
          {isOpen
            ? <ChevronUpIcon className="w-4 h-4 text-gray-400" />
            : <ChevronDownIcon className="w-4 h-4 text-gray-400" />
          }
        </div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
          >
            {/* Recherche */}
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input type="text" value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Filtrer…"
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#E07B00]" />
              </div>
            </div>

            {/* Options */}
            <div className="max-h-52 overflow-y-auto">
              {loading ? (
                <div className="px-4 py-3 text-sm text-gray-400 text-center">Chargement…</div>
              ) : filtered.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-400 text-center">Aucun résultat</div>
              ) : (
                filtered.map(coord => (
                  <button key={coord} type="button"
                    onClick={() => handleSelect(coord)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-orange-50 transition-colors ${
                      coord === value ? 'bg-orange-50 text-[#E07B00] font-semibold' : 'text-gray-700'
                    }`}
                  >
                    <span>{coord}</span>
                    {coord === value && (
                      <div className="w-4 h-4 bg-[#E07B00] rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


// ----- src\components\Header.tsx -----
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
export const PageHeader: React.FC<Omit<HeaderProps, 'size'>> = (props) => (
export const SectionHeader: React.FC<Omit<HeaderProps, 'size'>> = (props) => (
export const CardHeader: React.FC<Omit<HeaderProps, 'size' | 'gradient'> & { noGradient?: boolean }> = ({ 
export default Header;
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
  <Header size="lg" {...props} />
);

  <Header size="md" {...props} />
);

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


// ----- src\components\ImportModal.tsx -----
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// import api from "../Services/api/client"; // CONSOLIDÉ
import {
export default ImportModal;
// src/components/ImportModal.tsx
  DocumentArrowUpIcon,
  DocumentTextIcon,
  TableCellsIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: File) => Promise<void> | void;
  isImporting: boolean;
  mode?: 'standard' | 'smart';
  onModeChange?: (mode: 'standard' | 'smart') => void;
}

const ImportModal: React.FC<ImportModalProps> = ({
  isOpen, onClose, onFileSelect, isImporting, mode = 'standard', onModeChange
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [hideInstructions, setHideInstructions] = useState(
    localStorage.getItem('hideImportInstructions') === 'true'
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [recommendation, setRecommendation] = useState<string>('');

  const [isMobile, setIsMobile] = useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const validateFile = (f: File): boolean => {
    setValidationError(null);
    setRecommendation('');
    const isCSV = f.name.toLowerCase().endsWith('.csv');
    const isExcel = /\.(xlsx|xls)$/i.test(f.name);
    if (!isCSV && !isExcel) { setValidationError('Format non supporté. Utilisez .csv, .xlsx ou .xls'); return false; }
    if (f.size > 50 * 1024 * 1024) { setValidationError(`Fichier trop volumineux (${(f.size/1024/1024).toFixed(1)} MB). Maximum: 50 MB`); return false; }
    if (f.size === 0) { setValidationError('Le fichier est vide'); return false; }
    const mb = f.size / (1024 * 1024);
    if (isExcel && mb > 10) setRecommendation('Pour de meilleures performances, convertissez ce fichier en CSV');
    else if (isCSV) setRecommendation('Format CSV optimisé pour les imports volumineux');
    return true;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { if (validateFile(f)) setFile(f); else setFile(null); }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) { if (validateFile(f)) setFile(f); else setFile(null); }
  };

  const handleSubmit = async () => {
    if (!file || !onFileSelect) return;
    try {
      await onFileSelect(file);
      if (hideInstructions) localStorage.setItem('hideImportInstructions', 'true');
      handleClose();
    } catch (err) { console.error('Erreur import:', err); }
  };

  const handleClose = () => {
    setFile(null); setValidationError(null); setIsDragging(false); setRecommendation('');
    onClose();
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${['B','KB','MB','GB'][i]}`;
  };

  const handleDownloadTemplate = async (format: 'csv' | 'excel') => {
    try {
      if (format === 'csv') {
        const csv = `NOM,PRENOM,TELEPHONE,EMAIL,DATE_NAISSANCE,LIEU_NAISSANCE,CONTACT_RETRAIT\nKOUAME,Jean,01234567,jean@email.com,2001-07-12,Abidjan,07654321\nTRAORE,Amina,09876543,amina@email.com,2015-01-25,Abidjan,01234567`;
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'template-import-cartes.csv';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        const response = await api.get('/import-export/template', { responseType: 'blob' });
        const url = window.URL.createObjectURL(response.data);
        const a = document.createElement('a');
        a.href = url; a.download = 'template-import-cartes.xlsx';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
      alert(`Template ${format.toUpperCase()} téléchargé !`);
    } catch { alert('Erreur lors du téléchargement du template'); }
  };

  if (!isOpen) return null;

  const ext = file?.name.split('.').pop()?.toUpperCase() || '';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="relative bg-white w-full max-w-xl sm:rounded-2xl shadow-2xl max-h-[95vh] overflow-y-auto"
          style={{ borderRadius: isMobile ? '20px 20px 0 0' : undefined }}
        >
          {/* Drag handle mobile */}
          {isMobile && <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-1" />}

          {/* ── Header ── */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] px-5 py-4 sm:rounded-t-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <DocumentArrowUpIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-black text-white text-base leading-tight">
                    {mode === 'smart' ? 'Synchronisation intelligente' : 'Importation de données'}
                  </h2>
                  <p className="text-white/80 text-xs mt-0.5">
                    {mode === 'smart' ? 'Synchronise sans créer de doublons' : 'Ajouter de nouvelles cartes'}
                  </p>
                </div>
              </div>
              <button onClick={handleClose} disabled={isImporting}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors text-white disabled:opacity-50 flex-shrink-0">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-5">

            {/* ── Mode selector ── */}
            {onModeChange && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2.5">Mode d'importation</p>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { id: 'standard', label: 'Standard', desc: 'Ajoute seulement', icon: DocumentTextIcon, color: 'blue' },
                    { id: 'smart',    label: 'Intelligent', desc: 'Synchronise', icon: SparklesIcon, color: 'green' },
                  ] as const).map(m => (
                    <button
                      key={m.id}
                      onClick={() => onModeChange(m.id)}
                      disabled={isImporting}
                      className={`relative p-4 rounded-xl border-2 transition-all text-left group
                        ${mode === m.id
                          ? m.color === 'blue' ? 'border-blue-500 bg-blue-50' : 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'}
                        ${isImporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {mode === m.id && (
                        <div className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center ${m.color === 'blue' ? 'bg-blue-500' : 'bg-emerald-500'}`}>
                          <CheckCircleIcon className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                      <m.icon className={`w-6 h-6 mb-2 ${mode === m.id ? (m.color === 'blue' ? 'text-blue-600' : 'text-emerald-600') : 'text-gray-400'}`} />
                      <p className={`font-bold text-sm ${mode === m.id ? (m.color === 'blue' ? 'text-blue-800' : 'text-emerald-800') : 'text-gray-700'}`}>{m.label}</p>
                      <p className={`text-xs mt-0.5 ${mode === m.id ? (m.color === 'blue' ? 'text-blue-600' : 'text-emerald-600') : 'text-gray-400'}`}>{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Info mode ── */}
            <div className={`rounded-xl p-4 border ${mode === 'smart' ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${mode === 'smart' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                  {mode === 'smart' ? <SparklesIcon className="w-4 h-4 text-emerald-600" /> : <InformationCircleIcon className="w-4 h-4 text-blue-600" />}
                </div>
                <ul className="space-y-1.5">
                  {(mode === 'smart' ? [
                    'Met à jour la délivrance si différente',
                    'Conserve les contacts existants',
                    'Ajoute les nouvelles personnes automatiquement',
                  ] : [
                    'Ajoute uniquement les nouvelles cartes',
                    'Ignore les entrées déjà existantes',
                  ]).map((item, i) => (
                    <li key={i} className={`flex items-start gap-2 text-xs font-medium ${mode === 'smart' ? 'text-emerald-700' : 'text-blue-700'}`}>
                      <CheckCircleIcon className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${mode === 'smart' ? 'text-emerald-500' : 'text-blue-500'}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── Templates ── */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2.5">Télécharger un template</p>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { format: 'csv' as const, label: 'CSV', sub: 'Optimisé', icon: DocumentTextIcon, cls: 'border-green-200 hover:border-green-400 text-green-700 bg-green-50 hover:bg-green-100' },
                  { format: 'excel' as const, label: 'Excel', sub: 'Compatible', icon: TableCellsIcon, cls: 'border-blue-200 hover:border-blue-400 text-blue-700 bg-blue-50 hover:bg-blue-100' },
                ].map(t => (
                  <button key={t.format} onClick={() => handleDownloadTemplate(t.format)} disabled={isImporting}
                    className={`flex items-center gap-3 px-4 py-3 border-2 rounded-xl font-semibold text-sm transition-all ${t.cls} disabled:opacity-50`}>
                    <t.icon className="w-5 h-5 flex-shrink-0" />
                    <div className="text-left">
                      <div>{t.label}</div>
                      <div className="text-xs opacity-70 font-normal">{t.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Zone dépôt fichier ── */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2.5">Fichier à importer</p>
              <div
                onDragOver={e => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                onDragLeave={e => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
                onDrop={handleDrop}
                onClick={() => !isImporting && document.getElementById('import-file-input')?.click()}
                className={`relative border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer overflow-hidden
                  ${isDragging ? 'border-[#F77F00] bg-orange-50 scale-[1.01]' : file ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50 hover:border-[#F77F00] hover:bg-orange-50/40'}
                  ${isImporting ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                <input type="file" id="import-file-input" accept=".xlsx,.xls,.csv" className="hidden"
                  onChange={handleFileSelect} disabled={isImporting} />

                {file ? (
                  <div className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-green-800 text-sm truncate">{file.name}</p>
                      <p className="text-green-600 text-xs mt-0.5">{formatSize(file.size)} · {ext}</p>
                      {recommendation && (
                        <p className="text-blue-600 text-xs mt-1 flex items-center gap-1">
                          <InformationCircleIcon className="w-3 h-3 flex-shrink-0" />{recommendation}
                        </p>
                      )}
                    </div>
                    {!isImporting && (
                      <button onClick={e => { e.stopPropagation(); setFile(null); }}
                        className="w-7 h-7 bg-white rounded-lg border border-gray-200 hover:border-red-200 hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all flex-shrink-0">
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-colors ${isDragging ? 'bg-orange-100' : 'bg-gray-100'}`}>
                      <CloudArrowUpIcon className={`w-7 h-7 ${isDragging ? 'text-[#F77F00]' : 'text-gray-400'}`} />
                    </div>
                    <p className="font-bold text-gray-700 text-sm">
                      {isDragging ? 'Déposez le fichier ici' : 'Glissez-déposez ou cliquez pour sélectionner'}
                    </p>
                    <p className="text-gray-400 text-xs mt-1.5">CSV, XLSX, XLS · Maximum 50 MB</p>
                  </div>
                )}
              </div>

              {/* Erreur validation */}
              <AnimatePresence>
                {validationError && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mt-3 flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl p-3">
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 text-xs font-medium">{validationError}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Instructions ── */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2.5">
                <InformationCircleIcon className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <h4 className="font-bold text-amber-800 text-sm">Instructions</h4>
              </div>
              <ul className="space-y-1.5">
                {['Colonnes NOM et PRENOM sont obligatoires', 'Format des dates : AAAA-MM-JJ (ex: 2024-01-15)', 'Encodage recommandé : UTF-8'].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-amber-700">
                    <span className="text-amber-500 font-bold mt-0.5">•</span>{item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Option masquer */}
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div onClick={() => {
                const v = !hideInstructions;
                setHideInstructions(v);
                localStorage.setItem('hideImportInstructions', String(v));
              }}
                className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${hideInstructions ? 'bg-[#F77F00]' : 'bg-gray-200'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${hideInstructions ? 'left-4' : 'left-0.5'}`} />
              </div>
              <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">Ne plus afficher ces instructions</span>
            </label>

            {/* ── Boutons ── */}
            <div className="flex gap-3 pt-1">
              <button onClick={handleClose} disabled={isImporting}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-semibold text-sm transition-all disabled:opacity-50">
                Annuler
              </button>
              <button onClick={handleSubmit} disabled={!file || isImporting || !!validationError}
                className="flex-1 py-3 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] hover:from-[#e46f00] hover:to-[#FF8C00] text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md disabled:shadow-none">
                {isImporting ? (
                  <><ArrowPathIcon className="w-4 h-4 animate-spin" />{mode === 'smart' ? 'Synchronisation…' : 'Importation…'}</>
                ) : (
                  <><CloudArrowUpIcon className="w-4 h-4" />{mode === 'smart' ? 'Synchroniser' : 'Importer'}</>
                )}
              </button>
            </div>
          </div>

          {/* Pied */}
          <div className="border-t border-gray-100 bg-gray-50 px-5 py-3 sm:rounded-b-2xl">
            <p className="text-gray-400 text-xs flex items-center gap-1.5">
              <InformationCircleIcon className="w-3.5 h-3.5 flex-shrink-0" />
              L'import peut prendre quelques minutes selon la taille du fichier
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};


// ----- src\components\MotivationQuotes.tsx -----
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
export default MotivationQuotes;
  ChevronLeftIcon, 
  ChevronRightIcon,
  SparklesIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

interface MotivationQuotesProps {
  isMobile?: boolean;
}

const MotivationQuotes: React.FC<MotivationQuotesProps> = ({ isMobile = false }) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const quotes = [
    { text: "« Ensemble, allons plus loin. »" },
    { text: "« Chaque carte distribuée rapproche notre objectif. »" },
    { text: "« Votre engagement fait la différence. »" },
    { text: "« Restons concentrés, restons efficaces. »" },
    { text: "« Une équipe soudée réussit toujours. »" },
    { text: "« Le professionnalisme est notre force. »" },
    { text: "« Aujourd'hui, faisons mieux qu'hier. »" },
    { text: "« Petit effort, grand résultat. »" },
    { text: "« L'excellence est un choix quotidien. »" },
    { text: "« Chaque détail compte pour la réussite. »" }
  ];

  useEffect(() => {
    if (isPaused) return;
    
    const quoteTimer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 8000);
    
    return () => clearInterval(quoteTimer);
  }, [quotes.length, isPaused]);

  const handlePrevious = () => {
    setQuoteIndex((prev) => (prev - 1 + quotes.length) % quotes.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 15000);
  };

  const handleNext = () => {
    setQuoteIndex((prev) => (prev + 1) % quotes.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 15000);
  };

  return (
    <div className={`relative bg-gradient-to-r from-[#2E8B57] to-[#0077B6] text-white ${
      isMobile ? 'py-2' : 'py-3 md:py-4'
    } overflow-hidden`}>
      
      {/* Éléments décoratifs */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-20 h-20 bg-white rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-white rounded-full filter blur-3xl"></div>
      </div>
      
      <div className={`${isMobile ? 'px-3' : 'container mx-auto px-4 md:px-6'} relative z-10`}>
        <div className="flex items-center justify-between gap-2 md:gap-4">
          
          {/* Bouton précédent */}
          <motion.button
            onClick={handlePrevious}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`${isMobile ? 'p-1' : 'p-1.5 md:p-2'} rounded-full bg-white/20 hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50`}
            aria-label="Citation précédente"
          >
            <ChevronLeftIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
          </motion.button>

          {/* Contenu principal */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={quoteIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <div className="flex flex-col items-center gap-1 md:gap-2">
                  
                  {/* Indicateurs de progression */}
                  <div className="flex items-center justify-center gap-1">
                    {quotes.map((_, index) => (
                      <div
                        key={index}
                        className={`h-0.5 md:h-1 rounded-full transition-all duration-300 ${
                          index === quoteIndex 
                            ? 'bg-white w-3 md:w-4' 
                            : 'bg-white/30 w-1 md:w-1'
                        }`}
                      />
                    ))}
                  </div>
                  
                  {/* Citation avec icônes décoratives */}
                  <div className="flex items-center justify-center gap-2 md:gap-4">
                    <SparklesIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-white/70`} />
                    <p className={`font-medium italic ${
                      isMobile 
                        ? 'text-xs md:text-sm' 
                        : 'text-sm md:text-base lg:text-lg'
                    } max-w-2xl`}>
                      {quotes[quoteIndex].text}
                    </p>
                    <SparklesIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-white/70`} />
                  </div>
                  
                  {/* Compteur */}
                  {!isMobile && (
                    <div className="text-xs text-white/60">
                      {quoteIndex + 1} / {quotes.length}
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bouton suivant */}
          <motion.button
            onClick={handleNext}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`${isMobile ? 'p-1' : 'p-1.5 md:p-2'} rounded-full bg-white/20 hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50`}
            aria-label="Citation suivante"
          >
            <ChevronRightIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
          </motion.button>
        </div>
        
        {/* Navigation mobile supplémentaire */}
        {isMobile && (
          <div className="flex items-center justify-center mt-1">
            <div className="text-xs text-white/60">
              {quoteIndex + 1} / {quotes.length}
            </div>
          </div>
        )}
        
        {/* Astuce */}
        {!isMobile && (
          <div className="text-xs text-white/50 text-center mt-2 flex items-center justify-center gap-1">
            <LightBulbIcon className="w-3 h-3" />
            <span>Les citations changent automatiquement toutes les 8 secondes</span>
          </div>
        )}
      </div>
    </div>
  );
};


// ----- src\components\Navbar.tsx -----
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
// import { useAuth } from '../hooks/useAuth'; // CONSOLIDÉ
// import { usePermissions } from '../hooks/usePermissions'; // CONSOLIDÉ
export default Navbar;
// src/components/Navbar.tsx
  HomeIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  Bars3Icon,
  ChevronDownIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  ClockIcon,
  UsersIcon,
  ArrowDownTrayIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

interface NavbarProps {
  role?: string;
}

const Navbar: React.FC<NavbarProps> = ({ role: propRole }) => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();
  const { canView } = usePermissions();

  const [isMenuOpen,        setIsMenuOpen]        = useState(false);
  const [isMobile,          setIsMobile]          = useState(false);
  const [isScrolled,        setIsScrolled]        = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [adminMenuOpen,     setAdminMenuOpen]     = useState(false);
  const adminMenuRef = useRef<HTMLDivElement>(null);

  const userRole = user?.role || propRole || 'Opérateur';

  useEffect(() => {
    const checkScreen  = () => setIsMobile(window.innerWidth < 640);
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    checkScreen();
    window.addEventListener('resize', checkScreen);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('resize', checkScreen);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Fermer le menu admin en cliquant ailleurs
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(e.target as Node)) {
        setAdminMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActiveLink = (path: string) => {
    if (path === '/accueil') return location.pathname === '/accueil' || location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    setShowLogoutConfirm(false);
    navigate('/login');
  };

  // Sous-menu Administration
  const adminSubItems = [
    ...(canView('comptes')      ? [{ path: '/administration/comptes',    label: 'Comptes',      icon: UsersIcon }] : []),
    ...(canView('mises-a-jour') ? [{ path: '/administration/mises-a-jour', label: 'Mises à jour', icon: ArrowDownTrayIcon }] : []),
  ];

  const showAdminMenu = adminSubItems.length > 0;

  // Liens principaux (hors Administration)
  const navItems = [
    { path: '/accueil',         label: 'Accueil',        labelShort: 'Accueil',  icon: HomeIcon,           permission: true },
    { path: '/tableau-de-bord', label: 'Tableau de bord', labelShort: 'Stats',   icon: ChartBarIcon,       permission: canView('tableau-de-bord') },
    { path: '/recherche',       label: 'Recherche',      labelShort: 'Rech.',    icon: MagnifyingGlassIcon, permission: canView('recherche') },
    { path: '/journal',         label: 'Journal',        labelShort: 'Journal',  icon: DocumentTextIcon,   permission: canView('journal') },
    { path: '/profil',          label: 'Profil',         labelShort: 'Profil',   icon: UserIcon,           permission: canView('profil') },
  ].filter(item => item.permission);

  const color      = "from-[#F77F00] to-[#FF9E40]";
  const hoverColor = "hover:bg-orange-50 hover:text-[#F77F00]";

  const isAdminActive = location.pathname.startsWith('/administration');

  const navbarClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
    isScrolled
      ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100'
      : 'bg-white/90 backdrop-blur-md border-b border-gray-100'
  }`;

  return (
    <>
      <nav className={navbarClasses} role="navigation" aria-label="Navigation principale">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-14 md:h-16">

            {/* ── Logo ── */}
            <div className="flex items-center flex-shrink-0">
              <Link to="/accueil" className="flex items-center gap-2.5">
                <div className="relative flex-shrink-0">
                  <img
                    src="/logo-placeholder.jpeg"
                    alt="GESCARD"
                    className="w-8 h-8 md:w-10 md:h-10 rounded-xl object-contain shadow-md border border-orange-100"
                  />
                  <div className="absolute -top-1 -right-1 w-2 h-2 md:w-2.5 md:h-2.5 bg-green-500 rounded-full border border-white animate-pulse" />
                </div>
              </Link>
            </div>

            {/* ── Menu Desktop ── */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2 flex-1 justify-center pl-8">

              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative px-3 py-2 rounded-lg transition-all duration-300 font-medium text-xs xl:text-sm whitespace-nowrap ${
                      isActiveLink(item.path)
                        ? `text-white bg-gradient-to-r ${color} shadow-md`
                        : `text-gray-700 ${hoverColor}`
                    }`}
                    aria-current={isActiveLink(item.path) ? "page" : undefined}
                  >
                    <span className="flex items-center gap-1.5">
                      <Icon className="w-4 h-4" />
                      <span className="hidden xl:inline">{item.label}</span>
                      <span className="xl:hidden">{item.labelShort}</span>
                    </span>
                    {isActiveLink(item.path) && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2/3 h-0.5 bg-white rounded-full"
                      />
                    )}
                  </Link>
                );
              })}

              {/* ── Menu Administration (dropdown) ── */}
              {showAdminMenu && (
                <div className="relative" ref={adminMenuRef}>
                  <button
                    onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                    className={`relative px-3 py-2 rounded-lg transition-all duration-300 font-medium text-xs xl:text-sm whitespace-nowrap flex items-center gap-1.5 ${
                      isAdminActive
                        ? `text-white bg-gradient-to-r ${color} shadow-md`
                        : `text-gray-700 ${hoverColor}`
                    }`}
                  >
                    <Cog6ToothIcon className="w-4 h-4" />
                    <span className="hidden xl:inline">Administration</span>
                    <span className="xl:hidden">Admin</span>
                    <ChevronDownIcon className={`w-3 h-3 transition-transform duration-200 ${adminMenuOpen ? 'rotate-180' : ''}`} />
                    {isAdminActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2/3 h-0.5 bg-white rounded-full"
                      />
                    )}
                  </button>

                  <AnimatePresence>
                    {adminMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full mt-2 left-0 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                      >
                        {adminSubItems.map((sub) => {
                          const SubIcon = sub.icon;
                          return (
                            <Link
                              key={sub.path}
                              to={sub.path}
                              onClick={() => setAdminMenuOpen(false)}
                              className={`flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
                                location.pathname === sub.path
                                  ? 'bg-gradient-to-r from-[#F77F00]/10 to-[#FF9E40]/10 text-[#F77F00] font-semibold'
                                  : 'text-gray-700 hover:bg-orange-50 hover:text-[#F77F00]'
                              }`}
                            >
                              <SubIcon className="w-4 h-4 flex-shrink-0" />
                              <span>{sub.label}</span>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Déconnexion */}
              <motion.button
                onClick={() => setShowLogoutConfirm(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-xs xl:text-sm font-medium shadow hover:shadow-md transition-all duration-300 ml-1"
              >
                <span className="flex items-center gap-1.5">
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  <span className="hidden xl:inline">Déconnexion</span>
                  <span className="xl:hidden">Sortir</span>
                </span>
              </motion.button>

              {/* Badge rôle */}
              <div className="ml-2 px-2 py-1 bg-gradient-to-r from-[#F77F00]/10 to-[#FF9E40]/10 rounded-full border border-[#F77F00]/20 flex items-center gap-1">
                <ShieldCheckIcon className="w-3 h-3 text-[#F77F00]" />
                <span className="text-xs font-semibold text-[#F77F00] truncate max-w-[80px]">{userRole}</span>
              </div>
            </div>

            {/* ── Menu tablette ── */}
            <div className="hidden md:flex lg:hidden items-center gap-2">
              {navItems.slice(0, 3).map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.path} to={item.path}
                    className={`relative p-2 rounded-lg transition-all duration-300 ${
                      isActiveLink(item.path)
                        ? `text-white bg-gradient-to-r ${color} shadow-md`
                        : `text-gray-700 ${hoverColor}`
                    }`}
                    title={item.label}
                  >
                    <Icon className="w-4 h-4" />
                  </Link>
                );
              })}

              {/* Dropdown reste + Administration tablette */}
              <div className="relative group">
                <button className="p-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:bg-gray-200">
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {navItems.slice(3).map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.path} to={item.path} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg">
                        <span className="flex items-center gap-2"><Icon className="w-4 h-4" /><span>{item.label}</span></span>
                      </Link>
                    );
                  })}
                  {showAdminMenu && (
                    <>
                      <div className="border-t border-gray-100 my-1" />
                      <div className="px-4 py-1 text-xs text-gray-400 font-semibold uppercase tracking-wide">Administration</div>
                      {adminSubItems.map((sub) => {
                        const SubIcon = sub.icon;
                        return (
                          <Link key={sub.path} to={sub.path} className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#F77F00] last:rounded-b-lg">
                            <span className="flex items-center gap-2"><SubIcon className="w-4 h-4" /><span>{sub.label}</span></span>
                          </Link>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>

              <motion.button onClick={() => setShowLogoutConfirm(true)} whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white shadow" title="Déconnexion">
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
              </motion.button>
            </div>

            {/* ── Menu mobile ── */}
            <div className="flex items-center gap-2 md:hidden">
              <div className="px-2 py-1 bg-gradient-to-r from-[#F77F00]/10 to-[#FF9E40]/10 rounded-full border border-[#F77F00]/20">
                <span className="text-xs font-semibold text-[#F77F00]">
                  {userRole.length > 8 ? userRole.substring(0, 6) + '...' : userRole}
                </span>
              </div>
              <motion.button onClick={() => setShowLogoutConfirm(true)} whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white shadow" title="Déconnexion">
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
              </motion.button>
              <motion.button onClick={() => setIsMenuOpen(!isMenuOpen)} whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg shadow-lg bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white">
                {isMenuOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Overlay mobile */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMenuOpen(false)} />
          )}
        </AnimatePresence>

        {/* Drawer mobile */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="md:hidden bg-white shadow-2xl border-t border-gray-200 absolute top-full left-0 right-0 overflow-hidden z-50"
            >
              <div className="py-2 px-2 space-y-1 max-h-[70vh] overflow-y-auto">

                {/* Liens principaux */}
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)}
                      className={`block px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm ${
                        isActiveLink(item.path)
                          ? `text-white bg-gradient-to-r ${color} shadow-lg`
                          : 'text-gray-700 bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </span>
                    </Link>
                  );
                })}

                {/* Section Administration mobile */}
                {showAdminMenu && (
                  <div className="mt-2">
                    <div className="px-4 py-2 text-xs text-gray-400 font-semibold uppercase tracking-wide flex items-center gap-2">
                      <Cog6ToothIcon className="w-3.5 h-3.5" />
                      Administration
                    </div>
                    {adminSubItems.map((sub) => {
                      const SubIcon = sub.icon;
                      return (
                        <Link key={sub.path} to={sub.path} onClick={() => setIsMenuOpen(false)}
                          className={`block px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm ml-2 ${
                            location.pathname === sub.path
                              ? `text-white bg-gradient-to-r ${color} shadow-lg`
                              : 'text-gray-700 bg-gray-50 hover:bg-orange-50 hover:text-[#F77F00]'
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <SubIcon className="w-5 h-5" />
                            <span>{sub.label}</span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Info utilisateur mobile */}
                <div className="border-t border-gray-200 my-2 pt-2">
                  <div className="px-4 py-3 bg-gradient-to-r from-[#F77F00]/10 to-[#FF9E40]/10 rounded-xl">
                    <div className="text-xs text-gray-600 mb-2">Connecté en tant que</div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheckIcon className="w-4 h-4 text-[#F77F00]" />
                        <span className="font-semibold text-[#F77F00] text-sm">{userRole}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600">En ligne</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/90 rounded-lg p-2 text-center">
                        <BuildingOfficeIcon className="w-3 h-3 mx-auto mb-1 text-gray-500" />
                        <div className="text-gray-500">Coordination</div>
                        <div className="font-medium text-gray-800 truncate">{user?.coordination || 'Non spécifiée'}</div>
                      </div>
                      <div className="bg-white/90 rounded-lg p-2 text-center">
                        <UserIcon className="w-3 h-3 mx-auto mb-1 text-gray-500" />
                        <div className="text-gray-500">Utilisateur</div>
                        <div className="font-medium text-gray-800 truncate">{user?.nomUtilisateur || 'Utilisateur'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
                <div className="text-center space-y-1">
                  <div className="text-xs text-gray-600 font-medium">GESCARD v3.1.0</div>
                  <div className="text-xs text-gray-500">© 2026 Tous droits réservés</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <div className={`${isMobile ? 'h-14' : 'h-16'}`}></div>

      {/* Modal déconnexion */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 max-w-md w-full mx-auto border border-red-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 md:gap-4 mb-4">
                <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center`}>
                  <ArrowRightOnRectangleIcon className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
                </div>
                <h3 className={`font-bold text-gray-800 ${isMobile ? 'text-base' : 'text-lg'}`}>Confirmer la déconnexion</h3>
              </div>
              <p className={`text-gray-600 mb-4 md:mb-6 leading-relaxed ${isMobile ? 'text-sm' : 'text-base'}`}>
                Êtes-vous sûr de vouloir vous déconnecter ?
              </p>
              <div className="flex justify-end gap-2 md:gap-3">
                <motion.button onClick={() => setShowLogoutConfirm(false)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className={`px-4 py-2 md:px-6 md:py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium ${isMobile ? 'text-sm' : ''}`}>
                  Annuler
                </motion.button>
                <motion.button onClick={handleLogout} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className={`px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-lg flex items-center gap-2 ${isMobile ? 'text-sm' : ''}`}>
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  Déconnexion
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};


// ----- src\components\SearchBar.tsx -----
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
export const InstantSearchBar: React.FC<Omit<SearchBarProps, 'debounceMs'>> = (props) => (
export const DebouncedSearchBar: React.FC<SearchBarProps> = (props) => (
export default SearchBar;
  MagnifyingGlassIcon, 
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "filled" | "outline";
  className?: string;
  autoFocus?: boolean;
  debounceMs?: number;
  showSearchIcon?: boolean;
  showClearButton?: boolean;
  loading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Rechercher des cartes...",
  size = "md",
  variant = "default",
  className = "",
  autoFocus = false,
  debounceMs = 300,
  showSearchIcon = true,
  showClearButton = true,
  loading = false
}) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Responsive
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Debounce pour éviter trop d'appels
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      onSearch(value);
    }, debounceMs);

    setDebounceTimer(timer);
  };

  const clearSearch = () => {
    setQuery("");
    onSearch("");
  };

  // Configuration des tailles responsive
  const sizeConfig = {
    sm: {
      padding: isMobile ? 'px-3 py-2' : 'px-4 py-2',
      text: isMobile ? 'text-xs' : 'text-sm',
      rounded: 'rounded-lg',
      icon: isMobile ? 'w-4 h-4' : 'w-5 h-5'
    },
    md: {
      padding: isMobile ? 'px-4 py-2.5' : 'px-6 py-3',
      text: isMobile ? 'text-sm' : 'text-base',
      rounded: 'rounded-xl',
      icon: isMobile ? 'w-5 h-5' : 'w-5 h-5'
    },
    lg: {
      padding: isMobile ? 'px-5 py-3' : 'px-8 py-4',
      text: isMobile ? 'text-base' : 'text-lg',
      rounded: 'rounded-xl md:rounded-2xl',
      icon: isMobile ? 'w-5 h-5' : 'w-6 h-6'
    }
  };

  // Configuration des variants
  const variantConfig = {
    default: "bg-white border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100",
    filled: "bg-gray-50 border border-gray-200 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100",
    outline: "bg-transparent border-2 border-gray-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
  };

  const currentSize = sizeConfig[size];
  
  const baseClasses = `
    w-full transition-all duration-300 font-medium
    placeholder-gray-400 text-gray-800
    ${currentSize.padding}
    ${currentSize.text}
    ${currentSize.rounded}
    ${variantConfig[variant]}
    ${className}
  `;

  return (
    <div className="relative w-full">
      <motion.div
        initial={false}
        animate={{ 
          scale: isFocused ? 1.01 : 1,
        }}
        className="relative"
      >
        {/* Icône de recherche */}
        {showSearchIcon && (
          <div className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <motion.div
              animate={{ rotate: isFocused ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <MagnifyingGlassIcon className={currentSize.icon} />
            </motion.div>
          </div>
        )}

        {/* Champ de recherche */}
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`${baseClasses} ${
            showSearchIcon ? 'pl-10 md:pl-12' : 'pl-4'
          } ${showClearButton && query ? 'pr-10 md:pr-12' : 'pr-4'}`}
        />

        {/* Bouton de suppression / Loading */}
        <AnimatePresence>
          {query && showClearButton && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={clearSearch}
              className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors duration-200"
              type="button"
              aria-label="Effacer la recherche"
            >
              {loading ? (
                <div className={`${currentSize.icon} border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin`} />
              ) : (
                <XMarkIcon className={currentSize.icon} />
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Indicateur de recherche */}
      <AnimatePresence>
        {query && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute -bottom-5 left-0 text-[10px] md:text-xs text-gray-500 font-medium flex items-center gap-1"
          >
            <SparklesIcon className="w-3 h-3 text-orange-400" />
            <span>Recherche en cours...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Effet de focus décoratif */}
      <motion.div
        initial={false}
        animate={{ 
          scale: isFocused ? 1 : 0.95,
          opacity: isFocused ? 0.5 : 0
        }}
        className={`absolute inset-0 bg-gradient-to-r from-orange-100 to-transparent ${currentSize.rounded} -z-10 blur-sm`}
      />

      {/* Raccourci clavier */}
      {!isMobile && !query && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs border border-gray-200 rounded px-1.5 py-0.5 bg-gray-50">
          ⌘K
        </div>
      )}
    </div>
  );
};

// Version simplifiée avec recherche instantanée
  <SearchBar debounceMs={0} showClearButton={true} {...props} />
);

// Version pour la recherche avec délai
  <SearchBar debounceMs={300} {...props} />
);


// ----- src\components\SiteDropdown.tsx -----
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import api from '../Services/api/client'; // CONSOLIDÉ
import {
export default SiteDropdown;
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface SiteDropdownProps {
  multiple?: boolean;
  onChange: (value: string | string[]) => void;
  selectedSites?: string[] | string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

const SiteDropdown: React.FC<SiteDropdownProps> = ({ 
  multiple = false, 
  onChange, 
  selectedSites = multiple ? [] : '', 
  placeholder = "Rechercher un site...",
  className = "",
  disabled = false,
  loading: externalLoading = false
}) => {
  const [sites, setSites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSites, setFilteredSites] = useState<string[]>([]);

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

  const loadSites = useCallback(async () => {
    if (externalLoading) return;
    
    setLoading(true);
    try {
      // ✅ BUG #1 CORRIGÉ : baseURL axios = '.../api', le chemin ne doit pas re-inclure '/api'
      // L'ancien chemin '/api/import-export/sites' produisait → /api/api/import-export/sites (404)
      const response = await api.get('/import-export/sites');
      setSites(response.data.sites || []);
      setFilteredSites(response.data.sites || []);
    } catch (error) {
      console.error('Erreur chargement sites:', error);
      setSites([]);
      setFilteredSites([]);
    } finally {
      setLoading(false);
    }
  }, [externalLoading]);

  useEffect(() => {
    loadSites();
  }, [loadSites]);

  useEffect(() => {
    if (search === '') {
      setFilteredSites(sites);
    } else {
      const filtered = sites.filter(site =>
        site.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredSites(filtered);
    }
  }, [search, sites]);

  const handleSiteSelect = (site: string) => {
    if (disabled) return;
    
    if (multiple) {
      const currentSites = selectedSites as string[];
      const newSites = currentSites.includes(site)
        ? currentSites.filter(s => s !== site)
        : [...currentSites, site];
      onChange(newSites);
    } else {
      onChange(site);
      setIsOpen(false);
      setSearch('');
    }
  };

  const handleRemoveSite = (site: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    
    if (multiple) {
      const currentSites = selectedSites as string[];
      const newSites = currentSites.filter(s => s !== site);
      onChange(newSites);
    }
  };

  const getDisplayValue = () => {
    if (multiple) {
      const sites = selectedSites as string[];
      if (sites.length === 0) return '';
      return `${sites.length} site${sites.length > 1 ? 's' : ''} sélectionné${sites.length > 1 ? 's' : ''}`;
    } else {
      return selectedSites as string;
    }
  };

  const clearSelection = () => {
    if (disabled) return;
    
    if (multiple) {
      onChange([]);
    } else {
      onChange('');
      setSearch('');
    }
  };

  if (loading || externalLoading) {
    return (
      <div className={`relative ${className}`}>
        <div className={`w-full px-3 py-2.5 md:px-4 md:py-3 border border-gray-300 rounded-lg bg-gray-100 animate-pulse flex items-center gap-2 ${isMobile ? 'text-sm' : ''}`}>
          <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
          <span className="text-gray-500">Chargement des sites...</span>
        </div>
      </div>
    );
  }

  const selectedCount = multiple ? (selectedSites as string[]).length : 0;
  const hasSelection = multiple ? selectedCount > 0 : !!selectedSites;

  return (
    <div className={`relative w-full ${className}`}>
      
      {/* Champ principal */}
      <div className="relative">
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full px-3 py-2.5 md:px-4 md:py-3 bg-white border rounded-lg cursor-pointer transition-all duration-200 min-h-[42px] md:min-h-[48px] flex items-center flex-wrap gap-1.5 ${
            disabled 
              ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'
              : isOpen 
                ? 'ring-2 ring-[#F77F00] border-[#F77F00]' 
                : 'border-gray-300 hover:border-[#F77F00]'
          }`}
        >
          {/* Icône bâtiment */}
          <BuildingOfficeIcon className={`w-4 h-4 md:w-5 md:h-5 flex-shrink-0 ${
            isOpen ? 'text-[#F77F00]' : 'text-gray-400'
          }`} />

          {/* Affichage des sites sélectionnés (multi) */}
          {multiple && Array.isArray(selectedSites) && selectedSites.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-1 flex-1">
                {(selectedSites as string[]).slice(0, isMobile ? 1 : 2).map((site, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 bg-[#F77F00] text-white text-xs px-2 py-1 rounded-full"
                  >
                    <span className="truncate max-w-[80px] md:max-w-[120px]">{site}</span>
                    {!disabled && (
                      <button
                        type="button"
                        onClick={(e) => handleRemoveSite(site, e)}
                        className="text-white hover:text-gray-200"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
                {selectedCount > (isMobile ? 1 : 2) && (
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                    +{selectedCount - (isMobile ? 1 : 2)}
                  </span>
                )}
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ajouter..."
                disabled={disabled}
                className="flex-1 min-w-[80px] bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 text-sm"
                onClick={(e) => e.stopPropagation()}
              />
            </>
          ) : (
            <input
              type="text"
              value={multiple ? search : getDisplayValue()}
              onChange={(e) => {
                if (!disabled) {
                  setSearch(e.target.value);
                  if (!multiple) {
                    onChange(e.target.value);
                  }
                }
              }}
              placeholder={placeholder}
              disabled={disabled}
              className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 text-sm md:text-base"
              onFocus={() => !disabled && setIsOpen(true)}
            />
          )}
          
          {/* Boutons d'action */}
          <div className="flex items-center gap-1 ml-auto">
            {hasSelection && !disabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                type="button"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled) setIsOpen(!isOpen);
              }}
              disabled={disabled}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              type="button"
            >
              {isOpen ? (
                <ChevronUpIcon className="w-4 h-4 md:w-5 md:h-5" />
              ) : (
                <ChevronDownIcon className="w-4 h-4 md:w-5 md:h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && !disabled && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 md:max-h-96 overflow-hidden"
            >
              
              {/* Barre de recherche dans le dropdown */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-2">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher un site..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F77F00] focus:border-transparent text-sm"
                    autoFocus
                  />
                </div>
              </div>
              
              {/* Liste des sites */}
              <div className="overflow-y-auto max-h-60">
                {filteredSites.length === 0 ? (
                  <div className="px-4 py-6 text-gray-500 text-center">
                    <BuildingOfficeIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-medium">
                      {search ? 'Aucun site trouvé' : 'Aucun site disponible'}
                    </p>
                    {search && (
                      <p className="text-xs text-gray-400 mt-1">
                        Essayez d'autres termes
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="py-1">
                    {filteredSites.map((site, index) => {
                      const isSelected = multiple 
                        ? (selectedSites as string[]).includes(site)
                        : selectedSites === site;
                      
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.02 }}
                          onClick={() => handleSiteSelect(site)}
                          className={`px-3 py-2.5 md:px-4 md:py-3 cursor-pointer transition-colors flex items-center justify-between ${
                            isSelected 
                              ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' 
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {multiple && (
                              <div className={`w-4 h-4 border rounded flex items-center justify-center flex-shrink-0 ${
                                isSelected 
                                  ? 'bg-blue-500 border-blue-500' 
                                  : 'border-gray-300'
                              }`}>
                                {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
                              </div>
                            )}
                            <span className={`truncate ${isSelected ? 'font-medium' : ''}`}>
                              {site}
                            </span>
                          </div>
                          
                          {!multiple && isSelected && (
                            <CheckIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Pied du dropdown */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-2 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {filteredSites.length} résultat{filteredSites.length !== 1 ? 's' : ''}
                </span>
                
                {multiple && (
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-1.5 bg-[#F77F00] text-white text-sm rounded-lg hover:bg-[#e46f00] transition-colors"
                  >
                    Valider ({selectedCount})
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};



// ----- src\components\StatCard.tsx -----
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
export const SmallStatCard: React.FC<Omit<StatCardProps, 'size'>> = (props) => (
export const MediumStatCard: React.FC<Omit<StatCardProps, 'size'>> = (props) => (
export const LargeStatCard: React.FC<Omit<StatCardProps, 'size'>> = (props) => (
export const TotalCartesCard: React.FC<Omit<StatCardProps, 'title' | 'color' | 'icon'>> = (props) => (
export const CartesDelivreesCard: React.FC<Omit<StatCardProps, 'title' | 'color' | 'icon'>> = (props) => (
export const CartesEnAttenteCard: React.FC<Omit<StatCardProps, 'title' | 'color' | 'icon'>> = (props) => (
export default StatCard;
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
  <StatCard size="sm" {...props} />
);

  <StatCard size="md" {...props} />
);

  <StatCard size="lg" {...props} />
);

// Cartes spécifiques
  <StatCard 
    title="Total des Cartes" 
    color="orange" 
    icon={<DocumentTextIcon />}
    {...props} 
  />
);

  <StatCard 
    title="Cartes Délivrées" 
    color="blue" 
    icon={<ChartBarIcon />}
    {...props} 
  />
);

  <StatCard 
    title="Cartes en Attente" 
    color="green" 
    icon={<BuildingOfficeIcon />}
    {...props} 
  />
);


// ----- src\components\TableCartesExcel.tsx -----
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
export default TableCartesExcel;
// src/components/TableCartesExcel.tsx
  PencilIcon, CheckCircleIcon, LockClosedIcon, LockOpenIcon,
  DocumentTextIcon, CalendarIcon, PhoneIcon, UserIcon,
  MapPinIcon, BuildingOfficeIcon, CheckIcon,
} from '@heroicons/react/24/outline';

const ORANGE = '#E07B00';
const GREEN  = '#2E7D52';

interface TableCartesExcelProps {
  cartes: any[];
  role: string;
  onUpdateCartes: (cartes: any[]) => void;
  canEdit?: boolean;
  editFields?: string[];
  onExportCSV?: () => void;
  onExportExcel?: () => void;
}

const TableCartesExcel: React.FC<TableCartesExcelProps> = ({
  cartes, role, onUpdateCartes, canEdit = true, editFields = [],
}) => {
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; field: string } | null>(null);
  const [editValue,   setEditValue]   = useState('');
  const [localCartes, setLocalCartes] = useState<any[]>(cartes);
  const [isMobile,    setIsMobile]    = useState(false);
  const [isTablet,    setIsTablet]    = useState(false);

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setIsMobile(w < 640);
      setIsTablet(w >= 640 && w < 1024);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ✅ FIX : Ne réinitialiser localCartes que lors d'un nouveau jeu de données
  // (nouvelle recherche), PAS à chaque mise à jour qui écraserait les modifications en cours
  const prevIdsRef = useRef<string>('');
  useEffect(() => {
    const nextIds = cartes.map((c: any) => c.id).join(',');
    if (prevIdsRef.current !== nextIds) {
      setLocalCartes(cartes);
      prevIdsRef.current = nextIds;
    }
  }, [cartes]);

  const isChefEquipe = role === "Chef d'équipe";
  const isOperateur  = role === 'Opérateur';
  const chefFields   = ['delivrance', 'contactRetrait', 'dateDelivrance'];

  const isFieldEditable = (field: string): boolean => {
    if (!canEdit || isOperateur) return false;
    if (isChefEquipe) return chefFields.includes(field);
    if (editFields?.length) return editFields.includes(field);
    return true;
  };

  // Colonnes adaptées selon l'écran
  const colonnesDesktop = [
    { key: 'coordination',   label: 'Coordination',   icon: BuildingOfficeIcon, width: 'min-w-[130px]' },
    { key: 'lieuEnrolement', label: "Lieu Enr.",       icon: MapPinIcon,         width: 'min-w-[130px]' },
    { key: 'siteRetrait',    label: 'Site Retrait',    icon: MapPinIcon,         width: 'min-w-[130px]' },
    { key: 'rangement',      label: 'Rangement',       icon: DocumentTextIcon,   width: 'min-w-[110px]' },
    { key: 'nom',            label: 'Nom',             icon: UserIcon,           width: 'min-w-[110px]' },
    { key: 'prenoms',        label: 'Prénom(s)',       icon: UserIcon,           width: 'min-w-[110px]' },
    { key: 'lieuNaissance',  label: 'Lieu Naiss.',     icon: MapPinIcon,         width: 'min-w-[130px]' },
    { key: 'dateNaissance',  label: 'Date Naiss.',     icon: CalendarIcon,       width: 'min-w-[110px]' },
    { key: 'contact',        label: 'Contact',         icon: PhoneIcon,          width: 'min-w-[110px]' },
    { key: 'delivrance',     label: 'Délivrance',      icon: CheckCircleIcon,    width: 'min-w-[150px]' },
    { key: 'contactRetrait', label: 'Contact Retrait', icon: PhoneIcon,          width: 'min-w-[120px]' },
    { key: 'dateDelivrance', label: 'Date Retrait',    icon: CalendarIcon,       width: 'min-w-[110px]' },
  ];
  const colonnesTablet = [
    { key: 'coordination',   label: 'Coord.',     icon: BuildingOfficeIcon, width: 'min-w-[100px]' },
    { key: 'siteRetrait',    label: 'Site',       icon: MapPinIcon,         width: 'min-w-[100px]' },
    { key: 'rangement',      label: 'Rang.',      icon: DocumentTextIcon,   width: 'min-w-[90px]'  },
    { key: 'nom',            label: 'Nom',        icon: UserIcon,           width: 'min-w-[100px]' },
    { key: 'prenoms',        label: 'Prénoms',    icon: UserIcon,           width: 'min-w-[100px]' },
    { key: 'contact',        label: 'Contact',    icon: PhoneIcon,          width: 'min-w-[100px]' },
    { key: 'delivrance',     label: 'Délivrance', icon: CheckCircleIcon,    width: 'min-w-[130px]' },
    { key: 'contactRetrait', label: 'Ctt. Ret.',  icon: PhoneIcon,          width: 'min-w-[100px]' },
    { key: 'dateDelivrance', label: 'Date Ret.',  icon: CalendarIcon,       width: 'min-w-[100px]' },
  ];
  const colonnesMobile = [
    { key: 'nom',            label: 'Nom',       icon: UserIcon,           width: 'min-w-[90px]'  },
    { key: 'prenoms',        label: 'Prénoms',   icon: UserIcon,           width: 'min-w-[90px]'  },
    { key: 'rangement',      label: 'Rang.',     icon: DocumentTextIcon,   width: 'min-w-[70px]'  },
    { key: 'delivrance',     label: 'Délivré',   icon: CheckCircleIcon,    width: 'min-w-[120px]' },
    { key: 'contactRetrait', label: 'Contact',   icon: PhoneIcon,          width: 'min-w-[90px]'  },
    { key: 'dateDelivrance', label: 'Date Ret.', icon: CalendarIcon,       width: 'min-w-[90px]'  },
  ];
  const colonnes = isMobile ? colonnesMobile : isTablet ? colonnesTablet : colonnesDesktop;

  const cellPx = isMobile ? 'px-2 py-2'   : isTablet ? 'px-3 py-2.5' : 'px-4 py-2.5';
  const headPx = isMobile ? 'px-2 py-2.5' : isTablet ? 'px-3 py-3'   : 'px-4 py-3';
  const textSz = isMobile ? 'text-xs'     : 'text-sm';
  const iconSz = isMobile ? 'w-3 h-3'     : 'w-4 h-4';

  const isDelivre = (val: any): boolean => {
    if (!val) return false;
    const s = String(val).trim();
    return s !== '' && !['NON', 'non', 'Non', 'false', '0'].includes(s);
  };

  const getDelivranceDisplay = (val: any): string => {
    if (!val) return '—';
    const s = String(val).trim();
    if (!s) return '—';
    if (['NON', 'non', 'Non', 'false', '0'].includes(s)) return 'Non délivré';
    if (['OUI', 'oui', 'Oui', 'true', '1'].includes(s)) return 'Délivré';
    return s;
  };

  const getCellValue = (carte: any, field: string): string => {
    switch (field) {
      case 'coordination':   return carte.coordination   || '-';
      case 'lieuEnrolement': return carte.lieuEnrolement || carte["LIEU D'ENROLEMENT"] || '-';
      case 'siteRetrait':    return carte.siteRetrait    || carte["SITE DE RETRAIT"]   || '-';
      case 'rangement':      return carte.rangement      || '-';
      case 'nom':            return carte.nom            || '-';
      case 'prenoms':        return carte.prenoms        || carte.prenom               || '-';
      case 'lieuNaissance':  return carte.lieuNaissance  || carte["LIEU NAISSANCE"]    || '-';
      case 'dateNaissance':  return carte.dateNaissance  || carte["DATE DE NAISSANCE"] || '-';
      case 'contact':        return carte.contact        || '-';
      case 'delivrance':     return getDelivranceDisplay(carte.delivrance);
      case 'contactRetrait': return carte.contactRetrait || carte["CONTACT DE RETRAIT"] || '-';
      case 'dateDelivrance': return carte.dateDelivrance || carte["DATE DE DELIVRANCE"]  || '-';
      default: return '-';
    }
  };

  const formatDate = (s: string): string => {
    if (!s || s === '-') return '-';
    try { const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleDateString('fr-FR'); }
    catch { return s; }
  };

  const handleCellClick = (rowIndex: number, field: string) => {
    if (!isFieldEditable(field) || field === 'delivrance') return;
    const v = getCellValue(localCartes[rowIndex], field);
    setEditValue(v === '-' ? '' : v);
    setEditingCell({ rowIndex, field });
  };

  const handleSaveEdit = () => {
    if (!editingCell) return;
    const { rowIndex, field } = editingCell;
    const updated = [...localCartes];
    updated[rowIndex] = { ...updated[rowIndex], [field]: editValue };
    setLocalCartes(updated);
    onUpdateCartes(updated);
    setEditingCell(null);
    setEditValue('');
  };

  const handleDelivranceToggle = (rowIndex: number) => {
    if (!isFieldEditable('delivrance')) return;
    const updated = [...localCartes];
    updated[rowIndex] = {
      ...updated[rowIndex],
      delivrance: isDelivre(updated[rowIndex].delivrance) ? '' : 'OUI',
    };
    setLocalCartes(updated);
    onUpdateCartes(updated);
  };

  const handleDelivranceEdit = (rowIndex: number) => {
    if (!isFieldEditable('delivrance')) return;
    const cur = getCellValue(localCartes[rowIndex], 'delivrance');
    setEditValue(['—', 'Non délivré'].includes(cur) ? '' : cur);
    setEditingCell({ rowIndex, field: 'delivrance' });
  };

  const handleDelivranceSave = () => {
    if (!editingCell || editingCell.field !== 'delivrance') return;
    const updated = [...localCartes];
    updated[editingCell.rowIndex] = {
      ...updated[editingCell.rowIndex],
      delivrance: editValue.trim(),
    };
    setLocalCartes(updated);
    onUpdateCartes(updated);
    setEditingCell(null);
    setEditValue('');
  };

  // ✅ FIX : Comptage des modifs par id (pas par index) pour l'affichage
  const cartesModifiees = localCartes.filter((carte) => {
    const orig = cartes.find((c: any) => c.id === carte.id);
    return orig && chefFields.some(f => carte[f] !== orig[f]);
  });

  if (!localCartes.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <DocumentTextIcon className="w-12 h-12 text-gray-200" />
        <p className="text-gray-400 text-sm">Aucune carte à afficher</p>
      </div>
    );
  }

  return (
    <div>
      {/* ── En-tête table ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/60">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">
            {localCartes.length} carte{localCartes.length > 1 ? 's' : ''}
          </span>
          {cartesModifiees.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-amber-50 border border-amber-200 text-amber-700">
              {cartesModifiees.length} modif.
            </span>
          )}
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
          isOperateur  ? 'bg-gray-50 text-gray-500 border-gray-200'
          : isChefEquipe ? 'bg-amber-50 text-amber-700 border-amber-200'
          : 'bg-emerald-50 border-emerald-200'
        }`} style={!isOperateur && !isChefEquipe ? { color: GREEN } : {}}>
          {isOperateur  ? <><LockClosedIcon className="w-3 h-3 mr-1" />Lecture</> :
           isChefEquipe ? <><PencilIcon className="w-3 h-3 mr-1" />Limité</> :
                          <><LockOpenIcon className="w-3 h-3 mr-1" />Édition</>}
        </div>
      </div>

      {/* ── Tableau ── */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: `linear-gradient(135deg, ${GREEN} 0%, #3a9c68 100%)` }} className="text-white">
              {colonnes.map(col => {
                const Icon = col.icon;
                return (
                  <th key={col.key} className={`${headPx} text-left border-r border-white/10 ${col.width}`}>
                    <div className="flex items-center gap-2">
                      <Icon className={`${iconSz} opacity-80 flex-shrink-0`} />
                      <span className={`${textSz} font-semibold whitespace-nowrap`}>{col.label}</span>
                      {!isFieldEditable(col.key) && <LockClosedIcon className="w-3 h-3 opacity-40" />}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {localCartes.map((carte, rowIndex) => (
                <motion.tr key={carte.id || rowIndex}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(rowIndex * 0.015, 0.4) }}
                  className={`border-b border-gray-50 transition-colors ${
                    isDelivre(carte.delivrance)
                      ? 'bg-emerald-50/40 hover:bg-emerald-50/70'
                      : rowIndex % 2 === 0
                        ? 'bg-white hover:bg-amber-50/20'
                        : 'bg-gray-50/30 hover:bg-amber-50/20'
                  }`}
                >
                  {colonnes.map(col => {
                    const cellValue  = getCellValue(carte, col.key);
                    const isEditing  = editingCell?.rowIndex === rowIndex && editingCell?.field === col.key;
                    const editable   = isFieldEditable(col.key);
                    const displayVal = col.key.toLowerCase().includes('date') ? formatDate(cellValue) : cellValue;

                    if (col.key === 'delivrance') {
                      const delivered = isDelivre(carte.delivrance);
                      return (
                        <td key={col.key} className={`${cellPx} border-r border-gray-50 ${col.width}`}>
                          {isEditing ? (
                            <input type="text" value={editValue} autoFocus
                              onChange={e => setEditValue(e.target.value)}
                              onBlur={handleDelivranceSave}
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleDelivranceSave();
                                else if (e.key === 'Escape') setEditingCell(null);
                              }}
                              placeholder="Nom livreur ou mention…"
                              className={`w-full px-2 py-1 border-2 rounded-lg bg-amber-50 focus:outline-none ${textSz}`}
                              style={{ borderColor: ORANGE }} />
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDelivranceToggle(rowIndex)}
                                disabled={!editable}
                                className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                  !editable ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                                }`}
                                style={delivered
                                  ? { backgroundColor: GREEN, borderColor: GREEN }
                                  : { backgroundColor: 'white', borderColor: '#d1d5db' }}>
                                {delivered && <CheckIcon className={`${isMobile ? 'w-2 h-2' : 'w-3 h-3'} text-white`} />}
                              </button>
                              <span
                                onClick={() => editable && handleDelivranceEdit(rowIndex)}
                                className={`truncate flex-1 ${textSz} ${editable ? 'cursor-pointer hover:underline' : ''}`}
                                style={delivered
                                  ? { color: GREEN, fontWeight: 600 }
                                  : { color: '#9ca3af', fontStyle: 'italic' }}>
                                {displayVal}
                              </span>
                              {editable && !isMobile && <PencilIcon className="w-3 h-3 text-gray-300 flex-shrink-0" />}
                            </div>
                          )}
                        </td>
                      );
                    }

                    return (
                      <td key={col.key} className={`${cellPx} border-r border-gray-50 ${col.width}`}
                        onClick={() => editable && handleCellClick(rowIndex, col.key)}>
                        {isEditing ? (
                          <input type="text" value={editValue} autoFocus
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={handleSaveEdit}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSaveEdit();
                              else if (e.key === 'Escape') setEditingCell(null);
                            }}
                            className={`w-full px-2 py-1 border-2 rounded-lg bg-amber-50 focus:outline-none ${textSz}`}
                            style={{ borderColor: ORANGE }} />
                        ) : (
                          <div className={`flex items-center justify-between gap-1 ${
                            editable ? 'cursor-pointer hover:bg-amber-50/40 rounded px-1 -mx-1' : ''
                          }`}>
                            <span className={`truncate ${textSz} text-gray-700`}>{displayVal}</span>
                            {editable && !isMobile && <PencilIcon className="w-3 h-3 text-gray-300 flex-shrink-0" />}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* ── Pied ── */}
      <div className="px-5 py-3 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ORANGE }} />
            Éditable
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: GREEN }} />
            Délivrée
          </span>
          {!isOperateur && (
            <span className="text-gray-300 hidden md:inline">
              · Cliquez sur une cellule pour modifier
              {isChefEquipe && ' (3 champs autorisés)'}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400">
          {localCartes.length} ligne{localCartes.length > 1 ? 's' : ''}
          {cartesModifiees.length > 0 && (
            <span className="ml-2 font-semibold" style={{ color: ORANGE }}>
              · {cartesModifiees.length} modif. en attente
            </span>
          )}
        </span>
      </div>
    </div>
  );
};


// ----- src\components\WelcomeCoordinationInfo.tsx -----
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
export default WelcomeCoordinationInfo;
// WelcomeCoordinationInfo.tsx
  HandRaisedIcon,
  RocketLaunchIcon,
  SparklesIcon,
  PhoneIcon,
  UserGroupIcon,
  BoltIcon,
  ClockIcon,
  ArrowPathIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

// La prop isMobile a été supprimée car non utilisée
const WelcomeCoordinationInfo: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Informations simplifiées
  const infoSlides = [
    {
      type: "welcome",
      icon: HandRaisedIcon,
      title: "BIENVENUE SUR GESCARD",
      message: "Nouvelle plateforme de gestion électronique des cartes"
    },
    {
      type: "distribution",
      icon: RocketLaunchIcon,
      title: "OPÉRATION DE DISTRIBUTION EN COURS",
      message: "Début le Lundi 17 Novembre 2025 - Excellents résultats"
    },
    {
      type: "new-year",
      icon: SparklesIcon,
      title: "MEILLEURS VŒUX 2026",
      message: "Excellente et prospère année à toute l'équipe"
    },
    {
      type: "contact",
      icon: PhoneIcon,
      title: "CONTACT & INFORMATIONS",
      message: "Coordination Abidjan Nord-Cocody - 07 76 73 51 15"
    },
    {
      type: "performance",
      icon: BoltIcon,
      title: "PERFORMANCE",
      message: "Plateforme rapide et efficace - Temps réel"
    },
    {
      type: "team",
      icon: UserGroupIcon,
      title: "ESPRIT D'ÉQUIPE",
      message: "Ensemble, construisons une administration moderne"
    }
  ];

  // Défilement automatique toutes les 30 secondes
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % infoSlides.length);
    }, 30000);
    
    return () => clearInterval(slideTimer);
  }, [infoSlides.length]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + infoSlides.length) % infoSlides.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % infoSlides.length);
  };

  const currentSlideData = infoSlides[currentSlide];
  const CurrentIcon = currentSlideData.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
    >
      {/* En-tête avec titre "Informations" */}
      <div className="bg-[#F77F00] text-white p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <InformationCircleIcon className="w-5 h-5" />
            <h2 className="font-bold">Informations GESCARD</h2>
          </div>
          <div className="flex items-center gap-2 text-xs bg-white/20 px-2 py-1 rounded-full">
            <ArrowPathIcon className="w-3 h-3" />
            <span>Défilement 30s</span>
          </div>
        </div>
      </div>

      {/* Corps avec l'info défilante */}
      <div className="p-4">
        <div className="flex items-center gap-2">
          {/* Bouton précédent */}
          <motion.button
            onClick={handlePrevSlide}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>

          {/* Contenu défilant */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <CurrentIcon className="w-4 h-4 text-[#F77F00]" />
                  </div>
                  <h3 className="font-bold text-[#F77F00] text-sm md:text-base">
                    {currentSlideData.title}
                  </h3>
                </div>
                <p className="text-gray-700 text-xs md:text-sm">
                  {currentSlideData.message}
                </p>
                
                {/* Indicateurs de progression */}
                <div className="flex justify-center gap-1 mt-3">
                  {infoSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index === currentSlide 
                          ? 'w-4 bg-[#F77F00]' 
                          : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Info ${index + 1}`}
                    />
                  ))}
                </div>
                
                {/* Indication du temps */}
                <div className="text-[10px] text-gray-400 mt-2 flex items-center justify-center gap-1">
                  <ClockIcon className="w-3 h-3" />
                  <span>Prochain message dans 30s</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bouton suivant */}
          <motion.button
            onClick={handleNextSlide}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Footer avec compteur */}
      <div className="border-t border-gray-200 p-2 bg-gray-50 text-center">
        <span className="text-xs text-gray-500">
          {currentSlide + 1} / {infoSlides.length} - Mis à jour régulièrement
        </span>
      </div>
    </motion.div>
  );
};


// ========== DOSSIER: pages ==========

// ----- src\pages\Accueil.tsx -----
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../hooks/useAuth'; // CONSOLIDÉ
import {
export default Accueil;
// src/pages/Accueil.tsx
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

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
const API_BASE = import.meta.env.VITE_API_URL || 'https://gescardcocody.com';

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

                    <a
                      href={`${API_BASE}/api/updates/download`}
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
            <a
              href={`${API_BASE}/api/updates/download`}
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


// ----- src\pages\Journal.tsx -----
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
// import { useAuth } from '../hooks/useAuth'; // CONSOLIDÉ
// import { usePermissions } from '../hooks/usePermissions'; // CONSOLIDÉ
// import { JournalService } from '../Services/api/journal'; // CONSOLIDÉ
export default Journal;
// src/pages/Journal.tsx
  ClockIcon, DocumentTextIcon, ArrowPathIcon, FunnelIcon,
  ArchiveBoxIcon, ChevronDownIcon,
  ChevronUpIcon, MagnifyingGlassIcon, XMarkIcon,
  CheckCircleIcon, PencilIcon, TrashIcon, ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon, InboxArrowDownIcon, ArrowUpTrayIcon,
  ExclamationTriangleIcon, InformationCircleIcon,
} from '@heroicons/react/24/outline';

// ─── Types ────────────────────────────────────────────────────
interface JournalEntry {
  id: number;
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'IMPORT' | 'EXPORT';
  description: string;
  utilisateurId: number;
  utilisateurNom: string;
  role: string;
  coordination: string;
  carteId?: number;
  ancienneValeur?: any;
  nouvelleValeur?: any;
  dateAction: string;
  ipAddress?: string;
  annulee: boolean;
}

interface PaginationInfo {
  page: number; limit: number; total: number; totalPages: number;
}

interface ImportBatch {
  id: string; nombreCartes: number; dateImport: string;
  utilisateurNom: string; utilisateurComplet: string; coordination: string;
}

// ─── Config types ─────────────────────────────────────────────
const TYPE_CONFIG: Record<string, {
  label: string; bg: string; text: string; border: string; icon: React.ReactNode;
}> = {
  CREATE:  { label: 'Création',      bg: 'bg-green-50',   text: 'text-green-700',  border: 'border-green-200',  icon: <CheckCircleIcon         className="w-3.5 h-3.5" /> },
  UPDATE:  { label: 'Modification',  bg: 'bg-orange-50',  text: 'text-orange-700', border: 'border-orange-200', icon: <PencilIcon              className="w-3.5 h-3.5" /> },
  DELETE:  { label: 'Suppression',   bg: 'bg-red-50',     text: 'text-red-700',    border: 'border-red-200',    icon: <TrashIcon               className="w-3.5 h-3.5" /> },
  LOGIN:   { label: 'Connexion',     bg: 'bg-blue-50',    text: 'text-blue-700',   border: 'border-blue-200',   icon: <ArrowRightOnRectangleIcon className="w-3.5 h-3.5" /> },
  LOGOUT:  { label: 'Déconnexion',   bg: 'bg-gray-50',    text: 'text-gray-700',   border: 'border-gray-200',   icon: <ArrowLeftOnRectangleIcon className="w-3.5 h-3.5" /> },
  IMPORT:  { label: 'Import',        bg: 'bg-purple-50',  text: 'text-purple-700', border: 'border-purple-200', icon: <InboxArrowDownIcon      className="w-3.5 h-3.5" /> },
  EXPORT:  { label: 'Export',        bg: 'bg-indigo-50',  text: 'text-indigo-700', border: 'border-indigo-200', icon: <ArrowUpTrayIcon         className="w-3.5 h-3.5" /> },
};

const DOT_COLOR: Record<string, string> = {
  CREATE: 'bg-green-500', UPDATE: 'bg-orange-500', DELETE: 'bg-red-500',
  LOGIN:  'bg-blue-500',  LOGOUT: 'bg-gray-400',   IMPORT: 'bg-purple-500', EXPORT: 'bg-indigo-500',
};

// ─── Utilitaires ──────────────────────────────────────────────
const fmtDate = (d: string) => {
  try { return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return d; }
};

const fmtJson = (v: any) => {
  if (!v) return 'Aucune';
  try { return JSON.stringify(typeof v === 'string' ? JSON.parse(v) : v, null, 2); }
  catch { return String(v); }
};

// ─── Composants ───────────────────────────────────────────────
const TypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const c = TYPE_CONFIG[type] || { label: type, bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: null };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      {c.icon}{c.label}
    </span>
  );
};

const TabBtn: React.FC<{
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string; count?: number;
}> = ({ active, onClick, icon, label, count }) => (
  <button onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
      active
        ? 'bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white shadow-md'
        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
    }`}>
    {icon}
    {label}
    {count !== undefined && (
      <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
        {count}
      </span>
    )}
  </button>
);

// ─── Page principale ──────────────────────────────────────────
const Journal: React.FC = () => {
  const { user, hasRole } = useAuth();
  const { canAnnuler } = usePermissions();

  const isAdmin       = hasRole(['Administrateur']);
  const isGestionnaire = hasRole(['Gestionnaire']);

  const [logs,    setLogs]    = useState<JournalEntry[]>([]);
  const [imports, setImports] = useState<ImportBatch[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 50, total: 0, totalPages: 0 });

  const [loading,        setLoading]        = useState(false);
  const [importsLoading, setImportsLoading] = useState(false);
  const [activeTab,      setActiveTab]      = useState<'journal' | 'imports'>('journal');
  const [showFilters,    setShowFilters]    = useState(false);
  const [expandedRow,    setExpandedRow]    = useState<number | null>(null);

  const [filters, setFilters] = useState({
    dateDebut: '', dateFin: '', utilisateur: '', type: '',
    coordination: user?.coordination || '',
  });

  // ── Fetch logs ─────────────────────────────────────────────
  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: pagination.limit, ...filters };
      if (isGestionnaire && user?.coordination) params.coordination = user.coordination;
      const response = await JournalService.getActions(params);
      setLogs(response.data);
      setPagination(response.pagination);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, filters, isGestionnaire, user?.coordination]);

  const fetchImports = useCallback(async () => {
    setImportsLoading(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      setImports([]);
    } finally {
      setImportsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'journal') fetchLogs();
    else fetchImports();
  }, [activeTab, fetchLogs, fetchImports]);

  const handleUndo = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment annuler cette action ?')) return;
    try {
      await JournalService.annulerAction(id);
      fetchLogs(pagination.page);
    } catch { /* silencieux */ }
  };

  const resetFilters = () => setFilters({
    dateDebut: '', dateFin: '', utilisateur: '', type: '',
    coordination: user?.coordination || '',
  });

  const hasActiveFilters = filters.dateDebut || filters.dateFin || filters.utilisateur || filters.type;

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-5">

        {/* ── En-tête ── */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Journal d'activité</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {isAdmin ? 'Toutes les actions' : 'Actions de votre coordination'} •{' '}
              <span className="text-[#F77F00] font-semibold">{pagination.total} entrée(s)</span>
            </p>
          </div>
          <button
            onClick={() => activeTab === 'journal' ? fetchLogs(pagination.page) : fetchImports()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 shadow-sm transition-all disabled:opacity-50 self-start sm:self-auto">
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </motion.div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-2 flex-wrap">
          <TabBtn active={activeTab === 'journal'} onClick={() => setActiveTab('journal')}
            icon={<DocumentTextIcon className="w-4 h-4" />} label="Journal" count={pagination.total} />
          {isAdmin && (
            <TabBtn active={activeTab === 'imports'} onClick={() => setActiveTab('imports')}
              icon={<ArchiveBoxIcon className="w-4 h-4" />} label="Imports" count={imports.length} />
          )}
        </div>

        {/* ── Tab Journal ── */}
        {activeTab === 'journal' && (
          <div className="space-y-4">

            {/* Barre filtres */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                {/* Recherche rapide */}
                <div className="flex-1 min-w-[200px] relative">
                  <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={filters.utilisateur}
                    onChange={e => setFilters(f => ({ ...f, utilisateur: e.target.value }))}
                    placeholder="Rechercher un utilisateur…"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F77F00]/30 focus:border-[#F77F00]" />
                </div>

                {/* Filtre type */}
                <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
                  className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F77F00]/30 focus:border-[#F77F00]">
                  <option value="">Tous les types</option>
                  {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>

                {/* Bouton filtres avancés */}
                <button onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    showFilters || hasActiveFilters
                      ? 'bg-orange-50 border-orange-300 text-[#F77F00]'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}>
                  <FunnelIcon className="w-4 h-4" />
                  Filtres {hasActiveFilters && <span className="w-2 h-2 bg-[#F77F00] rounded-full" />}
                  {showFilters ? <ChevronUpIcon className="w-3.5 h-3.5" /> : <ChevronDownIcon className="w-3.5 h-3.5" />}
                </button>

                {/* Appliquer */}
                <button onClick={() => fetchLogs(1)}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white text-sm font-semibold rounded-xl shadow hover:shadow-md transition-all">
                  Appliquer
                </button>
              </div>

              {/* Filtres avancés */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="border-t border-gray-100 mt-4 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Date début</label>
                        <input type="date" value={filters.dateDebut}
                          onChange={e => setFilters(f => ({ ...f, dateDebut: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F77F00]/30 focus:border-[#F77F00]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Date fin</label>
                        <input type="date" value={filters.dateFin}
                          onChange={e => setFilters(f => ({ ...f, dateFin: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F77F00]/30 focus:border-[#F77F00]" />
                      </div>
                      <div className="flex items-end">
                        <button onClick={() => { resetFilters(); fetchLogs(1); }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all">
                          <XMarkIcon className="w-4 h-4" /> Réinitialiser
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tableau */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

              {/* Barre info */}
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <span className="text-xs text-gray-500 font-medium">
                  {logs.length} entrée(s) affichée(s) sur {pagination.total}
                </span>
                <span className="text-xs text-gray-400">
                  Page {pagination.page} / {Math.max(1, pagination.totalPages)}
                </span>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <ArrowPathIcon className="w-8 h-8 text-[#F77F00] animate-spin" />
                  <p className="text-gray-500 text-sm">Chargement du journal…</p>
                </div>
              ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <DocumentTextIcon className="w-12 h-12 text-gray-200" />
                  <p className="text-gray-500 font-medium">Aucune activité trouvée</p>
                  <p className="text-gray-400 text-sm">Modifiez vos filtres ou revenez plus tard</p>
                </div>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white">
                          {['Date / Heure', 'Utilisateur', 'Type', 'Description', 'Actions'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map((log, i) => (
                          <React.Fragment key={log.id}>
                            <motion.tr
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                              transition={{ delay: i * 0.02 }}
                              className={`border-b border-gray-50 transition-colors cursor-pointer ${
                                expandedRow === log.id ? 'bg-orange-50/40' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                              } hover:bg-orange-50/30`}
                              onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                            >
                              {/* Date */}
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center gap-1.5 text-gray-600">
                                  <ClockIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                  <span className="text-xs">{fmtDate(log.dateAction)}</span>
                                </div>
                              </td>
                              {/* Utilisateur */}
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 bg-gradient-to-br from-[#F77F00] to-[#FF9E40] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                    {(log.utilisateurNom || log.utilisateurId?.toString() || "?").charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-800 text-sm">{log.utilisateurNom || `Utilisateur #${log.utilisateurId}`}</div>
                                    <div className="text-xs text-gray-400">{log.role || "—"} · {log.coordination || "—"}</div>
                                  </div>
                                </div>
                              </td>
                              {/* Type */}
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${DOT_COLOR[log.type] || 'bg-gray-400'}`} />
                                  <TypeBadge type={log.type} />
                                </div>
                              </td>
                              {/* Description */}
                              <td className="px-4 py-3 max-w-[300px]">
                                <p className="text-sm text-gray-600 truncate" title={log.description}>{log.description}</p>
                                {log.annulee && (
                                  <span className="text-xs text-red-500 font-medium flex items-center gap-1 mt-0.5">
                                    <ExclamationTriangleIcon className="w-3 h-3" /> Annulée
                                  </span>
                                )}
                              </td>
                              {/* Actions */}
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                                  <button
                                    onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                    title="Voir les détails">
                                    <InformationCircleIcon className="w-4 h-4" />
                                  </button>
                                  {isAdmin && canAnnuler() && !log.annulee && ['CREATE', 'UPDATE', 'DELETE', 'IMPORT'].includes(log.type) && (
                                    <button onClick={() => handleUndo(log.id)}
                                      className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                                      title="Annuler cette action">
                                      <ArrowPathIcon className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </motion.tr>

                            {/* Ligne détail expandée */}
                            <AnimatePresence>
                              {expandedRow === log.id && (
                                <tr>
                                  <td colSpan={5} className="p-0">
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="overflow-hidden bg-blue-50/50 border-b border-blue-100"
                                    >
                                      <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Infos générales */}
                                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Informations</h4>
                                          <div className="space-y-2 text-xs">
                                            {[
                                              { label: 'ID action', value: log.id },
                                              { label: 'Carte ID',  value: log.carteId || '—' },
                                              { label: 'IP',        value: log.ipAddress || 'Inconnue' },
                                              { label: 'Annulée',   value: log.annulee ? 'Oui' : 'Non' },
                                            ].map(item => (
                                              <div key={item.label} className="flex justify-between">
                                                <span className="text-gray-400 font-medium">{item.label}</span>
                                                <span className="text-gray-700 font-semibold">{item.value}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                        {/* Ancienne valeur */}
                                        <div className="bg-white rounded-xl border border-red-100 p-4">
                                          <h4 className="text-xs font-bold text-red-400 uppercase tracking-wide mb-3">Avant</h4>
                                          <pre className="text-xs text-gray-600 overflow-auto max-h-32 leading-relaxed">
                                            {fmtJson(log.ancienneValeur)}
                                          </pre>
                                        </div>
                                        {/* Nouvelle valeur */}
                                        <div className="bg-white rounded-xl border border-green-100 p-4">
                                          <h4 className="text-xs font-bold text-green-500 uppercase tracking-wide mb-3">Après</h4>
                                          <pre className="text-xs text-gray-600 overflow-auto max-h-32 leading-relaxed">
                                            {fmtJson(log.nouvelleValeur)}
                                          </pre>
                                        </div>
                                      </div>
                                    </motion.div>
                                  </td>
                                </tr>
                              )}
                            </AnimatePresence>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="md:hidden divide-y divide-gray-100">
                    {logs.map((log, i) => (
                      <motion.div key={log.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                        className="p-4 hover:bg-orange-50/20 transition-colors"
                        onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#F77F00] to-[#FF9E40] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {(log.utilisateurNom || log.utilisateurId?.toString() || "?").charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-800 text-sm">{log.utilisateurNom || `Utilisateur #${log.utilisateurId}`}</div>
                              <div className="text-xs text-gray-400">{fmtDate(log.dateAction)}</div>
                            </div>
                          </div>
                          <TypeBadge type={log.type} />
                        </div>
                        <p className="text-xs text-gray-500 mt-2 ml-10 line-clamp-2">{log.description}</p>

                        {/* Détail mobile */}
                        <AnimatePresence>
                          {expandedRow === log.id && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 ml-10 grid grid-cols-2 gap-2 overflow-hidden">
                              <div className="bg-gray-50 rounded-lg p-2.5 text-xs">
                                <div className="text-gray-400 font-medium mb-1">Carte ID</div>
                                <div className="font-bold text-gray-700">{log.carteId || '—'}</div>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-2.5 text-xs">
                                <div className="text-gray-400 font-medium mb-1">IP</div>
                                <div className="font-bold text-gray-700">{log.ipAddress || 'Inconnue'}</div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-3">
                      <span className="text-xs text-gray-500">{pagination.total} total</span>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => fetchLogs(pagination.page - 1)} disabled={pagination.page <= 1}
                          className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-all">
                          Précédent
                        </button>
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          const p = Math.max(1, Math.min(pagination.page - 2, pagination.totalPages - 4)) + i;
                          return (
                            <button key={p} onClick={() => fetchLogs(p)}
                              className={`w-8 h-8 text-xs rounded-lg font-medium transition-all ${
                                p === pagination.page
                                  ? 'bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white shadow-sm'
                                  : 'border border-gray-200 hover:bg-gray-50 text-gray-600'
                              }`}>
                              {p}
                            </button>
                          );
                        })}
                        <button onClick={() => fetchLogs(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}
                          className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-all">
                          Suivant
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Tab Imports ── */}
        {activeTab === 'imports' && isAdmin && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Historique des imports</h2>
              <p className="text-xs text-gray-400 mt-0.5">Tous les imports Excel effectués</p>
            </div>

            {importsLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <ArrowPathIcon className="w-8 h-8 text-[#F77F00] animate-spin" />
                <p className="text-gray-500 text-sm">Chargement…</p>
              </div>
            ) : imports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <ArchiveBoxIcon className="w-12 h-12 text-gray-200" />
                <p className="text-gray-500 font-medium">Aucun import trouvé</p>
                <p className="text-gray-400 text-sm">Les imports Excel apparaîtront ici</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white">
                      {['Date', 'Utilisateur', 'Coordination', 'Cartes importées', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {imports.map((imp, i) => (
                      <motion.tr key={imp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-orange-50/20 transition-colors">
                        <td className="px-4 py-3 text-xs text-gray-600">{fmtDate(imp.dateImport)}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-800 text-sm">{imp.utilisateurComplet || imp.utilisateurNom}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{imp.coordination}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full text-xs font-bold">
                            <InboxArrowDownIcon className="w-3.5 h-3.5" />
                            {imp.nombreCartes.toLocaleString('fr-FR')} cartes
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {canAnnuler() && (
                            <button onClick={() => handleUndo(parseInt(imp.id))}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-600 border border-amber-200 bg-amber-50 rounded-xl hover:bg-amber-100 font-medium transition-all">
                              <ArrowPathIcon className="w-3.5 h-3.5" /> Annuler
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


// ----- src\pages\Login.tsx -----
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
// import { useAuth } from "../hooks/useAuth"; // CONSOLIDÉ
// import { AuthService } from "../Services/api/auth"; // CONSOLIDÉ
import { UserIcon, LockClosedIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
export default Login;

interface LoginFormData {
  NomUtilisateur: string;
  MotDePasse: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    NomUtilisateur: "",
    MotDePasse: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
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
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.NomUtilisateur.trim()) { setErrorMessage("Nom d'utilisateur requis"); return; }
    if (!formData.MotDePasse)            { setErrorMessage("Mot de passe requis");       return; }
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await AuthService.login(formData);
      setAuth(response.token, response.utilisateur.role, response.utilisateur);
      navigate("/home");
    } catch (err: any) {
      if      (err.response?.status === 401) setErrorMessage("Identifiants incorrects");
      else if (err.response?.status === 403) setErrorMessage("Compte désactivé");
      else if (err.code === "ERR_NETWORK")   setErrorMessage("Serveur inaccessible");
      else                                   setErrorMessage("Erreur de connexion");
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

        /* Gauche — légère rotation fixe */
        @keyframes floatLeft {
          0%,100% { transform: translateY(0)    rotate(-4deg); }
          50%      { transform: translateY(-20px) rotate(-4deg); }
        }
        .animate-float-left { animation: floatLeft 7s ease-in-out infinite; }

        /* Droite haut — rotation inverse douce */
        @keyframes floatRightTop {
          0%,100% { transform: translateY(0)    rotate(4deg); }
          50%      { transform: translateY(-18px) rotate(4deg); }
        }

        /* Droite bas — rotation inverse + amplitude plus petite */
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
                      className="input-login w-full pl-11 pr-4 py-3.5 rounded-xl text-gray-800 text-sm font-medium placeholder:text-gray-300 placeholder:font-normal"
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
                      className="input-login w-full pl-11 pr-12 py-3.5 rounded-xl text-gray-800 text-sm font-medium placeholder:text-gray-300 placeholder:font-normal"
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

                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="flex items-center gap-2.5 bg-red-50 border border-red-100 text-red-500 px-4 py-3 rounded-xl text-sm"
                  >
                    <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-xs font-bold">!</span>
                    <span className="font-medium">{errorMessage}</span>
                  </motion.div>
                )}

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-login w-full py-3.5 text-white font-semibold rounded-xl flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
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


// ----- src\pages\Profil.tsx -----
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
// import Navbar from "../components/Navbar"; // CONSOLIDÉ
// import { useAuth } from '../hooks/useAuth'; // CONSOLIDÉ
// import { UtilisateursService } from '../Services/api/utilisateurs'; // CONSOLIDÉ
import {
export default Profil;
  UserIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';

// ✅ Ajout du champ nomComplet
interface UserProfile {
  id: number;
  nomUtilisateur: string;
  nomComplet?: string;
  role: 'Administrateur' | 'Gestionnaire' | "Chef d'équipe" | 'Opérateur';
  coordination: string;
  email?: string;
  telephone?: string;
  dateCreation?: string;
  derniereConnexion?: string;
}

const Profil: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Responsive
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const navigate = useNavigate();
  const { user, logout } = useAuth();

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

  const containerClass = isMobile ? 'px-3 py-4' : isTablet ? 'px-6 py-6' : 'container mx-auto px-4 py-8';
  const cardClass     = isMobile ? 'p-4' : isTablet ? 'p-6' : 'p-8';
  const titleSize     = isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl';
  const textSize      = isMobile ? 'text-xs' : isTablet ? 'text-sm' : 'text-base';
  const labelSize     = isMobile ? 'text-xs' : 'text-sm';
  const valueSize     = isMobile ? 'text-sm' : isTablet ? 'text-base' : 'text-lg';
  const iconSize      = isMobile ? 'w-8 h-8' : isTablet ? 'w-9 h-9' : 'w-10 h-10';
  const spacing       = isMobile ? 'space-y-3' : isTablet ? 'space-y-4' : 'space-y-6';
  const gridCols      = isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-3';

  // ✅ Charger le profil avec nomComplet
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);

      if (user) {
        const userId = (user as any).id;

        if (userId) {
          try {
            const userData = await UtilisateursService.getUtilisateurById(userId);
            setProfile({
              id: userData.id,
              nomUtilisateur: userData.nomUtilisateur,
              nomComplet: userData.nomComplet,           // ✅ récupéré depuis l'API
              role: userData.role as UserProfile['role'],
              coordination: userData.coordination,
              email: userData.email,
              telephone: userData.telephone,
              dateCreation: userData.dateCreation,
              derniereConnexion: userData.derniereConnexion,
            });
          } catch (apiError) {
            console.error('Erreur API getUtilisateurById:', apiError);
            // Fallback sur les données du contexte auth
            setProfile({
              id: userId,
              nomUtilisateur: (user as any).nomUtilisateur || 'Utilisateur',
              nomComplet: (user as any).nomComplet,      // ✅ fallback depuis le contexte
              role: (user as any).role || 'Opérateur',
              coordination: (user as any).coordination || 'Non défini',
              email: (user as any).email,
              telephone: (user as any).telephone,
              dateCreation: (user as any).dateCreation,
              derniereConnexion: (user as any).derniereConnexion,
            });
          }
        } else {
          setProfile({
            id: 0,
            nomUtilisateur: (user as any).nomUtilisateur || 'Utilisateur',
            nomComplet: (user as any).nomComplet,
            role: (user as any).role || 'Opérateur',
            coordination: (user as any).coordination || 'Non défini',
            email: (user as any).email,
            telephone: (user as any).telephone,
            dateCreation: (user as any).dateCreation,
            derniereConnexion: (user as any).derniereConnexion,
          });
        }
      } else {
        setError('Utilisateur non connecté');
      }
    } catch (err: any) {
      console.error('Erreur fetchProfile:', err);
      setError('Erreur lors de la récupération du profil');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setChangingPassword(true);
    setError('');
    setSuccess('');

    try {
      const userId = (user as any)?.id;
      if (!userId) throw new Error('ID utilisateur non trouvé');

      await UtilisateursService.updateUtilisateur(userId, { motDePasse: newPassword });

      setSuccess('Mot de passe modifié avec succès !');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Erreur handleChangePassword:', err);
      setError(err.response?.data?.error || 'Erreur lors du changement de mot de passe');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Administrateur':  return 'from-purple-600 to-purple-800';
      case 'Gestionnaire':    return 'from-blue-600 to-blue-800';
      case "Chef d'équipe":   return 'from-green-600 to-green-800';
      case 'Opérateur':       return 'from-gray-600 to-gray-800';
      default:                return 'from-orange-600 to-orange-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Navbar />
        <div className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white py-4 shadow-lg">
          <div className={containerClass}>
            <h1 className={`${titleSize} font-bold`}>Mon Profil</h1>
          </div>
        </div>
        <div className={containerClass}>
          <div className={`bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 ${cardClass} text-center`}>
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#F77F00] border-t-transparent rounded-full animate-spin"></div>
              <p className={`text-gray-600 font-medium ${textSize}`}>Chargement du profil...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar />

      {/* En-tête */}
      <div className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white py-4 shadow-lg">
        <div className={containerClass}>
          <h1 className={`${titleSize} font-bold`}>Mon Profil</h1>
          <p className={`text-white/90 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            Gestion de votre compte et sécurité
          </p>
        </div>
      </div>

      <div className={containerClass}>

        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-red-50 border border-red-200 text-red-700 ${isMobile ? 'px-3 py-2 rounded-lg' : 'px-4 py-3 rounded-2xl'} mb-4 md:mb-6`}
          >
            <div className="flex items-center gap-3">
              <span className="text-red-500">⚠</span>
              <span className="text-sm font-medium flex-1">{error}</span>
              <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 font-bold">×</button>
            </div>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-green-50 border border-green-200 text-green-700 ${isMobile ? 'px-3 py-2 rounded-lg' : 'px-4 py-3 rounded-2xl'} mb-4 md:mb-6`}
          >
            <div className="flex items-center gap-3">
              <span className="text-green-500">✓</span>
              <span className="text-sm font-medium flex-1">{success}</span>
              <button onClick={() => setSuccess('')} className="text-green-500 hover:text-green-700 font-bold">×</button>
            </div>
          </motion.div>
        )}

        {/* Layout principal */}
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 mb-6">

          {/* Colonne informations */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 ${cardClass} h-full`}
            >
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className={`${iconSize} bg-gradient-to-r from-[#0077B6] to-[#2E8B57] rounded-xl flex items-center justify-center`}>
                  <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div>
                  <h2 className={`${isMobile ? 'text-base' : 'text-xl'} font-bold text-gray-800`}>
                    Informations Personnelles
                  </h2>
                  <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    Détails de votre compte
                  </p>
                </div>
              </div>

              {profile && (
                <div className={spacing}>

                  {/* ✅ Nom complet — affiché en premier si disponible */}
                  {profile.nomComplet && (
                    <div>
                      <label className={`block font-semibold text-gray-700 mb-1 md:mb-2 ${labelSize}`}>
                        Nom
                      </label>
                      <div className={`w-full bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-semibold ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-3'}`}>
                        {profile.nomComplet}
                      </div>
                    </div>
                  )}

                  {/* ✅ Nom d'utilisateur */}
                  <div>
                    <label className={`block font-semibold text-gray-700 mb-1 md:mb-2 ${labelSize}`}>
                      Nom d'utilisateur
                    </label>
                    <div className={`w-full bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-3'}`}>
                      {profile.nomUtilisateur}
                    </div>
                  </div>

                  {/* Coordination */}
                  <div>
                    <label className={`block font-semibold text-gray-700 mb-1 md:mb-2 ${labelSize}`}>
                      Coordination
                    </label>
                    <div className={`w-full bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-3'}`}>
                      {profile.coordination}
                    </div>
                  </div>

                  {/* Email */}
                  {profile.email && (
                    <div>
                      <label className={`block font-semibold text-gray-700 mb-1 md:mb-2 ${labelSize}`}>
                        Email
                      </label>
                      <div className={`w-full bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-3'}`}>
                        {profile.email}
                      </div>
                    </div>
                  )}

                  {/* Téléphone */}
                  {profile.telephone && (
                    <div>
                      <label className={`block font-semibold text-gray-700 mb-1 md:mb-2 ${labelSize}`}>
                        Téléphone
                      </label>
                      <div className={`w-full bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-3'}`}>
                        {profile.telephone}
                      </div>
                    </div>
                  )}

                  {/* Rôle */}
                  <div>
                    <label className={`block font-semibold text-gray-700 mb-1 md:mb-2 ${labelSize}`}>
                      Rôle
                    </label>
                    <div className={`inline-block px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-white font-medium text-sm bg-gradient-to-r ${getRoleColor(profile.role)}`}>
                      {profile.role}
                    </div>
                  </div>

                </div>
              )}
            </motion.div>
          </div>

          {/* Colonne sécurité */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 ${cardClass} h-full`}
            >
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className={`${iconSize} bg-gradient-to-r from-[#F77F00] to-[#FF9E40] rounded-xl flex items-center justify-center`}>
                  <ShieldCheckIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div>
                  <h2 className={`${isMobile ? 'text-base' : 'text-xl'} font-bold text-gray-800`}>Sécurité</h2>
                  <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Gestion du mot de passe</p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className={spacing}>
                <div>
                  <label className={`block font-semibold text-gray-700 mb-1 md:mb-2 ${labelSize}`}>
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={`w-full bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-all ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-3'}`}
                    required
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className={`block font-semibold text-gray-700 mb-1 md:mb-2 ${labelSize}`}>
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-all ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-3'}`}
                    required
                    placeholder="Minimum 6 caractères"
                  />
                  <p className="text-gray-500 mt-1 text-xs">
                    Le mot de passe doit contenir au moins 6 caractères
                  </p>
                </div>

                <div>
                  <label className={`block font-semibold text-gray-700 mb-1 md:mb-2 ${labelSize}`}>
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-all ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-3'}`}
                    required
                    placeholder="••••••••"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={changingPassword}
                  whileHover={{ scale: changingPassword ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white ${isMobile ? 'py-3 rounded-lg text-sm' : 'py-4 rounded-xl'} hover:from-[#e46f00] hover:to-[#FF8C00] disabled:opacity-50 font-semibold transition-all shadow-lg flex items-center justify-center gap-2 mt-3 md:mt-4`}
                >
                  {changingPassword ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Modification...</span>
                    </>
                  ) : (
                    <>
                      <KeyIcon className="w-4 h-4 md:w-5 md:h-5" />
                      <span>Changer le mot de passe</span>
                    </>
                  )}
                </motion.button>
              </form>

              {/* Déconnexion */}
              <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-orange-100">
                <motion.button
                  onClick={() => setShowLogoutConfirm(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full bg-gradient-to-r from-red-500 to-red-600 text-white ${isMobile ? 'py-3 rounded-lg text-sm' : 'py-4 rounded-xl'} hover:from-red-600 hover:to-red-700 font-semibold transition-all shadow-lg`}
                >
                  Se déconnecter
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Résumé */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100 ${cardClass} mb-4 md:mb-6`}
          >
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className={`${iconSize} bg-gradient-to-r from-[#0077B6] to-[#2E8B57] rounded-xl flex items-center justify-center`}>
                <BuildingOfficeIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div>
                <h2 className={`${isMobile ? 'text-base' : 'text-xl'} font-bold text-gray-800`}>Résumé</h2>
                <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Aperçu de votre compte</p>
              </div>
            </div>

            <div className={`grid ${gridCols} gap-3 md:gap-4`}>

              {/* ✅ Carte Nom — affiche nomComplet ou nomUtilisateur */}
              <div className="bg-gradient-to-r from-[#0077B6] to-[#2E8B57] text-white rounded-xl md:rounded-2xl p-3 md:p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-blue-100 text-xs md:text-sm font-medium">
                      {profile.nomComplet ? 'Nom' : "Nom d'utilisateur"}
                    </p>
                    <p className={`font-bold mt-1 truncate ${valueSize}`}>
                      {profile.nomComplet || profile.nomUtilisateur}
                    </p>
                    {/* ✅ Si on affiche le nom complet, montrer aussi le nom d'utilisateur en dessous */}
                    {profile.nomComplet && (
                      <p className="text-blue-200 text-xs mt-0.5 truncate">
                        @{profile.nomUtilisateur}
                      </p>
                    )}
                  </div>
                  <div className={`${isMobile ? 'bg-white/20 p-2 rounded-lg' : 'bg-white/20 p-3 rounded-xl'} flex-shrink-0 ml-2`}>
                    <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Carte Rôle */}
              <div className={`bg-gradient-to-r ${getRoleColor(profile.role)} text-white rounded-xl md:rounded-2xl p-3 md:p-5 shadow-lg`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-xs md:text-sm font-medium">Rôle</p>
                    <p className={`font-bold mt-1 ${valueSize}`}>
                      {isMobile && profile.role.length > 10
                        ? profile.role.substring(0, 8) + '...'
                        : profile.role}
                    </p>
                  </div>
                  <div className="bg-white/20 p-2 md:p-3 rounded-lg md:rounded-xl">
                    <ShieldCheckIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Carte Coordination */}
              <div className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white rounded-xl md:rounded-2xl p-3 md:p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-orange-100 text-xs md:text-sm font-medium">Coordination</p>
                    <p className={`font-bold mt-1 truncate ${valueSize}`}>
                      {isMobile && profile.coordination.length > 15
                        ? profile.coordination.substring(0, 12) + '...'
                        : profile.coordination}
                    </p>
                  </div>
                  <div className="bg-white/20 p-2 md:p-3 rounded-lg md:rounded-xl flex-shrink-0 ml-2">
                    <BuildingOfficeIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* Support technique */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl md:rounded-2xl p-4 md:p-6"
        >
          <div className="flex items-start gap-3 md:gap-4">
            <div className={`${iconSize} bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0`}>
              <EnvelopeIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className={`font-bold text-gray-800 mb-2 ${isMobile ? 'text-sm' : 'text-lg'}`}>
                Support Technique
              </h3>
              <p className={`text-gray-700 mb-3 ${textSize}`}>
                En cas de difficulté, contactez le support technique :
              </p>
              <div className="bg-white/80 border border-blue-100 rounded-lg md:rounded-xl p-3 md:p-4">
                <a
                  href="mailto:support@gescard.com"
                  className="text-blue-600 hover:text-blue-800 font-bold text-sm md:text-base break-all"
                >
                  support@gescard.com
                </a>
              </div>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Modal confirmation déconnexion */}
      {showLogoutConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`bg-white ${isMobile ? 'rounded-lg p-4' : 'rounded-2xl p-6'} shadow-2xl max-w-sm w-full mx-auto border border-orange-100`}
          >
            <div className="text-center">
              <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} bg-gradient-to-r from-red-500 to-red-600 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4`}>
                <ShieldCheckIcon className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>

              <h3 className={`font-bold text-gray-800 mb-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                Confirmer la déconnexion
              </h3>

              <p className={`text-gray-600 mb-4 md:mb-6 ${textSize}`}>
                Êtes-vous sûr de vouloir vous déconnecter ?
              </p>

              <div className={`flex gap-2 md:gap-3 justify-center ${isMobile ? 'flex-col' : ''}`}>
                <motion.button
                  onClick={() => setShowLogoutConfirm(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`text-gray-600 border border-gray-300 hover:bg-gray-50 transition-all font-semibold ${isMobile ? 'py-2 rounded-lg text-sm' : 'px-6 py-3 rounded-xl'}`}
                >
                  Annuler
                </motion.button>
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all font-semibold shadow-lg ${isMobile ? 'py-2 rounded-lg text-sm mt-2' : 'px-6 py-3 rounded-xl'}`}
                >
                  Se déconnecter
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};


// ----- src\pages\Recherche.tsx -----
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
// import { useAuth }             from '../hooks/useAuth'; // CONSOLIDÉ
// import { usePermissions }      from '../hooks/usePermissions'; // CONSOLIDÉ
// import { CartesService }       from '../Services/api/cartes'; // CONSOLIDÉ
// import { ImportExportService } from '../Services/api/import-export'; // CONSOLIDÉ
// import type { QueryParams }    from '../types'; // CONSOLIDÉ
// import TableCartesExcel        from '../components/TableCartesExcel'; // CONSOLIDÉ
// import ImportModal             from '../components/ImportModal'; // CONSOLIDÉ
// import SiteDropdown            from '../components/SiteDropdown'; // CONSOLIDÉ
// import CoordinationDropdown    from '../components/CoordinationDropdown'; // CONSOLIDÉ
export default Recherche;
// src/pages/Recherche.tsx
  MagnifyingGlassIcon, FunnelIcon, ArrowPathIcon,
  DocumentArrowUpIcon, CheckCircleIcon, XCircleIcon,
  ChevronDownIcon, MapPinIcon, CalendarIcon, UserIcon,
  PhoneIcon, IdentificationIcon, BuildingOfficeIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

// ─── Types ────────────────────────────────────────────────────
interface CriteresRecherche {
  coordination: string; lieuEnrolement: string; siteRetrait: string;
  rangement: string; nom: string; prenoms: string; lieuNaissance: string;
  dateNaissance: string; delivrance: string; dateDelivrance: string; contactRetrait: string;
}

interface CarteEtendue {
  id: number; coordination: string; lieuEnrolement: string; siteRetrait: string;
  rangement: string; nom: string; prenoms: string; dateNaissance: string;
  lieuNaissance: string; contact: string; delivrance: string; contactRetrait: string;
  dateDelivrance: string; dateCreation: string; dateModification?: string;
  createurId?: number; moderateurId?: number;
}

// ─── Helpers ──────────────────────────────────────────────────
const inputCls = "w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E07B00]/20 focus:border-[#E07B00] transition-all";

const FilterField: React.FC<{ label: string; icon: React.ReactNode; children: React.ReactNode }> = ({ label, icon, children }) => (
  <div>
    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
      <span className="text-[#E07B00]">{icon}</span>{label}
    </label>
    {children}
  </div>
);

// ─── Toast ────────────────────────────────────────────────────
const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 40, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 20, scale: 0.95 }}
    className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-semibold whitespace-nowrap ${
      type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-gradient-to-r from-red-500 to-rose-500'
    }`}
  >
    {type === 'success' ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
    <span>{message}</span>
    <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100 text-lg leading-none">×</button>
  </motion.div>
);

// ─── Page principale ──────────────────────────────────────────
const Recherche: React.FC = () => {
  const { user, hasRole }        = useAuth();
  const { canImport }            = usePermissions();
  const isChefEquipe             = hasRole(["Chef d'équipe"]);
  const isOperateur              = hasRole(['Opérateur']);

  const [resultats,        setResultats]        = useState<CarteEtendue[]>([]);
  const [loading,          setLoading]          = useState(false);
  const [importLoading,    setImportLoading]    = useState(false);
  const [hasModifications, setHasModifications] = useState(false);
  const [totalResultats,   setTotalResultats]   = useState(0);
  const [currentPage,      setCurrentPage]      = useState(1);
  const [totalPages,       setTotalPages]       = useState(1);
  const [showImportModal,  setShowImportModal]  = useState(false);
  const [importMode,       setImportMode]       = useState<'standard' | 'smart'>('standard');
  const [showFilters,      setShowFilters]      = useState(true);
  const [toast,            setToast]            = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Référence aux cartes originales pour détecter les modifications
  const cartesOriginalesRef = useRef<CarteEtendue[]>([]);

  const [criteres, setCriteres] = useState<CriteresRecherche>({
    coordination: '', lieuEnrolement: '', siteRetrait: '', rangement: '',
    nom: '', prenoms: '', lieuNaissance: '', dateNaissance: '',
    delivrance: '', dateDelivrance: '', contactRetrait: '',
  });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Recherche ──
  const handleRecherche = async (page = 1) => {
    setLoading(true);
    try {
      const params: QueryParams = { page, limit: 50 };
      if (criteres.coordination)   params.coordination   = criteres.coordination;
      if (criteres.lieuEnrolement) params.lieuEnrolement = criteres.lieuEnrolement;
      if (criteres.siteRetrait)    params.siteRetrait    = criteres.siteRetrait;
      if (criteres.rangement)      params.rangement      = criteres.rangement;
      if (criteres.nom)            params.nom            = criteres.nom;
      if (criteres.prenoms)        params.prenoms        = criteres.prenoms;
      if (criteres.lieuNaissance)  params.lieuNaissance  = criteres.lieuNaissance;
      if (criteres.dateNaissance)  params.dateNaissance  = criteres.dateNaissance;
      if (criteres.delivrance)     params.delivrance     = criteres.delivrance === 'oui' ? true : criteres.delivrance === 'non' ? false : undefined;
      if (criteres.dateDelivrance) params.dateDelivrance = criteres.dateDelivrance;
      if (criteres.contactRetrait) params.contactRetrait = criteres.contactRetrait;

      const response = await CartesService.getCartes(params);

      const cartesConverties: CarteEtendue[] = response.data.map((carte: any) => ({
        id:               carte.id,
        coordination:     carte.coordination   || '',
        lieuEnrolement:   carte.lieuEnrolement || carte["LIEU D'ENROLEMENT"] || '',
        siteRetrait:      carte.siteRetrait    || carte["SITE DE RETRAIT"]   || '',
        rangement:        carte.rangement      || '',
        nom:              carte.nom            || '',
        prenoms:          carte.prenoms        || carte.prenom               || '',
        dateNaissance:    carte.dateNaissance  || carte["DATE DE NAISSANCE"] || '',
        lieuNaissance:    carte.lieuNaissance  || carte["LIEU NAISSANCE"]    || '',
        contact:          carte.contact        || '',
        delivrance:       carte.delivrance != null ? String(carte.delivrance) : '',
        contactRetrait:   carte.contactRetrait || carte["CONTACT DE RETRAIT"] || '',
        dateDelivrance:   carte.dateDelivrance || carte["DATE DE DELIVRANCE"]  || '',
        dateCreation:     carte.dateCreation   || carte.dateimport             || new Date().toISOString(),
        dateModification: carte.dateModification,
        createurId:       carte.createurId,
        moderateurId:     carte.moderateurId,
      }));

      setResultats(cartesConverties);
      // ✅ Snapshot des originaux pour comparaison future
      cartesOriginalesRef.current = cartesConverties.map(c => ({ ...c }));
      setTotalResultats(response.pagination.total);
      setCurrentPage(response.pagination.page);
      setTotalPages(response.pagination.totalPages);
      setHasModifications(false);
    } catch {
      setResultats([]);
      showToast('Erreur lors de la recherche', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Mapping colonnes DB ──
  const toDbColumns = (carte: Partial<CarteEtendue>): Record<string, any> => {
    const m: Record<string, any> = {};
    if (carte.lieuEnrolement !== undefined) m["LIEU D'ENROLEMENT"] = carte.lieuEnrolement;
    if (carte.siteRetrait    !== undefined) m["SITE DE RETRAIT"]   = carte.siteRetrait;
    if (carte.rangement      !== undefined) m["rangement"]          = carte.rangement;
    if (carte.nom            !== undefined) m["nom"]                = carte.nom;
    if (carte.prenoms        !== undefined) m["prenoms"]            = carte.prenoms;
    if (carte.dateNaissance  !== undefined) m["DATE DE NAISSANCE"]  = carte.dateNaissance || null;
    if (carte.lieuNaissance  !== undefined) m["LIEU NAISSANCE"]     = carte.lieuNaissance;
    if (carte.contact        !== undefined) m["contact"]            = carte.contact;
    if (carte.delivrance     !== undefined) m["delivrance"]         = carte.delivrance;
    if (carte.contactRetrait !== undefined) m["CONTACT DE RETRAIT"] = carte.contactRetrait;
    if (carte.dateDelivrance !== undefined) m["DATE DE DELIVRANCE"] = carte.dateDelivrance || null;
    if (carte.coordination   !== undefined) m["coordination"]       = carte.coordination;
    return m;
  };

  // ── Sauvegarde ──
  // ✅ FIX : Comparaison par ID (Map) et non par index pour éviter les faux négatifs
  const handleSaveModifications = async () => {
    const origMap = new Map(cartesOriginalesRef.current.map(c => [c.id, c]));

    const modifiees = resultats.filter((carte) => {
      const orig = origMap.get(carte.id);
      if (!orig) return false;
      return (
        carte.delivrance     !== orig.delivrance     ||
        carte.contactRetrait !== orig.contactRetrait ||
        carte.dateDelivrance !== orig.dateDelivrance ||
        carte.nom            !== orig.nom            ||
        carte.prenoms        !== orig.prenoms        ||
        carte.rangement      !== orig.rangement      ||
        carte.lieuEnrolement !== orig.lieuEnrolement ||
        carte.siteRetrait    !== orig.siteRetrait
      );
    });

    if (modifiees.length === 0) {
      showToast('Aucune modification à sauvegarder', 'error');
      return;
    }

    try {
      for (const carte of modifiees) {
        const payload = isChefEquipe
          ? toDbColumns({ delivrance: carte.delivrance, contactRetrait: carte.contactRetrait, dateDelivrance: carte.dateDelivrance })
          : toDbColumns(carte);
        await CartesService.updateCarte(carte.id, payload);
      }
      setHasModifications(false);
      cartesOriginalesRef.current = resultats.map(c => ({ ...c }));
      showToast(`${modifiees.length} modification(s) enregistrée(s) avec succès`);
    } catch {
      showToast("Erreur lors de l'enregistrement", 'error');
    }
  };

  const handleImport = async (file: File) => {
    setImportLoading(true);
    try {
      const result   = await ImportExportService.importFile(file, importMode);
      const imported = result.stats?.imported ?? 0;
      const updated  = result.stats?.updated  ?? 0;
      const errors   = result.stats?.errors   ?? 0;
      setShowImportModal(false);
      showToast(`Import terminé — ${imported} ajoutée(s), ${updated} mise(s) à jour${errors > 0 ? `, ${errors} erreur(s)` : ''}`);
      if (imported > 0 || updated > 0) handleRecherche(currentPage);
    } catch (error: any) {
      showToast(error.response?.data?.message || "Erreur lors de l'import", 'error');
    } finally {
      setImportLoading(false);
    }
  };

  const handleUpdateResultats = (nouvellesCartes: CarteEtendue[]) => {
    setResultats(nouvellesCartes);
    setHasModifications(true);
  };

  const handleReset = () => {
    setCriteres({
      coordination: '', lieuEnrolement: '', siteRetrait: '', rangement: '',
      nom: '', prenoms: '', lieuNaissance: '', dateNaissance: '',
      delivrance: '', dateDelivrance: '', contactRetrait: '',
    });
    setResultats([]);
    setTotalResultats(0);
    setCurrentPage(1);
    setTotalPages(1);
    setHasModifications(false);
    cartesOriginalesRef.current = [];
  };

  const handlePageChange = (newPage: number) => {
    if (hasModifications && !window.confirm('Des modifications non sauvegardées seront perdues. Continuer ?')) return;
    handleRecherche(newPage);
  };

  const activeFiltersCount = Object.values(criteres).filter(v => v !== '').length;

  // ── Render ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-5">

        {/* ── En-tête ── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Recherche de cartes</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {user?.coordination
                ? <span className="text-[#E07B00] font-semibold">{user.coordination}</span>
                : 'Toutes les coordinations'
              }
              {totalResultats > 0 && (
                <span className="ml-2">· <strong className="text-gray-700">{totalResultats.toLocaleString('fr-FR')}</strong> carte(s)</span>
              )}
            </p>
          </div>
          {canImport() && (
            <button onClick={() => setShowImportModal(true)} disabled={importLoading}
              className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#E07B00] to-[#F5980A] text-white text-sm font-semibold rounded-xl shadow hover:shadow-md transition-all disabled:opacity-50">
              {importLoading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <DocumentArrowUpIcon className="w-4 h-4" />}
              Importer
            </button>
          )}
        </motion.div>

        {/* ── Panneau filtres ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-[#E07B00] to-[#F5980A] rounded-lg flex items-center justify-center">
                <FunnelIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-bold text-gray-800 text-sm">Critères de recherche</span>
                {activeFiltersCount > 0 && (
                  <span className="ml-2 text-xs bg-amber-50 text-[#E07B00] border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
                    {activeFiltersCount} actif(s)
                  </span>
                )}
              </div>
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
              <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${showFilters ? '' : '-rotate-90'}`} />
              {showFilters ? 'Masquer' : 'Afficher'}
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                  <FilterField label="Coordination" icon={<BuildingOfficeIcon className="w-3.5 h-3.5" />}>
                    <CoordinationDropdown
                      value={criteres.coordination}
                      onChange={v => setCriteres(c => ({ ...c, coordination: v }))}
                      placeholder="Sélectionner une coordination" />
                  </FilterField>

                  <FilterField label="Lieu d'enrôlement" icon={<MapPinIcon className="w-3.5 h-3.5" />}>
                    <input type="text" value={criteres.lieuEnrolement}
                      onChange={e => setCriteres(c => ({ ...c, lieuEnrolement: e.target.value }))}
                      placeholder="Lieu d'enrôlement…" className={inputCls} />
                  </FilterField>

                  <FilterField label="Site de retrait" icon={<GlobeAltIcon className="w-3.5 h-3.5" />}>
                    <SiteDropdown multiple={false} selectedSites={criteres.siteRetrait}
                      onChange={v => setCriteres(c => ({ ...c, siteRetrait: v as string }))}
                      placeholder="Sélectionner un site" />
                  </FilterField>

                  <FilterField label="Rangement" icon={<IdentificationIcon className="w-3.5 h-3.5" />}>
                    <input type="text" value={criteres.rangement}
                      onChange={e => setCriteres(c => ({ ...c, rangement: e.target.value }))}
                      placeholder="N° de rangement…" className={inputCls} />
                  </FilterField>

                  <FilterField label="Nom" icon={<UserIcon className="w-3.5 h-3.5" />}>
                    <input type="text" value={criteres.nom}
                      onChange={e => setCriteres(c => ({ ...c, nom: e.target.value }))}
                      placeholder="Nom…" className={inputCls} />
                  </FilterField>

                  <FilterField label="Prénom(s)" icon={<UserIcon className="w-3.5 h-3.5" />}>
                    <input type="text" value={criteres.prenoms}
                      onChange={e => setCriteres(c => ({ ...c, prenoms: e.target.value }))}
                      placeholder="Prénoms…" className={inputCls} />
                  </FilterField>

                  <FilterField label="Lieu de naissance" icon={<MapPinIcon className="w-3.5 h-3.5" />}>
                    <input type="text" value={criteres.lieuNaissance}
                      onChange={e => setCriteres(c => ({ ...c, lieuNaissance: e.target.value }))}
                      placeholder="Lieu de naissance…" className={inputCls} />
                  </FilterField>

                  <FilterField label="Date de naissance" icon={<CalendarIcon className="w-3.5 h-3.5" />}>
                    <input type="date" value={criteres.dateNaissance}
                      onChange={e => setCriteres(c => ({ ...c, dateNaissance: e.target.value }))}
                      className={inputCls} />
                  </FilterField>

                  <FilterField label="Délivrance" icon={<CheckCircleIcon className="w-3.5 h-3.5" />}>
                    <select value={criteres.delivrance}
                      onChange={e => setCriteres(c => ({ ...c, delivrance: e.target.value }))}
                      className={inputCls}>
                      <option value="">Tous</option>
                      <option value="oui">Délivrées</option>
                      <option value="non">Non délivrées</option>
                    </select>
                  </FilterField>

                  <FilterField label="Date de délivrance" icon={<CalendarIcon className="w-3.5 h-3.5" />}>
                    <input type="date" value={criteres.dateDelivrance}
                      onChange={e => setCriteres(c => ({ ...c, dateDelivrance: e.target.value }))}
                      className={inputCls} />
                  </FilterField>

                  <FilterField label="Contact de retrait" icon={<PhoneIcon className="w-3.5 h-3.5" />}>
                    <input type="text" value={criteres.contactRetrait}
                      onChange={e => setCriteres(c => ({ ...c, contactRetrait: e.target.value }))}
                      placeholder="Contact de retrait…" className={inputCls} />
                  </FilterField>

                </div>

                {/* Actions filtres */}
                <div className="px-5 pb-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                  <button onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                    <ArrowPathIcon className="w-4 h-4" />
                    Réinitialiser
                  </button>
                  <button onClick={() => handleRecherche(1)} disabled={loading}
                    className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-[#E07B00] to-[#F5980A] text-white text-sm font-bold rounded-xl shadow hover:shadow-md transition-all disabled:opacity-50">
                    {loading
                      ? <><ArrowPathIcon className="w-4 h-4 animate-spin" />Recherche…</>
                      : <><MagnifyingGlassIcon className="w-4 h-4" />Rechercher</>
                    }
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 flex flex-col items-center gap-3">
            <ArrowPathIcon className="w-10 h-10 text-[#E07B00] animate-spin" />
            <p className="text-gray-400 text-sm">Recherche en cours…</p>
          </div>
        )}

        {/* ── Résultats ── */}
        {!loading && resultats.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

            {/* Header résultats */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <span className="font-bold text-gray-800 text-sm">Résultats</span>
                <span className="ml-2 text-xs text-gray-400">
                  {totalResultats.toLocaleString('fr-FR')} carte(s) · p.{currentPage}/{totalPages}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1}
                  className="w-8 h-8 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 text-sm transition-all">←</button>
                <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-[#E07B00] font-bold text-xs rounded-lg">
                  {currentPage}/{totalPages}
                </span>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}
                  className="w-8 h-8 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 text-sm transition-all">→</button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <TableCartesExcel
                cartes={resultats as any}
                role={user?.role || ''}
                onUpdateCartes={handleUpdateResultats as any}
                canEdit={!isOperateur}
                editFields={isChefEquipe ? ['delivrance', 'contactRetrait', 'dateDelivrance'] : undefined}
              />
            </div>

            <AnimatePresence>
              {hasModifications && !isOperateur && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-5 py-4 border-t border-gray-100 bg-emerald-50/50 flex items-center justify-between gap-3">
                  <p className="text-sm text-emerald-700 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    Des modifications sont en attente d'enregistrement
                  </p>
                  <button onClick={handleSaveModifications}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-bold rounded-xl shadow hover:shadow-md transition-all">
                    <CheckCircleIcon className="w-4 h-4" />
                    Enregistrer les modifications
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── État vide ── */}
        {!loading && resultats.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MagnifyingGlassIcon className="w-7 h-7 text-gray-300" />
            </div>
            <h3 className="font-bold text-gray-700 text-lg mb-1">Aucune carte trouvée</h3>
            <p className="text-gray-400 text-sm">Utilisez les filtres de recherche ci-dessus pour trouver des cartes</p>
          </div>
        )}
      </div>

      <ImportModal isOpen={showImportModal}
        onClose={() => { setShowImportModal(false); setImportMode('standard'); }}
        onFileSelect={handleImport} isImporting={importLoading}
        mode={importMode} onModeChange={setImportMode} />

      <AnimatePresence>
        {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
};


// ----- src\pages\TableauDeBord.tsx -----
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
import {
// import Navbar from "../components/Navbar"; // CONSOLIDÉ
// import { useAuth } from "../hooks/useAuth"; // CONSOLIDÉ
// import { StatistiquesService } from "../Services/api/statistiques"; // CONSOLIDÉ
export default TableauDeBord;
// src/pages/TableauDeBord.tsx
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from "recharts";
  ArrowPathIcon, WifiIcon, SignalSlashIcon,
  ChartBarIcon, BuildingOfficeIcon, TrophyIcon,
  CheckCircleIcon, ClockIcon, ArrowTrendingUpIcon,
  ExclamationTriangleIcon, FunnelIcon, XMarkIcon,
  GlobeAltIcon, MapPinIcon, ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

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
  coordination: string; total: number; retires: number; restants: number; tauxRetrait: number;
  sites: SiteStats[];
}

// ─── Palette ──────────────────────────────────────────────────
const C = {
  orange:  "#F77F00", orange2: "#FF9E40",
  green:   "#16a34a", green2:  "#22c55e",
  blue:    "#0077B6", blue2:   "#38bdf8",
  violet:  "#7c3aed", gray:    "#6b7280",
};
const BAR_PALETTE = [C.orange, C.orange2, "#fb923c", "#fdba74", "#fcd34d", "#fbbf24", "#f59e0b", "#d97706"];

// ─── Utilitaires ──────────────────────────────────────────────
const fmt  = (n: number) => n.toLocaleString("fr-FR");
const pct  = (a: number, t: number) => t > 0 ? Math.round((a / t) * 100) : 0;
const color = (t: number) => t >= 75 ? "text-green-600" : t >= 50 ? "text-orange-500" : "text-red-500";
const bgColor = (t: number) => t >= 75 ? "bg-green-50 border-green-200 text-green-700"
                              : t >= 50 ? "bg-orange-50 border-orange-200 text-orange-700"
                                        : "bg-red-50 border-red-200 text-red-700";

// ─── Sous-composants ──────────────────────────────────────────

const KpiCard: React.FC<{
  label: string; value: number | string; sub?: string;
  gradient: string; icon: React.ReactNode; delay?: number;
  onClick?: () => void;
}> = ({ label, value, sub, gradient, icon, delay = 0, onClick }) => (
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
      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">{icon}</div>
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
      <p className="font-bold text-gray-700 mb-1.5 truncate max-w-[180px]">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="flex items-center justify-between gap-3 font-semibold" style={{ color: p.color }}>
          <span>{p.name}</span><span>{fmt(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

// ─── Filtre ───────────────────────────────────────────────────
interface FiltreState {
  coordination: string;
  site: string;
  seuilMin: number;   // taux retrait minimum
  seuilMax: number;   // taux retrait maximum
}

const FiltrePanel: React.FC<{
  filtres: FiltreState;
  setFiltres: (f: FiltreState) => void;
  coordinations: string[];
  sites: string[];
  isAdmin: boolean;
  isGestionnaire: boolean;
}> = ({ filtres, setFiltres, coordinations, sites, isAdmin, isGestionnaire }) => {
  const [open, setOpen] = useState(false);
  const hasFiltre = filtres.coordination || filtres.site || filtres.seuilMin > 0 || filtres.seuilMax < 100;
  const countFiltre = [filtres.coordination, filtres.site, filtres.seuilMin > 0, filtres.seuilMax < 100].filter(Boolean).length;

  const reset = () => setFiltres({ coordination: '', site: '', seuilMin: 0, seuilMax: 100 });

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {hasFiltre && (
          <button onClick={reset} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 rounded-lg px-2.5 py-1.5 transition-all">
            <XMarkIcon className="w-3 h-3" />Effacer
          </button>
        )}
        <button
          onClick={() => setOpen(o => !o)}
          className={`flex items-center gap-2 text-sm font-semibold rounded-xl px-4 py-2 border transition-all
            ${open || hasFiltre ? 'bg-orange-50 text-[#F77F00] border-orange-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
        >
          <FunnelIcon className="w-4 h-4" />
          Filtres
          {countFiltre > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#F77F00] text-white text-[10px] font-bold flex items-center justify-center">
              {countFiltre}
            </span>
          )}
          <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 z-30 bg-white rounded-2xl border border-gray-200 shadow-2xl p-5 min-w-[320px]"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Filtres d'analyse</h3>
              <button onClick={() => setOpen(false)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Coordination — seulement pour admin */}
              {isAdmin && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Coordination</label>
                  <select
                    value={filtres.coordination}
                    onChange={e => setFiltres({ ...filtres, coordination: e.target.value, site: '' })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F77F00]/30 focus:border-[#F77F00]"
                  >
                    <option value="">Toutes les coordinations</option>
                    {coordinations.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}

              {/* Site — pour admin et gestionnaire */}
              {(isAdmin || isGestionnaire) && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Site</label>
                  <select
                    value={filtres.site}
                    onChange={e => setFiltres({ ...filtres, site: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F77F00]/30 focus:border-[#F77F00]"
                  >
                    <option value="">Tous les sites</option>
                    {sites
                      .map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}

              {/* Seuil taux de retrait */}
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
                <button onClick={reset}
                  className="flex-1 py-2 border border-gray-200 text-gray-500 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors">
                  Réinitialiser
                </button>
                <button onClick={() => setOpen(false)}
                  className="flex-1 py-2 bg-[#F77F00] hover:bg-[#e46f00] text-white rounded-xl text-xs font-bold transition-colors">
                  Appliquer
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Tableau sites ─────────────────────────────────────────────
const TableauSites: React.FC<{ sites: SiteStats[]; title?: string }> = ({ sites, title }) => (
  <div className="overflow-auto rounded-xl border border-gray-100" style={{ maxHeight: 360 }}>
    <table className="w-full text-xs">
      <thead>
        <tr className="bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white sticky top-0 z-10">
          {(title ? ["Site", "Coord.", "Total", "Retirées", "Restantes", "Taux"] : ["Site", "Total", "Retirées", "Restantes", "Taux"])
            .map(h => <th key={h} className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {sites.length === 0
          ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">Aucun site</td></tr>
          : sites.map((s, i) => {
            const t = s.tauxRetrait;
            return (
              <motion.tr key={`${s.site}-${i}`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.02 }}
                className={`border-b border-gray-50 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"} hover:bg-orange-50/40`}
              >
                <td className="px-3 py-2.5 font-semibold text-gray-700 max-w-[130px] truncate" title={s.site}>{s.site}</td>
                {title && <td className="px-3 py-2.5 text-gray-500 max-w-[100px] truncate" title={s.coordination}>{s.coordination || '—'}</td>}
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
);

// ─── Vue Site (niveau 3) ───────────────────────────────────────
const VueSite: React.FC<{ stats: SiteStats; nomSite: string }> = ({ stats, nomSite }) => {
  const t = stats.tauxRetrait;
  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard label="Total cartes"    value={stats.total}   sub="Ce site"
          gradient="from-[#F77F00] to-[#FF9E40]" icon={<ChartBarIcon className="w-5 h-5 text-white" />} delay={0} />
        <KpiCard label="Retirées"        value={stats.retires}  sub="Délivrées"
          gradient="from-green-500 to-emerald-600" icon={<CheckCircleIcon className="w-5 h-5 text-white" />} delay={0.05} />
        <KpiCard label="Restantes"       value={stats.restants} sub="En attente"
          gradient="from-blue-500 to-sky-600" icon={<ClockIcon className="w-5 h-5 text-white" />} delay={0.1} />
        <KpiCard label="Taux de retrait" value={`${t}%`} sub="Performance site"
          gradient="from-violet-500 to-purple-600" icon={<ArrowTrendingUpIcon className="w-5 h-5 text-white" />} delay={0.15} />
      </div>

      {/* Jauge + Camembert */}
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
          <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${bgColor(t)}`}>
            {t >= 75 ? '🏆 Excellent' : t >= 50 ? '📈 En progression' : '⚠️ À améliorer'}
          </div>
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
    </div>
  );
};

// ─── Vue Coordination (niveau 2) ───────────────────────────────
const VueCoordination: React.FC<{
  coord: CoordStats;
  sitesFiltres: SiteStats[];
  topN: number;
  setTopN: (n: number) => void;
}> = ({ coord, sitesFiltres, topN, setTopN }) => {
  const [expanded, setExpanded] = useState(false);
  const pieData = [{ name: "Retirées", value: coord.retires }, { name: "Restantes", value: coord.restants }];
  const topSites = useMemo(() => [...sitesFiltres].sort((a, b) => b.retires - a.retires).slice(0, topN), [sitesFiltres, topN]);

  return (
    <div className="space-y-5">
      {/* KPIs coordination */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard label="Total cartes"    value={coord.total}   sub={`${coord.sites.length} sites`}
          gradient="from-[#F77F00] to-[#FF9E40]" icon={<ChartBarIcon className="w-5 h-5 text-white" />} delay={0} />
        <KpiCard label="Retirées"        value={coord.retires}  sub="Délivrées"
          gradient="from-green-500 to-emerald-600" icon={<CheckCircleIcon className="w-5 h-5 text-white" />} delay={0.05} />
        <KpiCard label="Restantes"       value={coord.restants} sub="En attente"
          gradient="from-blue-500 to-sky-600" icon={<ClockIcon className="w-5 h-5 text-white" />} delay={0.1} />
        <KpiCard label="Taux de retrait" value={`${coord.tauxRetrait}%`} sub="Cette coordination"
          gradient="from-violet-500 to-purple-600" icon={<ArrowTrendingUpIcon className="w-5 h-5 text-white" />} delay={0.15} />
      </div>

      {/* Jauge + Camembert */}
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

      {/* Bar chart top sites */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <SectionHeader
          icon={<TrophyIcon className="w-4 h-4 text-white" />}
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

      {/* Tableau détaillé des sites */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <SectionHeader
          icon={<MapPinIcon className="w-4 h-4 text-white" />}
          title="Détail par site"
          sub={`${sitesFiltres.length} site${sitesFiltres.length > 1 ? 's' : ''}`}
          action={
            <button onClick={() => setExpanded(e => !e)}
              className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 transition-colors font-medium">
              {expanded ? 'Réduire' : 'Agrandir'}
              <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          }
        />
        <div style={{ maxHeight: expanded ? 'none' : 360 }} className="overflow-auto rounded-xl border border-gray-100">
          <TableauSites sites={sitesFiltres.sort((a, b) => b.total - a.total)} />
        </div>
      </div>
    </div>
  );
};

// ─── Vue Globale (niveau 1) ────────────────────────────────────
const VueGlobale: React.FC<{
  globales: GlobalStats;
  coordData: CoordStats[];
  allSites: SiteStats[];
  sitesFiltres: SiteStats[];
  topN: number;
  setTopN: (n: number) => void;
}> = ({ globales, coordData, allSites, sitesFiltres, topN, setTopN }) => {
  const pieData = [
    { name: "Retirées", value: globales.retires },
    { name: "Restantes", value: globales.restants },
  ];
  const topSites = useMemo(
    () => [...sitesFiltres].sort((a, b) => b.retires - a.retires).slice(0, topN),
    [sitesFiltres, topN]
  );
  const tauxGlobal = pct(globales.retires, globales.total);

  return (
    <div className="space-y-5">
      {/* KPI 4 cartes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total cartes"    value={globales.total}   sub="Toutes coordinations"
          gradient="from-[#F77F00] to-[#FF9E40]" icon={<ChartBarIcon className="w-5 h-5 text-white" />} delay={0} />
        <KpiCard label="Cartes retirées" value={globales.retires}  sub="Délivrance complétée"
          gradient="from-green-500 to-emerald-600" icon={<CheckCircleIcon className="w-5 h-5 text-white" />} delay={0.05} />
        <KpiCard label="Cartes restantes"value={globales.restants} sub="En attente de retrait"
          gradient="from-blue-500 to-sky-600" icon={<ClockIcon className="w-5 h-5 text-white" />} delay={0.1} />
        <KpiCard label="Taux de retrait" value={`${tauxGlobal}%`}
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

      {/* Coordinations */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <SectionHeader icon={<BuildingOfficeIcon className="w-4 h-4 text-white" />}
          title="Par coordination" sub={`${coordData.length} coordination(s)`} />
        {coordData.length === 0
          ? <p className="text-center text-gray-400 text-sm py-8">Aucune donnée</p>
          : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coordData.map((c, i) => (
              <motion.div key={c.coordination}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 + i * 0.05 }}
                className="rounded-xl border border-gray-100 p-4 hover:border-orange-200 hover:bg-orange-50/20 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="font-bold text-gray-700 text-sm truncate max-w-[140px]" title={c.coordination}>{c.coordination}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${bgColor(c.tauxRetrait)}`}>{c.tauxRetrait}%</span>
                </div>
                <ProgressBar value={c.tauxRetrait} delay={0.4 + i * 0.05} />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>{fmt(c.retires)} retirées</span>
                  <span>{fmt(c.total)} total</span>
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

      {/* Top sites BarChart */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <SectionHeader
          icon={<TrophyIcon className="w-4 h-4 text-white" />}
          title="Top sites — cartes retirées"
          sub={`${topSites.length} meilleurs sites`}
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

      {/* Tableau complet sites filtrés */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <SectionHeader icon={<MapPinIcon className="w-4 h-4 text-white" />}
          title="Détail par site" sub={`${sitesFiltres.length} site${sitesFiltres.length > 1 ? 's' : ''}`} />
        <TableauSites sites={sitesFiltres.sort((a, b) => b.total - a.total)} title="global" />
      </motion.div>

      {/* Graphique évolution — top 6 */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <SectionHeader icon={<ArrowTrendingUpIcon className="w-4 h-4 text-white" />}
          title="Évolution — Top 6 sites" sub="Comparaison total / retirées / restantes" />
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

// ─── Page principale ───────────────────────────────────────────
const TableauDeBord: React.FC = () => {
  const { user, hasRole } = useAuth();

  const isAdmin       = hasRole(['Administrateur']);
  const isGestionnaire = hasRole(['Gestionnaire']);

  const [globales,  setGlobales]  = useState<GlobalStats | null>(null);
  const [allSites,  setAllSites]  = useState<SiteStats[]>([]);
  const [coordData, setCoordData] = useState<CoordStats[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [lastUpdate,setLastUpdate]= useState("");
  const [isOnline,  setIsOnline]  = useState(navigator.onLine);
  const [topN,      setTopN]      = useState(8);

  // Niveaux de vue disponibles selon le rôle
  const niveaux: Array<{ id: 'global' | 'coordination' | 'site'; label: string; icon: React.ReactNode }> = useMemo(() => {
    if (isAdmin) return [
      { id: 'global',       label: 'Global',       icon: <GlobeAltIcon className="w-4 h-4" />      },
      { id: 'coordination', label: 'Coordination',  icon: <BuildingOfficeIcon className="w-4 h-4" />},
      { id: 'site',         label: 'Site',          icon: <MapPinIcon className="w-4 h-4" />        },
    ];
    if (isGestionnaire) return [
      { id: 'coordination', label: 'Ma coordination', icon: <BuildingOfficeIcon className="w-4 h-4" /> },
      { id: 'site',         label: 'Sites',           icon: <MapPinIcon className="w-4 h-4" />        },
    ];
    return [
      { id: 'site', label: 'Mon site', icon: <MapPinIcon className="w-4 h-4" /> },
    ];
  }, [isAdmin, isGestionnaire]);

  const [niveauActif, setNiveauActif] = useState<'global' | 'coordination' | 'site'>(niveaux[0].id);

  const [filtres, setFiltres] = useState<FiltreState>({
    coordination: isGestionnaire ? (user?.coordination || '') : '',
    site: '',
    seuilMin: 0,
    seuilMax: 100,
  });

  // Coordinations et sites disponibles
  const coordinations = useMemo(() => [...new Set(allSites.map(s => s.coordination).filter(Boolean))].sort(), [allSites]);
  const sitesDisponibles = useMemo(() => {
    if (filtres.coordination) return allSites.filter(s => s.coordination === filtres.coordination).map(s => s.site);
    return allSites.map(s => s.site);
  }, [allSites, filtres.coordination]);

  // Données filtrées
  const sitesFiltres = useMemo(() => {
    let data = [...allSites];
    // Restriction rôle
    if (isGestionnaire && user?.coordination) data = data.filter(s => s.coordination === user.coordination);
    // Filtres UI
    if (filtres.coordination) data = data.filter(s => s.coordination === filtres.coordination);
    if (filtres.site)         data = data.filter(s => s.site === filtres.site);
    data = data.filter(s => s.tauxRetrait >= filtres.seuilMin && s.tauxRetrait <= filtres.seuilMax);
    return data;
  }, [allSites, filtres, isGestionnaire, user]);

  // CoordData filtré
  const coordFiltrees = useMemo(() => {
    let data = [...coordData];
    if (isGestionnaire && user?.coordination) data = data.filter(c => c.coordination === user.coordination);
    if (filtres.coordination) data = data.filter(c => c.coordination === filtres.coordination);
    return data;
  }, [coordData, filtres, isGestionnaire, user]);

  // Coordination active pour vue coordination
  const coordActive = useMemo(() => {
    if (filtres.coordination) return coordFiltrees.find(c => c.coordination === filtres.coordination) || coordFiltrees[0];
    return coordFiltrees[0];
  }, [coordFiltrees, filtres]);

  // Site actif pour vue site
  const siteActif = useMemo(() => {
    if (filtres.site) return sitesFiltres.find(s => s.site === filtres.site) || sitesFiltres[0];
    if (!isAdmin && !isGestionnaire && user?.agence) return sitesFiltres.find(s => s.site === user.agence) || sitesFiltres[0];
    return sitesFiltres[0];
  }, [sitesFiltres, filtres, isAdmin, isGestionnaire, user]);

  // Stats globales recalculées depuis les sites filtrés
  const globalFiltrees = useMemo<GlobalStats>(() => {
    const total   = sitesFiltres.reduce((s, x) => s + x.total,   0);
    const retires = sitesFiltres.reduce((s, x) => s + x.retires, 0);
    const restants= sitesFiltres.reduce((s, x) => s + x.restants,0);
    return { total, retires, restants, tauxRetrait: pct(retires, total) };
  }, [sitesFiltres]);

  // Connexion réseau
  useEffect(() => {
    const on = () => setIsOnline(true); const off = () => setIsOnline(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  const fetchData = useCallback(async (force = false) => {
    if (!isOnline && !force) { setError("Mode hors ligne."); setLoading(false); return; }
    try {
      setLoading(true); setError("");
      const [g, s] = await Promise.all([
        StatistiquesService.getStatistiquesGlobales(),
        StatistiquesService.getStatistiquesParSite(),
      ]);
      setGlobales(g);

      const adapted: SiteStats[] = s.map((x: any) => ({
        site:        x.site,
        coordination: x.coordination || "",
        total:       x.total,
        retires:     x.retires,
        restants:    x.restants,
        tauxRetrait: pct(x.retires, x.total),
      }));
      setAllSites(adapted);

      // Construire coordData
      const coordMap: Record<string, CoordStats> = {};
      adapted.forEach(s => {
        const c = s.coordination || "Non défini";
        if (!coordMap[c]) coordMap[c] = { coordination: c, total: 0, retires: 0, restants: 0, tauxRetrait: 0, sites: [] };
        coordMap[c].total   += s.total;
        coordMap[c].retires += s.retires;
        coordMap[c].restants+= s.restants;
        coordMap[c].sites.push(s);
      });
      Object.values(coordMap).forEach(c => { c.tauxRetrait = pct(c.retires, c.total); });
      setCoordData(Object.values(coordMap).sort((a, b) => b.total - a.total));
      setLastUpdate(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
    } catch (e: any) { setError(e.message || "Erreur de chargement"); }
    finally { setLoading(false); }
  }, [isOnline]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { const t = setInterval(() => fetchData(), 300000); return () => clearInterval(t); }, [fetchData]);

  // Titre selon niveau
  const titreNiveau = useMemo(() => {
    if (niveauActif === 'global') return 'Vue globale';
    if (niveauActif === 'coordination') return coordActive?.coordination || 'Coordination';
    return siteActif?.site || 'Site';
  }, [niveauActif, coordActive, siteActif]);

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

      {/* Bannière hors ligne */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            className="bg-amber-100 border-b border-amber-300 text-amber-800 text-center text-sm py-2 flex items-center justify-center gap-2">
            <SignalSlashIcon className="w-4 h-4" /> Mode hors ligne — données en cache
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero header ── */}
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
              <button onClick={() => fetchData(true)} disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-xl border border-white/30 transition-all disabled:opacity-60">
                <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Actualiser
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-6 space-y-5">

        {/* Erreur */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />{error}
              <button onClick={() => setError('')} className="ml-auto"><XMarkIcon className="w-4 h-4" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Barre navigation niveaux + Filtres ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">

          {/* Sélecteur de niveau */}
          <div className="flex items-center bg-white border border-gray-200 rounded-2xl p-1 gap-1 shadow-sm">
            {niveaux.map((n, i) => (
              <React.Fragment key={n.id}>
                <button
                  onClick={() => setNiveauActif(n.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all
                    ${niveauActif === n.id
                      ? 'bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                >
                  {n.icon}
                  <span className="hidden sm:inline">{n.label}</span>
                </button>
                {i < niveaux.length - 1 && (
                  <ChevronRightIcon className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Filtres (admin & gestionnaire) */}
          {(isAdmin || isGestionnaire) && (
            <FiltrePanel
              filtres={filtres}
              setFiltres={setFiltres}
              coordinations={coordinations}
              sites={sitesDisponibles}
              isAdmin={isAdmin}
              isGestionnaire={isGestionnaire}
            />
          )}
        </div>

        {/* ── Chips filtres actifs ── */}
        {(filtres.coordination || filtres.site || filtres.seuilMin > 0 || filtres.seuilMax < 100) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400 font-medium">Filtres actifs :</span>
            {filtres.coordination && (
              <span className="flex items-center gap-1.5 bg-orange-100 text-orange-700 border border-orange-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                <BuildingOfficeIcon className="w-3 h-3" />{filtres.coordination}
                <button onClick={() => setFiltres({ ...filtres, coordination: '', site: '' })}><XMarkIcon className="w-2.5 h-2.5" /></button>
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
            <span className="text-xs text-gray-400">— {sitesFiltres.length} site{sitesFiltres.length > 1 ? 's' : ''} sélectionné{sitesFiltres.length > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* ── Contenu selon le niveau ── */}
        <AnimatePresence mode="wait">
          <motion.div key={`${niveauActif}-${filtres.coordination}-${filtres.site}`}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {niveauActif === 'global' && globales && (
              <VueGlobale
                globales={globalFiltrees}
                coordData={coordFiltrees}
                allSites={allSites}
                sitesFiltres={sitesFiltres}
                topN={topN}
                setTopN={setTopN}
              />
            )}

            {niveauActif === 'coordination' && (
              coordActive
                ? <VueCoordination
                    coord={coordActive}
                    sitesFiltres={sitesFiltres.filter(s => s.coordination === coordActive.coordination)}
                    topN={topN}
                    setTopN={setTopN}
                  />
                : <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
                    <BuildingOfficeIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 font-semibold">Aucune coordination disponible</p>
                    <p className="text-gray-400 text-sm mt-1">Sélectionnez une coordination dans les filtres</p>
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

        {/* Pied de page */}
        <div className="flex items-center justify-between text-xs text-gray-400 pb-4 pt-2">
          <span>GESCARD v3.1.0</span>
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Sync toutes les 5 min
          </span>
        </div>
      </div>
    </div>
  );
};


// ----- src\pages\administration\Comptes.tsx -----
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
// import { useAuth } from '../../hooks/useAuth'; // CONSOLIDÉ
// import { usePermissions } from '../../hooks/usePermissions'; // CONSOLIDÉ
// import { UtilisateursService } from '../../Services/api/utilisateurs'; // CONSOLIDÉ
// import apiClient from '../../Services/api/client'; // CONSOLIDÉ
export default Comptes;
// src/pages/administration/Comptes.tsx
  UsersIcon, UserPlusIcon, PencilIcon, ShieldCheckIcon, UserIcon,
  CheckCircleIcon, XCircleIcon, MagnifyingGlassIcon, ArrowPathIcon,
  KeyIcon, BuildingOfficeIcon, BuildingStorefrontIcon, CalendarIcon,
  ExclamationTriangleIcon, FunnelIcon, XMarkIcon, EyeIcon, EyeSlashIcon,
  MapPinIcon, PlusIcon, TrashIcon, LinkIcon,
} from '@heroicons/react/24/outline';
// types utilisés via cast 'as any' dans les appels API

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

  // Agences filtrées selon la coordination sélectionnée
  const selectedCoord = coordinations.find(c => c.nom === formData.coordination);
  const agencesFiltrees = selectedCoord
    ? agences.filter(a => a.coordination_id === selectedCoord.id && a.is_active)
    : agences.filter(a => a.is_active);

  // Sites filtrés selon la coordination/agence sélectionnée
  const sitesFiltres: SiteRef[] = formData.agence_id
    ? sites.filter(s => s.coordination_id === selectedCoord?.id)
    : sites.filter(s => !selectedCoord || s.coordination_id === selectedCoord.id);

  // Grouper les sites par agence pour l'affichage
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
      {formData.role !== 'Administrateur' && (
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5" />
            Sites associés {!isEdit && <span className="text-red-500">*</span>}
          </p>
          {sites.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Aucun site disponible — créez d'abord des sites</p>
          ) : (
            <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
              {Object.entries(sitesByCoord).map(([coordNom, coordSites]) => (
                <div key={coordNom}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{coordNom}</p>
                  <div className="flex flex-wrap gap-2">
                    {coordSites.map(site => {
                      const selected = selectedSiteIds.includes(site.id);
                      const isPrincipal = selectedSiteIds[0] === site.id && selected;
                      return (
                        <button key={site.id} type="button" onClick={() => toggleSite(site.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            selected
                              ? 'bg-[#F77F00] text-white border-[#F77F00] shadow-sm'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-[#F77F00]/50 hover:text-[#F77F00]'
                          }`}>
                          <BuildingStorefrontIcon className="w-3 h-3" />
                          {site.id}
                          {isPrincipal && <span className="ml-0.5 text-[10px] bg-white/30 px-1 rounded">★</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          {selectedSiteIds.length > 0 && (
            <p className="text-xs text-[#F77F00] mt-2 font-medium">
              {selectedSiteIds.length} site(s) · ★ = site principal ({selectedSiteIds[0]})
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
      // Mapper les sites en SiteRef
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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userForm.motDePasse !== userForm.confirmerMotDePasse) { showError('Mots de passe différents'); return; }
    if (userForm.role !== 'Administrateur' && selectedSiteIds.length === 0) {
      showError('Au moins un site doit être sélectionné'); return;
    }
    try {
      await UtilisateursService.createUtilisateur({
        nomUtilisateur: userForm.nomUtilisateur,
        nomComplet:     userForm.nomComplet || undefined,
        role:           userForm.role,
        coordination:   userForm.coordination,
        agence:         userForm.agence,
        email:          userForm.email || undefined,
        telephone:      userForm.telephone || undefined,
        motDePasse:     userForm.motDePasse,
        SiteIds:        selectedSiteIds,
      } as any);
      showSuccess('Utilisateur créé avec succès');
      setShowCreateModal(false);
      setUserForm(emptyUserForm);
      setSelectedSiteIds([]);
      fetchUtilisateurs();
    } catch (e: any) { showError(e.response?.data?.message || 'Erreur lors de la création'); }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (userForm.motDePasse && userForm.motDePasse !== userForm.confirmerMotDePasse) { showError('Mots de passe différents'); return; }
    try {
      const data: any = {
        NomComplet:   userForm.nomComplet   || undefined,
        Role:         userForm.role,
        Coordination: userForm.coordination,
        Agence:       userForm.agence,
        Email:        userForm.email        || undefined,
        Telephone:    userForm.telephone    || undefined,
        SiteIds:      selectedSiteIds,
      };
      if (userForm.motDePasse) data.MotDePasse = userForm.motDePasse;
      await UtilisateursService.updateUtilisateur(editingUser.id, data);
      showSuccess('Utilisateur modifié avec succès');
      setShowEditModal(false);
      setUserForm(emptyUserForm);
      setSelectedSiteIds([]);
      fetchUtilisateurs();
    } catch (e: any) { showError(e.response?.data?.message || 'Erreur lors de la modification'); }
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
  const [agences,         setAgences]         = useState<Agence[]>([]);
  const [agenceLoading,   setAgenceLoading]   = useState(false);
  const [showAgenceModal, setShowAgenceModal] = useState(false);
  const [editingAgence,   setEditingAgence]   = useState<Agence | null>(null);
  const [agenceForm,      setAgenceForm]      = useState<Partial<Agence>>({});
  const [agenceSearch,    setAgenceSearch]    = useState('');
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
                                  className={`p-1.5 rounded-lg transition-all ${u.actif ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                                  title={u.actif ? 'Désactiver' : 'Réactiver'}>
                                  {u.actif ? <XCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
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
                              className={`p-1.5 rounded-lg ${u.actif ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}>
                              {u.actif ? <XCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
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
                      {c.responsable     && <div className="flex items-center gap-1.5"><UserIcon     className="w-3.5 h-3.5" />{c.responsable}</div>}
                      {c.telephone       && <div className="flex items-center gap-1.5"><KeyIcon      className="w-3.5 h-3.5" />{c.telephone}</div>}
                      {c.ville_principale && <div className="flex items-center gap-1.5"><MapPinIcon  className="w-3.5 h-3.5" />{c.ville_principale}{c.region ? `, ${c.region}` : ''}</div>}
                      {c.description     && <div className="text-gray-400 italic line-clamp-2">{c.description}</div>}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex gap-3 text-xs text-gray-400">
                        {c.nombre_sites   !== undefined && <span><span className="font-semibold text-gray-600">{c.nombre_sites}</span> site(s)</span>}
                        {c.nombre_agents  !== undefined && <span><span className="font-semibold text-gray-600">{c.nombre_agents}</span> agent(s)</span>}
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
                      {a.responsable && <div className="flex items-center gap-1.5"><UserIcon    className="w-3.5 h-3.5" />{a.responsable}</div>}
                      {a.telephone   && <div className="flex items-center gap-1.5"><KeyIcon     className="w-3.5 h-3.5" />{a.telephone}</div>}
                      {a.adresse     && <div className="flex items-center gap-1.5"><MapPinIcon  className="w-3.5 h-3.5" />{a.adresse}</div>}
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


// ----- src\pages\administration\MisesAjour.tsx -----
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
import axios from 'axios';
export default MisesAJour;
// src/pages/administration/MisesAJour.tsx
  ArrowDownTrayIcon, CloudArrowUpIcon, CheckCircleIcon,
  ExclamationTriangleIcon, ClockIcon, TrashIcon, DocumentTextIcon,
  ArrowPathIcon, ShieldCheckIcon, ComputerDesktopIcon,
  InformationCircleIcon, XMarkIcon, ChevronRightIcon,
  ServerStackIcon, DocumentCheckIcon, BuildingOfficeIcon,
} from '@heroicons/react/24/outline';

// VITE_API_URL = 'https://gescardcocody.com/api' → on enlève le /api trailing
const _RAW_URL = (import.meta.env.VITE_API_URL || 'https://gescardcocody.com/api').replace(/\/api\/?$/, '');
const API_BASE = _RAW_URL; // ex: https://gescardcocody.com

// ─── Types ────────────────────────────────────────────────────
interface VersionInfo {
  version:       string | null;
  release_notes: string;
  published_at:  string | null;
  published_by:  string;
  file_size:     number | null;
  mandatory:     boolean;
  download_url:  string | null;
}

interface VersionHistorique {
  filename:   string;
  version:    string;
  size:       number;
  created_at: string;
}

interface Site {
  id:               string;
  nom:              string;
  coordination_nom: string;
}

// ─── Utilitaires ──────────────────────────────────────────────
const formatSize = (bytes: number | null) => {
  if (!bytes) return '—';
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
  return `${(bytes / 1024).toFixed(0)} Ko`;
};

const formatDate = (iso: string | null) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

// ─── Composants ───────────────────────────────────────────────
const SectionCard: React.FC<{
  icon: React.ReactNode; title: string; sub?: string;
  children: React.ReactNode; className?: string;
}> = ({ icon, title, sub, children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
      <div className="w-9 h-9 bg-gradient-to-br from-[#F77F00] to-[#FF9E40] rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="font-bold text-gray-800 text-sm">{title}</h2>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const KpiTile: React.FC<{
  label: string; value: string; gradient: string; icon: React.ReactNode;
}> = ({ label, value, gradient, icon }) => (
  <div className={`rounded-xl p-4 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
    <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full bg-white/10" />
    <div className="relative z-10 flex items-center gap-3">
      <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">{icon}</div>
      <div>
        <div className="text-white/70 text-xs font-medium">{label}</div>
        <div className="text-white font-black text-base leading-tight">{value}</div>
      </div>
    </div>
  </div>
);

// ─── Page principale ──────────────────────────────────────────
const MisesAJour: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token   = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // ── États : Mises à jour logiciel ────────────────────────────
  const [versionActuelle, setVersionActuelle] = useState<VersionInfo | null>(null);
  const [historique,      setHistorique]      = useState<VersionHistorique[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [uploading,       setUploading]       = useState(false);
  const [uploadProgress,  setUploadProgress]  = useState(0);
  const [error,           setError]           = useState('');
  const [success,         setSuccess]         = useState('');
  const [confirmDel,      setConfirmDel]      = useState<string | null>(null);
  const [formData,        setFormData]        = useState({
    version: '', release_notes: '', mandatory: false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver,     setDragOver]     = useState(false);

  // ── États : Fichier hors-ligne ───────────────────────────────
  const [sites,           setSites]           = useState<Site[]>([]);
  const [selectedSite,    setSelectedSite]    = useState('');
  const [validite,        setValidite]        = useState(7);
  const [includeCards,    setIncludeCards]    = useState(false);
  const [generatingFile,  setGeneratingFile]  = useState(false);
  const [loadingSites,    setLoadingSites]    = useState(true);
  const [initError,       setInitError]       = useState('');
  const [initSuccess,     setInitSuccess]     = useState('');

  // ── Chargement : versions logiciel ──────────────────────────
  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const [latest, hist] = await Promise.all([
        axios.get(`${API_BASE}/api/updates/latest`),
        axios.get(`${API_BASE}/api/updates/history`, { headers }),
      ]);
      setVersionActuelle(latest.data.version ? latest.data : null);
      setHistorique(hist.data.versions || []);
    } catch {
      setError('Impossible de charger les données.');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { charger(); }, [charger]);

  // ── Chargement : sites pour fichier hors-ligne ───────────────
  const fetchSites = useCallback(async () => {
    try {
      setLoadingSites(true);
      const res = await axios.get(`${API_BASE}/api/init-file/sites`, { headers });
      const liste: Site[] = res.data.sites || [];
      setSites(liste);
      if (liste.length > 0) setSelectedSite(liste[0].id);
    } catch {
      setInitError('Impossible de charger la liste des sites.');
    } finally {
      setLoadingSites(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchSites(); }, [fetchSites]);

  // ── Sélection fichier .exe ───────────────────────────────────
  const handleFile = (file: File | null) => {
    if (!file) return;
    if (!file.name.endsWith('.exe')) { setError('Seuls les fichiers .exe sont acceptés.'); return; }
    setSelectedFile(file);
    setError('');
    const match = file.name.match(/v?(\d+\.\d+\.\d+)/);
    if (match) setFormData(f => ({ ...f, version: match[1] }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    handleFile(e.dataTransfer.files[0] || null);
  };

  // ── Publication version logiciel ─────────────────────────────
  const handlePublish = async () => {
    if (!selectedFile) { setError('Sélectionnez un fichier .exe.'); return; }
    if (!formData.version.match(/^\d+\.\d+\.\d+$/)) { setError('Format invalide. Ex : 1.2.3'); return; }

    setUploading(true); setUploadProgress(0); setError(''); setSuccess('');
    const data = new FormData();
    data.append('file',          selectedFile);
    data.append('version',       formData.version);
    data.append('release_notes', formData.release_notes);
    data.append('mandatory',     String(formData.mandatory));

    try {
      await axios.post(`${API_BASE}/api/updates/publish`, data, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => setUploadProgress(Math.round(((e.loaded || 0) / (e.total || 1)) * 100)),
      });
      setSuccess(`✓ Version ${formData.version} publiée avec succès !`);
      setSelectedFile(null);
      setFormData({ version: '', release_notes: '', mandatory: false });
      if (fileInputRef.current) fileInputRef.current.value = '';
      await charger();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erreur lors de la publication.');
    } finally {
      setUploading(false); setUploadProgress(0);
    }
  };

  // ── Suppression version ──────────────────────────────────────
  const handleDelete = async (version: string) => {
    try {
      await axios.delete(`${API_BASE}/api/updates/${version}`, { headers });
      setSuccess(`Version ${version} supprimée.`);
      setConfirmDel(null);
      await charger();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erreur lors de la suppression.');
    }
  };

  // ── Génération fichier hors-ligne ────────────────────────────
  const handleGenerateInitFile = async () => {
    if (!selectedSite) { setInitError('Veuillez sélectionner un site.'); return; }
    setGeneratingFile(true);
    setInitError('');
    setInitSuccess('');

    try {
      const response = await axios.post(
        `${API_BASE}/api/init-file/generate`,
        { site_id: selectedSite, validite_jours: validite, include_cards: includeCards },
        { headers, responseType: 'blob' }
      );

      // Déclencher le téléchargement dans le navigateur
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.download = `${selectedSite}-init.gescard`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      const siteLabel = sites.find(s => s.id === selectedSite)?.nom || selectedSite;
      setInitSuccess(`Fichier généré pour "${siteLabel}" · Validité : ${validite} jour(s). Envoyez-le au responsable du site.`);
    } catch (e: any) {
      // Si le blob contient une erreur JSON, on la lit
      try {
        const text = await (e.response?.data as Blob)?.text?.();
        const json = text ? JSON.parse(text) : null;
        setInitError(json?.message || 'Erreur lors de la génération du fichier.');
      } catch {
        setInitError('Erreur lors de la génération du fichier.');
      }
    } finally {
      setGeneratingFile(false);
    }
  };

  // ── Loader ───────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center gap-4">
      <ArrowPathIcon className="w-8 h-8 text-[#F77F00] animate-spin" />
      <span className="text-gray-600 font-medium">Chargement…</span>
    </div>
  );

  // ── Rendu ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6">

        {/* ── En-tête ── */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Mises à jour logiciel</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Administration — <span className="text-[#F77F00] font-semibold">GESCARD Desktop</span>
            </p>
          </div>
          <button onClick={charger}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 shadow-sm transition-all self-start sm:self-auto">
            <ArrowPathIcon className="w-4 h-4" />
            Actualiser
          </button>
        </motion.div>

        {/* ── Alerts MAJ logiciel ── */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{error}</span>
              <button onClick={() => setError('')}><XMarkIcon className="w-4 h-4 text-red-400 hover:text-red-600" /></button>
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
              <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{success}</span>
              <button onClick={() => setSuccess('')}><XMarkIcon className="w-4 h-4 text-green-400 hover:text-green-600" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── KPI row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiTile
            label="Version actuelle"
            value={versionActuelle?.version ? `v${versionActuelle.version}` : 'Aucune'}
            gradient="from-[#F77F00] to-[#FF9E40]"
            icon={<ComputerDesktopIcon className="w-5 h-5 text-white" />}
          />
          <KpiTile
            label="Taille"
            value={formatSize(versionActuelle?.file_size || null)}
            gradient="from-blue-500 to-sky-600"
            icon={<ArrowDownTrayIcon className="w-5 h-5 text-white" />}
          />
          <KpiTile
            label="Versions archivées"
            value={String(historique.length)}
            gradient="from-violet-500 to-purple-600"
            icon={<ClockIcon className="w-5 h-5 text-white" />}
          />
          <KpiTile
            label="Type"
            value={versionActuelle?.mandatory ? 'Obligatoire' : 'Optionnelle'}
            gradient={versionActuelle?.mandatory ? 'from-red-500 to-rose-600' : 'from-green-500 to-emerald-600'}
            icon={<ShieldCheckIcon className="w-5 h-5 text-white" />}
          />
        </div>

        {/* ── Ligne principale : Version actuelle + Publication ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Version actuelle */}
          <SectionCard
            icon={<InformationCircleIcon className="w-4 h-4 text-white" />}
            title="Version publiée"
            sub="Actuellement disponible pour les utilisateurs"
          >
            {!versionActuelle?.version ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <ComputerDesktopIcon className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium text-sm">Aucune version publiée</p>
                <p className="text-gray-400 text-xs mt-1">Publiez une première version ci-contre</p>
              </div>
            ) : (
              <div className="space-y-4">

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#F77F00] to-[#FF9E40] rounded-xl flex items-center justify-center shadow">
                      <CheckCircleIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Version</div>
                      <div className="text-xl font-black text-[#F77F00]">v{versionActuelle.version}</div>
                    </div>
                  </div>
                  {versionActuelle.mandatory && (
                    <span className="flex items-center gap-1.5 text-xs bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded-full font-semibold">
                      <ShieldCheckIcon className="w-3.5 h-3.5" /> Obligatoire
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                      <ArrowDownTrayIcon className="w-3 h-3" /> Taille
                    </div>
                    <div className="font-bold text-gray-700 text-sm">{formatSize(versionActuelle.file_size)}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                      <ClockIcon className="w-3 h-3" /> Publiée le
                    </div>
                    <div className="font-bold text-gray-700 text-xs leading-snug">{formatDate(versionActuelle.published_at)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2.5">
                  <div className="w-6 h-6 bg-gradient-to-br from-[#F77F00] to-[#FF9E40] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {versionActuelle.published_by?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <span>Publiée par <strong className="text-gray-700">{versionActuelle.published_by || '—'}</strong></span>
                </div>

                {versionActuelle.release_notes && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 mb-2">
                      <DocumentTextIcon className="w-3.5 h-3.5" /> Notes de version
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{versionActuelle.release_notes}</p>
                  </div>
                )}

                <a href={`${API_BASE}/api/updates/download`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-[#F77F00] text-[#F77F00] font-semibold text-sm rounded-xl hover:bg-orange-50 transition-all">
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Tester le téléchargement
                </a>
              </div>
            )}
          </SectionCard>

          {/* Formulaire publication */}
          <SectionCard
            icon={<CloudArrowUpIcon className="w-4 h-4 text-white" />}
            title="Publier une nouvelle version"
            sub="Déposez le fichier .exe et renseignez les informations"
          >
            <div className="space-y-4">

              {/* Zone dépôt fichier */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                  selectedFile
                    ? 'border-green-400 bg-green-50'
                    : dragOver
                      ? 'border-[#F77F00] bg-orange-50 scale-[1.01]'
                      : 'border-gray-300 bg-gray-50/50 hover:border-[#F77F00] hover:bg-orange-50/40'
                }`}
              >
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-green-700 text-sm">{selectedFile.name}</div>
                      <div className="text-xs text-green-500">{formatSize(selectedFile.size)}</div>
                    </div>
                    <button type="button" onClick={e => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="ml-auto p-1 text-green-400 hover:text-green-600">
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <CloudArrowUpIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">Glissez ou cliquez pour sélectionner</p>
                    <p className="text-xs text-gray-400 mt-1">Fichier .exe · Max 500 Mo</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept=".exe" className="hidden"
                  onChange={e => handleFile(e.target.files?.[0] || null)} />
              </div>

              {/* Version + Obligatoire */}
              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Numéro de version <span className="text-red-500">*</span>
                  </label>
                  <input type="text" placeholder="Ex : 1.2.3" value={formData.version}
                    onChange={e => setFormData(f => ({ ...f, version: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F77F00]/30 focus:border-[#F77F00]" />
                </div>
                <div className="flex items-center gap-2.5 pb-0.5">
                  <div className="relative">
                    <input type="checkbox" id="mandatory" checked={formData.mandatory}
                      onChange={e => setFormData(f => ({ ...f, mandatory: e.target.checked }))}
                      className="sr-only" />
                    <div onClick={() => setFormData(f => ({ ...f, mandatory: !f.mandatory }))}
                      className={`w-10 h-6 rounded-full cursor-pointer transition-all duration-200 ${formData.mandatory ? 'bg-red-500' : 'bg-gray-200'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${formData.mandatory ? 'left-5' : 'left-1'}`} />
                    </div>
                  </div>
                  <label htmlFor="mandatory" className="text-xs text-gray-600 cursor-pointer select-none"
                    onClick={() => setFormData(f => ({ ...f, mandatory: !f.mandatory }))}>
                    <span className="font-semibold">Obligatoire</span><br />
                    <span className="text-gray-400">Forcer la MAJ</span>
                  </label>
                </div>
              </div>

              {/* Notes de version */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes de version</label>
                <textarea rows={3} placeholder="Décrivez les nouveautés, corrections de bugs…"
                  value={formData.release_notes}
                  onChange={e => setFormData(f => ({ ...f, release_notes: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F77F00]/30 focus:border-[#F77F00] resize-none" />
              </div>

              {/* Barre de progression */}
              <AnimatePresence>
                {uploading && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <ArrowPathIcon className="w-3 h-3 animate-spin text-[#F77F00]" /> Envoi en cours…
                      </span>
                      <span className="font-bold text-[#F77F00]">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        className="h-2.5 rounded-full bg-gradient-to-r from-[#F77F00] to-[#FF9E40]"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bouton publier */}
              <button onClick={handlePublish}
                disabled={uploading || !selectedFile || !formData.version}
                className="w-full py-3 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white font-bold text-sm rounded-xl shadow hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {uploading
                  ? <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Publication en cours…</>
                  : <><CloudArrowUpIcon className="w-4 h-4" /> Publier la version</>
                }
              </button>
            </div>
          </SectionCard>
        </div>

        {/* ── Historique ── */}
        <SectionCard
          icon={<ClockIcon className="w-4 h-4 text-white" />}
          title="Historique des versions"
          sub={`${historique.length} version(s) archivée(s)`}
        >
          {historique.length === 0 ? (
            <div className="text-center py-8">
              <ClockIcon className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Aucun historique disponible</p>
            </div>
          ) : (
            <div className="space-y-2">
              {historique
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((v, i) => {
                  const isActive = versionActuelle?.version === v.version;
                  return (
                    <motion.div key={v.version}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200'
                          : 'bg-gray-50/50 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isActive ? 'bg-gradient-to-br from-[#F77F00] to-[#FF9E40]' : 'bg-gray-200'
                        }`}>
                          {isActive
                            ? <CheckCircleIcon className="w-4 h-4 text-white" />
                            : <ClockIcon className="w-4 h-4 text-gray-500" />
                          }
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-black text-base ${isActive ? 'text-[#F77F00]' : 'text-gray-700'}`}>
                              v{v.version}
                            </span>
                            {isActive && (
                              <span className="text-xs bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full font-semibold">
                                Actuelle
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <ArrowDownTrayIcon className="w-3 h-3" /> {formatSize(v.size)}
                            </span>
                            <ChevronRightIcon className="w-2.5 h-2.5" />
                            <span className="flex items-center gap-1">
                              <ClockIcon className="w-3 h-3" /> {formatDate(v.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isActive && (
                          <button onClick={() => setConfirmDel(v.version)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Supprimer cette version">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              }
            </div>
          )}
        </SectionCard>

        {/* ═══════════════════════════════════════════════════════
            ── SECTION : Fichier d'initialisation hors-ligne ──
        ════════════════════════════════════════════════════════ */}
        <SectionCard
          icon={<ServerStackIcon className="w-4 h-4 text-white" />}
          title="Fichier d'initialisation hors-ligne"
          sub="Générer un fichier .gescard pour un poste sans connexion internet"
        >
          <div className="space-y-5">

            {/* Bandeau info */}
            <div className="flex gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <InformationCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                Ce fichier chiffré permettra à un poste hors-ligne de démarrer avec
                les comptes et données du site sélectionné. Il expire automatiquement
                après la durée choisie.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Colonne gauche : formulaire */}
              <div className="space-y-4">

                {/* Sélecteur de site */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
                    <BuildingOfficeIcon className="w-3.5 h-3.5 text-gray-400" />
                    Site cible
                  </label>
                  {loadingSites ? (
                    <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
                  ) : (
                    <select
                      value={selectedSite}
                      onChange={e => setSelectedSite(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F77F00]/30 focus:border-[#F77F00] bg-gray-50"
                    >
                      {sites.length === 0
                        ? <option value="">Aucun site disponible</option>
                        : sites.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.nom} — {s.coordination_nom}
                            </option>
                          ))
                      }
                    </select>
                  )}
                </div>

                {/* Slider validité */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
                    <ClockIcon className="w-3.5 h-3.5 text-gray-400" />
                    Validité
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range" min={1} max={30} value={validite}
                      onChange={e => setValidite(Number(e.target.value))}
                      className="flex-1 accent-orange-500"
                    />
                    <span className="w-20 text-center px-2 py-1.5 bg-orange-50 text-orange-700 font-bold rounded-xl text-sm border border-orange-200 flex-shrink-0">
                      {validite}j
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Expire le{' '}
                    <span className="font-medium text-gray-600">
                      {new Date(Date.now() + validite * 86400000).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </span>
                  </p>
                </div>

                {/* Option inclure cartes */}
                <div
                  onClick={() => setIncludeCards(v => !v)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    includeCards ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                    includeCards ? 'bg-orange-500 border-orange-500' : 'border-gray-300 bg-white'
                  }`}>
                    {includeCards && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-700">Inclure les cartes</p>
                    <p className="text-xs text-gray-500 truncate">Fichier plus volumineux, données immédiates</p>
                  </div>
                  <ExclamationTriangleIcon className={`w-4 h-4 flex-shrink-0 ${includeCards ? 'text-orange-400' : 'text-gray-300'}`} />
                </div>
              </div>

              {/* Colonne droite : récapitulatif */}
              <div className="flex flex-col justify-between gap-4">

                {/* Récap */}
                {selectedSite ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 flex-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1 mb-3">
                      <DocumentCheckIcon className="w-3.5 h-3.5" />
                      Récapitulatif
                    </p>
                    {[
                      ['Site',           sites.find(s => s.id === selectedSite)?.nom           || selectedSite],
                      ['Coordination',   sites.find(s => s.id === selectedSite)?.coordination_nom || '—'],
                      ['Validité',       `${validite} jour${validite > 1 ? 's' : ''}`],
                      ['Cartes incluses', includeCards ? 'Oui' : 'Non'],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between text-sm">
                        <span className="text-gray-500">{label}</span>
                        <span className="font-semibold text-gray-800">{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-400 text-center">Sélectionnez un site<br />pour voir le récapitulatif</p>
                  </div>
                )}

                {/* Bouton générer */}
                <button
                  onClick={handleGenerateInitFile}
                  disabled={generatingFile || !selectedSite || loadingSites}
                  className="w-full py-3 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white font-bold text-sm rounded-xl shadow hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {generatingFile ? (
                    <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Génération en cours…</>
                  ) : (
                    <><ArrowDownTrayIcon className="w-4 h-4" /> Générer le fichier .gescard</>
                  )}
                </button>

                {/* Note sécurité */}
                <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
                  <ShieldCheckIcon className="w-3 h-3" />
                  Chiffré · Signé · Expiration automatique
                </p>
              </div>
            </div>

            {/* Alerts hors-ligne */}
            <AnimatePresence>
              {initError && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{initError}</span>
                  <button onClick={() => setInitError('')}><XMarkIcon className="w-4 h-4 text-red-400 hover:text-red-600" /></button>
                </motion.div>
              )}
              {initSuccess && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
                  <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{initSuccess}</span>
                  <button onClick={() => setInitSuccess('')}><XMarkIcon className="w-4 h-4 text-green-400 hover:text-green-600" /></button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </SectionCard>
        {/* ── Fin section hors-ligne ── */}

      </div>

      {/* ── Modal confirmation suppression ── */}
      <AnimatePresence>
        {confirmDel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setConfirmDel(null)}
          >
            <motion.div initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrashIcon className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 text-center mb-1">Supprimer la version</h3>
              <p className="text-gray-500 text-sm text-center mb-6">
                Supprimer définitivement la version <strong className="text-gray-800">v{confirmDel}</strong> ?<br />
                Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDel(null)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 text-sm font-medium transition-all">
                  Annuler
                </button>
                <button onClick={() => handleDelete(confirmDel)}
                  className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-semibold text-sm shadow hover:shadow-md hover:from-red-600 transition-all">
                  Supprimer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


// ========== AUTRES FICHIERS ==========

// ----- src\App.tsx -----
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
// import { useAuth }      from "./hooks/useAuth"; // CONSOLIDÉ
// import { AuthProvider } from "./providers/AuthProvider"; // CONSOLIDÉ
// import Navbar           from "./components/Navbar"; // CONSOLIDÉ
// import Login            from "./pages/Login"; // CONSOLIDÉ
// import Accueil          from "./pages/Accueil"; // CONSOLIDÉ
// import TableauDeBord    from "./pages/TableauDeBord"; // CONSOLIDÉ
// import Recherche        from "./pages/Recherche"; // CONSOLIDÉ
// import Journal          from "./pages/Journal"; // CONSOLIDÉ
// import Profil           from "./pages/Profil"; // CONSOLIDÉ
// import Comptes          from "./pages/administration/Comptes"; // CONSOLIDÉ
// import MisesAjour       from "./pages/administration/MisesAjour"; // CONSOLIDÉ
export default App;
// src/App.tsx

// Pages

// ============================================================
// ROUTE PROTÉGÉE
// ============================================================
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && allowedRoles.length > 0) {
    const hasAccess = allowedRoles.includes(user?.role || '');
    if (!hasAccess) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl text-center max-w-md border border-orange-100">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Accès refusé</h2>
            <p className="text-gray-600 mb-4">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4">
              <p className="text-sm text-gray-700">
                <span className="font-medium text-[#F77F00]">Rôle actuel :</span> {user?.role}
              </p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white rounded-xl hover:from-[#e46f00] hover:to-[#FF8C00] transition-all duration-300 font-medium shadow-lg"
            >
              Retour
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

// ============================================================
// CONTENU PRINCIPAL
// ============================================================
const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const hideNavbar = location.pathname === '/login';

  return (
    <>
      {isAuthenticated && !hideNavbar && <Navbar />}

      <Routes>
        {/* ── Publique ── */}
        <Route path="/login" element={<Login />} />
        <Route path="/"      element={<Navigate to="/login" replace />} />

        {/* ── Tous les connectés ── */}
        <Route path="/accueil" element={
          <ProtectedRoute><Accueil /></ProtectedRoute>
        } />

        <Route path="/profil" element={
          <ProtectedRoute><Profil /></ProtectedRoute>
        } />

        <Route path="/recherche" element={
          <ProtectedRoute><Recherche /></ProtectedRoute>
        } />

        {/* ── Administrateur + Gestionnaire ── */}
        <Route path="/tableau-de-bord" element={
          <ProtectedRoute allowedRoles={['Administrateur', 'Gestionnaire']}>
            <TableauDeBord />
          </ProtectedRoute>
        } />

        {/* ── Administrateur uniquement ── */}
        <Route path="/journal" element={
          <ProtectedRoute allowedRoles={['Administrateur']}>
            <Journal />
          </ProtectedRoute>
        } />

        {/* ── Administration : Comptes ── */}
        <Route path="/administration/comptes" element={
          <ProtectedRoute allowedRoles={['Administrateur']}>
            <Comptes />
          </ProtectedRoute>
        } />

        {/* ── Administration : Mises à jour ── */}
        <Route path="/administration/mises-a-jour" element={
          <ProtectedRoute allowedRoles={['Administrateur']}>
            <MisesAjour />
          </ProtectedRoute>
        } />

        {/* ── Redirection /administration → premier sous-menu accessible ── */}
        <Route path="/administration" element={
          <ProtectedRoute allowedRoles={['Administrateur']}>
            <Navigate to="/administration/comptes" replace />
          </ProtectedRoute>
        } />

        {/* ── Anciennes routes → redirect pour compatibilité ── */}
        <Route path="/home"            element={<Navigate to="/accueil"                  replace />} />
        <Route path="/inventaire"      element={<Navigate to="/recherche"                replace />} />
        <Route path="/dashboard"       element={<Navigate to="/tableau-de-bord"          replace />} />
        <Route path="/gestion-comptes" element={<Navigate to="/administration/comptes"   replace />} />

        {/* ── 404 ── */}
        <Route path="*" element={
          isAuthenticated
            ? <Navigate to="/accueil" replace />
            : <Navigate to="/login"   replace />
        } />
      </Routes>
    </>
  );
};

// ============================================================
// APP
// ============================================================
const App: React.FC = () => (
  <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </Router>
);


// ----- src\global.d.ts -----
// Types globaux pour votre application

// Type pour les rôles utilisateur
type UserRole = 'Administrateur' | 'Gestionnaire' | "Chef d'équipe" | 'Opérateur';

// Interface pour les données utilisateur dans le localStorage
interface StoredUser {
  id: number;
  nomUtilisateur: string;
  role: UserRole;
  coordination: string;
  agence: string;
  email?: string;
  telephone?: string;
}

// Extension de l'interface Window pour les propriétés personnalisées
interface Window {
  __APP_VERSION__: string;
  __API_URL__: string;
}

// Type pour les réponses API
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

// Type pour la pagination
interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Type pour les paramètres de requête
interface QueryParams {
  [key: string]: string | number | boolean | undefined | null;
}

// ----- src\index.css -----
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ============================================
   RESET ET STYLES DE BASE PERSONNALISÉS
   ============================================ */
@layer base {
  /* Reset amélioré */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    -webkit-text-size-adjust: 100%;
    -webkit-tap-highlight-color: transparent;
    scroll-behavior: smooth;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    overflow-x: hidden;
    min-height: 100vh;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  }

  /* Amélioration de la sélection de texte */
  ::selection {
    background-color: rgba(247, 127, 0, 0.3);
    color: #1f2937;
  }

  /* Scrollbar personnalisée */
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 5px;
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(45deg, #F77F00, #FF9E40);
    border-radius: 5px;
    border: 2px solid #f1f5f9;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(45deg, #e46f00, #FF8C00);
  }

  /* Empêche le zoom automatique sur iOS */
  input[type="text"],
  input[type="password"],
  input[type="email"],
  input[type="number"],
  textarea,
  select {
    font-size: 16px !important;
  }

  /* Focus visible amélioré */
  :focus-visible {
    outline: 2px solid #F77F00;
    outline-offset: 2px;
  }

  /* Désactiver les animations si préférées réduites */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}

/* ============================================
   COMPOSANTS PERSONNALISÉS
   ============================================ */
@layer components {
  /* Cartes */
  .card {
    @apply bg-white rounded-2xl shadow-soft border border-gray-200 hover:shadow-medium transition-shadow duration-300;
  }

  .card-gradient {
    @apply bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white rounded-2xl shadow-hard;
  }

  .data-card {
    @apply card hover:scale-[1.02] transition-all duration-300;
  }

  /* Boutons */
  .btn-primary {
    @apply bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white font-semibold py-3 px-6 rounded-xl 
           hover:from-[#e46f00] hover:to-[#FF8C00] hover:shadow-lg 
           active:scale-95 transition-all duration-300 
           disabled:opacity-50 disabled:cursor-not-allowed 
           focus:outline-none focus:ring-4 focus:ring-orange-300 focus:ring-opacity-50;
  }

  .btn-secondary {
    @apply bg-gradient-to-r from-[#0077B6] to-[#2E8B57] text-white font-semibold py-3 px-6 rounded-xl 
           hover:from-[#005B8C] hover:to-[#1B5E20] hover:shadow-lg 
           active:scale-95 transition-all duration-300 
           disabled:opacity-50 disabled:cursor-not-allowed 
           focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50;
  }

  .btn-outline {
    @apply border-2 border-[#F77F00] text-[#F77F00] font-semibold py-3 px-6 rounded-xl 
           hover:bg-[#F77F00] hover:text-white 
           active:scale-95 transition-all duration-300 
           disabled:opacity-50 disabled:cursor-not-allowed 
           focus:outline-none focus:ring-4 focus:ring-orange-300 focus:ring-opacity-50;
  }

  /* Formulaires */
  .input-field {
    @apply w-full px-4 py-3 bg-white border border-gray-300 rounded-xl 
           focus:outline-none focus:border-[#F77F00] focus:ring-4 focus:ring-orange-100 
           placeholder-gray-400 transition-all duration-300 
           disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .form-label {
    @apply block text-sm font-semibold text-gray-700 mb-2;
  }

  .search-form {
    @apply flex gap-2 p-2 bg-white rounded-xl shadow-soft;
  }

  .search-input {
    @apply flex-1 px-4 py-2 bg-transparent border-none focus:outline-none focus:ring-0;
  }

  /* Badges */
  .badge {
    @apply inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold;
  }

  .badge-orange {
    @apply bg-orange-100 text-[#F77F00];
  }

  .badge-blue {
    @apply bg-blue-100 text-[#0077B6];
  }

  .badge-green {
    @apply bg-green-100 text-[#2E8B57];
  }

  .status-indicator {
    @apply w-3 h-3 rounded-full;
  }

  .status-active {
    @apply bg-green-500 animate-pulse;
  }

  .status-inactive {
    @apply bg-gray-400;
  }

  .status-pending {
    @apply bg-yellow-500;
  }

  .status-error {
    @apply bg-red-500;
  }

  /* Alertes */
  .alert {
    @apply px-4 py-3 rounded-2xl border flex items-center gap-3;
  }

  .alert-success {
    @apply bg-green-50 border-green-200 text-green-800;
  }

  .alert-warning {
    @apply bg-orange-50 border-orange-200 text-orange-800;
  }

  .alert-error {
    @apply bg-red-50 border-red-200 text-red-800;
  }

  .alert-info {
    @apply bg-blue-50 border-blue-200 text-blue-800;
  }

  /* Tables */
  .table-container {
    @apply overflow-x-auto rounded-2xl border border-gray-200;
  }

  .table {
    @apply min-w-full divide-y divide-gray-200;
  }

  .table th {
    @apply px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50;
  }

  .table td {
    @apply px-6 py-4 whitespace-nowrap text-sm text-gray-800;
  }

  /* Navigation */
  .navbar-gradient {
    @apply bg-gradient-to-r from-[#F77F00] to-[#FF9E40];
  }

  .tab-container {
    @apply flex border-b border-gray-200;
  }

  .tab {
    @apply px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#F77F00] border-b-2 border-transparent hover:border-[#F77F00] transition-all duration-300;
  }

  .tab-active {
    @apply text-[#F77F00] border-b-2 border-[#F77F00];
  }

  /* Pagination */
  .pagination {
    @apply flex items-center gap-2;
  }

  .pagination-item {
    @apply w-10 h-10 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-300;
  }

  .pagination-active {
    @apply bg-[#F77F00] text-white hover:bg-[#e46f00];
  }

  /* Modals */
  .modal-overlay {
    @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
  }

  .modal-content {
    @apply bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-auto border border-gray-200;
  }

  /* Utilitaires */
  .glass {
    @apply bg-white/80 backdrop-blur-lg border border-white/20;
  }

  .skeleton {
    @apply animate-pulse bg-gray-200 rounded;
  }

  .gradient-text {
    @apply bg-gradient-to-r from-[#F77F00] to-[#0077B6] bg-clip-text text-transparent;
  }

  .app-theme-gradient {
    background: linear-gradient(135deg, #F77F00 0%, #FF9E40 50%, #0077B6 100%);
  }

  .notification-badge {
    @apply absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center;
  }

  .page-loader {
    @apply fixed inset-0 flex items-center justify-center bg-white z-50;
  }

  .section-container {
    @apply container mx-auto px-4 sm:px-6 lg:px-8;
  }

  .divider {
    @apply border-t border-gray-200 my-6;
  }

  .divider-gradient {
    @apply h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-8;
  }
}

/* ============================================
   UTILITAIRES PERSONNALISÉS
   ============================================ */
@layer utilities {
  /* Animations delays */
  .animation-delay-200 { animation-delay: 200ms; }
  .animation-delay-500 { animation-delay: 500ms; }
  .animation-delay-700 { animation-delay: 700ms; }
  .delay-100 { animation-delay: 100ms; }
  .delay-200 { animation-delay: 200ms; }
  .delay-300 { animation-delay: 300ms; }
  .delay-400 { animation-delay: 400ms; }
  .delay-500 { animation-delay: 500ms; }
  .delay-600 { animation-delay: 600ms; }
  .delay-700 { animation-delay: 700ms; }
  .delay-800 { animation-delay: 800ms; }
  .delay-900 { animation-delay: 900ms; }
  .delay-1000 { animation-delay: 1000ms; }

  /* Ombres */
  .shadow-soft {
    box-shadow: 0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04);
  }

  .shadow-medium {
    box-shadow: 0 4px 20px -3px rgba(0, 0, 0, 0.1), 0 12px 25px -2px rgba(0, 0, 0, 0.06);
  }

  .shadow-hard {
    box-shadow: 0 10px 40px -5px rgba(0, 0, 0, 0.15), 0 20px 50px -2px rgba(0, 0, 0, 0.08);
  }

  /* ✅ LINE-CLAMP - Version compatible avec tous les navigateurs */
  .line-clamp-1 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    line-clamp: 1; /* Version standard */
  }

  .text-ellipsis-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2; /* Version standard */
  }

  .text-ellipsis-3 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    line-clamp: 3; /* Version standard */
  }

  /* Aspect ratios */
  .aspect-video { aspect-ratio: 16 / 9; }
  .aspect-square { aspect-ratio: 1 / 1; }

  /* Flex utilities */
  .flex-center { @apply flex items-center justify-center; }
  .flex-between { @apply flex items-center justify-between; }
  .flex-start { @apply flex items-center justify-start; }
  .flex-end { @apply flex items-center justify-end; }

  /* Hide scrollbar */
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar { display: none; }

  /* Spinners */
  .spinner {
    @apply w-8 h-8 border-4 border-[#F77F00] border-t-transparent rounded-full animate-spin;
  }

  .spinner-small {
    @apply w-4 h-4 border-2 border-[#F77F00] border-t-transparent rounded-full animate-spin;
  }

  /* Accessibilité */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
}

/* ============================================
   ANIMATIONS
   ============================================ */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slide-left {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slide-right {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(247, 127, 0, 0.3); }
  50% { box-shadow: 0 0 40px rgba(247, 127, 0, 0.6); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Classes d'animation */
.animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
.animate-slide-up { animation: slide-up 0.6s ease-out forwards; }
.animate-slide-left { animation: slide-left 0.6s ease-out forwards; }
.animate-slide-right { animation: slide-right 0.6s ease-out forwards; }
.animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
.animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
.animate-float { animation: float 3s ease-in-out infinite; }

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 640px) {
  .mobile-hidden { display: none !important; }
  .mobile-stack { flex-direction: column !important; }
  .mobile-full-width { width: 100% !important; }
  .mobile-text-center { text-align: center !important; }
  .mobile-padding { padding: 1rem !important; }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .tablet-hidden { display: none !important; }
}

@media (max-width: 360px) {
  .xs-text-smaller { font-size: 0.75rem !important; }
  .xs-padding-smaller { padding: 0.5rem !important; }
}

// ----- src\main.tsx -----
import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
// import App from "./App"; // CONSOLIDÉ
// import { AuthProvider } from "./providers/AuthProvider"; // CONSOLIDÉ
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />
    </AuthProvider>
  </React.StrictMode>
);

// ----- src\vite-env.d.ts -----
  export default classes;
  export default src;
  export default src;
  export default src;
  export default src;
  export default src;
  export default value;
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_NODE_ENV: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_BACKEND_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Déclaration pour les modules CSS (si vous en utilisez)
declare module '*.css' {
  const classes: { readonly [key: string]: string };
}

// Déclaration pour les images
declare module '*.png' {
  const src: string;
}

declare module '*.jpg' {
  const src: string;
}

declare module '*.jpeg' {
  const src: string;
}

declare module '*.svg' {
  const src: string;
}

declare module '*.gif' {
  const src: string;
}

// Déclaration pour les fichiers JSON
declare module '*.json' {
  const value: any;
}

// ========== POINTS D'ENTRÉE ==========

// ----- src/App.tsx -----
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
// import { useAuth }      from "./hooks/useAuth"; // CONSOLIDÉ
// import { AuthProvider } from "./providers/AuthProvider"; // CONSOLIDÉ
// import Navbar           from "./components/Navbar"; // CONSOLIDÉ
// import Login            from "./pages/Login"; // CONSOLIDÉ
// import Accueil          from "./pages/Accueil"; // CONSOLIDÉ
// import TableauDeBord    from "./pages/TableauDeBord"; // CONSOLIDÉ
// import Recherche        from "./pages/Recherche"; // CONSOLIDÉ
// import Journal          from "./pages/Journal"; // CONSOLIDÉ
// import Profil           from "./pages/Profil"; // CONSOLIDÉ
// import Comptes          from "./pages/administration/Comptes"; // CONSOLIDÉ
// import MisesAjour       from "./pages/administration/MisesAjour"; // CONSOLIDÉ
export default App;
// src/App.tsx

// Pages

// ============================================================
// ROUTE PROTÉGÉE
// ============================================================
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && allowedRoles.length > 0) {
    const hasAccess = allowedRoles.includes(user?.role || '');
    if (!hasAccess) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl text-center max-w-md border border-orange-100">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Accès refusé</h2>
            <p className="text-gray-600 mb-4">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4">
              <p className="text-sm text-gray-700">
                <span className="font-medium text-[#F77F00]">Rôle actuel :</span> {user?.role}
              </p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-gradient-to-r from-[#F77F00] to-[#FF9E40] text-white rounded-xl hover:from-[#e46f00] hover:to-[#FF8C00] transition-all duration-300 font-medium shadow-lg"
            >
              Retour
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

// ============================================================
// CONTENU PRINCIPAL
// ============================================================
const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const hideNavbar = location.pathname === '/login';

  return (
    <>
      {isAuthenticated && !hideNavbar && <Navbar />}

      <Routes>
        {/* ── Publique ── */}
        <Route path="/login" element={<Login />} />
        <Route path="/"      element={<Navigate to="/login" replace />} />

        {/* ── Tous les connectés ── */}
        <Route path="/accueil" element={
          <ProtectedRoute><Accueil /></ProtectedRoute>
        } />

        <Route path="/profil" element={
          <ProtectedRoute><Profil /></ProtectedRoute>
        } />

        <Route path="/recherche" element={
          <ProtectedRoute><Recherche /></ProtectedRoute>
        } />

        {/* ── Administrateur + Gestionnaire ── */}
        <Route path="/tableau-de-bord" element={
          <ProtectedRoute allowedRoles={['Administrateur', 'Gestionnaire']}>
            <TableauDeBord />
          </ProtectedRoute>
        } />

        {/* ── Administrateur uniquement ── */}
        <Route path="/journal" element={
          <ProtectedRoute allowedRoles={['Administrateur']}>
            <Journal />
          </ProtectedRoute>
        } />

        {/* ── Administration : Comptes ── */}
        <Route path="/administration/comptes" element={
          <ProtectedRoute allowedRoles={['Administrateur']}>
            <Comptes />
          </ProtectedRoute>
        } />

        {/* ── Administration : Mises à jour ── */}
        <Route path="/administration/mises-a-jour" element={
          <ProtectedRoute allowedRoles={['Administrateur']}>
            <MisesAjour />
          </ProtectedRoute>
        } />

        {/* ── Redirection /administration → premier sous-menu accessible ── */}
        <Route path="/administration" element={
          <ProtectedRoute allowedRoles={['Administrateur']}>
            <Navigate to="/administration/comptes" replace />
          </ProtectedRoute>
        } />

        {/* ── Anciennes routes → redirect pour compatibilité ── */}
        <Route path="/home"            element={<Navigate to="/accueil"                  replace />} />
        <Route path="/inventaire"      element={<Navigate to="/recherche"                replace />} />
        <Route path="/dashboard"       element={<Navigate to="/tableau-de-bord"          replace />} />
        <Route path="/gestion-comptes" element={<Navigate to="/administration/comptes"   replace />} />

        {/* ── 404 ── */}
        <Route path="*" element={
          isAuthenticated
            ? <Navigate to="/accueil" replace />
            : <Navigate to="/login"   replace />
        } />
      </Routes>
    </>
  );
};

// ============================================================
// APP
// ============================================================
const App: React.FC = () => (
  <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </Router>
);


// ----- src/main.tsx -----
import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
// import App from "./App"; // CONSOLIDÉ
// import { AuthProvider } from "./providers/AuthProvider"; // CONSOLIDÉ
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />
    </AuthProvider>
  </React.StrictMode>
);
