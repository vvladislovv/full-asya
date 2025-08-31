import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateQuestionnaireDto {
  @ApiProperty({ description: 'Telegram ID пользователя' })
  @IsNumber()
  telegram_id: number;

  @ApiProperty({ description: 'Имя пользователя', required: false })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiProperty({ description: 'Фамилия пользователя', required: false })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiProperty({ description: 'Ответы на вопросы анкеты' })
  @IsObject()
  answers: Record<string, any>;
}
