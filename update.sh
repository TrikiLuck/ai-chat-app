#!/bin/bash

# Скрипт для обновления приложения

set -e

echo "🔄 Обновление AI Chat App"
echo "========================="
echo ""

# Проверяем, что мы в git репозитории
if [ ! -d .git ]; then
    echo "❌ Это не git репозиторий"
    exit 1
fi

# Сохраняем текущую версию
CURRENT_COMMIT=$(git rev-parse --short HEAD)
echo "📌 Текущая версия: $CURRENT_COMMIT"
echo ""

# Создаем бэкап перед обновлением
echo "💾 Создание резервной копии..."
./backup.sh
echo ""

# Получаем обновления
echo "📥 Получение обновлений из GitHub..."
git fetch origin
echo ""

# Показываем изменения
echo "📝 Новые изменения:"
git log --oneline HEAD..origin/main | head -10
echo ""

read -p "Продолжить обновление? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Отменено"
    exit 0
fi

# Применяем обновления
echo "⬇️  Применение обновлений..."
git pull origin main
echo ""

# Пересобираем и перезапускаем
echo "🔨 Пересборка контейнеров..."
docker compose down
docker compose build --no-cache
docker compose up -d
echo ""

# Ждем запуска
echo "⏳ Ожидание запуска сервисов..."
sleep 10

# Выполняем миграции
echo "🗄️  Применение миграций базы данных..."
docker compose exec -T backend npx prisma migrate deploy
echo ""

# Проверяем статус
echo "📊 Статус сервисов:"
docker compose ps
echo ""

NEW_COMMIT=$(git rev-parse --short HEAD)
echo "✅ Обновление завершено!"
echo "📌 Новая версия: $NEW_COMMIT"
echo ""
echo "🌐 Приложение доступно по адресу: http://localhost:8080"
