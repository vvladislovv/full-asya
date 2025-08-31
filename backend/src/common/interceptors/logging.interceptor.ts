import { CustomLoggerService } from '@common/services/logger.service';
import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: CustomLoggerService) {
    this.logger.setContext('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'http') {
      return this.logHttpCall(context, next);
    }
    
    return next.handle();
  }

  private logHttpCall(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, body, query, params, ip, headers } = request;
    
    const userAgent = headers['user-agent'] || '';
    const userId = (request as any).user?.id || 'anonymous';
    
    const requestId = this.generateRequestId();
    response.setHeader('X-Request-ID', requestId);

    const startTime = Date.now();

    // Логируем входящий запрос
    this.logger.logRequest(method, url, userId, requestId, {
      ip,
      userAgent,
      body: this.sanitizeBody(body),
      query,
      params,
    });

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        const { statusCode } = response;
        
        this.logger.logResponse(method, url, statusCode, duration, userId, requestId);
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        
        this.logger.logError(error, 'HTTP', userId, requestId);
        
        throw error;
      })
    );
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;
    
    const sensitive = ['password', 'token', 'secret', 'key'];
    const sanitized = { ...body };
    
    Object.keys(sanitized).forEach(key => {
      if (sensitive.some(field => key.toLowerCase().includes(field))) {
        sanitized[key] = '***';
      }
    });
    
    return sanitized;
  }
}