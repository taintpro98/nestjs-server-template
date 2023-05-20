import { registerAs } from '@nestjs/config';

export const configCache = registerAs('cache', () => ({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  database: process.env.CACHE_DATABASE,
  ttl: process.env.CACHE_TTL,
}));
