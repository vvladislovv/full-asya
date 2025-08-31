import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import {
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    Param,
    Patch,
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
import { Language, TestType } from '@prisma/client';
import {
    CreateTestStageDto,
    GetTestStagesDto,
    InitializeStagesDto,
    TestStageResultDto,
    TestStagesSetDto,
    UpdateTestStageDto
} from './dto';
import { TestStagesService } from './test-stages.service';

@ApiTags('Test Stages')
@Controller('test-stages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TestStagesController {
  constructor(private readonly testStagesService: TestStagesService) {}

  @Get()
  @ApiOperation({ summary: 'Получить все этапы тестов' })
  @ApiResponse({ 
    status: 200, 
    description: 'Этапы получены успешно',
    type: [TestStageResultDto]
  })
  @Throttle({ default: { limit: 100, ttl: 60000 } }) // 100 запросов в минуту
  async findAll(@Query() query: GetTestStagesDto): Promise<TestStageResultDto[]> {
    return await this.testStagesService.findAll(query);
  }

  @Get('test-type/:testType')
  @ApiOperation({ summary: 'Получить все этапы для конкретного типа теста' })
  @ApiParam({ name: 'testType', enum: TestType })
  @ApiQuery({ name: 'language', enum: Language, required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Этапы теста получены успешно',
    type: TestStagesSetDto
  })
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  async findByTestType(
    @Param('testType') testType: TestType,
    @Query('language') language?: Language
  ): Promise<TestStagesSetDto> {
    return await this.testStagesService.findByTestType(
      testType, 
      language || Language.ru
    );
  }

  @Get('test-type/:testType/stage/:stage')
  @ApiOperation({ summary: 'Получить конкретный этап теста' })
  @ApiParam({ name: 'testType', enum: TestType })
  @ApiParam({ name: 'stage', description: 'Номер этапа (1-5)' })
  @ApiQuery({ name: 'language', enum: Language, required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Этап найден',
    type: TestStageResultDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Этап не найден' 
  })
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  async findByTypeAndStage(
    @Param('testType') testType: TestType,
    @Param('stage') stage: string,
    @Query('language') language?: Language
  ): Promise<TestStageResultDto> {
    const stageNumber = parseInt(stage, 10);
    return await this.testStagesService.findByTypeAndStage(
      testType, 
      stageNumber, 
      language || Language.ru
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить этап по ID' })
  @ApiQuery({ name: 'language', enum: Language, required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Этап найден',
    type: TestStageResultDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Этап не найден' 
  })
  async findOne(
    @Param('id') id: string,
    @Query('language') language?: Language
  ): Promise<TestStageResultDto> {
    return await this.testStagesService.findOne(id, language || Language.ru);
  }

  // Администраторские методы

  @Post()
  @ApiOperation({ summary: 'Создать новый этап теста (только для администраторов)' })
  @ApiResponse({ 
    status: 201, 
    description: 'Этап создан успешно',
    type: TestStageResultDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Некорректные данные' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Доступ запрещен' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Этап уже существует' 
  })
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 создания в минуту
  async create(
    @Body() createDto: CreateTestStageDto,
    @Request() req
  ): Promise<TestStageResultDto> {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Доступ разрешен только администраторам');
    }

    return await this.testStagesService.create(createDto);
  }

  @Post('initialize')
  @ApiOperation({ summary: 'Инициализировать стандартные этапы для всех тестов (только для администраторов)' })
  @ApiResponse({ 
    status: 201, 
    description: 'Этапы инициализированы успешно' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Доступ запрещен' 
  })
  @Throttle({ default: { limit: 1, ttl: 300000 } }) // 1 инициализация в 5 минут
  async initializeDefaultStages(
    @Body() dto: InitializeStagesDto,
    @Request() req
  ): Promise<{ message: string; created: number; updated: number }> {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Доступ разрешен только администраторам');
    }

    const result = await this.testStagesService.initializeDefaultStages(dto);
    
    return {
      message: 'Этапы инициализированы успешно',
      created: result.created,
      updated: result.updated
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить этап теста (только для администраторов)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Этап обновлен успешно',
    type: TestStageResultDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Этап не найден' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Доступ запрещен' 
  })
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 обновлений в минуту
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTestStageDto,
    @Request() req
  ): Promise<TestStageResultDto> {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Доступ разрешен только администраторам');
    }

    return await this.testStagesService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить этап теста (только для администраторов)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Этап удален успешно' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Этап не найден' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Доступ запрещен' 
  })
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 удалений в минуту
  async remove(
    @Param('id') id: string,
    @Request() req
  ): Promise<{ message: string }> {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Доступ разрешен только администраторам');
    }

    await this.testStagesService.remove(id);
    return { message: 'Этап удален успешно' };
  }
}