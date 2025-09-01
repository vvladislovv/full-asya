/**
 * Скрипт для тестирования всех игр через консоль браузера
 * Запустите этот код в консоли браузера на странице /tests
 */

class GameTester {
    constructor() {
        this.testResults = {};
        this.currentTest = null;
        this.logLevel = 'info'; // 'debug', 'info', 'warn', 'error'
    }

    log(level, message, data = null) {
        if (this.shouldLog(level)) {
            console[level](`[GameTester] ${message}`, data || '');
        }
    }

    shouldLog(level) {
        const levels = ['debug', 'info', 'warn', 'error'];
        return levels.indexOf(level) >= levels.indexOf(this.logLevel);
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Тест загрузки страницы тестов
    async testPageLoad() {
        this.log('info', 'Testing page load...');
        
        try {
            const testsContainer = document.querySelector('[data-testid="tests-container"]') || 
                                 document.querySelector('.grid') ||
                                 document.querySelector('main');
            
            if (!testsContainer) {
                throw new Error('Tests container not found');
            }

            const testCards = document.querySelectorAll('[data-testid="test-card"]') ||
                             document.querySelectorAll('.cursor-pointer') ||
                             document.querySelectorAll('div[class*="bg-"]');

            this.log('info', `Found ${testCards.length} test cards`);
            
            if (testCards.length === 0) {
                throw new Error('No test cards found');
            }

            this.testResults.pageLoad = {
                success: true,
                testCardsCount: testCards.length,
                timestamp: new Date().toISOString()
            };

            return true;
        } catch (error) {
            this.log('error', 'Page load test failed:', error.message);
            this.testResults.pageLoad = {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
            return false;
        }
    }

    // Тест кликабельности карточек тестов
    async testTestCards() {
        this.log('info', 'Testing test cards clickability...');
        
        try {
            const testCards = document.querySelectorAll('[data-testid="test-card"]') ||
                             document.querySelectorAll('.cursor-pointer') ||
                             document.querySelectorAll('div[class*="bg-"]:not([class*="bg-white"])');

            if (testCards.length === 0) {
                throw new Error('No clickable test cards found');
            }

            this.log('info', `Testing ${testCards.length} test cards`);
            
            const clickableCards = [];
            testCards.forEach((card, index) => {
                if (card.style.cursor === 'pointer' || card.classList.contains('cursor-pointer')) {
                    clickableCards.push({ index, element: card });
                }
            });

            this.testResults.testCards = {
                success: true,
                totalCards: testCards.length,
                clickableCards: clickableCards.length,
                timestamp: new Date().toISOString()
            };

            return true;
        } catch (error) {
            this.log('error', 'Test cards test failed:', error.message);
            this.testResults.testCards = {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
            return false;
        }
    }

    // Тест запуска конкретной игры
    async testGameLaunch(gameIndex = 0) {
        this.log('info', `Testing game launch for game index ${gameIndex}...`);
        
        try {
            const testCards = document.querySelectorAll('[data-testid="test-card"]') ||
                             document.querySelectorAll('.cursor-pointer') ||
                             document.querySelectorAll('div[class*="bg-"]:not([class*="bg-white"])');

            if (!testCards[gameIndex]) {
                throw new Error(`Game card at index ${gameIndex} not found`);
            }

            const originalURL = window.location.href;
            
            // Кликаем на карточку
            testCards[gameIndex].click();
            
            // Ждем загрузки
            await this.delay(2000);
            
            // Проверяем что URL изменился или появился таймер
            const hasTimer = document.querySelector('[data-testid="timer"]') ||
                           document.querySelector('.timer') ||
                           document.querySelector('div:contains("3")') ||
                           document.querySelector('div:contains("2")') ||
                           document.querySelector('div:contains("1")');

            const urlChanged = window.location.href !== originalURL;
            
            if (!hasTimer && !urlChanged) {
                throw new Error('Game did not launch properly - no timer found and URL did not change');
            }

            this.testResults[`gameLaunch_${gameIndex}`] = {
                success: true,
                hasTimer: !!hasTimer,
                urlChanged,
                currentURL: window.location.href,
                timestamp: new Date().toISOString()
            };

            this.log('info', `Game ${gameIndex} launched successfully`);
            return true;
        } catch (error) {
            this.log('error', `Game launch test failed for game ${gameIndex}:`, error.message);
            this.testResults[`gameLaunch_${gameIndex}`] = {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
            return false;
        }
    }

    // Тест наличия переводов
    async testTranslations() {
        this.log('info', 'Testing translations...');
        
        try {
            const textElements = document.querySelectorAll('*');
            const russianTexts = [];
            const englishTexts = [];
            
            textElements.forEach(element => {
                const text = element.textContent || element.innerText || '';
                if (text.trim().length > 0 && !element.children.length) {
                    // Проверяем на русские символы
                    if (/[а-яё]/i.test(text)) {
                        russianTexts.push({
                            text: text.trim(),
                            element: element.tagName,
                            className: element.className
                        });
                    } else if (/[a-z]/i.test(text)) {
                        englishTexts.push({
                            text: text.trim(),
                            element: element.tagName,
                            className: element.className
                        });
                    }
                }
            });

            this.testResults.translations = {
                success: russianTexts.length === 0, // Успех если нет русского текста
                russianTexts: russianTexts.slice(0, 10), // Первые 10 для анализа
                englishTexts: englishTexts.slice(0, 10),
                russianCount: russianTexts.length,
                englishCount: englishTexts.length,
                timestamp: new Date().toISOString()
            };

            if (russianTexts.length > 0) {
                this.log('warn', `Found ${russianTexts.length} Russian texts:`, russianTexts.slice(0, 5));
            } else {
                this.log('info', 'All texts are properly translated to English');
            }

            return russianTexts.length === 0;
        } catch (error) {
            this.log('error', 'Translation test failed:', error.message);
            this.testResults.translations = {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
            return false;
        }
    }

    // Тест консольных ошибок
    async testConsoleErrors() {
        this.log('info', 'Testing console errors...');
        
        try {
            const originalError = console.error;
            const errors = [];
            
            console.error = function(...args) {
                errors.push({
                    message: args.join(' '),
                    timestamp: new Date().toISOString(),
                    stack: new Error().stack
                });
                originalError.apply(console, args);
            };

            // Ждем 5 секунд для сбора ошибок
            await this.delay(5000);
            
            // Восстанавливаем оригинальный console.error
            console.error = originalError;

            this.testResults.consoleErrors = {
                success: errors.length === 0,
                errorCount: errors.length,
                errors: errors.slice(0, 5), // Первые 5 ошибок
                timestamp: new Date().toISOString()
            };

            if (errors.length > 0) {
                this.log('warn', `Found ${errors.length} console errors:`, errors.slice(0, 3));
            } else {
                this.log('info', 'No console errors detected');
            }

            return errors.length === 0;
        } catch (error) {
            this.log('error', 'Console errors test failed:', error.message);
            this.testResults.consoleErrors = {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
            return false;
        }
    }

    // Тест производительности
    async testPerformance() {
        this.log('info', 'Testing performance...');
        
        try {
            const startTime = performance.now();
            
            // Тестируем рендеринг
            const renderStart = performance.now();
            await this.delay(1000); // Имитируем нагрузку
            const renderTime = performance.now() - renderStart;
            
            // Тестируем память
            const memoryInfo = performance.memory ? {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            } : null;

            const totalTime = performance.now() - startTime;

            this.testResults.performance = {
                success: renderTime < 5000 && totalTime < 10000, // Менее 5 и 10 секунд
                renderTime,
                totalTime,
                memoryInfo,
                timestamp: new Date().toISOString()
            };

            this.log('info', `Performance test completed. Render: ${renderTime.toFixed(2)}ms, Total: ${totalTime.toFixed(2)}ms`);
            return this.testResults.performance.success;
        } catch (error) {
            this.log('error', 'Performance test failed:', error.message);
            this.testResults.performance = {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
            return false;
        }
    }

    // Тест всех игр подряд
    async testAllGames() {
        this.log('info', 'Starting comprehensive test of all games...');
        
        const tests = [
            { name: 'Page Load', method: this.testPageLoad },
            { name: 'Test Cards', method: this.testTestCards },
            { name: 'Translations', method: this.testTranslations },
            { name: 'Console Errors', method: this.testConsoleErrors },
            { name: 'Performance', method: this.testPerformance }
        ];

        const results = {};
        
        for (const test of tests) {
            this.log('info', `Running test: ${test.name}`);
            try {
                const result = await test.method.call(this);
                results[test.name] = { success: result };
                this.log(result ? 'info' : 'error', `Test ${test.name}: ${result ? 'PASSED' : 'FAILED'}`);
            } catch (error) {
                results[test.name] = { success: false, error: error.message };
                this.log('error', `Test ${test.name}: ERROR - ${error.message}`);
            }
            
            await this.delay(1000); // Пауза между тестами
        }

        // Тестируем запуск первых 3 игр
        for (let i = 0; i < Math.min(3, 8); i++) {
            this.log('info', `Testing game launch for game ${i}`);
            try {
                // Возвращаемся на главную страницу тестов
                if (window.location.pathname !== '/tests') {
                    window.history.back();
                    await this.delay(2000);
                }
                
                const result = await this.testGameLaunch(i);
                results[`Game ${i} Launch`] = { success: result };
                this.log(result ? 'info' : 'error', `Game ${i} Launch: ${result ? 'PASSED' : 'FAILED'}`);
                
                await this.delay(2000);
            } catch (error) {
                results[`Game ${i} Launch`] = { success: false, error: error.message };
                this.log('error', `Game ${i} Launch: ERROR - ${error.message}`);
            }
        }

        this.generateReport(results);
        return results;
    }

    // Генерация отчета
    generateReport(results) {
        const totalTests = Object.keys(results).length;
        const passedTests = Object.values(results).filter(r => r.success).length;
        const failedTests = totalTests - passedTests;

        console.log('\n' + '='.repeat(50));
        console.log('🎮 GAME TESTING REPORT 🎮');
        console.log('='.repeat(50));
        console.log(`📊 Total Tests: ${totalTests}`);
        console.log(`✅ Passed: ${passedTests}`);
        console.log(`❌ Failed: ${failedTests}`);
        console.log(`🎯 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
        console.log('='.repeat(50));
        
        Object.entries(results).forEach(([testName, result]) => {
            const status = result.success ? '✅' : '❌';
            console.log(`${status} ${testName}: ${result.success ? 'PASSED' : 'FAILED'}`);
            if (!result.success && result.error) {
                console.log(`   Error: ${result.error}`);
            }
        });
        
        console.log('='.repeat(50));
        console.log('📋 Detailed Results:');
        console.log(this.testResults);
        console.log('='.repeat(50));

        // Рекомендации
        console.log('💡 RECOMMENDATIONS:');
        if (failedTests > 0) {
            console.log('• Fix failed tests before deployment');
            if (results['Translations'] && !results['Translations'].success) {
                console.log('• Complete translation of all Russian texts');
            }
            if (results['Console Errors'] && !results['Console Errors'].success) {
                console.log('• Fix console errors for better stability');
            }
        } else {
            console.log('• All tests passed! ✨');
            console.log('• Ready for deployment 🚀');
        }
        console.log('='.repeat(50));
    }
}

// Глобальная переменная для использования в консоли
window.gameTester = new GameTester();

// Автозапуск тестов
console.log('🎮 Game Tester Loaded! 🎮');
console.log('📝 Commands:');
console.log('  gameTester.testAllGames() - Run all tests');
console.log('  gameTester.testPageLoad() - Test page loading');
console.log('  gameTester.testTranslations() - Test translations');
console.log('  gameTester.testGameLaunch(0) - Test specific game');
console.log('  gameTester.logLevel = "debug" - Set log level');
console.log('');
console.log('🚀 Starting automatic test in 3 seconds...');

// Автозапуск через 3 секунды
setTimeout(() => {
    console.log('🎯 Starting automatic comprehensive test...');
    window.gameTester.testAllGames();
}, 3000);
