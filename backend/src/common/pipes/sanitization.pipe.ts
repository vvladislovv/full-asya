import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class SanitizationPipe implements PipeTransform {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Рекурсивная очистка объектов
    const sanitizedValue = this.sanitizeObject(value);
    
    const object = plainToClass(metatype, sanitizedValue);
    const errors = await validate(object);
    
    if (errors.length > 0) {
      // Логируем попытки инъекций
      console.warn('Потенциальная попытка инъекции обнаружена:', {
        errors: errors.map(e => e.constraints),
        originalValue: value,
        sanitizedValue
      });
    }
    
    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return this.sanitizeValue(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const sanitizedKey = this.sanitizeValue(key);
        sanitized[sanitizedKey] = this.sanitizeObject(obj[key]);
      }
    }

    return sanitized;
  }

  private sanitizeValue(value: any): any {
    if (typeof value === 'string') {
      // Удаляем потенциально опасные символы
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Удаляем script теги
        .replace(/javascript:/gi, '') // Удаляем javascript: протокол
        .replace(/on\w+\s*=/gi, '') // Удаляем event handlers
        .trim();
    }
    
    return value;
  }
}