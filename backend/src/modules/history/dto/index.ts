import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TestType } from '@prisma/client';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetHistoryDto {
  @ApiPropertyOptional({
    description: 'Тип теста для фильтрации',
    enum: TestType,
  })
  @IsOptional()
  @IsEnum(TestType)
  testType?: TestType;

  @ApiPropertyOptional({
    description: 'Дата начала периода',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Дата окончания периода',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Количество записей',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Смещение для пагинации',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  offset?: number;
}

export class GetHistoryStatsDto {
  @ApiPropertyOptional({
    description: 'Тип теста для статистики',
    enum: TestType,
  })
  @IsOptional()
  @IsEnum(TestType)
  testType?: TestType;

  @ApiPropertyOptional({
    description: 'Период для статистики',
    enum: ['week', 'month', 'year', 'all'],
    example: 'month',
    default: 'month',
  })
  @IsOptional()
  @IsEnum(['week', 'month', 'year', 'all'])
  period?: 'week' | 'month' | 'year' | 'all';
}

export class GetTestResultDto {
  @ApiProperty({
    description: 'ID результата теста',
    example: 'uuid-string',
  })
  @IsString()
  id: string;
}