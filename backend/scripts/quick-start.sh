#!/bin/bash

# 🚀 Быстрый запуск DrAsya Backend API
# Автоматическая настройка и запуск всей системы

set -e

echo "🚀 Запуск DrAsya Backend API..."
echo "================================="

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции для вывода
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Проверка Node.js
echo ""
info "Проверка Node.js..."
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        success "Node.js $(node -v) установлен"
    else
        error "Требуется Node.js 18+, установлен: $(node -v)"
        exit 1
    fi
else
    error "Node.js не установлен. Установите Node.js 18+: https://nodejs.org/"
    exit 1
fi

# Проверка npm
if command -v npm >/dev/null 2>&1; then
    success "npm $(npm -v) доступен"
else
    error "npm не установлен"
    exit 1
fi

# Проверка Docker (опционально)
if command -v docker >/dev/null 2>&1; then
    success "Docker $(docker --version | cut -d' ' -f3 | cut -d',' -f1) доступен"
    DOCKER_AVAILABLE=true
else
    warning "Docker не установлен. Будет запуск без Docker."
    DOCKER_AVAILABLE=false
fi

# Проверка docker-compose (опционально)
if command -v docker-compose >/dev/null 2>&1; then
    success "Docker Compose $(docker-compose --version | cut -d' ' -f3 | cut -d',' -f1) доступен"
    COMPOSE_AVAILABLE=true
else
    warning "Docker Compose не установлен"
    COMPOSE_AVAILABLE=false
fi

# Установка зависимостей
echo ""
info "Установка зависимостей..."
if npm install; then
    success "Зависимости установлены"
else
    error "Ошибка установки зависимостей"
    exit 1
fi

# Проверка .env файла
echo ""
info "Проверка конфигурации..."
if [ ! -f .env ]; then
    warning ".env файл не найден. Создаю из примера..."
    if [ -f env.example ]; then
        cp env.example .env
        success "Создан .env файл из env.example"
        warning "Не забудьте настроить переменные в .env файле!"
    else
        error "env.example не найден"
        exit 1
    fi
else
    success ".env файл существует"
fi

# Системная проверка
echo ""
info "Запуск системной диагностики..."
if npm run check; then
    success "Системная проверка пройдена"
else
    warning "Обнаружены проблемы в системной проверке"
    read -p "Продолжить запуск? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Выбор способа запуска
echo ""
info "Выберите способ запуска:"
echo "1) Docker Compose (рекомендуется) - автоматически запустит PostgreSQL и Redis"
echo "2) Локальный запуск - требует настроенные PostgreSQL и Redis"
echo "3) Только проверки безопасности"

if [ "$DOCKER_AVAILABLE" = true ] && [ "$COMPOSE_AVAILABLE" = true ]; then
    read -p "Введите номер (1-3) [1]: " -n 1 -r
    echo
    CHOICE=${REPLY:-1}
else
    warning "Docker недоступен, доступен только локальный запуск"
    CHOICE=2
fi

case $CHOICE in
    1)
        echo ""
        info "Запуск с Docker Compose..."
        
        # Создание сети Docker если не существует
        if ! docker network ls | grep -q asya-network; then
            docker network create asya-network || true
        fi
        
        # Запуск сервисов
        if docker-compose up -d; then
            success "Docker сервисы запущены"
            
            # Ожидание готовности сервисов
            echo ""
            info "Ожидание готовности сервисов..."
            sleep 10
            
            # Проверка здоровья сервисов
            if docker-compose ps | grep -q "Up (healthy)"; then
                success "Сервисы здоровы"
            else
                warning "Некоторые сервисы могут быть еще не готовы"
            fi
            
            # Инициализация базы данных
            echo ""
            info "Инициализация базы данных..."
            sleep 5
            if docker-compose exec app npm run seed; then
                success "База данных инициализирована"
            else
                warning "Возможны проблемы с инициализацией БД"
            fi
            
        else
            error "Ошибка запуска Docker сервисов"
            exit 1
        fi
        ;;
        
    2)
        echo ""
        info "Локальный запуск..."
        
        # Проверка PostgreSQL
        if ! nc -z localhost 5432 2>/dev/null; then
            error "PostgreSQL недоступен на порту 5432"
            echo "Запустите PostgreSQL или используйте Docker Compose"
            exit 1
        else
            success "PostgreSQL доступен"
        fi
        
        # Проверка Redis
        if ! nc -z localhost 6379 2>/dev/null; then
            warning "Redis недоступен на порту 6379"
            echo "Рекомендуется запустить Redis для кэширования"
        else
            success "Redis доступен"
        fi
        
        # Инициализация базы данных
        echo ""
        info "Инициализация базы данных..."
        if npm run seed; then
            success "База данных инициализирована"
        else
            warning "Возможны проблемы с инициализацией БД"
        fi
        
        # Запуск приложения
        echo ""
        info "Запуск приложения..."
        npm run start:dev &
        APP_PID=$!
        
        # Ожидание запуска
        sleep 5
        ;;
        
    3)
        echo ""
        info "Запуск только тестов безопасности..."
        
        # Предполагаем, что приложение уже запущено
        sleep 2
        ;;
        
    *)
        error "Неверный выбор"
        exit 1
        ;;
esac

# Ожидание готовности приложения
echo ""
info "Проверка готовности приложения..."
for i in {1..30}; do
    if curl -f http://localhost:3000/health >/dev/null 2>&1; then
        success "Приложение готово!"
        break
    fi
    echo -n "."
    sleep 1
done

if ! curl -f http://localhost:3000/health >/dev/null 2>&1; then
    error "Приложение не отвечает на health check"
    exit 1
fi

# Тесты безопасности
if [ "$CHOICE" != "3" ]; then
    echo ""
    info "Запуск тестов безопасности..."
    if npm run test:security; then
        success "Тесты безопасности пройдены"
    else
        warning "Обнаружены проблемы безопасности"
    fi
fi

# Финальная информация
echo ""
echo "🎉 Система запущена успешно!"
echo "================================"
echo ""
success "🌐 API сервер: http://localhost:3000"
success "📚 Документация: http://localhost:3000/api/docs"
success "❤️  Health Check: http://localhost:3000/health"
success "📊 Метрики: http://localhost:3000/health/metrics"
echo ""

if [ "$CHOICE" = "1" ]; then
    info "Для остановки сервисов: docker-compose down"
    info "Для просмотра логов: docker-compose logs -f"
elif [ "$CHOICE" = "2" ]; then
    info "Для остановки приложения: Ctrl+C"
    info "PID процесса: $APP_PID"
fi

echo ""
info "Полезные команды:"
echo "  npm run check          - проверка системы"
echo "  npm run test:security  - тесты безопасности"
echo "  npm run seed          - инициализация данных"
echo ""

# Проверка доступности ключевых endpoints
echo ""
info "Проверка ключевых endpoints..."

endpoints=(
    "/health:Health Check"
    "/tests/available:Доступные тесты"
    "/api/docs:Документация API"
)

for endpoint_info in "${endpoints[@]}"; do
    endpoint=$(echo $endpoint_info | cut -d':' -f1)
    description=$(echo $endpoint_info | cut -d':' -f2)
    
    if curl -f "http://localhost:3000$endpoint" >/dev/null 2>&1; then
        success "$description ($endpoint)"
    else
        warning "$description недоступен ($endpoint)"
    fi
done

echo ""
echo "✨ Готово! Система полностью настроена и готова к использованию."

# Опционально: открыть браузер
if command -v open >/dev/null 2>&1; then  # macOS
    read -p "Открыть документацию API в браузере? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open http://localhost:3000/api/docs
    fi
elif command -v xdg-open >/dev/null 2>&1; then  # Linux
    read -p "Открыть документацию API в браузере? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        xdg-open http://localhost:3000/api/docs
    fi
fi