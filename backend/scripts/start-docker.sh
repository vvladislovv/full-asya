#!/bin/bash

# 🐳 Запуск Docker сервисов для DrAsya Backend
echo "🐳 Запуск Docker сервисов..."

# Остановка существующих контейнеров
echo "🛑 Остановка существующих контейнеров..."
docker-compose down

# Создание .env если не существует
if [ ! -f .env ]; then
    echo "📝 Создание .env файла..."
    cp env.example .env
    echo "✅ .env файл создан. Отредактируйте настройки при необходимости."
fi

# Запуск сервисов
echo "🚀 Запуск PostgreSQL и Redis..."
docker-compose up -d postgres redis

# Ожидание готовности сервисов
echo "⏳ Ожидание готовности сервисов..."
sleep 10

# Проверка статуса сервисов
echo "📊 Статус сервисов:"
docker-compose ps

# Проверка подключения к PostgreSQL
echo "🔍 Проверка PostgreSQL..."
if docker-compose exec -T postgres pg_isready -U postgres; then
    echo "✅ PostgreSQL готов"
else
    echo "❌ PostgreSQL не готов"
fi

# Проверка подключения к Redis
echo "🔍 Проверка Redis..."
if docker-compose exec -T redis redis-cli ping | grep -q "PONG"; then
    echo "✅ Redis готов"
else
    echo "❌ Redis не готов"
fi

echo ""
echo "🎉 Docker сервисы запущены!"
echo "📌 PostgreSQL: localhost:5432"
echo "📌 Redis: localhost:6379"
echo ""
echo "📝 Следующие шаги:"
echo "1. npm install"
echo "2. npm run seed"
echo "3. npm run start:dev"