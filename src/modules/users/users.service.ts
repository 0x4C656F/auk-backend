import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  create(createUserDto: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data: createUserDto });
  }

  findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
  async updateBio(userId: number, bio: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        bio,
      },
    });
  }
}
