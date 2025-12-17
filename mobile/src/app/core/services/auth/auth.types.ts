/**
 * Authentication Types and Interfaces
 *
 * Defines all types and interfaces used by the authentication service.
 */

/**
 * User roles in the system
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  BARBER = 'BARBER',
  CLIENT = 'CLIENT',
}

/**
 * User interface representing the authenticated user
 */
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data
 */
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
}

/**
 * Authentication response from the API
 */
export interface AuthResponse {
  access_token: string;
  user: User;
  refresh_token?: string;
}

/**
 * Token payload decoded from JWT
 */
export interface TokenPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
  iat?: number; // issued at
  exp?: number; // expiration
}

/**
 * Authentication state
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
}

/**
 * Password change data
 */
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

/**
 * Password reset request
 */
export interface ResetPasswordRequest {
  email: string;
}

/**
 * Password reset confirmation
 */
export interface ResetPasswordConfirm {
  token: string;
  newPassword: string;
}
