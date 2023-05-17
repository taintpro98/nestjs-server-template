import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REPOSITORIES } from '@constants';
import { IUserRepository } from '@repositories/interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(ConfigService) configService: ConfigService,

    @Inject(REPOSITORIES.USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('auth.key.token_secret_key'),
    });
  }

  async validate(payload: any) {
    const user = await this.userRepository.findById(payload.id);
    if (!user) throw new BadRequestException('User not existed');
    return {
      exp: payload.exp,
      iat: payload.iat,
      sub: payload.id,
    };
  }
}
