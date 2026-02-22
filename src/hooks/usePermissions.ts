import { useAuth } from './useAuth';
import type { UserRole, Permission } from '../config/roles.config';
import { ROLE_PERMISSIONS } from '../config/roles.config';

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