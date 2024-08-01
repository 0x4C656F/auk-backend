import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageHandlerService } from './image-handler.service';
import { AuthGuard } from '../auth/auth.guard';
import { UserPayload } from 'src/shared/user-payload.decorator';
import { JwtPayload } from 'jsonwebtoken';

@Controller('images')
export class ImageController {
  constructor(private readonly imageHandlerService: ImageHandlerService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(AuthGuard)
  async uploadImage(
    @UserPayload() payload: JwtPayload,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 50 }), // 50MB limit
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const imageUrl = await this.imageHandlerService.uploadUserAvatar(
      +payload.sub,
      file.buffer,
    );
    return { imageUrl };
  }
}
