import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';
import { UserRole } from '../services/auth/auth.types';

/**
 * Role Guard
 *
 * Protects routes based on user roles.
 * Checks if authenticated user has required role(s).
 *
 * @example
 * // In route configuration
 * {
 *   path: 'admin',
 *   component: AdminPage,
 *   canActivate: [RoleGuard],
 *   data: { roles: [UserRole.ADMIN] }
 * }
 *
 * // Multiple roles allowed
 * {
 *   path: 'appointments',
 *   component: AppointmentsPage,
 *   canActivate: [RoleGuard],
 *   data: { roles: [UserRole.ADMIN, UserRole.BARBER] }
 * }
 */
@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> | Promise<boolean> | boolean {
    const requiredRoles = route.data['roles'] as UserRole[];

    if (!requiredRoles || requiredRoles.length === 0) {
      console.warn('RoleGuard: No roles specified in route data');
      return true;
    }

    return this.authService.user$.pipe(
      take(1),
      map((user) => {
        if (!user) {
          // User not authenticated, redirect to login
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: state.url },
          });
          return false;
        }

        const hasRole = requiredRoles.includes(user.role);

        if (!hasRole) {
          // User doesn't have required role, redirect to unauthorized page
          console.warn(
            `User role ${user.role} not in required roles: ${requiredRoles.join(', ')}`,
          );
          this.router.navigate(['/unauthorized']);
          return false;
        }

        return true;
      }),
    );
  }
}
