import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class ReportsService {
  findAll() {
    return prisma.report.findMany({ include: { student: true, teacher: true } });
  }
}
