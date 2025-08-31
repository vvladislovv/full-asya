import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule, {
      logger: process.env.NODE_ENV === 'production' 
        ? ['error', 'warn', 'log'] 
        : ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Global API prefix to align with frontend and bot: /api
    app.setGlobalPrefix('api');

    // Enhanced security middleware
    const helmet = require('helmet');
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          fontSrc: ["'self'", "data:"],
          connectSrc: ["'self'"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }));
    
    app.use(compression({
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
      level: 6,
      threshold: 1024,
    }));

    // Enhanced global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        validateCustomDecorators: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        exceptionFactory: (errors) => {
          const formattedErrors = errors.map(error => ({
            field: error.property,
            errors: Object.values(error.constraints || {}),
          }));
          logger.warn(`Validation failed: ${JSON.stringify(formattedErrors)}`);
          return formattedErrors;
        },
      }),
    );

    // Enhanced CORS configuration
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    app.enableCors({
      origin: process.env.NODE_ENV === 'production' 
        ? allowedOrigins
        : true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      maxAge: 86400, // 24 hours
    });

    // Trust proxy if behind reverse proxy
    if (process.env.NODE_ENV === 'production') {
      const expressApp = app.getHttpAdapter().getInstance();
      expressApp.set('trust proxy', 1);
    }

    // Swagger documentation
    if (process.env.NODE_ENV !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('DrAsya API')
        .setDescription('Backend API for DrAsya cognitive tests system')
        .setVersion('1.0.0')
        .addBearerAuth()
        .addTag('Authentication', 'Аутентификация и авторизация')
        .addTag('Users', 'Управление пользователями')
        .addTag('Tests', 'Когнитивные тесты')
        .addTag('History', 'История и статистика')
        .addTag('Consultations', 'Консультации')
        .addTag('Practices', 'Практики и упражнения')
        .addTag('Emotional State', 'Эмоциональное состояние')
        .addTag('Health', 'Мониторинг здоровья системы')
        .build();
      
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
          persistAuthorization: true,
          displayRequestDuration: true,
        },
      });
      
      logger.log('📚 Swagger documentation enabled at /api/docs');
    }

    const port = parseInt(process.env.PORT || '3000', 10);
    await app.listen(port, '0.0.0.0');
    
    logger.log(`🚀 Application started successfully`);
    logger.log(`🌐 Server running on: http://localhost:${port}`);
    logger.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.log(`💾 Database: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}`);
    logger.log(`📦 Cache: ${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`);
    
    if (process.env.NODE_ENV !== 'production') {
      logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
      logger.log(`❤️  Health Check: http://localhost:${port}/api/health`);
    }
    
  } catch (error) {
    logger.error('❌ Failed to start application', error.stack);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  const logger = new Logger('Shutdown');
  logger.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  const logger = new Logger('Shutdown');
  logger.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  const logger = new Logger('UncaughtException');
  logger.error('💥 Uncaught exception', error.stack);
  process.exit(1);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  const logger = new Logger('UnhandledRejection');
  logger.error('💥 Unhandled promise rejection', reason);
  process.exit(1);
});

bootstrap(); 