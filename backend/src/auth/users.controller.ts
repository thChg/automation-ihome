import { Controller, Delete, Get, Param, ParseIntPipe, Patch, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { Roles } from './rbac/roles.decorator';
import { RolesGuard } from './rbac/roles.guard';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @Roles('admin')
  list() {
    return this.users.listAll();
  }

  @Patch(':id/approve')
  @Roles('admin')
  approve(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {
    return this.users.approve(id, request);
  }

  @Patch(':id/admin')
  @Roles('admin')
  promoteAdmin(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {
    return this.users.promoteAdmin(id, request);
  }

  @Patch(':id/reject')
  @Roles('admin')
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.users.reject(id);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {
    return this.users.remove(id, request);
  }
}
