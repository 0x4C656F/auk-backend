import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Post, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { SavePostDto } from './dto/save-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  save(dto: SavePostDto): Promise<Post> {
    if (dto.id) {
      // id is present, update the post
      const { authorId, id } = dto;
      return this.prisma.post.update({
        where: { id, authorId },
        data: dto,
      });
    } else {
      // id is not present, create a new post
      return this.prisma.post.create({ data: dto });
    }
  }

  findAll(): Promise<Post[]> {
    return this.prisma.post.findMany({
      include: { author: true },
      where: { published: true },
    });
  }

  findOne(id: number): Promise<Post> {
    return this.prisma.post.findUnique({ where: { id } });
  }

  myPosts(userId: number): Promise<Post[]> {
    return this.prisma.post.findMany({
      where: { authorId: userId },
    });
  }

  async update(
    userId: number,
    postId: number,
    updatePostDto: Prisma.PostUpdateInput,
  ): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this post',
      );
    }

    return this.prisma.post.update({
      where: { id: postId },
      data: updatePostDto,
    });
  }
  remove(id: number): Promise<Post> {
    return this.prisma.post.delete({ where: { id } });
  }

  publish(id: number) {
    return this.prisma.post.update({
      where: { id },
      data: { published: true },
    });
  }
}
