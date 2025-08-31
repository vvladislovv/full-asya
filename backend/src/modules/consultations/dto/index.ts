import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConsultationStatus, ConsultationType } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateConsultationDto {
  @ApiProperty({
    description: 'Тип консультации',
    enum: ConsultationType,
    example: ConsultationType.online,
  })
  @IsEnum(ConsultationType)
  type: ConsultationType;

  @ApiProperty({
    description: 'Запланированное время консультации',
    example: '2024-12-01T10:00:00.000Z',
  })
  @IsDateString()
  scheduledAt: string;

  @ApiPropertyOptional({
    description: 'Заметки к консультации',
    example: 'Обсуждение результатов тестирования',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Местоположение для офлайн консультации',
    example: 'Клиника на ул. Пушкина, 15',
  })
  @IsOptional()
  @IsString()
  location?: string;
}

export class UpdateConsultationDto {
  @ApiPropertyOptional({
    description: 'Тип консультации',
    enum: ConsultationType,
  })
  @IsOptional()
  @IsEnum(ConsultationType)
  type?: ConsultationType;

  @ApiPropertyOptional({
    description: 'Статус консультации',
    enum: ConsultationStatus,
  })
  @IsOptional()
  @IsEnum(ConsultationStatus)
  status?: ConsultationStatus;

  @ApiPropertyOptional({
    description: 'Запланированное время консультации',
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({
    description: 'Заметки к консультации',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Заметки врача',
  })
  @IsOptional()
  @IsString()
  doctorNotes?: string;

  @ApiPropertyOptional({
    description: 'Ссылка на онлайн встречу',
    example: 'https://meet.google.com/abc-defg-hij',
  })
  @IsOptional()
  @IsUrl()
  meetingLink?: string;

  @ApiPropertyOptional({
    description: 'Местоположение для офлайн консультации',
  })
  @IsOptional()
  @IsString()
  location?: string;
}