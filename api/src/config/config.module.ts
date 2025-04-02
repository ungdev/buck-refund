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
  public readonly SMTP_HOST: string;
  public readonly SMTP_PORT: number;
  public readonly SMTP_USER: string;
  public readonly SMTP_PASS: string;
  public readonly SMTP_FROM: string;
  public readonly FRONT_URL: string;
  public readonly MAGIC_LINK_VALIDITY: number;

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
    this.SMTP_HOST = config.get('SMTP_HOST');
    this.SMTP_PORT = Number(config.get('SMTP_PORT'));
    this.SMTP_USER = config.get('SMTP_USER');
    this.SMTP_PASS = config.get('SMTP_PASS');
    this.SMTP_FROM = config.get('SMTP_FROM');
    this.FRONT_URL = config.get('FRONT_URL');
    this.MAGIC_LINK_VALIDITY = Number(config.get('MAGIC_LINK_VALIDITY'));

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
