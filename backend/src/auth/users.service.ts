import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { hash } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { DRIZZLE } from '../database/database.module';
import { users } from '../database/schema';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase,
    private readonly jwt: JwtService,
  ) {}

  async register(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) throw new BadRequestException('Email không hợp lệ');
    if (password.length < 8) throw new BadRequestException('Mật khẩu phải có ít nhất 8 ký tự');

    const existing = await this.db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
    if (existing.length > 0) throw new ConflictException('Email đã được sử dụng');

    const [created] = await this.db.insert(users).values({
      email: normalizedEmail,
      passwordHash: await hash(password, 12),
      role: 'user',
      status: 'pending',
    }).returning();

    return { id: created.id, email: created.email, role: created.role, status: created.status };
  }

  async listAll() {
    return this.db.select({
      id: users.id,
      email: users.email,
      role: users.role,
      status: users.status,
      approvedAt: users.approvedAt,
      approvedBy: users.approvedBy,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users).orderBy(users.createdAt);
  }

  private async getAdminId(request: Request) {
    const token = request.cookies?.ihome_session as string | undefined;
    if (!token) throw new ForbiddenException();
    const payload = await this.jwt.verifyAsync<{ sub: number }>(token);
    return payload.sub;
  }

  async approve(id: number, request: Request) {
    const target = await this.findById(id);
    if (!target) throw new NotFoundException('Không tìm thấy người dùng');
    if (target.role === 'admin') throw new ForbiddenException('Không thể thay đổi tài khoản admin');

    const adminId = await this.getAdminId(request);
    const [updated] = await this.db.update(users).set({
      status: 'active',
      approvedAt: new Date(),
      approvedBy: adminId,
      updatedAt: new Date(),
    }).where(eq(users.id, id)).returning();

    return { id: updated.id, email: updated.email, role: updated.role, status: updated.status };
  }

  async promoteAdmin(id: number, request: Request) {
    const target = await this.findById(id);
    if (!target) throw new NotFoundException('Không tìm thấy người dùng');
    if (target.role === 'admin') throw new BadRequestException('Người dùng đã là admin');
    if (target.status !== 'active') throw new BadRequestException('Người dùng phải ở trạng thái active');

    const adminId = await this.getAdminId(request);
    if (id === adminId) throw new BadRequestException('Tài khoản đã là admin');

    await this.db.transaction(async (tx) => {
      await tx.update(users).set({ role: 'user', updatedAt: new Date() }).where(eq(users.id, adminId));
      await tx.update(users).set({
        role: 'admin',
        status: 'active',
        approvedAt: new Date(),
        approvedBy: adminId,
        updatedAt: new Date(),
      }).where(eq(users.id, id));
    });

    return this.findById(id);
  }

  async reject(id: number) {
    const target = await this.findById(id);
    if (!target) throw new NotFoundException('Không tìm thấy người dùng');
    if (target.role === 'admin') throw new ForbiddenException('Không thể thay đổi tài khoản admin');

    const [updated] = await this.db.update(users).set({
      status: 'rejected',
      updatedAt: new Date(),
    }).where(eq(users.id, id)).returning();

    return { id: updated.id, email: updated.email, role: updated.role, status: updated.status };
  }

  async remove(id: number, request: Request) {
    const target = await this.findById(id);
    if (!target) throw new NotFoundException('Không tìm thấy người dùng');
    if (target.role === 'admin') throw new ForbiddenException('Không thể xóa tài khoản admin');

    const adminId = await this.getAdminId(request);
    if (id === adminId) throw new ForbiddenException('Không thể xóa tài khoản của chính mình');

    await this.db.delete(users).where(eq(users.id, id));
  }

  async findByEmail(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    return result[0] ?? null;
  }

  async findById(id: number) {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] ?? null;
  }
}
