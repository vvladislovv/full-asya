import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DementiaRiskLevel, DementiaScreening, Language } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
    CreateDementiaScreeningDto,
    DementiaScreeningResultDto,
    DementiaScreeningStatsDto,
    GetScreeningQuestionsDto,
    UpdateDementiaScreeningDto
} from './dto';

@Injectable()
export class DementiaScreeningService {
  constructor(private prisma: PrismaService) {}

  // Получение вопросов анкеты
  async getQuestions(dto: GetScreeningQuestionsDto) {
    const language = dto.language || Language.ru;
    
    // Основные вопросы диагностической анкеты на выявление рисков деменции
    const questions = {
      [Language.ru]: [
        {
          id: 'age',
          type: 'number',
          question: 'Ваш возраст?',
          required: true,
          scoring: {
            '50-59': 0,
            '60-69': 1,
            '70-79': 2,
            '80+': 3
          }
        },
        {
          id: 'memory_complaints',
          type: 'scale',
          question: 'Как часто вы замечаете проблемы с памятью?',
          options: [
            { value: 0, label: 'Никогда' },
            { value: 1, label: 'Редко' },
            { value: 2, label: 'Иногда' },
            { value: 3, label: 'Часто' },
            { value: 4, label: 'Постоянно' }
          ],
          required: true
        },
        {
          id: 'word_finding',
          type: 'scale',
          question: 'Как часто у вас возникают трудности в подборе нужного слова?',
          options: [
            { value: 0, label: 'Никогда' },
            { value: 1, label: 'Редко' },
            { value: 2, label: 'Иногда' },
            { value: 3, label: 'Часто' },
            { value: 4, label: 'Постоянно' }
          ],
          required: true
        },
        {
          id: 'concentration',
          type: 'scale',
          question: 'Как часто у вас возникают проблемы с концентрацией внимания?',
          options: [
            { value: 0, label: 'Никогда' },
            { value: 1, label: 'Редко' },
            { value: 2, label: 'Иногда' },
            { value: 3, label: 'Часто' },
            { value: 4, label: 'Постоянно' }
          ],
          required: true
        },
        {
          id: 'orientation',
          type: 'scale',
          question: 'Как часто вы испытываете затруднения в ориентации (время, место)?',
          options: [
            { value: 0, label: 'Никогда' },
            { value: 1, label: 'Редко' },
            { value: 2, label: 'Иногда' },
            { value: 3, label: 'Часто' },
            { value: 4, label: 'Постоянно' }
          ],
          required: true
        },
        {
          id: 'daily_activities',
          type: 'scale',
          question: 'Как часто у вас возникают трудности в выполнении повседневных дел?',
          options: [
            { value: 0, label: 'Никогда' },
            { value: 1, label: 'Редко' },
            { value: 2, label: 'Иногда' },
            { value: 3, label: 'Часто' },
            { value: 4, label: 'Постоянно' }
          ],
          required: true
        },
        {
          id: 'family_history',
          type: 'boolean',
          question: 'Есть ли в вашей семье случаи деменции или болезни Альцгеймера?',
          scoring: { true: 2, false: 0 },
          required: true
        },
        {
          id: 'education',
          type: 'select',
          question: 'Ваш уровень образования?',
          options: [
            { value: 0, label: 'Высшее образование', score: 0 },
            { value: 1, label: 'Среднее специальное', score: 1 },
            { value: 2, label: 'Среднее общее', score: 2 },
            { value: 3, label: 'Неполное среднее', score: 3 }
          ],
          required: true
        }
      ],
      [Language.en]: [
        {
          id: 'age',
          type: 'number',
          question: 'What is your age?',
          required: true,
          scoring: {
            '50-59': 0,
            '60-69': 1,
            '70-79': 2,
            '80+': 3
          }
        },
        {
          id: 'memory_complaints',
          type: 'scale',
          question: 'How often do you notice memory problems?',
          options: [
            { value: 0, label: 'Never' },
            { value: 1, label: 'Rarely' },
            { value: 2, label: 'Sometimes' },
            { value: 3, label: 'Often' },
            { value: 4, label: 'Always' }
          ],
          required: true
        },
        {
          id: 'word_finding',
          type: 'scale',
          question: 'How often do you have difficulty finding the right word?',
          options: [
            { value: 0, label: 'Never' },
            { value: 1, label: 'Rarely' },
            { value: 2, label: 'Sometimes' },
            { value: 3, label: 'Often' },
            { value: 4, label: 'Always' }
          ],
          required: true
        },
        {
          id: 'concentration',
          type: 'scale',
          question: 'How often do you have problems with concentration?',
          options: [
            { value: 0, label: 'Never' },
            { value: 1, label: 'Rarely' },
            { value: 2, label: 'Sometimes' },
            { value: 3, label: 'Often' },
            { value: 4, label: 'Always' }
          ],
          required: true
        },
        {
          id: 'orientation',
          type: 'scale',
          question: 'How often do you have difficulty with orientation (time, place)?',
          options: [
            { value: 0, label: 'Never' },
            { value: 1, label: 'Rarely' },
            { value: 2, label: 'Sometimes' },
            { value: 3, label: 'Often' },
            { value: 4, label: 'Always' }
          ],
          required: true
        },
        {
          id: 'daily_activities',
          type: 'scale',
          question: 'How often do you have difficulty performing daily activities?',
          options: [
            { value: 0, label: 'Never' },
            { value: 1, label: 'Rarely' },
            { value: 2, label: 'Sometimes' },
            { value: 3, label: 'Often' },
            { value: 4, label: 'Always' }
          ],
          required: true
        },
        {
          id: 'family_history',
          type: 'boolean',
          question: 'Is there a family history of dementia or Alzheimer\'s disease?',
          scoring: { true: 2, false: 0 },
          required: true
        },
        {
          id: 'education',
          type: 'select',
          question: 'What is your education level?',
          options: [
            { value: 0, label: 'Higher education', score: 0 },
            { value: 1, label: 'Vocational education', score: 1 },
            { value: 2, label: 'High school', score: 2 },
            { value: 3, label: 'Less than high school', score: 3 }
          ],
          required: true
        }
      ]
    };

    return {
      questions: questions[language],
      totalQuestions: questions[language].length,
      language
    };
  }

  // Создание новой диагностической анкеты
  async create(createDto: CreateDementiaScreeningDto): Promise<DementiaScreeningResultDto> {
    try {
      // Проверяем существование пользователя
      const user = await this.prisma.user.findUnique({
        where: { id: createDto.userId }
      });

      if (!user) {
        throw new NotFoundException(`Пользователь с ID ${createDto.userId} не найден`);
      }

      // Рассчитываем общий балл
      const { totalScore, riskLevel } = this.calculateScore(createDto.responses);

      // Генерируем рекомендации
      const recommendations = this.generateRecommendations(riskLevel, createDto.language);

      // Сохраняем результаты в базу данных
      const screening = await this.prisma.dementiaScreening.create({
        data: {
          userId: createDto.userId,
          responses: createDto.responses as any,
          totalScore,
          riskLevel,
          recommendations
        }
      });

      // Обновляем профиль пользователя
      await this.prisma.user.update({
        where: { id: createDto.userId },
        data: {
          dementiaRiskLevel: riskLevel,
          hasCompletedDiagnostic: true,
          dementiaQuestionnaire: createDto.responses as any
        }
      });

      return this.mapToResultDto(screening);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Ошибка при создании диагностической анкеты');
    }
  }

  // Получение результатов анкеты пользователя
  async findByUserId(userId: string): Promise<DementiaScreeningResultDto[]> {
    const screenings = await this.prisma.dementiaScreening.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' }
    });

    return screenings.map(screening => this.mapToResultDto(screening));
  }

  // Получение конкретной анкеты по ID
  async findOne(id: string): Promise<DementiaScreeningResultDto> {
    const screening = await this.prisma.dementiaScreening.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!screening) {
      throw new NotFoundException(`Диагностическая анкета с ID ${id} не найдена`);
    }

    return this.mapToResultDto(screening);
  }

  // Обновление результатов анкеты (для администраторов)
  async update(id: string, updateDto: UpdateDementiaScreeningDto): Promise<DementiaScreeningResultDto> {
    const existingScreening = await this.prisma.dementiaScreening.findUnique({
      where: { id }
    });

    if (!existingScreening) {
      throw new NotFoundException(`Диагностическая анкета с ID ${id} не найдена`);
    }

    const screening = await this.prisma.dementiaScreening.update({
      where: { id },
      data: {
        ...updateDto,
        updatedAt: new Date()
      }
    });

    return this.mapToResultDto(screening);
  }

  // Получение статистики
  async getStats(): Promise<DementiaScreeningStatsDto> {
    const [
      totalScreenings,
      riskLevelStats,
      averageScoreResult,
      recentScreenings
    ] = await Promise.all([
      this.prisma.dementiaScreening.count(),
      this.prisma.dementiaScreening.groupBy({
        by: ['riskLevel'],
        _count: { id: true }
      }),
      this.prisma.dementiaScreening.aggregate({
        _avg: { totalScore: true }
      }),
      this.prisma.dementiaScreening.count({
        where: {
          completedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 дней назад
          }
        }
      })
    ]);

    const riskLevelDistribution = riskLevelStats.reduce((acc, stat) => {
      acc[stat.riskLevel] = stat._count.id;
      return acc;
    }, {} as Record<DementiaRiskLevel, number>);

    return {
      totalScreenings,
      riskLevelDistribution,
      averageScore: averageScoreResult._avg.totalScore || 0,
      recentScreenings
    };
  }

  // Приватные методы

  private calculateScore(responses: any[]): { totalScore: number; riskLevel: DementiaRiskLevel } {
    let totalScore = 0;

    for (const response of responses) {
      const { questionId, response: answer } = response;

      switch (questionId) {
        case 'age':
          const age = parseInt(answer);
          if (age >= 80) totalScore += 3;
          else if (age >= 70) totalScore += 2;
          else if (age >= 60) totalScore += 1;
          break;

        case 'memory_complaints':
        case 'word_finding':
        case 'concentration':
        case 'orientation':
        case 'daily_activities':
          totalScore += parseInt(answer) || 0;
          break;

        case 'family_history':
          if (answer === true) totalScore += 2;
          break;

        case 'education':
          totalScore += parseInt(answer) || 0;
          break;
      }
    }

    // Определяем уровень риска на основе общего балла
    let riskLevel: DementiaRiskLevel;
    if (totalScore <= 8) {
      riskLevel = DementiaRiskLevel.low;
    } else if (totalScore <= 16) {
      riskLevel = DementiaRiskLevel.medium;
    } else {
      riskLevel = DementiaRiskLevel.high;
    }

    return { totalScore, riskLevel };
  }

  private generateRecommendations(riskLevel: DementiaRiskLevel, language: Language): Record<string, any> {
    const recommendations = {
      [Language.ru]: {
        [DementiaRiskLevel.low]: {
          title: 'Низкий риск деменции',
          description: 'Ваши результаты показывают низкий риск развития деменции.',
          actions: [
            'Продолжайте вести активный образ жизни',
            'Регулярно занимайтесь физическими упражнениями',
            'Поддерживайте социальные связи',
            'Выполняйте когнитивные упражнения'
          ],
          nextSteps: 'Рекомендуем проходить когнитивные тесты для поддержания умственной активности.'
        },
        [DementiaRiskLevel.medium]: {
          title: 'Средний риск деменции',
          description: 'Ваши результаты показывают умеренный риск развития деменции.',
          actions: [
            'Обратитесь к врачу для консультации',
            'Регулярно выполняйте когнитивные тесты',
            'Поддерживайте здоровый образ жизни',
            'Следите за артериальным давлением'
          ],
          nextSteps: 'Рекомендуем пройти когнитивные тесты и записаться на консультацию к специалисту.'
        },
        [DementiaRiskLevel.high]: {
          title: 'Высокий риск деменции',
          description: 'Ваши результаты показывают повышенный риск развития деменции.',
          actions: [
            'Обязательно обратитесь к врачу',
            'Пройдите комплексное обследование',
            'Регулярно выполняйте когнитивные тесты',
            'Рассмотрите профилактические меры'
          ],
          nextSteps: 'Настоятельно рекомендуем записаться на консультацию к специалисту для дальнейшего обследования.'
        }
      },
      [Language.en]: {
        [DementiaRiskLevel.low]: {
          title: 'Low dementia risk',
          description: 'Your results show a low risk of developing dementia.',
          actions: [
            'Continue leading an active lifestyle',
            'Exercise regularly',
            'Maintain social connections',
            'Perform cognitive exercises'
          ],
          nextSteps: 'We recommend taking cognitive tests to maintain mental activity.'
        },
        [DementiaRiskLevel.medium]: {
          title: 'Medium dementia risk',
          description: 'Your results show a moderate risk of developing dementia.',
          actions: [
            'Consult a doctor',
            'Regularly perform cognitive tests',
            'Maintain a healthy lifestyle',
            'Monitor blood pressure'
          ],
          nextSteps: 'We recommend taking cognitive tests and scheduling a consultation with a specialist.'
        },
        [DementiaRiskLevel.high]: {
          title: 'High dementia risk',
          description: 'Your results show an increased risk of developing dementia.',
          actions: [
            'Definitely consult a doctor',
            'Undergo comprehensive examination',
            'Regularly perform cognitive tests',
            'Consider preventive measures'
          ],
          nextSteps: 'We strongly recommend scheduling a consultation with a specialist for further examination.'
        }
      }
    };

    return recommendations[language][riskLevel];
  }

  private mapToResultDto(screening: DementiaScreening): DementiaScreeningResultDto {
    return {
      id: screening.id,
      userId: screening.userId,
      totalScore: screening.totalScore,
      riskLevel: screening.riskLevel,
      recommendations: screening.recommendations as Record<string, any>,
      completedAt: screening.completedAt,
      responses: screening.responses as Record<string, any>
    };
  }
}