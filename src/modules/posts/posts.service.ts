import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, Post } from '@prisma/client';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  create(createPostDto: Prisma.PostCreateInput): Promise<Post> {
    return this.prisma.post.create({ data: createPostDto });
  }

  findAll(): Promise<Post[]> {
    return this.prisma.post.findMany();
  }

  findOne(id: number): Promise<Post> {
    return this.prisma.post.findUnique({ where: { id } });
  }

  update(id: number, updatePostDto: Prisma.PostUpdateInput): Promise<Post> {
    return this.prisma.post.update({ where: { id }, data: updatePostDto });
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
