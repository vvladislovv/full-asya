import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuestionnaireDto, QuestionnaireResultDto } from './dto';

@Injectable()
export class QuestionnairesService {
  private readonly logger = new Logger(QuestionnairesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createQuestionnaire(data: CreateQuestionnaireDto): Promise<QuestionnaireResultDto> {
    this.logger.log(`Creating questionnaire for telegram_id: ${data.telegram_id}`);

    try {
      // Создаем или находим пользователя по telegram_id
      let user = await this.prisma.user.findFirst({
        where: { telegramId: data.telegram_id.toString() }
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            telegramId: data.telegram_id.toString(),
            firstName: data.first_name || 'Telegram User',
            lastName: data.last_name || '',
            isActive: true,
          }
        });
        this.logger.log(`Created new user for telegram_id: ${data.telegram_id}`);
      }

      // Создаем запись анкеты
      const questionnaire = await this.prisma.questionnaire.create({
        data: {
          userId: user.id,
          telegramId: data.telegram_id,
          answers: data.answers,
          status: 'COMPLETED',
          completedAt: new Date(),
        }
      });

      this.logger.log(`Questionnaire created with ID: ${questionnaire.id}`);

      return {
        id: questionnaire.id,
        userId: user.id,
        telegramId: data.telegram_id,
        status: questionnaire.status,
        completedAt: questionnaire.completedAt,
        answers: questionnaire.answers,
      };
    } catch (error) {
      this.logger.error(`Error creating questionnaire: ${error.message}`);
      throw error;
    }
  }

  async createQuestionnaireResult(data: any): Promise<any> {
    this.logger.log(`Creating questionnaire result for telegram_id: ${data.telegram_id}`);

    try {
      // Находим пользователя
      const user = await this.prisma.user.findFirst({
        where: { telegramId: data.telegram_id.toString() }
      });

      if (!user) {
        throw new Error(`User not found for telegram_id: ${data.telegram_id}`);
      }

      // Создаем результат анкеты
      const result = await this.prisma.questionnaireResult.create({
        data: {
          userId: user.id,
          telegramId: data.telegram_id,
          riskLevel: data.risk_level,
          score: data.score,
          recommendations: data.recommendations,
          completedAt: new Date(),
        }
      });

      this.logger.log(`Questionnaire result created with ID: ${result.id}`);

      return {
        id: result.id,
        userId: user.id,
        telegramId: data.telegram_id,
        riskLevel: result.riskLevel,
        score: result.score,
        recommendations: result.recommendations,
        completedAt: result.completedAt,
      };
    } catch (error) {
      this.logger.error(`Error creating questionnaire result: ${error.message}`);
      throw error;
    }
  }

  async getQuestionnaireByTelegramId(telegramId: number): Promise<any> {
    return await this.prisma.questionnaire.findFirst({
      where: { telegramId },
      include: {
        user: true,
        result: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getQuestionnaireResultByTelegramId(telegramId: number): Promise<any> {
    return await this.prisma.questionnaireResult.findFirst({
      where: { telegramId },
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAllQuestionnaires(): Promise<any[]> {
    return await this.prisma.questionnaire.findMany({
      include: {
        user: true,
        result: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAllQuestionnaireResults(): Promise<any[]> {
    return await this.prisma.questionnaireResult.findMany({
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getQuestionnaireStats(): Promise<any> {
    const totalQuestionnaires = await this.prisma.questionnaire.count();
    const totalResults = await this.prisma.questionnaireResult.count();
    const completedQuestionnaires = await this.prisma.questionnaire.count({
      where: { status: 'COMPLETED' }
    });

    const averageScore = await this.prisma.questionnaireResult.aggregate({
      _avg: {
        score: true
      }
    });

    return {
      totalQuestionnaires,
      totalResults,
      completedQuestionnaires,
      averageScore: averageScore._avg.score || 0,
      completionRate: totalQuestionnaires > 0 ? (completedQuestionnaires / totalQuestionnaires) * 100 : 0
    };
  }

  async getRiskLevelStats(): Promise<any> {
    const riskLevels = await this.prisma.questionnaireResult.groupBy({
      by: ['riskLevel'],
      _count: {
        id: true
      },
      _avg: {
        score: true
      }
    });

    return riskLevels.map(level => ({
      riskLevel: level.riskLevel,
      count: level._count.id,
      averageScore: level._avg.score || 0
    }));
  }

  async getDailyStats(): Promise<any> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const dailyQuestionnaires = await this.prisma.questionnaire.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    });

    const dailyResults = await this.prisma.questionnaireResult.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    });

    const weeklyQuestionnaires = await this.prisma.questionnaire.count({
      where: {
        createdAt: {
          gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    return {
      today: {
        questionnaires: dailyQuestionnaires,
        results: dailyResults
      },
      weekly: {
        questionnaires: weeklyQuestionnaires
      }
    };
  }

  async deleteQuestionnairesByTelegramId(telegramId: number): Promise<{ deleted: number }> {
    const res = await this.prisma.questionnaire.deleteMany({ where: { telegramId } });
    return { deleted: res.count };
  }

  async deleteResultsByTelegramId(telegramId: number): Promise<{ deleted: number }> {
    const res = await this.prisma.questionnaireResult.deleteMany({ where: { telegramId } });
    return { deleted: res.count };
  }

  async create(data: any): Promise<any> {
    this.logger.log(`Creating questionnaire for telegram_id: ${data.telegramId}`);
    
    try {
      // Создаем или находим пользователя по telegram_id
      let user = await this.prisma.user.findFirst({
        where: { telegramId: data.telegramId.toString() }
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            telegramId: data.telegramId.toString(),
            firstName: data.firstName || 'Telegram User',
            lastName: data.lastName || '',
            isActive: true,
          }
        });
        this.logger.log(`Created new user for telegram_id: ${data.telegramId}`);
      }

      // Создаем запись анкеты
      const questionnaire = await this.prisma.questionnaire.create({
        data: {
          userId: user.id,
          telegramId: data.telegramId,
          answers: data.answers,
          status: 'COMPLETED',
          completedAt: data.completedAt || new Date(),
        }
      });

      this.logger.log(`Questionnaire created with ID: ${questionnaire.id}`);
      return questionnaire;
    } catch (error) {
      this.logger.error(`Error creating questionnaire: ${error.message}`, error.stack);
      throw error;
    }
  }

  async createResult(data: any): Promise<any> {
    this.logger.log(`Creating questionnaire result for telegram_id: ${data.telegramId}`);
    
    try {
      // Создаем или находим пользователя по telegram_id
      let user = await this.prisma.user.findFirst({
        where: { telegramId: data.telegramId.toString() }
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            telegramId: data.telegramId.toString(),
            firstName: 'Telegram User',
            lastName: '',
            isActive: true,
          }
        });
        this.logger.log(`Created new user for telegram_id: ${data.telegramId}`);
      }

      // Создаем запись результата анкеты
      const result = await this.prisma.questionnaireResult.create({
        data: {
          userId: user.id,
          telegramId: data.telegramId,
          riskLevel: data.riskLevel,
          score: data.score,
          recommendations: data.recommendations,
          completedAt: data.completedAt || new Date(),
        }
      });

      this.logger.log(`Questionnaire result created with ID: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error creating questionnaire result: ${error.message}`, error.stack);
      throw error;
    }
  }
}
