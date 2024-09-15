import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import UserSetIbanDto from './dto/req/user-set-iban.dto';
import { ConfigModule } from '../config/config.module';
import { publicEncrypt } from 'crypto';

@Injectable()
export default class UsersService {
  constructor(private prisma: PrismaService, readonly config: ConfigModule) {}

  public isValidIban(iban: string) {
    const workingIban = iban.toUpperCase().replaceAll(/[^A-Z0-9]/g, '');

    // CHECK IBAN LENGTH
    if (workingIban.length < 14 || workingIban.length > 34) return false;

    // IBAN CHECK
    const ibanNumeric = BigInt(
      (workingIban.slice(4) + workingIban.slice(0, 4))
        .split('')
        .map((c) => (c >= 'A' && c <= 'Z' ? c.charCodeAt(0) - 55 : c))
        .join(''),
    );
    if (ibanNumeric % BigInt(97) !== BigInt(1)) return false;

    // BBAN CHECK
    const bban = workingIban.slice(4);
    const countryCode = workingIban.slice(0, 2);
    if (countryCode === 'FR') {
      // FRANCE RIB KEY CHECK
      if (workingIban.length !== 27) return false;
      const numericTransform = (c: string) =>
        c >= 'A' && c <= 'I'
          ? (c.charCodeAt(0) - 64) % 10
          : c >= 'J' && c <= 'R'
          ? (c.charCodeAt(0) - 73) % 10
          : c >= 'S' && c <= 'Z'
          ? (c.charCodeAt(0) - 81) % 10
          : c;
      const ribNumeric =
        Number.parseInt(bban.slice(0, 5).split('').map(numericTransform).join('')) * 89 +
        Number.parseInt(bban.slice(5, 10).split('').map(numericTransform).join('')) * 15 +
        Number.parseInt(bban.slice(10, -2).split('').map(numericTransform).join('')) * 3;
      const computedKey = (97 - (ribNumeric % 97)).toString().padStart(2, '0');
      return computedKey === bban.slice(-2);
    }
    return true;
  }

  async setIban(userId: string, dto: UserSetIbanDto) {
    const cryptedIban = publicEncrypt(this.config.CRYPTO_PUBLIC_KEY, Buffer.from(dto.data, 'utf8')).toString('base64');
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        iban: cryptedIban,
      },
    } as const);
  }
}
