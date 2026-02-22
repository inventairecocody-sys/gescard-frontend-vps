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