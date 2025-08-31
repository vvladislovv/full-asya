import { CacheModuleOptions, CacheOptionsFactory } from '@nestjs/cache-manager';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisConfig implements CacheOptionsFactory {
  constructor(private configService: ConfigService) {}

  createCacheOptions(): CacheModuleOptions {
    const redisConfig = {
      store: 'memory', // Временно используем memory store
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: parseInt(this.configService.get('REDIS_PORT', '6379'), 10),
      password: this.configService.get('REDIS_PASSWORD'),
      db: parseInt(this.configService.get('REDIS_DB', '0'), 10),
      ttl: parseInt(this.configService.get('CACHE_TTL', '300'), 10),
      max: parseInt(this.configService.get('CACHE_MAX', '100'), 10),
    };

    console.log('🔧 Cache configuration:', {
      store: redisConfig.store,
      host: redisConfig.host,
      port: redisConfig.port,
      ttl: redisConfig.ttl
    });

    return redisConfig;
  }
}