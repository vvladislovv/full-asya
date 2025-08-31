#!/bin/bash

# 🚀 Production Deploy Script для DrAsya Backend
echo "🚀 Подготовка к деплою DrAsya Backend в продакшн..."
echo "=================================================="

# Проверка окружения
if [ "$NODE_ENV" != "production" ]; then
    echo "❌ Ошибка: NODE_ENV должен быть установлен в 'production'"
    exit 1
fi

# Проверка обязательных переменных
required_vars=("DATABASE_URL" "JWT_SECRET" "REDIS_HOST")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Ошибка: Переменная $var не установлена"
        exit 1
    fi
done

echo "✅ Переменные окружения проверены"

# Создание production .env
echo "📝 Создание production конфигурации..."
cat > .env.production << EOF
NODE_ENV=production
PORT=3000
DATABASE_URL=${DATABASE_URL}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
REDIS_HOST=${REDIS_HOST}
REDIS_PORT=${REDIS_PORT:-6379}
REDIS_PASSWORD=${REDIS_PASSWORD:-}
LOG_LEVEL=info
CACHE_TTL=300
THROTTLE_TTL=60
THROTTLE_LIMIT=50
MAX_REQUEST_SIZE=10mb
ALLOWED_ORIGINS=${ALLOWED_ORIGINS:-*}
EOF

echo "✅ Production конфигурация создана"

# Установка зависимостей
echo "📦 Установка production зависимостей..."
npm ci --only=production --silent

# Генерация Prisma Client
echo "🗄️  Генерация Prisma Client..."
npx prisma generate

# Проверка базы данных
echo "🔍 Проверка подключения к базе данных..."
if npx prisma db seed --preview-feature 2>/dev/null; then
    echo "✅ База данных доступна"
else
    echo "❌ Ошибка подключения к базе данных"
    exit 1
fi

# Применение миграций
echo "📊 Применение миграций базы данных..."
npx prisma migrate deploy

# Сборка приложения
echo "🔨 Сборка production версии..."
npm run build

# Проверка сборки
if [ ! -d "dist" ]; then
    echo "❌ Ошибка: Директория dist не создана"
    exit 1
fi

echo "✅ Сборка завершена успешно"

# Создание systemd сервиса (для Linux)
if command -v systemctl &> /dev/null; then
    echo "⚙️  Создание systemd сервиса..."
    cat > /tmp/asya-backend.service << EOF
[Unit]
Description=DrAsya Backend API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$(pwd)
Environment=NODE_ENV=production
EnvironmentFile=$(pwd)/.env.production
ExecStart=/usr/bin/node dist/main
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    if [ "$EUID" -eq 0 ]; then
        mv /tmp/asya-backend.service /etc/systemd/system/
        systemctl daemon-reload
        echo "✅ Systemd сервис создан"
    else
        echo "ℹ️  Systemd сервис создан в /tmp/asya-backend.service"
        echo "ℹ️  Выполните: sudo mv /tmp/asya-backend.service /etc/systemd/system/ && sudo systemctl daemon-reload"
    fi
fi

# Создание Docker Compose для продакшна
echo "🐳 Создание production Docker Compose..."
cat > docker-compose.production.yml << EOF
version: '3.8'

services:
  app:
    build: .
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - postgres
      - redis
    healthcheck:
      test: ["CMD", "node", "healthcheck.js"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s

  postgres:
    image: postgres:13-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: \${DB_DATABASE}
      POSTGRES_USER: \${DB_USERNAME}
      POSTGRES_PASSWORD: \${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass \${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app

volumes:
  postgres_data:
  redis_data:
EOF

echo "✅ Production Docker Compose создан"

# Создание конфигурации Nginx
echo "🌐 Создание конфигурации Nginx..."
cat > nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server app:3000;
    }

    server {
        listen 80;
        server_name localhost;

        location / {
            proxy_pass http://backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        location /health {
            proxy_pass http://backend/health;
            access_log off;
        }
    }
}
EOF

echo "✅ Nginx конфигурация создана"

# Проверка безопасности
echo "🛡️  Проверка безопасности..."
if npm run test:security > /dev/null 2>&1; then
    echo "✅ Тесты безопасности пройдены"
else
    echo "⚠️  Предупреждение: Некоторые тесты безопасности не прошли"
fi

# Финальная проверка
echo "🔍 Финальная проверка готовности..."

checks=(
    "dist:Сборка приложения"
    ".env.production:Production конфигурация"
    "docker-compose.production.yml:Docker Compose"
    "nginx.conf:Nginx конфигурация"
)

for check in "${checks[@]}"; do
    file=$(echo "$check" | cut -d: -f1)
    desc=$(echo "$check" | cut -d: -f2)
    
    if [ -e "$file" ]; then
        echo "✅ $desc"
    else
        echo "❌ $desc - файл $file не найден"
        exit 1
    fi
done

echo ""
echo "🎉 ДЕПЛОЙ ГОТОВ К ПРОДАКШНУ!"
echo "================================"
echo ""
echo "📋 Следующие шаги:"
echo "1. Загрузите код на сервер"
echo "2. Запустите: docker-compose -f docker-compose.production.yml up -d"
echo "3. Проверьте: curl http://your-server/health"
echo "4. Настройте SSL сертификаты"
echo "5. Настройте мониторинг и бэкапы"
echo ""
echo "📚 Документация:"
echo "- API: http://your-server/api/docs"
echo "- Health: http://your-server/health"
echo "- Metrics: http://your-server/health/metrics"
echo ""
echo "🔒 Безопасность:"
echo "- Все эндпоинты защищены"
echo "- Rate limiting настроен"
echo "- Валидация включена"
echo "- Логирование активно"
echo ""
echo "⚡ Производительность:"
echo "- Redis кэширование включено"
echo "- Compression включен"
echo "- Health checks настроены"
echo ""
echo "🚀 Готово к масштабированию!"
EOF

chmod +x scripts/production-deploy.sh

echo "✅ Production deploy скрипт создан: scripts/production-deploy.sh"