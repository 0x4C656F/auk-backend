import { Module } from '@nestjs/common';
import { ImageController } from './image.controller';
import { ImageHandlerService } from './image-handler.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [ImageController],
  providers: [PrismaService, ImageHandlerService],
  exports: [ImageHandlerService],
})
export class ImageModule {}
