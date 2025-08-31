import { CustomLoggerService } from '@common/services/logger.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
    CallHandler,
    ExecutionContext,
    Inject,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Request } from 'express';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface CacheOptions {
  ttl?: number; // время жизни в секундах
  keyPrefix?: string;
  excludeQuery?: boolean;
  excludeParams?: boolean;
}

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setContext('Cache');
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const handler = context.getHandler();
    
    // Получаем опции кэширования из метаданных
    const cacheOptions: CacheOptions = Reflect.getMetadata('cache-options', handler) || {};
    
    // Проверяем, нужно ли кэшировать этот запрос
    if (!this.shouldCache(request, cacheOptions)) {
      return next.handle();
    }

    const cacheKey = this.generateCacheKey(request, cacheOptions);
    
    try {
      // Пытаемся получить данные из кэша
      const cachedResponse = await this.cacheManager.get(cacheKey);
      
      if (cachedResponse) {
        this.logger.logCache('HIT', cacheKey);
        return of(cachedResponse);
      }

      this.logger.logCache('MISS', cacheKey);
      
      // Если данных нет в кэше, выполняем запрос и кэшируем результат
      return next.handle().pipe(
        tap(async (response) => {
          if (response && this.isValidResponse(response)) {
            const ttl = cacheOptions.ttl || 300; // 5 минут по умолчанию
            await this.cacheManager.set(cacheKey, response, ttl * 1000);
            this.logger.logCache('SET', cacheKey, ttl);
          }
        })
      );
    } catch (error) {
      this.logger.error(`❌ Ошибка кэширования: ${error.message}`);
      return next.handle();
    }
  }

  private shouldCache(request: Request, options: CacheOptions): boolean {
    // Кэшируем только GET запросы
    if (request.method !== 'GET') {
      return false;
    }

    // Не кэшируем запросы с авторизацией пользователя (если не указано иначе)
    if (request.headers.authorization && !options.keyPrefix?.includes('user')) {
      return false;
    }

    return true;
  }

  private generateCacheKey(request: Request, options: CacheOptions): string {
    const { url, method, headers } = request;
    const userId = (request as any).user?.id || 'anonymous';
    
    let key = `${method}:${url}`;
    
    // Добавляем префикс если указан
    if (options.keyPrefix) {
      key = `${options.keyPrefix}:${key}`;
    }
    
    // Добавляем ID пользователя для персонализированных данных
    if (userId !== 'anonymous' && options.keyPrefix?.includes('user')) {
      key = `user:${userId}:${key}`;
    }
    
    // Добавляем язык из заголовков
    const language = headers['accept-language']?.split(',')[0] || 'ru';
    key = `${key}:lang:${language}`;
    
    return key.replace(/[^a-zA-Z0-9:_-]/g, '_');
  }

  private isValidResponse(response: any): boolean {
    // Не кэшируем ошибки или пустые ответы
    if (!response || response.error || response.statusCode >= 400) {
      return false;
    }
    
    // Не кэшируем слишком большие ответы (>1MB)
    const size = JSON.stringify(response).length;
    if (size > 1024 * 1024) {
      return false;
    }
    
    return true;
  }
}

// Декоратор для настройки кэширования
export function CacheResponse(options: CacheOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata('cache-options', options, descriptor.value);
    return descriptor;
  };
}