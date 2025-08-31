"""
Models for questionnaire data
"""
from sqlalchemy import Column, Integer, String, JSON, DateTime, Text, BigInteger, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from app.database import Base

class Questionnaire(Base):
    """Модель анкеты"""
    __tablename__ = "questionnaires"
    
    id = Column(Integer, primary_key=True, index=True)
    telegram_id = Column(BigInteger, nullable=False, index=True)
    username = Column(String(255), nullable=True)
    first_name = Column(String(255), nullable=True)
    last_name = Column(String(255), nullable=True)
    language = Column(String(10), default="ru")
    responses = Column(JSON, nullable=False)
    risk_level = Column(String(50), nullable=True)
    risk_score = Column(Integer, nullable=True)
    recommendations = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

class QuestionnaireResponse(Base):
    """Модель ответа на анкету (для детального анализа)"""
    __tablename__ = "questionnaire_responses"
    
    id = Column(Integer, primary_key=True, index=True)
    questionnaire_id = Column(Integer, nullable=False, index=True)
    question_number = Column(Integer, nullable=False)
    answer = Column(String(255), nullable=False)
    answer_weight = Column(Integer, nullable=True)
    is_reverse_question = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
