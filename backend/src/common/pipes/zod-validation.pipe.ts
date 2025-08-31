import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ZodError, ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(err => {
          const path = err.path.join('.');
          return `${path}: ${err.message}`;
        });
        
        throw new BadRequestException({
          message: 'Ошибка валидации данных',
          errors: errorMessages,
          statusCode: 400
        });
      }
      throw new BadRequestException('Неверные данные');
    }
  }
}

// Декоратор для упрощения использования
export const ZodBody = (schema: ZodSchema) => {
  return (target: any, propertyKey: string, parameterIndex: number) => {
    // Этот декоратор можно использовать с @Body() для автоматической валидации
  };
};