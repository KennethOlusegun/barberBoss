import { Service as PrismaService, Prisma } from '@prisma/client';

export class Service implements PrismaService {
  id: string;
  name: string;
  description: string | null;
  price: Prisma.Decimal; // Prisma Decimal type
  durationMin: number;
  barberCommission: Prisma.Decimal | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
