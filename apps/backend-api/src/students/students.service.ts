import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class StudentsService {
  findAll() {
    return prisma.student.findMany({ include: { user: true } });
  }
}
