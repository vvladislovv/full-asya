import logging
import logging.handlers
import os
from datetime import datetime
from pathlib import Path


def setup_logger(name: str = "asyabot", log_level: str = "INFO") -> logging.Logger:
    """
    Настройка логгера с ротацией файлов и форматированием
    
    Args:
        name: Имя логгера
        log_level: Уровень логирования (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    
    Returns:
        Настроенный логгер
    """
    # Создаем директорию для логов если её нет
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Создаем логгер
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, log_level.upper()))
    
    # Очищаем существующие обработчики
    logger.handlers.clear()
    
    # Форматтер для логов
    formatter = logging.Formatter(
        '%(asctime)s | %(levelname)s | %(name)s:%(funcName)s:%(lineno)d | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Обработчик для файла с ротацией
    file_handler = logging.handlers.RotatingFileHandler(
        log_dir / "asyabot.log",
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)
    
    # Обработчик для консоли
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)
    
    # Добавляем обработчики к логгеру
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger


def get_logger(name: str = None) -> logging.Logger:
    """
    Получить логгер по имени
    
    Args:
        name: Имя логгера (если None, возвращает корневой логгер)
    
    Returns:
        Логгер
    """
    if name is None:
        return logging.getLogger("asyabot")
    return logging.getLogger(f"asyabot.{name}")


# Создаем основной логгер при импорте модуля
main_logger = setup_logger("asyabot") 