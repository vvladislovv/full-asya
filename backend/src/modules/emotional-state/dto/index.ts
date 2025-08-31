import { ApiProperty } from '@nestjs/swagger';
import { Language } from '@prisma/client';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested
} from 'class-validator';

export class EmotionalResponseDto {
  @ApiProperty({ description: 'ID вопроса' })
  @IsString()
  questionId: string;

  @ApiProperty({ description: 'Ответ на вопрос' })
  response: any;

  @ApiProperty({ description: 'Баллы за ответ', required: false })
  @IsOptional()
  @IsNumber()
  score?: number;
}

export class CreateEmotionalAssessmentDto {
  @ApiProperty({ description: 'ID пользователя' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'ID результата теста', required: false })
  @IsOptional()
  @IsUUID()
  testResultId?: string;

  @ApiProperty({ 
    description: 'Ответы на вопросы эмоциональной оценки',
    type: [EmotionalResponseDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmotionalResponseDto)
  responses: EmotionalResponseDto[];

  @ApiProperty({ 
    description: 'Язык оценки',
    enum: Language,
    required: false
  })
  @IsOptional()
  @IsEnum(Language)
  language?: Language;
}

export class EmotionalAssessmentResultDto {
  @ApiProperty({ description: 'ID оценки' })
  id: string;

  @ApiProperty({ description: 'ID пользователя' })
  userId: string;

  @ApiProperty({ description: 'ID результата теста', required: false })
  testResultId?: string;

  @ApiProperty({ description: 'Эмоциональный балл' })
  emotionalScore: number;

  @ApiProperty({ description: 'Эмоциональное состояние' })
  emotionalState: string;

  @ApiProperty({ description: 'Детальные баллы по категориям' })
  detailedScores: Record<string, number>;

  @ApiProperty({ description: 'Рекомендации' })
  recommendations: Record<string, any>;

  @ApiProperty({ description: 'Ответы пользователя' })
  responses: Record<string, any>;

  @ApiProperty({ description: 'Дата создания' })
  createdAt: Date;
}