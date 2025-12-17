import { Role } from '../enums';

/**
 * User Model
 *
 * Client-side model for user data
 */
export class User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: any) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.role = data.role as Role;
    this.createdAt =
      data.createdAt instanceof Date
        ? data.createdAt
        : new Date(data.createdAt);
    this.updatedAt =
      data.updatedAt instanceof Date
        ? data.updatedAt
        : new Date(data.updatedAt);
  }

  /**
   * Check if user is an admin
   */
  isAdmin(): boolean {
    return this.role === Role.ADMIN;
  }

  /**
   * Check if user is a barber
   */
  isBarber(): boolean {
    return this.role === Role.BARBER;
  }

  /**
   * Check if user is a client
   */
  isClient(): boolean {
    return this.role === Role.CLIENT;
  }

  /**
   * Get user full name
   */
  getFullName(): string {
    return this.name;
  }

  /**
   * Get user initials
   */
  getInitials(): string {
    return this.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
