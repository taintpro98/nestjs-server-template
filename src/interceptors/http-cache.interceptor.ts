import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  CACHE_TTL_METADATA,
  CallHandler,
  ExecutionContext,
  Injectable,
  StreamableFile,
} from '@nestjs/common';
import { Observable, of, tap } from 'rxjs';
import { isFunction, isNil } from '@nestjs/common/utils/shared.utils';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const key = this.trackBy(context);
    if (!key) return next.handle();
    const ttlValueOrFactory =
      this.reflector.get(CACHE_TTL_METADATA, context.getHandler()) ?? null;

    try {
      const value = await this.cacheManager.get(key);
      if (value) {
        return of(value);
      }
      const ttl = isFunction(ttlValueOrFactory)
        ? await ttlValueOrFactory(context)
        : ttlValueOrFactory;

      return next.handle().pipe(
        tap(async (response) => {
          if (response instanceof StreamableFile) {
            return;
          }
          const args = [key, response];
          if (!isNil(ttl)) {
            args.push({ ttl });
          }

          try {
            await this.cacheManager.set(...args);
          } catch (err) {
            console.error(
              `An error has occurred when inserting "key: ${key}", "value: ${response}"`,
              'CacheInterceptor',
            );
          }
        }),
      );
    } catch {
      return next.handle();
    }
  }

  trackBy(context: ExecutionContext): string | undefined {
    const handlerName = context.getHandler().name;
    const requestRoute = context.switchToHttp().getRequest().route.path;
    const params = context.getArgByIndex(0);
    return `${handlerName}_${requestRoute}`;
  }
}
