import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  VERBOSE = 4,
}

export interface LogEntry {
  level: string;
  timestamp: string;
  message: string;
  context?: string;
  data?: any;
  userId?: string;
  requestId?: string;
  duration?: number;
  method?: string;
  url?: string;
  statusCode?: number;
}

@Injectable({ scope: Scope.TRANSIENT })
export class CustomLoggerService implements LoggerService {
  private context?: string;
  private logLevel: LogLevel;

  constructor(private configService: ConfigService) {
    const level = this.configService.get('LOG_LEVEL', 'info').toLowerCase();
    this.logLevel = this.getLogLevelFromString(level);
  }

  setContext(context: string) {
    this.context = context;
  }

  log(message: string, context?: string, data?: any) {
    this.writeLog(LogLevel.INFO, message, context, data);
  }

  error(message: string, trace?: string, context?: string, data?: any) {
    this.writeLog(LogLevel.ERROR, message, context, { trace, ...data });
  }

  warn(message: string, context?: string, data?: any) {
    this.writeLog(LogLevel.WARN, message, context, data);
  }

  debug(message: string, context?: string, data?: any) {
    this.writeLog(LogLevel.DEBUG, message, context, data);
  }

  verbose(message: string, context?: string, data?: any) {
    this.writeLog(LogLevel.VERBOSE, message, context, data);
  }

  // Специальные методы для читаемых логов
  logRequest(method: string, url: string, userId?: string, requestId?: string, data?: any) {
    const emoji = this.getMethodEmoji(method);
    const message = `${emoji} ${method} ${url}`;
    
    this.writeLog(LogLevel.INFO, message, 'HTTP', {
      type: 'request',
      method,
      url,
      userId: userId || 'anonymous',
      requestId,
      timestamp: new Date().toISOString(),
      ...data,
    });
  }

  logResponse(method: string, url: string, statusCode: number, duration: number, userId?: string, requestId?: string) {
    const emoji = this.getStatusEmoji(statusCode);
    const statusColor = this.getStatusColor(statusCode);
    const durationColor = this.getDurationColor(duration);
    
    const message = `${emoji} ${method} ${url} - ${statusColor}${statusCode}\x1b[0m (${durationColor}${duration}ms\x1b[0m)`;
    
    this.writeLog(LogLevel.INFO, message, 'HTTP', {
      type: 'response',
      method,
      url,
      statusCode,
      duration,
      userId: userId || 'anonymous',
      requestId,
      timestamp: new Date().toISOString(),
    });
  }

  logError(error: Error, context?: string, userId?: string, requestId?: string) {
    const message = `💥 ${error.message}`;
    
    this.writeLog(LogLevel.ERROR, message, context || 'Error', {
      type: 'error',
      error: error.name,
      message: error.message,
      stack: error.stack,
      userId,
      requestId,
      timestamp: new Date().toISOString(),
    });
  }

  logSecurity(message: string, ip: string, userAgent?: string, data?: any) {
    const securityMessage = `🛡️  БЕЗОПАСНОСТЬ: ${message}`;
    
    this.writeLog(LogLevel.WARN, securityMessage, 'Security', {
      type: 'security',
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
      ...data,
    });
  }

  logCache(action: 'HIT' | 'MISS' | 'SET' | 'DELETE', key: string, ttl?: number) {
    const emoji = action === 'HIT' ? '🎯' : action === 'MISS' ? '📦' : action === 'SET' ? '💾' : '🗑️';
    const message = `${emoji} Cache ${action}: ${key}${ttl ? ` (TTL: ${ttl}s)` : ''}`;
    
    this.writeLog(LogLevel.DEBUG, message, 'Cache', {
      type: 'cache',
      action,
      key,
      ttl,
      timestamp: new Date().toISOString(),
    });
  }

  logDatabase(query: string, duration: number, affected?: number) {
    const message = `🗄️  DB Query (${duration}ms)${affected !== undefined ? ` - ${affected} rows` : ''}`;
    
    this.writeLog(LogLevel.DEBUG, message, 'Database', {
      type: 'database',
      query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
      duration,
      affected,
      timestamp: new Date().toISOString(),
    });
  }

  logSystem(message: string, data?: any) {
    const systemMessage = `⚙️  ${message}`;
    
    this.writeLog(LogLevel.INFO, systemMessage, 'System', {
      type: 'system',
      timestamp: new Date().toISOString(),
      ...data,
    });
  }

  private writeLog(level: LogLevel, message: string, context?: string, data?: any) {
    if (level > this.logLevel) {
      return;
    }

    const timestamp = new Date().toISOString();
    const contextStr = context || this.context || 'App';
    const levelStr = LogLevel[level];
    
    const logEntry: LogEntry = {
      level: levelStr,
      timestamp,
      message,
      context: contextStr,
      data,
    };

    // Форматированный вывод в консоль
    this.formatConsoleOutput(level, message, contextStr, timestamp, data);

    // Здесь можно добавить запись в файл или внешний сервис логирования
    // this.writeToFile(logEntry);
  }

  private formatConsoleOutput(level: LogLevel, message: string, context: string, timestamp: string, data?: any) {
    const colors = {
      [LogLevel.ERROR]: '\x1b[31m',   // Красный
      [LogLevel.WARN]: '\x1b[33m',    // Желтый
      [LogLevel.INFO]: '\x1b[32m',    // Зеленый
      [LogLevel.DEBUG]: '\x1b[36m',   // Голубой
      [LogLevel.VERBOSE]: '\x1b[35m', // Фиолетовый
    };

    const levelColors = {
      [LogLevel.ERROR]: '\x1b[41m\x1b[37m', // Красный фон, белый текст
      [LogLevel.WARN]: '\x1b[43m\x1b[30m',  // Желтый фон, черный текст
      [LogLevel.INFO]: '\x1b[42m\x1b[37m',  // Зеленый фон, белый текст
      [LogLevel.DEBUG]: '\x1b[46m\x1b[30m', // Голубой фон, черный текст
      [LogLevel.VERBOSE]: '\x1b[45m\x1b[37m', // Фиолетовый фон, белый текст
    };

    const reset = '\x1b[0m';
    const bold = '\x1b[1m';
    const dim = '\x1b[2m';

    const timeStr = `${dim}${timestamp.substring(11, 19)}${reset}`;
    const levelStr = `${levelColors[level]} ${LogLevel[level].padEnd(7)} ${reset}`;
    const contextStr = `${bold}[${context}]${reset}`;
    const messageStr = `${colors[level]}${message}${reset}`;

    let output = `${timeStr} ${levelStr} ${contextStr} ${messageStr}`;

    // Добавляем данные если есть
    if (data && Object.keys(data).length > 0) {
      const dataStr = this.formatData(data);
      output += `\n${dim}    ${dataStr}${reset}`;
    }

    console.log(output);
  }

  private formatData(data: any): string {
    if (typeof data === 'string') {
      return data;
    }

    try {
      // Удаляем чувствительные данные
      const sanitized = this.sanitizeData(data);
      return JSON.stringify(sanitized, null, 2).replace(/\n/g, '\n    ');
    } catch {
      return String(data);
    }
  }

  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization'];
    const sanitized = { ...data };

    Object.keys(sanitized).forEach(key => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '***';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitizeData(sanitized[key]);
      }
    });

    return sanitized;
  }

  private getLogLevelFromString(level: string): LogLevel {
    switch (level) {
      case 'error': return LogLevel.ERROR;
      case 'warn': return LogLevel.WARN;
      case 'info': return LogLevel.INFO;
      case 'debug': return LogLevel.DEBUG;
      case 'verbose': return LogLevel.VERBOSE;
      default: return LogLevel.INFO;
    }
  }

  private getMethodEmoji(method: string): string {
    const emojis = {
      'GET': '📥',
      'POST': '📤',
      'PUT': '✏️',
      'PATCH': '🔧',
      'DELETE': '🗑️',
      'OPTIONS': '❓',
      'HEAD': '👁️',
    };
    return emojis[method] || '📎';
  }

  private getStatusEmoji(statusCode: number): string {
    if (statusCode >= 200 && statusCode < 300) return '✅';
    if (statusCode >= 300 && statusCode < 400) return '🔄';
    if (statusCode >= 400 && statusCode < 500) return '⚠️';
    if (statusCode >= 500) return '❌';
    return '❓';
  }

  private getStatusColor(statusCode: number): string {
    if (statusCode >= 200 && statusCode < 300) return '\x1b[32m';  // Зеленый
    if (statusCode >= 300 && statusCode < 400) return '\x1b[36m';  // Голубой
    if (statusCode >= 400 && statusCode < 500) return '\x1b[33m';  // Желтый
    if (statusCode >= 500) return '\x1b[31m';                      // Красный
    return '\x1b[37m';                                             // Белый
  }

  private getDurationColor(duration: number): string {
    if (duration < 100) return '\x1b[32m';    // Зеленый (быстро)
    if (duration < 500) return '\x1b[33m';    // Желтый (средне)
    if (duration < 1000) return '\x1b[35m';   // Фиолетовый (медленно)
    return '\x1b[31m';                        // Красный (очень медленно)
  }
}