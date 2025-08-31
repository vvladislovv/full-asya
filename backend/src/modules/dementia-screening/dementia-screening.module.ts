import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { DementiaScreeningController } from './dementia-screening.controller';
import { DementiaScreeningService } from './dementia-screening.service';

@Module({
  imports: [PrismaModule],
  controllers: [DementiaScreeningController],
  providers: [DementiaScreeningService],
  exports: [DementiaScreeningService],
})
export class DementiaScreeningModule {}