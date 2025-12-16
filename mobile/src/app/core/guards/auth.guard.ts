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

/**
 * Authentication Guard
 *
 * Protects routes that require authentication.
 * Redirects to login page if user is not authenticated.
 *
 * @example
 * // In route configuration
 * {
 *   path: 'profile',
 *   component: ProfilePage,
 *   canActivate: [AuthGuard]
 * }
 */
@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map((isAuthenticated) => {
        if (!isAuthenticated) {
          // Store attempted URL for redirecting after login
          const returnUrl = state.url;
          this.router.navigate(['/auth/login'], {
            queryParams: { returnUrl },
          });
          return false;
        }
        return true;
      }),
    );
  }
}
