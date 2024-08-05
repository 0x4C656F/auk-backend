import { Program, Role } from '@prisma/client';

export class SignUpDto {
  email: string;
  password: string;
  program: Program;
  role: Role;
}
