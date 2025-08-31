import { Injectable, NotFoundException } from '@nestjs/common';
import { Language } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
    CreateEmotionalAssessmentDto,
    EmotionalAssessmentResultDto,
    EmotionalResponseDto
} from './dto';

@Injectable()
export class EmotionalStateService {
  constructor(private prisma: PrismaService) {}
  async getEmotionalStateQuestions(language: Language = Language.ru): Promise<any> {
    const questions = {
      [Language.ru]: [
        {
          id: 'es_1',
          type: 'mood',
          question: 'Как вы себя чувствуете сейчас?',
          options: [
            { value: 'excellent', label: 'Отлично', emoji: '😊', score: 5 },
            { value: 'good', label: 'Хорошо', emoji: '🙂', score: 4 },
            { value: 'neutral', label: 'Нормально', emoji: '😐', score: 3 },
            { value: 'bad', label: 'Плохо', emoji: '😔', score: 2 },
            { value: 'terrible', label: 'Очень плохо', emoji: '😢', score: 1 },
          ],
        },
        {
          id: 'es_2',
          type: 'energy',
          question: 'Какой у вас уровень энергии?',
          options: [
            { value: 'high', label: 'Высокий', emoji: '⚡', score: 5 },
            { value: 'medium', label: 'Средний', emoji: '🔋', score: 3 },
            { value: 'low', label: 'Низкий', emoji: '😴', score: 1 },
          ],
        },
        {
          id: 'es_3',
          type: 'stress',
          question: 'Насколько вы сейчас напряжены?',
          options: [
            { value: 'none', label: 'Не напряжен', emoji: '😌', score: 5 },
            { value: 'low', label: 'Слегка напряжен', emoji: '😐', score: 4 },
            { value: 'medium', label: 'Умеренно напряжен', emoji: '😰', score: 2 },
            { value: 'high', label: 'Сильно напряжен', emoji: '😱', score: 1 },
          ],
        },
        {
          id: 'es_4',
          type: 'focus',
          question: 'Насколько хорошо вы можете сосредоточиться?',
          options: [
            { value: 'excellent', label: 'Отлично', emoji: '🎯', score: 5 },
            { value: 'good', label: 'Хорошо', emoji: '👁️', score: 4 },
            { value: 'fair', label: 'Удовлетворительно', emoji: '👀', score: 3 },
            { value: 'poor', label: 'Плохо', emoji: '😵', score: 1 },
          ],
        },
        {
          id: 'es_5',
          type: 'motivation',
          question: 'Насколько вы мотивированы выполнять задания?',
          options: [
            { value: 'high', label: 'Высокая мотивация', emoji: '🚀', score: 5 },
            { value: 'medium', label: 'Средняя мотивация', emoji: '💪', score: 4 },
            { value: 'low', label: 'Низкая мотивация', emoji: '😕', score: 2 },
            { value: 'none', label: 'Нет мотивации', emoji: '😞', score: 1 },
          ],
        },
        {
          id: 'es_6',
          type: 'anxiety',
          question: 'Чувствуете ли вы тревогу?',
          options: [
            { value: 'none', label: 'Совсем нет', emoji: '😊', score: 5 },
            { value: 'slight', label: 'Немного', emoji: '😐', score: 4 },
            { value: 'moderate', label: 'Умеренно', emoji: '😟', score: 2 },
            { value: 'high', label: 'Сильно', emoji: '😰', score: 1 },
          ],
        },
        {
          id: 'es_7',
          type: 'confidence',
          question: 'Насколько вы уверены в своих способностях?',
          options: [
            { value: 'very_confident', label: 'Очень уверен', emoji: '💪', score: 5 },
            { value: 'confident', label: 'Уверен', emoji: '👍', score: 4 },
            { value: 'neutral', label: 'Нейтрально', emoji: '🤷', score: 3 },
            { value: 'unsure', label: 'Не уверен', emoji: '😕', score: 2 },
            { value: 'very_unsure', label: 'Очень не уверен', emoji: '😰', score: 1 },
          ],
        },
      ],
      [Language.en]: [
        {
          id: 'es_1',
          type: 'mood',
          question: 'How are you feeling right now?',
          options: [
            { value: 'excellent', label: 'Excellent', emoji: '😊', score: 5 },
            { value: 'good', label: 'Good', emoji: '🙂', score: 4 },
            { value: 'neutral', label: 'Neutral', emoji: '😐', score: 3 },
            { value: 'bad', label: 'Bad', emoji: '😔', score: 2 },
            { value: 'terrible', label: 'Terrible', emoji: '😢', score: 1 },
          ],
        },
        {
          id: 'es_2',
          type: 'energy',
          question: 'What is your energy level?',
          options: [
            { value: 'high', label: 'High', emoji: '⚡', score: 5 },
            { value: 'medium', label: 'Medium', emoji: '🔋', score: 3 },
            { value: 'low', label: 'Low', emoji: '😴', score: 1 },
          ],
        },
        {
          id: 'es_3',
          type: 'stress',
          question: 'How stressed are you right now?',
          options: [
            { value: 'none', label: 'Not stressed', emoji: '😌', score: 5 },
            { value: 'low', label: 'Slightly stressed', emoji: '😐', score: 4 },
            { value: 'medium', label: 'Moderately stressed', emoji: '😰', score: 2 },
            { value: 'high', label: 'Very stressed', emoji: '😱', score: 1 },
          ],
        },
        {
          id: 'es_4',
          type: 'focus',
          question: 'How well can you concentrate?',
          options: [
            { value: 'excellent', label: 'Excellent', emoji: '🎯', score: 5 },
            { value: 'good', label: 'Good', emoji: '👁️', score: 4 },
            { value: 'fair', label: 'Fair', emoji: '👀', score: 3 },
            { value: 'poor', label: 'Poor', emoji: '😵', score: 1 },
          ],
        },
        {
          id: 'es_5',
          type: 'motivation',
          question: 'How motivated are you to perform tasks?',
          options: [
            { value: 'high', label: 'High motivation', emoji: '🚀', score: 5 },
            { value: 'medium', label: 'Medium motivation', emoji: '💪', score: 4 },
            { value: 'low', label: 'Low motivation', emoji: '😕', score: 2 },
            { value: 'none', label: 'No motivation', emoji: '😞', score: 1 },
          ],
        },
        {
          id: 'es_6',
          type: 'anxiety',
          question: 'Do you feel anxious?',
          options: [
            { value: 'none', label: 'Not at all', emoji: '😊', score: 5 },
            { value: 'slight', label: 'A little', emoji: '😐', score: 4 },
            { value: 'moderate', label: 'Moderately', emoji: '😟', score: 2 },
            { value: 'high', label: 'Very much', emoji: '😰', score: 1 },
          ],
        },
        {
          id: 'es_7',
          type: 'confidence',
          question: 'How confident are you in your abilities?',
          options: [
            { value: 'very_confident', label: 'Very confident', emoji: '💪', score: 5 },
            { value: 'confident', label: 'Confident', emoji: '👍', score: 4 },
            { value: 'neutral', label: 'Neutral', emoji: '🤷', score: 3 },
            { value: 'unsure', label: 'Unsure', emoji: '😕', score: 2 },
            { value: 'very_unsure', label: 'Very unsure', emoji: '😰', score: 1 },
          ],
        },
      ]
    };

    return {
      questions: questions[language] || questions[Language.ru],
      totalQuestions: questions[language]?.length || 0,
      language
    };
  }

  // Создание новой эмоциональной оценки
  async createAssessment(dto: CreateEmotionalAssessmentDto): Promise<EmotionalAssessmentResultDto> {
    try {
      // Проверяем существование пользователя
      const user = await this.prisma.user.findUnique({
        where: { id: dto.userId }
      });

      if (!user) {
        throw new NotFoundException(`Пользователь с ID ${dto.userId} не найден`);
      }

      // Если указан testResultId, проверяем его существование
      if (dto.testResultId) {
        const testResult = await this.prisma.testResult.findUnique({
          where: { id: dto.testResultId }
        });

        if (!testResult) {
          throw new NotFoundException(`Результат теста с ID ${dto.testResultId} не найден`);
        }

        // Проверяем что результат принадлежит пользователю
        if (testResult.userId !== dto.userId) {
          throw new NotFoundException('Результат теста не принадлежит указанному пользователю');
        }
      }

      // Рассчитываем оценки
      const analysis = this.analyzeEmotionalResponses(dto.responses, dto.language || Language.ru);

      // Сохраняем в базу данных
      const assessment = await this.prisma.emotionalAssessment.create({
        data: {
          userId: dto.userId,
          testResultId: dto.testResultId,
          responses: dto.responses as any,
          emotionalScore: analysis.overallScore,
          emotionalState: analysis.emotionalState,
          recommendations: analysis.recommendations
        }
      });

      return this.mapToResultDto(assessment, analysis.detailedScores);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Ошибка при создании эмоциональной оценки');
    }
  }

  // Получение эмоциональных оценок пользователя
  async findByUserId(userId: string): Promise<EmotionalAssessmentResultDto[]> {
    const assessments = await this.prisma.emotionalAssessment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return assessments.map(assessment => this.mapToResultDto(assessment));
  }

  // Получение оценок для конкретного результата теста
  async findByTestResultId(testResultId: string): Promise<EmotionalAssessmentResultDto[]> {
    const assessments = await this.prisma.emotionalAssessment.findMany({
      where: { testResultId },
      orderBy: { createdAt: 'desc' }
    });

    return assessments.map(assessment => this.mapToResultDto(assessment));
  }

  // Получение конкретной оценки по ID
  async findOne(id: string): Promise<EmotionalAssessmentResultDto> {
    const assessment = await this.prisma.emotionalAssessment.findUnique({
      where: { id }
    });

    if (!assessment) {
      throw new NotFoundException(`Эмоциональная оценка с ID ${id} не найдена`);
    }

    return this.mapToResultDto(assessment);
  }

  // Анализ эмоциональных ответов (старый метод для обратной совместимости)
  async analyzeEmotionalState(answers: Record<string, any>, language: Language = Language.ru): Promise<any> {
    const responses: EmotionalResponseDto[] = Object.entries(answers).map(([questionId, response]) => ({
      questionId,
      response
    }));

    return this.analyzeEmotionalResponses(responses, language);
  }

  // Получение статистики эмоциональных оценок
  async getStats(userId?: string): Promise<any> {
    const where = userId ? { userId } : {};

    const [
      totalAssessments,
      averageScore,
      recentAssessments,
      scoreDistribution
    ] = await Promise.all([
      this.prisma.emotionalAssessment.count({ where }),
      this.prisma.emotionalAssessment.aggregate({
        where,
        _avg: { emotionalScore: true }
      }),
      this.prisma.emotionalAssessment.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 дней назад
          }
        }
      }),
      this.prisma.emotionalAssessment.findMany({
        where,
        select: { emotionalScore: true, emotionalState: true },
        orderBy: { createdAt: 'desc' },
        take: 100
      })
    ]);

    const stateDistribution = scoreDistribution.reduce((acc, item) => {
      acc[item.emotionalState] = (acc[item.emotionalState] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAssessments,
      averageScore: averageScore._avg.emotionalScore || 0,
      recentAssessments,
      stateDistribution,
      trend: this.calculateTrend(scoreDistribution.map(s => s.emotionalScore))
    };
  }

  // Приватные методы

  private analyzeEmotionalResponses(responses: EmotionalResponseDto[], language: Language): any {
    const detailedScores: Record<string, number> = {};
    let totalScore = 0;
    let maxPossibleScore = 0;

    // Получаем информацию о вопросах для правильного расчета
    const questionsData = this.getQuestionsData(language);

    for (const response of responses) {
      const questionData = questionsData.find(q => q.id === response.questionId);
      if (questionData) {
        const option = questionData.options.find(opt => opt.value === response.response);
        const score = option?.score || response.score || 3; // По умолчанию средняя оценка
        detailedScores[questionData.type] = score;
        totalScore += score;
        maxPossibleScore += 5; // Максимальный балл за вопрос
      }
    }

    const overallScore = Math.round((totalScore / maxPossibleScore) * 100);
    const emotionalState = this.determineEmotionalState(overallScore);
    const recommendations = this.generateRecommendations(detailedScores, language);

    return {
      detailedScores,
      overallScore,
      emotionalState,
      recommendations,
      totalScore,
      maxPossibleScore
    };
  }

  private getQuestionsData(language: Language): any[] {
    // Возвращаем данные о вопросах для расчета
    const questions = {
      [Language.ru]: [
        {
          id: 'es_1', type: 'mood',
          options: [
            { value: 'excellent', score: 5 },
            { value: 'good', score: 4 },
            { value: 'neutral', score: 3 },
            { value: 'bad', score: 2 },
            { value: 'terrible', score: 1 }
          ]
        },
        {
          id: 'es_2', type: 'energy',
          options: [
            { value: 'high', score: 5 },
            { value: 'medium', score: 3 },
            { value: 'low', score: 1 }
          ]
        },
        {
          id: 'es_3', type: 'stress',
          options: [
            { value: 'none', score: 5 },
            { value: 'low', score: 4 },
            { value: 'medium', score: 2 },
            { value: 'high', score: 1 }
          ]
        },
        {
          id: 'es_4', type: 'focus',
          options: [
            { value: 'excellent', score: 5 },
            { value: 'good', score: 4 },
            { value: 'fair', score: 3 },
            { value: 'poor', score: 1 }
          ]
        },
        {
          id: 'es_5', type: 'motivation',
          options: [
            { value: 'high', score: 5 },
            { value: 'medium', score: 4 },
            { value: 'low', score: 2 },
            { value: 'none', score: 1 }
          ]
        },
        {
          id: 'es_6', type: 'anxiety',
          options: [
            { value: 'none', score: 5 },
            { value: 'slight', score: 4 },
            { value: 'moderate', score: 2 },
            { value: 'high', score: 1 }
          ]
        },
        {
          id: 'es_7', type: 'confidence',
          options: [
            { value: 'very_confident', score: 5 },
            { value: 'confident', score: 4 },
            { value: 'neutral', score: 3 },
            { value: 'unsure', score: 2 },
            { value: 'very_unsure', score: 1 }
          ]
        }
      ]
    };

    return questions[language] || questions[Language.ru];
  }

  private determineEmotionalState(overallScore: number): string {
    if (overallScore >= 80) return 'excellent';
    if (overallScore >= 65) return 'good';
    if (overallScore >= 50) return 'fair';
    if (overallScore >= 35) return 'poor';
    return 'critical';
  }

  private generateRecommendations(scores: Record<string, number>, language: Language): Record<string, any> {
    const recommendations = {
      [Language.ru]: {
        mood: {
          low: 'Попробуйте заняться приятными активностями или поговорить с близкими',
          tips: ['Прогуляйтесь на свежем воздухе', 'Послушайте любимую музыку', 'Займитесь хобби']
        },
        energy: {
          low: 'Отдохните и восстановите силы',
          tips: ['Выспитесь достаточно', 'Сделайте легкую разминку', 'Выпейте воды']
        },
        stress: {
          high: 'Используйте техники релаксации для снижения стресса',
          tips: ['Дыхательные упражнения', 'Медитация', 'Прогрессивная мышечная релаксация']
        },
        focus: {
          low: 'Создайте спокойную обстановку для концентрации',
          tips: ['Уберите отвлекающие факторы', 'Используйте технику Помодоро', 'Найдите тихое место']
        },
        motivation: {
          low: 'Найдите источники мотивации',
          tips: ['Поставьте маленькие достижимые цели', 'Вознаградите себя за успехи', 'Вспомните свои цели']
        },
        anxiety: {
          high: 'Работайте с тревожностью',
          tips: ['Техники заземления', 'Дыхательные упражнения', 'Обратитесь за поддержкой']
        },
        confidence: {
          low: 'Укрепляйте уверенность в себе',
          tips: ['Вспомните свои достижения', 'Практикуйте позитивные аффирмации', 'Начните с малого']
        }
      },
      [Language.en]: {
        mood: {
          low: 'Try engaging in pleasant activities or talking to loved ones',
          tips: ['Take a walk outdoors', 'Listen to your favorite music', 'Engage in hobbies']
        },
        energy: {
          low: 'Rest and restore your energy',
          tips: ['Get enough sleep', 'Do light exercise', 'Drink water']
        },
        stress: {
          high: 'Use relaxation techniques to reduce stress',
          tips: ['Breathing exercises', 'Meditation', 'Progressive muscle relaxation']
        },
        focus: {
          low: 'Create a calm environment for concentration',
          tips: ['Remove distractions', 'Use Pomodoro technique', 'Find a quiet place']
        },
        motivation: {
          low: 'Find sources of motivation',
          tips: ['Set small achievable goals', 'Reward yourself for success', 'Remember your goals']
        },
        anxiety: {
          high: 'Work with anxiety',
          tips: ['Grounding techniques', 'Breathing exercises', 'Seek support']
        },
        confidence: {
          low: 'Build self-confidence',
          tips: ['Remember your achievements', 'Practice positive affirmations', 'Start small']
        }
      }
    };

    const langRecommendations = recommendations[language] || recommendations[Language.ru];
    const result: Record<string, any> = {};

    Object.entries(scores).forEach(([type, score]) => {
      if (score <= 2 && langRecommendations[type]) {
        result[type] = langRecommendations[type];
      }
    });

    // Общие рекомендации
    const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;
    
    if (overallScore >= 4) {
      result.general = language === Language.ru 
        ? 'Отличное эмоциональное состояние! Продолжайте в том же духе.'
        : 'Excellent emotional state! Keep it up.';
    } else if (overallScore <= 2) {
      result.general = language === Language.ru
        ? 'Рекомендуется обратиться за профессиональной поддержкой.'
        : 'Consider seeking professional support.';
    }

    return result;
  }

  private calculateTrend(scores: number[]): string {
    if (scores.length < 2) return 'insufficient_data';
    
    const recent = scores.slice(0, Math.min(5, scores.length));
    const older = scores.slice(Math.min(5, scores.length), Math.min(10, scores.length));
    
    if (older.length === 0) return 'insufficient_data';
    
    const recentAvg = recent.reduce((sum, score) => sum + score, 0) / recent.length;
    const olderAvg = older.reduce((sum, score) => sum + score, 0) / older.length;
    
    const diff = recentAvg - olderAvg;
    
    if (diff > 5) return 'improving';
    if (diff < -5) return 'declining';
    return 'stable';
  }

  private mapToResultDto(assessment: any, detailedScores?: Record<string, number>): EmotionalAssessmentResultDto {
    return {
      id: assessment.id,
      userId: assessment.userId,
      testResultId: assessment.testResultId,
      emotionalScore: assessment.emotionalScore,
      emotionalState: assessment.emotionalState,
      detailedScores: detailedScores || this.extractDetailedScores(assessment.responses),
      recommendations: assessment.recommendations as Record<string, any>,
      responses: assessment.responses as Record<string, any>,
      createdAt: assessment.createdAt
    };
  }

  private extractDetailedScores(responses: any): Record<string, number> {
    // Извлекаем детальные оценки из сохраненных ответов
    if (!responses || !Array.isArray(responses)) return {};
    
    const scores: Record<string, number> = {};
    const questionsData = this.getQuestionsData(Language.ru);
    
    for (const response of responses) {
      const questionData = questionsData.find(q => q.id === response.questionId);
      if (questionData) {
        const option = questionData.options.find(opt => opt.value === response.response);
        scores[questionData.type] = option?.score || 3;
      }
    }
    
    return scores;
  }
} 