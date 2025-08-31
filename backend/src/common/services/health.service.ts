import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma/prisma.service';

export interface HealthStatus {
  status: 'ok' | 'warning' | 'error';
  timestamp: string;
  version: string;
  uptime: number;
  environment: string;
  services: {
    database: DatabaseHealth;
    cache: CacheHealth;
    memory: MemoryHealth;
  };
}

export interface DatabaseHealth {
  status: 'connected' | 'disconnected';
  responseTime: number;
  activeConnections: number;
  database: string;
  error?: string;
}

export interface CacheHealth {
  status: 'connected' | 'disconnected';
  responseTime: number;
  error?: string;
}

export interface MemoryHealth {
  used: number;
  total: number;
  percentage: number;
  status: 'ok' | 'warning' | 'critical';
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private startTime = Date.now();

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getHealthStatus(): Promise<HealthStatus> {
    const startTime = Date.now();
    
    const [databaseHealth, cacheHealth, memoryHealth] = await Promise.allSettled([
      this.checkDatabaseHealth(),
      this.checkCacheHealth(),
      this.checkMemoryHealth(),
    ]);

    const responseTime = Date.now() - startTime;
    
    // Определяем общий статус
    const statuses = [
      databaseHealth.status === 'fulfilled' ? databaseHealth.value.status : 'error',
      cacheHealth.status === 'fulfilled' ? cacheHealth.value.status : 'error',
      memoryHealth.status === 'fulfilled' ? memoryHealth.value.status : 'error',
    ];
    
    let overallStatus: 'ok' | 'warning' | 'error' = 'ok';
    if (statuses.some(s => s === 'disconnected' || s === 'critical')) {
      overallStatus = 'error';
    } else if (statuses.some(s => s === 'warning')) {
      overallStatus = 'warning';
    }

    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: Date.now() - this.startTime,
      environment: this.configService.get('NODE_ENV', 'development'),
      services: {
        database: databaseHealth.status === 'fulfilled' ? databaseHealth.value : {
          status: 'disconnected',
          responseTime: -1,
          activeConnections: 0,
          database: 'unknown',
          error: 'Health check failed',
        },
        cache: cacheHealth.status === 'fulfilled' ? cacheHealth.value : {
          status: 'disconnected',
          responseTime: -1,
          error: 'Health check failed',
        },
        memory: memoryHealth.status === 'fulfilled' ? memoryHealth.value : {
          used: 0,
          total: 0,
          percentage: 0,
          status: 'critical',
        },
      },
    };

    this.logger.log(`Health check completed in ${responseTime}ms - Status: ${overallStatus}`);
    return healthStatus;
  }

  private async checkDatabaseHealth(): Promise<DatabaseHealth> {
    try {
      const startTime = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;

      return {
        status: 'connected',
        responseTime,
        activeConnections: 1, // Prisma manages connections automatically
        database: 'asya_db',
      };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return {
        status: 'disconnected',
        responseTime: -1,
        activeConnections: 0,
        database: 'unknown',
        error: error.message,
      };
    }
  }

  private async checkCacheHealth(): Promise<CacheHealth> {
    try {
      const startTime = Date.now();
      const testKey = 'health-check';
      const testValue = 'test';
      
      await this.cacheManager.set(testKey, testValue, 1000);
      const result = await this.cacheManager.get(testKey);
      await this.cacheManager.del(testKey);
      
      const responseTime = Date.now() - startTime;

      if (result === testValue) {
        return {
          status: 'connected',
          responseTime,
        };
      } else {
        throw new Error('Cache test failed');
      }
    } catch (error) {
      this.logger.error('Cache health check failed', error);
      return {
        status: 'disconnected',
        responseTime: -1,
        error: error.message,
      };
    }
  }

  private async checkMemoryHealth(): Promise<MemoryHealth> {
    const memoryUsage = process.memoryUsage();
    const used = memoryUsage.heapUsed;
    const total = memoryUsage.heapTotal;
    const percentage = (used / total) * 100;

    let status: 'ok' | 'warning' | 'critical' = 'ok';
    if (percentage > 90) {
      status = 'critical';
    } else if (percentage > 75) {
      status = 'warning';
    }

    return {
      used: Math.round(used / 1024 / 1024), // MB
      total: Math.round(total / 1024 / 1024), // MB
      percentage: Math.round(percentage),
      status,
    };
  }

  async getDetailedMetrics() {
    const healthStatus = await this.getHealthStatus();
    const process_metrics = process.memoryUsage();
    
    return {
      ...healthStatus,
      metrics: {
        process: {
          pid: process.pid,
          uptime: process.uptime(),
          version: process.version,
          platform: process.platform,
          arch: process.arch,
        },
        memory: {
          rss: Math.round(process_metrics.rss / 1024 / 1024), // MB
          heapUsed: Math.round(process_metrics.heapUsed / 1024 / 1024), // MB
          heapTotal: Math.round(process_metrics.heapTotal / 1024 / 1024), // MB
          external: Math.round(process_metrics.external / 1024 / 1024), // MB
        },
        eventLoop: {
          lag: 0, // Placeholder
        },
      },
    };
  }

  async isHealthy(): Promise<boolean> {
    try {
      const health = await this.getHealthStatus();
      return health.status !== 'error';
    } catch {
      return false;
    }
  }

  async isReady(): Promise<boolean> {
    try {
      // Проверяем критически важные сервисы
      const dbHealth = await this.checkDatabaseHealth();
      return dbHealth.status === 'connected';
    } catch {
      return false;
    }
  }
}