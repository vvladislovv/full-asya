import { Module } from '@nestjs/common';
import { EmotionalStateController } from './emotional-state.controller';
import { EmotionalStateService } from './emotional-state.service';

@Module({
  providers: [EmotionalStateService],
  controllers: [EmotionalStateController],
  exports: [EmotionalStateService],
})
export class EmotionalStateModule {} 