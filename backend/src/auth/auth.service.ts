import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { UsersService } from './users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user || !(await compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException(
        user.status === 'pending'
          ? 'Tài khoản đang chờ quản trị viên phê duyệt'
          : 'Tài khoản không được phép đăng nhập',
      );
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return { accessToken: await this.jwt.signAsync(payload), user: payload };
  }

  async register(email: string, password: string) {
    return this.users.register(email, password);
  }

  async verifyToken(token: string) {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: number; email: string; role: string }>(token);
      const user = await this.users.findById(payload.sub);
      if (!user || user.status !== 'active') throw new UnauthorizedException();

      return { id: user.id, email: user.email, role: user.role };
    } catch {
      throw new UnauthorizedException();
    }
  }
}
