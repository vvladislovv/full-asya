import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Создаем чистый профиль пользователя с тестами...');

  // Очистка существующих данных - удаляем ВСЕ связанные с историей таблицы
  await prisma.practiceProgress.deleteMany();
  await prisma.testResult.deleteMany();
  await prisma.consultation.deleteMany();
  await prisma.practice.deleteMany();
  await prisma.test.deleteMany();
  await prisma.userStats.deleteMany();
  await prisma.testSession.deleteMany();
  await prisma.user.deleteMany();
  await prisma.systemSettings.deleteMany();
  await prisma.dementiaScreening.deleteMany();
  await prisma.emotionalAssessment.deleteMany();
  await prisma.questionnaireResult.deleteMany();
  await prisma.questionnaire.deleteMany();
  await prisma.testStage.deleteMany();

  console.log('🗑️  Очищены все существующие данные');

  // Создаем только одного пользователя с минимальными данными
  const user = await prisma.user.create({
      data: {
        telegramId: '123456789',
        username: 'test_user1',
        firstName: 'Test',
        lastName: 'User',
        language: 'en',
        dementiaRiskLevel: 'low',
      hasCompletedDiagnostic: false,
      isActive: true
    }
  });

  console.log(`✅ Создан пользователь: ${user.username} с ID: ${user.id}`);

  // Создаем тесты (они нужны для работы системы, но без результатов)
  const tests = await Promise.all([
    prisma.test.create({
      data: {
        type: 'VISUAL_MEMORY',
        name: 'Визуальная память',
        description: 'Тест для оценки способности запоминать и воспроизводить визуальную информацию',
        instruction: 'Вам будут показаны изображения. Запомните их и выберите правильные ответы.',
        difficulty: 'medium',
        orderIndex: 1,
        configuration: {
          questionCount: 10,
          timeLimit: 300,
          scoringMethod: 'accuracy'
        }
      }
    }),
    prisma.test.create({
      data: {
        type: 'VERBAL_MEMORY',
        name: 'Вербальная память',
        description: 'Тест для оценки способности запоминать и воспроизводить словесную информацию',
        instruction: 'Вам будет представлен список слов. Запомните их и воспроизведите.',
        difficulty: 'easy',
        orderIndex: 2,
        configuration: {
          questionCount: 8,
          timeLimit: 240,
          scoringMethod: 'recall'
        }
      }
    }),
    prisma.test.create({
      data: {
        type: 'AUDITORY_MEMORY',
        name: 'Рече-слуховая память',
        description: 'Тест для оценки способности запоминать и воспроизводить слуховую информацию',
        instruction: 'Вам будут озвучены последовательности цифр и слов. Повторите их.',
        difficulty: 'medium',
        orderIndex: 3,
        configuration: {
          questionCount: 6,
          timeLimit: 180,
          scoringMethod: 'sequence'
        }
      }
    }),
    prisma.test.create({
      data: {
        type: 'DIGIT_SPAN',
        name: 'Объём цифр',
        description: 'Тест для оценки объема кратковременной памяти для цифровой информации',
        instruction: 'Вам будут показаны последовательности цифр. Повторите их в правильном порядке.',
        difficulty: 'hard',
        orderIndex: 4,
        configuration: {
          questionCount: 5,
          timeLimit: 150,
          scoringMethod: 'adaptive',
          startLength: 3,
          maxLength: 9
        }
      }
    }),
    prisma.test.create({
      data: {
        type: 'VISUAL_ATTENTION',
        name: 'Зрительная память и внимание',
        description: 'Тест для оценки способности концентрировать внимание на зрительных стимулах',
        instruction: 'Найдите и отметьте целевые объекты среди отвлекающих элементов.',
        difficulty: 'medium',
        orderIndex: 5,
        configuration: {
          questionCount: 12,
          timeLimit: 360,
          scoringMethod: 'speed_accuracy'
        }
      }
    }),
    prisma.test.create({
      data: {
        type: 'STROOP_TEST',
        name: 'Тест Струпа',
        description: 'Тест для оценки способности к когнитивному контролю и торможению автоматических реакций',
        instruction: 'Назовите цвет текста, а не то, что написано.',
        difficulty: 'hard',
        orderIndex: 6,
        configuration: {
          questionCount: 20,
          timeLimit: 120,
          scoringMethod: 'interference'
        }
      }
    }),
    prisma.test.create({
      data: {
        type: 'ARITHMETIC',
        name: 'Счётные операции',
        description: 'Тест для оценки способности к математическим вычислениям в уме',
        instruction: 'Решите математические задачи в уме.',
        difficulty: 'medium',
        orderIndex: 7,
        configuration: {
          questionCount: 15,
          timeLimit: 300,
          scoringMethod: 'accuracy_speed'
        }
      }
    }),
    prisma.test.create({
      data: {
        type: 'SYMBOL_MEMORY',
        name: 'Символьная память',
        description: 'Тест для оценки способности запоминать соответствия между символами и значениями',
        instruction: 'Запомните соответствие символов и цифр, затем преобразуйте символы в цифры.',
        difficulty: 'hard',
        orderIndex: 8,
        configuration: {
          questionCount: 8,
          timeLimit: 240,
          scoringMethod: 'coding'
        }
      }
    })
  ]);

  console.log(`✅ Создано ${tests.length} тестов для системы`);

  // Создаем базовые системные настройки
  await prisma.systemSettings.create({
      data: {
        key: 'test_settings',
        value: {
          defaultTimeLimit: 300,
          maxRetries: 3,
          passScore: 60
        }
      }
  });

  console.log('✅ Созданы базовые системные настройки');

  console.log('\n🎉 Профиль пользователя полностью очищен!');
  console.log('\n📊 Статистика:');
  console.log(`👥 Пользователей: 1 (ID: ${user.id})`);
  console.log(`🧠 Тестов: ${tests.length} (только для системы)`);
  console.log(`📋 Результатов тестов: 0 (история пуста)`);
  console.log(`💪 Практик: 0`);
  console.log(`📅 Консультаций: 0`);
  console.log(`🔍 Диагностика: не пройдена`);
  console.log(`\n🔑 Telegram ID: ${user.telegramId}`);
  console.log(`🆔 User ID: ${user.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при создании профиля:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });