import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule, ConfigService as NestConfigService } from '@nestjs/config';

const isTestEnv = process.env.NODE_ENV === 'test';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      // Ok, for some reason it still loads the normal .env.dev file.
      // I tried to remove the ternary to make it always load the .env.dev.test file.
      // It loads the .env.dev.test file properly, but overrides it with the normal .env.dev file
      envFilePath: isTestEnv ? '.env.test' : '.env.dev',
    }),
  ],
  exports: [ConfigModule],
})
export class ConfigModule {
  // BOTH DEV AND TEST ENVIRONMENTS
  public readonly PAGINATION_PAGE_SIZE: number;
  public readonly DATABASE_URL: string;
  public readonly JWT_SECRET: string;
  public readonly JWT_EXPIRES_IN: string;
  public readonly SALT_ROUNDS: number;
  public readonly CRYPTO_PUBLIC_KEY: string;
  public readonly BALANCE_MIN_VALUE: number;
  public readonly LOCKER_SERVICE_KEY: string;
  public readonly XML_EXPORT_COMPANY_NAME: string;
  public readonly XML_EXPORT_COMPANY_IBAN: string;
  public readonly XML_EXPORT_COMPANY_BIC: string;
  public readonly XML_EXPORT_COMPANY_ADDRESS: string;
  public readonly XML_EXPORT_COMPANY_ADDRESS_2: string;

  // DEV ENVIRONMENT ONLY

  // TEST ENVIRONMENT ONLY
  public readonly _FAKER_SEED: number;

  constructor(config: NestConfigService) {
    this.PAGINATION_PAGE_SIZE = Number(config.get('PAGINATION_PAGE_SIZE'));
    this.DATABASE_URL = config.get('DATABASE_URL');
    this.JWT_SECRET = config.get('JWT_SECRET');
    this.JWT_EXPIRES_IN = config.get('JWT_EXPIRES_IN');
    this.SALT_ROUNDS = Number(config.get('SALT_ROUNDS'));
    this.CRYPTO_PUBLIC_KEY = config.get('CRYPTO_PUBLIC_KEY');
    this.BALANCE_MIN_VALUE = Number(config.get('BALANCE_MIN_VALUE'));
    this.LOCKER_SERVICE_KEY = config.get('LOCKER_SERVICE_KEY');
    this.XML_EXPORT_COMPANY_NAME = config.get('XML_EXPORT_COMPANY_NAME');
    this.XML_EXPORT_COMPANY_IBAN = config.get('XML_EXPORT_COMPANY_IBAN');
    this.XML_EXPORT_COMPANY_BIC = config.get('XML_EXPORT_COMPANY_BIC');
    this.XML_EXPORT_COMPANY_ADDRESS = config.get('XML_EXPORT_COMPANY_ADDRESS');
    this.XML_EXPORT_COMPANY_ADDRESS_2 = config.get('XML_EXPORT_COMPANY_ADDRESS_2');

    this._FAKER_SEED = isTestEnv ? Number(config.get('FAKER_SEED')) : undefined;
  }

  get FAKER_SEED() {
    if (!isTestEnv) throw new Error('FAKER_SEED is a test-environment-only environment variable');
    return this._FAKER_SEED;
  }

  get<T extends keyof ConfigModule>(key: T): ConfigModule[T] {
    return this[key];
  }
}
