import {
    CallHandler,
    ExecutionContext,
    Injectable,
    Logger,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class SecurityInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SecurityInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // Логирование подозрительных запросов
    this.logSuspiciousActivity(request);
    
    // Добавление security headers
    this.addSecurityHeaders(response);
    
    return next.handle().pipe(
      tap(() => {
        // Логирование успешных операций
        this.logSuccessfulOperation(request);
      }),
      map((data) => {
        // Фильтрация чувствительных данных из ответа
        return this.filterSensitiveData(data);
      })
    );
  }

  private logSuspiciousActivity(request: any): void {
    const suspiciousPatterns = [
      /(<script|javascript:|on\w+\s*=)/i,
      /(union\s+select|drop\s+table|insert\s+into)/i,
      /(\.\.\/|\.\.\\|\/etc\/|\/proc\/)/i
    ];

    const requestBody = JSON.stringify(request.body || {});
    const queryString = JSON.stringify(request.query || {});
    
    suspiciousPatterns.forEach(pattern => {
      if (pattern.test(requestBody) || pattern.test(queryString)) {
        this.logger.warn('Подозрительная активность обнаружена', {
          ip: request.ip,
          userAgent: request.get('user-agent'),
          url: request.url,
          method: request.method,
          body: request.body,
          query: request.query,
          pattern: pattern.toString()
        });
      }
    });
  }

  private addSecurityHeaders(response: any): void {
    // Дополнительные security headers
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('X-XSS-Protection', '1; mode=block');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  }

  private logSuccessfulOperation(request: any): void {
    // Логирование только критических операций
    const criticalEndpoints = [
      '/dementia-screening',
      '/emotional-state/assess',
      '/users',
      '/test-scoring'
    ];

    if (criticalEndpoints.some(endpoint => request.url.includes(endpoint))) {
      this.logger.log('Критическая операция выполнена', {
        ip: request.ip,
        userId: request.user?.id,
        url: request.url,
        method: request.method,
        timestamp: new Date().toISOString()
      });
    }
  }

  private filterSensitiveData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    // Список чувствительных полей для фильтрации
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'hash',
      'salt'
    ];

    const filtered = { ...data };
    
    sensitiveFields.forEach(field => {
      if (field in filtered) {
        delete filtered[field];
      }
    });

    // Рекурсивная фильтрация для вложенных объектов
    Object.keys(filtered).forEach(key => {
      if (typeof filtered[key] === 'object' && filtered[key] !== null) {
        filtered[key] = this.filterSensitiveData(filtered[key]);
      }
    });

    return filtered;
  }
}