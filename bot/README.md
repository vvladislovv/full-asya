# AsyaBot - Telegram Bot для диагностики рисков деменции

## 🎯 Описание проекта

AsyaBot - это современный Telegram-бот для диагностики рисков деменции с использованием FastAPI и aiogram. Бот проводит интерактивное анкетирование пользователей и на основе ответов рассчитывает уровень риска развития деменции.

## ✨ Основные возможности

- 🤖 **Telegram Bot** с интерактивной анкетой (31 вопрос)
- 🌐 **REST API** на FastAPI с автоматической документацией
- 🗄️ **PostgreSQL** база данных с SQLAlchemy ORM
- 🔄 **Асинхронная архитектура** FastAPI + aiogram
- 🌍 **Многоязычность** (русский/английский)
- 📊 **Автоматический расчет риска** с рекомендациями
- 🔗 **Интеграция с NestJS** бэкендом
- 🔒 **Безопасность** и валидация данных
- 📝 **Логирование** и мониторинг
- 🐳 **Docker** контейнеризация

## 🏗️ Архитектура

```
AsyaBot/
├── main.py                    # 🚀 Единый файл запуска (FastAPI + aiogram)
├── app/
│   ├── api/                   # REST API роуты (health endpoints)
│   ├── bot/                   # Telegram бот
│   ├── data/                  # Данные анкеты
│   ├── models/                # Модели БД
│   ├── services/              # Сервисы (NestJS интеграция)
│   ├── config.py              # Конфигурация
│   ├── database.py            # Настройки БД
│   └── logger.py              # Логирование
├── docker-compose.yml         # Docker Compose
├── Dockerfile                 # Docker образ
├── requirements.txt           # Python зависимости
├── API_DOCUMENTATION.md       # API документация
├── NESTJS_INTEGRATION.md      # Интеграция с NestJS
└── README.md                 # Документация
```

## 🚀 Быстрый запуск

### 1. Подготовка окружения

```bash
# Клонирование репозитория
git clone <repository-url>
cd AsyaBot

# Создание виртуального окружения
python -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate     # Windows

# Установка зависимостей
pip install -r requirements.txt
```

### 2. Настройка переменных окружения

#### Автоматическая настройка (рекомендуется)

```bash
# Запуск интерактивного setup скрипта
python setup_bot.py
```

Скрипт поможет вам:
- Создать Telegram бота через @BotFather
- Настроить все необходимые переменные окружения
- Создать `.env` файл автоматически

#### Ручная настройка

```bash
# Копирование файла с переменными
cp env.example .env

# Редактирование .env файла
nano .env
```

#### Получение Telegram Bot Token

1. Откройте Telegram и найдите @BotFather
2. Отправьте команду `/newbot`
3. Следуйте инструкциям для создания бота
4. Скопируйте полученный токен (выглядит как: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

Обязательные переменные в `.env`:

```env
# Database Configuration
DATABASE_URL=postgresql://asyabot_user:asyabot_password@localhost:5432/asyabot

# NestJS Backend Configuration
NESTJS_BACKEND_URL=http://localhost:3000

# Telegram Bot Token (получите у @BotFather)
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Application Settings
DEBUG=false
LOG_LEVEL=INFO
```

### 3. Запуск с Docker Compose (рекомендуется)

```bash
# Запуск бота
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

### 4. Локальная разработка

```bash
# Запуск приложения
python main.py

# Или с uvicorn напрямую
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## 🌐 API Endpoints

### Health Checks
- `GET /` - Корневой эндпоинт
- `GET /status` - Статус приложения
- `GET /api/v1/health/` - Проверка здоровья
- `GET /api/v1/health/detailed` - Детальная проверка
- `GET /api/v1/health/ready` - Проверка готовности

### Документация API
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🤖 Telegram Bot

### Команды бота:
- `/start` - Начать диагностику
- `/cancel` - Отменить анкету

### Функциональность:
- Выбор языка (русский/английский)
- Интерактивная анкета с кнопками
- Автоматический расчет риска
- Персонализированные рекомендации

## 🛠️ Технический стек

- **Backend**: FastAPI
- **Bot**: aiogram 3.x
- **Database**: PostgreSQL, SQLAlchemy
- **HTTP Client**: httpx
- **Validation**: Pydantic
- **Logging**: loguru
- **Containerization**: Docker, Docker Compose

## 📈 Мониторинг и логирование

### Логирование
- Ротация логов: ежедневно
- Хранение: 30 дней
- Сжатие: ZIP
- Уровни: DEBUG, INFO, WARNING, ERROR

### Health Checks
- Проверка подключения к БД
- Проверка конфигурации бота
- Проверка подключения к NestJS бэкенду
- Детальная диагностика системы

## 🔒 Безопасность

### Реализованные меры:
- ✅ Валидация всех входных данных (Pydantic)
- ✅ Логирование всех операций
- ✅ Безопасное хранение конфигурации
- ✅ CORS настройки
- ✅ Обработка исключений

## 🐛 Troubleshooting

### Проблемы с ботом:

1. **Ошибка "Unauthorized" или "Bot failed to start"**:
   - Убедитесь, что `TELEGRAM_BOT_TOKEN` установлен в `.env` файле
   - Проверьте, что токен действителен (получите новый у @BotFather)
   - Запустите `python setup_bot.py` для автоматической настройки

2. **Бот не отвечает на команды**:
   - Убедитесь, что бот не заблокирован пользователем
   - Проверьте, что бот запущен (в логах должно быть "Bot started successfully")
   - Попробуйте отправить `/start` боту

3. **Проверьте логи бота**:
   ```bash
   tail -f logs/asyabot.log
   ```

## 📊 Статистика проекта

- **Файлов Python**: 12
- **Модулей**: 6 основных модулей
- **API endpoints**: 5
- **Моделей БД**: 2
- **Сервисов**: 1 (NestJS интеграция)

## 🎉 Особенности реализации

### ✅ Единый файл запуска
- **main.py** содержит и FastAPI, и aiogram
- Асинхронная архитектура
- Общие ресурсы и конфигурация

### ✅ Современные технологии
- **aiogram 3.x** - последняя версия
- **FastAPI** - высокопроизводительный API
- **SQLAlchemy 2.x** - современный ORM
- **PostgreSQL** - надежная БД
- **httpx** - асинхронный HTTP клиент
- **Pydantic** - валидация данных

### ✅ Готовность к продакшену
- Логирование и мониторинг
- Health checks
- Обработка ошибок
- Docker контейнеризация
- Безопасность

## 🔧 Исправления и улучшения

### ✅ Исправленные проблемы:

1. **Ошибка завершения анкеты** - добавлена локальная обработка результатов
2. **Обратные вопросы** - корректный учет вопросов 3, 22, 29, 30
3. **Импорты aiogram** - обновлены для версии 3.x
4. **Отсутствующие зависимости** - добавлен loguru в requirements.txt
5. **Обработка ошибок бота** - бот не падает при невалидном токене
6. **Docker Compose** - упрощена конфигурация
7. **Интеграция с NestJS** - добавлена отправка данных в бэкенд
8. **База данных** - добавлено сохранение в PostgreSQL
9. **Документация API** - создана полная документация

### 🧪 Тестирование:

```bash
# Проверка API
curl http://localhost:8000/status

# Проверка health endpoints
curl http://localhost:8000/api/v1/health/
curl http://localhost:8000/api/v1/health/ready
```

### 🎯 Результаты тестирования:

- ✅ **API работает** - все endpoints отвечают корректно
- ✅ **Расчет риска** - корректная обработка всех уровней риска
- ✅ **Обратные вопросы** - правильная логика для вопросов 3, 22, 29, 30
- ✅ **Логирование** - подробные логи всех операций
- ✅ **Docker** - контейнеризация работает стабильно

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи в `logs/asyabot.log`
2. Проверьте документацию API: `http://localhost:8000/docs`
3. Создайте issue в репозитории
4. Обратитесь к команде разработки

## 📄 Лицензия

MIT License

---

**AsyaBot** - современное решение для диагностики рисков деменции с использованием передовых технологий! 🚀 