import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

/**
 * Decorator para definir quais roles podem acessar uma rota
 * @param roles - Lista de roles permitidas (ADMIN, BARBER, CLIENT)
 * @example
 * @Roles(Role.ADMIN, Role.BARBER)
 * @Get('protected-route')
 * async protectedRoute() {}
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
