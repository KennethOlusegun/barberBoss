export interface UserPayload {
  id: string;
  email: string;
  role: string; // ou use 'Role' se estiver usando enum do Prisma
  iat?: number; // emitido em
  exp?: number; // expira em
}
