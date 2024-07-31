import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { JWTPayload, UserPayload } from 'src/shared/user-payload.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { FollowersService } from './followers.service';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly followersService: FollowersService,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async me(@UserPayload() payload: JWTPayload): Promise<User> {
    const user = await this.usersService.findOne(+payload.sub);
    return user;
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.findOne(+id);
    return user;
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Post('follow/:id')
  follow(@UserPayload() payload: JWTPayload, @Param('id') id: string) {
    return this.followersService.followUser(+id, +payload.sub);
  }

  @Post('unfollow/:id')
  unfollow(@UserPayload() payload: JWTPayload, @Param('id') id: string) {
    return this.followersService.unfollowUser(+id, +payload.sub);
  }

  @Get(':id/followers')
  followers(@Param('id') id: string) {
    return this.followersService.getFollowers(+id);
  }

  @UseGuards(AuthGuard)
  @Patch('bio')
  updateBio(@UserPayload() payload: JWTPayload, @Body() body: { bio: string }) {
    return this.usersService.updateBio(+payload.sub, body.bio);
  }
}
