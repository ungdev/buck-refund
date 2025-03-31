import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import ConfigurationReqDto from './dto/req/configure-req.dto';
import { ReportPropertyType } from '@prisma/client';
import { publicEncrypt, constants } from 'crypto';
import { ConfigModule } from '../config/config.module';

const propertyMapping = {
  debtor_iban: [ReportPropertyType.REPORT_DEBTOR_IBAN],
  debtor_bic: [ReportPropertyType.REPORT_DEBTOR_BIC],
  debtor_name: [ReportPropertyType.REPORT_DEBTOR_NAME],
  debtor_address: [ReportPropertyType.REPORT_DEBTOR_ADDR, ReportPropertyType.REPORT_DEBTOR_ADDR2],
};

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    readonly config: ConfigModule,
  ) {}

  async getUsersReport() {
    const users = await this.prisma.user.findMany({
      where: {
        processed: null,
        iban: { not: null },
      },
      take: 250,
    });
    await this.prisma.user.updateMany({
      where: {
        id: { in: users.map((u) => u.id) },
      },
      data: {
        processed: new Date(),
      },
    });
    return users;
  }

  async getConfigurationSummary() {
    const properties = (
      await this.prisma.reportProperty.findMany({
        select: { id: true },
      })
    ).map(({ id }) => id);
    return Object.fromEntries(
      Object.entries(propertyMapping).map(([key, values]) => [
        key,
        values.every((value) => properties.includes(value)),
      ]),
    ) as Record<ReportPropertyType, boolean>;
  }

  async setConfiguration(dto: ConfigurationReqDto) {
    for (const prop in dto) {
      const value = Array.isArray(dto[prop]) ? dto[prop].map((d) => this.encrypt(d)) : [this.encrypt(dto[prop])];
      await this.prisma.$transaction(
        (<ReportPropertyType[]>propertyMapping[prop]).map((property, index) =>
          this.prisma.reportProperty.upsert({
            where: { id: property },
            update: { value: value[index] },
            create: { id: property, value: value[index] },
          }),
        ),
      );
    }
  }

  async getConfiguration() {
    const response = await this.prisma.reportProperty.findMany();
    return Object.fromEntries(response.map(({ id, value }) => [id, value])) as Record<ReportPropertyType, string>;
  }

  encrypt(data: string) {
    return publicEncrypt(
      { key: this.config.CRYPTO_PUBLIC_KEY, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
      Buffer.from(data, 'utf8'),
    ).toString('base64');
  }
}
