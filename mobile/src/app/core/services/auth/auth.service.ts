import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { map, tap, catchError, switchMap } from 'rxjs/operators';
import { ApiService } from '../api/api.service';
import { ConfigService } from '../config.service';
import {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  AuthState,
  TokenPayload,
  UserRole,
  ChangePasswordData,
  ResetPasswordRequest,
  ResetPasswordConfirm,
} from './auth.types';
import { AUTH_ENDPOINTS, AUTH_STORAGE_KEYS, AUTH_CONFIG } from './auth.config';

/**
 * Authentication Service
 *
 * Manages user authentication, token storage, and authentication state.
 *
 * Features:
 * - Login/Register/Logout
 * - Token management (storage, retrieval, validation)
 * - Auto token refresh
 * - Authentication state management
 * - User profile management
 * - Password management
 *
 * @example
 * constructor(private authService: AuthService) {}
 *
 * // Login
 * this.authService.login({ email, password }).subscribe(
 *   user => console.log('Logged in:', user),
 *   error => console.error('Login failed:', error)
 * );
 *
 * // Check authentication
 * this.authService.isAuthenticated$.subscribe(
 *   isAuth => console.log('Is authenticated:', isAuth)
 * );
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
  });

  /**
   * Observable authentication state
   */
  public authState$ = this.authStateSubject.asObservable();

  /**
   * Observable authenticated user
   */
  public user$ = this.authState$.pipe(map((state) => state.user));

  /**
   * Observable authentication status
   */
  public isAuthenticated$ = this.authState$.pipe(
    map((state) => state.isAuthenticated),
  );

  /**
   * Observable loading state
   */
  public loading$ = this.authState$.pipe(map((state) => state.loading));

  constructor(
    private apiService: ApiService,
    private configService: ConfigService,
  ) {
    this.initializeAuthState();
  }

  // ==================== Initialization ====================

  /**
   * Initialize authentication state from stored data
   */
  private initializeAuthState(): void {
    const token = this.getStoredToken();
    const user = this.getStoredUser();

    if (token && user && this.isTokenValid(token)) {
      this.updateAuthState({
        isAuthenticated: true,
        user,
        token,
        loading: false,
      });
    } else {
      this.clearAuthState();
    }
  }

  // ==================== Authentication Methods ====================

  /**
   * Login user with credentials
   * @param credentials User login credentials
   * @returns Observable of logged in user
   */
  login(credentials: LoginCredentials): Observable<User> {
    this.updateLoadingState(true);

    return this.apiService
      .post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, credentials)
      .pipe(
        tap((response) => this.handleAuthResponse(response)),
        map((response) => response.user),
        catchError((error) => {
          this.updateLoadingState(false);
          return throwError(() => error);
        }),
      );
  }

  /**
   * Register new user
   * @param data User registration data
   * @returns Observable of registered user
   */
  register(data: RegisterData): Observable<User> {
    this.updateLoadingState(true);

    return this.apiService
      .post<AuthResponse>(AUTH_ENDPOINTS.REGISTER, data)
      .pipe(
        tap((response) => this.handleAuthResponse(response)),
        map((response) => response.user),
        catchError((error) => {
          this.updateLoadingState(false);
          return throwError(() => error);
        }),
      );
  }

  /**
   * Logout current user
   * @returns Observable of logout result
   */
  logout(): Observable<void> {
    const token = this.getStoredToken();

    // Clear local state immediately
    this.clearAuthState();

    // Attempt to notify backend (optional, don't wait for response)
    if (token) {
      this.apiService
        .post(AUTH_ENDPOINTS.LOGOUT, {}, { requiresAuth: true })
        .subscribe({
          next: () => console.log('Logout notification sent to backend'),
          error: () => console.warn('Failed to notify backend of logout'),
        });
    }

    return of(undefined);
  }

  /**
   * Refresh authentication token
   * @returns Observable of refreshed token
   */
  refreshToken(): Observable<string> {
    const refreshToken = this.getStoredRefreshToken();

    if (!refreshToken) {
      this.clearAuthState();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.apiService
      .post<AuthResponse>(AUTH_ENDPOINTS.REFRESH, {
        refresh_token: refreshToken,
      })
      .pipe(
        tap((response) => this.handleAuthResponse(response)),
        map((response) => response.access_token),
        catchError((error) => {
          this.clearAuthState();
          return throwError(() => error);
        }),
      );
  }

  // ==================== User Profile ====================

  /**
   * Get current authenticated user profile
   * @returns Observable of user profile
   */
  getCurrentUser(): Observable<User> {
    return this.apiService
      .get<User>(AUTH_ENDPOINTS.ME, { requiresAuth: true })
      .pipe(
        tap((user) => {
          this.updateAuthState({
            ...this.authStateSubject.value,
            user,
          });
          this.storeUser(user);
        }),
      );
  }

  /**
   * Update user profile
   * @param data Updated user data
   * @returns Observable of updated user
   */
  updateProfile(data: Partial<User>): Observable<User> {
    return this.apiService
      .put<User>('/users/profile', data, { requiresAuth: true })
      .pipe(
        tap((user) => {
          this.updateAuthState({
            ...this.authStateSubject.value,
            user,
          });
          this.storeUser(user);
        }),
      );
  }

  // ==================== Password Management ====================

  /**
   * Change user password
   * @param data Password change data
   * @returns Observable of change result
   */
  changePassword(data: ChangePasswordData): Observable<void> {
    return this.apiService
      .post<void>(AUTH_ENDPOINTS.CHANGE_PASSWORD, data, { requiresAuth: true })
      .pipe(
        tap(() => console.log('Password changed successfully')),
        catchError((error) => throwError(() => error)),
      );
  }

  /**
   * Request password reset
   * @param data Reset request data
   * @returns Observable of request result
   */
  requestPasswordReset(data: ResetPasswordRequest): Observable<void> {
    return this.apiService.post<void>(AUTH_ENDPOINTS.RESET_PASSWORD, data).pipe(
      tap(() => console.log('Password reset requested')),
      catchError((error) => throwError(() => error)),
    );
  }

  /**
   * Confirm password reset with token
   * @param data Reset confirmation data
   * @returns Observable of confirmation result
   */
  confirmPasswordReset(data: ResetPasswordConfirm): Observable<void> {
    return this.apiService
      .post<void>(AUTH_ENDPOINTS.RESET_PASSWORD_CONFIRM, data)
      .pipe(
        tap(() => console.log('Password reset confirmed')),
        catchError((error) => throwError(() => error)),
      );
  }

  // ==================== Token Management ====================

  /**
   * Get current authentication token
   * @returns Token string or null
   */
  getToken(): string | null {
    return this.authStateSubject.value.token || this.getStoredToken();
  }

  /**
   * Check if user is authenticated
   * @returns True if authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && this.isTokenValid(token);
  }

  /**
   * Check if token is valid (not expired)
   * @param token JWT token
   * @returns True if token is valid
   */
  private isTokenValid(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload.exp) {
        return true; // No expiration, consider valid
      }

      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  /**
   * Decode JWT token
   * @param token JWT token string
   * @returns Decoded token payload
   */
  private decodeToken(token: string): TokenPayload {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const payload = parts[1];
      const decoded = atob(payload);
      return JSON.parse(decoded) as TokenPayload;
    } catch (error) {
      throw new Error('Failed to decode token');
    }
  }

  /**
   * Check if token needs refresh
   * @returns True if token should be refreshed
   */
  shouldRefreshToken(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      const payload = this.decodeToken(token);
      if (!payload.exp) {
        return false;
      }

      const now = Math.floor(Date.now() / 1000);
      const threshold = AUTH_CONFIG.TOKEN_REFRESH_THRESHOLD;
      return payload.exp - now < threshold;
    } catch {
      return false;
    }
  }

  // ==================== Role & Permission Checks ====================

  /**
   * Check if current user has specific role
   * @param role Role to check
   * @returns True if user has the role
   */
  hasRole(role: UserRole): boolean {
    const user = this.authStateSubject.value.user;
    return user?.role === role;
  }

  /**
   * Check if current user has any of the specified roles
   * @param roles Roles to check
   * @returns True if user has any of the roles
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.authStateSubject.value.user;
    return !!user && roles.includes(user.role);
  }

  /**
   * Get current user's role
   * @returns User role or null
   */
  getUserRole(): UserRole | null {
    return this.authStateSubject.value.user?.role || null;
  }

  // ==================== State Management ====================

  /**
   * Handle authentication response from API
   * @param response Authentication response
   */
  private handleAuthResponse(response: AuthResponse): void {
    this.storeToken(response.access_token);
    if (response.refresh_token) {
      this.storeRefreshToken(response.refresh_token);
    }
    this.storeUser(response.user);

    this.updateAuthState({
      isAuthenticated: true,
      user: response.user,
      token: response.access_token,
      loading: false,
    });
  }

  /**
   * Update authentication state
   * @param state New authentication state
   */
  private updateAuthState(state: AuthState): void {
    this.authStateSubject.next(state);
  }

  /**
   * Update loading state
   * @param loading Loading state
   */
  private updateLoadingState(loading: boolean): void {
    this.updateAuthState({
      ...this.authStateSubject.value,
      loading,
    });
  }

  /**
   * Clear authentication state
   */
  private clearAuthState(): void {
    this.clearStoredToken();
    this.clearStoredRefreshToken();
    this.clearStoredUser();

    this.updateAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
    });
  }

  // ==================== Storage Methods ====================

  /**
   * Store token in local storage
   * @param token JWT token
   */
  private storeToken(token: string): void {
    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
  }

  /**
   * Get stored token from local storage
   * @returns Token or null
   */
  private getStoredToken(): string | null {
    return localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
  }

  /**
   * Clear stored token
   */
  private clearStoredToken(): void {
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
  }

  /**
   * Store refresh token in local storage
   * @param token Refresh token
   */
  private storeRefreshToken(token: string): void {
    localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  /**
   * Get stored refresh token
   * @returns Refresh token or null
   */
  private getStoredRefreshToken(): string | null {
    return localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Clear stored refresh token
   */
  private clearStoredRefreshToken(): void {
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Store user in local storage
   * @param user User object
   */
  private storeUser(user: User): void {
    localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
  }

  /**
   * Get stored user from local storage
   * @returns User or null
   */
  private getStoredUser(): User | null {
    const userJson = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
    if (!userJson) {
      return null;
    }

    try {
      return JSON.parse(userJson) as User;
    } catch {
      return null;
    }
  }

  /**
   * Clear stored user
   */
  private clearStoredUser(): void {
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
  }
}
