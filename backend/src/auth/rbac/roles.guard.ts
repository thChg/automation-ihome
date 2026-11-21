import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { ROLES_KEY, UserRole } from './roles.decorator';
import { UsersService } from '../users.service';

const COOKIE_NAME = 'ihome_session';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly users: UsersService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.[COOKIE_NAME] as string | undefined;
    if (!token) throw new UnauthorizedException();

    try {
      const payload = await this.jwt.verifyAsync<{ sub: number }>(token);
      const user = await this.users.findById(payload.sub);
      if (!user || user.status !== 'active') throw new UnauthorizedException();
      if (!requiredRoles.includes(user.role as UserRole)) throw new ForbiddenException();
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new UnauthorizedException();
    }
  }
}
