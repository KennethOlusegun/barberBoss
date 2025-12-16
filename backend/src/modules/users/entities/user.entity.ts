import { Role } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class User {
  id: string;
  name: string;
  email: string;

  @Exclude()
  password: string;

  phone: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
