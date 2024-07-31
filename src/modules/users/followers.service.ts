import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
@Injectable()
export class FollowersService {
  constructor(private prisma: PrismaService) {}

  async followUser(followerId: number, authorId: number) {
    return this.prisma.user.update({
      where: { id: authorId },
      data: {
        followerIds: {
          push: followerId,
        },
      },
    });
  }

  async unfollowUser(subscriberId: number, authorId: number) {
    const author = await this.prisma.user.findUnique({
      where: { id: authorId },
      select: { followerIds: true },
    });

    const updatedSubscriberIds = author.followerIds.filter(
      (id) => id !== subscriberId,
    );

    return this.prisma.user.update({
      where: { id: authorId },
      data: {
        followerIds: updatedSubscriberIds,
      },
    });
  }

  async getFollowers(authorId: number) {
    const author = await this.prisma.user.findUnique({
      where: { id: authorId },
      select: { followerIds: true },
    });

    return this.prisma.user.findMany({
      where: {
        id: {
          in: author.followerIds,
        },
      },
    });
  }

  async isFollowing(subscriberId: number, authorId: number) {
    const author = await this.prisma.user.findUnique({
      where: { id: authorId },
      select: { followerIds: true },
    });

    return author.followerIds.includes(subscriberId);
  }
}
