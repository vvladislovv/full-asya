from typing import Dict, List, Any

# Вопросы анкеты на русском языке
RUSSIAN_QUESTIONS = {
    1: "Ложась спать, с трудом можете вспомнить все события, которые произошли за день?",
    2: "Сложно ли Вам перечислить, что ели вчера на обед?",
    3: "Вы легко ориентируетесь в новом месте (улица, район города)?",
    4: "Есть ли у Вас родственники, страдающие нарушениями памяти? (деменция, болезнь Альцгеймера)",
    5: "Страдаете ли Вы гипертонической болезнью?",
    6: "Выходя из квартиры, Вы часто вынуждены возвращаться за ключами, документами или кошельками?",
    7: "Вам тяжело запомнить человека в лицо?",
    8: "При походе в магазин Вы часто забываете купить что-то из запланированного?",
    9: "Порой Вам трудно пересказать, о чем недавно прочитали в газете (книге)?",
    10: "Вам тяжело запомнить/вспомнить имя человека, с которым часто общаетесь?",
    11: "Есть ли у Вас сахарный диабет?",
    12: "Был ли у Вас инсульт?",
    13: "Бывает ли, что оставляете вещи в транспорте?",
    14: "Есть ли у Вас нарушения слуха?",
    15: "Бывает ли, что Вы теряетесь в незнакомом месте (дом, улица, квартал, район города)?",
    16: "Часто Вам случалось забыть номер своего телефона?",
    17: "Часто ли Вам приходится вспоминать подходящее слово?",
    18: "Часто ли Вам приходится искать, куда положили какой-нибудь предмет?",
    19: "Есть ли у Вас жалобы на память?",
    20: "Бывает ли, что Вы часто забываете о днях рождения друзей или родственников?",
    21: "Болели ли Вы коронавирусом?",
    22: "Обычно с утра Вы просыпаетесь с хорошим настроением?",
    23: "Замечаете ли Вы, что отдых не дает желаемого результата?",
    24: "Бывает ли так, что Вам трудно завершить мысль?",
    25: "Часто ли Вам без видимой на то причины становится тревожно?",
    26: "Легко ли Вас вывести из себя?",
    27: "Часто ли Вам не хочется видеть вообще никого?",
    28: "Вы считаете себя одиноким человеком?",
    29: "Вы работаете?",
    30: "У вас есть регулярная физическая нагрузка (спортивные тренировки, физический труд, прогулки и т.д.)?",
    31: "В последнее время снизился ли ваш интерес к любимым занятиям (хобби)?"
}

# Вопросы анкеты на английском языке
ENGLISH_QUESTIONS = {
    1: "When going to bed, do you have difficulty remembering all the events that happened during the day?",
    2: "Is it difficult for you to list what you ate for lunch yesterday?",
    3: "Do you easily navigate in a new place (street, city district)?",
    4: "Do you have relatives suffering from memory disorders? (dementia, Alzheimer's disease)",
    5: "Do you suffer from hypertension?",
    6: "When leaving the apartment, do you often have to return for keys, documents or wallets?",
    7: "Is it difficult for you to remember a person's face?",
    8: "When going to the store, do you often forget to buy something from what you planned?",
    9: "Sometimes is it difficult for you to retell what you recently read in a newspaper (book)?",
    10: "Is it difficult for you to remember/recall the name of a person you often communicate with?",
    11: "Do you have diabetes?",
    12: "Have you had a stroke?",
    13: "Does it happen that you leave things in transport?",
    14: "Do you have hearing impairments?",
    15: "Does it happen that you get lost in an unfamiliar place (house, street, block, city district)?",
    16: "Have you often forgotten your phone number?",
    17: "Do you often have to remember the right word?",
    18: "Do you often have to look for where you put some item?",
    19: "Do you have memory complaints?",
    20: "Does it happen that you often forget about friends' or relatives' birthdays?",
    21: "Have you had coronavirus?",
    22: "Do you usually wake up in a good mood in the morning?",
    23: "Do you notice that rest does not give the desired result?",
    24: "Does it happen that it is difficult for you to complete a thought?",
    25: "Do you often become anxious for no apparent reason?",
    26: "Is it easy to get you out of yourself?",
    27: "Do you often not want to see anyone at all?",
    28: "Do you consider yourself a lonely person?",
    29: "Do you work?",
    30: "Do you have regular physical activity (sports training, physical labor, walks, etc.)?",
    31: "Has your interest in favorite activities (hobbies) decreased recently?"
}

# Варианты ответов
ANSWERS = {
    "ru": ["Да", "Нет", "Иногда", "Затрудняюсь ответить"],
    "en": ["Yes", "No", "Sometimes", "Difficult to answer"]
}

# Веса ответов для расчета риска
ANSWER_WEIGHTS = {
    "Да": 3,
    "Нет": 0,
    "Иногда": 2,
    "Затрудняюсь ответить": 1,
    "Yes": 3,
    "No": 0,
    "Sometimes": 2,
    "Difficult to answer": 1
}

# Специальные вопросы с обратной логикой (положительный ответ снижает риск)
REVERSE_QUESTIONS = {3, 22, 29, 30}

# Интерпретация результатов
RISK_INTERPRETATION = {
    "ru": {
        "low": {
            "title": "Низкий риск",
            "description": "У вас низкий риск развития деменции. Продолжайте вести здоровый образ жизни.",
            "recommendations": [
                "Продолжайте вести здоровый образ жизни",
                "Регулярно проходите профилактические осмотры",
                "Поддерживайте социальную активность",
                "Тренируйте память и внимание"
            ],
            "color": "🟢"
        },
        "medium": {
            "title": "Средний риск",
            "description": "У вас средний риск развития деменции. Рекомендуется консультация специалиста.",
            "recommendations": [
                "Рекомендуется консультация специалиста",
                "Увеличьте физическую активность",
                "Тренируйте память и внимание",
                "Следите за артериальным давлением"
            ],
            "color": "🟡"
        },
        "high": {
            "title": "Высокий риск",
            "description": "У вас высокий риск развития деменции. Обязательная консультация невролога.",
            "recommendations": [
                "Обязательная консультация невролога",
                "Прохождение когнитивных тестов",
                "Медицинское обследование",
                "Строгое соблюдение рекомендаций врача"
            ],
            "color": "🔴"
        }
    },
    "en": {
        "low": {
            "title": "Low Risk",
            "description": "You have a low risk of developing dementia. Continue to lead a healthy lifestyle.",
            "recommendations": [
                "Continue to lead a healthy lifestyle",
                "Regular preventive examinations",
                "Maintain social activity",
                "Train memory and attention"
            ],
            "color": "🟢"
        },
        "medium": {
            "title": "Medium Risk",
            "description": "You have a medium risk of developing dementia. Specialist consultation is recommended.",
            "recommendations": [
                "Specialist consultation is recommended",
                "Increase physical activity",
                "Train memory and attention",
                "Monitor blood pressure"
            ],
            "color": "🟡"
        },
        "high": {
            "title": "High Risk",
            "description": "You have a high risk of developing dementia. Mandatory consultation with a neurologist.",
            "recommendations": [
                "Mandatory consultation with a neurologist",
                "Cognitive testing",
                "Medical examination",
                "Strict adherence to doctor's recommendations"
            ],
            "color": "🔴"
        }
    }
}


def get_questions(language: str = "ru") -> Dict[int, str]:
    """Получение вопросов для указанного языка"""
    return RUSSIAN_QUESTIONS if language == "ru" else ENGLISH_QUESTIONS


def get_answers(language: str = "ru") -> List[str]:
    """Получение вариантов ответов для указанного языка"""
    return ANSWERS[language]


def get_answer_weight(answer: str) -> int:
    """Получение веса ответа"""
    return ANSWER_WEIGHTS.get(answer, 0)


def is_reverse_question(question_number: int) -> bool:
    """Проверка, является ли вопрос обратным"""
    return question_number in REVERSE_QUESTIONS


def get_risk_interpretation(risk_level: str, language: str = "ru") -> Dict[str, Any]:
    """Получение интерпретации результата"""
    return RISK_INTERPRETATION[language][risk_level]


def get_total_questions() -> int:
    """Получение общего количества вопросов"""
    return len(RUSSIAN_QUESTIONS) 