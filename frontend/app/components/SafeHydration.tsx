"use client";

import { useCallback, useEffect, useRef, useState } from "react"
import styles from './SafeHydration.module.css'

interface SafeHydrationProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  suppressHydrationWarning?: boolean;
}

export default function SafeHydration({ 
  children, 
  fallback = null,
  suppressHydrationWarning = true 
}: SafeHydrationProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Мемоизируем функцию очистки для оптимизации
  const cleanupExtensionAttributes = useCallback(() => {
    if (!containerRef.current) return;

    try {
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
        'data-kaspersky'
      ];
      
      extensionAttributes.forEach(attr => {
        const elementsWithAttr = containerRef.current?.querySelectorAll('[' + attr + ']');
        elementsWithAttr?.forEach(el => {
          el.removeAttribute(attr);
        });
      });
    } catch (error) {
      console.warn('⚠️ Ошибка при очистке атрибутов расширений:', error);
    }
  }, []);

  // Функция для безопасной очистки с debounce
  const debouncedCleanup = useCallback(() => {
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
    }
    cleanupTimeoutRef.current = setTimeout(cleanupExtensionAttributes, 50);
  }, [cleanupExtensionAttributes]);

  useEffect(() => {
    setHasMounted(true);
    
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
  }, [cleanupExtensionAttributes, debouncedCleanup]);

  if (!hasMounted) {
    return (
      <div 
        ref={containerRef}
        suppressHydrationWarning={true}
        className={styles.safeHydrationFallback}
      >
        {fallback}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      suppressHydrationWarning={suppressHydrationWarning}
      className={styles.safeHydrationContainer}
    >
      {children}
    </div>
  );
}
