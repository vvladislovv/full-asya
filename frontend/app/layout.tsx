import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "./hooks/useLanguage";
import { AuthProvider } from "./providers/useAuth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DrAsya - Cognitive Tests",
  description: "Cognitive assessment and training platform",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        {/* Подавляем предупреждения о гидратации для всех элементов head */}
        <meta name="next-head-count" content="0" />
        {/* Оптимизированный скрипт очистки атрибутов браузерных расширений */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Подавляем предупреждения о гидратации
              window.__NEXT_DATA__ = window.__NEXT_DATA__ || {};
              window.__NEXT_DATA__.suppressHydrationWarning = true;
              
              // Оптимизированная функция для очистки атрибутов от браузерных расширений
              let cleanupInProgress = false;
              let cleanupTimeout = null;
              
              function cleanupExtensionAttributes() {
                if (cleanupInProgress) return;
                cleanupInProgress = true;
                
                try {
                  // Удаляем атрибуты, добавленные браузерными расширениями
                  const elements = document.querySelectorAll('[bis_skin_checked]');
                  elements.forEach(el => {
                    el.removeAttribute('bis_skin_checked');
                  });
                  
                  // Удаляем другие возможные атрибуты от расширений
                  const extensionAttributes = [
                    'data-adblockkey',
                    'data-adblock',
                    'data-adblock-detected',
                    'data-adblock-removed',
                    'data-extension',
                    'data-browser-extension',
                    'data-ublock-origin',
                    'data-ghostery',
                    'data-privacy-badger',
                    'data-bitdefender',
                    'data-avast',
                    'data-kaspersky'
                  ];
                  
                  extensionAttributes.forEach(attr => {
                    const elementsWithAttr = document.querySelectorAll('[' + attr + ']');
                    elementsWithAttr.forEach(el => {
                      el.removeAttribute(attr);
                    });
                  });
                  
                  // Удаляем скрипты и стили от расширений
                  const extensionScripts = document.querySelectorAll('script[src*="extension"], script[src*="adblock"]');
                  extensionScripts.forEach(script => {
                    if (script.parentNode) {
                      script.parentNode.removeChild(script);
                    }
                  });
                  
                  const extensionStyles = document.querySelectorAll('style[data-extension], link[href*="extension"]');
                  extensionStyles.forEach(style => {
                    if (style.parentNode) {
                      style.parentNode.removeChild(style);
                    }
                  });
                  
                  // console.log('🧹 Очищены атрибуты браузерных расширений');
                } catch (error) {
                  console.warn('⚠️ Ошибка при очистке атрибутов расширений:', error);
                } finally {
                  cleanupInProgress = false;
                }
              }
              
              // Debounced функция очистки для оптимизации
              function debouncedCleanup() {
                if (cleanupTimeout) {
                  clearTimeout(cleanupTimeout);
                }
                cleanupTimeout = setTimeout(cleanupExtensionAttributes, 100);
              }
              
              // Запускаем очистку как можно раньше
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', cleanupExtensionAttributes);
              } else {
                cleanupExtensionAttributes();
              }
              
              // Очистка при загрузке страницы
              window.addEventListener('load', cleanupExtensionAttributes);
              
              // Оптимизированный MutationObserver для отслеживания изменений
              let observer = null;
              let observerActive = false;
              
              function startObserver() {
                if (observerActive || observer) return;
                
                observer = new MutationObserver((mutations) => {
                  let needsCleanup = false;
                  
                  mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes') {
                      const target = mutation.target;
                      if (target && target.hasAttribute && 
                          (target.hasAttribute('bis_skin_checked') || 
                           target.hasAttribute('data-adblock'))) {
                        needsCleanup = true;
                      }
                    }
                  });
                  
                  if (needsCleanup) {
                    debouncedCleanup();
                  }
                });
                
                if (document.body) {
                  observer.observe(document.body, {
                    attributes: true,
                    childList: true,
                    subtree: true,
                    attributeFilter: ['bis_skin_checked', 'data-adblock', 'data-adblockkey', 'data-extension']
                  });
                  observerActive = true;
                }
              }
              
              // Запускаем observer после загрузки DOM
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', startObserver);
              } else {
                startObserver();
              }
              
              // Инициализация Telegram WebApp
              if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
                const tg = window.Telegram.WebApp;
                
                try {
                  tg.ready();
                  tg.expand();
                  
                  // Настройка темы под наш дизайн
                  if (tg.colorScheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                  
                  // Настройка цветов интерфейса Telegram
                  tg.setHeaderColor('#E8ECF5');
                  tg.setBackgroundColor('#E8ECF5');
                  
                  // Включаем подтверждение закрытия
                  tg.enableClosingConfirmation();
                  
                  // console.log('🔗 Telegram WebApp инициализирован');
                  // console.log('👤 Пользователь:', tg.initDataUnsafe?.user);
                  // console.log('💬 Чат:', tg.initDataUnsafe?.chat);
                  // console.log('🎨 Тема:', tg.colorScheme);
                  // console.log('📱 Платформа:', tg.platform);
                } catch (error) {
                  console.warn('⚠️ Ошибка инициализации Telegram WebApp:', error);
                }
              } else {
                // console.log('🌐 Работаем в обычном веб-режиме');
              }
              
              // Очистка при размонтировании
              window.addEventListener('beforeunload', () => {
                if (observer) {
                  observer.disconnect();
                  observer = null;
                  observerActive = false;
                }
                if (cleanupTimeout) {
                  clearTimeout(cleanupTimeout);
                  cleanupTimeout = null;
                }
              });
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
