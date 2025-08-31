"""
AsyaBot Telegram Bot Implementation
"""
import asyncio
import signal
from datetime import datetime
from typing import Dict, Any
from aiogram import Bot, Dispatcher, types, F
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo

from app.config import settings
from app.logger import get_logger
from app.database import get_db, init_db
from app.models.questionnaire import Questionnaire, QuestionnaireResponse
from app.services.nestjs_service import NestJSService
from app.data.questionnaire_data import (
    get_questions, get_answers, get_total_questions, 
    get_risk_interpretation, is_reverse_question, get_answer_weight
)

# Инициализация логгера
logger = get_logger("bot")

# Состояния для FSM
class QuestionnaireStates(StatesGroup):
    choosing_language = State()
    filling_questionnaire = State()
    completed = State()

# Инициализация бота и диспетчера
if not settings.TELEGRAM_BOT_TOKEN or settings.TELEGRAM_BOT_TOKEN == "your_telegram_bot_token_here":
    logger.warning("TELEGRAM_BOT_TOKEN is not configured. Bot functionality will be disabled; API will run.")
    bot = None
    dp = None
else:
    bot = Bot(token=settings.TELEGRAM_BOT_TOKEN)
    storage = MemoryStorage()
    dp = Dispatcher(storage=storage)

# Флаг для корректного завершения
shutdown_event = asyncio.Event()

# Функция для регистрации обработчиков только если dp доступен
def register_handlers():
    """Регистрация обработчиков бота"""
    if dp is None:
        # Bot disabled; skip registration silently
        return
    
    # Регистрируем все обработчики здесь
    @dp.message(F.text == "/start")
    async def cmd_start(message: types.Message, state: FSMContext):
        """Обработчик команды /start"""
        logger.info(f"User {message.from_user.id} started bot")
        
        # Сбрасываем состояние
        await state.clear()
        
        # Приветственное сообщение
        welcome_text = (
            "👋 Добро пожаловать в AsyaBot!\n\n"
            "Этот бот поможет вам пройти анкету для оценки риска когнитивных нарушений.\n\n"
            "Выберите язык для продолжения:"
        )
        
        # Кнопки выбора языка
        keyboard = [
            [InlineKeyboardButton(text="🇷🇺 Русский", callback_data="lang_ru")],
            [InlineKeyboardButton(text="🇺🇸 English", callback_data="lang_en")]
        ]
        reply_markup = InlineKeyboardMarkup(inline_keyboard=keyboard)
        
        await message.answer(welcome_text, reply_markup=reply_markup)
        await state.set_state(QuestionnaireStates.choosing_language)

    @dp.callback_query(F.data.startswith('lang_'))
    async def language_selected(callback: types.CallbackQuery, state: FSMContext):
        """Обработчик выбора языка"""
        language = callback.data.split('_')[1]
        logger.info(f"User {callback.from_user.id} selected language: {language}")
        
        await callback.answer()
        await state.update_data(language=language)
        
        # Начинаем анкету
        await start_questionnaire(callback, state)

    async def start_questionnaire(callback: types.CallbackQuery, state: FSMContext):
        """Начало заполнения анкеты"""
        data = await state.get_data()
        language = data.get("language", "ru")
        
        # Инициализируем ответы
        await state.update_data(responses={}, current_question=1)
        await state.set_state(QuestionnaireStates.filling_questionnaire)
        
        # Показываем первый вопрос
        await show_question(callback, state)

    async def show_question(callback: types.CallbackQuery, state: FSMContext):
        """Показ вопроса анкеты"""
        data = await state.get_data()
        language = data.get("language", "ru")
        current_question = data.get("current_question", 1)
        
        questions = get_questions(language)
        answers = get_answers(language)
        
        if current_question > len(questions):
            # Анкета завершена
            await complete_questionnaire(callback, state)
            return
        
        question_text = questions[current_question]
        # answers уже список вариантов для языка → не индексируем по номеру вопроса
        answer_options = answers
        
        # Создаем клавиатуру с вариантами ответов
        keyboard = []
        for answer in answer_options:
            keyboard.append([InlineKeyboardButton(
                text=answer,
                callback_data=f"answer_{current_question}_{answer}"
            )])
        
        reply_markup = InlineKeyboardMarkup(inline_keyboard=keyboard)
        
        await callback.message.edit_text(
            f"Вопрос {current_question} из {len(questions)}:\n\n{question_text}",
            reply_markup=reply_markup
        )

    @dp.callback_query(F.data.startswith('answer_'))
    async def handle_answer(callback: types.CallbackQuery, state: FSMContext):
        """Обработчик ответа на вопрос"""
        parts = callback.data.split('_')
        question_num = int(parts[1])
        answer = '_'.join(parts[2:])  # Объединяем остальные части для ответов с пробелами
        
        logger.info(f"User {callback.from_user.id} answered question {question_num}: {answer}")
        
        await callback.answer()
        
        # Сохраняем ответ
        data = await state.get_data()
        responses = data.get("responses", {})
        responses[str(question_num)] = answer
        await state.update_data(responses=responses, current_question=question_num + 1)
        
        # Показываем следующий вопрос
        await show_question(callback, state)

    async def complete_questionnaire(callback: types.CallbackQuery, state: FSMContext):
        """Завершение анкеты и показ результатов"""
        data = await state.get_data()
        language = data.get("language", "ru")
        responses = data.get("responses", {})
        
        logger.info(f"User {callback.from_user.id} completed questionnaire with {len(responses)} responses")
        
        # Рассчитываем риск
        risk_result = calculate_risk_locally(responses, language)
        
        try:
            # Отправляем данные в NestJS бэкенд
            questionnaire_data = {
                "telegram_id": callback.from_user.id,
                "first_name": callback.from_user.first_name,
                "last_name": callback.from_user.last_name,
                "answers": responses
            }
            
            # Отправляем данные анкеты
            success = await nestjs_service.send_questionnaire_data(questionnaire_data)
            if success:
                logger.info(f"Questionnaire data sent to NestJS backend for user {callback.from_user.id}")
            else:
                logger.warning(f"Failed to send questionnaire data to NestJS backend for user {callback.from_user.id}")
            
            # Отправляем результаты
            result_data = {
                "telegram_id": callback.from_user.id,
                "risk_level": risk_result['risk_level'],
                "score": risk_result['score'],
                "recommendations": risk_result['recommendations']
            }
            
            success = await nestjs_service.send_questionnaire_result(result_data)
            if success:
                logger.info(f"Questionnaire result sent to NestJS backend for user {callback.from_user.id}")
            else:
                logger.warning(f"Failed to send questionnaire result to NestJS backend for user {callback.from_user.id}")
            
        except Exception as e:
            logger.error(f"Error sending data to NestJS backend: {e}")
            # Продолжаем показывать результаты даже при ошибке отправки
        
        # Формируем результат
        risk_level_text = {
            "low": "Низкий" if language == "ru" else "Low",
            "medium": "Средний" if language == "ru" else "Medium", 
            "high": "Высокий" if language == "ru" else "High"
        }.get(risk_result['risk_level'], "Неизвестно")
        
        if language == "ru":
            result_text = f"📊 Результаты анкеты\n\n"
            result_text += f"Уровень риска: {risk_level_text}\n"
            result_text += f"Балл: {risk_result['score']}/100\n\n"
            result_text += "Рекомендации:\n"
            for rec in risk_result['recommendations']:
                result_text += f"• {rec}\n"
        else:
            result_text = f"📊 Questionnaire Results\n\n"
            result_text += f"Risk Level: {risk_level_text}\n"
            result_text += f"Score: {risk_result['score']}/100\n\n"
            result_text += "Recommendations:\n"
            for rec in risk_result['recommendations']:
                result_text += f"• {rec}\n"
        
        # Кнопки действий
        keyboard = [
            [InlineKeyboardButton(
                text="📊 Подробный отчет" if language == "ru" else "📊 Detailed Report",
                callback_data="detailed_report"
            )],
            [InlineKeyboardButton(
                text="📚 Полезные материалы" if language == "ru" else "📚 Useful Materials",
                callback_data="useful_materials"
            )],
            [InlineKeyboardButton(
                text="👨‍⚕️ Консультация" if language == "ru" else "👨‍⚕️ Consultation",
                callback_data="consultation"
            )],
            [InlineKeyboardButton(
                text="🔄 Пройти заново" if language == "ru" else "🔄 Restart",
                callback_data="restart"
            )]
        ]
        reply_markup = InlineKeyboardMarkup(inline_keyboard=keyboard)
        
        await callback.message.edit_text(result_text, reply_markup=reply_markup)
        await state.set_state(QuestionnaireStates.completed)

    @dp.callback_query(F.data == "consultation")
    async def handle_consultation(callback: types.CallbackQuery, state: FSMContext):
        """Обработчик запроса консультации"""
        data = await state.get_data()
        language = data.get("language", "ru")
        
        consultation_text = (
            "👨‍⚕️ Для получения консультации специалиста:\n\n"
            "📞 Позвоните: +7 (XXX) XXX-XX-XX\n"
            "📧 Email: consultation@example.com\n"
            "🌐 Веб-сайт: www.example.com\n\n"
            "Время работы: Пн-Пт 9:00-18:00"
        ) if language == "ru" else (
            "👨‍⚕️ To get specialist consultation:\n\n"
            "📞 Call: +1 (XXX) XXX-XXXX\n"
            "📧 Email: consultation@example.com\n"
            "🌐 Website: www.example.com\n\n"
            "Working hours: Mon-Fri 9:00-18:00"
        )
        
        keyboard = [[InlineKeyboardButton(
            text="← Назад к результатам" if language == "ru" else "← Back to results",
            callback_data="back_to_results"
        )]]
        reply_markup = InlineKeyboardMarkup(inline_keyboard=keyboard)
        
        await callback.message.edit_text(consultation_text, reply_markup=reply_markup)

    @dp.callback_query(F.data == "restart")
    async def restart_questionnaire(callback: types.CallbackQuery, state: FSMContext):
        """Перезапуск анкеты"""
        await callback.answer()
        await state.clear()
        await cmd_start(callback.message, state)

    @dp.message(F.text == "/cancel")
    async def cancel_questionnaire(message: types.Message, state: FSMContext):
        """Отмена заполнения анкеты"""
        await state.clear()
        await message.answer("Анкета отменена. Используйте /start для начала.")

    @dp.errors()
    async def error_handler(update: types.Update, exception: Exception):
        """Обработчик ошибок бота"""
        logger.error(f"Bot error: {exception}")
        logger.error(f"Update: {update}")

    @dp.callback_query(F.data == "detailed_report")
    async def handle_detailed_report(callback: types.CallbackQuery, state: FSMContext):
        """Обработчик подробного отчета"""
        logger.info(f"User {callback.from_user.id} requested detailed report")
        await callback.answer()
        
        data = await state.get_data()
        language = data.get("language", "ru")
        responses = data.get("responses", {})
        
        # Формируем подробный отчет
        report = "📊 Подробный отчет по анкете\n\n" if language == "ru" else "📊 Detailed questionnaire report\n\n"
        
        # Статистика ответов
        total_questions = len(responses)
        yes_count = sum(1 for answer in responses.values() if answer in ["Да", "Yes"])
        no_count = sum(1 for answer in responses.values() if answer in ["Нет", "No"])
        sometimes_count = sum(1 for answer in responses.values() if answer in ["Иногда", "Sometimes"])
        difficult_count = sum(1 for answer in responses.values() if answer in ["Затрудняюсь ответить", "Difficult to answer"])
        
        report += f"Всего вопросов: {total_questions}\n" if language == "ru" else f"Total questions: {total_questions}\n"
        report += f"Ответов 'Да': {yes_count}\n" if language == "ru" else f"'Yes' answers: {yes_count}\n"
        report += f"Ответов 'Нет': {no_count}\n" if language == "ru" else f"'No' answers: {no_count}\n"
        report += f"Ответов 'Иногда': {sometimes_count}\n" if language == "ru" else f"'Sometimes' answers: {sometimes_count}\n"
        report += f"Затруднились ответить: {difficult_count}\n\n" if language == "ru" else f"Difficult to answer: {difficult_count}\n\n"
        
        # Кнопка возврата
        keyboard = [[InlineKeyboardButton(
            text="← Назад к результатам" if language == "ru" else "← Back to results",
            callback_data="back_to_results"
        )]]
        reply_markup = InlineKeyboardMarkup(inline_keyboard=keyboard)
        
        await callback.message.edit_text(report, reply_markup=reply_markup)

    @dp.callback_query(F.data == "useful_materials")
    async def handle_useful_materials(callback: types.CallbackQuery, state: FSMContext):
        """Обработчик полезных материалов"""
        logger.info(f"User {callback.from_user.id} requested useful materials")
        await callback.answer()
        
        data = await state.get_data()
        language = data.get("language", "ru")
        
        materials = "📚 Полезные материалы\n\n" if language == "ru" else "📚 Useful materials\n\n"
        
        if language == "ru":
            materials += "🔗 Ссылки на полезные ресурсы:\n\n"
            materials += "• Национальная ассоциация по борьбе с болезнью Альцгеймера\n"
            materials += "• Центр неврологии и психиатрии\n"
            materials += "• Памятка по профилактике деменции\n"
            materials += "• Упражнения для тренировки памяти\n\n"
            materials += "📞 Горячая линия: 8-800-XXX-XX-XX"
        else:
            materials += "🔗 Useful resource links:\n\n"
            materials += "• Alzheimer's Association\n"
            materials += "• National Institute on Aging\n"
            materials += "• Memory training exercises\n"
            materials += "• Prevention guidelines\n\n"
            materials += "📞 Hotline: 1-800-XXX-XXXX"
        
        # Кнопка возврата
        keyboard = [[InlineKeyboardButton(
            text="← Назад к результатам" if language == "ru" else "← Back to results",
            callback_data="back_to_results"
        )]]
        reply_markup = InlineKeyboardMarkup(inline_keyboard=keyboard)
        
        await callback.message.edit_text(materials, reply_markup=reply_markup)

    @dp.callback_query(F.data == "back_to_results")
    async def back_to_results(callback: types.CallbackQuery, state: FSMContext):
        """Возврат к результатам"""
        logger.info(f"User {callback.from_user.id} returned to results")
        await callback.answer()
        
        # Повторно показываем результаты
        await complete_questionnaire(callback, state)

    @dp.callback_query(F.data == "main_menu")
    async def main_menu(callback: types.CallbackQuery, state: FSMContext):
        """Главное меню"""
        logger.info(f"User {callback.from_user.id} accessed main menu")
        await callback.answer()
        await state.clear()
        await cmd_start(callback.message, state)

    @dp.callback_query(F.data == "previous_results")
    async def previous_results(callback: types.CallbackQuery, state: FSMContext):
        """Показ предыдущих результатов"""
        logger.info(f"User {callback.from_user.id} requested previous results")
        await callback.answer()
        
        data = await state.get_data()
        language = data.get("language", "ru")
        
        # Здесь можно добавить логику получения предыдущих результатов из БД
        no_results_text = (
            "📊 У вас пока нет сохраненных результатов.\n"
            "Пройдите анкету, чтобы увидеть результаты здесь."
        ) if language == "ru" else (
            "📊 You don't have any saved results yet.\n"
            "Complete the questionnaire to see results here."
        )
        
        keyboard = [[InlineKeyboardButton(
            text="← Назад" if language == "ru" else "← Back",
            callback_data="main_menu"
        )]]
        reply_markup = InlineKeyboardMarkup(inline_keyboard=keyboard)
        
        await callback.message.edit_text(no_results_text, reply_markup=reply_markup)

    @dp.callback_query(F.data == "contact_us")
    async def contact_us(callback: types.CallbackQuery, state: FSMContext):
        """Обработчик контактов"""
        logger.info(f"User {callback.from_user.id} requested contact information")
        await callback.answer()
        
        data = await state.get_data()
        language = data.get("language", "ru")
        
        contact_text = (
            "📞 Контактная информация\n\n"
            "Телефон: +7 (XXX) XXX-XX-XX\n"
            "Email: info@asyabot.com\n"
            "Веб-сайт: www.asyabot.com\n\n"
            "Время работы: Пн-Пт 9:00-18:00"
        ) if language == "ru" else (
            "📞 Contact Information\n\n"
            "Phone: +1 (XXX) XXX-XXXX\n"
            "Email: info@asyabot.com\n"
            "Website: www.asyabot.com\n\n"
            "Working hours: Mon-Fri 9:00-18:00"
        )
        
        keyboard = [[InlineKeyboardButton(
            text="← Назад" if language == "ru" else "← Back",
            callback_data="main_menu"
        )]]
        reply_markup = InlineKeyboardMarkup(inline_keyboard=keyboard)
        
        await callback.message.edit_text(contact_text, reply_markup=reply_markup)

# Инициализация NestJS сервиса
nestjs_service = NestJSService()

def calculate_risk_locally(responses: dict, language: str) -> dict:
    """Локальный расчет риска на основе ответов"""
    logger.info("Calculating risk locally from responses")
    logger.debug(f"Responses: {responses}")
    
    try:
        score = 0
        total_questions = len(responses)
        
        for question_num, answer in responses.items():
            if isinstance(answer, str):
                # Проверяем, является ли вопрос обратным
                if is_reverse_question(int(question_num)):
                    # Для обратных вопросов инвертируем логику
                    if answer in ["Да", "Yes"]:
                        score += 0  # Положительный ответ снижает риск
                    elif answer in ["Нет", "No"]:
                        score += 3  # Отрицательный ответ увеличивает риск
                    elif answer in ["Иногда", "Sometimes"]:
                        score += 2
                    elif answer in ["Затрудняюсь ответить", "Difficult to answer"]:
                        score += 1
                else:
                    # Обычная логика
                    score += get_answer_weight(answer)
                
                # Для обратных вопросов показываем правильный вес
                if is_reverse_question(int(question_num)):
                    if answer in ["Да", "Yes"]:
                        actual_weight = 0
                    elif answer in ["Нет", "No"]:
                        actual_weight = 3
                    elif answer in ["Иногда", "Sometimes"]:
                        actual_weight = 2
                    elif answer in ["Затрудняюсь ответить", "Difficult to answer"]:
                        actual_weight = 1
                    else:
                        actual_weight = get_answer_weight(answer)
                    logger.debug(f"Question {question_num} (reverse): {answer} = {actual_weight} points")
                else:
                    logger.debug(f"Question {question_num}: {answer} = {get_answer_weight(answer)} points")
        
        # Нормализация к 100-балльной шкале
        max_possible_score = total_questions * 3
        normalized_score = min(100, int((score / max_possible_score) * 100))
        
        logger.info(f"Raw score: {score}, max possible: {max_possible_score}, normalized: {normalized_score}")
        
        # Определение уровня риска
        if normalized_score <= 30:
            risk_level = "low"
            recommendations = [
                "Продолжайте вести здоровый образ жизни",
                "Регулярно проходите профилактические осмотры",
                "Поддерживайте социальную активность"
            ] if language == "ru" else [
                "Continue to lead a healthy lifestyle",
                "Regular preventive examinations",
                "Maintain social activity"
            ]
            should_consult = False
            logger.info(f"Risk level: LOW (score: {normalized_score})")
        elif normalized_score <= 60:
            risk_level = "medium"
            recommendations = [
                "Рекомендуется консультация специалиста",
                "Увеличьте физическую активность",
                "Тренируйте память и внимание"
            ] if language == "ru" else [
                "Specialist consultation is recommended",
                "Increase physical activity",
                "Train memory and attention"
            ]
            should_consult = True
            logger.info(f"Risk level: MEDIUM (score: {normalized_score})")
        else:
            risk_level = "high"
            recommendations = [
                "Обязательная консультация невролога",
                "Прохождение когнитивных тестов",
                "Медицинское обследование"
            ] if language == "ru" else [
                "Mandatory consultation with a neurologist",
                "Cognitive testing",
                "Medical examination"
            ]
            should_consult = True
            logger.info(f"Risk level: HIGH (score: {normalized_score})")
        
        logger.info(f"Calculated risk score: {normalized_score}, level: {risk_level}")
        
        return {
            "score": normalized_score,
            "risk_level": risk_level,
            "recommendations": recommendations,
            "should_consult": should_consult
        }
        
    except Exception as e:
        logger.error(f"Error calculating risk locally: {e}")
        # Возвращаем безопасный результат по умолчанию
        return {
            "risk_score": 50,
            "risk_level": "medium",
            "recommendations": ["Рекомендуется консультация специалиста"] if language == "ru" else ["Specialist consultation is recommended"],
            "should_consult": True
        }

async def shutdown_bot():
    """Корректное завершение бота"""
    logger.info("Shutting down bot...")
    try:
        if bot:
            await bot.session.close()
        
        # Закрываем NestJS сервис
        await nestjs_service.close()
        
        logger.info("Bot shutdown completed")
    except Exception as e:
        logger.error(f"Error during bot shutdown: {e}")

async def start_bot():
    """Запуск бота"""
    logger.info("Starting bot...")
    
    if bot is None or dp is None:
        logger.info("Bot start skipped: TELEGRAM_BOT_TOKEN is not configured")
        return
    
    try:
        # Запускаем бота с обработкой сигналов завершения
        # В aiogram v3 рекомендуется вызывать start_polling на Dispatcher
        await dp.start_polling(bot)
    except Exception as e:
        logger.error(f"Bot failed to start: {e}")
    finally:
        await shutdown_bot()

# Регистрация обработчиков выполняется из main.lifespan()
