import os
from typing import Optional
from pydantic_settings import BaseSettings
from loguru import logger


class Settings(BaseSettings):
    # Основные настройки
    PROJECT_NAME: str = "AsyaBot"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # База данных
    DATABASE_URL: str = "postgresql://asya_user:asya_password@localhost:5432/asya_db"
    
    # NestJS Backend
    NESTJS_BACKEND_URL: str = "http://localhost:3000"
    
    # Telegram Bot
    TELEGRAM_BOT_TOKEN: str = ""
    
    # Логирование
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/asyabot.log"
    
    # API настройки
    API_V1_STR: str = "/api/v1"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Создание экземпляра настроек
settings = Settings()

# Настройка логирования
logger.add(
    settings.LOG_FILE,
    level=settings.LOG_LEVEL,
    rotation="1 day",
    retention="30 days",
    compression="zip",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {name}:{function}:{line} | {message}"
)

# Проверка обязательных переменных окружения
def validate_settings():
    """Проверка обязательных настроек"""
    # Проверяем токен бота отдельно
    if not settings.TELEGRAM_BOT_TOKEN or settings.TELEGRAM_BOT_TOKEN == "your_telegram_bot_token_here":
        logger.warning("TELEGRAM_BOT_TOKEN is not set. Bot functionality will be disabled.")


# Валидация при импорте
validate_settings() 