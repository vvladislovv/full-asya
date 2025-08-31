import { ApiProperty } from '@nestjs/swagger';
import { TestResultLevel, TestType } from '@prisma/client';
import {
    IsArray,
    IsEnum,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    Max,
    Min
} from 'class-validator';

// DTO для расчета результата теста
export class CalculateTestScoreDto {
  @ApiProperty({ enum: TestType, description: 'Тип теста' })
  @IsEnum(TestType)
  testType: TestType;

  @ApiProperty({ description: 'Ответы пользователя' })
  @IsObject()
  answers: Record<string, any>;

  @ApiProperty({ description: 'Время выполнения теста в секундах', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  timeSpent?: number;

  @ApiProperty({ description: 'Возраст пользователя для нормализации', required: false })
  @IsOptional()
  @IsNumber()
  @Min(18)
  @Max(120)
  userAge?: number;

  @ApiProperty({ description: 'Максимальный балл за тест', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxScore?: number;

  @ApiProperty({ description: 'Дополнительные параметры теста', required: false })
  @IsOptional()
  @IsObject()
  testConfiguration?: Record<string, any>;
}

// DTO для результата расчета
export class TestScoreResultDto {
  @ApiProperty({ description: 'Сырой балл' })
  rawScore: number;

  @ApiProperty({ description: 'Балл в процентах' })
  percentage: number;

  @ApiProperty({ description: 'Нормализованный балл с учетом возраста' })
  normalizedScore: number;

  @ApiProperty({ enum: TestResultLevel, description: 'Уровень результата' })
  resultLevel: TestResultLevel;

  @ApiProperty({ description: 'Цветовой код результата' })
  colorCode: string;

  @ApiProperty({ description: 'Название цвета' })
  colorName: string;

  @ApiProperty({ description: 'Детальный анализ по компонентам' })
  detailedAnalysis: Record<string, any>;

  @ApiProperty({ description: 'Рекомендации по результатам' })
  recommendations: string[];

  @ApiProperty({ description: 'Сравнение с нормативными данными' })
  normativeComparison: Record<string, any>;

  @ApiProperty({ description: 'Статистика выполнения' })
  performanceStats: {
    correct: number;
    incorrect: number;
    total: number;
    accuracy: number;
    avgResponseTime?: number;
  };
}

// DTO для нормативных данных
export class TestNormativeDataDto {
  @ApiProperty({ enum: TestType, description: 'Тип теста' })
  @IsEnum(TestType)
  testType: TestType;

  @ApiProperty({ description: 'Возрастные группы' })
  @IsArray()
  ageGroups: AgeGroupNorm[];

  @ApiProperty({ description: 'Общие пороговые значения' })
  thresholds: {
    high: number;      // >= 80%
    medium: number;    // >= 60%
    low: number;       // < 60%
  };
}

// Нормативные данные по возрастным группам
export interface AgeGroupNorm {
  ageMin: number;
  ageMax: number;
  mean: number;
  standardDeviation: number;
  percentiles: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
}

// DTO для анализа тренда результатов
export class TestTrendAnalysisDto {
  @ApiProperty({ description: 'ID пользователя' })
  @IsString()
  userId: string;

  @ApiProperty({ enum: TestType, description: 'Тип теста', required: false })
  @IsOptional()
  @IsEnum(TestType)
  testType?: TestType;

  @ApiProperty({ description: 'Количество последних результатов для анализа', default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(3)
  @Max(50)
  limitResults?: number = 10;
}

// DTO для результата анализа тренда
export class TestTrendResultDto {
  @ApiProperty({ description: 'Тренд изменения результатов' })
  trend: 'improving' | 'stable' | 'declining' | 'insufficient_data';

  @ApiProperty({ description: 'Процент изменения' })
  changePercentage: number;

  @ApiProperty({ description: 'Средний балл за период' })
  averageScore: number;

  @ApiProperty({ description: 'Лучший результат' })
  bestScore: number;

  @ApiProperty({ description: 'Худший результат' })
  worstScore: number;

  @ApiProperty({ description: 'Данные для графика' })
  chartData: {
    dates: string[];
    scores: number[];
    levels: TestResultLevel[];
  };

  @ApiProperty({ description: 'Анализ по типам тестов' })
  testTypeBreakdown?: Record<TestType, {
    averageScore: number;
    trend: string;
    lastScore: number;
  }>;
}

// DTO для сравнения результатов
export class CompareTestResultsDto {
  @ApiProperty({ description: 'Результаты для сравнения' })
  @IsArray()
  resultIds: string[];

  @ApiProperty({ description: 'Включить нормативное сравнение', default: true })
  @IsOptional()
  includeNormative?: boolean = true;

  @ApiProperty({ description: 'Включить возрастные корректировки', default: true })
  @IsOptional()
  includeAgeAdjustment?: boolean = true;
}