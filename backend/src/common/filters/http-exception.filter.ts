import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
// import { QueryFailedError } from 'typeorm'; // Removed TypeORM dependency

export interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
  details?: any;
  errorCode?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Внутренняя ошибка сервера';
    let details: any = null;
    let errorCode = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = this.translateMessage(exceptionResponse);
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = this.translateMessage(responseObj.message || responseObj.error);
        details = responseObj.details;
        errorCode = responseObj.errorCode || this.getErrorCodeByStatus(status);
      }
    } else if ((exception as any).name === 'PrismaClientKnownRequestError') {
      status = HttpStatus.BAD_REQUEST;
      message = this.translateDatabaseError(exception);
      errorCode = 'DATABASE_ERROR';
    } else if (exception instanceof Error) {
      message = this.translateMessage(exception.message);
      errorCode = 'APPLICATION_ERROR';
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      errorCode,
    };

    if (details) {
      errorResponse.details = details;
    }

    // Логируем ошибку
    this.logger.error(
      `HTTP ${status} Error: ${message}`,
      exception instanceof Error ? exception.stack : exception,
      `${request.method} ${request.url}`,
    );

    response.status(status).json(errorResponse);
  }

  private translateMessage(message: string | string[]): string {
    if (Array.isArray(message)) {
      return message.map(msg => this.translateSingleMessage(msg)).join(', ');
    }
    return this.translateSingleMessage(message);
  }

  private translateSingleMessage(message: string): string {
    const translations: Record<string, string> = {
      // Аутентификация и авторизация
      'Unauthorized': 'Не авторизован',
      'Forbidden': 'Доступ запрещен',
      'Invalid credentials': 'Неверные учетные данные',
      'Token expired': 'Токен истек',
      'Invalid token': 'Недействительный токен',
      'User not found': 'Пользователь не найден',
      'User not found or inactive': 'Пользователь не найден или неактивен',
      
      // Валидация
      'Validation failed': 'Ошибка валидации',
      'Bad Request': 'Неверный запрос',
      'Invalid input': 'Неверные входные данные',
      'Required field missing': 'Обязательное поле отсутствует',
      
      // Тесты
      'Test not found': 'Тест не найден',
      'Test result not found': 'Результат теста не найден',
      'Test already completed': 'Тест уже завершен',
      'Invalid test type': 'Недопустимый тип теста',
      
      // Консультации
      'Consultation not found': 'Консультация не найдена',
      'Slot not available': 'Время недоступно',
      'Invalid date': 'Неверная дата',
      
      // Общие ошибки
      'Not Found': 'Не найдено',
      'Internal Server Error': 'Внутренняя ошибка сервера',
      'Service Unavailable': 'Сервис недоступен',
      'Too Many Requests': 'Слишком много запросов',
      'Conflict': 'Конфликт',
      
      // Валидация полей
      'should not be empty': 'не должно быть пустым',
      'must be a string': 'должно быть строкой',
      'must be a number': 'должно быть числом',
      'must be a valid email': 'должно быть корректным email',
      'must be a valid UUID': 'должно быть корректным UUID',
      'must be a valid date': 'должно быть корректной датой',
    };

    // Проверяем точное соответствие
    if (translations[message]) {
      return translations[message];
    }

    // Проверяем частичные соответствия
    for (const [key, value] of Object.entries(translations)) {
      if (message.includes(key)) {
        return message.replace(key, value);
      }
    }

    return message;
  }

  private translateDatabaseError(error: any): string {
    const message = error.message.toLowerCase();
    
    if (message.includes('duplicate key') || message.includes('unique constraint')) {
      return 'Запись с такими данными уже существует';
    }
    
    if (message.includes('foreign key constraint')) {
      return 'Нарушение связности данных';
    }
    
    if (message.includes('not null constraint')) {
      return 'Обязательное поле не заполнено';
    }
    
    if (message.includes('check constraint')) {
      return 'Данные не соответствуют требованиям';
    }
    
    if (message.includes('connection')) {
      return 'Ошибка подключения к базе данных';
    }
    
    return 'Ошибка базы данных';
  }

  private getErrorCodeByStatus(status: number): string {
    const codes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
    };
    
    return codes[status] || 'UNKNOWN_ERROR';
  }
}