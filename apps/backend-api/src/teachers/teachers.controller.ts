import { Controller, Get, UseGuards } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { JwtGuard } from '../common/guards/jwt.guard';

@Controller('teachers')
@UseGuards(JwtGuard)
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get()
  findAll() {
    return this.teachersService.findAll();
  }
}
