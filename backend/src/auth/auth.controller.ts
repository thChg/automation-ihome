import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';

interface LoginBody {
  email?: string;
  password?: string;
}

interface RegisterBody {
  email?: string;
  password?: string;
}

const COOKIE_NAME = 'ihome_session';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterBody) {
    if (!body.email || !body.password) {
      throw new BadRequestException('Vui lòng nhập email và mật khẩu');
    }

    return this.auth.register(body.email, body.password);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginBody,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (!body.email || !body.password) {
      throw new UnauthorizedException('Vui lòng nhập email và mật khẩu');
    }

    const result = await this.auth.login(body.email, body.password);
    response.cookie(COOKIE_NAME, result.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000,
    });

    return { user: result.user };
  }

  @Get('me')
  async me(@Req() request: Request) {
    const token = request.cookies?.[COOKIE_NAME] as string | undefined;
    if (!token) throw new UnauthorizedException();
    return this.auth.verifyToken(token);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }
}
