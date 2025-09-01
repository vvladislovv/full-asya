import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QuestionnairesService } from '../questionnaires/questionnaires.service';
import { TelegramWebhookDto } from './dto/telegram-webhook.dto';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly questionnairesService: QuestionnairesService,
  ) {}

  async processWebhook(webhookData: TelegramWebhookDto) {
    this.logger.log(`Processing webhook for update ID: ${webhookData.update_id}`);
    
    // Обрабатываем различные типы обновлений
    if (webhookData.message) {
      await this.handleMessage(webhookData.message);
    } else if (webhookData.callback_query) {
      await this.handleCallbackQuery(webhookData.callback_query);
    }
  }

  private async handleMessage(message: any) {
    this.logger.log(`Handling message from user ${message.from.id}: ${message.text}`);
    
    // Здесь можно добавить логику обработки сообщений
    // Например, сохранение в базу данных или отправка уведомлений
  }

  private async handleCallbackQuery(callbackQuery: any) {
    this.logger.log(`Handling callback query from user ${callbackQuery.from.id}: ${callbackQuery.data}`);
    
    // Здесь можно добавить логику обработки callback query
  }

  async saveQuestionnaireData(questionnaireData: any) {
    this.logger.log(`Saving questionnaire data for user ${questionnaireData.telegram_id}`);
    
    try {
      // Создаем или обновляем пользователя
      const user = await this.prisma.user.upsert({
        where: { telegramId: questionnaireData.telegram_id.toString() },
        update: {
          firstName: questionnaireData.first_name,
          lastName: questionnaireData.last_name,
        },
        create: {
          telegramId: questionnaireData.telegram_id.toString(),
          username: questionnaireData.username || null,
          firstName: questionnaireData.first_name,
          lastName: questionnaireData.last_name || null,
        },
      });

      // Сохраняем данные анкеты
      const questionnaire = await this.questionnairesService.create({
        userId: user.id,
        telegramId: questionnaireData.telegram_id,
        answers: questionnaireData.answers,
        completedAt: new Date(),
      });

      this.logger.log(`Questionnaire saved with ID: ${questionnaire.id}`);
      return questionnaire;
    } catch (error) {
      this.logger.error(`Error saving questionnaire data: ${error.message}`, error.stack);
      throw error;
    }
  }

  async saveQuestionnaireResult(resultData: any) {
    this.logger.log(`Saving questionnaire result for user ${resultData.telegram_id}`);
    
    try {
      // Находим пользователя
      const user = await this.prisma.user.findUnique({
        where: { telegramId: resultData.telegram_id.toString() },
      });

      if (!user) {
        throw new Error(`User with telegram ID ${resultData.telegram_id} not found`);
      }

      // Сохраняем результат анкеты
      const result = await this.questionnairesService.createResult({
        userId: user.id,
        telegramId: resultData.telegram_id,
        riskLevel: resultData.risk_level,
        score: resultData.score,
        recommendations: resultData.recommendations,
        completedAt: new Date(),
      });

      this.logger.log(`Questionnaire result saved with ID: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error saving questionnaire result: ${error.message}`, error.stack);
      throw error;
    }
  }
}
