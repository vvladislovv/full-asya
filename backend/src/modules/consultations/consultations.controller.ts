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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Consultation, ConsultationStatus } from '@prisma/client';
import { ConsultationsService } from './consultations.service';
import { CreateConsultationDto, UpdateConsultationDto } from './dto';

@ApiTags('Consultations')
@Controller('consultations')
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new consultation' })
  @ApiResponse({ status: 201, description: 'Consultation created successfully'})
  async create(@Body() createConsultationDto: CreateConsultationDto, @Request() req): Promise<Consultation> {
    const userId = req.user.id;
    return await this.consultationsService.create(userId, createConsultationDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all consultations' })
  @ApiResponse({ status: 200, description: 'List of all consultations' })
  async findAll(): Promise<Consultation[]> {
    return await this.consultationsService.findAll();
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user consultations' })
  @ApiResponse({ status: 200, description: 'User consultations retrieved' })
  async findMyConsultations(@Request() req): Promise<Consultation[]> {
    const userId = req.user.id;
    return await this.consultationsService.findByUserId(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get consultation by ID' })
  @ApiResponse({ status: 200, description: 'Consultation found'})
  @ApiResponse({ status: 404, description: 'Consultation not found' })
  async findOne(@Param('id') id: string): Promise<Consultation> {
    return await this.consultationsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update consultation' })
  @ApiResponse({ status: 200, description: 'Consultation updated successfully'})
  @ApiResponse({ status: 404, description: 'Consultation not found' })
  async update(@Param('id') id: string, @Body() updateConsultationDto: UpdateConsultationDto): Promise<Consultation> {
    return await this.consultationsService.update(id, updateConsultationDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update consultation status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully'})
  async updateStatus(@Param('id') id: string, @Body('status') status: ConsultationStatus): Promise<Consultation> {
    return await this.consultationsService.update(id, { status });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete consultation' })
  @ApiResponse({ status: 204, description: 'Consultation deleted successfully' })
  @ApiResponse({ status: 404, description: 'Consultation not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.consultationsService.remove(id);
  }

  @Get('slots/available')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get available consultation slots' })
  @ApiResponse({ status: 200, description: 'Available slots retrieved' })
  async getAvailableSlots(@Query('date') date: string): Promise<any> {
    return await this.consultationsService.getAvailableSlots();
  }
} 