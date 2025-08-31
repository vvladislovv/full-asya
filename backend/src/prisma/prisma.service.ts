import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/asya_db?schema=public'
        }
      },
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Prisma подключен к базе данных');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔌 Prisma отключен от базы данных');
  }

  // Метод для очистки базы данных (только для тестов)
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Очистка базы данных недоступна в продакшне!');
    }

    const tables = [
      'practice_progress',
      'test_results', 
      'consultations',
      'practices',
      'tests',
      'user_stats',
      'test_sessions',
      'users',
      'system_settings'
    ];

    for (const table of tables) {
      await this.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
    }
  }

  // Получение статистики базы данных
  async getDatabaseStats() {
    const [
      userCount,
      testCount, 
      testResultCount,
      consultationCount,
      practiceCount
    ] = await Promise.all([
      this.user.count(),
      this.test.count(),
      this.testResult.count(),
      this.consultation.count(),
      this.practice.count()
    ]);

    return {
      users: userCount,
      tests: testCount,
      testResults: testResultCount,
      consultations: consultationCount,
      practices: practiceCount,
      timestamp: new Date().toISOString()
    };
  }

  // Проверка здоровья базы данных
  async healthCheck() {
    try {
      await this.$queryRaw`SELECT 1`;
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error.message,
        timestamp: new Date().toISOString() 
      };
    }
  }
}