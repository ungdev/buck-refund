import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule } from '../config/config.module';
import { generateKeyPairSync, privateDecrypt, publicEncrypt, constants } from 'crypto';
import { User } from './interfaces/user.interface';

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

  async setIban(userId: string, data: string) {
    const cryptedIban = publicEncrypt(
      { key: this.config.CRYPTO_PUBLIC_KEY, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
      Buffer.from(data, 'utf8'),
    ).toString('base64');
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        iban: cryptedIban,
      },
    } as const);
  }

  public async createLocker(userId: string) {
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: this.config.LOCKER_SERVICE_KEY,
      },
    });

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        locker: privateKey,
      },
    });
    return publicKey.replaceAll(/\n|\r|-+[^-]+KEY-+/g, '');
  }

  public async consumeLocker(user: User, lockerData: string) {
    let rawData: string = null;
    try {
      const decrypted = privateDecrypt(
        {
          key: user.locker,
          passphrase: this.config.LOCKER_SERVICE_KEY,
          padding: constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        Buffer.from(lockerData, 'base64'),
      );
      rawData = decrypted.toString('utf8');
    } catch (e) {
      console.warn(e);
    } finally {
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          locker: null,
        },
      });
    }
    return rawData;
  }
}
