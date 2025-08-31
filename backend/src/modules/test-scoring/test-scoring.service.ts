import { Injectable } from '@nestjs/common';
import { TestResultLevel, TestType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
    AgeGroupNorm,
    CalculateTestScoreDto,
    TestScoreResultDto,
    TestTrendAnalysisDto,
    TestTrendResultDto
} from './dto';

@Injectable()
export class TestScoringService {
  constructor(private prisma: PrismaService) {}

  // Основной метод расчета результата теста
  async calculateTestScore(dto: CalculateTestScoreDto): Promise<TestScoreResultDto> {
    // Получаем специфичный для теста алгоритм расчета
    const rawScore = this.calculateRawScore(dto.testType, dto.answers, dto.testConfiguration);
    
    // Рассчитываем процентный балл
    const maxPossibleScore = this.getMaxScore(dto.testType, dto.testConfiguration);
    const percentage = (rawScore / maxPossibleScore) * 100;
    
    // Нормализация по возрасту
    const normalizedScore = dto.userAge 
      ? this.normalizeByAge(percentage, dto.testType, dto.userAge)
      : percentage;
    
    // Определяем уровень результата
    const resultLevel = this.determineResultLevel(normalizedScore, dto.testType);
    
    // Получаем цветовое кодирование
    const colorInfo = this.getColorCoding(resultLevel);
    
    // Детальный анализ
    const detailedAnalysis = this.performDetailedAnalysis(dto.testType, dto.answers, rawScore);
    
    // Генерируем рекомендации
    const recommendations = this.generateRecommendations(dto.testType, resultLevel, detailedAnalysis);
    
    // Сравнение с нормативными данными
    const normativeComparison = this.compareWithNorms(dto.testType, normalizedScore, dto.userAge);
    
    // Статистика выполнения
    const performanceStats = this.calculatePerformanceStats(dto.answers, dto.timeSpent);

    return {
      rawScore,
      percentage: Math.round(percentage * 100) / 100,
      normalizedScore: Math.round(normalizedScore * 100) / 100,
      resultLevel,
      colorCode: colorInfo.code,
      colorName: colorInfo.name,
      detailedAnalysis,
      recommendations,
      normativeComparison,
      performanceStats
    };
  }

  // Анализ тренда результатов пользователя
  async analyzeUserTrend(dto: TestTrendAnalysisDto): Promise<TestTrendResultDto> {
    const where: any = { userId: dto.userId, isCompleted: true };
    if (dto.testType) {
      where.testType = dto.testType;
    }

    const results = await this.prisma.testResult.findMany({
      where,
      orderBy: { completedAt: 'desc' },
      take: dto.limitResults || 10,
      select: {
        id: true,
        testType: true,
        score: true,
        percentage: true,
        resultLevel: true,
        completedAt: true
      }
    });

    if (results.length < 3) {
      return {
        trend: 'insufficient_data',
        changePercentage: 0,
        averageScore: 0,
        bestScore: 0,
        worstScore: 0,
        chartData: { dates: [], scores: [], levels: [] }
      };
    }

    // Анализ тренда
    const scores = results.map(r => r.percentage || r.score);
    const trend = this.calculateTrend(scores);
    const changePercentage = this.calculateChangePercentage(scores);

    // Статистика
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const bestScore = Math.max(...scores);
    const worstScore = Math.min(...scores);

    // Данные для графика
    const chartData = {
      dates: results.map(r => r.completedAt?.toISOString() || '').reverse(),
      scores: scores.reverse(),
      levels: results.map(r => r.resultLevel).reverse()
    };

    // Анализ по типам тестов (если не указан конкретный тип)
    let testTypeBreakdown: Record<TestType, any> | undefined;
    if (!dto.testType) {
      testTypeBreakdown = await this.getTestTypeBreakdown(dto.userId);
    }

    return {
      trend,
      changePercentage: Math.round(changePercentage * 100) / 100,
      averageScore: Math.round(averageScore * 100) / 100,
      bestScore,
      worstScore,
      chartData,
      testTypeBreakdown
    };
  }

  // Приватные методы для расчета

  private calculateRawScore(testType: TestType, answers: Record<string, any>, config?: Record<string, any>): number {
    switch (testType) {
      case TestType.VISUAL_MEMORY:
        return this.calculateVisualMemoryScore(answers);
      case TestType.VERBAL_MEMORY:
        return this.calculateVerbalMemoryScore(answers);
      case TestType.AUDITORY_MEMORY:
        return this.calculateAuditoryMemoryScore(answers);
      case TestType.DIGIT_SPAN:
        return this.calculateDigitSpanScore(answers);
      case TestType.VISUAL_ATTENTION:
        return this.calculateVisualAttentionScore(answers);
      case TestType.STROOP_TEST:
        return this.calculateStroopScore(answers);
      case TestType.ARITHMETIC:
        return this.calculateArithmeticScore(answers);
      case TestType.SYMBOL_MEMORY:
        return this.calculateSymbolMemoryScore(answers);
      default:
        return this.calculateGenericScore(answers);
    }
  }

  private calculateVisualMemoryScore(answers: Record<string, any>): number {
    let score = 0;
    let totalItems = 0;

    // Анализ ответов для теста визуальной памяти
    if (answers.remembered_items && answers.total_items) {
      score = answers.remembered_items;
      totalItems = answers.total_items;
    } else {
      // Подсчет правильных ответов
      Object.entries(answers).forEach(([key, value]) => {
        if (key.startsWith('item_') || key.startsWith('image_')) {
          totalItems++;
          if (value === true || value === 'correct' || value === 1) {
            score++;
          }
        }
      });
    }

    return totalItems > 0 ? Math.round((score / totalItems) * 100) : 0;
  }

  private calculateVerbalMemoryScore(answers: Record<string, any>): number {
    let score = 0;
    let totalWords = 0;

    if (answers.recalled_words && answers.total_words) {
      score = answers.recalled_words;
      totalWords = answers.total_words;
    } else {
      Object.entries(answers).forEach(([key, value]) => {
        if (key.startsWith('word_') || key.startsWith('recall_')) {
          totalWords++;
          if (value === true || value === 'correct') {
            score++;
          }
        }
      });
    }

    return totalWords > 0 ? Math.round((score / totalWords) * 100) : 0;
  }

  private calculateAuditoryMemoryScore(answers: Record<string, any>): number {
    // Похожая логика для аудиальной памяти
    return this.calculateVerbalMemoryScore(answers);
  }

  private calculateDigitSpanScore(answers: Record<string, any>): number {
    let maxSpan = 0;
    let totalTrials = 0;
    let correctTrials = 0;

    if (answers.max_span !== undefined) {
      maxSpan = answers.max_span;
    }

    Object.entries(answers).forEach(([key, value]) => {
      if (key.startsWith('span_') || key.startsWith('sequence_')) {
        totalTrials++;
        if (value === true || value === 'correct') {
          correctTrials++;
          const span = parseInt(key.match(/\d+/)?.[0] || '0');
          maxSpan = Math.max(maxSpan, span);
        }
      }
    });

    // Смешанная оценка: максимальный span + точность
    const spanScore = maxSpan * 10; // 10 баллов за каждую цифру в span
    const accuracyScore = totalTrials > 0 ? (correctTrials / totalTrials) * 50 : 0;
    
    return Math.min(spanScore + accuracyScore, 100);
  }

  private calculateVisualAttentionScore(answers: Record<string, any>): number {
    let correctTargets = 0;
    let totalTargets = 0;
    let falsePositives = 0;

    if (answers.correct_targets !== undefined) {
      correctTargets = answers.correct_targets;
      totalTargets = answers.total_targets || correctTargets;
      falsePositives = answers.false_positives || 0;
    } else {
      Object.entries(answers).forEach(([key, value]) => {
        if (key.startsWith('target_')) {
          totalTargets++;
          if (value === true || value === 'correct') {
            correctTargets++;
          }
        } else if (key.startsWith('distractor_') && (value === true || value === 'selected')) {
          falsePositives++;
        }
      });
    }

    // Точность - штраф за ложные срабатывания
    const accuracy = totalTargets > 0 ? correctTargets / totalTargets : 0;
    const precision = (correctTargets + falsePositives) > 0 ? correctTargets / (correctTargets + falsePositives) : 0;
    
    return Math.round((accuracy * 0.7 + precision * 0.3) * 100);
  }

  private calculateStroopScore(answers: Record<string, any>): number {
    let correctAnswers = 0;
    let totalAnswers = 0;
    let totalTime = 0;
    let interferenceErrors = 0;

    Object.entries(answers).forEach(([key, value]) => {
      if (key.startsWith('trial_')) {
        totalAnswers++;
        if (value.correct) {
          correctAnswers++;
        }
        if (value.response_time) {
          totalTime += value.response_time;
        }
        if (value.interference_error) {
          interferenceErrors++;
        }
      }
    });

    const accuracy = totalAnswers > 0 ? correctAnswers / totalAnswers : 0;
    const avgTime = totalAnswers > 0 ? totalTime / totalAnswers : 0;
    
    // Бонус за скорость (меньше времени = больше баллов)
    const speedBonus = avgTime > 0 ? Math.max(0, (2000 - avgTime) / 2000) : 0;
    
    // Штраф за интерференционные ошибки
    const interferencePenalty = interferenceErrors * 0.05;
    
    return Math.max(0, Math.round((accuracy * 0.7 + speedBonus * 0.3 - interferencePenalty) * 100));
  }

  private calculateArithmeticScore(answers: Record<string, any>): number {
    let correct = 0;
    let total = 0;

    Object.entries(answers).forEach(([key, value]) => {
      if (key.startsWith('problem_') || key.startsWith('calc_')) {
        total++;
        if (value === true || value === 'correct') {
          correct++;
        }
      }
    });

    return total > 0 ? Math.round((correct / total) * 100) : 0;
  }

  private calculateSymbolMemoryScore(answers: Record<string, any>): number {
    // Похожая логика на визуальную память, но для символов
    return this.calculateVisualMemoryScore(answers);
  }

  private calculateGenericScore(answers: Record<string, any>): number {
    // Универсальная логика для любого теста
    if (answers.correct && answers.total) {
      return Math.round((answers.correct / answers.total) * 100);
    }

    let correct = 0;
    let total = 0;

    Object.entries(answers).forEach(([key, value]) => {
      if (key.startsWith('question_') || key.startsWith('item_') || key.startsWith('answer_')) {
        total++;
        if (value === true || value === 'correct' || value === 1) {
          correct++;
        }
      }
    });

    return total > 0 ? Math.round((correct / total) * 100) : 0;
  }

  private getMaxScore(testType: TestType, config?: Record<string, any>): number {
    // Максимальные баллы для каждого типа теста
    const maxScores = {
      [TestType.VISUAL_MEMORY]: 100,
      [TestType.VERBAL_MEMORY]: 100,
      [TestType.AUDITORY_MEMORY]: 100,
      [TestType.DIGIT_SPAN]: 100,
      [TestType.VISUAL_ATTENTION]: 100,
      [TestType.STROOP_TEST]: 100,
      [TestType.ARITHMETIC]: 100,
      [TestType.SYMBOL_MEMORY]: 100
    };

    return maxScores[testType] || 100;
  }

  private normalizeByAge(score: number, testType: TestType, age: number): number {
    // Возрастная нормализация (упрощенная)
    const ageGroups = this.getAgeNorms(testType);
    const ageGroup = ageGroups.find(group => age >= group.ageMin && age <= group.ageMax);
    
    if (!ageGroup) return score;
    
    // Z-score нормализация
    const zScore = (score - ageGroup.mean) / ageGroup.standardDeviation;
    const normalizedScore = 50 + (zScore * 10); // Преобразование в T-score
    
    return Math.max(0, Math.min(100, normalizedScore));
  }

  private determineResultLevel(score: number, testType: TestType): TestResultLevel {
    // Пороговые значения могут варьироваться по типам тестов
    const thresholds = this.getThresholds(testType);
    
    if (score >= thresholds.high) return TestResultLevel.high;
    if (score >= thresholds.medium) return TestResultLevel.medium;
    return TestResultLevel.low;
  }

  private getColorCoding(level: TestResultLevel): { code: string; name: string } {
    const colors = {
      [TestResultLevel.high]: { code: '#22c55e', name: 'Зеленый' },    // Зеленый
      [TestResultLevel.medium]: { code: '#f59e0b', name: 'Желтый' },   // Желтый
      [TestResultLevel.low]: { code: '#ef4444', name: 'Красный' }      // Красный
    };

    return colors[level];
  }

  private performDetailedAnalysis(testType: TestType, answers: Record<string, any>, rawScore: number): Record<string, any> {
    // Детальный анализ зависит от типа теста
    const analysis: Record<string, any> = {
      rawScore,
      testType,
      strongPoints: [],
      weakPoints: [],
      cognitiveProfile: {}
    };

    // Добавляем специфичный для теста анализ
    switch (testType) {
      case TestType.VISUAL_MEMORY:
        analysis.cognitiveProfile = this.analyzeVisualMemoryProfile(answers);
        break;
      case TestType.STROOP_TEST:
        analysis.cognitiveProfile = this.analyzeStroopProfile(answers);
        break;
      // Добавить другие типы тестов...
    }

    return analysis;
  }

  private generateRecommendations(testType: TestType, level: TestResultLevel, analysis: Record<string, any>): string[] {
    const recommendations: string[] = [];

    // Общие рекомендации по уровню
    switch (level) {
      case TestResultLevel.high:
        recommendations.push('Отличный результат! Продолжайте поддерживать когнитивную активность.');
        break;
      case TestResultLevel.medium:
        recommendations.push('Хороший результат. Рекомендуются регулярные когнитивные упражнения.');
        break;
      case TestResultLevel.low:
        recommendations.push('Рекомендуется консультация со специалистом и регулярные тренировки.');
        break;
    }

    // Специфичные для теста рекомендации
    const testSpecificRecs = this.getTestSpecificRecommendations(testType, level);
    recommendations.push(...testSpecificRecs);

    return recommendations;
  }

  private compareWithNorms(testType: TestType, score: number, age?: number): Record<string, any> {
    const ageGroups = this.getAgeNorms(testType);
    let comparison: Record<string, any> = {
      score,
      percentileRank: 50
    };

    if (age) {
      const ageGroup = ageGroups.find(group => age >= group.ageMin && age <= group.ageMax);
      if (ageGroup) {
        // Вычисляем процентильный ранг
        const percentile = this.calculatePercentileRank(score, ageGroup);
        comparison = {
          score,
          ageGroup: `${ageGroup.ageMin}-${ageGroup.ageMax}`,
          percentileRank: percentile,
          meanForAge: ageGroup.mean,
          standardDeviation: ageGroup.standardDeviation,
          interpretation: this.interpretPercentile(percentile)
        };
      }
    }

    return comparison;
  }

  private calculatePerformanceStats(answers: Record<string, any>, timeSpent?: number): any {
    let correct = 0;
    let incorrect = 0;
    let total = 0;
    let totalResponseTime = 0;
    let responseCount = 0;

    Object.entries(answers).forEach(([key, value]) => {
      if (key.startsWith('question_') || key.startsWith('item_')) {
        total++;
        if (value === true || value === 'correct' || value === 1) {
          correct++;
        } else {
          incorrect++;
        }
      }
      
      // Если есть данные о времени ответа
      if (key.includes('response_time') && typeof value === 'number') {
        totalResponseTime += value;
        responseCount++;
      }
    });

    const accuracy = total > 0 ? (correct / total) * 100 : 0;
    const avgResponseTime = responseCount > 0 ? totalResponseTime / responseCount : undefined;

    return {
      correct,
      incorrect,
      total,
      accuracy: Math.round(accuracy * 100) / 100,
      avgResponseTime
    };
  }

  // Вспомогательные методы

  private calculateTrend(scores: number[]): 'improving' | 'stable' | 'declining' | 'insufficient_data' {
    if (scores.length < 3) return 'insufficient_data';
    
    const recent = scores.slice(0, Math.ceil(scores.length / 2));
    const older = scores.slice(Math.ceil(scores.length / 2));
    
    const recentAvg = recent.reduce((sum, score) => sum + score, 0) / recent.length;
    const olderAvg = older.reduce((sum, score) => sum + score, 0) / older.length;
    
    const diff = recentAvg - olderAvg;
    
    if (diff > 5) return 'improving';
    if (diff < -5) return 'declining';
    return 'stable';
  }

  private calculateChangePercentage(scores: number[]): number {
    if (scores.length < 2) return 0;
    
    const firstScore = scores[scores.length - 1];
    const lastScore = scores[0];
    
    if (firstScore === 0) return 0;
    
    return ((lastScore - firstScore) / firstScore) * 100;
  }

  private async getTestTypeBreakdown(userId: string): Promise<Record<TestType, any>> {
    const breakdown: Partial<Record<TestType, any>> = {};
    
    for (const testType of Object.values(TestType)) {
      const results = await this.prisma.testResult.findMany({
        where: { userId, testType, isCompleted: true },
        orderBy: { completedAt: 'desc' },
        take: 5,
        select: { score: true, percentage: true }
      });
      
      if (results.length > 0) {
        const scores = results.map(r => r.percentage || r.score);
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const trend = this.calculateTrend(scores);
        
        breakdown[testType] = {
          averageScore: Math.round(averageScore * 100) / 100,
          trend,
          lastScore: scores[0],
          totalAttempts: results.length
        };
      }
    }
    
    return breakdown as Record<TestType, any>;
  }

  private getAgeNorms(testType: TestType): AgeGroupNorm[] {
    // Упрощенные нормативные данные
    // В реальном приложении эти данные должны быть получены из исследований
    const baseNorms: AgeGroupNorm[] = [
      {
        ageMin: 18, ageMax: 29,
        mean: 85, standardDeviation: 12,
        percentiles: { p10: 65, p25: 75, p50: 85, p75: 95, p90: 100 }
      },
      {
        ageMin: 30, ageMax: 49,
        mean: 80, standardDeviation: 15,
        percentiles: { p10: 60, p25: 70, p50: 80, p75: 90, p90: 95 }
      },
      {
        ageMin: 50, ageMax: 69,
        mean: 75, standardDeviation: 18,
        percentiles: { p10: 50, p25: 65, p50: 75, p75: 85, p90: 90 }
      },
      {
        ageMin: 70, ageMax: 120,
        mean: 70, standardDeviation: 20,
        percentiles: { p10: 45, p25: 60, p50: 70, p75: 80, p90: 85 }
      }
    ];

    return baseNorms;
  }

  private getThresholds(testType: TestType): { high: number; medium: number; low: number } {
    // Пороговые значения могут варьироваться по типам тестов
    return {
      high: 80,
      medium: 60,
      low: 0
    };
  }

  private analyzeVisualMemoryProfile(answers: Record<string, any>): Record<string, any> {
    return {
      immediateRecall: 0, // Рассчитать на основе ответов
      delayedRecall: 0,
      recognitionAccuracy: 0
    };
  }

  private analyzeStroopProfile(answers: Record<string, any>): Record<string, any> {
    return {
      processingSpeed: 0,
      inhibitoryControl: 0,
      interferenceEffect: 0
    };
  }

  private getTestSpecificRecommendations(testType: TestType, level: TestResultLevel): string[] {
    const recommendations: Partial<Record<TestType, Record<TestResultLevel, string[]>>> = {
      [TestType.VISUAL_MEMORY]: {
        [TestResultLevel.high]: ['Продолжайте визуальные упражнения для поддержания навыка'],
        [TestResultLevel.medium]: ['Попробуйте игры на запоминание изображений'],
        [TestResultLevel.low]: ['Начните с простых упражнений на визуальную память']
      },
      [TestType.VERBAL_MEMORY]: {
        [TestResultLevel.high]: ['Читайте сложную литературу для поддержания навыка'],
        [TestResultLevel.medium]: ['Практикуйте запоминание списков слов'],
        [TestResultLevel.low]: ['Начните с коротких текстов и постепенно увеличивайте объем']
      },
      [TestType.AUDITORY_MEMORY]: {
        [TestResultLevel.high]: ['Продолжайте аудиальные упражнения'],
        [TestResultLevel.medium]: ['Слушайте аудиокниги и запоминайте содержание'],
        [TestResultLevel.low]: ['Начните с коротких аудиозаписей']
      },
      [TestType.DIGIT_SPAN]: {
        [TestResultLevel.high]: ['Увеличивайте сложность числовых последовательностей'],
        [TestResultLevel.medium]: ['Тренируйте память на числа'],
        [TestResultLevel.low]: ['Начните с коротких числовых последовательностей']
      },
      [TestType.VISUAL_ATTENTION]: {
        [TestResultLevel.high]: ['Усложняйте визуальные задания'],
        [TestResultLevel.medium]: ['Тренируйте внимание и концентрацию'],
        [TestResultLevel.low]: ['Начните с простых упражнений на внимание']
      },
      [TestType.STROOP_TEST]: {
        [TestResultLevel.high]: ['Отличная скорость обработки информации'],
        [TestResultLevel.medium]: ['Тренируйте скорость реакции'],
        [TestResultLevel.low]: ['Улучшайте концентрацию и избирательность внимания']
      },
      [TestType.ARITHMETIC]: {
        [TestResultLevel.high]: ['Усложняйте математические задачи'],
        [TestResultLevel.medium]: ['Практикуйте устный счет'],
        [TestResultLevel.low]: ['Начните с простых арифметических операций']
      },
      [TestType.SYMBOL_MEMORY]: {
        [TestResultLevel.high]: ['Увеличивайте количество символов для запоминания'],
        [TestResultLevel.medium]: ['Тренируйте символьную память'],
        [TestResultLevel.low]: ['Начните с простых символов и знаков']
      }
    };

    return recommendations[testType]?.[level] || [];
  }

  private calculatePercentileRank(score: number, ageGroup: AgeGroupNorm): number {
    // Упрощенный расчет процентильного ранга
    const { percentiles } = ageGroup;
    
    if (score <= percentiles.p10) return 10;
    if (score <= percentiles.p25) return 25;
    if (score <= percentiles.p50) return 50;
    if (score <= percentiles.p75) return 75;
    if (score <= percentiles.p90) return 90;
    return 95;
  }

  private interpretPercentile(percentile: number): string {
    if (percentile >= 90) return 'Очень высокий уровень';
    if (percentile >= 75) return 'Высокий уровень';
    if (percentile >= 50) return 'Средний уровень';
    if (percentile >= 25) return 'Ниже среднего';
    return 'Низкий уровень';
  }
}