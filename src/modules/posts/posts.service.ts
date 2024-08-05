import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Post, Prisma, Role, Tag } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { PinPostDto } from './dto/pin-post.dto';
import { SavePostDto } from './dto/save-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  save(dto: SavePostDto): Promise<Post> {
    const { id, authorId, ...data } = dto;

    return this.prisma.post.upsert({
      where: {
        id: id ?? 0,
        authorId,
      },
      update: data,
      create: dto,
    });
  }

  findAll(): Promise<Post[]> {
    return this.prisma.post.findMany({
      include: { author: true, pin: true },
      where: { published: true },
    });
  }

  async findOne(userId: number, id: number): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { author: true, pin: true },
    });
    if (post.authorId !== userId && !post.published) {
      throw new ForbiddenException(
        'You do not have permission to view this post',
      );
    } else {
      return post;
    }
  }

  postsByUserId(authorId: number, published: boolean): Promise<Post[]> {
    return this.prisma.post.findMany({
      where: { authorId, published: published ? true : undefined },
      include: { author: true, pin: true },
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
  remove(userId: number, id: number): Promise<Post> {
    return this.prisma.post.delete({ where: { id, authorId: userId } });
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

  async pinPost(dto: PinPostDto) {
    const { postId, userId, unpinAt: unpinAtIso } = dto;

    const unpinAt = new Date(unpinAtIso);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role === Role.STUDENT) {
      throw new ForbiddenException('Only teachers can pin posts');
    }

    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const pinDto: Prisma.PinUpsertArgs['create'] = {
      post: { connect: { id: postId } },
      user: { connect: { id: userId } },
      unpinAt,
    };

    return this.prisma.pin.upsert({
      where: {
        userId,
        postId,
      },
      update: { unpinAt },
      create: pinDto,
    });
  }

  async unpinPost(userId: number, postId: number) {
    const pin = await this.prisma.pin.findFirst({
      where: { userId, postId },
    });

    if (!pin) {
      throw new NotFoundException('Pin not found');
    }

    return this.prisma.pin.delete({ where: { id: pin.id } });
  }
}
