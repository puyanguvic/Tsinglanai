import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class RequestsService {
  findAll() {
    return prisma.request.findMany({ include: { student: true, teacher: true } });
  }
}
