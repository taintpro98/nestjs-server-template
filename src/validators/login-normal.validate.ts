import { REPOSITORIES } from '@constants';
import { LoginNormalDto } from '@dtos';
import {
  ArgumentMetadata,
  BadRequestException,
  Inject,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { IUserRepository } from '@repositories/interfaces';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LoginNormalValidationPipe
  implements PipeTransform<LoginNormalDto>
{
  constructor(
    @Inject(REPOSITORIES.USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject('REQUEST')
    private readonly request: any,
  ) {}

  async transform(value: LoginNormalDto, metadata: ArgumentMetadata) {
    const { username, password } = value;
    const user = (
      await this.userRepository.list({
        usernames: [username],
      })
    )[0];
    const passwordHash = user.password;
    const match = await bcrypt.compare(password, passwordHash);
    if (!match) throw new BadRequestException('Incorrect password!');
    this.request.id = user.id;
    return value;
  }
}
