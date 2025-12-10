import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class TeachersService {
  findAll() {
    return prisma.teacher.findMany({ include: { user: true, advisees: true } });
  }
}
