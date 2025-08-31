// Утилиты для безопасной работы с датами

/**
 * Безопасно форматирует дату в локальный формат
 * @param dateValue - значение даты (строка, число или объект Date)
 * @param locale - локаль для форматирования (по умолчанию 'ru-RU')
 * @param fallback - значение по умолчанию если дата невалидна
 * @returns отформатированная дата или fallback
 */
export function formatDateSafe(
    dateValue: string | number | Date | null | undefined, 
    locale: string = 'ru-RU', 
    fallback: string = 'Дата не указана'
): string {
    if (!dateValue) {
        return fallback;
    }

    // Проверяем на пустой объект
    if (typeof dateValue === 'object' && Object.keys(dateValue).length === 0) {
        return fallback;
    }

    try {
        const date = new Date(dateValue);
        
        // Проверяем что дата валидна
        if (isNaN(date.getTime())) {
            return fallback;
        }

        return date.toLocaleDateString(locale);
    } catch (error) {
        return fallback;
    }
}

/**
 * Безопасно форматирует дату со временем
 * @param dateValue - значение даты
 * @param locale - локаль для форматирования
 * @param options - опции форматирования
 * @param fallback - значение по умолчанию
 * @returns отформатированная дата со временем или fallback
 */
export function formatDateTimeSafe(
    dateValue: string | number | Date | null | undefined,
    locale: string = 'ru-RU',
    options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    },
    fallback: string = 'Дата не указана'
): string {
    if (!dateValue) {
        return fallback;
    }

    // Проверяем на пустой объект
    if (typeof dateValue === 'object' && Object.keys(dateValue).length === 0) {
        return fallback;
    }

    try {
        const date = new Date(dateValue);
        
        // Проверяем что дата валидна
        if (isNaN(date.getTime())) {
            return fallback;
        }

        return date.toLocaleString(locale, options);
    } catch (error) {
        return fallback;
    }
}

/**
 * Проверяет валидность даты
 * @param dateValue - значение для проверки
 * @returns true если дата валидна
 */
export function isValidDate(dateValue: string | number | Date | null | undefined): boolean {
    if (!dateValue) return false;
    
    // Проверяем на пустой объект
    if (typeof dateValue === 'object' && Object.keys(dateValue).length === 0) {
        return false;
    }
    
    try {
        const date = new Date(dateValue);
        return !isNaN(date.getTime());
    } catch {
        return false;
    }
}

