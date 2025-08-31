import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateQuestionnaireDto, QuestionnaireResultDto } from './dto';
import { QuestionnairesService } from './questionnaires.service';

@ApiTags('Questionnaires')
@Controller('questionnaires')
export class QuestionnairesController {
  constructor(private readonly questionnairesService: QuestionnairesService) {}

  @Post()
  @ApiOperation({ summary: 'Создать анкету от бота' })
  @ApiResponse({ 
    status: 201, 
    description: 'Анкета создана успешно',
    type: QuestionnaireResultDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Некорректные данные' 
  })
  async createQuestionnaire(@Body() data: CreateQuestionnaireDto): Promise<QuestionnaireResultDto> {
    return await this.questionnairesService.createQuestionnaire(data);
  }

  @Post('result')
  @ApiOperation({ summary: 'Создать результат анкеты от бота' })
  @ApiResponse({ 
    status: 201, 
    description: 'Результат анкеты создан успешно'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Некорректные данные' 
  })
  async createQuestionnaireResult(@Body() data: any): Promise<any> {
    return await this.questionnairesService.createQuestionnaireResult(data);
  }

  @Get('telegram/:telegramId')
  @ApiOperation({ summary: 'Получить анкету по Telegram ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Анкета найдена'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Анкета не найдена' 
  })
  async getQuestionnaireByTelegramId(@Param('telegramId') telegramId: string): Promise<any> {
    return await this.questionnairesService.getQuestionnaireByTelegramId(parseInt(telegramId));
  }

  @Get('result/telegram/:telegramId')
  @ApiOperation({ summary: 'Получить результат анкеты по Telegram ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Результат анкеты найден'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Результат анкеты не найден' 
  })
  async getQuestionnaireResultByTelegramId(@Param('telegramId') telegramId: string): Promise<any> {
    return await this.questionnairesService.getQuestionnaireResultByTelegramId(parseInt(telegramId));
  }

  @Get()
  @ApiOperation({ summary: 'Получить все анкеты' })
  @ApiResponse({ 
    status: 200, 
    description: 'Список всех анкет'
  })
  async getAllQuestionnaires(): Promise<any[]> {
    return await this.questionnairesService.getAllQuestionnaires();
  }

  @Get('result')
  @ApiOperation({ summary: 'Получить все результаты анкет' })
  @ApiResponse({ 
    status: 200, 
    description: 'Список всех результатов анкет'
  })
  async getAllQuestionnaireResults(): Promise<any[]> {
    return await this.questionnairesService.getAllQuestionnaireResults();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Получить статистику анкет' })
  @ApiResponse({ 
    status: 200, 
    description: 'Статистика получена'
  })
  async getQuestionnaireStats(): Promise<any> {
    return await this.questionnairesService.getQuestionnaireStats();
  }

  @Get('stats/risk-levels')
  @ApiOperation({ summary: 'Получить статистику по уровням риска' })
  @ApiResponse({ 
    status: 200, 
    description: 'Статистика по уровням риска'
  })
  async getRiskLevelStats(): Promise<any> {
    return await this.questionnairesService.getRiskLevelStats();
  }

  @Get('stats/daily')
  @ApiOperation({ summary: 'Получить ежедневную статистику' })
  @ApiResponse({ 
    status: 200, 
    description: 'Ежедневная статистика'
  })
  async getDailyStats(): Promise<any> {
    return await this.questionnairesService.getDailyStats();
  }

  @Delete('telegram/:telegramId')
  @ApiOperation({ summary: 'Удалить тестовые анкеты по Telegram ID' })
  @ApiResponse({ status: 200, description: 'Анкеты удалены' })
  async deleteByTelegram(@Param('telegramId') telegramId: string): Promise<{ deleted: number }> {
    return await this.questionnairesService.deleteQuestionnairesByTelegramId(parseInt(telegramId));
  }

  @Delete('result/telegram/:telegramId')
  @ApiOperation({ summary: 'Удалить тестовые результаты по Telegram ID' })
  @ApiResponse({ status: 200, description: 'Результаты удалены' })
  async deleteResultsByTelegram(@Param('telegramId') telegramId: string): Promise<{ deleted: number }> {
    return await this.questionnairesService.deleteResultsByTelegramId(parseInt(telegramId));
  }
}
