import { JwtAuthGuard } from '@guards';
import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from '@services';

@ApiTags('Account')
@Controller('/my')
export class AccountController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('/profile')
  async getUserProfile(@Request() request: any) {
    const response = await this.userService.getUserProfile(request.user.sub);
    return { data: response };
  }
}
