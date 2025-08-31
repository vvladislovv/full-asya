"use client";

import { useEffect, useState } from 'react';
import ExtensionCleanup from './ExtensionCleanup';
import SafeHydration from './SafeHydration';

export default function HydrationTest() {
  const [mounted, setMounted] = useState(false);
  const [testCount, setTestCount] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const simulateExtensionAttribute = () => {
    // Симулируем добавление атрибута браузерного расширения
    const testElement = document.getElementById('test-element');
    if (testElement) {
      testElement.setAttribute('bis_skin_checked', '1');
      testElement.setAttribute('data-adblock', 'true');
      setTestCount(prev => prev + 1);
    }
  };

  const checkAttributes = () => {
    const testElement = document.getElementById('test-element');
    if (testElement) {
      const hasBisSkin = testElement.hasAttribute('bis_skin_checked');
      const hasAdblock = testElement.hasAttribute('data-adblock');
      console.log('🔍 Проверка атрибутов:', { hasBisSkin, hasAdblock });
    }
  };

  return (
    <ExtensionCleanup debug={false}>
      <SafeHydration fallback={
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p>Загрузка теста гидратации...</p>
        </div>
      }>
        <div className="p-8 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Тест гидратации и очистки атрибутов
          </h1>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Статус</h2>
              <div className="space-y-2">
                <p><strong>Гидратация:</strong> {mounted ? '✅ Завершена' : '⏳ В процессе'}</p>
                <p><strong>Тестов запущено:</strong> {testCount}</p>
                <p><strong>Время:</strong> {new Date().toLocaleTimeString()}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Тестовый элемент</h2>
              <div 
                id="test-element"
                className="p-4 bg-gray-100 rounded border-2 border-dashed border-gray-300"
                suppressHydrationWarning
              >
                <p>Этот элемент используется для тестирования очистки атрибутов</p>
                <p className="text-sm text-gray-600 mt-2">
                  ID: test-element
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Действия</h2>
              <div className="space-y-3">
                <button
                  onClick={simulateExtensionAttribute}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                >
                  🧪 Симулировать атрибут расширения
                </button>
                
                <button
                  onClick={checkAttributes}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
                >
                  🔍 Проверить атрибуты
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
                >
                  🔄 Перезагрузить страницу
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Инструкции</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Нажмите "Симулировать атрибут расширения" для добавления тестовых атрибутов</li>
                <li>Нажмите "Проверить атрибуты" для проверки текущего состояния</li>
                <li>Компонент ExtensionCleanup автоматически очистит атрибуты</li>
                <li>Проверьте консоль браузера для логов очистки</li>
                <li>В правом верхнем углу должен быть индикатор активности очистки</li>
              </ol>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-2">💡 Примечание</h3>
              <p className="text-yellow-700 text-sm">
                Этот компонент демонстрирует работу системы очистки атрибутов браузерных расширений. 
                В реальном приложении атрибуты добавляются автоматически браузерными расширениями 
                (антивирусы, блокировщики рекламы и т.д.).
              </p>
            </div>
          </div>
        </div>
      </SafeHydration>
    </ExtensionCleanup>
  );
} 