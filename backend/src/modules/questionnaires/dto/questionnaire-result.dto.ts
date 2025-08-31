import { ApiProperty } from '@nestjs/swagger';

export class QuestionnaireResultDto {
  @ApiProperty({ description: 'ID анкеты' })
  id: string;

  @ApiProperty({ description: 'ID пользователя' })
  userId: string;

  @ApiProperty({ description: 'Telegram ID пользователя' })
  telegramId: number;

  @ApiProperty({ description: 'Статус анкеты' })
  status: string;

  @ApiProperty({ description: 'Дата завершения' })
  completedAt: Date;

  @ApiProperty({ description: 'Ответы на вопросы' })
  answers: any;
}
