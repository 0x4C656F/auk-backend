import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { JwtTokensPair } from 'src/shared/jwt-tokens-pair';
import { JWTPayload } from 'src/shared/user-payload.decorator';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async signUp(dto: SignUpDto): Promise<JwtTokensPair> {
    const { password, email, name } = dto;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const data: Prisma.UserCreateInput = {
      email,
      password: hashedPassword,
      name,
    };

    const userExists = await this.prisma.user.findUnique({ where: { email } });

    if (userExists) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.prisma.user.create({ data });

    const payload: JWTPayload = { sub: user.id.toString() };

    return this.generateTokenPair(payload);
  }

  async signIn(dto: SignInDto): Promise<JwtTokensPair> {
    const { email, password } = dto;

    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new NotFoundException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new NotFoundException('Invalid credentials');
      }

      const payload: JWTPayload = { sub: user.id.toString() };
      return await this.generateTokenPair(payload);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred during sign-in',
      );
    }
  }

  async generateTokenPair(payload: JWTPayload): Promise<JwtTokensPair> {
    const accessTokenMaxAge = this.config.get<string>('JWT_ACCESS_MAX_AGE');
    const refreshTokenMaxAge = this.config.get<string>('JWT_REFRESH_MAX_AGE');
    const jwtSecret = this.config.get<string>('JWT_SECRET');

    const access_token = this.jwtService.sign(payload, {
      expiresIn: accessTokenMaxAge,
      secret: jwtSecret,
    });
    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: refreshTokenMaxAge,
      secret: jwtSecret,
    });

    return { _at: access_token, _rt: refresh_token };
  }

  async refreshTokens(refreshToken: string): Promise<JwtTokensPair> {
    const jwtSecret = this.config.get('JWT_SECRET');
    const payload = this.jwtService.verify(refreshToken, {
      secret: jwtSecret,
    }) as JWTPayload;

    return this.generateTokenPair({ sub: payload.sub });
  }
}
