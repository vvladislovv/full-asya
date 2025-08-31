#!/usr/bin/env python3
"""
AsyaBot - Единый файл запуска (FastAPI + aiogram)
"""
import asyncio
import signal
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

from app.config import settings
from app.database import init_db, check_db_connection
from app.api.v1 import router as api_router
from app.logger import get_logger
from app.bot.bot import start_bot, shutdown_bot, register_handlers

# Инициализация логгера
logger = get_logger("main")

# Глобальные переменные для управления жизненным циклом
bot_task = None
shutdown_event = asyncio.Event()

def signal_handler(signum, frame):
    """Обработчик сигналов для корректного завершения"""
    logger.info(f"Received signal {signum}, initiating shutdown...")
    shutdown_event.set()

# Регистрируем обработчики сигналов
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Управление жизненным циклом приложения"""
    global bot_task
    
    # Startup
    logger.info("Starting AsyaBot application...")
    
    try:
        # Инициализация базы данных
        init_db()
        logger.info("Database initialized successfully")
        
        # Проверка подключения к БД
        if not check_db_connection():
            logger.warning("Database connection failed, but continuing...")
        else:
            logger.info("Database connection successful")
        
        # Регистрируем обработчики бота (если бот включен)
        try:
            register_handlers()
        except Exception:
            logger.debug("Bot handlers not registered (bot disabled)")
        
        # Запуск бота как отдельной задачи (если есть токен)
        bot_task = asyncio.create_task(start_bot())
        logger.info("Bot started successfully")
        
        logger.info("Application startup completed")
        
    except Exception as e:
        logger.error(f"Startup failed: {e}")
        logger.info("Starting bot without database...")
        
        # Запускаем бота даже при ошибке БД
        try:
            try:
                register_handlers()
            except Exception:
                logger.debug("Bot handlers not registered (bot disabled)")
            bot_task = asyncio.create_task(start_bot())
            logger.info("Bot started successfully (without database)")
        except Exception as bot_error:
            logger.error(f"Bot failed to start: {bot_error}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down AsyaBot application...")
    
    # Устанавливаем флаг завершения
    shutdown_event.set()
    
    # Останавливаем бота
    if bot_task and not bot_task.done():
        logger.info("Cancelling bot task...")
        bot_task.cancel()
        try:
            await asyncio.wait_for(bot_task, timeout=5.0)
        except asyncio.TimeoutError:
            logger.warning("Bot task did not complete within timeout")
        except asyncio.CancelledError:
            logger.info("Bot task cancelled successfully")
        except Exception as e:
            logger.error(f"Error cancelling bot task: {e}")
    
    # Завершаем бота
    await shutdown_bot()
    
    logger.info("Application shutdown completed")

# Создание FastAPI приложения
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AsyaBot - Telegram bot for dementia risk assessment",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение роутеров API
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Логирование HTTP запросов"""
    start_time = time.time()
    
    logger.info(f"Request: {request.method} {request.url}")
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    logger.info(f"Response: {response.status_code} - {process_time:.3f}s")
    
    return response

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Глобальный обработчик исключений"""
    logger.error(f"Global exception handler: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

@app.get("/")
async def root():
    """Корневой эндпоинт"""
    logger.info("Root endpoint accessed")
    return {
        "message": "AsyaBot API",
        "version": settings.VERSION,
        "status": "running"
    }

@app.get("/status")
async def status():
    """Эндпоинт статуса"""
    logger.info("Status endpoint accessed")
    return {
        "status": "ok",
        "timestamp": time.time(),
        "version": settings.VERSION
    }

def main():
    """Главная функция запуска"""
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main() 