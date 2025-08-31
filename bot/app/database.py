"""
Database module for AsyaBot
"""
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from app.config import settings
from app.logger import get_logger

logger = get_logger("database")

# Создание движка базы данных
logger.info("Initializing database engine")
engine = create_engine(
    settings.DATABASE_URL,
    poolclass=StaticPool,
    pool_pre_ping=True,
    echo=settings.DEBUG
)

# Создание фабрики сессий
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Базовый класс для моделей
Base = declarative_base()


def get_db() -> Session:
    """Получение сессии базы данных"""
    logger.debug("Creating database session")
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database session error: {e}")
        db.rollback()
        raise
    finally:
        logger.debug("Closing database session")
        db.close()


def init_db():
    """Инициализация базы данных"""
    logger.info("Initializing database")
    try:
        # Импортируем модели для создания таблиц
        from app.models import Questionnaire, QuestionnaireResponse
        
        # Создание всех таблиц
        Base.metadata.create_all(bind=engine)
        logger.info("Database initialized successfully - all tables created")
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
        raise


def check_db_connection():
    """Проверка подключения к базе данных"""
    logger.debug("Checking database connection")
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        logger.info("Database connection successful")
        return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False 