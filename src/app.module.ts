import { Module } from '@nestjs/common';
import {
  AccountController,
  AppController,
  AuthenticateController,
} from '@controllers';
import { ConfigAppService, configDb, configRedis } from '@configs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ObjectionModule } from '@modules/objection';
import { REPOSITORIES } from '@constants';
import { UserRepository } from '@repositories/user.repository';
import { JwtModule } from '@nestjs/jwt';
import { configAuth } from 'configs/auth';
import { JwtStrategy } from '@passports';
import * as Service from '@services';
import * as Transformer from '@transformers';
import { Redis } from 'ioredis';

const controllers = [AppController, AuthenticateController, AccountController];

const repositories = [
  {
    provide: REPOSITORIES.USER_REPOSITORY,
    useClass: UserRepository,
  },
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [configDb, configAuth, configRedis],
    }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('auth.key.token_secret_key'),
      }),
      inject: [ConfigService],
    }),
    ObjectionModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => config.get('db'),
      inject: [ConfigService],
    }),
  ],
  controllers,
  providers: [
    ConfigAppService,
    JwtStrategy,
    ...Object.values(Service),
    ...repositories,
    ...Object.values(Transformer),
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('redis.host');
        const port = configService.get<number>('redis.port');
        return new Redis({
          host,
          port,
        });
      },
      inject: [ConfigService],
    },
  ],
})
export class AppModule {}
