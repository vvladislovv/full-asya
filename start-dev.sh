#!/bin/bash

echo "🚀 Запуск DrAsya в режиме разработки..."

# Проверяем, что Docker запущен
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker не запущен. Пожалуйста, запустите Docker и попробуйте снова."
    exit 1
fi

# Останавливаем существующие контейнеры
echo "🛑 Остановка существующих контейнеров..."
docker-compose down

# Запускаем все сервисы
echo "🐳 Запуск всех сервисов..."
docker-compose up -d

# Ждем готовности сервисов
echo "⏳ Ожидание готовности сервисов..."
sleep 15

# Проверяем статус
echo "📊 Статус сервисов:"
docker-compose ps

echo ""
echo "🎉 Приложение запущено!"
echo ""
echo "📋 Доступные сервисы:"
echo "   🌐 Фронтенд: http://localhost:80 (через nginx)"
echo "   🔧 API Backend: http://localhost:80/api"
echo "   📚 Прямой доступ к API: http://localhost:3000/api"
echo "   🤖 Bot API: http://localhost:8000"
echo ""
echo "🛑 Для остановки: docker-compose down"
echo "📊 Для просмотра логов: docker-compose logs -f [service_name]"
echo "🔄 Для перезапуска: docker-compose restart [service_name]"


