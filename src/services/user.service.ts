import { REPOSITORIES } from '@constants';
import { Inject } from '@nestjs/common';
import { IUserRepository } from '@repositories/interfaces';
import { UserTransformer } from '@transformers';
import { Redis } from 'ioredis';

export class UserService {
  constructor(
    @Inject(REPOSITORIES.USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis,

    private readonly userTransformer: UserTransformer,
  ) {}

  async getUserProfile(userId: string) {
    let user = await this.userRepository.findById(userId);
    let response = await this.userTransformer.collection([user], {
      include: '',
    });
    return response[0];
  }
}
