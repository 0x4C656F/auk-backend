import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { PostsModule } from './modules/posts/posts.module';
import { UsersModule } from './modules/users/users.module';
import { ImageModule } from './modules/images/image.module';
@Module({
  imports: [
    UsersModule,
    PostsModule,
    AuthModule,
    ImageModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({ global: true }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
