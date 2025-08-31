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
import { Language } from '@prisma/client';
import {
    CreateEmotionalAssessmentDto,
    EmotionalAssessmentResultDto
} from './dto';
import { EmotionalStateService } from './emotional-state.service';

@ApiTags('Emotional State')
@Controller('emotional-state')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EmotionalStateController {
  constructor(private readonly emotionalStateService: EmotionalStateService) {}

  @Get('questions')
  @ApiOperation({ summary: 'Получить вопросы для оценки эмоционального состояния' })
  @ApiQuery({ name: 'language', enum: Language, required: false })
  @ApiResponse({ status: 200, description: 'Вопросы получены успешно' })
  @Throttle({ default: { limit: 100, ttl: 60000 } }) // 100 запросов в минуту
  async getQuestions(@Query('language') language?: Language): Promise<any> {
    return await this.emotionalStateService.getEmotionalStateQuestions(
      language || Language.ru
    );
  }

  @Post('assess')
  @ApiOperation({ summary: 'Создать оценку эмоционального состояния' })
  @ApiResponse({ 
    status: 201, 
    description: 'Оценка создана успешно',
    type: EmotionalAssessmentResultDto
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 404, description: 'Пользователь или результат теста не найден' })
  @Throttle({ default: { limit: 20, ttl: 300000 } }) // 20 оценок в 5 минут
  async createAssessment(
    @Body() dto: CreateEmotionalAssessmentDto,
    @Request() req
  ): Promise<EmotionalAssessmentResultDto> {
    // Проверяем, что пользователь может создавать оценку только для себя
    if (dto.userId !== req.user.id) {
      throw new ForbiddenException('Вы можете создавать оценку только для себя');
    }

    return await this.emotionalStateService.createAssessment(dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Получить свои эмоциональные оценки' })
  @ApiResponse({ 
    status: 200, 
    description: 'Оценки получены успешно',
    type: [EmotionalAssessmentResultDto]
  })
  async getMyAssessments(@Request() req): Promise<EmotionalAssessmentResultDto[]> {
    return await this.emotionalStateService.findByUserId(req.user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Получить статистику эмоциональных оценок' })
  @ApiResponse({ status: 200, description: 'Статистика получена успешно' })
  async getMyStats(@Request() req): Promise<any> {
    return await this.emotionalStateService.getStats(req.user.id);
  }

  @Get('test-result/:testResultId')
  @ApiOperation({ summary: 'Получить эмоциональные оценки для результата теста' })
  @ApiParam({ name: 'testResultId', description: 'ID результата теста' })
  @ApiResponse({ 
    status: 200, 
    description: 'Оценки получены успешно',
    type: [EmotionalAssessmentResultDto]
  })
  async getAssessmentsByTestResult(
    @Param('testResultId') testResultId: string,
    @Request() req
  ): Promise<EmotionalAssessmentResultDto[]> {
    // Дополнительная проверка безопасности: убеждаемся что результат теста принадлежит пользователю
    const assessments = await this.emotionalStateService.findByTestResultId(testResultId);
    
    // Проверяем что все найденные оценки принадлежат текущему пользователю
    const hasUnauthorized = assessments.some(assessment => assessment.userId !== req.user.id);
    if (hasUnauthorized && !req.user.isAdmin) {
      throw new ForbiddenException('Доступ запрещен');
    }

    return assessments;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить эмоциональную оценку по ID' })
  @ApiParam({ name: 'id', description: 'ID эмоциональной оценки' })
  @ApiResponse({ 
    status: 200, 
    description: 'Оценка найдена',
    type: EmotionalAssessmentResultDto
  })
  @ApiResponse({ status: 404, description: 'Оценка не найдена' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  async getAssessment(
    @Param('id') id: string,
    @Request() req
  ): Promise<EmotionalAssessmentResultDto> {
    const assessment = await this.emotionalStateService.findOne(id);
    
    // Проверяем, что пользователь может получать только свои оценки
    if (assessment.userId !== req.user.id && !req.user.isAdmin) {
      throw new ForbiddenException('Доступ запрещен');
    }

    return assessment;
  }

  // Администраторские endpoints

  @Get('admin/stats')
  @ApiOperation({ summary: 'Получить общую статистику эмоциональных оценок (только для администраторов)' })
  @ApiResponse({ status: 200, description: 'Статистика получена успешно' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  async getAdminStats(@Request() req): Promise<any> {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Доступ разрешен только администраторам');
    }

    return await this.emotionalStateService.getStats();
  }

  @Get('admin/user/:userId')
  @ApiOperation({ summary: 'Получить эмоциональные оценки пользователя (только для администраторов)' })
  @ApiParam({ name: 'userId', description: 'ID пользователя' })
  @ApiResponse({ 
    status: 200, 
    description: 'Оценки получены успешно',
    type: [EmotionalAssessmentResultDto]
  })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  async getUserAssessments(
    @Param('userId') userId: string,
    @Request() req
  ): Promise<EmotionalAssessmentResultDto[]> {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Доступ разрешен только администраторам');
    }

    return await this.emotionalStateService.findByUserId(userId);
  }

  // Метод для обратной совместимости (deprecated)
  @Post('analyze')
  @ApiOperation({ 
    summary: 'Анализ эмоционального состояния (устаревший метод)',
    deprecated: true
  })
  @ApiResponse({ status: 200, description: 'Анализ выполнен успешно' })
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async analyzeEmotionalState(
    @Body() answers: Record<string, any>,
    @Query('language') language?: Language
  ): Promise<any> {
    return await this.emotionalStateService.analyzeEmotionalState(
      answers, 
      language || Language.ru
    );
  }
} 