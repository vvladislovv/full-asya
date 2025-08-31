import { ApiProperty } from '@nestjs/swagger';
import { Language, TestType } from '@prisma/client';
import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsObject,
    IsOptional,
    Max,
    Min
} from 'class-validator';

// DTO для создания этапа теста
export class CreateTestStageDto {
  @ApiProperty({ enum: TestType, description: 'Тип теста' })
  @IsEnum(TestType)
  testType: TestType;

  @ApiProperty({ description: 'Номер этапа (1-5)', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  stage: number;

  @ApiProperty({ description: 'Мультиязычные заголовки этапа' })
  @IsObject()
  title: Record<Language, string>;

  @ApiProperty({ description: 'Мультиязычный контент этапа' })
  @IsObject()
  content: Record<Language, any>;

  @ApiProperty({ description: 'Конфигурация этапа', required: false })
  @IsOptional()
  @IsObject()
  configuration?: Record<string, any>;

  @ApiProperty({ description: 'Порядковый индекс', required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;
}

// DTO для обновления этапа теста
export class UpdateTestStageDto {
  @ApiProperty({ description: 'Мультиязычные заголовки этапа', required: false })
  @IsOptional()
  @IsObject()
  title?: Record<Language, string>;

  @ApiProperty({ description: 'Мультиязычный контент этапа', required: false })
  @IsOptional()
  @IsObject()
  content?: Record<Language, any>;

  @ApiProperty({ description: 'Конфигурация этапа', required: false })
  @IsOptional()
  @IsObject()
  configuration?: Record<string, any>;

  @ApiProperty({ description: 'Активность этапа', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Порядковый индекс', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;
}

// DTO для получения этапов теста
export class GetTestStagesDto {
  @ApiProperty({ 
    enum: TestType, 
    description: 'Тип теста',
    required: false 
  })
  @IsOptional()
  @IsEnum(TestType)
  testType?: TestType;

  @ApiProperty({ 
    enum: Language, 
    description: 'Язык контента',
    default: Language.ru,
    required: false 
  })
  @IsOptional()
  @IsEnum(Language)
  language?: Language = Language.ru;

  @ApiProperty({ 
    description: 'Номер этапа (1-5)', 
    minimum: 1, 
    maximum: 5,
    required: false 
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  stage?: number;
}

// DTO для результата этапа теста
export class TestStageResultDto {
  @ApiProperty({ description: 'ID этапа' })
  id: string;

  @ApiProperty({ enum: TestType, description: 'Тип теста' })
  testType: TestType;

  @ApiProperty({ description: 'Номер этапа' })
  stage: number;

  @ApiProperty({ description: 'Заголовок на выбранном языке' })
  title: string;

  @ApiProperty({ description: 'Контент на выбранном языке' })
  content: any;

  @ApiProperty({ description: 'Конфигурация этапа', required: false })
  configuration?: Record<string, any>;

  @ApiProperty({ description: 'Активность этапа' })
  isActive: boolean;

  @ApiProperty({ description: 'Порядковый индекс' })
  orderIndex: number;

  @ApiProperty({ description: 'Дата создания' })
  createdAt: Date;

  @ApiProperty({ description: 'Дата обновления' })
  updatedAt: Date;
}

// DTO для полного набора этапов теста
export class TestStagesSetDto {
  @ApiProperty({ enum: TestType, description: 'Тип теста' })
  testType: TestType;

  @ApiProperty({ enum: Language, description: 'Язык контента' })
  language: Language;

  @ApiProperty({ 
    description: 'Этапы теста (1-5)',
    type: [TestStageResultDto]
  })
  stages: TestStageResultDto[];

  @ApiProperty({ description: 'Общее количество этапов' })
  totalStages: number;

  @ApiProperty({ description: 'Активные этапы' })
  activeStages: number;
}

// Enum для названий этапов
export enum StageNames {
  DESCRIPTION = 1,    // Описание теста
  INSTRUCTION = 2,    // Инструкция
  PRACTICE = 3,       // Тренировочный тест
  MAIN_TEST = 4,      // Основной тест
  RESULT = 5          // Результат
}

// DTO для инициализации стандартных этапов всех тестов
export class InitializeStagesDto {
  @ApiProperty({ 
    enum: Language, 
    description: 'Язык по умолчанию',
    default: Language.ru
  })
  @IsEnum(Language)
  defaultLanguage: Language = Language.ru;

  @ApiProperty({ 
    description: 'Перезаписать существующие этапы',
    default: false
  })
  @IsBoolean()
  overwrite: boolean = false;
}