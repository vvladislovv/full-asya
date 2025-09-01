#!/usr/bin/env python3
"""
Скрипт для настройки webhook'а Telegram бота
"""
import os
import sys
import asyncio
import httpx
from app.config import settings

async def setup_webhook():
    """Настройка webhook'а для Telegram бота"""
    
    if not settings.TELEGRAM_BOT_TOKEN or settings.TELEGRAM_BOT_TOKEN == "your_telegram_bot_token_here":
        print("❌ TELEGRAM_BOT_TOKEN не настроен!")
        print("Установите переменную окружения TELEGRAM_BOT_TOKEN с токеном вашего бота")
        return False
    
    # URL для webhook'а (замените на ваш домен)
    webhook_url = os.getenv('WEBHOOK_URL', 'https://your-domain.com/api/telegram/webhook')
    
    print(f"🔧 Настройка webhook'а для бота...")
    print(f"📡 Webhook URL: {webhook_url}")
    
    try:
        async with httpx.AsyncClient() as client:
            # Устанавливаем webhook
            response = await client.post(
                f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/setWebhook",
                json={
                    "url": webhook_url,
                    "allowed_updates": ["message", "callback_query"]
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("ok"):
                    print("✅ Webhook успешно настроен!")
                    print(f"📋 Описание: {result.get('description', 'N/A')}")
                    return True
                else:
                    print(f"❌ Ошибка настройки webhook'а: {result.get('description')}")
                    return False
            else:
                print(f"❌ HTTP ошибка: {response.status_code}")
                print(f"📄 Ответ: {response.text}")
                return False
                
    except Exception as e:
        print(f"❌ Ошибка при настройке webhook'а: {e}")
        return False

async def get_webhook_info():
    """Получение информации о текущем webhook'е"""
    
    if not settings.TELEGRAM_BOT_TOKEN or settings.TELEGRAM_BOT_TOKEN == "your_telegram_bot_token_here":
        print("❌ TELEGRAM_BOT_TOKEN не настроен!")
        return False
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/getWebhookInfo"
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("ok"):
                    webhook_info = result.get("result", {})
                    print("📡 Информация о webhook'е:")
                    print(f"   URL: {webhook_info.get('url', 'Не установлен')}")
                    print(f"   Количество ожидающих обновлений: {webhook_info.get('pending_update_count', 0)}")
                    print(f"   Последняя ошибка: {webhook_info.get('last_error_message', 'Нет')}")
                    print(f"   Дата последней ошибки: {webhook_info.get('last_error_date', 'Нет')}")
                    return True
                else:
                    print(f"❌ Ошибка получения информации: {result.get('description')}")
                    return False
            else:
                print(f"❌ HTTP ошибка: {response.status_code}")
                return False
                
    except Exception as e:
        print(f"❌ Ошибка при получении информации: {e}")
        return False

async def delete_webhook():
    """Удаление webhook'а"""
    
    if not settings.TELEGRAM_BOT_TOKEN or settings.TELEGRAM_BOT_TOKEN == "your_telegram_bot_token_here":
        print("❌ TELEGRAM_BOT_TOKEN не настроен!")
        return False
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/deleteWebhook"
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("ok"):
                    print("✅ Webhook успешно удален!")
                    return True
                else:
                    print(f"❌ Ошибка удаления webhook'а: {result.get('description')}")
                    return False
            else:
                print(f"❌ HTTP ошибка: {response.status_code}")
                return False
                
    except Exception as e:
        print(f"❌ Ошибка при удалении webhook'а: {e}")
        return False

async def main():
    """Главная функция"""
    if len(sys.argv) < 2:
        print("Использование:")
        print("  python setup-webhook.py setup    - Настроить webhook")
        print("  python setup-webhook.py info     - Показать информацию о webhook'е")
        print("  python setup-webhook.py delete   - Удалить webhook")
        return
    
    command = sys.argv[1].lower()
    
    if command == "setup":
        await setup_webhook()
    elif command == "info":
        await get_webhook_info()
    elif command == "delete":
        await delete_webhook()
    else:
        print(f"❌ Неизвестная команда: {command}")

if __name__ == "__main__":
    asyncio.run(main())
