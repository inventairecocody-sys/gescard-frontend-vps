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