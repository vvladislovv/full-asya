import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import {
    Body,
    Controller,
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
    ApiResponse,
    ApiTags
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { DementiaScreeningService } from './dementia-screening.service';
import {
    CreateDementiaScreeningDto,
    DementiaScreeningResultDto,
    DementiaScreeningStatsDto,
    GetScreeningQuestionsDto,
    UpdateDementiaScreeningDto
} from './dto';

@ApiTags('Dementia Screening')
@Controller('dementia-screening')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DementiaScreeningController {
  constructor(private readonly dementiaScreeningService: DementiaScreeningService) {}

  @Get('questions')
  @ApiOperation({ summary: 'Получить вопросы диагностической анкеты' })
  @ApiResponse({ 
    status: 200, 
    description: 'Вопросы анкеты получены успешно' 
  })
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 запросов в минуту
  async getQuestions(@Query() query: GetScreeningQuestionsDto) {
    return await this.dementiaScreeningService.getQuestions(query);
  }

  @Post()
  @ApiOperation({ summary: 'Создать новую диагностическую анкету' })
  @ApiResponse({ 
    status: 201, 
    description: 'Анкета создана успешно',
    type: DementiaScreeningResultDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Некорректные данные' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Пользователь не найден' 
  })
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 попыток в 5 минут
  async create(
    @Body() createDto: CreateDementiaScreeningDto,
    @Request() req
  ): Promise<DementiaScreeningResultDto> {
    // Проверяем, что пользователь может создавать анкету только для себя
    if (createDto.userId !== req.user.id) {
      throw new ForbiddenException('Вы можете создавать анкету только для себя');
    }

    return await this.dementiaScreeningService.create(createDto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Получить свои диагностические анкеты' })
  @ApiResponse({ 
    status: 200, 
    description: 'Анкеты получены успешно',
    type: [DementiaScreeningResultDto]
  })
  async getMyScreenings(@Request() req): Promise<DementiaScreeningResultDto[]> {
    return await this.dementiaScreeningService.findByUserId(req.user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Получить статистику диагностических анкет (только для администраторов)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Статистика получена успешно',
    type: DementiaScreeningStatsDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Доступ запрещен' 
  })
  async getStats(@Request() req): Promise<DementiaScreeningStatsDto> {
    // Простая проверка на администратора (можно улучшить)
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Доступ разрешен только администраторам');
    }

    return await this.dementiaScreeningService.getStats();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Получить анкеты пользователя (только для администраторов)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Анкеты пользователя получены успешно',
    type: [DementiaScreeningResultDto]
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Доступ запрещен' 
  })
  async getUserScreenings(
    @Param('userId') userId: string,
    @Request() req
  ): Promise<DementiaScreeningResultDto[]> {
    // Пользователь может получать только свои анкеты или администратор любые
    if (userId !== req.user.id && !req.user.isAdmin) {
      throw new ForbiddenException('Доступ запрещен');
    }

    return await this.dementiaScreeningService.findByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить диагностическую анкету по ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Анкета найдена',
    type: DementiaScreeningResultDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Анкета не найдена' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Доступ запрещен' 
  })
  async findOne(
    @Param('id') id: string,
    @Request() req
  ): Promise<DementiaScreeningResultDto> {
    const screening = await this.dementiaScreeningService.findOne(id);
    
    // Проверяем, что пользователь может получать только свои анкеты
    if (screening.userId !== req.user.id && !req.user.isAdmin) {
      throw new ForbiddenException('Доступ запрещен');
    }

    return screening;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить диагностическую анкету (только для администраторов)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Анкета обновлена успешно',
    type: DementiaScreeningResultDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Анкета не найдена' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Доступ запрещен' 
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateDementiaScreeningDto,
    @Request() req
  ): Promise<DementiaScreeningResultDto> {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Доступ разрешен только администраторам');
    }

    return await this.dementiaScreeningService.update(id, updateDto);
  }
}