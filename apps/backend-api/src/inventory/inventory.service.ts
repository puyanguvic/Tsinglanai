import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class InventoryService {
  findAll() {
    return prisma.inventoryItem.findMany({ include: { assignedToStudent: true, assignedToTeacher: true } });
  }
}
