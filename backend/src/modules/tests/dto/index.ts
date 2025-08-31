import { ApiProperty } from '@nestjs/swagger';
import { TestDifficulty, TestType } from '@prisma/client';
import { IsArray, IsEnum, IsNumber, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTestDto {
  @ApiProperty({ enum: TestType })
  @IsEnum(TestType)
  type: TestType;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  instruction: string;

  @ApiProperty({ enum: TestDifficulty })
  @IsEnum(TestDifficulty)
  difficulty: TestDifficulty;

  @ApiProperty()
  @IsObject()
  configuration: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  orderIndex?: number;
}

export class UpdateTestDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  instruction?: string;

  @ApiProperty({ enum: TestDifficulty, required: false })
  @IsOptional()
  @IsEnum(TestDifficulty)
  difficulty?: TestDifficulty;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  configuration?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  orderIndex?: number;
}

export class StartTestDto {
  @ApiProperty()
  @IsUUID()
  testId: string;
}

export class SubmitTestResultDto {
  @ApiProperty()
  @IsUUID()
  resultId: string;

  @ApiProperty()
  @IsObject()
  answers: Record<string, any>;

  @ApiProperty()
  @IsNumber()
  timeSpent: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxScore?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  emotionalState?: Record<string, any>;
}

export class TestQuestionDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  question: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  options?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  correctAnswer?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  timeLimit?: number;
} 