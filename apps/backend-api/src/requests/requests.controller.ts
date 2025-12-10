import { Controller, Get, UseGuards } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { JwtGuard } from '../common/guards/jwt.guard';

@Controller('requests')
@UseGuards(JwtGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Get()
  findAll() {
    return this.requestsService.findAll();
  }
}
