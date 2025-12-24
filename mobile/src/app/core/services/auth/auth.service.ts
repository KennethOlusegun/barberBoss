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

  public authState$ = this.authStateSubject.asObservable();
  public user$ = this.authState$.pipe(map((state) => state.user));
  public isAuthenticated$ = this.authState$.pipe(
    map((state) => state.isAuthenticated),
  );
  public loading$ = this.authState$.pipe(map((state) => state.loading));

  constructor(
    private apiService: ApiService,
    private configService: ConfigService,
  ) {
    this.initializeAuthState();
  }

  // ==================== Initialization ====================

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

  login(credentials: LoginCredentials): Observable<User> {
    this.updateLoadingState(true);
    const url = AUTH_ENDPOINTS.LOGIN;
    console.log('🌐 AuthService.login() - URL:', url);
    console.log('📦 Payload:', { email: credentials.email, password: '***' });
    return this.apiService
      .post<AuthResponse>(url, credentials)
      .pipe(
        tap((response) => {
          console.log('✅ Resposta do login:', response);
          this.handleAuthResponse(response);
        }),
        map((response) => response.user),
        catchError((error) => {
          console.error('❌ Erro na requisição de login:', error);
          this.updateLoadingState(false);
          return throwError(() => error);
        }),
      );
  }

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

  logout(): Observable<void> {
    const token = this.getStoredToken();

    this.clearAuthState();

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

  getCurrentUser(): Observable<User> {
    console.log('🔍 AuthService.getCurrentUser() chamado');
    console.log('📍 URL:', AUTH_ENDPOINTS.ME);
    console.log('🔑 Token disponível?', !!this.getToken());
    return this.apiService
      .get<User>(AUTH_ENDPOINTS.ME, { requiresAuth: true })
      .pipe(
        tap((user) => {
          console.log('✅ getCurrentUser - Usuário recebido:', user);
          this.updateAuthState({
            ...this.authStateSubject.value,
            user,
          });
          this.storeUser(user);
        }),
        catchError((error) => {
          console.error('❌ getCurrentUser - Erro:', error);
          throw error;
        })
      );
  }

  // === NOVO MÉTODO ADICIONADO AQUI ===
  /**
   * Força a atualização dos dados do usuário (usado após edição de perfil)
   */
  refreshUser(): void {
    this.getCurrentUser().subscribe({
      next: (user) => console.log('Dados do usuário atualizados', user),
      error: (err) => console.error('Erro ao atualizar dados do usuário', err)
    });
  }
  // ===================================

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

  changePassword(data: ChangePasswordData): Observable<void> {
    return this.apiService
      .post<void>(AUTH_ENDPOINTS.CHANGE_PASSWORD, data, { requiresAuth: true })
      .pipe(
        tap(() => console.log('Password changed successfully')),
        catchError((error) => throwError(() => error)),
      );
  }

  requestPasswordReset(data: ResetPasswordRequest): Observable<void> {
    return this.apiService.post<void>(AUTH_ENDPOINTS.RESET_PASSWORD, data).pipe(
      tap(() => console.log('Password reset requested')),
      catchError((error) => throwError(() => error)),
    );
  }

  confirmPasswordReset(data: ResetPasswordConfirm): Observable<void> {
    return this.apiService
      .post<void>(AUTH_ENDPOINTS.RESET_PASSWORD_CONFIRM, data)
      .pipe(
        tap(() => console.log('Password reset confirmed')),
        catchError((error) => throwError(() => error)),
      );
  }

  // ==================== Token Management ====================

  getToken(): string | null {
    return this.authStateSubject.value.token || this.getStoredToken();
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && this.isTokenValid(token);
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload.exp) {
        return true;
      }

      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch {
      return false;
    }
  }

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

  hasRole(role: UserRole): boolean {
    const user = this.authStateSubject.value.user;
    return user?.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.authStateSubject.value.user;
    return !!user && roles.includes(user.role);
  }

  getUserRole(): UserRole | null {
    return this.authStateSubject.value.user?.role || null;
  }

  // ==================== State Management ====================

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

  private updateAuthState(state: AuthState): void {
    this.authStateSubject.next(state);
  }

  private updateLoadingState(loading: boolean): void {
    this.updateAuthState({
      ...this.authStateSubject.value,
      loading,
    });
  }

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

  private storeToken(token: string): void {
    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
  }

  private clearStoredToken(): void {
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
  }

  private storeRefreshToken(token: string): void {
    localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  private getStoredRefreshToken(): string | null {
    return localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  }

  private clearStoredRefreshToken(): void {
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  }

  private storeUser(user: User): void {
    localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
  }

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

  private clearStoredUser(): void {
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
  }
}
