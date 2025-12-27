// src/hooks/usePermission.ts
import { useAuth } from '../context/AuthContext';
import { Role } from '../types/enums';

/**
 * Permission Hook
 * 
 * React Native equivalent to Angular RoleGuard
 * Checks if user has required role(s) to access features
 */

interface UsePermissionReturn {
  hasRole: (roles: Role | Role[]) => boolean;
  isAdmin: boolean;
  isBarber: boolean;
  isClient: boolean;
  canAccessAdminFeatures: boolean;
  canAccessBarberFeatures: boolean;
  canManageAppointments: boolean;
  canManageServices: boolean;
  canManageUsers: boolean;
}

export const usePermission = (): UsePermissionReturn => {
  const { user } = useAuth();

  /**
   * Check if user has one of the required roles
   */
  const hasRole = (roles: Role | Role[]): boolean => {
    if (!user) return false;

    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    return requiredRoles.includes(user.role as Role);
  };

  /**
   * Check if user is admin
   */
  const isAdmin = user?.role === Role.ADMIN;

  /**
   * Check if user is barber
   */
  const isBarber = user?.role === Role.BARBER;

  /**
   * Check if user is client
   */
  const isClient = user?.role === Role.CLIENT;

  /**
   * Check if user can access admin features
   */
  const canAccessAdminFeatures = isAdmin;

  /**
   * Check if user can access barber features
   */
  const canAccessBarberFeatures = isAdmin || isBarber;

  /**
   * Check if user can manage appointments
   * Admins and Barbers can manage all appointments
   * Clients can only view their own
   */
  const canManageAppointments = isAdmin || isBarber;

  /**
   * Check if user can manage services
   * Only admins and barbers can manage services
   */
  const canManageServices = isAdmin || isBarber;

  /**
   * Check if user can manage users
   * Only admins can manage users
   */
  const canManageUsers = isAdmin;

  return {
    hasRole,
    isAdmin,
    isBarber,
    isClient,
    canAccessAdminFeatures,
    canAccessBarberFeatures,
    canManageAppointments,
    canManageServices,
    canManageUsers,
  };
};

/**
 * Example usage in component:
 * 
 * const { hasRole, canManageServices } = usePermission();
 * 
 * if (hasRole([Role.ADMIN, Role.BARBER])) {
 *   // Show admin/barber content
 * }
 * 
 * if (canManageServices) {
 *   // Show service management buttons
 * }
 */