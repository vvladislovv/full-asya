# DrAsya - Система когнитивных тестов

Полная система для проведения когнитивных тестов с интеграцией Telegram бота, NestJS бэкенда и Angular фронтенда.

## 🏗️ Архитектура системы

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Telegram Bot  │    │  NestJS Backend │    │ Angular Frontend│
│   (AsyaBot)     │◄──►│   (AsyaBackend) │◄──►│ (angular_Dr_Asya)│
│   Port: 8000    │    │   Port: 3000    │    │   Port: 4200    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   PostgreSQL    │
                       │   Port: 5432    │
                       └─────────────────┘
```

## 🚀 Быстрый запуск

### Предварительные требования

1. **Node.js** (версия 18+)
2. **Python** (версия 3.8+)
3. **Docker** и **Docker Compose**
4. **Git**

### Установка и запуск

1. **Клонируйте репозиторий:**
   ```bash
   git clone <repository-url>
   cd AsyaProdject
   ```

2. **Запустите все сервисы одной командой:**
   ```bash
   ./start-all.sh
   ```

   Или запустите каждый сервис отдельно:

   ```bash
   # Запуск базы данных
   cd AsyaBackend
   docker-compose up -d postgres redis
   
   # Применение миграций
   npx prisma migrate deploy
   npx prisma generate
   
   # Запуск бэкенда
   npm run start:dev
   
   # В новом терминале - запуск бота
   cd ../AsyaBot
   python -m venv venv
   source venv/bin/activate  # На Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python main.py
   
   # В новом терминале - запуск фронтенда
   cd ../angular_Dr_Asya
   npm install
   ng serve
   ```

## 📋 Доступные сервисы

После запуска будут доступны:

- **🌐 Фронтенд:** http://localhost:4200
- **🔧 API Backend:** http://localhost:3000
- **📚 API Documentation:** http://localhost:3000/api/docs
- **🤖 Bot API:** http://localhost:8000
- **📊 Bot Data Dashboard:** http://localhost:4200/bot-data

## 🔧 Конфигурация

### Telegram Bot

1. Создайте бота через @BotFather в Telegram
2. Получите токен бота
3. Создайте файл `.env` в папке `AsyaBot`:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
NESTJS_BACKEND_URL=http://localhost:3000
DATABASE_URL=postgresql://asyabot_user:asyabot_password@localhost:5432/asyabot
```

### База данных

Настройки базы данных находятся в `AsyaBackend/.env`:

```env
DATABASE_URL=postgresql://asyabot_user:asyabot_password@localhost:5432/asya_db
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 🔄 Поток данных

### 1. Telegram Bot → Backend
- Пользователь проходит анкету в боте
- Бот отправляет данные в NestJS бэкенд
- Данные сохраняются в PostgreSQL

### 2. Backend → Frontend
- Angular приложение получает данные через API
- Отображает статистику и результаты анкет
- Кэширует данные для быстрого доступа

### 3. Интеграция
- Все сервисы связаны через REST API
- Данные синхронизируются в реальном времени
- Поддержка многоязычности (RU/EN)

## 📊 Функциональность

### Telegram Bot
- ✅ Интерактивные анкеты
- ✅ Автоматический расчет рисков
- ✅ Персонализированные рекомендации
- ✅ Многоязычная поддержка

### Backend API
- ✅ RESTful API с документацией
- ✅ Аутентификация и авторизация
- ✅ Кэширование с Redis
- ✅ Валидация данных
- ✅ Логирование и мониторинг

### Frontend
- ✅ Современный UI/UX
- ✅ Адаптивный дизайн
- ✅ Дашборд с данными от бота
- ✅ Интерактивные графики
- ✅ Экспорт результатов

## 🛠️ Разработка

### Структура проекта

```
AsyaProdject/
├── AsyaBot/              # Telegram бот (Python/FastAPI)
├── AsyaBackend/          # Backend API (NestJS/TypeScript)
├── angular_Dr_Asya/      # Frontend (Angular/TypeScript)
└── start-all.sh          # Скрипт запуска всех сервисов
```

### Команды разработки

```bash
# Backend
cd AsyaBackend
npm run start:dev          # Запуск в режиме разработки
npm run build              # Сборка для продакшена
npm run test               # Запуск тестов

# Frontend
cd angular_Dr_Asya
ng serve                   # Запуск в режиме разработки
ng build                   # Сборка для продакшена
ng test                    # Запуск тестов

# Bot
cd AsyaBot
python main.py             # Запуск бота
```

## 🔍 Мониторинг и логи

- **Backend логи:** `AsyaBackend/logs/`
- **Bot логи:** `AsyaBot/logs/`
- **Health checks:** 
  - Backend: http://localhost:3000/health
  - Bot: http://localhost:8000/status

## 🚨 Устранение неполадок

### Проблемы с базой данных
```bash
cd AsyaBackend
docker-compose down
docker-compose up -d postgres
npx prisma migrate reset
```

### Проблемы с ботом
```bash
cd AsyaBot
# Проверьте токен в .env файле
python -c "import requests; print(requests.get('http://localhost:3000/health').json())"
```

### Проблемы с фронтендом
```bash
cd angular_Dr_Asya
npm install
ng serve --port 4200
```

## 📝 Лицензия

MIT License

## 🤝 Поддержка

Для получения поддержки создайте issue в репозитории или обратитесь к команде разработки.
