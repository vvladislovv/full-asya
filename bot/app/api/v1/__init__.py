"""
API v1 Router
"""
from fastapi import APIRouter
from .health import router as health_router

router = APIRouter()

# Подключаем только health endpoints
router.include_router(health_router, prefix="/health", tags=["health"]) 