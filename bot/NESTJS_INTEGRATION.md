# NestJS Integration Guide

## 🎯 Что нужно реализовать в NestJS Backend

### 1. Создать два endpoint'а:

#### POST /api/questionnaires
**Принимает:** Полные данные анкеты
**Возвращает:** ID созданной записи

#### POST /api/questionnaires/result  
**Принимает:** Результаты анализа
**Возвращает:** Подтверждение отправки

### 2. Структура данных:

```typescript
// POST /api/questionnaires
interface CreateQuestionnaireDto {
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  language: string;
  responses: Record<string, string>; // 31 ответ
  risk_level: string;
  risk_score: number;
  recommendations: string[];
  created_at: string;
  completed_at: string;
}

// POST /api/questionnaires/result
interface QuestionnaireResultDto {
  telegram_id: number;
  questionnaire_id: number;
  risk_level: string;
  risk_score: number;
  recommendations: string[];
  should_consult: boolean;
}
```

### 3. Пример контроллера:

```typescript
@Controller('api/questionnaires')
export class QuestionnairesController {
  
  @Post()
  async createQuestionnaire(@Body() data: CreateQuestionnaireDto) {
    // Сохранить в БД
    // Вернуть { id: number, status: 'completed' }
  }
  
  @Post('result')
  async sendResult(@Body() data: QuestionnaireResultDto) {
    // Обработать результаты
    // Вернуть { id: number, status: 'result_sent' }
  }
}
```

### 4. CORS настройки:

```typescript
// main.ts
app.enableCors({
  origin: ['http://localhost:8000'],
  methods: ['POST'],
  allowedHeaders: ['Content-Type'],
});
```

### 5. Валидация:

```typescript
// DTOs
export class CreateQuestionnaireDto {
  @IsNumber()
  telegram_id: number;
  
  @IsString()
  @IsOptional()
  username?: string;
  
  @IsString()
  language: string;
  
  @IsObject()
  responses: Record<string, string>;
  
  @IsString()
  risk_level: string;
  
  @IsNumber()
  risk_score: number;
  
  @IsArray()
  @IsString({ each: true })
  recommendations: string[];
}
```

## 🚀 Готово к интеграции!

AsyaBot будет отправлять данные на эти endpoint'ы автоматически после завершения анкеты.
