import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';

import { RedisConfig } from '@config/redis.config';
import { AuthModule } from '@modules/auth/auth.module';
import { ConsultationsModule } from '@modules/consultations/consultations.module';
import { DementiaScreeningModule } from '@modules/dementia-screening/dementia-screening.module';
import { EmotionalStateModule } from '@modules/emotional-state/emotional-state.module';
import { HistoryModule } from '@modules/history/history.module';
import { I18nModule } from '@modules/i18n/i18n.module';
import { PracticesModule } from '@modules/practices/practices.module';
import { QuestionnairesModule } from '@modules/questionnaires/questionnaires.module';
import { TelegramModule } from '@modules/telegram/telegram.module';
import { TestScoringModule } from '@modules/test-scoring/test-scoring.module';
import { TestStagesModule } from '@modules/test-stages/test-stages.module';
import { TestsModule } from '@modules/tests/tests.module';
import { UsersModule } from '@modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';

// Импорты для безопасности и обработки ошибок
import { CommonModule } from '@common/common.module';
import { HttpExceptionFilter } from '@common/filters/http-exception.filter';
import { CustomThrottlerGuard } from '@common/guards/throttle.guard';
import { CacheInterceptor } from '@common/interceptors/cache.interceptor';
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';
import { SecurityInterceptor } from '@common/interceptors/security.interceptor';
import { SecurityMiddleware } from '@common/middleware/security.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    CacheModule.registerAsync({
      isGlobal: true,
      useClass: RedisConfig,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 секунда
        limit: 10, // 10 запросов в секунду
      },
      {
        name: 'medium',
        ttl: 10000, // 10 секунд
        limit: 50, // 50 запросов в 10 секунд
      },
      {
        name: 'long',
        ttl: 60000, // 1 минута
        limit: 200, // 200 запросов в минуту
      },
    ]),
    EventEmitterModule.forRoot(),
    I18nModule,
    CommonModule,
    AuthModule,
    UsersModule,
    TestsModule,
    TestScoringModule,
    TestStagesModule,
    HistoryModule,
    ConsultationsModule,
    PracticesModule,
    QuestionnairesModule,
    EmotionalStateModule,
    DementiaScreeningModule,
    TelegramModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SecurityInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
} 