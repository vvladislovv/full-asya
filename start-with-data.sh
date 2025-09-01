#!/bin/bash

echo "🚀 Запуск проекта с инициализацией базы данных..."

# Остановка всех контейнеров
echo "⏹️ Остановка существующих контейнеров..."
docker-compose down

# Запуск основных сервисов
echo "🐳 Запуск Docker контейнеров..."
docker-compose up -d

# Ожидание запуска базы данных
echo "⏳ Ожидание запуска базы данных..."
sleep 10

# Установка зависимостей и миграции в backend
echo "📦 Установка зависимостей backend..."
docker-compose exec backend npm install

echo "🗃️ Применение миграций базы данных..."
docker-compose exec backend npx prisma migrate deploy

echo "🌱 Заполнение базы данных тестовыми данными..."
docker-compose exec backend npx prisma db seed

echo "✅ Проект запущен!"
echo ""
echo "🌐 Доступные сервисы:"
echo "• Frontend: http://localhost:3000"
echo "• Backend API: http://localhost:8000"
echo "• Bot: работает в фоне"
echo ""
echo "👥 Тестовые пользователи:"
echo "• Telegram ID: 123456789 (Test User)"
echo "• Telegram ID: 987654321 (Мария Иванова)"
echo "• Telegram ID: 555666777 (John Doe)"
echo ""
echo "🧪 В системе доступно 8 тестов:"
echo "• Визуальная память"
echo "• Вербальная память"
echo "• Рече-слуховая память" 
echo "• Объём цифр"
echo "• Зрительная память и внимание"
echo "• Тест Струпа"
echo "• Счётные операции"
echo "• Символьная память"
echo ""
echo "📱 Для тестирования откройте http://localhost:3000 и войдите с любым из тестовых Telegram ID"


