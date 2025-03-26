import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getUsersReport() {
    return this.prisma.user.updateMany({
      where: {
        processed: null,
        iban: { not: null },
      },
      data: {
        processed: new Date(),
      },
    });
  }
}
