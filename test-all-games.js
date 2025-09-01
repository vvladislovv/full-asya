#!/usr/bin/env node

const API_URL = 'http://localhost:3000/api';

// Функция для авторизации
async function login(telegramId = '123456789') {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId })
    });
    
    if (!response.ok) {
        throw new Error(`Login failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data.access_token;
}

// Функция для получения всех тестов
async function getTests(token) {
    const response = await fetch(`${API_URL}/tests`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
        throw new Error(`Get tests failed: ${response.status}`);
    }
    
    return await response.json();
}

// Функция для старта теста
async function startTest(token, testId) {
    const response = await fetch(`${API_URL}/tests/start`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ testId })
    });
    
    if (!response.ok) {
        throw new Error(`Start test failed: ${response.status}`);
    }
    
    return await response.json();
}

// Функция для отправки результата
async function submitResult(token, resultId, testType, score, maxScore) {
    const payload = {
        resultId,
        answers: {
            correct: score,
            total: maxScore
        },
        timeSpent: Math.floor(Math.random() * 120) + 30,
        maxScore: maxScore
    };
    
    console.log(`   📤 Отправляем: ${JSON.stringify(payload)}`);
    
    const response = await fetch(`${API_URL}/tests/submit`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        console.log(`   ❌ Ошибка ${response.status}: ${errorText}`);
        throw new Error(`Submit result failed: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
}

// Основная функция тестирования
async function testAllGames() {
    try {
        console.log('🚀 Начинаем тестирование всех 8 игр...\n');
        
        // 1. Авторизация
        console.log('1️⃣ Авторизация...');
        const token = await login();
        console.log('✅ Авторизация успешна\n');
        
        // 2. Получение списка тестов
        console.log('2️⃣ Получение списка тестов...');
        const testsResponse = await getTests(token);
        const tests = Array.isArray(testsResponse) ? testsResponse : Object.values(testsResponse);
        console.log(`✅ Получено ${tests.length} тестов\n`);
        
        // 3. Проходим каждый тест
        const results = [];
        
        for (let i = 0; i < tests.length; i++) {
            const test = tests[i];
            console.log(`${i + 1}️⃣ Тестируем: ${test.name} (${test.type})`);
            
            try {
                // Стартуем тест
                const testResult = await startTest(token, test.id);
                console.log(`   📋 Тест начат с ID: ${testResult.id}`);
                
                // Генерируем случайный результат
                const maxScore = test.configuration?.questionCount || 10;
                const score = Math.floor(Math.random() * maxScore) + Math.floor(maxScore * 0.3); // 30-100%
                
                // Отправляем результат
                const submitResult_res = await submitResult(token, testResult.id, test.type, score, maxScore);
                
                // Дополнительная проверка ответа
                if (!submitResult_res || !submitResult_res.id) {
                    throw new Error('Некорректный ответ от сервера');
                }
                const percentage = Math.round((score / maxScore) * 100);
                
                console.log(`   ✅ Результат сохранен: ${score}/${maxScore} (${percentage}%)`);
                
                results.push({
                    testType: test.type,
                    name: test.name,
                    score: score,
                    maxScore: maxScore,
                    percentage: percentage,
                    resultLevel: submitResult_res.resultLevel
                });
                
            } catch (error) {
                console.log(`   ❌ Ошибка: ${error.message}`);
                results.push({
                    testType: test.type,
                    name: test.name,
                    error: error.message
                });
            }
            
            // Небольшая пауза между тестами
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        console.log('\n📊 РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ:');
        console.log('================================');
        
        results.forEach((result, index) => {
            if (result.error) {
                console.log(`${index + 1}. ${result.name}: ❌ ${result.error}`);
            } else {
                console.log(`${index + 1}. ${result.name}: ✅ ${result.percentage}% (${result.resultLevel})`);
            }
        });
        
        const successCount = results.filter(r => !r.error).length;
        console.log(`\n🎯 Успешно пройдено: ${successCount} из ${results.length} тестов`);
        
        // 4. Проверяем статистику
        console.log('\n4️⃣ Проверяем обновленную статистику...');
        const statsResponse = await fetch(`${API_URL}/history/stats?period=all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (statsResponse.ok) {
            const stats = await statsResponse.json();
            console.log(`✅ Всего тестов в БД: ${stats.completedTests}`);
            console.log(`✅ Средний балл: ${Math.round(stats.averageScore)}%`);
        } else {
            console.log('❌ Не удалось получить статистику');
        }
        
        console.log('\n🎉 Тестирование завершено!');
        
    } catch (error) {
        console.error('❌ КРИТИЧЕСКАЯ ОШИБКА:', error);
        process.exit(1);
    }
}

// Запуск
testAllGames();
