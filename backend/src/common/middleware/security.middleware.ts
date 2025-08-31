import { CustomLoggerService } from '@common/services/logger.service';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  constructor(private readonly logger: CustomLoggerService) {
    this.logger.setContext('Security');
  }

  use(req: Request, _res: Response, next: NextFunction) {
    try {
      // Удаляем шумовые/служебные параметры, которые не ожидаются DTO
      if (req.query && typeof req.query === 'object') {
        if ('pref_lang' in req.query) {
          delete (req.query as any).pref_lang;
        }
        // Блокируем опасные ключи
        ['__proto__', 'constructor', 'prototype'].forEach((k) => {
          if (k in req.query) delete (req.query as any)[k];
        });
      }

      next();
    } catch (err: any) {
      this.logger.warn('Security middleware error', err?.message || err);
      next();
    }
  }
}



