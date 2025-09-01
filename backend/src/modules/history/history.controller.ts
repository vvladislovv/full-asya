import { CacheResponse } from '@common/interceptors/cache.interceptor';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import {
    Controller,
    Get,
    Param,
    Query,
    Request,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { TestResult, TestType } from '@prisma/client';
import { GetHistoryDto, GetHistoryStatsDto, GetTestResultDto } from './dto';
import { HistoryService } from './history.service';

@ApiTags('History')
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @CacheResponse({ ttl: 60, keyPrefix: 'user-history' }) // Кэш на 1 минуту
  @ApiOperation({ summary: 'Get user test history' })
  @ApiResponse({ status: 200, description: 'User history retrieved' })
  async getUserHistory(@Query() getHistoryDto: GetHistoryDto, @Request() req): Promise<TestResult[]> {
    const userId = req.user.id;
    return await this.historyService.getUserHistory(userId, getHistoryDto);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @CacheResponse({ ttl: 10, keyPrefix: 'user-stats' }) // Кэш на 10 секунд для тестирования
  @Throttle({ medium: { limit: 10, ttl: 10000 } }) // 10 запросов в 10 секунд
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({ status: 200, description: 'User statistics retrieved' })
  async getUserStats(@Query() getHistoryStatsDto: GetHistoryStatsDto, @Request() req): Promise<any> {
    const userId = req.user.id;
    return await this.historyService.getUserStats(userId, getHistoryStatsDto);
  }

  @Get('test-type/:testType')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get history for specific test type' })
  @ApiResponse({ status: 200, description: 'Test type history retrieved' })
  async getTestTypeHistory(@Param('testType') testType: TestType, @Request() req): Promise<any[]> {
    const userId = req.user.id;
    const results = await this.historyService.getTestTypeHistory(userId, testType);
    return results;
  }

  @Get('progress/:testType')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get progress trend for test type' })
  @ApiResponse({ status: 200, description: 'Progress trend retrieved' })
  async getProgressTrend(
    @Param('testType') testType: TestType,
    @Query('days') days: number = 30,
    @Request() req,
  ): Promise<any> {
    const userId = req.user.id;
    return await this.historyService.getProgressTrend(userId, testType);
  }

  @Get('comparison/:testType')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get comparison with average for test type' })
  @ApiResponse({ status: 200, description: 'Comparison data retrieved' })
  async getComparisonWithAverage(@Param('testType') testType: TestType, @Request() req): Promise<any> {
    const userId = req.user.id;
    return await this.historyService.getComparisonWithAverage(userId, testType);
  }

  @Get('result/:resultId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get specific test result' })
  @ApiResponse({ status: 200, description: 'Test result retrieved'})
  @ApiResponse({ status: 404, description: 'Test result not found' })
  async getTestResult(@Param() getTestResultDto: GetTestResultDto, @Request() req): Promise<any> {
    const userId = req.user.id;
    // Simplified implementation for now
    return { message: 'Test result details', id: getTestResultDto.id };
  }
} 