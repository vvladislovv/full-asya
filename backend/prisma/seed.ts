import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...');

  // Очистка существующих данных
  await prisma.practiceProgress.deleteMany();
  await prisma.testResult.deleteMany();
  await prisma.consultation.deleteMany();
  await prisma.practice.deleteMany();
  await prisma.test.deleteMany();
  await prisma.userStats.deleteMany();
  await prisma.testSession.deleteMany();
  await prisma.user.deleteMany();
  await prisma.systemSettings.deleteMany();

  console.log('🗑️  Очищены существующие данные');

  // Создание тестовых пользователей
  const users = await Promise.all([
    prisma.user.create({
      data: {
        telegramId: '123456789',
        username: 'test_user1',
        firstName: 'Иван',
        lastName: 'Петров',
        language: 'ru',
        dementiaRiskLevel: 'low',
        hasCompletedDiagnostic: true,
        dementiaQuestionnaire: {
          score: 5,
          answers: {
            memory: 'good',
            concentration: 'excellent',
            sleep: 'normal'
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        telegramId: '987654321',
        username: 'test_user2',
        firstName: 'Мария',
        lastName: 'Иванова',
        language: 'ru',
        dementiaRiskLevel: 'medium',
        hasCompletedDiagnostic: true,
        dementiaQuestionnaire: {
          score: 12,
          answers: {
            memory: 'sometimes_problems',
            concentration: 'good',
            sleep: 'poor'
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        telegramId: '555666777',
        username: 'john_doe',
        firstName: 'John',
        lastName: 'Doe',
        language: 'en',
        dementiaRiskLevel: 'low',
        hasCompletedDiagnostic: false
      }
    })
  ]);

  console.log(`✅ Создано ${users.length} пользователей`);

  // Создание тестов
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

  console.log(`✅ Создано ${tests.length} тестов`);

  // Создание тестовых результатов
  const testResults = [];
  for (const user of users.slice(0, 2)) { // Только для первых двух пользователей
    for (let i = 0; i < 3; i++) { // По 3 результата для каждого
      const test = tests[i];
      const score = Math.floor(Math.random() * 80) + 20; // Оценка от 20 до 100
      const percentage = score;
      
      let resultLevel: 'high' | 'medium' | 'low' = 'medium';
      if (percentage >= 80) resultLevel = 'high';
      else if (percentage < 60) resultLevel = 'low';

      const result = await prisma.testResult.create({
        data: {
          userId: user.id,
          testId: test.id,
          testType: test.type,
          score: score,
          maxScore: 100,
          percentage: percentage,
          resultLevel: resultLevel,
          isCompleted: true,
          completedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Последние 7 дней
          details: {
            answers: Array.from({ length: 5 }, (_, i) => ({
              questionId: `q_${i + 1}`,
              answer: `answer_${i + 1}`,
              correct: Math.random() > 0.3,
              timeSpent: Math.floor(Math.random() * 30) + 10
            }))
          },
          emotionalState: {
            mood: ['excellent', 'good', 'neutral'][Math.floor(Math.random() * 3)],
            energy: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
            stress: ['none', 'low', 'medium'][Math.floor(Math.random() * 3)],
            focus: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)],
            motivation: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)]
          }
        }
      });
      testResults.push(result);
    }
  }

  console.log(`✅ Создано ${testResults.length} результатов тестов`);

  // Создание практик
  const practices = await Promise.all([
    prisma.practice.create({
      data: {
        name: 'Тренировка памяти',
        description: 'Упражнения для улучшения кратковременной и долговременной памяти',
        category: 'memory',
        difficulty: 'easy',
        orderIndex: 1,
        exercises: [
          {
            id: 'memory_1',
            name: 'Запоминание последовательностей',
            description: 'Запомните последовательность из 5-7 элементов',
            type: 'sequence',
            difficulty: 'easy'
          },
          {
            id: 'memory_2',
            name: 'Ассоциативная память',
            description: 'Создайте ассоциации между парами слов',
            type: 'association',
            difficulty: 'medium'
          }
        ]
      }
    }),
    prisma.practice.create({
      data: {
        name: 'Развитие внимания',
        description: 'Упражнения для концентрации и распределения внимания',
        category: 'attention',
        difficulty: 'medium',
        orderIndex: 2,
        exercises: [
          {
            id: 'attention_1',
            name: 'Поиск различий',
            description: 'Найдите отличия между двумя изображениями',
            type: 'visual_search',
            difficulty: 'easy'
          },
          {
            id: 'attention_2',
            name: 'Многозадачность',
            description: 'Выполните несколько задач одновременно',
            type: 'multitask',
            difficulty: 'hard'
          }
        ]
      }
    }),
    prisma.practice.create({
      data: {
        name: 'Логическое мышление',
        description: 'Упражнения для развития логики и аналитического мышления',
        category: 'logic',
        difficulty: 'hard',
        orderIndex: 3,
        exercises: [
          {
            id: 'logic_1',
            name: 'Логические последовательности',
            description: 'Найдите закономерность в последовательности',
            type: 'pattern',
            difficulty: 'medium'
          },
          {
            id: 'logic_2',
            name: 'Решение задач',
            description: 'Решите логические задачи разной сложности',
            type: 'problem_solving',
            difficulty: 'hard'
          }
        ]
      }
    })
  ]);

  console.log(`✅ Создано ${practices.length} практик`);

  // Создание прогресса практик
  for (const user of users.slice(0, 2)) {
    for (const practice of practices.slice(0, 2)) {
      const exercises = practice.exercises as any[];
      for (const exercise of exercises) {
        await prisma.practiceProgress.create({
          data: {
            userId: user.id,
            practiceId: practice.id,
            exerciseId: exercise.id,
            score: Math.floor(Math.random() * 90) + 10,
            completed: Math.random() > 0.3,
            timeSpent: Math.floor(Math.random() * 300) + 60,
            completedAt: Math.random() > 0.3 ? new Date() : null
          }
        });
      }
    }
  }

  console.log('✅ Создан прогресс практик');

  // Создание консультаций
  const consultations = await Promise.all([
    prisma.consultation.create({
      data: {
        userId: users[0].id,
        type: 'online',
        status: 'confirmed',
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Через 2 дня
        notes: 'Обсуждение результатов тестирования',
        meetingLink: 'https://meet.google.com/abc-defg-hij'
      }
    }),
    prisma.consultation.create({
      data: {
        userId: users[1].id,
        type: 'offline',
        status: 'pending',
        scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Через 5 дней
        notes: 'Первичная консультация',
        location: 'Клиника на Пушкинской 15'
      }
    })
  ]);

  console.log(`✅ Создано ${consultations.length} консультаций`);

  // Создание статистики пользователей
  for (const user of users) {
    const userTestResults = await prisma.testResult.findMany({
      where: { userId: user.id, isCompleted: true }
    });

    if (userTestResults.length > 0) {
      const totalScore = userTestResults.reduce((sum, result) => sum + result.score, 0);
      const averageScore = totalScore / userTestResults.length;
      const bestScore = Math.max(...userTestResults.map(r => r.score));
      const totalTimeSpent = userTestResults.length * 300; // Примерное время

      await prisma.userStats.create({
        data: {
          userId: user.id,
          totalTestsCompleted: userTestResults.length,
          averageScore: averageScore,
          bestScore: bestScore,
          totalTimeSpent: totalTimeSpent,
          streakDays: Math.floor(Math.random() * 10) + 1,
          lastActivityDate: new Date()
        }
      });
    }
  }

  console.log('✅ Создана статистика пользователей');

  // Создание системных настроек
  await Promise.all([
    prisma.systemSettings.create({
      data: {
        key: 'maintenance_mode',
        value: { enabled: false, message: 'Система в обслуживании' }
      }
    }),
    prisma.systemSettings.create({
      data: {
        key: 'test_settings',
        value: {
          defaultTimeLimit: 300,
          maxRetries: 3,
          passScore: 60
        }
      }
    }),
    prisma.systemSettings.create({
      data: {
        key: 'notification_settings',
        value: {
          enableEmailNotifications: true,
          enablePushNotifications: true,
          reminderIntervalDays: 7
        }
      }
    })
  ]);

  console.log('✅ Созданы системные настройки');

  console.log('\n🎉 База данных успешно заполнена тестовыми данными!');
  console.log('\n📊 Статистика:');
  console.log(`👥 Пользователей: ${users.length}`);
  console.log(`🧠 Тестов: ${tests.length}`);
  console.log(`📋 Результатов тестов: ${testResults.length}`);
  console.log(`💪 Практик: ${practices.length}`);
  console.log(`📅 Консультаций: ${consultations.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении базы данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });