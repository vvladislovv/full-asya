const express = require('express');
const app = express();

app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Mock startTest endpoint
app.post('/api/tests/start', (req, res) => {
  const { testId } = req.body;
  
  console.log('Received startTest request with testId:', testId);
  
  // Возвращаем моковый результат
  const result = {
    id: `result-${Date.now()}`,
    userId: 'test-user-id',
    testId: testId,
    testType: 'VISUAL_MEMORY',
    score: 0,
    maxScore: 100,
    percentage: null,
    resultLevel: null,
    details: {
      startedAt: new Date().toISOString(),
      testConfig: { questionCount: 10, timeLimit: 300 }
    },
    emotionalState: null,
    notes: null,
    isCompleted: false,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  console.log('Returning result:', result);
  res.json(result);
});

// Mock submitTestResult endpoint
app.post('/api/tests/submit', (req, res) => {
  const { resultId, answers, timeSpent, maxScore } = req.body;
  
  console.log('Received submitTestResult request:', { resultId, answers, timeSpent, maxScore });
  
  // Простой расчет score
  let score = 0;
  if (answers && typeof answers === 'object') {
    if (answers.correct && answers.total) {
      score = Math.round((answers.correct / answers.total) * 100);
    }
  }
  
  const percentage = maxScore ? (score / maxScore) * 100 : score;
  let resultLevel = 'medium';
  if (percentage >= 80) resultLevel = 'high';
  else if (percentage < 60) resultLevel = 'low';
  
  const result = {
    id: resultId,
    userId: 'test-user-id',
    testId: 'fallback-test',
    testType: 'VISUAL_MEMORY',
    score,
    maxScore: maxScore || 100,
    percentage,
    resultLevel,
    details: {
      answers,
      timeSpent,
      completedAt: new Date().toISOString()
    },
    emotionalState: req.body.emotionalState || null,
    notes: null,
    isCompleted: true,
    completedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  console.log('Returning result:', result);
  res.json(result);
});

// Mock auth endpoints
app.get('/api/auth/profile', (req, res) => {
  console.log('Received profile request');
  
  // Возвращаем тестового пользователя
  const user = {
    id: 'test-user-id',
    telegramId: '123456789',
    username: 'testuser',
    firstName: 'Тестовый',
    lastName: 'Пользователь',
    language: 'ru',
    dementiaRiskLevel: null,
    hasCompletedDiagnostic: false,
    isActive: true,
    isAdmin: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  console.log('Returning user:', user);
  res.json(user);
});

app.post('/api/auth/login', (req, res) => {
  const { telegramId } = req.body;
  console.log('Received login request with telegramId:', telegramId);
  
  // Возвращаем успешный логин
  const result = {
    access_token: 'mock-jwt-token-' + Date.now(),
    user: {
      id: 'test-user-id',
      telegramId: telegramId || '123456789',
      username: 'testuser',
      firstName: 'Тестовый',
      lastName: 'Пользователь',
      language: 'ru',
      dementiaRiskLevel: null,
      hasCompletedDiagnostic: false,
      isActive: true,
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  };
  
  console.log('Returning login result:', result);
  res.json(result);
});

// Mock history endpoint
app.get('/api/history', (req, res) => {
  console.log('Received history request');
  
  // Возвращаем массив тестовой истории
  const historyArray = [
    {
      id: 'hist-1',
      testType: 'VISUAL_MEMORY',
      score: 85,
      maxScore: 100,
      percentage: 85,
      isCompleted: true,
      completedAt: new Date(Date.now() - 86400000).toISOString(),
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      test: {
        name: 'Тест визуальной памяти',
        type: 'VISUAL_MEMORY',
        maxScore: 100
      }
    },
    {
      id: 'hist-2', 
      testType: 'VERBAL_MEMORY',
      score: 72,
      maxScore: 100,
      percentage: 72,
      isCompleted: true,
      completedAt: new Date(Date.now() - 172800000).toISOString(),
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      test: {
        name: 'Тест вербальной памяти',
        type: 'VERBAL_MEMORY', 
        maxScore: 100
      }
    },
    {
      id: 'hist-3',
      testType: 'STROOP_TEST',
      score: 90,
      maxScore: 100,
      percentage: 90,
      isCompleted: true,
      completedAt: new Date(Date.now() - 259200000).toISOString(),
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      test: {
        name: 'Тест Струпа',
        type: 'STROOP_TEST',
        maxScore: 100
      }
    }
  ];
  
  console.log('Returning history array:', historyArray);
  res.json(historyArray);
});

// Mock tests endpoint
app.get('/api/tests', (req, res) => {
  console.log('Received tests request');
  
  const tests = [
    {
      id: 'test-1',
      name: 'Тест визуальной памяти',
      description: 'Оценка способности запоминать и воспроизводить визуальную информацию',
      type: 'VISUAL_MEMORY',
      duration: 300,
      questionCount: 10,
      isActive: true
    },
    {
      id: 'test-2', 
      name: 'Тест вербальной памяти',
      description: 'Оценка способности запоминать слова и текст',
      type: 'VERBAL_MEMORY',
      duration: 240,
      questionCount: 15,
      isActive: true
    },
    {
      id: 'test-3',
      name: 'Тест Струпа',
      description: 'Оценка когнитивной гибкости и контроля внимания',
      type: 'STROOP_TEST', 
      duration: 180,
      questionCount: 20,
      isActive: true
    }
  ];
  
  console.log('Returning tests:', tests);
  res.json(tests);
});

// Health check endpoint
app.get('/api', (req, res) => {
  res.json({ message: 'Test server is running', status: 'ok' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Test server running on http://localhost:${port}`);
  console.log(`📋 Endpoints available:`);
  console.log(`  GET  /api/auth/profile - Get user profile`);
  console.log(`  POST /api/auth/login - Login user`);
  console.log(`  GET  /api/history - Get user history`);
  console.log(`  GET  /api/tests - Get available tests`);
  console.log(`  POST /api/tests/start - Start a test`);
  console.log(`  POST /api/tests/submit - Submit test result`);
  console.log(`  GET  /api - Health check`);
});
