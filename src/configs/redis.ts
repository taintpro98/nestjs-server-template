import { registerAs } from '@nestjs/config';

export const configRedis = registerAs('redis', () => ({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
}));
