#!/bin/bash

# Скрипт для инициализации базы данных

set -e

echo "🗄️  Инициализация базы данных AI Chat App"
echo "=========================================="
echo ""

# Проверка, что контейнеры запущены
if ! docker compose ps postgres | grep -q "Up"; then
    echo "❌ Контейнер PostgreSQL не запущен"
    echo "Запустите: docker compose up -d"
    exit 1
fi

echo "✅ PostgreSQL контейнер запущен"
echo ""

# Проверка существования таблиц
echo "🔍 Проверка существующих таблиц..."
TABLES=$(docker compose exec -T postgres psql -U postgres -d ai_chat_app -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null || echo "0")

if [ "$TABLES" -gt "0" ]; then
    echo "⚠️  База данных уже содержит таблицы ($TABLES таблиц)"
    read -p "Пересоздать базу данных? Это удалит все данные! (yes/no): " CONFIRM
    
    if [ "$CONFIRM" != "yes" ]; then
        echo "Отменено"
        exit 0
    fi
    
    echo "🗑️  Удаление существующих таблиц..."
    docker compose exec -T postgres psql -U postgres -d ai_chat_app -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
fi

echo ""
echo "📝 Применение миграций через Prisma..."

# Попытка применить миграции через Prisma
if docker compose exec -T backend npx prisma migrate deploy 2>/dev/null; then
    echo "✅ Миграции Prisma применены успешно"
else
    echo "⚠️  Миграции Prisma не найдены, применяем SQL скрипт..."
    
    # Применение SQL скрипта напрямую
    docker compose exec -T postgres psql -U postgres -d ai_chat_app < backend/init-db.sql
    
    if [ $? -eq 0 ]; then
        echo "✅ SQL скрипт применен успешно"
    else
        echo "❌ Ошибка при применении SQL скрипта"
        exit 1
    fi
fi

echo ""
echo "🔍 Проверка созданных таблиц..."
docker compose exec -T postgres psql -U postgres -d ai_chat_app -c "\dt"

echo ""
echo "✅ База данных успешно инициализирована!"
echo ""
echo "📊 Статистика:"
docker compose exec -T postgres psql -U postgres -d ai_chat_app -c "
SELECT 
    'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'chats', COUNT(*) FROM chats
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'files', COUNT(*) FROM files;
"

echo ""
echo "🎉 Готово! Теперь можно регистрироваться на http://localhost:1499"
