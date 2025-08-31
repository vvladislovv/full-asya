FROM node:20-alpine as builder
WORKDIR /app
COPY . .
RUN npm install --frozen-lockfile
RUN npm run build

FROM node:20-alpine as runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app ./
EXPOSE 4200
CMD ["npm", "start"]