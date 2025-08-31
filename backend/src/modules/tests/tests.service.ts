import { Injectable, NotFoundException } from '@nestjs/common';
import { Test, TestResult, TestResultLevel, TestType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTestDto, StartTestDto, SubmitTestResultDto, UpdateTestDto } from './dto';

@Injectable()
export class TestsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async create(createTestDto: CreateTestDto): Promise<Test> {
    return await this.prisma.test.create({
      data: createTestDto
    });
  }

  async findAll(): Promise<Test[]> {
    return await this.prisma.test.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: 'asc' }
    });
  }

  async findOne(id: string): Promise<Test> {
    const test = await this.prisma.test.findUnique({
      where: { id }
    });

    if (!test) {
      throw new NotFoundException(`Тест с ID ${id} не найден`);
    }

    return test;
  }

  async findByType(type: TestType): Promise<Test> {
    const test = await this.prisma.test.findUnique({
      where: { type }
    });

    if (!test) {
      throw new NotFoundException(`Тест типа ${type} не найден`);
    }

    return test;
  }

  async update(id: string, updateTestDto: UpdateTestDto): Promise<Test> {
    await this.findOne(id);

    return await this.prisma.test.update({
      where: { id },
      data: updateTestDto
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    await this.prisma.test.delete({
      where: { id }
    });
  }

  async startTest(userId: string, startTestDto: StartTestDto): Promise<TestResult> {
    // Проверяем существование теста
    const test = await this.findOne(startTestDto.testId);

    // Создаем новый результат теста
    return await this.prisma.testResult.create({
      data: {
        userId,
        testId: test.id,
        testType: test.type,
        isCompleted: false,
        details: {
          startedAt: new Date(),
          testConfig: test.configuration
        }
      }
    });
  }

  async submitTestResult(submitTestResultDto: SubmitTestResultDto): Promise<TestResult> {
    const { resultId, answers, emotionalState, timeSpent, maxScore } = submitTestResultDto;

    // Находим результат теста
    const testResult = await this.prisma.testResult.findUnique({
      where: { id: resultId }
    });

    if (!testResult) {
      throw new NotFoundException(`Результат теста с ID ${resultId} не найден`);
    }

    // Извлекаем правильные ответы и общее количество
    let score = 0;
    let totalQuestions = maxScore || 100;
    
    if (answers && typeof answers === 'object') {
      if (answers.correct !== undefined && answers.total !== undefined) {
        // Если переданы correct и total напрямую
        score = answers.correct;
        totalQuestions = answers.total;
      } else {
        // Иначе считаем по старой логике
        const calculatedPercentage = this.calculateScore(answers, testResult.testType);
        score = Math.round((calculatedPercentage / 100) * totalQuestions);
      }
    }
    
    // Вычисляем процент
    const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
    
    let resultLevel: TestResultLevel = 'medium';
    if (percentage >= 80) resultLevel = 'high';
    else if (percentage < 60) resultLevel = 'low';

    // Обновляем результат
    return await this.prisma.testResult.update({
      where: { id: resultId },
      data: {
        score, // Количество правильных ответов
        maxScore: totalQuestions, // Общее количество вопросов
        percentage: Math.round(percentage * 100) / 100, // Процент с округлением
        resultLevel,
        details: {
          ...(testResult.details as any || {}),
          answers,
          timeSpent,
          completedAt: new Date()
        },
        emotionalState,
        isCompleted: true,
        completedAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  async getAvailableTestTypes(): Promise<{ testTypes: any[] }> {
    const tests = await this.prisma.test.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: 'asc' },
      select: {
        id: true,
        type: true,
        name: true,
        description: true,
        difficulty: true,
        orderIndex: true
      }
    });

    return { testTypes: tests };
  }

  async generateTestQuestions(type: TestType, randomized: boolean = false): Promise<any> {
    // В продакшене берём конфигурацию из БД тестов/этапов
    const test = await this.findByType(type);
    const config = test.configuration || {};
    const payload = {
      type,
      configuration: config,
      questions: [],
    } as any;
    return payload;
  }

  async getTestInstructions(type: TestType): Promise<any> {
    const test = await this.findByType(type);
    
    return {
      testType: type,
      name: test.name,
      description: test.description,
      instruction: test.instruction,
      difficulty: test.difficulty,
      configuration: test.configuration
    };
  }

  private calculateScore(answers: any, testType: TestType): number {
    // Простая логика подсчета очков
    // В реальном приложении здесь будет более сложная логика для каждого типа теста
    
    if (!answers || typeof answers !== 'object') {
      return 0;
    }

    if (answers.correct && answers.total) {
      return Math.round((answers.correct / answers.total) * 100);
    }

    // Подсчет правильных ответов
    let correct = 0;
    let total = 0;

    Object.entries(answers).forEach(([key, value]) => {
      if (key.startsWith('question_')) {
        total++;
        if (value === true || value === 'correct') {
          correct++;
        }
      }
    });

    return total > 0 ? Math.round((correct / total) * 100) : 0;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}