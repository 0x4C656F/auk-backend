import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Post, Prisma, Tag } from '@prisma/client';
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

  async findOne(userId: number, id: number): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { author: true },
    });
    if (post.authorId !== userId && !post.published) {
      throw new ForbiddenException(
        'You do not have permission to view this post',
      );
    } else {
      return post;
    }
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

  publish(userId: number, id: number) {
    return this.prisma.post.update({
      where: { id, authorId: userId },
      data: { published: true },
    });
  }

  setTags(postId: number, tags: Tag[], userId: number) {
    return this.prisma.post.update({
      where: { id: postId, authorId: userId },
      data: {
        tags,
      },
    });
  }
}
