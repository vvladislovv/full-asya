#!/bin/bash

# Скрипт для запуска DrAsya с доменом 24mentis.ru
# Использование: ./start-24mentis.sh

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Запуск DrAsya с доменом 24mentis.ru${NC}"

# Токен бота
BOT_TOKEN="7548008973:AAEBP3CkGdk6LY-13VJzHYoalKXNMWaBtZw"

# URL для домена 24mentis.ru
CONSULTATION_URL="https://24mentis.ru/consultation"
MAIN_PAGE_URL="https://24mentis.ru"

echo -e "${GREEN}✅ Настройки:${NC}"
echo "  🤖 Токен бота: ${BOT_TOKEN:0:10}..."
echo "  🏥 URL консультации: $CONSULTATION_URL"
echo "  🏠 URL главной страницы: $MAIN_PAGE_URL"

# Проверяем наличие Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker не установлен${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose не установлен${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker и Docker Compose найдены${NC}"

# Останавливаем существующие контейнеры
echo -e "${YELLOW}🛑 Остановка существующих контейнеров...${NC}"
docker-compose down

# Устанавливаем переменные окружения
export TELEGRAM_BOT_TOKEN="$BOT_TOKEN"
export CONSULTATION_URL="$CONSULTATION_URL"
export MAIN_PAGE_URL="$MAIN_PAGE_URL"
export DEBUG="false"
export LOG_LEVEL="INFO"

echo -e "${BLUE}🔧 Настройка переменных окружения:${NC}"
echo "  TELEGRAM_BOT_TOKEN: ${BOT_TOKEN:0:10}..."
echo "  CONSULTATION_URL: $CONSULTATION_URL"
echo "  MAIN_PAGE_URL: $MAIN_PAGE_URL"
echo "  DEBUG: false"
echo "  LOG_LEVEL: INFO"

# Собираем и запускаем контейнеры
echo -e "${YELLOW}🏗️  Сборка и запуск контейнеров...${NC}"
docker-compose up --build -d

# Ждем запуска сервисов
echo -e "${YELLOW}⏳ Ожидание запуска сервисов...${NC}"
sleep 10

# Проверяем статус контейнеров
echo -e "${BLUE}📊 Статус контейнеров:${NC}"
docker-compose ps

# Проверяем доступность API
echo -e "${YELLOW}🔍 Проверка доступности API...${NC}"
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend API доступен${NC}"
else
    echo -e "${RED}❌ Backend API недоступен${NC}"
fi

# Проверяем доступность бота
echo -e "${YELLOW}🔍 Проверка доступности бота...${NC}"
if curl -f http://localhost:8000/status > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Bot API доступен${NC}"
else
    echo -e "${RED}❌ Bot API недоступен${NC}"
fi

# Проверяем доступность фронтенда
echo -e "${YELLOW}🔍 Проверка доступности фронтенда...${NC}"
if curl -f http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend доступен${NC}"
else
    echo -e "${RED}❌ Frontend недоступен${NC}"
fi

echo -e "${GREEN}🎉 Запуск завершен!${NC}"
echo ""
echo -e "${BLUE}📋 Доступные сервисы:${NC}"
echo "  🌐 Frontend: http://localhost:5173"
echo "  🔧 Backend API: http://localhost:3000/api"
echo "  📚 API Docs: http://localhost:3000/api/docs"
echo "  🤖 Bot API: http://localhost:8000"
echo "  📊 Bot Status: http://localhost:8000/status"
echo ""
echo -e "${BLUE}🌐 Внешние URL:${NC}"
echo "  🏠 Главная страница: $MAIN_PAGE_URL"
echo "  🏥 Консультации: $CONSULTATION_URL"
echo ""
echo -e "${YELLOW}📝 Для настройки webhook'а Telegram бота:${NC}"
echo "  curl -X POST \"https://api.telegram.org/bot$BOT_TOKEN/deleteWebhook\""
echo "  # Бот работает в режиме polling"
echo ""
echo -e "${BLUE}📖 Логи сервисов:${NC}"
echo "  docker-compose logs -f backend  # Логи backend"
echo "  docker-compose logs -f bot      # Логи бота"
echo "  docker-compose logs -f frontend # Логи frontend"
echo ""
echo -e "${GREEN}✨ Готово! Ваш Telegram бот готов к работе с доменом 24mentis.ru!${NC}"
