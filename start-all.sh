#!/bin/bash

echo "🚀 Запуск всех сервисов DrAsya через Docker..."

# Проверяем, что Docker запущен
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker не запущен. Пожалуйста, запустите Docker и попробуйте снова."
    exit 1
fi

# Функция для ожидания готовности HTTP сервиса
wait_for_service() {
    local service_name=$1
    local url=$2
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Ожидание готовности $service_name..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo "✅ $service_name готов!"
            return 0
        fi
        
        echo "   Попытка $attempt/$max_attempts..."
        sleep 2
        ((attempt++))
    done
    
    echo "❌ $service_name не готов после $max_attempts попыток"
    return 1
}

# Останавливаем существующие контейнеры
echo "🛑 Остановка существующих контейнеров..."
docker-compose down

# Запускаем все сервисы через Docker Compose
echo "🐳 Запуск всех сервисов через Docker Compose..."
docker-compose up -d

# Ждем готовности PostgreSQL
echo "⏳ Ожидание готовности PostgreSQL..."
sleep 10

# Ждем готовности бэкенда
wait_for_service "NestJS Backend" "http://localhost:3000/api/health" || exit 1

# Ждем готовности фронтенда
wait_for_service "Next.js Frontend" "http://localhost:5173" || exit 1

# Ждем готовности бота
wait_for_service "Telegram Bot" "http://localhost:8000/health" || exit 1

echo ""
echo "🎉 Все сервисы запущены успешно через Docker!"
echo ""
echo "📋 Доступные сервисы:"
echo "   🌐 Фронтенд: http://localhost:5173"
echo "   🔧 API Backend: http://localhost:3000"
echo "   📚 API Docs: http://localhost:3000/api/docs"
echo "   🤖 Bot API: http://localhost:8000"
echo ""
echo "🐳 Docker контейнеры:"
docker-compose ps
echo ""
echo "🛑 Для остановки всех сервисов выполните: docker-compose down"
echo "📊 Для просмотра логов: docker-compose logs -f [service_name]"
echo "🔄 Для перезапуска: docker-compose restart [service_name]"
