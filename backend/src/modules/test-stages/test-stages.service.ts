import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Language, TestStage, TestType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
    CreateTestStageDto,
    GetTestStagesDto,
    InitializeStagesDto,
    StageNames,
    TestStageResultDto,
    TestStagesSetDto,
    UpdateTestStageDto
} from './dto';

@Injectable()
export class TestStagesService {
  constructor(private prisma: PrismaService) {}

  // Создание нового этапа теста
  async create(createDto: CreateTestStageDto): Promise<TestStageResultDto> {
    try {
      // Проверяем, существует ли уже этап с таким testType и stage
      const existingStage = await this.prisma.testStage.findUnique({
        where: {
          testType_stage: {
            testType: createDto.testType,
            stage: createDto.stage
          }
        }
      });

      if (existingStage) {
        throw new ConflictException(
          `Этап ${createDto.stage} для теста ${createDto.testType} уже существует`
        );
      }

      const stage = await this.prisma.testStage.create({
        data: createDto
      });

      return this.mapToResultDto(stage, Language.ru);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new ConflictException('Ошибка при создании этапа теста');
    }
  }

  // Получение всех этапов или с фильтрацией
  async findAll(query: GetTestStagesDto): Promise<TestStageResultDto[]> {
    const where: any = { isActive: true };
    
    if (query.testType) {
      where.testType = query.testType;
    }
    
    if (query.stage) {
      where.stage = query.stage;
    }

    const stages = await this.prisma.testStage.findMany({
      where,
      orderBy: [
        { testType: 'asc' },
        { orderIndex: 'asc' },
        { stage: 'asc' }
      ]
    });

    return stages.map(stage => this.mapToResultDto(stage, query.language || Language.ru));
  }

  // Получение полного набора этапов для конкретного теста
  async findByTestType(testType: TestType, language: Language = Language.ru): Promise<TestStagesSetDto> {
    const stages = await this.prisma.testStage.findMany({
      where: { testType, isActive: true },
      orderBy: { stage: 'asc' }
    });

    const mappedStages = stages.map(stage => this.mapToResultDto(stage, language));
    
    return {
      testType,
      language,
      stages: mappedStages,
      totalStages: stages.length,
      activeStages: stages.filter(s => s.isActive).length
    };
  }

  // Получение конкретного этапа
  async findOne(id: string, language: Language = Language.ru): Promise<TestStageResultDto> {
    const stage = await this.prisma.testStage.findUnique({
      where: { id }
    });

    if (!stage) {
      throw new NotFoundException(`Этап с ID ${id} не найден`);
    }

    return this.mapToResultDto(stage, language);
  }

  // Получение этапа по типу теста и номеру этапа
  async findByTypeAndStage(
    testType: TestType, 
    stageNumber: number, 
    language: Language = Language.ru
  ): Promise<TestStageResultDto> {
    const stage = await this.prisma.testStage.findUnique({
      where: {
        testType_stage: {
          testType,
          stage: stageNumber
        }
      }
    });

    if (!stage) {
      throw new NotFoundException(
        `Этап ${stageNumber} для теста ${testType} не найден`
      );
    }

    return this.mapToResultDto(stage, language);
  }

  // Обновление этапа
  async update(id: string, updateDto: UpdateTestStageDto): Promise<TestStageResultDto> {
    const existingStage = await this.prisma.testStage.findUnique({
      where: { id }
    });

    if (!existingStage) {
      throw new NotFoundException(`Этап с ID ${id} не найден`);
    }

    const stage = await this.prisma.testStage.update({
      where: { id },
      data: {
        ...updateDto,
        updatedAt: new Date()
      }
    });

    return this.mapToResultDto(stage, Language.ru);
  }

  // Удаление этапа (мягкое удаление)
  async remove(id: string): Promise<void> {
    const existingStage = await this.prisma.testStage.findUnique({
      where: { id }
    });

    if (!existingStage) {
      throw new NotFoundException(`Этап с ID ${id} не найден`);
    }

    await this.prisma.testStage.update({
      where: { id },
      data: { isActive: false }
    });
  }

  // Инициализация стандартных этапов для всех тестов
  async initializeDefaultStages(dto: InitializeStagesDto): Promise<{ created: number; updated: number }> {
    let created = 0;
    let updated = 0;

    for (const testType of Object.values(TestType)) {
      const stageDefinitions = this.getDefaultStageDefinitions(testType, dto.defaultLanguage);
      
      for (const stageDef of stageDefinitions) {
        const existing = await this.prisma.testStage.findUnique({
          where: {
            testType_stage: {
              testType,
              stage: stageDef.stage
            }
          }
        });

        if (existing && dto.overwrite) {
          await this.prisma.testStage.update({
            where: { id: existing.id },
            data: stageDef
          });
          updated++;
        } else if (!existing) {
          await this.prisma.testStage.create({
            data: {
              ...stageDef,
              testType
            }
          });
          created++;
        }
      }
    }

    return { created, updated };
  }

  // Приватные методы

  private mapToResultDto(stage: TestStage, language: Language): TestStageResultDto {
    const title = this.extractLocalizedContent(stage.title as any, language);
    const content = this.extractLocalizedContent(stage.content as any, language);

    return {
      id: stage.id,
      testType: stage.testType,
      stage: stage.stage,
      title,
      content,
      configuration: stage.configuration as Record<string, any>,
      isActive: stage.isActive,
      orderIndex: stage.orderIndex,
      createdAt: stage.createdAt,
      updatedAt: stage.updatedAt
    };
  }

  private extractLocalizedContent(content: Record<Language, any>, language: Language): any {
    if (!content || typeof content !== 'object') {
      return content;
    }
    
    return content[language] || content[Language.ru] || content[Object.keys(content)[0]];
  }

  private getDefaultStageDefinitions(testType: TestType, language: Language) {
    const stageDefinitions = [
      {
        stage: StageNames.DESCRIPTION,
        title: { [language]: this.getTestName(testType, language) },
        content: { [language]: this.getTestDescription(testType, language) },
        configuration: { allowNext: true }
      },
      {
        stage: StageNames.INSTRUCTION,
        title: { [language]: 'Инструкция' },
        content: { [language]: this.getTestInstructions(testType, language) },
        configuration: { allowNext: true, showTimer: false }
      },
      {
        stage: StageNames.PRACTICE,
        title: { [language]: 'Тренировочный тест' },
        content: { [language]: this.getPracticeContent(testType, language) },
        configuration: { allowRepeat: true, isPractice: true }
      },
      {
        stage: StageNames.MAIN_TEST,
        title: { [language]: 'Основной тест' },
        content: { [language]: this.getMainTestContent(testType, language) },
        configuration: { 
          fullscreen: true, 
          showTimer: true, 
          autoSubmit: true,
          isPractice: false
        }
      },
      {
        stage: StageNames.RESULT,
        title: { [language]: 'Результат' },
        content: { [language]: this.getResultContent(testType, language) },
        configuration: { 
          showScore: true, 
          showRecommendations: true,
          allowNextTest: true
        }
      }
    ];

    return stageDefinitions;
  }

  private getTestName(testType: TestType, language: Language): string {
    const names = {
      [Language.ru]: {
        [TestType.VISUAL_MEMORY]: 'Визуальная память',
        [TestType.VERBAL_MEMORY]: 'Вербальная память',
        [TestType.AUDITORY_MEMORY]: 'Рече-слуховая память',
        [TestType.DIGIT_SPAN]: 'Объём цифр',
        [TestType.VISUAL_ATTENTION]: 'Зрительная память и внимание',
        [TestType.STROOP_TEST]: 'Тест Струпа',
        [TestType.ARITHMETIC]: 'Счётные операции',
        [TestType.SYMBOL_MEMORY]: 'Символьная память'
      },
      [Language.en]: {
        [TestType.VISUAL_MEMORY]: 'Visual Memory',
        [TestType.VERBAL_MEMORY]: 'Verbal Memory',
        [TestType.AUDITORY_MEMORY]: 'Auditory Memory',
        [TestType.DIGIT_SPAN]: 'Digit Span',
        [TestType.VISUAL_ATTENTION]: 'Visual Attention',
        [TestType.STROOP_TEST]: 'Stroop Test',
        [TestType.ARITHMETIC]: 'Arithmetic',
        [TestType.SYMBOL_MEMORY]: 'Symbol Memory'
      }
    };

    return names[language]?.[testType] || testType;
  }

  private getTestDescription(testType: TestType, language: Language): string {
    const descriptions = {
      [Language.ru]: {
        [TestType.VISUAL_MEMORY]: 'Тест на оценку способности запоминать и воспроизводить визуальную информацию',
        [TestType.VERBAL_MEMORY]: 'Тест на оценку способности запоминать и воспроизводить словесную информацию',
        [TestType.AUDITORY_MEMORY]: 'Тест на оценку способности запоминать информацию, воспринимаемую на слух',
        [TestType.DIGIT_SPAN]: 'Тест на оценку объёма кратковременной памяти',
        [TestType.VISUAL_ATTENTION]: 'Тест на оценку зрительного внимания и памяти',
        [TestType.STROOP_TEST]: 'Тест на оценку избирательности внимания и скорости обработки информации',
        [TestType.ARITHMETIC]: 'Тест на оценку способности к счётным операциям',
        [TestType.SYMBOL_MEMORY]: 'Тест на оценку способности запоминать символьную информацию'
      }
    };

    return descriptions[language]?.[testType] || 'Когнитивный тест';
  }

  private getTestInstructions(testType: TestType, language: Language): any {
    // Возвращаем базовые инструкции, которые можно дополнить позже
    return {
      text: 'Следуйте инструкциям на экране',
      steps: [
        'Внимательно прочитайте задание',
        'Выполните тренировочную версию',
        'Приступайте к основному тесту'
      ]
    };
  }

  private getPracticeContent(testType: TestType, language: Language): any {
    return {
      description: 'Это тренировочная версия теста. Вы можете повторить её несколько раз.',
      questions: []
    };
  }

  private getMainTestContent(testType: TestType, language: Language): any {
    return {
      description: 'Основной тест. Будьте внимательны.',
      questions: []
    };
  }

  private getResultContent(testType: TestType, language: Language): any {
    return {
      template: 'Ваш результат: {{score}} из {{maxScore}}',
      recommendations: {
        high: 'Отличный результат!',
        medium: 'Хороший результат',
        low: 'Рекомендуется дополнительная практика'
      }
    };
  }
}