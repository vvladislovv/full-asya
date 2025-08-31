"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './ExtensionCleanup.module.css';

interface ExtensionCleanupProps {
  children: React.ReactNode;
  debug?: boolean;
}

export default function ExtensionCleanup({ children, debug = false }: ExtensionCleanupProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCleaning, setIsCleaning] = useState(false);
  const observerRef = useRef<MutationObserver | null>(null);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Мемоизируем функцию очистки для оптимизации
  const cleanupExtensionAttributes = useCallback(() => {
    if (!containerRef.current) return;

    try {
      setIsCleaning(true);
      
      // Удаляем атрибуты, добавленные браузерными расширениями
      const elements = containerRef.current.querySelectorAll('[bis_skin_checked]');
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
        'data-kaspersky',
        'data-norton',
        'data-mcafee',
        'data-eset'
      ];
      
      extensionAttributes.forEach(attr => {
        const elementsWithAttr = containerRef.current?.querySelectorAll('[' + attr + ']');
        elementsWithAttr?.forEach(el => {
          el.removeAttribute(attr);
        });
      });
      
      // Удаляем скрипты и стили от расширений
      const extensionScripts = containerRef.current.querySelectorAll('script[src*="extension"], script[src*="adblock"]');
      extensionScripts.forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
      
      const extensionStyles = containerRef.current.querySelectorAll('style[data-extension], link[href*="extension"]');
      extensionStyles.forEach(style => {
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      });
      
      if (debug) {
        console.log('🧹 Очищены атрибуты браузерных расширений в компоненте');
      }
      
      // Сбрасываем состояние очистки через небольшую задержку
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
      cleanupTimeoutRef.current = setTimeout(() => setIsCleaning(false), 200);
      
    } catch (error) {
      console.warn('⚠️ Ошибка при очистке атрибутов расширений в компоненте:', error);
      setIsCleaning(false);
    }
  }, [debug]);

  // Функция для безопасной очистки с debounce
  const debouncedCleanup = useCallback(() => {
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
    }
    cleanupTimeoutRef.current = setTimeout(cleanupExtensionAttributes, 50);
  }, [cleanupExtensionAttributes]);

  useEffect(() => {
    // Очищаем атрибуты сразу после монтирования
    cleanupExtensionAttributes();
    
    // Создаем MutationObserver для отслеживания изменений DOM
    observerRef.current = new MutationObserver((mutations) => {
      let needsCleanup = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          const target = mutation.target as Element;
          if (target && target.hasAttribute && 
              (target.hasAttribute('bis_skin_checked') || 
               target.hasAttribute('data-adblock'))) {
            needsCleanup = true;
          }
        }
      });
      
      if (needsCleanup) {
        // Используем debounced очистку для оптимизации
        debouncedCleanup();
      }
    });
    
    // Начинаем наблюдение за изменениями
    if (containerRef.current) {
      observerRef.current.observe(containerRef.current, {
        attributes: true,
        childList: true,
        subtree: true,
        attributeFilter: ['bis_skin_checked', 'data-adblock', 'data-adblockkey', 'data-extension']
      });
    }
    
    // Очистка при размонтировании
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
        cleanupTimeoutRef.current = null;
      }
    };
  }, [debouncedCleanup]);

  return (
    <div 
      ref={containerRef}
      suppressHydrationWarning={true}
      className={`${styles.extensionCleanupContainer} ${isCleaning ? styles.cleaning : ''}`}
      data-debug={debug}
    >
      {children}
    </div>
  );
}
