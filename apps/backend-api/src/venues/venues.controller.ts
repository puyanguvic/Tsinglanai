import { Controller, Get, UseGuards } from '@nestjs/common';
import { VenuesService } from './venues.service';
import { JwtGuard } from '../common/guards/jwt.guard';

@Controller('venues')
@UseGuards(JwtGuard)
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Get()
  findAll() {
    return this.venuesService.findAll();
  }
}
