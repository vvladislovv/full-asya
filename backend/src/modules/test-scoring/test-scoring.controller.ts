import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import {
    Body,
    Controller,
    ForbiddenException,
    Get,
    Param,
    Post,
    Query,
    Request,
    UseGuards
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
    CalculateTestScoreDto,
    TestScoreResultDto,
    TestTrendAnalysisDto,
    TestTrendResultDto
} from './dto';
import { TestScoringService } from './test-scoring.service';

@ApiTags('Test Scoring')
@Controller('test-scoring')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TestScoringController {
  constructor(private readonly testScoringService: TestScoringService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Рассчитать продвинутую оценку результата теста' })
  @ApiResponse({ 
    status: 201, 
    description: 'Оценка рассчитана успешно',
    type: TestScoreResultDto
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @Throttle({ default: { limit: 50, ttl: 60000 } }) // 50 расчетов в минуту
  async calculateScore(
    @Body() dto: CalculateTestScoreDto
  ): Promise<TestScoreResultDto> {
    return await this.testScoringService.calculateTestScore(dto);
  }

  @Post('trend/analyze')
  @ApiOperation({ summary: 'Анализ тренда результатов пользователя' })
  @ApiResponse({ 
    status: 200, 
    description: 'Анализ тренда выполнен успешно',
    type: TestTrendResultDto
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 анализов в минуту
  async analyzeTrend(
    @Body() dto: TestTrendAnalysisDto,
    @Request() req
  ): Promise<TestTrendResultDto> {
    // Проверяем, что пользователь может анализировать только свои результаты
    if (dto.userId !== req.user.id && !req.user.isAdmin) {
      throw new ForbiddenException('Вы можете анализировать только свои результаты');
    }

    return await this.testScoringService.analyzeUserTrend(dto);
  }

  @Get('trend/my')
  @ApiOperation({ summary: 'Анализ тренда своих результатов' })
  @ApiQuery({ name: 'testType', required: false, description: 'Тип теста для анализа' })
  @ApiQuery({ name: 'limit', required: false, description: 'Количество результатов для анализа' })
  @ApiResponse({ 
    status: 200, 
    description: 'Анализ тренда выполнен успешно',
    type: TestTrendResultDto
  })
  async analyzeMyTrend(
    @Request() req,
    @Query('testType') testType?: string,
    @Query('limit') limit?: string
  ): Promise<TestTrendResultDto> {
    const dto: TestTrendAnalysisDto = {
      userId: req.user.id,
      testType: testType as any,
      limitResults: limit ? parseInt(limit, 10) : undefined
    };

    return await this.testScoringService.analyzeUserTrend(dto);
  }

  @Get('normative/:testType')
  @ApiOperation({ summary: 'Получить нормативные данные для типа теста' })
  @ApiParam({ name: 'testType', description: 'Тип теста' })
  @ApiResponse({ status: 200, description: 'Нормативные данные получены успешно' })
  async getNormativeData(
    @Param('testType') testType: string
  ): Promise<any> {
    // Этот endpoint возвращает общедоступные нормативные данные
    // Реализация зависит от того, как хранятся нормативные данные
    return {
      testType,
      message: 'Нормативные данные будут добавлены в следующих версиях',
      generalThresholds: {
        high: 80,
        medium: 60,
        low: 0
      },
      colorCoding: {
        high: { code: '#22c55e', name: 'Зеленый' },
        medium: { code: '#f59e0b', name: 'Желтый' },
        low: { code: '#ef4444', name: 'Красный' }
      }
    };
  }

  // Администраторские endpoints

  @Get('admin/trends/overview')
  @ApiOperation({ summary: 'Обзор трендов всех пользователей (только для администраторов)' })
  @ApiResponse({ status: 200, description: 'Обзор трендов получен успешно' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  async getAdminTrendsOverview(@Request() req): Promise<any> {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Доступ разрешен только администраторам');
    }

    // Здесь можно реализовать обзор трендов для всех пользователей
    return {
      message: 'Обзор трендов для администраторов будет реализован',
      totalUsers: 0,
      averageImprovement: 0,
      testTypeStats: {}
    };
  }

  @Post('admin/user/:userId/trend')
  @ApiOperation({ summary: 'Анализ тренда для конкретного пользователя (только для администраторов)' })
  @ApiParam({ name: 'userId', description: 'ID пользователя' })
  @ApiResponse({ 
    status: 200, 
    description: 'Анализ тренда выполнен успешно',
    type: TestTrendResultDto
  })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  async analyzeUserTrendAdmin(
    @Param('userId') userId: string,
    @Body() dto: Omit<TestTrendAnalysisDto, 'userId'>,
    @Request() req
  ): Promise<TestTrendResultDto> {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Доступ разрешен только администраторам');
    }

    return await this.testScoringService.analyzeUserTrend({
      ...dto,
      userId
    });
  }

  // Служебные endpoints

  @Get('health')
  @ApiOperation({ summary: 'Проверка работоспособности сервиса расчета результатов' })
  @ApiResponse({ status: 200, description: 'Сервис работает' })
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    };
  }

  @Get('test-types/supported')
  @ApiOperation({ summary: 'Получить список поддерживаемых типов тестов' })
  @ApiResponse({ status: 200, description: 'Список типов тестов получен' })
  async getSupportedTestTypes(): Promise<any> {
    return {
      supportedTypes: [
        'VISUAL_MEMORY',
        'VERBAL_MEMORY', 
        'AUDITORY_MEMORY',
        'DIGIT_SPAN',
        'VISUAL_ATTENTION',
        'STROOP_TEST',
        'ARITHMETIC',
        'SYMBOL_MEMORY'
      ],
      features: {
        ageNormalization: true,
        detailedAnalysis: true,
        trendAnalysis: true,
        colorCoding: true,
        recommendations: true
      }
    };
  }
}