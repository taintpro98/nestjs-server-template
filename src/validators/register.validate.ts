import { EMAIL_PATTERN, PASSWORD_PATTERN, REPOSITORIES } from '@constants';
import { RegisterDto } from '@dtos';
import {
  ArgumentMetadata,
  BadRequestException,
  Inject,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { IUserRepository } from '@repositories/interfaces';

@Injectable()
export class RegisterValidationPipe implements PipeTransform<RegisterDto> {
  constructor(
    @Inject(REPOSITORIES.USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async transform(value: RegisterDto, metadata: ArgumentMetadata) {
    const { email, password, username } = value;
    if (!password.match(PASSWORD_PATTERN)) {
      throw new BadRequestException(`Invalid password`);
    }
    if (!value.email.match(EMAIL_PATTERN)) {
      throw new BadRequestException(`Invalid email`);
    }

    const emailCheck = (
      await this.userRepository.list({
        emails: [email],
      })
    )[0];
    const usernameCheck = (
      await this.userRepository.list({
        usernames: [username],
      })
    )[0];

    if (emailCheck) throw new BadRequestException(`Duplicate email ${email}`);
    if (usernameCheck)
      throw new BadRequestException(`Duplicate user name ${username}`);
    return value;
  }
}
