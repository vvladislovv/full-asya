#!/usr/bin/env node
/**
 * Тест скрипт для проверки работы Auth API endpoints
 * Использование: node test-auth-api.js
 */

const https = require('http');

const BASE_URL = 'http://localhost:3000';

// Цвета для консоли
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(color, message) {
    console.log(`${color}${message}${colors.reset}`);
}

function makeRequest(method, path, headers = {}, data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(`${BASE_URL}${path}`);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsedData = responseData ? JSON.parse(responseData) : null;
                    resolve({
                        statusCode: res.statusCode,
                        data: parsedData,
                        raw: responseData
                    });
                } catch (error) {
                    resolve({
                        statusCode: res.statusCode,
                        data: null,
                        raw: responseData,
                        error: 'Invalid JSON response'
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function testLogin() {
    log(colors.blue + colors.bold, '\n🔐 Тестируем POST /api/auth/login');
    
    try {
        const response = await makeRequest('POST', '/api/auth/login', {}, {
            telegramId: '123456789'
        });
        
        if (response.statusCode === 200 || response.statusCode === 201) {
            log(colors.green, '✅ Login успешен');
            log(colors.green, `📍 Status: ${response.statusCode}`);
            
            if (response.data && response.data.access_token) {
                log(colors.green, '✅ Получен access_token');
                log(colors.green, `👤 Пользователь: ${response.data.user.username} (${response.data.user.firstName} ${response.data.user.lastName})`);
                return response.data.access_token;
            } else {
                log(colors.red, '❌ access_token отсутствует в ответе');
                return null;
            }
        } else {
            log(colors.red, `❌ Login неуспешен. Status: ${response.statusCode}`);
            log(colors.red, `📄 Response: ${response.raw}`);
            return null;
        }
    } catch (error) {
        log(colors.red, `❌ Ошибка при логине: ${error.message}`);
        return null;
    }
}

async function testProfile(accessToken) {
    log(colors.blue + colors.bold, '\n👤 Тестируем GET /api/auth/profile');
    
    try {
        const response = await makeRequest('GET', '/api/auth/profile', {
            'Authorization': `Bearer ${accessToken}`
        });
        
        if (response.statusCode === 200) {
            log(colors.green, '✅ Profile получен успешно');
            log(colors.green, `📍 Status: ${response.statusCode}`);
            
            if (response.data && response.data.id) {
                log(colors.green, `✅ ID пользователя: ${response.data.id}`);
                log(colors.green, `📱 Telegram ID: ${response.data.telegramId}`);
                log(colors.green, `👤 Имя: ${response.data.firstName} ${response.data.lastName}`);
                log(colors.green, `🌐 Язык: ${response.data.language}`);
                return true;
            } else {
                log(colors.red, '❌ Данные пользователя отсутствуют');
                return false;
            }
        } else {
            log(colors.red, `❌ Profile получить не удалось. Status: ${response.statusCode}`);
            log(colors.red, `📄 Response: ${response.raw}`);
            return false;
        }
    } catch (error) {
        log(colors.red, `❌ Ошибка при получении profile: ${error.message}`);
        return false;
    }
}

async function testInvalidToken() {
    log(colors.blue + colors.bold, '\n🚫 Тестируем GET /api/auth/profile с недействительным токеном');
    
    try {
        const response = await makeRequest('GET', '/api/auth/profile', {
            'Authorization': 'Bearer invalid_token_12345'
        });
        
        if (response.statusCode === 401) {
            log(colors.green, '✅ Правильно отклонен недействительный токен');
            log(colors.green, `📍 Status: ${response.statusCode} (Unauthorized)`);
            return true;
        } else {
            log(colors.red, `❌ Неожиданный status code: ${response.statusCode}`);
            log(colors.red, `📄 Response: ${response.raw}`);
            return false;
        }
    } catch (error) {
        log(colors.red, `❌ Ошибка при тесте недействительного токена: ${error.message}`);
        return false;
    }
}

async function testHealth() {
    log(colors.blue + colors.bold, '\n🏥 Тестируем GET /api/health');
    
    try {
        const response = await makeRequest('GET', '/api/health');
        
        if (response.statusCode === 200) {
            log(colors.green, '✅ Health check прошел успешно');
            log(colors.green, `📍 Status: ${response.statusCode}`);
            return true;
        } else {
            log(colors.red, `❌ Health check неуспешен. Status: ${response.statusCode}`);
            return false;
        }
    } catch (error) {
        log(colors.red, `❌ Ошибка при health check: ${error.message}`);
        return false;
    }
}

async function runTests() {
    log(colors.yellow + colors.bold, '🧪 Запускаем тесты Auth API...');
    log(colors.yellow, `🌐 Base URL: ${BASE_URL}`);
    
    let passed = 0;
    let failed = 0;
    
    // Test 1: Health Check
    const healthResult = await testHealth();
    healthResult ? passed++ : failed++;
    
    // Test 2: Login
    const accessToken = await testLogin();
    accessToken ? passed++ : failed++;
    
    if (accessToken) {
        // Test 3: Profile with valid token
        const profileResult = await testProfile(accessToken);
        profileResult ? passed++ : failed++;
        
        // Test 4: Profile with invalid token
        const invalidTokenResult = await testInvalidToken();
        invalidTokenResult ? passed++ : failed++;
    } else {
        failed += 2; // Profile tests failed because login failed
    }
    
    // Results
    log(colors.yellow + colors.bold, '\n📊 Результаты тестирования:');
    log(colors.green, `✅ Успешно: ${passed}`);
    log(colors.red, `❌ Неудачно: ${failed}`);
    
    if (failed === 0) {
        log(colors.green + colors.bold, '\n🎉 Все тесты прошли успешно! API работает корректно.');
        process.exit(0);
    } else {
        log(colors.red + colors.bold, '\n💥 Некоторые тесты не прошли. Проверьте логи выше.');
        process.exit(1);
    }
}

// Запускаем тесты
runTests().catch(error => {
    log(colors.red, `💥 Критическая ошибка: ${error.message}`);
    process.exit(1);
});
