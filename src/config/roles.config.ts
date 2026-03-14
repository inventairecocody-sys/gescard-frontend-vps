// src/config/roles.config.ts

export type UserRole = 'Administrateur' | 'Gestionnaire' | "Chef d'équipe" | 'Opérateur';

export interface Permission {
  page: string;
  actions: ('view' | 'create' | 'edit' | 'delete' | 'import' | 'export' | 'annuler')[];
  filter?: 'all' | 'coordination';
  fields?: string[];
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
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
    { page: 'tableau-de-bord', actions: ['view'], filter: 'coordination' },
    { page: 'recherche',       actions: ['view', 'edit'], fields: ['delivrance', 'CONTACT DE RETRAIT', 'DATE DE DELIVRANCE'] },
    { page: 'profil',          actions: ['view', 'edit'] },
  ],
  Opérateur: [
    { page: 'accueil',         actions: ['view'] },
    { page: 'recherche',       actions: ['view'] },
    { page: 'profil',          actions: ['view', 'edit'] },
  ],
};

export const PAGES = {
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