import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getUsersReport() {
    const users = await this.prisma.user.findMany({
      where: {
        processed: null,
        iban: { not: null },
      },
      take: 250,
    });
    // await this.prisma.user.updateMany({
    //   where: {
    //     id: { in: users.map((u) => u.id) },
    //   },
    //   data: {
    //     processed: new Date(),
    //   },
    // });
    return users;
  }
}
