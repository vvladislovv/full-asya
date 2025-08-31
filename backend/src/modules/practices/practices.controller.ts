import { Controller, Get, Param, UseGuards, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PracticesService } from './practices.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@ApiTags('Practices')
@Controller('practices')
export class PracticesController {
  constructor(private readonly practicesService: PracticesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all practices' })
  @ApiResponse({ status: 200, description: 'List of all practices' })
  async getPractices(): Promise<any[]> {
    return await this.practicesService.getPractices();
  }

  @Get('recommendations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get daily practice recommendations' })
  @ApiResponse({ status: 200, description: 'Daily recommendations retrieved' })
  async getDailyRecommendations(): Promise<any[]> {
    // TODO: Get userId from JWT token
    const userId = 'temp-user-id';
    return await this.practicesService.getDailyRecommendations(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get practice by ID' })
  @ApiResponse({ status: 200, description: 'Practice found' })
  async getPracticeById(@Param('id') id: string): Promise<any> {
    return await this.practicesService.getPracticeById(id);
  }

  @Get(':practiceId/exercises/:exerciseId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get exercise by ID' })
  @ApiResponse({ status: 200, description: 'Exercise found' })
  async getExerciseById(
    @Param('practiceId') practiceId: string,
    @Param('exerciseId') exerciseId: string,
  ): Promise<any> {
    return await this.practicesService.getExerciseById(practiceId, exerciseId);
  }

  @Post(':practiceId/exercises/:exerciseId/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complete exercise and track progress' })
  @ApiResponse({ status: 200, description: 'Exercise completed successfully' })
  async completeExercise(
    @Param('practiceId') practiceId: string,
    @Param('exerciseId') exerciseId: string,
    @Body('score') score: number,
  ): Promise<void> {
    // TODO: Get userId from JWT token
    const userId = 'temp-user-id';
    return await this.practicesService.trackProgress(userId, exerciseId, score);
  }
} 