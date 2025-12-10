/**
 * Service Interface
 *
 * Represents a service offered by the barbershop
 */
export interface IService {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationMin: number;
  active: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Service Create DTO
 *
 * Data Transfer Object for creating a new service
 */
export interface IServiceCreate {
  name: string;
  description?: string;
  price: number;
  durationMin: number;
  active?: boolean;
}

/**
 * Service Update DTO
 *
 * Data Transfer Object for updating service information
 */
export interface IServiceUpdate {
  name?: string;
  description?: string;
  price?: number;
  durationMin?: number;
  active?: boolean;
}

/**
 * Service List Query Parameters
 *
 * Query parameters for filtering services
 */
export interface IServiceQuery {
  active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}
