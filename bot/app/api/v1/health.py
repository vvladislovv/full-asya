from fastapi import APIRouter
from typing import Dict, Any

from app.config import settings
from app.logger import get_logger

logger = get_logger("api.health")
router = APIRouter()


@router.get("/")
async def health_check() -> Dict[str, Any]:
    """Проверка здоровья системы"""
    logger.debug("Health check requested")
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }


@router.get("/detailed")
async def detailed_health_check() -> Dict[str, Any]:
    """Детальная проверка здоровья системы"""
    logger.info("Detailed health check requested")
    
    # Общий статус
    overall_status = "healthy"
    logger.info(f"Overall health status: {overall_status}")
    
    return {
        "status": overall_status,
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "telegram_bot": {
            "status": "configured" if settings.TELEGRAM_BOT_TOKEN and settings.TELEGRAM_BOT_TOKEN != "your_telegram_bot_token_here" else "not_configured"
        }
    }


@router.get("/ready")
async def readiness_check() -> Dict[str, Any]:
    """Проверка готовности системы к работе"""
    logger.info("Readiness check requested")
    
    # Проверка конфигурации бота
    bot_configured = bool(settings.TELEGRAM_BOT_TOKEN and settings.TELEGRAM_BOT_TOKEN != "your_telegram_bot_token_here")
    
    logger.debug(f"Bot configured: {bot_configured}")
    
    if not bot_configured:
        logger.warning("Bot not configured")
        return {
            "status": "not_ready",
            "message": "Bot token not configured",
            "bot_configured": bot_configured
        }
    
    logger.info("System is ready")
    return {
        "status": "ready",
        "message": "All systems operational"
    } 