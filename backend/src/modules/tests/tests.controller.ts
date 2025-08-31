import { CacheResponse } from '@common/interceptors/cache.interceptor';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    Request,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Test, TestResult, TestType } from '@prisma/client';
import { CreateTestDto, StartTestDto, SubmitTestResultDto, UpdateTestDto } from './dto';
import { TestsService } from './tests.service';

@ApiTags('Tests')
@Controller('tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new test' })
  @ApiResponse({ status: 201, description: 'Test created successfully' })
  async create(@Body() createTestDto: CreateTestDto): Promise<Test> {
    return await this.testsService.create(createTestDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @CacheResponse({ ttl: 600, keyPrefix: 'tests' }) // Кэш на 10 минут
  @ApiOperation({ summary: 'Get all tests' })
  @ApiResponse({ status: 200, description: 'List of all tests' })
  async findAll(): Promise<Test[]> {
    return await this.testsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get test by ID' })
  @ApiResponse({ status: 200, description: 'Test found' })
  @ApiResponse({ status: 404, description: 'Test not found' })
  async findOne(@Param('id') id: string): Promise<Test> {
    return await this.testsService.findOne(id);
  }

  @Get('type/:type')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get test by type' })
  @ApiResponse({ status: 200, description: 'Test found' })
  @ApiResponse({ status: 404, description: 'Test not found' })
  async findByType(@Param('type') type: TestType): Promise<Test> {
    return await this.testsService.findByType(type);
  }

  @Get('type/:type/instructions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @CacheResponse({ ttl: 3600, keyPrefix: 'instructions' }) // Кэш на 1 час
  @ApiOperation({ summary: 'Get test instructions by type' })
  @ApiResponse({ status: 200, description: 'Test instructions retrieved' })
  async getTestInstructions(@Param('type') type: TestType): Promise<any> {
    return await this.testsService.getTestInstructions(type);
  }

  @Get('type/:type/questions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ short: { limit: 5, ttl: 1000 } }) // Ограничение: 5 запросов в секунду
  @ApiOperation({ summary: 'Generate test questions by type' })
  @ApiQuery({ name: 'randomized', required: false})
  @ApiResponse({ status: 200, description: 'Test questions generated' })
  async generateTestQuestions(
    @Param('type') type: TestType,
    @Query('randomized') randomized: boolean = true,
  ): Promise<any> {
    return await this.testsService.generateTestQuestions(type, randomized);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update test' })
  @ApiResponse({ status: 200, description: 'Test updated successfully' })
  @ApiResponse({ status: 404, description: 'Test not found' })
  async update(@Param('id') id: string, @Body() updateTestDto: UpdateTestDto): Promise<Test> {
    return await this.testsService.update(id, updateTestDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete test (soft delete)' })
  @ApiResponse({ status: 204, description: 'Test deleted successfully' })
  @ApiResponse({ status: 404, description: 'Test not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.testsService.remove(id);
  }

  @Post('start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start a test' })
  @ApiResponse({ status: 201, description: 'Test started successfully' })
  async startTest(@Body() startTestDto: StartTestDto, @Request() req): Promise<TestResult> {
    const userId = req.user.id;
    
    return await this.testsService.startTest(userId, startTestDto);
  }

  @Post('submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit test result' })
  @ApiResponse({ status: 200, description: 'Test result submitted successfully' })
  async submitTestResult(@Body() submitTestResultDto: SubmitTestResultDto, @Request() req): Promise<TestResult> {
    return await this.testsService.submitTestResult(submitTestResultDto);
  }

  @Get('list/available')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @CacheResponse({ ttl: 3600, keyPrefix: 'available-tests' }) // Кэш на 1 час
  @ApiOperation({ summary: 'Get available test types' })
  @ApiResponse({ status: 200, description: 'Available test types retrieved' })
  async getAvailableTestTypes(): Promise<any> {
    return {
      testTypes: Object.values(TestType).map(type => ({
        type,
        name: this.getTestTypeName(type),
        description: this.getTestTypeDescription(type),
        estimatedDuration: this.getTestTypeDuration(type),
        difficulty: this.getTestTypeDifficulty(type),
      })),
    };
  }

  private getTestTypeName(type: TestType): string {
    const names = {
      [TestType.VISUAL_MEMORY]: 'Визуальная память',
      [TestType.VERBAL_MEMORY]: 'Вербальная память',
      [TestType.AUDITORY_MEMORY]: 'Рече-слуховая память',
      [TestType.DIGIT_SPAN]: 'Объём цифр',
      [TestType.VISUAL_ATTENTION]: 'Зрительная память и внимание',
      [TestType.STROOP_TEST]: 'Тест Струпа',
      [TestType.ARITHMETIC]: 'Счётные операции',
      [TestType.SYMBOL_MEMORY]: 'Символьная память',
    };
    return names[type] || type;
  }

  private getTestTypeDescription(type: TestType): string {
    const descriptions = {
      [TestType.VISUAL_MEMORY]: 'Оценка способности запоминать и воспроизводить визуальную информацию',
      [TestType.VERBAL_MEMORY]: 'Оценка способности запоминать и воспроизводить словесную информацию',
      [TestType.AUDITORY_MEMORY]: 'Оценка способности запоминать и воспроизводить слуховую информацию',
      [TestType.DIGIT_SPAN]: 'Оценка объема кратковременной памяти для цифровой информации',
      [TestType.VISUAL_ATTENTION]: 'Оценка способности концентрировать внимание на зрительных стимулах',
      [TestType.STROOP_TEST]: 'Оценка способности к когнитивному контролю и торможению автоматических реакций',
      [TestType.ARITHMETIC]: 'Оценка способности к математическим вычислениям в уме',
      [TestType.SYMBOL_MEMORY]: 'Оценка способности запоминать соответствия между символами и значениями',
    };
    return descriptions[type] || 'Описание теста';
  }

  private getTestTypeDuration(type: TestType): string {
    const durations = {
      [TestType.VISUAL_MEMORY]: '5-10 минут',
      [TestType.VERBAL_MEMORY]: '3-5 минут',
      [TestType.AUDITORY_MEMORY]: '4-6 минут',
      [TestType.DIGIT_SPAN]: '3-5 минут',
      [TestType.VISUAL_ATTENTION]: '4-7 минут',
      [TestType.STROOP_TEST]: '2-3 минуты',
      [TestType.ARITHMETIC]: '3-5 минут',
      [TestType.SYMBOL_MEMORY]: '4-6 минут',
    };
    return durations[type] || '5 минут';
  }

  private getTestTypeDifficulty(type: TestType): string {
    const difficulties = {
      [TestType.VISUAL_MEMORY]: 'medium',
      [TestType.VERBAL_MEMORY]: 'easy',
      [TestType.AUDITORY_MEMORY]: 'medium',
      [TestType.DIGIT_SPAN]: 'hard',
      [TestType.VISUAL_ATTENTION]: 'medium',
      [TestType.STROOP_TEST]: 'hard',
      [TestType.ARITHMETIC]: 'medium',
      [TestType.SYMBOL_MEMORY]: 'hard',
    };
    return difficulties[type] || 'medium';
  }
} 