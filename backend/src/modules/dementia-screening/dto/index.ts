import { ApiProperty } from '@nestjs/swagger';
import { DementiaRiskLevel, Language } from '@prisma/client';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsEnum,
    IsInt,
    IsObject,
    IsOptional,
    IsString,
    IsUUID,
    Min,
    ValidateNested
} from 'class-validator';

// DTO для отдельного ответа на вопрос анкеты
export class ScreeningResponseDto {
  @ApiProperty({ description: 'ID вопроса' })
  @IsString()
  questionId: string;

  @ApiProperty({ description: 'Ответ на вопрос' })
  response: any; // Может быть строкой, числом, массивом - зависит от типа вопроса

  @ApiProperty({ description: 'Баллы за ответ', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  score?: number;
}

// DTO для создания новой диагностической анкеты
export class CreateDementiaScreeningDto {
  @ApiProperty({ description: 'ID пользователя' })
  @IsUUID()
  userId: string;

  @ApiProperty({ 
    description: 'Ответы на вопросы анкеты',
    type: [ScreeningResponseDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScreeningResponseDto)
  responses: ScreeningResponseDto[];

  @ApiProperty({ 
    description: 'Язык прохождения анкеты',
    enum: Language,
    default: Language.ru
  })
  @IsEnum(Language)
  language: Language = Language.ru;
}

// DTO для результата диагностической анкеты
export class DementiaScreeningResultDto {
  @ApiProperty({ description: 'ID анкеты' })
  id: string;

  @ApiProperty({ description: 'ID пользователя' })
  userId: string;

  @ApiProperty({ description: 'Общий балл анкеты' })
  @IsInt()
  @Min(0)
  totalScore: number;

  @ApiProperty({ 
    description: 'Уровень риска деменции',
    enum: DementiaRiskLevel
  })
  @IsEnum(DementiaRiskLevel)
  riskLevel: DementiaRiskLevel;

  @ApiProperty({ description: 'Рекомендации по результатам', required: false })
  @IsOptional()
  @IsObject()
  recommendations?: Record<string, any>;

  @ApiProperty({ description: 'Дата завершения анкеты' })
  completedAt: Date;

  @ApiProperty({ description: 'Подробные ответы', required: false })
  @IsOptional()
  @IsObject()
  responses?: Record<string, any>;
}

// DTO для получения вопросов анкеты
export class GetScreeningQuestionsDto {
  @ApiProperty({ 
    description: 'Язык вопросов',
    enum: Language,
    default: Language.ru,
    required: false
  })
  @IsOptional()
  @IsEnum(Language)
  language?: Language = Language.ru;
}

// DTO для обновления результатов анкеты (для администраторов)
export class UpdateDementiaScreeningDto {
  @ApiProperty({ description: 'Обновленный общий балл', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalScore?: number;

  @ApiProperty({ 
    description: 'Обновленный уровень риска',
    enum: DementiaRiskLevel,
    required: false
  })
  @IsOptional()
  @IsEnum(DementiaRiskLevel)
  riskLevel?: DementiaRiskLevel;

  @ApiProperty({ description: 'Обновленные рекомендации', required: false })
  @IsOptional()
  @IsObject()
  recommendations?: Record<string, any>;
}

// DTO для статистики диагностических анкет
export class DementiaScreeningStatsDto {
  @ApiProperty({ description: 'Общее количество завершенных анкет' })
  totalScreenings: number;

  @ApiProperty({ description: 'Распределение по уровням риска' })
  riskLevelDistribution: Record<DementiaRiskLevel, number>;

  @ApiProperty({ description: 'Средний балл' })
  averageScore: number;

  @ApiProperty({ description: 'Анкеты за последний месяц' })
  recentScreenings: number;
}