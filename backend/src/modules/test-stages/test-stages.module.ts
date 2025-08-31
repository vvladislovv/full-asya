import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { TestStagesController } from './test-stages.controller';
import { TestStagesService } from './test-stages.service';

@Module({
  imports: [PrismaModule],
  controllers: [TestStagesController],
  providers: [TestStagesService],
  exports: [TestStagesService],
})
export class TestStagesModule {}