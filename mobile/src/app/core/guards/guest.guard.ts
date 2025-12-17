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
 * Guest Guard
 *
 * Protects routes that should only be accessible to non-authenticated users.
 * Redirects to home page if user is already authenticated.
 * Useful for login and register pages.
 *
 * @example
 * // In route configuration
 * {
 *   path: 'login',
 *   component: LoginPage,
 *   canActivate: [GuestGuard]
 * }
 */
@Injectable({
  providedIn: 'root',
})
export class GuestGuard implements CanActivate {
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
        if (isAuthenticated) {
          // User is already authenticated, redirect to home
          this.router.navigate(['/tabs/tab1']);
          return false;
        }
        return true;
      }),
    );
  }
}
