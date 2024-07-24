import { IsArray, IsString } from '@nestjs/class-validator';
import { Tag } from '@prisma/client';

export class SavePostBodyDto {
  @IsString()
  heading: string;

  @IsString()
  subheading: string;

  @IsString()
  content: string;

  @IsArray()
  tags: Tag[];
}

export class SavePostDto extends SavePostBodyDto {
  authorId: number;
  id: number | undefined;
}
