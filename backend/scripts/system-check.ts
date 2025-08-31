#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface CheckResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  details?: string;
  fix?: string;
}

class SystemChecker {
  private results: CheckResult[] = [];

  async runAllChecks(): Promise<void> {
    console.log('🔍 Проверка системы DrAsya Backend API\n');

    this.checkNodeVersion();
    this.checkPackageJson();
    this.checkEnvironmentFile();
    this.checkDependencies();
    this.checkTypeScriptConfig();
    this.checkDatabaseConfig();
    this.checkRedisConfig();
    this.checkSecurityConfig();
    this.checkDockerConfig();
    this.checkScripts();

    this.printResults();
  }

  private checkNodeVersion(): void {
    try {
      const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
      const version = parseInt(nodeVersion.replace('v', '').split('.')[0]);
      
      if (version >= 18) {
        this.addResult('Node.js Version', 'PASS', `Node.js ${nodeVersion} ✅`);
      } else {
        this.addResult('Node.js Version', 'FAIL', 
          `Node.js ${nodeVersion} - требуется версия 18+`,
          undefined,
          'Обновите Node.js до версии 18 или выше: https://nodejs.org/'
        );
      }
    } catch (error) {
      this.addResult('Node.js Version', 'FAIL', 'Node.js не установлен', 
        error.message, 'Установите Node.js: https://nodejs.org/');
    }
  }

  private checkPackageJson(): void {
    const packagePath = path.join(process.cwd(), 'package.json');
    
    if (!fs.existsSync(packagePath)) {
      this.addResult('Package.json', 'FAIL', 'Файл package.json не найден');
      return;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      const requiredDeps = [
        '@nestjs/common', '@nestjs/core', '@nestjs/platform-express',
        '@nestjs/config', '@nestjs/typeorm', '@nestjs/swagger',
        '@nestjs/cache-manager', '@nestjs/throttler',
        'typeorm', 'pg', 'ioredis', 'cache-manager',
        'class-validator', 'class-transformer'
      ];

      const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
      
      if (missingDeps.length === 0) {
        this.addResult('Dependencies', 'PASS', 'Все необходимые зависимости присутствуют');
      } else {
        this.addResult('Dependencies', 'FAIL', 
          `Отсутствуют зависимости: ${missingDeps.join(', ')}`,
          undefined,
          'Запустите: npm install'
        );
      }
    } catch (error) {
      this.addResult('Package.json', 'FAIL', 'Ошибка чтения package.json', error.message);
    }
  }

  private checkEnvironmentFile(): void {
    const envPath = path.join(process.cwd(), '.env');
    const envExamplePath = path.join(process.cwd(), 'env.example');
    
    if (!fs.existsSync(envExamplePath)) {
      this.addResult('Environment Example', 'WARNING', 'Файл env.example не найден');
    } else {
      this.addResult('Environment Example', 'PASS', 'Файл env.example существует');
    }

    if (!fs.existsSync(envPath)) {
      this.addResult('Environment Config', 'WARNING', 
        'Файл .env не найден', 
        undefined,
        'Скопируйте env.example в .env и настройте переменные'
      );
      return;
    }

    try {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const requiredVars = [
        'DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE',
        'JWT_SECRET', 'REDIS_HOST', 'REDIS_PORT'
      ];

      const missingVars = requiredVars.filter(varName => !envContent.includes(varName));
      
      if (missingVars.length === 0) {
        this.addResult('Environment Config', 'PASS', 'Все необходимые переменные окружения настроены');
      } else {
        this.addResult('Environment Config', 'WARNING', 
          `Отсутствуют переменные: ${missingVars.join(', ')}`,
          undefined,
          'Добавьте недостающие переменные в .env файл'
        );
      }

      // Проверка безопасности JWT_SECRET
      if (envContent.includes('JWT_SECRET=your-super-secret-jwt-key')) {
        this.addResult('JWT Security', 'FAIL', 
          'JWT_SECRET использует значение по умолчанию!',
          undefined,
          'Измените JWT_SECRET на уникальный случайный ключ'
        );
      } else {
        this.addResult('JWT Security', 'PASS', 'JWT_SECRET настроен');
      }
    } catch (error) {
      this.addResult('Environment Config', 'FAIL', 'Ошибка чтения .env файла', error.message);
    }
  }

  private checkDependencies(): void {
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    
    if (!fs.existsSync(nodeModulesPath)) {
      this.addResult('Node Modules', 'FAIL', 
        'Зависимости не установлены',
        undefined,
        'Запустите: npm install'
      );
      return;
    }

    try {
      execSync('npm list --depth=0', { encoding: 'utf8', stdio: 'pipe' });
      this.addResult('Node Modules', 'PASS', 'Зависимости установлены корректно');
    } catch (error) {
      this.addResult('Node Modules', 'WARNING', 
        'Возможны проблемы с зависимостями',
        error.message,
        'Запустите: npm install'
      );
    }
  }

  private checkTypeScriptConfig(): void {
    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
    
    if (!fs.existsSync(tsconfigPath)) {
      this.addResult('TypeScript Config', 'FAIL', 'tsconfig.json не найден');
      return;
    }

    try {
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
      
      if (tsconfig.compilerOptions && tsconfig.compilerOptions.experimentalDecorators) {
        this.addResult('TypeScript Config', 'PASS', 'TypeScript настроен корректно');
      } else {
        this.addResult('TypeScript Config', 'WARNING', 'Возможны проблемы с конфигурацией TypeScript');
      }
    } catch (error) {
      this.addResult('TypeScript Config', 'FAIL', 'Ошибка чтения tsconfig.json', error.message);
    }
  }

  private checkDatabaseConfig(): void {
    const configPath = path.join(process.cwd(), 'src', 'config', 'database.config.ts');
    
    if (fs.existsSync(configPath)) {
      this.addResult('Database Config', 'PASS', 'Конфигурация базы данных найдена');
    } else {
      this.addResult('Database Config', 'FAIL', 'Конфигурация базы данных не найдена');
    }

    // Проверка сущностей
    const entitiesPath = path.join(process.cwd(), 'src', 'entities');
    if (fs.existsSync(entitiesPath)) {
      const entities = fs.readdirSync(entitiesPath).filter(file => file.endsWith('.entity.ts'));
      this.addResult('Database Entities', 'PASS', `Найдено ${entities.length} сущностей`);
    } else {
      this.addResult('Database Entities', 'FAIL', 'Папка entities не найдена');
    }
  }

  private checkRedisConfig(): void {
    const redisConfigPath = path.join(process.cwd(), 'src', 'config', 'redis.config.ts');
    
    if (fs.existsSync(redisConfigPath)) {
      this.addResult('Redis Config', 'PASS', 'Конфигурация Redis найдена');
    } else {
      this.addResult('Redis Config', 'FAIL', 'Конфигурация Redis не найдена');
    }
  }

  private checkSecurityConfig(): void {
    const filterPath = path.join(process.cwd(), 'src', 'common', 'filters', 'http-exception.filter.ts');
    const guardPath = path.join(process.cwd(), 'src', 'common', 'guards', 'throttle.guard.ts');
    const middlewarePath = path.join(process.cwd(), 'src', 'common', 'middleware', 'security.middleware.ts');
    
    const securityComponents = [
      { path: filterPath, name: 'Exception Filter' },
      { path: guardPath, name: 'Throttle Guard' },
      { path: middlewarePath, name: 'Security Middleware' }
    ];

    const existing = securityComponents.filter(comp => fs.existsSync(comp.path));
    
    if (existing.length === securityComponents.length) {
      this.addResult('Security Components', 'PASS', 'Все компоненты безопасности найдены');
    } else {
      const missing = securityComponents.filter(comp => !fs.existsSync(comp.path));
      this.addResult('Security Components', 'WARNING', 
        `Отсутствуют: ${missing.map(m => m.name).join(', ')}`
      );
    }
  }

  private checkDockerConfig(): void {
    const dockerfilePath = path.join(process.cwd(), 'Dockerfile');
    const dockerComposePath = path.join(process.cwd(), 'docker-compose.yml');
    
    if (fs.existsSync(dockerfilePath)) {
      this.addResult('Docker', 'PASS', 'Dockerfile найден');
    } else {
      this.addResult('Docker', 'WARNING', 'Dockerfile не найден');
    }

    if (fs.existsSync(dockerComposePath)) {
      this.addResult('Docker Compose', 'PASS', 'docker-compose.yml найден');
    } else {
      this.addResult('Docker Compose', 'WARNING', 'docker-compose.yml не найден');
    }
  }

  private checkScripts(): void {
    const scriptsPath = path.join(process.cwd(), 'scripts');
    
    if (fs.existsSync(scriptsPath)) {
      const scripts = fs.readdirSync(scriptsPath).filter(file => file.endsWith('.ts'));
      this.addResult('Scripts', 'PASS', `Найдено ${scripts.length} скриптов`);
    } else {
      this.addResult('Scripts', 'WARNING', 'Папка scripts не найдена');
    }

    // Проверка важных скриптов
    const importantScripts = ['seed.ts', 'test-security.ts'];
    const existingScripts = importantScripts.filter(script => 
      fs.existsSync(path.join(scriptsPath, script))
    );

    if (existingScripts.length === importantScripts.length) {
      this.addResult('Important Scripts', 'PASS', 'Все важные скрипты найдены');
    } else {
      const missing = importantScripts.filter(script => !existingScripts.includes(script));
      this.addResult('Important Scripts', 'WARNING', 
        `Отсутствуют скрипты: ${missing.join(', ')}`
      );
    }
  }

  private addResult(name: string, status: 'PASS' | 'FAIL' | 'WARNING', message: string, details?: string, fix?: string): void {
    this.results.push({ name, status, message, details, fix });
  }

  private printResults(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 РЕЗУЛЬТАТЫ ПРОВЕРКИ СИСТЕМЫ');
    console.log('='.repeat(60));

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const warnings = this.results.filter(r => r.status === 'WARNING').length;

    this.results.forEach(result => {
      const emoji = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`${emoji} ${result.name}: ${result.message}`);
      
      if (result.details) {
        console.log(`   📝 Детали: ${result.details}`);
      }
      
      if (result.fix) {
        console.log(`   🔧 Исправление: ${result.fix}`);
      }
    });

    console.log('\n' + '-'.repeat(60));
    console.log(`📈 ИТОГО: ${passed} прошло, ${failed} провалено, ${warnings} предупреждений`);
    
    if (failed > 0) {
      console.log('\n🚨 КРИТИЧЕСКИЕ ПРОБЛЕМЫ ОБНАРУЖЕНЫ!');
      console.log('Исправьте критические ошибки перед запуском приложения.');
      process.exit(1);
    } else if (warnings > 0) {
      console.log('\n⚠️  ОБНАРУЖЕНЫ ПОТЕНЦИАЛЬНЫЕ ПРОБЛЕМЫ');
      console.log('Рекомендуется исправить предупреждения для стабильной работы.');
    } else {
      console.log('\n🎉 ВСЕ ПРОВЕРКИ ПРОШЛИ УСПЕШНО!');
      console.log('Система готова к запуску.');
    }

    console.log('\n📋 СЛЕДУЮЩИЕ ШАГИ:');
    console.log('1. Убедитесь, что PostgreSQL и Redis запущены');
    console.log('2. Запустите: npm run seed (для инициализации данных)');
    console.log('3. Запустите: npm run start:dev (для разработки)');
    console.log('4. Запустите: npm run test:security (для проверки безопасности)');
    console.log('5. Откройте: http://localhost:3000/api/docs (документация API)');
  }
}

// Запуск проверки
async function main() {
  const checker = new SystemChecker();
  await checker.runAllChecks();
}

if (require.main === module) {
  main().catch(console.error);
}

export { SystemChecker };
