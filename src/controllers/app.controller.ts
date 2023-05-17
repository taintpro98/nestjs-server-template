import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('HealthCheck')
@Controller('/health')
export class AppController {
  constructor() {}
  @Get()
  async healthCheck() {
    return { status: 200 };
  }
}
