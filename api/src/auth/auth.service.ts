import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '../config/config.module';
import AuthSignInReqDto from './dto/req/auth-sign-in-req.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigModule) {}

  /**
   * Verifies the credentials are right.
   * It then returns an access_token the user can use to authenticate their requests.
   * @param dto Data needed to sign in the user (login & password).
   */
  async signin(dto: AuthSignInReqDto): Promise<{ token: string; id: string } | null> {
    // find the user by login, if it does not exist, throw exception
    const user = await this.prisma.withDefaultBehaviour.user.findUnique({
      where: {
        email: dto.login,
      },
    });
    if (!user) {
      return { token: null, id: null };
    }

    // https://github.com/buckutt/server/blob/master/src/controllers/services/login.js#L81
    const pwMatches = await bcrypt.compare(dto.password, user.pwdHash);

    if (!pwMatches) {
      return { token: null, id: null };
    }

    return { token: await this.signToken(user.id, user.email), id: user.id };
  }

  /**
   * Returns whether the token is valid or not. An expired token is not considered valid.
   * @param token The token to verify.
   */
  isTokenValid(token: string): { valid: boolean; id?: string } {
    let id: string = undefined;
    try {
      id = this.jwt.verify(token, { secret: this.config.JWT_SECRET }).sub;
    } catch (e) {
      return { valid: false };
    }
    return { valid: true, id };
  }

  /**
   * Creates a token for user with the provided user id and login.
   * It returns the generated token.
   * @param userId The id of the user for who we are creating the token.
   * @param login The login of the user for who we are creating the token.
   */
  private signToken(userId: string, login: string): Promise<string> {
    const payload = {
      sub: userId,
      login,
    };
    const secret = this.config.JWT_SECRET;

    return this.jwt.signAsync(payload, {
      expiresIn: this.config.JWT_EXPIRES_IN,
      secret: secret,
    });
  }

  async getUser(id: string) {
    return this.prisma.withDefaultBehaviour.user.findUnique({
      where: {
        id,
      },
    });
  }
}
