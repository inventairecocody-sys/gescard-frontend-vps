export type UserRole = 'Administrateur' | 'Gestionnaire' | "Chef d'équipe" | 'Opérateur'

export interface Permission {
  page: string
  actions: ('view' | 'create' | 'edit' | 'delete' | 'import' | 'export' | 'annuler')[]
  filter?: 'all' | 'coordination'
  fields?: string[] // Champs modifiables
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  Administrateur: [
    { page: 'dashboard', actions: ['view'] },
    { page: 'statistiques', actions: ['view'], filter: 'all' },
    { page: 'inventaire', actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'import-export', actions: ['import', 'export'] },
    { page: 'journal', actions: ['view', 'annuler'] },
    { page: 'gestion-comptes', actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'profil', actions: ['view', 'edit'] }
  ],
  Gestionnaire: [
    { page: 'dashboard', actions: ['view'] },
    { page: 'statistiques', actions: ['view'], filter: 'coordination' },
    { page: 'inventaire', actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'import-export', actions: ['import', 'export'] },
    { page: 'profil', actions: ['view', 'edit'] }
  ],
  "Chef d'équipe": [
    { page: 'inventaire', actions: ['view', 'edit'], fields: ['delivrance', 'CONTACT DE RETRAIT', 'DATE DE DELIVRANCE'] },
    { page: 'profil', actions: ['view', 'edit'] }
  ],
  Opérateur: [
    { page: 'inventaire', actions: ['view'] },
    { page: 'profil', actions: ['view', 'edit'] }
  ]
}

export const PAGES = {
  dashboard: '/dashboard',
  inventaire: '/inventaire',
  statistiques: '/statistiques',
  importExport: '/import-export',
  journal: '/journal',
  gestionComptes: '/gestion-comptes',
  profil: '/profil'
} as const