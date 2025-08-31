# Multi-stage build для производства
FROM node:18-bullseye-slim AS base
WORKDIR /app

# Установка зависимостей
FROM base AS deps
COPY package*.json ./
COPY prisma ./prisma/
# Устанавливаем и prod, и dev зависимости, чтобы была доступна Prisma CLI в рантайме
RUN npm ci --silent --ignore-scripts
RUN npx prisma generate

# Сборка приложения
FROM base AS build
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --silent --ignore-scripts
COPY . .
RUN npx prisma generate
RUN npm run build

# Производственный образ
FROM node:18-bullseye-slim AS production
WORKDIR /app

# Установка необходимых утилит и OpenSSL
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
     ca-certificates \
     curl \
     openssl \
     postgresql-client \
  && rm -rf /var/lib/apt/lists/*

# Создание пользователя для безопасности
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Копирование файлов
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma/


# Права доступа
RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3000

ENV NODE_ENV=production

# Healthcheck через docker-compose (см. docker-compose.yml)

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]