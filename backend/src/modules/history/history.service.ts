import { Injectable } from '@nestjs/common';
import { TestResult, TestType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { GetHistoryDto, GetHistoryStatsDto } from './dto';

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  async getUserHistory(userId: string, getHistoryDto: GetHistoryDto): Promise<TestResult[]> {
    const { testType, startDate, endDate, limit = 20, offset = 0 } = getHistoryDto;

    return await this.prisma.testResult.findMany({
      where: {
        userId,
        isCompleted: true,
        ...(testType && { testType }),
        ...(startDate && endDate && {
          completedAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          }
        }),
      },
      orderBy: { completedAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        test: {
          select: {
            name: true,
            type: true,
            difficulty: true,
          }
        }
      }
    });
  }

  async getUserStats(userId: string, getHistoryStatsDto: GetHistoryStatsDto) {
    const { testType, period } = getHistoryStatsDto;

    // Определяем дату начала периода
    let startDate: Date;
    const now = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all':
      default:
        startDate = new Date(0);
        break;
    }

    // Базовые условия фильтрации
    const whereConditions = {
      userId,
      isCompleted: true,
      completedAt: {
        gte: startDate,
      },
      ...(testType && { testType }),
    };

    const [
      totalTests,
      averageScore,
      bestScore,
      recentTests,
      testsByType
    ] = await Promise.all([
      // Общее количество тестов
      this.prisma.testResult.count({ where: whereConditions }),
      
      // Средний балл
      this.prisma.testResult.aggregate({
        where: whereConditions,
        _avg: { percentage: true }
      }),
      
      // Лучший результат
      this.prisma.testResult.aggregate({
        where: whereConditions,
        _max: { percentage: true }
      }),
      
      // Последние тесты
      this.prisma.testResult.findMany({
        where: whereConditions,
        orderBy: { completedAt: 'desc' },
        take: 5,
        select: {
          testType: true,
          percentage: true,
          resultLevel: true,
          completedAt: true,
        }
      }),
      
      // Статистика по типам тестов
      this.prisma.testResult.groupBy({
        by: ['testType'],
        where: whereConditions,
        _count: { id: true },
        _avg: { percentage: true },
      })
    ]);

    // Получаем дату последнего теста
    const lastTest = recentTests.length > 0 ? recentTests[0] : null;

    return {
      period,
      totalTests,
      completedTests: totalTests, // Добавляем поле completedTests для совместимости
      averageScore: averageScore._avg.percentage || 0,
      bestScore: bestScore._max.percentage || 0,
      lastTestDate: lastTest?.completedAt || null, // Добавляем поле lastTestDate
      riskLevel: 'low', // Добавляем поле riskLevel для совместимости
      recentTests,
      testsByType: testsByType.map(item => ({
        testType: item.testType,
        count: item._count.id,
        averageScore: item._avg.percentage || 0,
      })),
    };
  }

  async getTestTypeHistory(userId: string, testType: TestType) {
    return await this.prisma.testResult.findMany({
      where: {
        userId,
        testType,
        isCompleted: true,
      },
      orderBy: { completedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        score: true,
        percentage: true,
        resultLevel: true,
        completedAt: true,
        details: true,
      }
    });
  }

  async getProgressTrend(userId: string, testType: TestType) {
    const results = await this.prisma.testResult.findMany({
      where: {
        userId,
        testType,
        isCompleted: true,
      },
      orderBy: { completedAt: 'asc' },
      select: {
        percentage: true,
        completedAt: true,
      }
    });

    return {
      testType,
      trend: results.map((result, index) => ({
        attempt: index + 1,
        score: result.percentage,
        date: result.completedAt,
      })),
      improvement: results.length > 1 
        ? results[results.length - 1].percentage - results[0].percentage
        : 0,
    };
  }

  async getComparisonWithAverage(userId: string, testType: TestType) {
    const [userAverage, globalAverage] = await Promise.all([
      this.prisma.testResult.aggregate({
        where: {
          userId,
          testType,
          isCompleted: true,
        },
        _avg: { percentage: true },
      }),
      
      this.prisma.testResult.aggregate({
        where: {
          testType,
          isCompleted: true,
        },
        _avg: { percentage: true },
      }),
    ]);

    return {
      testType,
      userAverage: userAverage._avg.percentage || 0,
      globalAverage: globalAverage._avg.percentage || 0,
      difference: (userAverage._avg.percentage || 0) - (globalAverage._avg.percentage || 0),
    };
  }
}