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
import { Tag } from '@prisma/client';
import { JWTPayload, UserPayload } from 'src/shared/user-payload.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { SavePostBodyDto } from './dto/save-post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(AuthGuard)
  @Post()
  createBlankPost(@UserPayload() payload: JWTPayload) {
    return this.postsService.save({
      id: undefined,
      heading: 'Top 10 reasons to study in AUK.',
      content: 'Come up with smthing, idk.',
      subheading: 'And where to find them...',
      tags: [],
      authorId: +payload.sub,
    });
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  save(
    @Body() dto: SavePostBodyDto,
    @UserPayload() payload: JWTPayload,
    @Param('id') id: string,
  ) {
    return this.postsService.save({
      ...dto,
      id: +id,
      authorId: +payload.sub,
    });
  }

  @UseGuards(AuthGuard)
  @Get('my')
  myPosts(@UserPayload() payload: JWTPayload) {
    return this.postsService.myPosts(+payload.sub);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @UserPayload() { sub: userId }: JWTPayload) {
    return this.postsService.findOne(+userId, +id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id/publish')
  publish(@Param('id') id: string, @UserPayload() { sub: userId }: JWTPayload) {
    return this.postsService.publish(+userId, +id);
  }

  @UseGuards(AuthGuard)
  @Post(':id/tags')
  addTags(
    @Param('id') id: string,
    @Body('tags') tags: Tag[],
    @UserPayload() { sub: userId }: JWTPayload,
  ) {
    return this.postsService.setTags(+id, tags, +userId);
  }
}
