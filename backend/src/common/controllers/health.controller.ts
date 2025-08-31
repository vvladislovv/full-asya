import { HealthService, HealthStatus } from '@common/services/health.service';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Get application health status' })
  @ApiResponse({ status: 200, description: 'Health status retrieved' })
  async getHealth(): Promise<HealthStatus> {
    return await this.healthService.getHealthStatus();
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get application metrics' })
  @ApiResponse({ status: 200, description: 'Metrics retrieved' })
  async getMetrics(): Promise<any> {
    return await this.healthService.getDetailedMetrics();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe for Kubernetes' })
  @ApiResponse({ status: 200, description: 'Application is ready' })
  @ApiResponse({ status: 503, description: 'Application is not ready' })
  async getReadiness(): Promise<{ status: string; message: string }> {
    const health = await this.healthService.getHealthStatus();
    
    if (health.status === 'error') {
      throw new Error('Application is not ready');
    }
    
    return {
      status: 'ready',
      message: 'Application is ready to serve requests',
    };
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe for Kubernetes' })
  @ApiResponse({ status: 200, description: 'Application is alive' })
  async getLiveness(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }
}