FROM node:20-alpine AS builder

WORKDIR /app

# Установка OpenSSL для Prisma
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine

WORKDIR /app

# Установка OpenSSL в production образе
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install --production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma

EXPOSE 3001

CMD ["npm", "start"]
