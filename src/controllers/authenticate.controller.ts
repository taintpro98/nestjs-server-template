import { LoginNormalDto, RegisterDto } from '@dtos';
import { Body, Controller, Post, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthenticateService } from '@services';
import { LoginNormalValidationPipe, RegisterValidationPipe } from '@validators';

@ApiTags('Authenticate')
@Controller('')
export class AuthenticateController {
  constructor(private readonly authenticateService: AuthenticateService) {}

  @Post('/register')
  async register(@Body(RegisterValidationPipe) data: RegisterDto) {
    const response = await this.authenticateService.register(data);
    return { data: response };
  }

  @Post('/login/normal')
  async loginNormal(
    @Request() request: any,
    @Body(LoginNormalValidationPipe) data: LoginNormalDto,
  ) {
    const response = await this.authenticateService.loginNormal(
      request.id,
      data,
    );
    return { data: response };
  }
}
