import { z } from 'zod';

// Базовые схемы
export const TelegramIdSchema = z.string().min(1, 'Telegram ID обязателен').max(50, 'Telegram ID слишком длинный');
export const UuidSchema = z.string().uuid('Неверный формат UUID');
export const EmailSchema = z.string().email('Неверный формат email');
export const PasswordSchema = z.string().min(6, 'Пароль должен содержать минимум 6 символов').max(100, 'Пароль слишком длинный');

// Enums
export const LanguageSchema = z.enum(['ru', 'en'], {
  errorMap: () => ({ message: 'Язык должен быть ru или en' })
});

export const DementiaRiskLevelSchema = z.enum(['low', 'medium', 'high'], {
  errorMap: () => ({ message: 'Уровень риска должен быть low, medium или high' })
});

export const TestTypeSchema = z.enum([
  'VISUAL_MEMORY',
  'VERBAL_MEMORY', 
  'AUDITORY_MEMORY',
  'DIGIT_SPAN',
  'VISUAL_ATTENTION',
  'STROOP_TEST',
  'ARITHMETIC',
  'SYMBOL_MEMORY'
], {
  errorMap: () => ({ message: 'Неверный тип теста' })
});

export const TestDifficultySchema = z.enum(['easy', 'medium', 'hard'], {
  errorMap: () => ({ message: 'Сложность должна быть easy, medium или hard' })
});

export const TestResultLevelSchema = z.enum(['high', 'medium', 'low'], {
  errorMap: () => ({ message: 'Уровень результата должен быть high, medium или low' })
});

export const ConsultationTypeSchema = z.enum(['online', 'offline'], {
  errorMap: () => ({ message: 'Тип консультации должен быть online или offline' })
});

export const ConsultationStatusSchema = z.enum(['pending', 'confirmed', 'cancelled', 'completed'], {
  errorMap: () => ({ message: 'Статус консультации неверен' })
});

// Пользователь
export const CreateUserSchema = z.object({
  telegramId: TelegramIdSchema,
  username: z.string().min(1).max(100).optional(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  language: LanguageSchema.default('ru'),
});

export const UpdateUserSchema = z.object({
  username: z.string().min(1).max(100).optional(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  language: LanguageSchema.optional(),
  dementiaRiskLevel: DementiaRiskLevelSchema.optional(),
  hasCompletedDiagnostic: z.boolean().optional(),
});

export const UpdateLanguageSchema = z.object({
  language: LanguageSchema
});

export const UpdateDementiaRiskSchema = z.object({
  dementiaRiskLevel: DementiaRiskLevelSchema,
  dementiaQuestionnaire: z.record(z.any()).optional()
});

// Тесты
export const CreateTestSchema = z.object({
  type: TestTypeSchema,
  name: z.string().min(1, 'Название теста обязательно').max(200),
  description: z.string().min(1, 'Описание теста обязательно').max(1000),
  instruction: z.string().min(1, 'Инструкция обязательна').max(2000),
  difficulty: TestDifficultySchema.default('medium'),
  configuration: z.record(z.any()).optional(),
  orderIndex: z.number().int().min(0).default(0)
});

export const UpdateTestSchema = CreateTestSchema.partial();

export const StartTestSchema = z.object({
  testId: UuidSchema
});

export const SubmitTestResultSchema = z.object({
  resultId: UuidSchema,
  answers: z.record(z.any()),
  emotionalState: z.record(z.any()).optional(),
  timeSpent: z.number().int().min(0).optional(),
  maxScore: z.number().int().min(0).optional()
});

// История
export const GetHistorySchema = z.object({
  testType: TestTypeSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0)
});

export const GetHistoryStatsSchema = z.object({
  testType: TestTypeSchema.optional(),
  period: z.enum(['week', 'month', 'year', 'all']).default('month')
});

// Консультации
export const CreateConsultationSchema = z.object({
  type: ConsultationTypeSchema,
  scheduledAt: z.string().datetime(),
  notes: z.string().max(1000).optional(),
  location: z.string().max(200).optional()
});

export const UpdateConsultationSchema = z.object({
  type: ConsultationTypeSchema.optional(),
  status: ConsultationStatusSchema.optional(),
  scheduledAt: z.string().datetime().optional(),
  notes: z.string().max(1000).optional(),
  doctorNotes: z.string().max(1000).optional(),
  meetingLink: z.string().url().optional(),
  location: z.string().max(200).optional()
});

// Аутентификация
export const LoginSchema = z.object({
  telegramId: TelegramIdSchema
});

export const TelegramAuthSchema = z.object({
  id: z.number().int().positive(),
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  username: z.string().min(1).max(100).optional(),
  photo_url: z.string().url().optional(),
  auth_date: z.number().int().positive(),
  hash: z.string().min(1)
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token обязателен')
});

// Эмоциональное состояние
export const EmotionalStateAnswersSchema = z.object({
  mood: z.enum(['excellent', 'good', 'neutral', 'bad', 'terrible']),
  energy: z.enum(['high', 'medium', 'low']),
  stress: z.enum(['none', 'low', 'medium', 'high']),
  focus: z.enum(['excellent', 'good', 'fair', 'poor']),
  motivation: z.enum(['high', 'medium', 'low', 'none'])
});

// Практики
export const CompleteExerciseSchema = z.object({
  score: z.number().int().min(0).max(100),
  timeSpent: z.number().int().min(0),
  answers: z.record(z.any()).optional()
});

// Валидация пагинации
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Валидация поиска
export const SearchSchema = z.object({
  query: z.string().min(1).max(100),
  filters: z.record(z.any()).optional()
});

// Системные настройки
export const SystemSettingsSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.record(z.any())
});

// Экспорт типов для TypeScript
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type UpdateLanguageDto = z.infer<typeof UpdateLanguageSchema>;
export type UpdateDementiaRiskDto = z.infer<typeof UpdateDementiaRiskSchema>;
export type CreateTestDto = z.infer<typeof CreateTestSchema>;
export type UpdateTestDto = z.infer<typeof UpdateTestSchema>;
export type StartTestDto = z.infer<typeof StartTestSchema>;
export type SubmitTestResultDto = z.infer<typeof SubmitTestResultSchema>;
export type GetHistoryDto = z.infer<typeof GetHistorySchema>;
export type GetHistoryStatsDto = z.infer<typeof GetHistoryStatsSchema>;
export type CreateConsultationDto = z.infer<typeof CreateConsultationSchema>;
export type UpdateConsultationDto = z.infer<typeof UpdateConsultationSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
export type TelegramAuthDto = z.infer<typeof TelegramAuthSchema>;
export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;
export type EmotionalStateAnswersDto = z.infer<typeof EmotionalStateAnswersSchema>;
export type CompleteExerciseDto = z.infer<typeof CompleteExerciseSchema>;
export type PaginationDto = z.infer<typeof PaginationSchema>;
export type SearchDto = z.infer<typeof SearchSchema>;
export type SystemSettingsDto = z.infer<typeof SystemSettingsSchema>;