"""
Service for communicating with NestJS backend
"""
import httpx
from typing import Dict, Any, Optional
from app.config import settings
from app.logger import get_logger

logger = get_logger("nestjs_service")

class NestJSService:
    """Сервис для работы с NestJS бэкендом"""
    
    def __init__(self):
        self.base_url = settings.NESTJS_BACKEND_URL
        self.client = httpx.AsyncClient(timeout=30.0)
        logger.info(f"NestJS service initialized with base URL: {self.base_url}")
    
    async def send_questionnaire_data(self, questionnaire_data: Dict[str, Any]) -> bool:
        """
        Отправка данных анкеты в NestJS бэкенд
        
        Args:
            questionnaire_data: Данные анкеты
            
        Returns:
            bool: True если отправка успешна, False иначе
        """
        try:
            logger.info(f"Sending questionnaire data to NestJS backend: {questionnaire_data.get('telegram_id')}")
            
            response = await self.client.post(
                f"{self.base_url}/api/telegram/questionnaire",
                json=questionnaire_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200 or response.status_code == 201:
                logger.info(f"Successfully sent questionnaire data to NestJS backend")
                return True
            else:
                logger.error(f"Failed to send questionnaire data to NestJS backend. Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending questionnaire data to NestJS backend: {e}")
            return False
    
    async def send_questionnaire_result(self, result_data: Dict[str, Any]) -> bool:
        """
        Отправка результатов анкеты в NestJS бэкенд
        
        Args:
            result_data: Результаты анкеты
            
        Returns:
            bool: True если отправка успешна, False иначе
        """
        try:
            logger.info(f"Sending questionnaire result to NestJS backend: {result_data.get('telegram_id')}")
            
            response = await self.client.post(
                f"{self.base_url}/api/telegram/questionnaire/result",
                json=result_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200 or response.status_code == 201:
                logger.info(f"Successfully sent questionnaire result to NestJS backend")
                return True
            else:
                logger.error(f"Failed to send questionnaire result to NestJS backend. Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending questionnaire result to NestJS backend: {e}")
            return False
    
    async def close(self):
        """Закрытие HTTP клиента"""
        await self.client.aclose()
        logger.info("NestJS service client closed")
