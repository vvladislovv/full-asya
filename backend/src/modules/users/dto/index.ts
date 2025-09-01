import { ApiProperty } from '@nestjs/swagger';
import { DementiaRiskLevel, Language } from '@prisma/client';
import { IsBoolean, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  telegramId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ required: false, default: 'en', enum: Language })
  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  hasCompletedDiagnostic?: boolean;

  @ApiProperty({ required: false, enum: DementiaRiskLevel })
  @IsOptional()
  @IsEnum(DementiaRiskLevel)
  dementiaRiskLevel?: DementiaRiskLevel;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  dementiaQuestionnaire?: Record<string, any>;
}

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ required: false, enum: Language })
  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  hasCompletedDiagnostic?: boolean;

  @ApiProperty({ required: false, enum: DementiaRiskLevel })
  @IsOptional()
  @IsEnum(DementiaRiskLevel)
  dementiaRiskLevel?: DementiaRiskLevel;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  dementiaQuestionnaire?: Record<string, any>;
}

export class UpdateLanguageDto {
  @ApiProperty({ enum: Language })
  @IsEnum(Language)
  language: Language;
}