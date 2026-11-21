import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import { PG_POOL } from './database/database.module';
import type { Pool } from 'pg';

@Controller('health')
export class HealthController {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  @Get()
  async check() {
    try {
      await this.pool.query('SELECT 1');
      return { status: 'ok' };
    } catch {
      throw new ServiceUnavailableException({ status: 'unhealthy' });
    }
  }
}
