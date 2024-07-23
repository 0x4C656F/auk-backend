import { IsString } from '@nestjs/class-validator';

export class SavePostBodyDto {
  @IsString()
  heading: string;

  @IsString()
  subheading: string;

  @IsString()
  content: string;
}

export class SavePostDto extends SavePostBodyDto {
  authorId: number;
  id: number | undefined;
}
