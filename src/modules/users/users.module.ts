import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { FollowersService } from './followers.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, FollowersService],
})
export class UsersModule {}
