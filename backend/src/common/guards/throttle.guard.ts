import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerException, ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async throwThrottlingException(context: ExecutionContext): Promise<void> {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = this.getClientIP(request);
    const userAgent = request.headers['user-agent'] || 'unknown';
    
    // Логируем попытку превышения лимита
    console.warn(`🚨 Rate limit exceeded for IP: ${ip}, User-Agent: ${userAgent}`);
    
    throw new ThrottlerException('Превышен лимит запросов. Попробуйте позже.');
  }

  protected async getTracker(req: Request): Promise<string> {
    // Используем IP адрес + User-Agent для более точного трекинга
    const ip = this.getClientIP(req);
    const userAgent = req.headers['user-agent'] || '';
    const userId = (req as any).user?.id;
    
    // Если пользователь авторизован, используем его ID
    if (userId) {
      return `user:${userId}`;
    }
    
    // Иначе используем IP + первые символы User-Agent
    const shortUserAgent = userAgent.substring(0, 50);
    return `${ip}:${Buffer.from(shortUserAgent).toString('base64').substring(0, 10)}`;
  }

  private getClientIP(req: Request): string {
    // Получаем реальный IP клиента с учетом прокси
    return (
      req.headers['cf-connecting-ip'] ||
      req.headers['x-real-ip'] ||
      req.headers['x-forwarded-for']?.toString().split(',')[0] ||
      req.socket.remoteAddress ||
      'unknown'
    ) as string;
  }

  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Пропускаем проверку для health check endpoints
    if (request.url?.includes('/health') || request.url?.includes('/metrics')) {
      return true;
    }
    
    // Пропускаем для внутренних запросов
    const ip = this.getClientIP(request);
    if (['127.0.0.1', '::1', 'localhost'].includes(ip)) {
      return true;
    }
    
    return false;
  }
}