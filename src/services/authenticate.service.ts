import { PASSWORD_SALT_ROUND, REPOSITORIES } from '@constants';
import { LoginNormalDto, RegisterDto } from '@dtos';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IUserRepository } from '@repositories/interfaces';
import * as bcrypt from 'bcrypt';
import ms from 'ms';

export class AuthenticateService {
  constructor(
    @Inject(REPOSITORIES.USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(data: RegisterDto) {
    const { email, username, password } = data;
    const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUND);
    const user = await this.userRepository.create({
      email,
      username,
      password: passwordHash,
    });
    return {
      access_token: await this.jwtService.signAsync(
        {
          id: user.id,
          username: user.username,
        },
        {
          expiresIn: ms(
            this.configService.get<string>('auth.auth.access_token_lifetime'),
          ),
        },
      ),
      expires_in: ms(
        this.configService.get<string>('auth.auth.access_token_lifetime'),
      ),
      token_type: 'Bearer',
    };
  }

  async loginNormal(userId: string, data: LoginNormalDto) {
    return {
      access_token: await this.jwtService.signAsync(
        {
          id: userId,
          username: data.username,
        },
        {
          expiresIn: ms(
            this.configService.get<string>('auth.auth.access_token_lifetime'),
          ),
        },
      ),
      expires_in: ms(
        this.configService.get<string>('auth.auth.access_token_lifetime'),
      ),
      token_type: 'Bearer',
    };
  }
}
