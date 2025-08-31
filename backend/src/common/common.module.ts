import { Module } from '@nestjs/common';
import { HealthController } from './controllers/health.controller';
import { WebDataController } from './controllers/web-data.controller';
import { HealthService } from './services/health.service';
import { CustomLoggerService } from './services/logger.service';

@Module({
  providers: [HealthService, CustomLoggerService],
  controllers: [HealthController, WebDataController],
  exports: [HealthService, CustomLoggerService],
})
export class CommonModule {}