#!/bin/bash

# AI Chat App - Скрипт быстрого деплоя
# Использование: ./deploy.sh

set -e

echo "🚀 AI Chat App - Деплой на хоумлабу"
echo "===================================="
echo ""

# Проверка Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Установите Docker и попробуйте снова."
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose не установлен. Установите Docker Compose и попробуйте снова."
    exit 1
fi

echo "✅ Docker и Docker Compose установлены"
echo ""

# Проверка .env файла
if [ ! -f .env ]; then
    echo "⚠️  Файл .env не найден. Создаю из .env.example..."
    cp .env.example .env
    echo ""
    echo "📝 ВАЖНО: Отредактируйте файл .env и добавьте ваши настройки:"
    echo "   - JWT_SECRET (сгенерируйте: openssl rand -base64 32)"
    echo "   - OMNIROUTE_API_KEY"
    echo "   - POSTGRES_PASSWORD (для production)"
    echo ""
    read -p "Нажмите Enter после редактирования .env файла..."
fi

echo "✅ Файл .env найден"
echo ""

# Проверка переменных окружения
source .env

if [ -z "$OMNIROUTE_API_KEY" ] || [ "$OMNIROUTE_API_KEY" = "your-omniroute-api-key" ]; then
    echo "❌ OMNIROUTE_API_KEY не настроен в .env файле"
    exit 1
fi

if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "your-secret-key-change-this-in-production" ]; then
    echo "⚠️  JWT_SECRET использует значение по умолчанию. Рекомендуется изменить!"
    read -p "Продолжить? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ Переменные окружения настроены"
echo ""

# Остановка старых контейнеров
echo "🛑 Остановка старых контейнеров..."
docker compose down 2>/dev/null || true
echo ""

# Сборка образов
echo "🔨 Сборка Docker образов..."
docker compose build --no-cache
echo ""

# Запуск контейнеров
echo "▶️  Запуск контейнеров..."
docker compose up -d
echo ""

# Ожидание запуска PostgreSQL
echo "⏳ Ожидание запуска PostgreSQL..."
sleep 10

# Проверка статуса
echo "📊 Проверка статуса контейнеров..."
docker compose ps
echo ""

# Выполнение миграций
echo "🗄️  Выполнение миграций базы данных..."
docker compose exec -T backend npx prisma migrate deploy || {
    echo "⚠️  Миграции не выполнены. Попробуйте выполнить вручную:"
    echo "   docker compose exec backend npx prisma migrate deploy"
}
echo ""

# Проверка здоровья
echo "🏥 Проверка здоровья сервисов..."
sleep 5

BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health || echo "000")
if [ "$BACKEND_HEALTH" = "200" ]; then
    echo "✅ Backend работает (http://localhost:3001)"
else
    echo "⚠️  Backend не отвечает. Проверьте логи: docker compose logs backend"
fi

FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:1499 || echo "000")
if [ "$FRONTEND_HEALTH" = "200" ]; then
    echo "✅ Frontend работает (http://localhost:1499)"
else
    echo "⚠️  Frontend не отвечает. Проверьте логи: docker compose logs frontend"
fi

echo ""
echo "===================================="
echo "✨ Деплой завершен!"
echo ""
echo "📱 Приложение доступно по адресу:"
echo "   http://localhost:1499"
echo "   или"
echo "   http://$(hostname -I | awk '{print $1}'):1499"
echo ""
echo "📝 Полезные команды:"
echo "   docker compose logs -f          # Просмотр логов"
echo "   docker compose ps               # Статус контейнеров"
echo "   docker compose restart          # Перезапуск"
echo "   docker compose down             # Остановка"
echo ""
echo "📚 Подробная документация: HOMELAB_DEPLOY.md"
echo "===================================="
