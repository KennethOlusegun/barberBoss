import { Role } from '../enums';

/**
 * User Interface
 *
 * Represents a user in the system (admin, barber, or client)
 */
export interface IUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * User Create DTO
 *
 * Data Transfer Object for creating a new user
 */
export interface IUserCreate {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: Role;
}

/**
 * User Update DTO
 *
 * Data Transfer Object for updating user information
 */
export interface IUserUpdate {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
}

/**
 * User Login DTO
 *
 * Data Transfer Object for user authentication
 */
export interface IUserLogin {
  email: string;
  password: string;
}

/**
 * User Login Response
 *
 * Response after successful authentication
 */
export interface IUserLoginResponse {
  user: IUser;
  accessToken: string;
  refreshToken?: string;
}
