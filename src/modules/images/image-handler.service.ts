import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as FormData from 'form-data';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ImageHandlerService {
  private readonly clientId: string;
  private readonly imgurApiUrl = 'https://api.imgur.com/3';

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.clientId = this.configService.get<string>('IMGUR_CLIENT_ID');
  }

  async uploadUserAvatar(userId: number, fileBuffer: Buffer): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', fileBuffer);

      const response = await axios.post(`${this.imgurApiUrl}/image`, formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Client-ID ${this.clientId}`,
        },
      });

      if (response.data.success) {
        const avatarUrl = response.data.data.link;
        const deleteHash = response.data.data.deletehash;

        await this.prisma.user.update({
          where: { id: userId },
          data: {
            avatar: avatarUrl,
            avatarDeleteHash: deleteHash,
          },
        });

        return avatarUrl;
      } else {
        throw new BadRequestException('Image upload failed');
      }
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async deleteUserAvatar(userId: number): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.avatarDeleteHash) {
      throw new NotFoundException('User avatar not found');
    }

    try {
      await axios.delete(`${this.imgurApiUrl}/image/${user.avatarDeleteHash}`, {
        headers: {
          Authorization: `Client-ID ${this.clientId}`,
        },
      });

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          avatar: null,
          avatarDeleteHash: null,
        },
      });
    } catch (error) {
      this.handleApiError(error);
    }
  }

  private handleApiError(error: any): never {
    console.error('Error interacting with Imgur API:', error);

    if (axios.isAxiosError(error)) {
      const response = error.response;
      if (response) {
        console.error('Response headers:', response.headers);
        console.error('Response data:', response.data);
        console.error('Response status:', response.status);
      }

      if (response?.status === 400) {
        throw new BadRequestException('Invalid request to Imgur API');
      }

      if (response?.status === 404) {
        throw new NotFoundException('Image not found');
      }

      if (response?.headers['x-ratelimit-userremaining'] === '0') {
        throw new BadRequestException(
          'Rate limit exceeded. Please try again later.',
        );
      }
    }

    throw new InternalServerErrorException(
      'An error occurred while interacting with the Imgur API',
    );
  }
}
