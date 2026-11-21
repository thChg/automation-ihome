import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { hash } from 'bcryptjs';
import { DRIZZLE } from '../database/database.module';
import { users } from '../database/schema';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class UsersService implements OnApplicationBootstrap {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase,
    private readonly config: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    const email = this.config.get<string>('AUTH_BOOTSTRAP_EMAIL')?.trim().toLowerCase();
    const password = this.config.get<string>('AUTH_BOOTSTRAP_PASSWORD');

    if (!email || !password) return;

    const existing = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) return;

    await this.db.insert(users).values({
      email,
      passwordHash: await hash(password, 12),
      role: 'admin',
    });
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
