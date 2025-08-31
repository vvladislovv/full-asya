import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { TestScoringController } from './test-scoring.controller';
import { TestScoringService } from './test-scoring.service';

@Module({
  imports: [PrismaModule],
  controllers: [TestScoringController],
  providers: [TestScoringService],
  exports: [TestScoringService],
})
export class TestScoringModule {}