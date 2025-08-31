# AsyaBot API Documentation

## 🌐 FastAPI Endpoints (Port 8000)

### Health Checks
```
GET / - Корневой эндпоинт
GET /status - Статус приложения
GET /api/v1/health/ - Проверка здоровья
GET /api/v1/health/detailed - Детальная проверка
GET /api/v1/health/ready - Проверка готовности
```

### Примеры вызовов:

```bash
# Проверка статуса
curl http://localhost:8000/status

# Проверка здоровья
curl http://localhost:8000/api/v1/health/

# Детальная проверка
curl http://localhost:8000/api/v1/health/detailed

# Проверка готовности
curl http://localhost:8000/api/v1/health/ready
```

### Swagger UI
```
http://localhost:8000/docs
```

---

## 🏗️ NestJS Backend API (Port 3000)

### Required Endpoints

#### 1. Создание анкеты
```
POST /api/questionnaires
Content-Type: application/json
```

**Request Body:**
```json
{
  "telegram_id": 123456789,
  "username": "user123",
  "first_name": "Иван",
  "last_name": "Иванов",
  "language": "ru",
  "responses": {
    "1": "Да",
    "2": "Нет",
    "3": "Иногда",
    // ... все 31 ответ
  },
  "risk_level": "medium",
  "risk_score": 45,
  "recommendations": [
    "Рекомендуется консультация специалиста",
    "Увеличьте физическую активность",
    "Тренируйте память и внимание"
  ],
  "created_at": "2025-08-07T18:30:00.000Z",
  "completed_at": "2025-08-07T18:35:00.000Z"
}
```

**Response:**
```json
{
  "id": 1,
  "telegram_id": 123456789,
  "status": "completed",
  "created_at": "2025-08-07T18:30:00.000Z"
}
```

#### 2. Отправка результатов анкеты
```
POST /api/questionnaires/result
Content-Type: application/json
```

**Request Body:**
```json
{
  "telegram_id": 123456789,
  "questionnaire_id": 1,
  "risk_level": "medium",
  "risk_score": 45,
  "recommendations": [
    "Рекомендуется консультация специалиста",
    "Увеличьте физическую активность",
    "Тренируйте память и внимание"
  ],
  "should_consult": true
}
```

**Response:**
```json
{
  "id": 1,
  "telegram_id": 123456789,
  "questionnaire_id": 1,
  "status": "result_sent",
  "created_at": "2025-08-07T18:35:00.000Z"
}
```

---

## 📊 Database Schema

### Таблица: questionnaires
```sql
CREATE TABLE questionnaires (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    language VARCHAR(10) DEFAULT 'ru',
    responses JSON NOT NULL,
    risk_level VARCHAR(50),
    risk_score INTEGER,
    recommendations JSON,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_questionnaires_telegram_id ON questionnaires(telegram_id);
```

### Таблица: questionnaire_responses
```sql
CREATE TABLE questionnaire_responses (
    id SERIAL PRIMARY KEY,
    questionnaire_id INTEGER NOT NULL,
    question_number INTEGER NOT NULL,
    answer VARCHAR(255) NOT NULL,
    answer_weight INTEGER,
    is_reverse_question BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id)
);

CREATE INDEX idx_questionnaire_responses_questionnaire_id ON questionnaire_responses(questionnaire_id);
```

---

## 🔄 Data Flow

### 1. Пользователь проходит анкету в Telegram боте
```
User → Telegram Bot → Local Risk Calculation → Database Save → NestJS Backend
```

### 2. Данные сохраняются в PostgreSQL
- Основная информация анкеты в таблице `questionnaires`
- Детальные ответы в таблице `questionnaire_responses`

### 3. Данные отправляются в NestJS бэкенд
- POST `/api/questionnaires` - полные данные анкеты
- POST `/api/questionnaires/result` - результаты анализа

---

## 🛠️ Implementation Notes

### NestJS Backend Requirements:

1. **Endpoint: POST /api/questionnaires**
   - Принимает полные данные анкеты
   - Возвращает ID созданной записи
   - Статус коды: 200, 201, 400, 500

2. **Endpoint: POST /api/questionnaires/result**
   - Принимает результаты анализа
   - Возвращает подтверждение отправки
   - Статус коды: 200, 201, 400, 500

3. **Обработка ошибок:**
   - Логирование всех запросов
   - Валидация входных данных
   - Graceful handling ошибок

4. **CORS настройки:**
   - Разрешить запросы с localhost:8000
   - Content-Type: application/json

### Пример NestJS Controller:

```typescript
// questionnaires.controller.ts
@Controller('api/questionnaires')
export class QuestionnairesController {
  
  @Post()
  async createQuestionnaire(@Body() questionnaireData: CreateQuestionnaireDto) {
    // Сохранение в БД
    // Логирование
    // Возврат результата
  }
  
  @Post('result')
  async sendResult(@Body() resultData: QuestionnaireResultDto) {
    // Обработка результатов
    // Логирование
    // Возврат подтверждения
  }
}
```

---

## 🚀 Testing

### Тестирование FastAPI:
```bash
# Проверка здоровья
curl http://localhost:8000/api/v1/health/

# Проверка готовности
curl http://localhost:8000/api/v1/health/ready
```

### Тестирование NestJS Backend:
```bash
# Тест создания анкеты
curl -X POST http://localhost:3000/api/questionnaires \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_id": 123456789,
    "username": "test_user",
    "language": "ru",
    "responses": {"1": "Да", "2": "Нет"},
    "risk_level": "medium",
    "risk_score": 45
  }'

# Тест отправки результатов
curl -X POST http://localhost:3000/api/questionnaires/result \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_id": 123456789,
    "questionnaire_id": 1,
    "risk_level": "medium",
    "risk_score": 45
  }'
```

---

## 📝 Logs

### Логирование в AsyaBot:
- Все операции с БД
- Отправка данных в NestJS
- Ошибки и исключения
- Статистика использования

### Логирование в NestJS:
- Входящие запросы
- Сохранение данных
- Ошибки валидации
- Статистика API

---

## 🔧 Configuration

### Environment Variables:

**AsyaBot (.env):**
```env
DATABASE_URL=postgresql://asyabot_user:asyabot_password@localhost:5432/asyabot
NESTJS_BACKEND_URL=http://localhost:3000
TELEGRAM_BOT_TOKEN=your_bot_token
DEBUG=false
LOG_LEVEL=INFO
```

**NestJS Backend:**
```env
DATABASE_URL=your_database_url
PORT=3000
NODE_ENV=development
```
