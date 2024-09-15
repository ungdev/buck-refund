import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '../../user/interfaces/user.interface';
import { ConfigModule } from '../../config/config.module';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigModule, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.JWT_SECRET,
    });
  }

  async validate(payload: { sub: string; login: string }): Promise<User> {
    return this.prisma.withDefaultBehaviour.user.findUnique({
      where: {
        id: payload.sub,
      },
    });
  }
}
